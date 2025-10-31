const router = require('express').Router();
const { validateBody } = require('../middleware/validate');
const { bookingCreate, bookingUpdate } = require('../validation/bookings');
const controller = require('../controllers/bookingsController');
const { auth } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

router.post('/', auth(true), requireRoles('USER', 'STAFF', 'ADMIN'), validateBody(bookingCreate), controller.createBooking);
router.get('/', auth(true), requireRoles('STAFF', 'ADMIN'), controller.getBookings);
router.get('/:id', auth(true), requireRoles('USER', 'STAFF', 'ADMIN'), controller.getBookingById);
router.put('/:id', auth(true), requireRoles('STAFF', 'ADMIN'), validateBody(bookingUpdate), controller.updateBooking);
router.post('/:id/cancel', auth(true), requireRoles('USER', 'STAFF', 'ADMIN'), controller.cancelBooking);

module.exports = router;
