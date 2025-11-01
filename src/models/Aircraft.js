const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema(
	{
		registration: { type: String, required: true, unique: true, trim: true },
		type: { type: String, required: true, trim: true }, // e.g., "Boeing 737-800", "Airbus A320"
		airline: { type: String, required: true, trim: true },
		capacity: {
			economy: { type: Number, default: 0, min: 0 },
			business: { type: Number, default: 0, min: 0 },
			first: { type: Number, default: 0, min: 0 },
		},
		status: { 
			type: String, 
			enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE', 'RETIRED'], 
			default: 'ACTIVE' 
		},
		lastMaintenance: { type: Date },
		nextMaintenance: { type: Date },
		mileage: { type: Number, default: 0 },
		firstFlight: { type: Date },
	},
	{ timestamps: true }
);

aircraftSchema.index({ airline: 1, status: 1 });
aircraftSchema.index({ status: 1 });

module.exports = mongoose.model('Aircraft', aircraftSchema);

