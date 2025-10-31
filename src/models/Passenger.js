const mongoose = require('mongoose');

const frequentFlyerSchema = new mongoose.Schema(
	{
		program: { type: String, trim: true },
		number: { type: String, trim: true },
		status: { type: String, enum: ['NONE', 'SILVER', 'GOLD', 'PLATINUM'], default: 'NONE' },
	},
	{ _id: false }
);

const passengerSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, lowercase: true, unique: true },
		phone: { type: String, trim: true },
		dateOfBirth: { type: Date },
		passportNumber: { type: String, trim: true, index: true },
		frequentFlyer: { type: frequentFlyerSchema, default: undefined },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Passenger', passengerSchema);
