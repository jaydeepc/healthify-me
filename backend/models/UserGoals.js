const mongoose = require('mongoose');

// # AI: Start
const userGoalsSchema = new mongoose.Schema({
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
  targetValue: {
    type: Number,
    required: true
  },
  setDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  targetDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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
userGoalsSchema.index({ userId: 1, metricId: 1 });
userGoalsSchema.index({ userId: 1, isActive: 1 });

// Ensure only one active goal per user per metric
userGoalsSchema.index({ userId: 1, metricId: 1, isActive: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true } 
});

const UserGoals = mongoose.model('UserGoals', userGoalsSchema);
// # AI: End

module.exports = UserGoals;
