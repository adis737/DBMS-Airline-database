const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
	{
		employeeId: { type: String, required: true, unique: true, trim: true },
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, lowercase: true, unique: true },
		role: { type: String, enum: ['PILOT', 'CREW', 'GROUND', 'ADMIN'], required: true },
		assignedFlights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }],
		active: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
