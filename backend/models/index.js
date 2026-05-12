/**
 * Models index file
 * 
 * This file serves as a central point for exporting all models
 * Add your models here as they are created
 */

// # AI: Start
// Health tracking models
const HealthMetric = require('./HealthMetric');
const HealthEntry = require('./HealthEntry');
const UserGoals = require('./UserGoals');
const UserPreferences = require('./UserPreferences');

// Example model import
// const User = require('./User');
// const Product = require('./Product');

module.exports = {
  // Health tracking models
  HealthMetric,
  HealthEntry,
  UserGoals,
  UserPreferences,
  // Export models here
  // User,
  // Product
};
// # AI: End
