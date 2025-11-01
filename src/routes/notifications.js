const router = require('express').Router();
const controller = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.post('/', auth(true), controller.createNotification);
router.get('/', auth(false), controller.getNotifications);
router.put('/:id/read', auth(false), controller.markAsRead);
router.put('/read-all', auth(false), controller.markAsRead);
router.delete('/:id', auth(false), controller.deleteNotification);

module.exports = router;

