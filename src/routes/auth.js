const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/User');
const { validateBody } = require('../middleware/validate');

const strongPassword = Joi.string()
	.min(8)
	.max(72)
	.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/)
	.messages({
		'string.min': 'Password must be at least 8 characters',
		'string.pattern.base': 'Password must include upper, lower, number, and special character',
	});

const registerSchema = Joi.object({
	username: Joi.string().trim().min(3).required(),
	email: Joi.string().email().required(),
	password: strongPassword.required(),
	roles: Joi.array().items(Joi.string().valid('ADMIN', 'STAFF', 'USER')).default(['USER']),
});

const loginSchema = Joi.object({
	username: Joi.string().trim().required(),
	password: Joi.string().required(),
});

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
	try {
		const { username, email, password, roles } = req.body;
		const exists = await User.findOne({ $or: [{ username }, { email }] });
		if (exists) return res.status(409).json({ error: 'User already exists' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ username, email, passwordHash, roles });
		res.status(201).json({ id: user._id, username: user.username, email: user.email, roles: user.roles });
	} catch (err) { next(err); }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await user.comparePassword(password);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const token = jwt.sign({ sub: user._id, username: user.username, roles: user.roles }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '12h' });
		res.json({ token });
	} catch (err) { next(err); }
});

module.exports = router;
