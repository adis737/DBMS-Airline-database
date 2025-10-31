const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const dayjs = require('dayjs');

async function createAirport(req, res, next) {
	try { const airport = await Airport.create(req.body); res.status(201).json(airport); } catch (err) { next(err); }
}
async function getAirports(req, res, next) {
	try { const airports = await Airport.find().sort({ code: 1 }); res.json(airports); } catch (err) { next(err); }
}
async function getAirportById(req, res, next) {
	try {
		const airport = await Airport.findById(req.params.id);
		if (!airport) return res.status(404).json({ error: 'Airport not found' });
		res.json(airport);
	} catch (err) { next(err); }
}
async function updateAirport(req, res, next) {
	try {
		const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!airport) return res.status(404).json({ error: 'Airport not found' });
		res.json(airport);
	} catch (err) { next(err); }
}
async function deleteAirport(req, res, next) {
	try {
		const airport = await Airport.findByIdAndDelete(req.params.id);
		if (!airport) return res.status(404).json({ error: 'Airport not found' });
		res.json({ success: true });
	} catch (err) { next(err); }
}
async function getFlightsByAirport(req, res, next) {
	try {
		const { code } = req.params;
		const { date } = req.query;
		const filter = { $or: [{ origin: code.toUpperCase() }, { destination: code.toUpperCase() }] };
		if (date) {
			const start = dayjs(date).startOf('day').toDate();
			const end = dayjs(date).endOf('day').toDate();
			filter.departureTime = { $gte: start, $lte: end };
		}
		const flights = await Flight.find(filter).sort({ departureTime: 1 });
		res.json(flights);
	} catch (err) { next(err); }
}

module.exports = { createAirport, getAirports, getAirportById, updateAirport, deleteAirport, getFlightsByAirport };
