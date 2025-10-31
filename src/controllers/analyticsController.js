const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Passenger = require('../models/Passenger');

async function flightsPerRoute(req, res, next) {
	try {
		const result = await Flight.aggregate([
			{ $group: { _id: { origin: '$origin', destination: '$destination' }, count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]);
		res.json(result.map(r => ({ origin: r._id.origin, destination: r._id.destination, flights: r.count })));
	} catch (err) { next(err); }
}

async function mostBookedFlights(req, res, next) {
	try {
		const result = await Booking.aggregate([
			{ $match: { status: { $ne: 'CANCELLED' } } },
			{ $group: { _id: '$flight', bookings: { $sum: 1 } } },
			{ $sort: { bookings: -1 } },
			{ $limit: 10 },
			{ $lookup: { from: 'flights', localField: '_id', foreignField: '_id', as: 'flight' } },
			{ $unwind: '$flight' },
		]);
		res.json(result);
	} catch (err) { next(err); }
}

async function revenue(req, res, next) {
	try {
		// Also include bookings with payment.status not set but payment.amount exists
		const result = await Booking.aggregate([
			{ 
				$match: { 
					$or: [
						{ 'payment.status': 'PAID' },
						{ 'payment.amount': { $exists: true, $gt: 0 } }
					],
					status: { $ne: 'CANCELLED' }
				} 
			},
			{ $group: { _id: null, totalRevenue: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
		]);
		res.json(result[0] || { totalRevenue: 0, count: 0 });
	} catch (err) { next(err); }
}

async function frequentFlyers(req, res, next) {
	try {
		const result = await Booking.aggregate([
			{ $match: { status: { $ne: 'CANCELLED' } } },
			{ $group: { _id: '$passenger', bookings: { $sum: 1 } } },
			{ $sort: { bookings: -1 } },
			{ $limit: 10 },
			{ $lookup: { from: 'passengers', localField: '_id', foreignField: '_id', as: 'passenger' } },
			{ $unwind: '$passenger' },
		]);
		res.json(result);
	} catch (err) { next(err); }
}

module.exports = { flightsPerRoute, mostBookedFlights, revenue, frequentFlyers };
