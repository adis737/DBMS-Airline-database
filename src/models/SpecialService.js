const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
	{
		booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
		passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
		flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
		type: { 
			type: String, 
			enum: ['WHEELCHAIR', 'SPECIAL_MEAL', 'EXTRA_LEGROOM', 'PET_TRAVEL', 'UNACCOMPANIED_MINOR', 
				   'BASSINET', 'MEDICAL_ASSISTANCE', 'DIETARY_RESTRICTION', 'OTHER'],
			required: true 
		},
		details: { type: String, trim: true },
		status: { type: String, enum: ['REQUESTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED'], default: 'REQUESTED' },
		fee: { type: Number, default: 0, min: 0 },
		notes: { type: String, trim: true },
	},
	{ timestamps: true }
);

serviceRequestSchema.index({ booking: 1, type: 1 });
serviceRequestSchema.index({ flight: 1, status: 1 });

module.exports = mongoose.model('SpecialService', serviceRequestSchema);

