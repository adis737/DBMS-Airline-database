const mongoose = require('mongoose');

const baggageSchema = new mongoose.Schema(
	{
		booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
		passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
		flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
		trackingNumber: { type: String, unique: true, index: true },
		type: { type: String, enum: ['CARRY_ON', 'CHECKED'], required: true },
		weight: { type: Number, required: true, min: 0 }, // in kg
		pieces: { type: Number, default: 1, min: 1 },
		status: { 
			type: String, 
			enum: ['CHECKED', 'LOADED', 'IN_TRANSIT', 'ARRIVED', 'DELAYED', 'LOST'], 
			default: 'CHECKED' 
		},
		fee: { type: Number, default: 0, min: 0 },
		description: { type: String, trim: true },
	},
	{ timestamps: true }
);

baggageSchema.pre('save', function generateTrackingNumber(next) {
	// Only generate if tracking number is not already set
	if (!this.trackingNumber) {
		const random = Math.random().toString(36).substring(2, 10).toUpperCase();
		this.trackingNumber = `BG-${random}`;
	}
	next();
});

baggageSchema.index({ flight: 1, status: 1 });
baggageSchema.index({ passenger: 1 });

module.exports = mongoose.model('Baggage', baggageSchema);

