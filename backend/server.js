const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectDB, disconnectDB } = require('./db');
const { router: routes } = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const prometheusRoutes = require('./routes/prometheusRoutes');
const responseTimeMetrics = require('./middleware/responseTimeMetrics');

const app = express();
const PORT = process.env.BACKEND_PORT;

// Middleware
app.use(responseTimeMetrics);
app.use(cors({
  origin: process.env.CORS_ORIGIN || `http://localhost:${process.env.FRONTEND_PORT}`,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('{{APP_URL_PREFIX}}/api', routes);
app.use('{{APP_URL_PREFIX}}/api/actuator', prometheusRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // For all other routes, serve the frontend app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Error handling
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app; // Export for testing
