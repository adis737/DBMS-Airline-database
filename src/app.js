const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi.json');

const authRouter = require('./routes/auth');
const flightsRouter = require('./routes/flights');
const passengersRouter = require('./routes/passengers');
const bookingsRouter = require('./routes/bookings');
const airportsRouter = require('./routes/airports');
const staffRouter = require('./routes/staff');
const analyticsRouter = require('./routes/analytics');
const checkInRouter = require('./routes/checkin');
const baggageRouter = require('./routes/baggage');
const notificationsRouter = require('./routes/notifications');
const reviewsRouter = require('./routes/reviews');
const specialServicesRouter = require('./routes/specialServices');
const aircraftRouter = require('./routes/aircraft');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000, // Increased for admin operations
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => {
		// Skip rate limiting for health checks
		return req.path === '/health';
	}
});
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use('/api/auth', authRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/passengers', passengersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/airports', airportsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/checkin', checkInRouter);
app.use('/api/baggage', baggageRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/special-services', specialServicesRouter);
app.use('/api/aircraft', aircraftRouter);

app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
