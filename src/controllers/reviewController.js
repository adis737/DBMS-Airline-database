const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

async function createReview(req, res, next) {
	try {
		const { bookingId, rating, title, comments, ratings } = req.body;
		const booking = await Booking.findById(bookingId).populate('flight');
		if (!booking) return res.status(404).json({ error: 'Booking not found' });
		
		// Check if already reviewed
		const existing = await Review.findOne({ booking: bookingId });
		if (existing) return res.status(400).json({ error: 'Already reviewed' });
		
		const flight = await Flight.findById(booking.flight._id || booking.flight);
		
		const review = await Review.create({
			booking: bookingId,
			passenger: booking.passenger,
			flight: booking.flight._id || booking.flight,
			airline: flight.airline,
			rating,
			title,
			comments,
			ratings,
			verified: true, // Verified if booking exists
		});
		
		res.status(201).json(review);
	} catch (err) { next(err); }
}

async function getReviews(req, res, next) {
	try {
		const { flightId, airline, passengerId, minRating } = req.query;
		const filter = {};
		if (flightId) filter.flight = flightId;
		if (airline) filter.airline = airline;
		if (passengerId) filter.passenger = passengerId;
		if (minRating) filter.rating = { $gte: Number(minRating) };
		
		const reviews = await Review.find(filter)
			.populate('passenger flight')
			.sort({ createdAt: -1 })
			.limit(100);
		
		// Calculate average rating
		const avgRating = await Review.aggregate([
			{ $match: filter },
			{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
		]);
		
		res.json({ 
			data: reviews, 
			averageRating: avgRating[0]?.avg || 0,
			totalReviews: avgRating[0]?.count || 0
		});
	} catch (err) { next(err); }
}

module.exports = { createReview, getReviews };

