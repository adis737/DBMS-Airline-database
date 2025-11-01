const Notification = require('../models/Notification');

async function createNotification(req, res, next) {
	try {
		const notification = await Notification.create(req.body);
		res.status(201).json(notification);
	} catch (err) { next(err); }
}

async function getNotifications(req, res, next) {
	try {
		const { userId, passengerId, read, type } = req.query;
		const filter = {};
		if (userId) filter.user = userId;
		if (passengerId) filter.passenger = passengerId;
		if (read !== undefined) filter.read = read === 'true';
		if (type) filter.type = type;
		
		const notifications = await Notification.find(filter)
			.populate('relatedBooking relatedFlight')
			.sort({ createdAt: -1 })
			.limit(100);
		
		const unreadCount = await Notification.countDocuments({ ...filter, read: false });
		
		res.json({ data: notifications, unreadCount });
	} catch (err) { next(err); }
}

async function markAsRead(req, res, next) {
	try {
		const { id } = req.params;
		const { markAll } = req.body;
		
		if (markAll) {
			await Notification.updateMany({ read: false }, { read: true });
			res.json({ success: true, message: 'All notifications marked as read' });
		} else {
			const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
			if (!notification) return res.status(404).json({ error: 'Notification not found' });
			res.json(notification);
		}
	} catch (err) { next(err); }
}

async function deleteNotification(req, res, next) {
	try {
		const notification = await Notification.findByIdAndDelete(req.params.id);
		if (!notification) return res.status(404).json({ error: 'Notification not found' });
		res.json({ success: true });
	} catch (err) { next(err); }
}

module.exports = { createNotification, getNotifications, markAsRead, deleteNotification };

