const Flight = require('../models/Flight');
const dayjs = require('dayjs');
const https = require('https');

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
		if (airline && airline.trim()) filter.airline = airline;
		if (origin && origin.trim()) filter.origin = origin;
		if (destination && destination.trim()) filter.destination = destination;
		if (date && date.trim()) {
			const dateObj = dayjs(date);
			if (dateObj.isValid()) {
				const start = dateObj.startOf('day').toDate();
				const end = dateObj.endOf('day').toDate();
			filter.departureTime = { $gte: start, $lte: end };
			}
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

async function getRealtimeFlights(req, res, next) {
	try {
		const { limit = 100, dep_iata, arr_iata, flight_status } = req.query;
		const apiKey = process.env.AVIATIONSTACK_API_KEY || '4b816d4f45de4e02b9be7e792e9e35cc';
		
		let url = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&limit=${limit}`;
		if (dep_iata) url += `&dep_iata=${dep_iata}`;
		if (arr_iata) url += `&arr_iata=${arr_iata}`;
		if (flight_status) url += `&flight_status=${flight_status}`;
		
		// Fetch from AviationStack API
		const data = await new Promise((resolve, reject) => {
			https.get(url, (response) => {
				let body = '';
				response.on('data', (chunk) => { body += chunk; });
				response.on('end', () => {
					try {
						const parsed = JSON.parse(body);
						if (parsed.error) {
							reject(new Error(parsed.error.info || 'API error'));
						} else {
							resolve(parsed);
						}
					} catch (e) {
						reject(e);
					}
				});
			}).on('error', reject);
		});
		
		// Transform AviationStack data to match our format
		const flights = (data.data || []).map(f => {
			const dep = f.departure || {};
			const arr = f.arrival || {};
			const airline = f.airline || {};
			
			return {
				id: f.flight?.iata || f.flight?.icao || `FL-${Date.now()}-${Math.random()}`,
				flightNumber: f.flight?.iata || f.flight?.number || 'N/A',
				airline: airline.name || 'Unknown',
				airlineCode: airline.iata || airline.icao || '',
				origin: dep.iata || dep.icao || '',
				destination: arr.iata || arr.icao || '',
				originName: dep.airport || '',
				destinationName: arr.airport || '',
				originLatitude: dep.latitude,
				originLongitude: dep.longitude,
				destinationLatitude: arr.latitude,
				destinationLongitude: arr.longitude,
				departureTime: dep.scheduled || dep.estimated || dep.actual,
				arrivalTime: arr.scheduled || arr.estimated || arr.actual,
				status: f.flight_status || 'unknown',
				liveLatitude: f.live?.latitude,
				liveLongitude: f.live?.longitude,
				liveAltitude: f.live?.altitude,
				liveDirection: f.live?.direction,
				liveSpeed: f.live?.speed_horizontal,
			};
		});
		
		res.json({ data: flights, total: flights.length });
	} catch (err) {
		console.error('AviationStack API error:', err);
		res.status(500).json({ error: err.message || 'Failed to fetch real-time flights' });
	}
}

async function updateFlightStatus(req, res, next) {
	try {
		const { status, delayMinutes, gate, terminal, reason } = req.body;
		const flight = await Flight.findById(req.params.id);
		if (!flight) return res.status(404).json({ error: 'Flight not found' });
		
		// Add to status history
		if (!flight.statusHistory) flight.statusHistory = [];
		flight.statusHistory.push({
			status: flight.status,
			timestamp: new Date(),
			reason: reason || 'Status update',
		});
		
		// Update status and related fields
		if (status) flight.status = status;
		if (delayMinutes !== undefined) {
			flight.delayMinutes = delayMinutes;
			if (delayMinutes > 0 && status === 'SCHEDULED') {
				flight.status = 'DELAYED';
			}
		}
		if (gate) flight.gate = gate;
		if (terminal) flight.terminal = terminal;
		
		await flight.save();
		res.json(flight);
	} catch (err) { next(err); }
}

module.exports = { createFlight, getFlights, getFlightById, updateFlight, deleteFlight, getRealtimeFlights, updateFlightStatus };
