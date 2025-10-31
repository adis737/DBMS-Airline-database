const Flight = require('../models/Flight');
const dayjs = require('dayjs');

async function createFlight(req, res, next) {
	try {
		const flight = await Flight.create(req.body);
		res.status(201).json(flight);
	} catch (err) { next(err); }
}

async function getFlights(req, res, next) {
	try {
		const { date, airline, origin, destination, page = 1, limit = 20 } = req.query;
		const filter = {};
		if (airline) filter.airline = airline;
		if (origin) filter.origin = origin;
		if (destination) filter.destination = destination;
		if (date) {
			const start = dayjs(date).startOf('day').toDate();
			const end = dayjs(date).endOf('day').toDate();
			filter.departureTime = { $gte: start, $lte: end };
		}
		const flights = await Flight.find(filter)
			.sort({ departureTime: 1 })
			.skip((page - 1) * limit)
			.limit(Number(limit));
		const total = await Flight.countDocuments(filter);
		res.json({ data: flights, page: Number(page), limit: Number(limit), total });
	} catch (err) { next(err); }
}

async function getFlightById(req, res, next) {
	try {
		const flight = await Flight.findById(req.params.id);
		if (!flight) return res.status(404).json({ error: 'Flight not found' });
		res.json(flight);
	} catch (err) { next(err); }
}

async function updateFlight(req, res, next) {
	try {
		const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!flight) return res.status(404).json({ error: 'Flight not found' });
		res.json(flight);
	} catch (err) { next(err); }
}

async function deleteFlight(req, res, next) {
	try {
		const flight = await Flight.findByIdAndDelete(req.params.id);
		if (!flight) return res.status(404).json({ error: 'Flight not found' });
		res.json({ success: true });
	} catch (err) { next(err); }
}

module.exports = { createFlight, getFlights, getFlightById, updateFlight, deleteFlight };
