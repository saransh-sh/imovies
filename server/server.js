require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allows Render, Vercel, and local Vite dev servers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'IMovies REST API',
    version: '1.0.0',
    aesthetic: 'Neo-Brutalist',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Database connection middleware for both persistent and serverless executions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please check MONGO_URI configuration.',
      error: err.message,
    });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err.message || err);

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: `Resource not found with specified identifier (${err.value})`,
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server if invoked directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🎬 [IMovies Server] Running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
