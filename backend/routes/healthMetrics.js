const express = require('express');
const router = express.Router();
const { HealthMetric, HealthEntry, UserGoals, UserPreferences } = require('../models');

// # AI: Start
// GET /api/health-metrics - Get all available metrics with benchmarks
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all health metrics');
    const metrics = await HealthMetric.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health metrics',
      error: error.message
    });
  }
});

// POST /api/health-metrics/entries - Add new health data entry
router.post('/entries', async (req, res) => {
  try {
    const { userId, metricId, value, timestamp, notes } = req.body;
    
    console.log('Adding health entry:', { userId, metricId, value });
    
    // Validate required fields
    if (!userId || !metricId || value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, metricId, and value are required'
      });
    }

    // Verify metric exists
    const metric = await HealthMetric.findOne({ metricId, isActive: true });
    if (!metric) {
      return res.status(404).json({
        success: false,
        message: 'Health metric not found'
      });
    }

    // Create new entry
    const entry = new HealthEntry({
      userId,
      metricId,
      value: parseFloat(value),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      notes: notes || ''
    });

    await entry.save();
    
    res.status(201).json({
      success: true,
      data: entry,
      message: 'Health entry added successfully'
    });
  } catch (error) {
    console.error('Error adding health entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add health entry',
      error: error.message
    });
  }
});

// GET /api/health-metrics/entries/:userId - Get user's latest values for all metrics
router.get('/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching latest entries for user:', userId);
    
    // Get all active metrics
    const metrics = await HealthMetric.find({ isActive: true });
    
    // Get latest entry for each metric
    const latestEntries = await Promise.all(
      metrics.map(async (metric) => {
        const latestEntry = await HealthEntry
          .findOne({ userId, metricId: metric.metricId })
          .sort({ timestamp: -1 });
        
        return {
          metric,
          latestEntry,
          hasData: !!latestEntry
        };
      })
    );
    
    res.json({
      success: true,
      data: latestEntries
    });
  } catch (error) {
    console.error('Error fetching user entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user entries',
      error: error.message
    });
  }
});

// GET /api/health-metrics/entries/:userId/:metricId/history - Get historical data for specific metric
router.get('/entries/:userId/:metricId/history', async (req, res) => {
  try {
    const { userId, metricId } = req.params;
    const { limit = 30, days = 90 } = req.query;
    
    console.log('Fetching history for user:', userId, 'metric:', metricId);
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const entries = await HealthEntry
      .find({
        userId,
        metricId,
        timestamp: { $gte: startDate }
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    // Get metric info
    const metric = await HealthMetric.findOne({ metricId });
    
    res.json({
      success: true,
      data: {
        metric,
        entries: entries.reverse(), // Return in chronological order
        totalCount: entries.length
      }
    });
  } catch (error) {
    console.error('Error fetching metric history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metric history',
      error: error.message
    });
  }
});

// POST /api/health-metrics/goals - Set/update personal goals
router.post('/goals', async (req, res) => {
  try {
    const { userId, metricId, targetValue, targetDate, notes } = req.body;
    
    console.log('Setting goal for user:', userId, 'metric:', metricId);
    
    // Validate required fields
    if (!userId || !metricId || targetValue === undefined || targetValue === null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, metricId, and targetValue are required'
      });
    }

    // Verify metric exists
    const metric = await HealthMetric.findOne({ metricId, isActive: true });
    if (!metric) {
      return res.status(404).json({
        success: false,
        message: 'Health metric not found'
      });
    }

    // Deactivate existing active goal for this metric
    await UserGoals.updateMany(
      { userId, metricId, isActive: true },
      { isActive: false }
    );

    // Create new goal
    const goal = new UserGoals({
      userId,
      metricId,
      targetValue: parseFloat(targetValue),
      targetDate: targetDate ? new Date(targetDate) : null,
      notes: notes || ''
    });

    await goal.save();
    
    res.status(201).json({
      success: true,
      data: goal,
      message: 'Goal set successfully'
    });
  } catch (error) {
    console.error('Error setting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set goal',
      error: error.message
    });
  }
});

// GET /api/health-metrics/goals/:userId - Get user's active goals
router.get('/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching goals for user:', userId);
    
    const goals = await UserGoals.find({ userId, isActive: true }).sort({ setDate: -1 });
    
    // Get metric info for each goal
    const goalsWithMetrics = await Promise.all(
      goals.map(async (goal) => {
        const metric = await HealthMetric.findOne({ metricId: goal.metricId });
        return {
          ...goal.toObject(),
          metric
        };
      })
    );
    
    res.json({
      success: true,
      data: goalsWithMetrics
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
});

// GET /api/health-metrics/dashboard/:userId - Get dashboard summary data
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching dashboard data for user:', userId);
    
    // Get user preferences for metric ordering
    const userPrefs = await UserPreferences.findOne({ userId });
    
    // Get all metrics with latest entries and goals
    const metrics = await HealthMetric.find({ isActive: true }).sort({ category: 1, name: 1 });
    
    const dashboardData = await Promise.all(
      metrics.map(async (metric) => {
        // Get latest entry
        const latestEntry = await HealthEntry
          .findOne({ userId, metricId: metric.metricId })
          .sort({ timestamp: -1 });
        
        // Get active goal
        const activeGoal = await UserGoals
          .findOne({ userId, metricId: metric.metricId, isActive: true });
        
        // Get all entries for this metric (for trend visualization)
        const entries = await HealthEntry
          .find({ userId, metricId: metric.metricId })
          .sort({ timestamp: 1 }); // Chronological order
        
        return {
          metric,
          latestEntry,
          activeGoal,
          entries: entries, // All entries for trend visualization
          hasData: !!latestEntry
        };
      })
    );
    
    // Apply user's custom ordering if available
    let orderedData = dashboardData;
    if (userPrefs && userPrefs.metricOrder && userPrefs.metricOrder.length > 0) {
      const orderMap = new Map(userPrefs.metricOrder.map(item => [item.metricId, item.position]));
      orderedData = dashboardData.sort((a, b) => {
        const posA = orderMap.get(a.metric.metricId) ?? 999;
        const posB = orderMap.get(b.metric.metricId) ?? 999;
        return posA - posB;
      });
    }
    
    // Group by category
    const categorizedData = orderedData.reduce((acc, item) => {
      const category = item.metric.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        byCategory: categorizedData,
        allMetrics: orderedData,
        userPreferences: userPrefs
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// POST /api/health-metrics/preferences/:userId - Save user preferences
router.post('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { metricOrder, preferences } = req.body;
    
    console.log('Saving preferences for user:', userId);
    
    // Update or create user preferences
    const userPrefs = await UserPreferences.findOneAndUpdate(
      { userId },
      {
        userId,
        metricOrder: metricOrder || [],
        preferences: preferences || {}
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      data: userPrefs,
      message: 'Preferences saved successfully'
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save preferences',
      error: error.message
    });
  }
});

// GET /api/health-metrics/preferences/:userId - Get user preferences
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching preferences for user:', userId);
    
    const userPrefs = await UserPreferences.findOne({ userId });
    
    res.json({
      success: true,
      data: userPrefs || { userId, metricOrder: [], preferences: {} }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences',
      error: error.message
    });
  }
});

// PUT /api/health-metrics/entries/:entryId - Update existing health entry
router.put('/entries/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { value, timestamp, notes } = req.body;
    
    console.log('Updating health entry:', entryId);
    
    // Validate required fields
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }

    // Find and update the entry
    const updatedEntry = await HealthEntry.findByIdAndUpdate(
      entryId,
      {
        value: parseFloat(value),
        timestamp: timestamp ? new Date(timestamp) : undefined,
        notes: notes || ''
      },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({
        success: false,
        message: 'Health entry not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedEntry,
      message: 'Health entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating health entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health entry',
      error: error.message
    });
  }
});

// DELETE /api/health-metrics/entries/:entryId - Delete health entry
router.delete('/entries/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    
    console.log('Deleting health entry:', entryId);
    
    const deletedEntry = await HealthEntry.findByIdAndDelete(entryId);

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: 'Health entry not found'
      });
    }
    
    res.json({
      success: true,
      data: deletedEntry,
      message: 'Health entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete health entry',
      error: error.message
    });
  }
});

// GET /api/health-metrics/entries/:userId/:metricId/all - Get all entries for a specific metric (for editing)
router.get('/entries/:userId/:metricId/all', async (req, res) => {
  try {
    const { userId, metricId } = req.params;
    const { limit = 50 } = req.query;
    
    console.log('Fetching all entries for user:', userId, 'metric:', metricId);
    
    const entries = await HealthEntry
      .find({ userId, metricId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    // Get metric info
    const metric = await HealthMetric.findOne({ metricId });
    
    res.json({
      success: true,
      data: {
        metric,
        entries,
        totalCount: entries.length
      }
    });
  } catch (error) {
    console.error('Error fetching all entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entries',
      error: error.message
    });
  }
});
// # AI: End

module.exports = router;
