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
	
	// Create multiple airports
	const airports = await Airport.insertMany([
		{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', terminals: 6 },
		{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', terminals: 9 },
		{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', terminals: 4 },
		{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'USA', terminals: 8 },
		{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta', country: 'USA', terminals: 7 },
		{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle', country: 'USA', terminals: 3 },
		{ code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', terminals: 3 },
		{ code: 'BOS', name: 'Logan Intl', city: 'Boston', country: 'USA', terminals: 4 },
		{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas', country: 'USA', terminals: 5 },
		{ code: 'DEN', name: 'Denver Intl', city: 'Denver', country: 'USA', terminals: 3 },
	]);

	// Airlines and their codes
	const airlines = [
		{ name: 'American Airlines', code: 'AA' },
		{ name: 'Delta Air Lines', code: 'DL' },
		{ name: 'United Airlines', code: 'UA' },
		{ name: 'Southwest Airlines', code: 'SW' },
		{ name: 'JetBlue Airways', code: 'JB' },
		{ name: 'Alaska Airlines', code: 'AS' },
	];

	// Generate flights for different dates
	const flights = [];
	const now = Date.now();
	
	// Generate flights for today and next 7 days
	for (let day = 0; day < 7; day++) {
		const baseDate = now + (day * 24 * 3600 * 1000);
		
		// Create 3-5 flights per day
		for (let i = 0; i < 4; i++) {
			const origin = airports[i % airports.length];
			const destination = airports[(i + 3) % airports.length];
			const airline = airlines[i % airlines.length];
			
			// Vary departure times throughout the day
			const departureHour = 6 + (i * 3);
			const departureTime = new Date(baseDate + (departureHour * 3600 * 1000));
			// Typical flight duration based on route (simplified)
			const durationHours = 2 + (Math.abs(i % 4) / 2); // 2-4 hours
			const arrivalTime = new Date(departureTime.getTime() + (durationHours * 3600 * 1000));
			
			flights.push({
				flightNumber: `${airline.code}${100 + (day * 10) + i}`,
				airline: airline.name,
				origin: origin.code,
				destination: destination.code,
				departureTime,
				arrivalTime,
				seatClasses: [
					{ class: 'ECONOMY', totalSeats: 150, availableSeats: 150 - (i * 5), price: 79 + (i * 10) + (day * 5) },
					{ class: 'BUSINESS', totalSeats: 30, availableSeats: 30 - (i * 2), price: 300 + (i * 50) + (day * 20) },
					{ class: 'FIRST', totalSeats: 10, availableSeats: 10 - i, price: 800 + (i * 100) + (day * 50) },
				],
				status: 'SCHEDULED',
			});
		}
	}

	// Create all flights
	const createdFlights = await Flight.insertMany(flights);
	
	await Passenger.create({
		firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890',
	});
	
	const admin = await User.create({
		username: 'admin', email: 'admin@example.com', passwordHash: await bcrypt.hash('admin123', 10), roles: ['ADMIN']
	});
	
	console.log('Seeded:', { 
		airports: airports.length, 
		flights: createdFlights.length, 
		admin: admin.username 
	});
	await mongoose.connection.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
