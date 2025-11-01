const router = require('express').Router();
const controller = require('../controllers/analyticsController');

router.get('/flights-per-route', controller.flightsPerRoute);
router.get('/most-booked-flights', controller.mostBookedFlights);
router.get('/revenue', controller.revenue);
router.get('/revenue-by-date', controller.revenueByDateRange);
router.get('/frequent-flyers', controller.frequentFlyers);
router.get('/seat-occupancy', controller.seatOccupancyRate);
router.get('/average-rating', controller.averageRating);
router.get('/checkin-stats', controller.checkInStats);
router.get('/baggage-stats', controller.baggageStats);
router.get('/passenger-demographics', controller.passengerDemographics);

module.exports = router;
