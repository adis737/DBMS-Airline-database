const router = require('express').Router();
const { validateBody } = require('../middleware/validate');
const { passengerCreate, passengerUpdate } = require('../validation/passengers');
const controller = require('../controllers/passengersController');

router.post('/', validateBody(passengerCreate), controller.createPassenger);
router.get('/', controller.getPassengers);
router.get('/:id', controller.getPassengerById);
router.get('/:id/bookings', controller.getPassengerBookings);
router.put('/:id', validateBody(passengerUpdate), controller.updatePassenger);
router.delete('/:id', controller.deletePassenger);

module.exports = router;
