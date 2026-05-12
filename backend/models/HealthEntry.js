const mongoose = require('mongoose');

// # AI: Start
const healthEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  metricId: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
healthEntrySchema.index({ userId: 1, metricId: 1 });
healthEntrySchema.index({ userId: 1, timestamp: -1 });
healthEntrySchema.index({ metricId: 1, timestamp: -1 });

// Compound index for getting latest entries by user and metric
healthEntrySchema.index({ userId: 1, metricId: 1, timestamp: -1 });

const HealthEntry = mongoose.model('HealthEntry', healthEntrySchema);
// # AI: End

module.exports = HealthEntry;
