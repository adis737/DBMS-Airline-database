require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { connectToDatabase } = require('../config/db');
const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const Passenger = require('../models/Passenger');
const User = require('../models/User');

async function seed() {
	const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adbms';
	await connectToDatabase(uri);
	await Promise.all([
		Airport.deleteMany({}),
		Flight.deleteMany({}),
		Passenger.deleteMany({}),
		User.deleteMany({}),
	]);
	const [jfk, lax] = await Airport.insertMany([
		{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', terminals: 6 },
		{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', terminals: 9 },
	]);
	const flight = await Flight.create({
		flightNumber: 'AA100',
		airline: 'American Airlines',
		origin: jfk.code,
		destination: lax.code,
		departureTime: new Date(Date.now() + 24 * 3600 * 1000),
		arrivalTime: new Date(Date.now() + 30 * 3600 * 1000),
		seatClasses: [
			{ class: 'ECONOMY', totalSeats: 150, availableSeats: 150, price: 200 },
			{ class: 'BUSINESS', totalSeats: 30, availableSeats: 30, price: 800 },
		],
	});
	await Passenger.create({
		firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890',
	});
	const admin = await User.create({
		username: 'admin', email: 'admin@example.com', passwordHash: await bcrypt.hash('admin123', 10), roles: ['ADMIN']
	});
	console.log('Seeded:', { airports: [jfk.code, lax.code], flight: flight.flightNumber, admin: admin.username });
	await mongoose.connection.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
