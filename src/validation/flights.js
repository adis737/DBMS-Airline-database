const Joi = require('joi');

const seatClass = Joi.object({
	class: Joi.string().valid('ECONOMY', 'BUSINESS', 'FIRST').required(),
	totalSeats: Joi.number().integer().min(0).required(),
	availableSeats: Joi.number().integer().min(0).required(),
	price: Joi.number().min(0).required(),
});

const flightCreate = Joi.object({
	flightNumber: Joi.string().trim().required(),
	airline: Joi.string().trim().required(),
	origin: Joi.string().trim().uppercase().length(3).required(),
	destination: Joi.string().trim().uppercase().length(3).required(),
	departureTime: Joi.date().iso().required(),
	arrivalTime: Joi.date().iso().required(),
	seatClasses: Joi.array().items(seatClass).default([]),
	status: Joi.string().valid('SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED').default('SCHEDULED'),
});

const flightUpdate = Joi.object({
	airline: Joi.string().trim(),
	origin: Joi.string().trim().uppercase().length(3),
	destination: Joi.string().trim().uppercase().length(3),
	departureTime: Joi.date().iso(),
	arrivalTime: Joi.date().iso(),
	seatClasses: Joi.array().items(seatClass),
	status: Joi.string().valid('SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'),
}).min(1);

const flightQuery = Joi.object({
	date: Joi.string().allow(''),
	airline: Joi.string().allow(''),
	origin: Joi.string().uppercase().max(3).allow(''),
	destination: Joi.string().uppercase().max(3).allow(''),
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(200).default(20),
});

module.exports = { flightCreate, flightUpdate, flightQuery };
