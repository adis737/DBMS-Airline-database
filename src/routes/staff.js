const router = require('express').Router();
const { validateBody } = require('../middleware/validate');
const { staffCreate, staffUpdate } = require('../validation/staff');
const controller = require('../controllers/staffController');
const { auth } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

router.post('/', auth(true), requireRoles('ADMIN'), validateBody(staffCreate), controller.createStaff);
router.get('/', auth(true), requireRoles('ADMIN', 'STAFF'), controller.getStaff);
router.get('/:id', auth(true), requireRoles('ADMIN', 'STAFF'), controller.getStaffById);
router.put('/:id', auth(true), requireRoles('ADMIN'), validateBody(staffUpdate), controller.updateStaff);
router.delete('/:id', auth(true), requireRoles('ADMIN'), controller.deleteStaff);

module.exports = router;
