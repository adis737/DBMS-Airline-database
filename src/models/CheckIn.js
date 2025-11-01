const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
	{
		booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
		passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
		flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
		checkInTime: { type: Date, default: Date.now },
		seatNumber: { type: String, trim: true },
		gate: { type: String, trim: true },
		boardingGroup: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'C' },
		status: { type: String, enum: ['CHECKED_IN', 'BOARDED', 'NO_SHOW'], default: 'CHECKED_IN' },
		boardingPassGenerated: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

checkInSchema.index({ flight: 1, checkInTime: 1 });
checkInSchema.index({ passenger: 1 });

module.exports = mongoose.model('CheckIn', checkInSchema);

