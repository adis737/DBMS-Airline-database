const mongoose = require('mongoose');

const seatClassSchema = new mongoose.Schema(
	{
		class: { type: String, enum: ['ECONOMY', 'BUSINESS', 'FIRST'], required: true },
		totalSeats: { type: Number, required: true, min: 0 },
		availableSeats: { type: Number, required: true, min: 0 },
		price: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const flightSchema = new mongoose.Schema(
	{
		flightNumber: { type: String, required: true, trim: true, uppercase: true, index: true },
		airline: { type: String, required: true, trim: true, index: true },
		origin: { type: String, required: true, uppercase: true, trim: true, ref: 'Airport' },
		destination: { type: String, required: true, uppercase: true, trim: true, ref: 'Airport' },
		departureTime: { type: Date, required: true, index: true },
		arrivalTime: { type: Date, required: true },
		seatClasses: { type: [seatClassSchema], default: [] },
		status: { type: String, enum: ['SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'], default: 'SCHEDULED' },
	},
	{ timestamps: true }
);

flightSchema.index({ origin: 1, destination: 1, departureTime: 1 });

module.exports = mongoose.model('Flight', flightSchema);
