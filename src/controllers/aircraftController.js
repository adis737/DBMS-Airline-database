const Aircraft = require('../models/Aircraft');
const Flight = require('../models/Flight');

async function createAircraft(req, res, next) {
	try {
		const aircraft = await Aircraft.create(req.body);
		res.status(201).json(aircraft);
	} catch (err) { next(err); }
}

async function getAircrafts(req, res, next) {
	try {
		const { airline, status } = req.query;
		const filter = {};
		if (airline) filter.airline = airline;
		if (status) filter.status = status;
		
		const aircrafts = await Aircraft.find(filter).sort({ registration: 1 });
		
		// Get utilization stats
		const stats = await Promise.all(aircrafts.map(async (ac) => {
			const flights = await Flight.countDocuments({ aircraft: ac._id });
			return { ...ac.toObject(), flightCount: flights };
		}));
		
		res.json(stats);
	} catch (err) { next(err); }
}

async function getAircraftById(req, res, next) {
	try {
		const aircraft = await Aircraft.findById(req.params.id);
		if (!aircraft) return res.status(404).json({ error: 'Aircraft not found' });
		
		// Get flight history
		const flights = await Flight.find({ aircraft: aircraft._id })
			.sort({ departureTime: -1 })
			.limit(20);
		
		res.json({ aircraft, recentFlights: flights });
	} catch (err) { next(err); }
}

async function updateAircraft(req, res, next) {
	try {
		const aircraft = await Aircraft.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!aircraft) return res.status(404).json({ error: 'Aircraft not found' });
		res.json(aircraft);
	} catch (err) { next(err); }
}

module.exports = { createAircraft, getAircrafts, getAircraftById, updateAircraft };

