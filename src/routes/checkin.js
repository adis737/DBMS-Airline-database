const router = require('express').Router();
const controller = require('../controllers/checkInController');
const { auth } = require('../middleware/auth');

router.post('/', auth(false), controller.createCheckIn);
router.get('/', controller.getCheckIns);
router.put('/:id', auth(false), controller.updateCheckIn);

module.exports = router;

