# Airline Database Management System (ADBMS)

MongoDB + Express backend to manage flights, passengers, bookings, airports, staff, with validation, security, analytics, and optional RBAC.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment (create `.env`):

```
MONGO_URI=mongodb://127.0.0.1:27017/adbms
PORT=3000
JWT_SECRET=replace-with-a-strong-secret
AVIATIONSTACK_API_KEY=4b816d4f45de4e02b9be7e792e9e35cc
```

3. Start the server:

```bash
npm run dev
```

4. Health check: GET http://localhost:3000/health

## Auth
- POST `/api/auth/register` { username, email, password, roles? }
- POST `/api/auth/login` { username, password } -> { token }

Include `Authorization: Bearer <token>` for protected endpoints.

## Core Entities
- Airports: `/api/airports`
- Flights: `/api/flights` (includes real-time flight data from AviationStack)
- Passengers: `/api/passengers`
- Bookings: `/api/bookings`
- Staff: `/api/staff`
- Analytics: `/api/analytics`
- Check-In: `/api/checkin`
- Baggage: `/api/baggage`
- Notifications: `/api/notifications`
- Reviews: `/api/reviews`
- Special Services: `/api/special-services`
- Aircraft: `/api/aircraft`

## Booking Flow
- Create booking reserves a seat in selected class if available
- Cancel booking refunds payment status and returns seat to inventory

## Analytics
- GET `/api/analytics/flights-per-route`
- GET `/api/analytics/most-booked-flights`
- GET `/api/analytics/revenue`
- GET `/api/analytics/revenue-by-date?startDate=...&endDate=...`
- GET `/api/analytics/frequent-flyers`
- GET `/api/analytics/seat-occupancy`
- GET `/api/analytics/average-rating`
- GET `/api/analytics/checkin-stats`
- GET `/api/analytics/baggage-stats`
- GET `/api/analytics/passenger-demographics`

## New Features
- **Check-In System**: Online check-in 24 hours before flight with automatic seat assignment
- **Baggage Tracking**: Register and track baggage with tracking numbers
- **Notifications**: Real-time notifications for flight updates, check-in reminders, etc.
- **Reviews & Ratings**: Passengers can review flights and airlines
- **Special Services**: Request wheelchair, special meals, extra legroom, etc.
- **Aircraft Management**: Track aircraft, maintenance, and utilization
- **Enhanced Flight Status**: Track delays, gate changes, status history
- **Live Flight Map**: Real-time flight positions on interactive map

## Seeding
```bash
npm run seed
```
Creates 10 major US airports, 28 real flights across multiple airlines for the next 7 days, a sample passenger, and an admin user.
