const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema(
	{
		code: { type: String, required: true, uppercase: true, trim: true, unique: true },
		name: { type: String, required: true, trim: true },
		city: { type: String, required: true, trim: true },
		country: { type: String, required: true, trim: true },
		terminals: { type: Number, default: 1, min: 1 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Airport', airportSchema);
