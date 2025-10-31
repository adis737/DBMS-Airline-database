const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const Passenger = require('../models/Passenger');

async function createBooking(req, res, next) {
	const session = await Booking.startSession();
	session.startTransaction();
	try {
		const { flight: flightId, seatClass } = req.body;
		const flight = await Flight.findById(flightId).session(session);
		if (!flight) return res.status(404).json({ error: 'Flight not found' });
		const classInfo = flight.seatClasses.find(c => c.class === seatClass);
		if (!classInfo || classInfo.availableSeats <= 0) {
			await session.abortTransaction();
			return res.status(400).json({ error: 'No seats available in selected class' });
		}
		classInfo.availableSeats -= 1;
		await flight.save({ session });
		const booking = await Booking.create([{ ...req.body }], { session });
		await session.commitTransaction();
		res.status(201).json(booking[0]);
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		session.endSession();
	}
}

async function getBookings(req, res, next) {
	try {
		const user = req.user;
		let bookings;
		
		// If user is STAFF or ADMIN, show all bookings
		if (user.roles && (user.roles.includes('STAFF') || user.roles.includes('ADMIN'))) {
			bookings = await Booking.find().sort({ createdAt: -1 });
		} else {
			// For regular USER, show only their own bookings
			// Find passenger by user's email
			const userDoc = await User.findById(user.sub);
			if (!userDoc) return res.status(404).json({ error: 'User not found' });
			
			const passenger = await Passenger.findOne({ email: userDoc.email });
			if (!passenger) {
				// No passenger yet, return empty array
				return res.json([]);
			}
			
			// Filter bookings by passenger ID
			bookings = await Booking.find({ passenger: passenger._id }).sort({ createdAt: -1 });
		}
		
		res.json(bookings);
	} catch (err) { next(err); }
}

async function getBookingById(req, res, next) {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ error: 'Booking not found' });
		res.json(booking);
	} catch (err) { next(err); }
}

async function updateBooking(req, res, next) {
	try {
		const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!booking) return res.status(404).json({ error: 'Booking not found' });
		res.json(booking);
	} catch (err) { next(err); }
}

async function cancelBooking(req, res, next) {
	const session = await Booking.startSession();
	session.startTransaction();
	try {
		const booking = await Booking.findById(req.params.id).session(session);
		if (!booking) { await session.abortTransaction(); return res.status(404).json({ error: 'Booking not found' }); }
		if (booking.status === 'CANCELLED') { await session.abortTransaction(); return res.json(booking); }
		booking.status = 'CANCELLED';
		if (booking.payment && booking.payment.status === 'PAID') {
			booking.payment.status = 'REFUNDED';
		}
		await booking.save({ session });
		// Return seat to availability
		const flight = await Flight.findById(booking.flight).session(session);
		const classInfo = flight.seatClasses.find(c => c.class === booking.seatClass);
		if (classInfo) { classInfo.availableSeats += 1; await flight.save({ session }); }
		await session.commitTransaction();
		res.json(booking);
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally { session.endSession(); }
}

module.exports = { createBooking, getBookings, getBookingById, updateBooking, cancelBooking };
