const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
		passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
		flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
		airline: { type: String, required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		title: { type: String, trim: true },
		comments: { type: String, trim: true },
		ratings: {
			punctuality: { type: Number, min: 1, max: 5 },
			service: { type: Number, min: 1, max: 5 },
			comfort: { type: Number, min: 1, max: 5 },
			value: { type: Number, min: 1, max: 5 },
		},
		verified: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

reviewSchema.index({ flight: 1, rating: -1 });
reviewSchema.index({ airline: 1, rating: -1 });
reviewSchema.index({ passenger: 1 });

module.exports = mongoose.model('Review', reviewSchema);

