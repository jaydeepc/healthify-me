const express = require('express');
const { register } = require('./index');

const router = express.Router();

// Prometheus metrics endpoint - returns metrics in Prometheus exposition format
router.get('/prometheus', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Metrics names endpoint - returns JSON with list of metric names
router.get('/metrics', async (req, res) => {
  try {
    // Get metrics as JSON to extract names
    const metricsAsJson = await register.getMetricsAsJSON();
    
    // Extract metric names from the metrics JSON
    const metricNames = metricsAsJson.map(metric => metric.name);
    
    // Return the metric names in the required format
    res.json({ names: metricNames });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
