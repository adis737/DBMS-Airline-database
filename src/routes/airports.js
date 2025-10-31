const router = require('express').Router();
const { validateBody, validateQuery } = require('../middleware/validate');
const { airportCreate, airportUpdate } = require('../validation/airports');
const controller = require('../controllers/airportsController');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

router.post('/', auth(true), requireRoles('ADMIN'), validateBody(airportCreate), controller.createAirport);
router.get('/', controller.getAirports);
router.get('/:id', controller.getAirportById);
router.put('/:id', auth(true), requireRoles('ADMIN'), validateBody(airportUpdate), controller.updateAirport);
router.delete('/:id', auth(true), requireRoles('ADMIN'), controller.deleteAirport);
router.get('/code/:code/flights', validateQuery(Joi.object({ date: Joi.date().iso().allow(null) })), controller.getFlightsByAirport);

module.exports = router;
