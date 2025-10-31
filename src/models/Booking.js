const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentSchema = new mongoose.Schema(
	{
		amount: { type: Number, required: true, min: 0 },
		currency: { type: String, default: 'USD' },
		status: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
		method: { type: String, enum: ['CARD', 'CASH', 'WALLET', 'OTHER'], default: 'CARD' },
		transactionId: { type: String, trim: true },
	},
	{ _id: false, timestamps: true }
);

const bookingSchema = new mongoose.Schema(
	{
		bookingId: { type: String, unique: true, index: true },
		flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true, index: true },
		passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true, index: true },
		seatClass: { type: String, enum: ['ECONOMY', 'BUSINESS', 'FIRST'], required: true },
		seatNumber: { type: String, trim: true },
		status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
		payment: { type: paymentSchema, required: true },
		travelDate: { type: Date, required: true, index: true },
	},
	{ timestamps: true }
);

bookingSchema.pre('save', function generateBookingId(next) {
	if (!this.bookingId) {
		this.bookingId = `BKG-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
	}
	next();
});

module.exports = mongoose.model('Booking', bookingSchema);
