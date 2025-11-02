# Database Schema Diagram - Airline DBMS

## Mermaid ERD

This diagram can be rendered using Mermaid-compatible viewers (GitHub, GitLab, VS Code with Mermaid extension, mermaid.live).

```mermaid
erDiagram
    %% Core Entities
    AIRPORT {
        string code PK
        string name
        string city
        string country
        number terminals
        datetime createdAt
        datetime updatedAt
    }
    
    AIRCRAFT {
        string registration PK
        string type
        string airline
        object capacity
        enum status
        date lastMaintenance
        date nextMaintenance
        number mileage
        date firstFlight
        datetime createdAt
        datetime updatedAt
    }
    
    FLIGHT {
        objectId _id PK
        string flightNumber
        string airline
        string origin FK
        string destination FK
        datetime departureTime
        datetime arrivalTime
        array seatClasses
        enum status
        objectId aircraft FK
        string gate
        string terminal
        number delayMinutes
        datetime actualDepartureTime
        datetime actualArrivalTime
        array statusHistory
        datetime createdAt
        datetime updatedAt
    }
    
    %% User Entities
    PASSENGER {
        objectId _id PK
        string firstName
        string lastName
        string email
        string phone
        date dateOfBirth
        string passportNumber
        object frequentFlyer
        datetime createdAt
        datetime updatedAt
    }
    
    USER {
        objectId _id PK
        string username
        string email
        string passwordHash
        array roles
        objectId staff FK
        boolean active
        datetime createdAt
        datetime updatedAt
    }
    
    STAFF {
        objectId _id PK
        string employeeId
        string firstName
        string lastName
        string email
        enum role
        array assignedFlights
        boolean active
        datetime createdAt
        datetime updatedAt
    }
    
    %% Transaction Entities
    BOOKING {
        objectId _id PK
        string bookingId UK
        objectId flight FK
        objectId passenger FK
        enum seatClass
        string seatNumber
        number seatRow
        string seatLetter
        enum preferredSeatType
        enum status
        object payment
        date travelDate
        datetime createdAt
        datetime updatedAt
    }
    
    CHECK_IN {
        objectId _id PK
        objectId booking FK "unique"
        objectId passenger FK
        objectId flight FK
        datetime checkInTime
        string seatNumber
        string gate
        enum boardingGroup
        enum status
        boolean boardingPassGenerated
        datetime createdAt
        datetime updatedAt
    }
    
    BAGGAGE {
        objectId _id PK
        objectId booking FK
        objectId passenger FK
        objectId flight FK
        string trackingNumber UK
        enum type
        number weight
        number pieces
        enum status
        number fee
        string description
        datetime createdAt
        datetime updatedAt
    }
    
    %% Communication/Service Entities
    NOTIFICATION {
        objectId _id PK
        objectId user FK
        objectId passenger FK
        enum type
        string title
        string message
        objectId relatedBooking FK
        objectId relatedFlight FK
        boolean read
        boolean sentEmail
        boolean sentSMS
        datetime createdAt
        datetime updatedAt
    }
    
    REVIEW {
        objectId _id PK
        objectId booking FK "unique"
        objectId passenger FK
        objectId flight FK
        string airline
        number rating
        string title
        string comments
        object ratings
        boolean verified
        datetime createdAt
        datetime updatedAt
    }
    
    SPECIAL_SERVICE {
        objectId _id PK
        objectId booking FK
        objectId passenger FK
        objectId flight FK
        enum type
        string details
        enum status
        number fee
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    %% Relationships - Core
    AIRPORT ||--o{ FLIGHT : "origin"
    AIRPORT ||--o{ FLIGHT : "destination"
    AIRCRAFT ||--o{ FLIGHT : "assigned to"
    
    %% Relationships - User
    USER ||--o| STAFF : "linked to"
    PASSENGER ||--o{ BOOKING : "makes"
    PASSENGER ||--o{ CHECK_IN : "checks in"
    PASSENGER ||--o{ BAGGAGE : "registers"
    PASSENGER ||--o{ REVIEW : "writes"
    PASSENGER ||--o{ SPECIAL_SERVICE : "requests"
    PASSENGER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ NOTIFICATION : "receives"
    
    %% Relationships - Transactions
    FLIGHT ||--o{ BOOKING : "has"
    FLIGHT ||--o{ CHECK_IN : "has"
    FLIGHT ||--o{ BAGGAGE : "carries"
    FLIGHT ||--o{ REVIEW : "receives"
    FLIGHT ||--o{ SPECIAL_SERVICE : "provides"
    FLIGHT ||--o{ NOTIFICATION : "generates"
    
    BOOKING ||--o| CHECK_IN : "generates"
    BOOKING ||--o{ BAGGAGE : "includes"
    BOOKING ||--o| REVIEW : "receives"
    BOOKING ||--o{ SPECIAL_SERVICE : "includes"
    BOOKING ||--o{ NOTIFICATION : "generates"
    
    %% Many-to-Many Relationship
    STAFF ||--o{ FLIGHT : "assignedFlights"
    FLIGHT ||--o{ STAFF : "assignedStaff"
```

---

## Relationship Legend

### One-to-One (1:1)
- **CHECK_IN ↔ BOOKING**: One check-in per booking (Unique constraint)
- **REVIEW ↔ BOOKING**: One review per booking (Unique constraint)
- **USER ↔ STAFF**: Optional link (User may have staff record)

### One-to-Many (1:N)
- **AIRPORT → FLIGHT**: Origin/Destination references
- **AIRCRAFT → FLIGHT**: Aircraft assignment
- **PASSENGER → All transaction entities**: Multiple bookings, check-ins, baggage, etc.
- **USER → NOTIFICATION**: User notifications
- **FLIGHT → All dependent entities**: Bookings, check-ins, baggage, reviews, services
- **STAFF ↔ FLIGHT**: Many-to-many via array

### Cardinality Symbols
- `||--o{` = One to Many (0 or more)
- `||--||` = One to One
- `o{--o{` = Many to Many

---

## Key Design Patterns

### 1. String References vs ObjectId References
- **Airport codes**: String reference (origin, destination in Flight)
- **Other entities**: ObjectId reference for joins and population

### 2. Embedded Documents
- `payment{}` in Booking: Payment details
- `capacity{}` in Aircraft: Seat breakdown
- `frequentFlyer{}` in Passenger: Loyalty info
- `ratings{}` in Review: Detailed ratings
- `seatClasses[]` in Flight: Class configuration
- `statusHistory[]` in Flight: Status log

### 3. Many-to-Many Implementation
- **Flight ↔ Staff**: Implemented via `assignedFlights[]` array in Staff entity
- Alternative could be junction table

### 4. Auto-Generated Identifiers
- `bookingId`: Format "BKG-{12-char-hex}"
- `trackingNumber`: Format "BG-{8-char-random}"
- Generated via pre-save hooks in Mongoose

### 5. Index Strategy
- Compound indexes for common queries
- Indexes on foreign keys for joins
- Status-based indexes for filtering
- Date-based indexes for time-series queries

---

## Sample Data Flow

### Booking Flow
```
1. Passenger searches Flights
2. Selects Flight → Creates Booking
3. Booking confirms seat reservation
4. Passenger checks in (24h before flight)
5. CheckIn generates boarding pass
6. Baggage registered with tracking
7. Notification sent at each step
8. After flight, Review can be submitted
```

### Entity Dependencies
```
Flight (needs: Airport, Aircraft)
  ↓
Booking (needs: Flight, Passenger)
  ↓
CheckIn (needs: Booking, Passenger, Flight)
  ↓
Baggage, SpecialService (depend on Booking)
  ↓
Review (created after Flight)
  ↓
Notification (throughout process)
```

---

## Deployment Notes

This schema is designed for:
- **MongoDB** (NoSQL document database)
- **Mongoose ODM** (MongoDB object modeling)
- **Node.js/Express** backend
- **React** frontend

All relationships use MongoDB referencing (not embedding) for flexibility and normalization while maintaining the benefits of document storage for complex nested data (like arrays and objects).

