const jwt = require('jsonwebtoken');

function auth(required = true) {
	return (req, res, next) => {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) {
			if (required) return res.status(401).json({ error: 'Unauthorized' });
			return next();
		}
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
			req.user = payload;
			return next();
		} catch (err) {
			if (required) return res.status(401).json({ error: 'Invalid token' });
			return next();
		}
	};
}

module.exports = { auth };
