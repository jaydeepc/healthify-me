// AI: Start
// Vercel serverless function entry point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('../backend/db');
const { router: routes } = require('../backend/routes');
const { notFound, errorHandler } = require('../backend/middleware/errorHandler');
const prometheusRoutes = require('../backend/routes/prometheusRoutes');
const responseTimeMetrics = require('../backend/middleware/responseTimeMetrics');

const app = express();

// Middleware
app.use(responseTimeMetrics);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api', routes);
app.use('/api/actuator', prometheusRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to DB on cold start
let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  
  return app(req, res);
};

module.exports = handler;
// AI: End
