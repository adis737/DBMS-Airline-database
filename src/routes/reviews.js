const router = require('express').Router();
const controller = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

router.post('/', auth(false), controller.createReview);
router.get('/', controller.getReviews);

module.exports = router;

