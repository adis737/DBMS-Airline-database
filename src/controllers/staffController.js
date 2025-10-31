const Staff = require('../models/Staff');

async function createStaff(req, res, next) {
	try { const staff = await Staff.create(req.body); res.status(201).json(staff); } catch (err) { next(err); }
}
async function getStaff(req, res, next) {
	try { const staff = await Staff.find().sort({ createdAt: -1 }); res.json(staff); } catch (err) { next(err); }
}
async function getStaffById(req, res, next) {
	try { const staff = await Staff.findById(req.params.id); if (!staff) return res.status(404).json({ error: 'Staff not found' }); res.json(staff); } catch (err) { next(err); }
}
async function updateStaff(req, res, next) {
	try { const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!staff) return res.status(404).json({ error: 'Staff not found' }); res.json(staff); } catch (err) { next(err); }
}
async function deleteStaff(req, res, next) {
	try { const staff = await Staff.findByIdAndDelete(req.params.id); if (!staff) return res.status(404).json({ error: 'Staff not found' }); res.json({ success: true }); } catch (err) { next(err); }
}

module.exports = { createStaff, getStaff, getStaffById, updateStaff, deleteStaff };
