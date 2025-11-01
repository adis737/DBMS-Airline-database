const SpecialService = require('../models/SpecialService');
const Booking = require('../models/Booking');

async function createServiceRequest(req, res, next) {
	try {
		const { bookingId, type, details, notes } = req.body;
		const booking = await Booking.findById(bookingId);
		if (!booking) return res.status(404).json({ error: 'Booking not found' });
		
		// Calculate fee based on service type
		let fee = 0;
		const feeMap = {
			'EXTRA_LEGROOM': 50,
			'PET_TRAVEL': 125,
			'UNACCOMPANIED_MINOR': 150,
			'BASSINET': 0,
			'WHEELCHAIR': 0,
			'MEDICAL_ASSISTANCE': 0,
		};
		fee = feeMap[type] || 0;
		
		const service = await SpecialService.create({
			booking: bookingId,
			passenger: booking.passenger,
			flight: booking.flight,
			type,
			details,
			notes,
			fee,
			status: 'REQUESTED',
		});
		
		res.status(201).json(service);
	} catch (err) { next(err); }
}

async function getServices(req, res, next) {
	try {
		const { bookingId, flightId, passengerId, type, status } = req.query;
		const filter = {};
		if (bookingId) filter.booking = bookingId;
		if (flightId) filter.flight = flightId;
		if (passengerId) filter.passenger = passengerId;
		if (type) filter.type = type;
		if (status) filter.status = status;
		
		const services = await SpecialService.find(filter)
			.populate('booking passenger flight')
			.sort({ createdAt: -1 });
		res.json(services);
	} catch (err) { next(err); }
}

async function updateServiceStatus(req, res, next) {
	try {
		const { status, notes } = req.body;
		const service = await SpecialService.findByIdAndUpdate(
			req.params.id, 
			{ status, notes }, 
			{ new: true }
		).populate('booking passenger flight');
		if (!service) return res.status(404).json({ error: 'Service request not found' });
		res.json(service);
	} catch (err) { next(err); }
}

module.exports = { createServiceRequest, getServices, updateServiceStatus };

