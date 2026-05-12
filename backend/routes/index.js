const express = require('express');
const router = express.Router();
const client = require('prom-client');
const { httpRequestDurationSeconds, httpRequestsTotal } = require('../prometheus-metrics/httpMetrics');

// Create a Registry
const register = new client.Registry();

// Add default labels to all metrics
register.setDefaultLabels({
  app_piramal_name: "health-tracker"
});

// Add default metrics (e.g., CPU, memory usage)
client.collectDefaultMetrics({
  register,
});

// Register HTTP metrics
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);


// Import route modules
const healthRoutes = require('./health');
// # AI: Start
const healthMetricsRoutes = require('./healthMetrics');
const seedRoutes = require('./seed');
// # AI: End

// Use route modules
router.use('/health', healthRoutes);
// # AI: Start
router.use('/health-metrics', healthMetricsRoutes);
router.use('/seed', seedRoutes);
// # AI: End

// Add more routes as needed
// Example: router.use('/users', require('./users'));
// Example: router.use('/auth', require('./auth'));

module.exports = {
  router,
  register,
  httpRequestDurationSeconds,
  httpRequestsTotal,
};
