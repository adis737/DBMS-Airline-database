const router = require('express').Router();
const controller = require('../controllers/aircraftController');
const { auth } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

router.post('/', auth(true), requireRoles('ADMIN', 'STAFF'), controller.createAircraft);
router.get('/', controller.getAircrafts);
router.get('/:id', controller.getAircraftById);
router.put('/:id', auth(true), requireRoles('ADMIN', 'STAFF'), controller.updateAircraft);

module.exports = router;

