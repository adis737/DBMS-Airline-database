const Joi = require('joi');

const payment = Joi.object({
	amount: Joi.number().min(0).required(),
	currency: Joi.string().trim().default('USD'),
	status: Joi.string().valid('PENDING', 'PAID', 'REFUNDED').default('PENDING'),
	method: Joi.string().valid('CARD', 'CASH', 'WALLET', 'OTHER').default('CARD'),
	transactionId: Joi.string().trim().allow('', null),
});

const bookingCreate = Joi.object({
	flight: Joi.string().hex().length(24).required(),
	passenger: Joi.string().hex().length(24).required(),
	seatClass: Joi.string().valid('ECONOMY', 'BUSINESS', 'FIRST').required(),
	seatNumber: Joi.string().trim().allow('', null),
	payment: payment.required(),
	travelDate: Joi.date().iso().required(),
});

const bookingUpdate = Joi.object({
	seatClass: Joi.string().valid('ECONOMY', 'BUSINESS', 'FIRST'),
	seatNumber: Joi.string().trim().allow(''),
	status: Joi.string().valid('CONFIRMED', 'CANCELLED'),
	payment: payment,
}).min(1);

module.exports = { bookingCreate, bookingUpdate };
