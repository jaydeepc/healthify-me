const mongoose = require('mongoose');

// # AI: Start
const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  metricOrder: [{
    metricId: {
      type: String,
      required: true
    },
    position: {
      type: Number,
      required: true
    }
  }],
  preferences: {
    defaultView: {
      type: String,
      enum: ['all', 'body-composition', 'metabolic', 'cardiovascular', 'fitness', 'sleep'],
      default: 'all'
    },
    compactView: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userPreferencesSchema.index({ userId: 1 });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
// # AI: End

module.exports = UserPreferences;
