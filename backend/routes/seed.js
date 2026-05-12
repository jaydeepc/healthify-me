const express = require('express');
const router = express.Router();
const { seedHealthMetrics, healthMetricsData } = require('../scripts/seedHealthMetrics');

// # AI: Start
// POST /api/seed/health-metrics - Seed health metrics data
router.post('/health-metrics', async (req, res) => {
  try {
    console.log('Starting health metrics seeding via API...');
    
    const { HealthMetric } = require('../models');
    
    // Clear existing metrics
    await HealthMetric.deleteMany({});
    console.log('Cleared existing health metrics');

    // Insert new metrics
    const insertedMetrics = await HealthMetric.insertMany(healthMetricsData);
    console.log(`Inserted ${insertedMetrics.length} health metrics`);

    // Log summary by category
    const categories = [...new Set(healthMetricsData.map(m => m.category))];
    const summary = {};
    categories.forEach(category => {
      const count = healthMetricsData.filter(m => m.category === category).length;
      summary[category] = count;
      console.log(`- ${category}: ${count} metrics`);
    });

    res.json({
      success: true,
      message: 'Health metrics seeded successfully',
      data: {
        totalMetrics: insertedMetrics.length,
        categorySummary: summary
      }
    });
  } catch (error) {
    console.error('Error seeding health metrics via API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed health metrics',
      error: error.message
    });
  }
});

// GET /api/seed/status - Check seeding status
router.get('/status', async (req, res) => {
  try {
    const { HealthMetric } = require('../models');
    const count = await HealthMetric.countDocuments();
    
    res.json({
      success: true,
      data: {
        healthMetricsCount: count,
        isSeeded: count > 0
      }
    });
  } catch (error) {
    console.error('Error checking seed status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check seed status',
      error: error.message
    });
  }
});
// # AI: End

module.exports = router;
