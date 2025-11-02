# Database Schema Diagram Prompt for Airline DBMS

This document provides complete specifications for creating a comprehensive Entity-Relationship Diagram (ERD) for the Airline Database Management System.

---

## Purpose
Create a visual ERD using any database diagramming tool (Lucidchart, dbdiagram.io, draw.io, Miro, etc.) that illustrates all entities, their attributes, relationships, and constraints.

---

## Entities Overview (12 Total)

1. **AIRPORT** - Airport information
2. **AIRCRAFT** - Aircraft fleet management
3. **FLIGHT** - Flight schedules and status
4. **PASSENGER** - Passenger profiles
5. **USER** - Authentication and user accounts
6. **STAFF** - Staff and crew management
7. **BOOKING** - Flight bookings
8. **CHECK_IN** - Check-in records
9. **BAGGAGE** - Baggage tracking
10. **NOTIFICATION** - User notifications
11. **REVIEW** - Flight reviews and ratings
12. **SPECIAL_SERVICE** - Special service requests

---

## Detailed Entity Specifications

### 1. AIRPORT
```
Entity: AIRPORT
Primary Key: code (String)
Attributes:
  - code (String, PK, Unique, Uppercase, Required) → "JFK", "LAX", etc.
  - name (String, Required)
  - city (String, Required)
  - country (String, Required)
  - terminals (Number, Default: 1, Min: 1)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - code must be unique
  - code must be uppercase
  
Indexes: code
```

### 2. AIRCRAFT
```
Entity: AIRCRAFT
Primary Key: registration (String)
Attributes:
  - registration (String, PK, Unique) → "N12345"
  - type (String, Required) → "Boeing 737-800", "Airbus A320"
  - airline (String, Required, Index) → "American Airlines"
  - capacity {} (Object, Required):
    * economy (Number, Default: 0, Min: 0)
    * business (Number, Default: 0, Min: 0)
    * first (Number, Default: 0, Min: 0)
  - status (Enum, Default: 'ACTIVE') → [ACTIVE, MAINTENANCE, INACTIVE, RETIRED]
  - lastMaintenance (Date)
  - nextMaintenance (Date)
  - mileage (Number, Default: 0)
  - firstFlight (Date)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - registration must be unique
  
Indexes: (airline, status), (status)
```

### 3. FLIGHT
```
Entity: FLIGHT
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - origin → Airport.code (String reference)
  - destination → Airport.code (String reference)
  - aircraft → Aircraft._id (ObjectId)

Attributes:
  - _id (ObjectId, PK, Auto)
  - flightNumber (String, Required, Uppercase, Index) → "AA100"
  - airline (String, Required, Index)
  - origin (String, FK, Required, Uppercase) → references Airport.code
  - destination (String, FK, Required, Uppercase) → references Airport.code
  - departureTime (Date, Required, Index)
  - arrivalTime (Date, Required)
  - seatClasses[] (Array of Objects, Required):
    * class (Enum) → [ECONOMY, BUSINESS, FIRST]
    * totalSeats (Number, Required, Min: 0)
    * availableSeats (Number, Required, Min: 0)
    * price (Number, Required, Min: 0)
  - status (Enum, Default: 'SCHEDULED') → [SCHEDULED, DELAYED, CANCELLED, COMPLETED, BOARDING, IN_FLIGHT, ARRIVED]
  - aircraft (ObjectId, FK) → references Aircraft._id
  - gate (String)
  - terminal (String)
  - delayMinutes (Number, Default: 0)
  - actualDepartureTime (Date)
  - actualArrivalTime (Date)
  - statusHistory[] (Array of Objects):
    * status (String)
    * timestamp (Date, Default: now)
    * reason (String)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - flightNumber must be uppercase
  
Indexes: (origin, destination, departureTime), flightNumber, airline
```

### 4. PASSENGER
```
Entity: PASSENGER
Primary Key: _id (ObjectId, Auto)

Attributes:
  - _id (ObjectId, PK, Auto)
  - firstName (String, Required)
  - lastName (String, Required)
  - email (String, Required, Unique, Lowercase)
  - phone (String)
  - dateOfBirth (Date)
  - passportNumber (String, Index)
  - frequentFlyer {} (Object, Optional):
    * program (String) → "AAdvantage", "Skymiles"
    * number (String)
    * status (Enum, Default: 'NONE') → [NONE, SILVER, GOLD, PLATINUM]
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - email must be unique
  - email must be lowercase
  
Indexes: email (unique), passportNumber
```

### 5. USER
```
Entity: USER
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - staff → Staff._id (Optional)

Attributes:
  - _id (ObjectId, PK, Auto)
  - username (String, Required, Unique)
  - email (String, Required, Unique, Lowercase)
  - passwordHash (String, Required) → bcrypt hashed
  - roles[] (Array of Enums, Default: ['USER']) → [ADMIN, STAFF, USER]
  - staff (ObjectId, FK, Optional) → references Staff._id
  - active (Boolean, Default: true)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - username must be unique
  - email must be unique and lowercase

Methods:
  - comparePassword(password) → boolean
  
Indexes: username (unique), email (unique), staff
```

### 6. STAFF
```
Entity: STAFF
Primary Key: _id (ObjectId, Auto)

Attributes:
  - _id (ObjectId, PK, Auto)
  - employeeId (String, Required, Unique)
  - firstName (String, Required)
  - lastName (String, Required)
  - email (String, Required, Unique, Lowercase)
  - role (Enum, Required) → [PILOT, CREW, GROUND, ADMIN]
  - assignedFlights[] (Array of ObjectId) → references Flight._id (Many-to-Many)
  - active (Boolean, Default: true)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - employeeId must be unique
  - email must be unique and lowercase
  
Indexes: employeeId (unique), email (unique)
```

### 7. BOOKING
```
Entity: BOOKING
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - flight → Flight._id (Required)
  - passenger → Passenger._id (Required)

Attributes:
  - _id (ObjectId, PK, Auto)
  - bookingId (String, Unique, Index, Auto-generated) → "BKG-A1B2C3D4E5F6"
  - flight (ObjectId, FK, Required, Index) → references Flight._id
  - passenger (ObjectId, FK, Required, Index) → references Passenger._id
  - seatClass (Enum, Required) → [ECONOMY, BUSINESS, FIRST]
  - seatNumber (String)
  - seatRow (Number)
  - seatLetter (String, Uppercase)
  - preferredSeatType (Enum) → [WINDOW, AISLE, MIDDLE]
  - status (Enum, Default: 'CONFIRMED') → [CONFIRMED, CANCELLED]
  - payment {} (Object, Required):
    * amount (Number, Required, Min: 0)
    * currency (String, Default: 'USD')
    * status (Enum, Default: 'PENDING') → [PENDING, PAID, REFUNDED]
    * method (Enum, Default: 'CARD') → [CARD, CASH, WALLET, OTHER]
    * transactionId (String)
    * createdAt (Timestamp, Auto)
    * updatedAt (Timestamp, Auto)
  - travelDate (Date, Required, Index)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - bookingId must be unique
  - Auto-generated format: "BKG-{12-char-hex}"
  
Pre-save hooks:
  - Auto-generate bookingId if not provided
  - Uppercase seatLetter
  
Indexes: bookingId (unique), flight, passenger, travelDate
```

### 8. CHECK_IN
```
Entity: CHECK_IN
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - booking → Booking._id (Required, UNIQUE) → One-to-One
  - passenger → Passenger._id (Required)
  - flight → Flight._id (Required)

Attributes:
  - _id (ObjectId, PK, Auto)
  - booking (ObjectId, FK, Required, Unique, Index) → references Booking._id
  - passenger (ObjectId, FK, Required) → references Passenger._id
  - flight (ObjectId, FK, Required) → references Flight._id
  - checkInTime (Date, Default: now)
  - seatNumber (String)
  - gate (String)
  - boardingGroup (Enum, Default: 'C') → [A, B, C, D]
  - status (Enum, Default: 'CHECKED_IN') → [CHECKED_IN, BOARDED, NO_SHOW]
  - boardingPassGenerated (Boolean, Default: false)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - booking must be unique (One check-in per booking)
  
Indexes: booking (unique), (flight, checkInTime), passenger
```

### 9. BAGGAGE
```
Entity: BAGGAGE
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - booking → Booking._id (Required)
  - passenger → Passenger._id (Required)
  - flight → Flight._id (Required)

Attributes:
  - _id (ObjectId, PK, Auto)
  - booking (ObjectId, FK, Required, Index) → references Booking._id
  - passenger (ObjectId, FK, Required) → references Passenger._id
  - flight (ObjectId, FK, Required) → references Flight._id
  - trackingNumber (String, Unique, Index, Auto-generated) → "BG-ABC12345"
  - type (Enum, Required) → [CARRY_ON, CHECKED]
  - weight (Number, Required, Min: 0) → in kg
  - pieces (Number, Default: 1, Min: 1)
  - status (Enum, Default: 'CHECKED') → [CHECKED, LOADED, IN_TRANSIT, ARRIVED, DELAYED, LOST]
  - fee (Number, Default: 0, Min: 0)
  - description (String)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - trackingNumber must be unique
  - Auto-generated format: "BG-{8-char-random}"
  
Pre-save hooks:
  - Auto-generate trackingNumber if not provided
  
Indexes: trackingNumber (unique), booking, (flight, status), passenger
```

### 10. NOTIFICATION
```
Entity: NOTIFICATION
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - user → User._id (Optional)
  - passenger → Passenger._id (Optional)
  - relatedBooking → Booking._id (Optional)
  - relatedFlight → Flight._id (Optional)

Attributes:
  - _id (ObjectId, PK, Auto)
  - user (ObjectId, FK, Index, Optional) → references User._id
  - passenger (ObjectId, FK, Index) → references Passenger._id
  - type (Enum, Required) → [BOOKING_CONFIRMED, FLIGHT_REMINDER, CHECK_IN_AVAILABLE, 
                              FLIGHT_DELAYED, FLIGHT_CANCELLED, GATE_CHANGE, BOARDING, 
                              BAGGAGE_UPDATE, PROMOTION]
  - title (String, Required)
  - message (String, Required)
  - relatedBooking (ObjectId, FK) → references Booking._id
  - relatedFlight (ObjectId, FK) → references Flight._id
  - read (Boolean, Default: false)
  - sentEmail (Boolean, Default: false)
  - sentSMS (Boolean, Default: false)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Indexes: (user, read, createdAt), (passenger, read), (type, createdAt)
```

### 11. REVIEW
```
Entity: REVIEW
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - booking → Booking._id (Required, UNIQUE) → One-to-One
  - passenger → Passenger._id (Required)
  - flight → Flight._id (Required)

Attributes:
  - _id (ObjectId, PK, Auto)
  - booking (ObjectId, FK, Required, Unique, Index) → references Booking._id
  - passenger (ObjectId, FK, Required) → references Passenger._id
  - flight (ObjectId, FK, Required) → references Flight._id
  - airline (String, Required)
  - rating (Number, Required, Min: 1, Max: 5)
  - title (String)
  - comments (String)
  - ratings {} (Object):
    * punctuality (Number, Min: 1, Max: 5)
    * service (Number, Min: 1, Max: 5)
    * comfort (Number, Min: 1, Max: 5)
    * value (Number, Min: 1, Max: 5)
  - verified (Boolean, Default: false)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Constraints:
  - booking must be unique (One review per booking)
  - All ratings must be between 1-5
  
Indexes: booking (unique), (flight, rating), (airline, rating), passenger
```

### 12. SPECIAL_SERVICE
```
Entity: SPECIAL_SERVICE
Primary Key: _id (ObjectId, Auto)
Foreign Keys:
  - booking → Booking._id (Required)
  - passenger → Passenger._id (Required)
  - flight → Flight._id (Required)

Attributes:
  - _id (ObjectId, PK, Auto)
  - booking (ObjectId, FK, Required, Index) → references Booking._id
  - passenger (ObjectId, FK, Required) → references Passenger._id
  - flight (ObjectId, FK, Required) → references Flight._id
  - type (Enum, Required) → [WHEELCHAIR, SPECIAL_MEAL, EXTRA_LEGROOM, PET_TRAVEL, 
                              UNACCOMPANIED_MINOR, BASSINET, MEDICAL_ASSISTANCE, 
                              DIETARY_RESTRICTION, OTHER]
  - details (String)
  - status (Enum, Default: 'REQUESTED') → [REQUESTED, CONFIRMED, FULFILLED, CANCELLED]
  - fee (Number, Default: 0, Min: 0)
  - notes (String)
  - createdAt (Timestamp, Auto)
  - updatedAt (Timestamp, Auto)

Indexes: (booking, type), (flight, status)
```

---

## Relationships & Cardinality

### One-to-One (1:1)
1. **CheckIn ↔ Booking** (One check-in per booking - Unique on booking FK)
2. **Review ↔ Booking** (One review per booking - Unique on booking FK)
3. **User ↔ Staff** (Optional - User may have staff record)

### One-to-Many (1:N)
1. **Airport → Flight** (Origin/Destination references)
   - One airport can be origin for many flights
   - One airport can be destination for many flights
2. **Aircraft → Flight** (One aircraft assigned to many flights)
3. **Passenger → Booking** (One passenger can have many bookings)
4. **Passenger → CheckIn** (One passenger can have many check-ins)
5. **Passenger → Baggage** (One passenger can register many baggage items)
6. **Passenger → Notification** (One passenger can receive many notifications)
7. **Passenger → Review** (One passenger can write many reviews)
8. **Passenger → SpecialService** (One passenger can request many services)
9. **User → Notification** (One user can receive many notifications)
10. **Flight → Booking** (One flight can have many bookings)
11. **Flight → CheckIn** (One flight can have many check-ins)
12. **Flight → Baggage** (One flight can carry many baggage items)
13. **Flight → Notification** (One flight can generate many notifications)
14. **Flight → Review** (One flight can have many reviews)
15. **Flight → SpecialService** (One flight can have many service requests)
16. **Booking → Notification** (One booking can generate many notifications)
17. **Booking → SpecialService** (One booking can have many service requests)

### Many-to-Many (M:N)
1. **Flight ↔ Staff** (Multiple staff assigned to multiple flights)
   - Implemented via array: `assignedFlights[]` in Staff entity
   - One staff member can be assigned to many flights
   - One flight can have many staff members

---

## Foreign Key Mappings

```
AIRPORT (code)
    ↓
FLIGHT (origin, destination)
    ↓
BOOKING (flight → Flight._id)
    ↓
CHECK_IN, BAGGAGE, SPECIAL_SERVICE (booking → Booking._id)

FLIGHT (aircraft → Aircraft._id)

PASSENGER (_id)
    ↓
BOOKING (passenger → Passenger._id)
    ↓
CHECK_IN, BAGGAGE, REVIEW, SPECIAL_SERVICE (passenger → Passenger._id)

NOTIFICATION (passenger → Passenger._id)
NOTIFICATION (user → User._id)
NOTIFICATION (relatedBooking → Booking._id)
NOTIFICATION (relatedFlight → Flight._id)

USER (staff → Staff._id)
STAFF (assignedFlights[] → Flight._id[])
```

---

## Diagram Visualization Requirements

### Visual Style
- Use standard ERD notation (Crow's foot or Chen notation)
- Show all entities as rectangular boxes
- List attributes within each entity
- Use different colors/shading for entity categories:
  * **Blue**: Core entities (Airport, Aircraft, Flight)
  * **Green**: User entities (User, Passenger, Staff)
  * **Orange**: Transaction entities (Booking, CheckIn, Baggage)
  * **Purple**: Communication entities (Notification, Review)
  * **Pink**: Service entities (SpecialService)

### Cardinality Notation
- **1** = One
- **M/N** = Many
- Show on both ends: 1:1, 1:N, M:N
- Use crow's feet for "many" relationships

### Attribute Display
- **PK** (Primary Key): Underline or bold or use {PK} tag
- **FK** (Foreign Key): Use {FK} tag or italicize
- **UK** (Unique): Use {U} tag
- **Index**: Use {IX} tag
- **Required**: Mark with asterisk (*) or bold
- **Optional**: Leave unmarked or mark with (O)
- Show data types: String, Number, Date, ObjectId, etc.
- Display enum values in dropdown format or parentheses

### Special Elements
- **Embedded Documents**: Show as nested objects (e.g., payment{}, capacity{})
- **Auto-generated**: Mark with {AUTO} tag
- **Timestamps**: Show as created/updated fields
- **Arrays**: Show with [] notation

---

## Recommended Tools

### Online Diagramming Tools
1. **dbdiagram.io** - Best for database schemas, supports MongoDB
2. **Lucidchart** - Comprehensive ERD features
3. **draw.io (diagrams.net)** - Free, versatile
4. **Miro** - Collaborative, good templates
5. **Creately** - ERD templates
6. **SQLDBM** - MongoDB support

### Code-Based Options
1. **Mermaid** - Text-to-diagram
2. **PlantUML** - UML diagrams from text
3. **Graphviz** - Graph visualization from code

---

## Sample Textual Relationship Map

```
┌──────────┐
│ AIRPORT  │
└─────┬────┘
      │ (1:N - origin)
      │
┌─────▼─────────────────────────────────┐
│           FLIGHT                      │
│  ──────────────────────────────────   │
│  flightNumber, airline                │
│  departureTime, arrivalTime          │
│  seatClasses[], status               │
│  gate, terminal, delayMinutes        │
│  statusHistory[]                     │
└─────┬─────────────────────────────────┘
      │ (1:N - flight)
      │
┌─────▼────┐        ┌──────────────┐
│ BOOKING  │        │   AIRCRAFT   │
│───────── │        └──────┬───────┘
│ bookingId│               │ (1:N - aircraft)
│ seatClass│               │
│ payment{}│               │
└─────┬────┘               │
      │                    │
      │ (1:1)              │
      │                    │
┌─────▼────┐               │
│ CHECK_IN │               │
│───────── │               │
│ seatNum  │◄──────────────┘
│ gate     │
│ boarding │
│ group    │
└──────────┘

┌────────────┐
│ PASSENGER  │
└─────┬──────┘
      │
      ├─────────► BOOKING (1:N)
      │
      ├─────────► BAGGAGE (1:N)
      │
      ├─────────► CHECK_IN (1:N)
      │
      ├─────────► REVIEW (1:N)
      │
      ├─────────► SPECIAL_SERVICE (1:N)
      │
      └─────────► NOTIFICATION (1:N)

┌────────┐        ┌──────────┐
│  USER  │◄──────►│  STAFF   │
└────┬───┘ (1:1) └─────┬─────┘
     │                 │
     │ (1:N)           │ (M:N)
     │                 │ assignedFlights[]
     ▼                 ▼
NOTIFICATION       FLIGHT
```

---

## Validation Rules Summary

### Format Rules
- Email: Must be lowercase
- Uppercase: flightNumber, origin, destination, airport codes, seatLetter
- Auto-generated: bookingId (BKG-{hex}), trackingNumber (BG-{random})

### Range Constraints
- Ratings: 1-5 (all rating fields)
- Non-negative: weight (≥0), capacity (≥0), mileage (≥0), fee (≥0)
- Date logic: nextMaintenance > lastMaintenance

### Uniqueness
- Airport: code
- User: username, email
- Passenger: email
- Staff: employeeId, email
- Aircraft: registration
- Booking: bookingId
- Baggage: trackingNumber
- Booking→CheckIn: 1:1 (unique booking)
- Booking→Review: 1:1 (unique booking)

---

## Index Strategy

### Performance Optimization Indexes
1. **Flight**: (origin, destination, departureTime) - Route search
2. **Flight**: flightNumber, airline, (airline, status)
3. **Booking**: bookingId, flight, passenger, travelDate
4. **CheckIn**: booking, (flight, checkInTime), passenger
5. **Baggage**: trackingNumber, (flight, status), passenger
6. **Notification**: (user, read, createdAt), (passenger, read), (type, createdAt)
7. **Review**: (flight, rating), (airline, rating), passenger
8. **Aircraft**: (airline, status), status
9. **SpecialService**: (booking, type), (flight, status)

All indexes optimized for common query patterns.

---

## ERD Completion Checklist

- [ ] All 12 entities represented
- [ ] All attributes listed with data types
- [ ] Primary keys clearly marked
- [ ] Foreign keys clearly marked
- [ ] Unique constraints shown
- [ ] All relationships drawn with correct cardinality
- [ ] Crow's foot notation used consistently
- [ ] Embedded documents shown appropriately
- [ ] Indexes marked
- [ ] Enum values displayed
- [ ] Auto-generated fields marked
- [ ] Timestamps included
- [ ] Color coding by entity type
- [ ] Title and legend included
- [ ] Clean, readable layout

---

**End of Schema Diagram Prompt**

Use this specification to create a professional, comprehensive ERD for the Airline Database Management System. The diagram should clearly communicate the database structure, relationships, and constraints to stakeholders, developers, and database administrators.

