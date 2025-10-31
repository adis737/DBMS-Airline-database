const router = require('express').Router();
const { validateBody, validateQuery } = require('../middleware/validate');
const { flightCreate, flightUpdate, flightQuery } = require('../validation/flights');
const controller = require('../controllers/flightsController');
const { auth } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

router.post('/', auth(true), requireRoles('ADMIN', 'STAFF'), validateBody(flightCreate), controller.createFlight);
router.get('/', validateQuery(flightQuery), controller.getFlights);
router.get('/:id', controller.getFlightById);
router.put('/:id', auth(true), requireRoles('ADMIN', 'STAFF'), validateBody(flightUpdate), controller.updateFlight);
router.delete('/:id', auth(true), requireRoles('ADMIN'), controller.deleteFlight);

module.exports = router;
