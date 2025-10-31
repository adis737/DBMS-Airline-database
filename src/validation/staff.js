const Joi = require('joi');

const staffCreate = Joi.object({
	employeeId: Joi.string().trim().required(),
	firstName: Joi.string().trim().required(),
	lastName: Joi.string().trim().required(),
	email: Joi.string().email().required(),
	role: Joi.string().valid('PILOT', 'CREW', 'GROUND', 'ADMIN').required(),
	assignedFlights: Joi.array().items(Joi.string().hex().length(24)).default([]),
	active: Joi.boolean().default(true),
});

const staffUpdate = Joi.object({
	firstName: Joi.string().trim(),
	lastName: Joi.string().trim(),
	email: Joi.string().email(),
	role: Joi.string().valid('PILOT', 'CREW', 'GROUND', 'ADMIN'),
	assignedFlights: Joi.array().items(Joi.string().hex().length(24)),
	active: Joi.boolean(),
}).min(1);

module.exports = { staffCreate, staffUpdate };
