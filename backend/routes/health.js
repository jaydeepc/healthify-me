const express = require('express');
const router = express.Router();

const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    testVar: process.env.TEST || 'Not found'
  });
};

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', healthHandler);

module.exports = router;

module.exports.handle = healthHandler;
