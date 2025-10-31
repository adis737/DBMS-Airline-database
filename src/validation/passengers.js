const Joi = require('joi');

const frequentFlyer = Joi.object({
	program: Joi.string().trim(),
	number: Joi.string().trim(),
	status: Joi.string().valid('NONE', 'SILVER', 'GOLD', 'PLATINUM').default('NONE'),
});

const passengerCreate = Joi.object({
	firstName: Joi.string().trim().required(),
	lastName: Joi.string().trim().required(),
	email: Joi.string().email().required(),
	phone: Joi.string().trim().allow('', null),
	dateOfBirth: Joi.date().iso().allow(null),
	passportNumber: Joi.string().trim().allow('', null),
	frequentFlyer: frequentFlyer.allow(null),
});

const passengerUpdate = Joi.object({
	firstName: Joi.string().trim(),
	lastName: Joi.string().trim(),
	email: Joi.string().email(),
	phone: Joi.string().trim().allow(''),
	dateOfBirth: Joi.date().iso().allow(null),
	passportNumber: Joi.string().trim().allow(''),
	frequentFlyer: frequentFlyer.allow(null),
}).min(1);

module.exports = { passengerCreate, passengerUpdate };
