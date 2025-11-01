const router = require('express').Router();
const controller = require('../controllers/baggageController');
const { auth } = require('../middleware/auth');

router.post('/', auth(false), controller.createBaggage);
router.get('/', auth(false), controller.getBaggages);
router.put('/:id/status', auth(false), controller.updateBaggageStatus);

module.exports = router;

