# Tech Stack

## DBMS Airline Management System

### **Frontend**

#### Core Framework & Libraries
- **React** `^19.2.0` - UI framework
- **React DOM** `^19.2.0` - React DOM renderer
- **React Router DOM** `^7.9.5` - Client-side routing
- **Vite** `^7.1.12` - Build tool and development server
- **Axios** `^1.13.1` - HTTP client for API requests

#### UI & Visualization
- **Leaflet** `^1.9.4` - Interactive maps
- **React Leaflet** `^5.0.0` - React components for Leaflet maps
- **Recharts** `^3.3.0` - Charting library for analytics visualization

#### Utilities
- **jsPDF** `^2.5.1` - PDF generation (for tickets, boarding passes)

#### Development Tools
- **ESLint** `^9.38.0` - Code linting
- **@vitejs/plugin-react** `^5.1.0` - Vite React plugin
- **TypeScript Types** - Type definitions for React

---

### **Backend**

#### Core Framework
- **Node.js** - Runtime environment
- **Express** `^5.1.0` - Web application framework

#### Database
- **MongoDB** `^6.20.0` - NoSQL database driver
- **Mongoose** `^8.19.2` - MongoDB object modeling (ODM)

#### Authentication & Security
- **JWT (JSON Web Token)** `^9.0.2` - Authentication tokens
- **bcrypt** `^6.0.0` - Password hashing
- **Helmet** `^8.1.0` - Security headers middleware
- **CORS** `^2.8.5` - Cross-Origin Resource Sharing

#### Validation & Data Handling
- **Joi** `^18.0.1` - Schema validation
- **dayjs** `^1.11.18` - Date manipulation library

#### Middleware & Utilities
- **Morgan** `^1.10.1` - HTTP request logger
- **express-rate-limit** `^8.2.0` - Rate limiting middleware
- **dotenv** `^17.2.3` - Environment variables management

#### API Documentation
- **Swagger UI Express** `^5.0.1` - API documentation interface

#### Development Tools
- **Nodemon** `^3.1.10` - Auto-restart server on file changes
- **Concurrently** `^9.0.1` - Run multiple commands simultaneously
- **ESLint** `^9.38.0` - Code linting

---

### **External APIs**
- **AviationStack API** - Real-time flight data, airline information, and flight status

---

### **Architecture**

#### Frontend Architecture
- **SPA (Single Page Application)** - React-based SPA
- **Component-Based** - React functional components with hooks
- **State Management** - React useState/useEffect hooks
- **Routing** - React Router for navigation
- **API Communication** - Axios interceptors for authentication

#### Backend Architecture
- **RESTful API** - REST API design principles
- **MVC Pattern** - Models, Views (Controllers), Routes separation
- **Middleware Chain** - Authentication, validation, error handling
- **Database Models** - Mongoose schemas with relationships

#### Project Structure
```
Backend:
├── src/
│   ├── controllers/    # Business logic
│   ├── models/        # Database schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware (auth, validation, RBAC)
│   ├── config/        # Configuration (database connection)
│   ├── validation/    # Joi validation schemas
│   ├── scripts/       # Utility scripts (seeding)
│   └── docs/          # API documentation

Frontend:
├── web/src/
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   ├── api.js         # API configuration
│   └── App.jsx        # Main app component
```

---

### **Key Features & Modules**

#### Core Features
1. **Flight Management** - Search, view, and book flights
2. **Booking System** - Create, view, cancel bookings with seat management
3. **Passenger Management** - Passenger profiles and information
4. **Check-In System** - Online check-in with seat assignment
5. **Baggage Tracking** - Register and track baggage with tracking numbers
6. **Notifications** - Real-time notifications for updates
7. **Reviews & Ratings** - Flight and airline reviews
8. **Special Services** - Wheelchair, meals, extra legroom requests
9. **Aircraft Management** - Aircraft tracking and maintenance
10. **Analytics Dashboard** - Revenue, flight stats, passenger demographics

#### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-Based Access Control (RBAC)
- Rate limiting
- Security headers (Helmet)
- CORS configuration
- Input validation (Joi)

---

### **Development Environment**
- **Language**: JavaScript (ES6+)
- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: ESLint
- **Development Server**: 
  - Backend: Port 3000
  - Frontend: Port 5173

---

### **Database Schema**
- **Users** - Authentication and user accounts
- **Passengers** - Passenger information
- **Flights** - Flight details and schedules
- **Bookings** - Booking records with payments
- **CheckIns** - Check-in records
- **Baggage** - Baggage tracking
- **Notifications** - User notifications
- **Reviews** - Flight reviews and ratings
- **SpecialServices** - Special service requests
- **Aircraft** - Aircraft information
- **Airports** - Airport data
- **Staff** - Staff management

---

### **Deployment**
- **Platform**: Render.com (mentioned in config)
- **Database**: MongoDB (local/cloud)

---

### **Scripts**
- `npm run dev` - Start both frontend and backend
- `npm run dev:api` - Start backend only
- `npm run dev:web` - Start frontend only
- `npm start` - Production start
- `npm run seed` - Seed database with sample data
- `npm run lint` - Lint code

