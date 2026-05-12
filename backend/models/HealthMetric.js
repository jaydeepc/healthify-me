const mongoose = require('mongoose');

// # AI: Start
const healthMetricSchema = new mongoose.Schema({
  metricId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['body-composition', 'metabolic', 'cardiovascular', 'fitness', 'sleep'],
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  dataType: {
    type: String,
    required: true,
    enum: ['number', 'duration', 'percentage'],
    default: 'number'
  },
  benchmarks: {
    excellent: {
      min: { type: Number, default: null },
      max: { type: Number, default: null }
    },
    good: {
      min: { type: Number, default: null },
      max: { type: Number, default: null }
    },
    average: {
      min: { type: Number, default: null },
      max: { type: Number, default: null }
    },
    poor: {
      min: { type: Number, default: null },
      max: { type: Number, default: null }
    }
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
healthMetricSchema.index({ category: 1 });
healthMetricSchema.index({ metricId: 1 });

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);
// # AI: End

module.exports = HealthMetric;
