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
- Flights: `/api/flights`
- Passengers: `/api/passengers`
- Bookings: `/api/bookings`
- Staff: `/api/staff`
- Analytics: `/api/analytics`

## Booking Flow
- Create booking reserves a seat in selected class if available
- Cancel booking refunds payment status and returns seat to inventory

## Analytics
- GET `/api/analytics/flights-per-route`
- GET `/api/analytics/most-booked-flights`
- GET `/api/analytics/revenue`
- GET `/api/analytics/frequent-flyers`

## Seeding
```bash
npm run seed
```
Creates sample airports, a flight, a passenger, and an admin user.
