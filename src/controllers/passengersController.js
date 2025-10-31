const Passenger = require('../models/Passenger');
const Booking = require('../models/Booking');

async function createPassenger(req, res, next) {
	try {
		const passenger = await Passenger.create(req.body);
		res.status(201).json(passenger);
	} catch (err) { next(err); }
}

async function getPassengers(req, res, next) {
	try {
		const passengers = await Passenger.find().sort({ createdAt: -1 });
		res.json(passengers);
	} catch (err) { next(err); }
}

async function getPassengerById(req, res, next) {
	try {
		const passenger = await Passenger.findById(req.params.id);
		if (!passenger) return res.status(404).json({ error: 'Passenger not found' });
		res.json(passenger);
	} catch (err) { next(err); }
}

async function updatePassenger(req, res, next) {
	try {
		const passenger = await Passenger.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!passenger) return res.status(404).json({ error: 'Passenger not found' });
		res.json(passenger);
	} catch (err) { next(err); }
}

async function deletePassenger(req, res, next) {
	try {
		const passenger = await Passenger.findByIdAndDelete(req.params.id);
		if (!passenger) return res.status(404).json({ error: 'Passenger not found' });
		res.json({ success: true });
	} catch (err) { next(err); }
}

async function getPassengerBookings(req, res, next) {
	try {
		const bookings = await Booking.find({ passenger: req.params.id }).sort({ createdAt: -1 });
		res.json(bookings);
	} catch (err) { next(err); }
}

module.exports = { createPassenger, getPassengers, getPassengerById, updatePassenger, deletePassenger, getPassengerBookings };
