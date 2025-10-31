const router = require('express').Router();
const controller = require('../controllers/analyticsController');

router.get('/flights-per-route', controller.flightsPerRoute);
router.get('/most-booked-flights', controller.mostBookedFlights);
router.get('/revenue', controller.revenue);
router.get('/frequent-flyers', controller.frequentFlyers);

module.exports = router;
