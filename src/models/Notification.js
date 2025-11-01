const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
		passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', index: true },
		type: { 
			type: String, 
			enum: ['BOOKING_CONFIRMED', 'FLIGHT_REMINDER', 'CHECK_IN_AVAILABLE', 'FLIGHT_DELAYED', 
				   'FLIGHT_CANCELLED', 'GATE_CHANGE', 'BOARDING', 'BAGGAGE_UPDATE', 'PROMOTION'],
			required: true 
		},
		title: { type: String, required: true },
		message: { type: String, required: true },
		relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
		relatedFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
		read: { type: Boolean, default: false },
		sentEmail: { type: Boolean, default: false },
		sentSMS: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ passenger: 1, read: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

