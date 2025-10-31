const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

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
		const bookings = await Booking.find().sort({ createdAt: -1 });
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
