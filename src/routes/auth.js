const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/User');
const Passenger = require('../models/Passenger');
const { validateBody } = require('../middleware/validate');

const strongPassword = Joi.string()
	.min(8)
	.max(72)
	.messages({
		'string.min': 'Password must be at least 8 characters',
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
		
		// Auto-create passenger for new user
		const nameParts = username.split(' ');
		const firstName = nameParts[0] || username;
		const lastName = nameParts.slice(1).join(' ') || 'User';
		const passenger = await Passenger.create({
			firstName,
			lastName,
			email: user.email
		});
		
		res.status(201).json({ id: user._id, username: user.username, email: user.email, roles: user.roles, passengerId: passenger._id });
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
		
		// Auto-create or find passenger for this user
		let passenger = await Passenger.findOne({ email: user.email });
		if (!passenger) {
			// Split username for firstName/lastName or use username as firstName
			const nameParts = username.split(' ');
			const firstName = nameParts[0] || username;
			const lastName = nameParts.slice(1).join(' ') || 'User';
			passenger = await Passenger.create({
				firstName,
				lastName,
				email: user.email
			});
		}
		
		res.json({ token, passengerId: passenger._id });
	} catch (err) { next(err); }
});

module.exports = router;
