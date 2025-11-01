const CheckIn = require('../models/CheckIn');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Notification = require('../models/Notification');
const Passenger = require('../models/Passenger');
const User = require('../models/User');
const dayjs = require('dayjs');

async function createCheckIn(req, res, next) {
	try {
		const { bookingId } = req.body;
		const booking = await Booking.findById(bookingId).populate('flight');
		if (!booking) return res.status(404).json({ error: 'Booking not found' });
		if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'Cannot check in cancelled booking' });
		
		// Check if already checked in
		const existing = await CheckIn.findOne({ booking: bookingId });
		if (existing) return res.status(400).json({ error: 'Already checked in' });
		
		// Check if check-in window is open (24 hours before flight)
		const flight = await Flight.findById(booking.flight._id || booking.flight);
		const checkInOpen = dayjs(flight.departureTime).subtract(24, 'hours');
		if (dayjs().isBefore(checkInOpen)) {
			return res.status(400).json({ error: `Check-in opens ${checkInOpen.format('MMM D, YYYY HH:mm')}` });
		}
		
		// Auto-assign seat if not already assigned
		let seatNumber = booking.seatNumber;
		if (!seatNumber && booking.seatClass) {
			// Simple seat assignment logic
			const classSeats = ['A', 'B', 'C', 'D', 'E', 'F'];
			const row = Math.floor(Math.random() * 30) + 1;
			const letter = classSeats[Math.floor(Math.random() * classSeats.length)];
			seatNumber = `${row}${letter}`;
		}
		
		// Determine boarding group
		let boardingGroup = 'C';
		if (booking.seatClass === 'FIRST') boardingGroup = 'A';
		else if (booking.seatClass === 'BUSINESS') boardingGroup = 'B';
		
		const checkIn = await CheckIn.create({
			booking: bookingId,
			passenger: booking.passenger,
			flight: booking.flight._id || booking.flight,
			seatNumber,
			gate: flight.gate || 'TBD',
			boardingGroup,
		});
		
		// Create notification for check-in
		try {
			// Find passenger to get email and link user
			const passenger = await Passenger.findById(booking.passenger);
			let userId = null;
			if (passenger && passenger.email) {
				const user = await User.findOne({ email: passenger.email });
				if (user) userId = user._id;
			}
			
			// Format flight information
			const flightNumber = flight.flightNumber || 'N/A';
			const origin = flight.origin || '';
			const destination = flight.destination || '';
			const route = origin && destination ? `${origin} → ${destination}` : flightNumber;
			
			// Create notification
			await Notification.create({
				type: 'BOARDING',
				title: 'Check-In Successful',
				message: `You've successfully checked in for flight ${flightNumber}${route !== flightNumber ? ` (${route})` : ''}. Your seat is ${seatNumber}, gate ${flight.gate || 'TBD'}, boarding group ${boardingGroup}.`,
				passenger: booking.passenger,
				user: userId,
				relatedBooking: bookingId,
				relatedFlight: booking.flight._id || booking.flight,
				read: false,
			});
			
			console.log(`Notification created for check-in: ${checkIn._id}`);
		} catch (notifErr) {
			// Log error but don't fail the check-in if notification creation fails
			console.error('Failed to create check-in notification:', notifErr);
		}
		
		res.status(201).json(checkIn);
	} catch (err) { next(err); }
}

async function getCheckIns(req, res, next) {
	try {
		const { flightId, passengerId, bookingId } = req.query;
		const filter = {};
		if (flightId) filter.flight = flightId;
		if (passengerId) filter.passenger = passengerId;
		if (bookingId) filter.booking = bookingId;
		
		const checkIns = await CheckIn.find(filter)
			.populate('booking passenger flight')
			.sort({ checkInTime: -1 });
		res.json(checkIns);
	} catch (err) { next(err); }
}

async function updateCheckIn(req, res, next) {
	try {
		const checkIn = await CheckIn.findByIdAndUpdate(req.params.id, req.body, { new: true })
			.populate('booking passenger flight');
		if (!checkIn) return res.status(404).json({ error: 'Check-in not found' });
		res.json(checkIn);
	} catch (err) { next(err); }
}

module.exports = { createCheckIn, getCheckIns, updateCheckIn };

