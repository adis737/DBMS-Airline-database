const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Passenger = require('../models/Passenger');
const Review = require('../models/Review');
const CheckIn = require('../models/CheckIn');
const Baggage = require('../models/Baggage');
const dayjs = require('dayjs');

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

async function revenueByDateRange(req, res, next) {
	try {
		const { startDate, endDate } = req.query;
		const match = { status: { $ne: 'CANCELLED' } };
		if (startDate || endDate) {
			match.createdAt = {};
			if (startDate) match.createdAt.$gte = new Date(startDate);
			if (endDate) match.createdAt.$lte = new Date(endDate);
		}
		
		const result = await Booking.aggregate([
			{ $match: { ...match, 'payment.status': 'PAID' } },
			{ $group: { _id: null, totalRevenue: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
		]);
		res.json(result[0] || { totalRevenue: 0, count: 0 });
	} catch (err) { next(err); }
}

async function seatOccupancyRate(req, res, next) {
	try {
		const flights = await Flight.find();
		const stats = await Promise.all(flights.map(async (flight) => {
			const bookings = await Booking.countDocuments({ 
				flight: flight._id, 
				status: { $ne: 'CANCELLED' } 
			});
			const totalSeats = flight.seatClasses.reduce((sum, sc) => sum + sc.totalSeats, 0);
			const occupancy = totalSeats > 0 ? (bookings / totalSeats) * 100 : 0;
			return {
				flightNumber: flight.flightNumber,
				route: `${flight.origin} → ${flight.destination}`,
				booked: bookings,
				totalSeats,
				occupancyRate: Math.round(occupancy * 100) / 100,
			};
		}));
		res.json(stats);
	} catch (err) { next(err); }
}

async function averageRating(req, res, next) {
	try {
		const { airline } = req.query;
		const match = {};
		if (airline) match.airline = airline;
		
		const result = await Review.aggregate([
			{ $match: match },
			{ $group: { _id: '$airline', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
			{ $sort: { avgRating: -1 } },
		]);
		res.json(result);
	} catch (err) { next(err); }
}

async function checkInStats(req, res, next) {
	try {
		const checkIns = await CheckIn.countDocuments();
		const boardings = await CheckIn.countDocuments({ status: 'BOARDED' });
		const bookings = await Booking.countDocuments({ status: 'CONFIRMED' });
		const checkInRate = bookings > 0 ? (checkIns / bookings) * 100 : 0;
		
		res.json({
			totalCheckIns: checkIns,
			boarded: boardings,
			checkInRate: Math.round(checkInRate * 100) / 100,
		});
	} catch (err) { next(err); }
}

async function baggageStats(req, res, next) {
	try {
		const total = await Baggage.countDocuments();
		const byStatus = await Baggage.aggregate([
			{ $group: { _id: '$status', count: { $sum: 1 } } },
		]);
		const lost = await Baggage.countDocuments({ status: 'LOST' });
		
		res.json({
			totalBaggages: total,
			byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
			lostBaggages: lost,
		});
	} catch (err) { next(err); }
}

async function passengerDemographics(req, res, next) {
	try {
		const total = await Passenger.countDocuments();
		const byCountry = await Passenger.aggregate([
			{ $group: { _id: '$country', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);
		res.json({ totalPassengers: total, topCountries: byCountry });
	} catch (err) { next(err); }
}

module.exports = { 
	flightsPerRoute, mostBookedFlights, revenue, frequentFlyers,
	revenueByDateRange, seatOccupancyRate, averageRating, 
	checkInStats, baggageStats, passengerDemographics 
};
