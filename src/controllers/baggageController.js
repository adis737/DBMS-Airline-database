const Baggage = require('../models/Baggage');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Passenger = require('../models/Passenger');

async function createBaggage(req, res, next) {
	try {
		const { bookingId, type, weight, pieces, description } = req.body;
		
		// Validate bookingId is a valid ObjectId
		if (!bookingId) {
			return res.status(400).json({ error: 'Booking ID is required.' });
		}
		
		// Check if it's a valid MongoDB ObjectId (24 hex characters)
		const mongoose = require('mongoose');
		if (!mongoose.Types.ObjectId.isValid(bookingId)) {
			return res.status(400).json({ 
				error: 'Invalid booking ID format. Please select a booking from the dropdown list.' 
			});
		}
		
		const booking = await Booking.findById(bookingId);
		if (!booking) return res.status(404).json({ error: 'Booking not found' });
		
		// Calculate baggage fee
		let fee = 0;
		if (type === 'CHECKED') {
			const freeWeight = booking.seatClass === 'FIRST' ? 32 : booking.seatClass === 'BUSINESS' ? 23 : 20;
			const excessWeight = Math.max(0, weight - freeWeight);
			if (excessWeight > 0) {
				fee = Math.ceil(excessWeight / 5) * 50; // $50 per 5kg excess
			}
			if (pieces > 1) {
				fee += (pieces - 1) * 30; // $30 per additional piece
			}
		}
		
		// Generate unique tracking number
		const generateTrackingNumber = () => {
			const random = Math.random().toString(36).substring(2, 10).toUpperCase();
			return `BG-${random}`;
		};
		
		let trackingNumber;
		let attempts = 0;
		do {
			trackingNumber = generateTrackingNumber();
			attempts++;
			// Check if tracking number already exists
			const existing = await Baggage.findOne({ trackingNumber });
			if (!existing) break;
		} while (attempts < 10); // Prevent infinite loop
		
		if (attempts >= 10) {
			// Fallback: use timestamp-based tracking number
			trackingNumber = `BG-${Date.now().toString(36).toUpperCase()}`;
		}
		
		const baggageData = {
			booking: bookingId,
			passenger: booking.passenger,
			flight: booking.flight,
			trackingNumber,
			type,
			weight: Number(weight),
			pieces: Number(pieces) || 1,
			description: description || '',
			fee: Number(fee) || 0,
		};
		
		console.log('Creating baggage with data:', baggageData);
		
		const baggage = await Baggage.create(baggageData);
		
		console.log('Baggage created successfully:', baggage._id);
		
		// Populate before sending response
		const populatedBaggage = await Baggage.findById(baggage._id)
			.populate('booking passenger flight');
		
		res.status(201).json(populatedBaggage);
	} catch (err) { next(err); }
}

async function getBaggages(req, res, next) {
	try {
		const { bookingId, trackingNumber, passengerId, flightId, status } = req.query;
		const filter = {};
		
		// Priority 1: If bookingId is explicitly provided, use it (takes highest priority)
		if (bookingId) {
			filter.booking = bookingId;
		}
		// Priority 2: If passengerId is explicitly provided in query, use it
		else if (passengerId) {
			filter.passenger = passengerId;
		}
		// Priority 3: If user is authenticated and no explicit filters, filter by their bookings and passenger
		else if (req.user && req.user.sub) {
			try {
				const user = await User.findById(req.user.sub);
				if (user) {
					const passenger = await Passenger.findOne({ email: user.email });
					if (passenger) {
						// Get all bookings for this passenger
						const passengerBookings = await Booking.find({ passenger: passenger._id });
						const bookingIds = passengerBookings.map(b => b._id);
						
						// Filter by booking IDs OR passenger ID (to catch baggages even if no bookings exist)
						if (bookingIds.length > 0) {
							filter.$or = [
								{ booking: { $in: bookingIds } },
								{ passenger: passenger._id }
							];
						} else {
							// No bookings found, but still check by passenger ID
							filter.passenger = passenger._id;
						}
					}
				}
			} catch (err) {
				console.error('Error finding user/passenger:', err);
				// If error occurs, continue with empty filter to allow other query params
			}
		}
		
		// Additional filters that can be combined with existing filters
		if (trackingNumber) filter.trackingNumber = trackingNumber;
		if (flightId) filter.flight = flightId;
		if (status) filter.status = status;
		
		console.log('Searching baggages with filter:', JSON.stringify(filter, null, 2));
		
		const baggages = await Baggage.find(filter)
			.populate('booking passenger flight')
			.sort({ createdAt: -1 });
		
		console.log(`Found ${baggages.length} baggages`);
		
		res.json(baggages);
	} catch (err) { 
		console.error('Error in getBaggages:', err);
		next(err); 
	}
}

async function updateBaggageStatus(req, res, next) {
	try {
		const { status } = req.body;
		const baggage = await Baggage.findByIdAndUpdate(req.params.id, { status }, { new: true })
			.populate('booking passenger flight');
		if (!baggage) return res.status(404).json({ error: 'Baggage not found' });
		res.json(baggage);
	} catch (err) { next(err); }
}

module.exports = { createBaggage, getBaggages, updateBaggageStatus };

