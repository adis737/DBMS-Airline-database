function requireRoles(...roles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
		const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
		const allowed = roles.some(r => userRoles.includes(r));
		if (!allowed) return res.status(403).json({ error: 'Forbidden' });
		next();
	};
}

module.exports = { requireRoles };
