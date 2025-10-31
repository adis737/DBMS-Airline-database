const Joi = require('joi');

const airportCreate = Joi.object({
	code: Joi.string().trim().uppercase().length(3).required(),
	name: Joi.string().trim().min(2).required(),
	city: Joi.string().trim().min(2).required(),
	country: Joi.string().trim().min(2).required(),
	terminals: Joi.number().integer().min(1).default(1),
});

const airportUpdate = Joi.object({
	name: Joi.string().trim().min(2),
	city: Joi.string().trim().min(2),
	country: Joi.string().trim().min(2),
	terminals: Joi.number().integer().min(1),
}).min(1);

module.exports = { airportCreate, airportUpdate };
