const router = require('express').Router();
const controller = require('../controllers/specialServiceController');
const { auth } = require('../middleware/auth');

router.post('/', auth(false), controller.createServiceRequest);
router.get('/', controller.getServices);
router.put('/:id/status', auth(true), controller.updateServiceStatus);

module.exports = router;

