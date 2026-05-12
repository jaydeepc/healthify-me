const mongoose = require('mongoose');
const { HealthMetric } = require('../models');
require('dotenv').config();

// # AI: Start
const healthMetricsData = [
  // Body Composition (6 metrics)
  {
    metricId: 'weight',
    name: 'Weight',
    category: 'body-composition',
    unit: 'kg',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 65, max: 80 },
      good: { min: 60, max: 85 },
      average: { min: 55, max: 90 },
      poor: { min: null, max: null }
    },
    description: 'Body weight in kilograms'
  },
  {
    metricId: 'waist-hip-ratio',
    name: 'Waist to Hip Ratio',
    category: 'body-composition',
    unit: 'ratio',
    dataType: 'number',
    benchmarks: {
      excellent: { min: null, max: 0.90 },
      good: { min: 0.90, max: 0.95 },
      average: { min: 0.95, max: 1.0 },
      poor: { min: 1.0, max: null }
    },
    description: 'Waist circumference divided by hip circumference'
  },
  {
    metricId: 'bmi',
    name: 'BMI',
    category: 'body-composition',
    unit: 'kg/m²',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 18.5, max: 24.9 },
      good: { min: 25.0, max: 27.0 },
      average: { min: 27.1, max: 29.9 },
      poor: { min: 30.0, max: null }
    },
    description: 'Body Mass Index'
  },
  {
    metricId: 'body-fat-percentage',
    name: 'Body Fat %',
    category: 'body-composition',
    unit: '%',
    dataType: 'percentage',
    benchmarks: {
      excellent: { min: 10, max: 15 },
      good: { min: 16, max: 20 },
      average: { min: 21, max: 25 },
      poor: { min: 26, max: null }
    },
    description: 'Percentage of body weight that is fat'
  },
  {
    metricId: 'visceral-fat-percentage',
    name: 'Visceral Fat %',
    category: 'body-composition',
    unit: '%',
    dataType: 'percentage',
    benchmarks: {
      excellent: { min: 1, max: 5 },
      good: { min: 6, max: 10 },
      average: { min: 11, max: 15 },
      poor: { min: 16, max: null }
    },
    description: 'Percentage of visceral fat around organs'
  },
  {
    metricId: 'skeletal-muscle-mass',
    name: 'Skeletal Muscle Mass',
    category: 'body-composition',
    unit: 'kg',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 32, max: 40 },
      good: { min: 28, max: 32 },
      average: { min: 24, max: 28 },
      poor: { min: null, max: 24 }
    },
    description: 'Mass of skeletal muscle in kilograms'
  },

  // Metabolic Health (3 metrics)
  {
    metricId: 'fasting-blood-glucose',
    name: 'Fasting Blood Glucose',
    category: 'metabolic',
    unit: 'mg/dL',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 70, max: 99 },
      good: { min: 100, max: 109 },
      average: { min: 110, max: 125 },
      poor: { min: 126, max: null }
    },
    description: 'Blood glucose level after fasting'
  },
  {
    metricId: 'non-hdl-cholesterol',
    name: 'Non-HDL Cholesterol',
    category: 'metabolic',
    unit: 'mg/dL',
    dataType: 'number',
    benchmarks: {
      excellent: { min: null, max: 130 },
      good: { min: 130, max: 159 },
      average: { min: 160, max: 189 },
      poor: { min: 190, max: null }
    },
    description: 'Total cholesterol minus HDL cholesterol'
  },
  {
    metricId: 'hba1c',
    name: 'HbA1c',
    category: 'metabolic',
    unit: '%',
    dataType: 'percentage',
    benchmarks: {
      excellent: { min: null, max: 5.7 },
      good: { min: 5.7, max: 6.0 },
      average: { min: 6.0, max: 6.4 },
      poor: { min: 6.5, max: null }
    },
    description: 'Average blood glucose over 2-3 months'
  },

  // Cardiovascular Health (4 metrics)
  {
    metricId: 'resting-heart-rate',
    name: 'Resting Heart Rate',
    category: 'cardiovascular',
    unit: 'bpm',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 50, max: 60 },
      good: { min: 61, max: 70 },
      average: { min: 71, max: 80 },
      poor: { min: 81, max: null }
    },
    description: 'Heart rate at rest'
  },
  {
    metricId: 'heart-rate-variability',
    name: 'Heart Rate Variability',
    category: 'cardiovascular',
    unit: 'ms',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 40, max: null },
      good: { min: 30, max: 40 },
      average: { min: 20, max: 30 },
      poor: { min: null, max: 20 }
    },
    description: 'Variation in time between heartbeats'
  },
  {
    metricId: 'vo2-max',
    name: 'VO2 Max',
    category: 'cardiovascular',
    unit: 'ml/kg/min',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 45, max: null },
      good: { min: 35, max: 45 },
      average: { min: 25, max: 35 },
      poor: { min: null, max: 25 }
    },
    description: 'Maximum oxygen consumption during exercise'
  },
  {
    metricId: 'blood-pressure-systolic',
    name: 'Blood Pressure - Systolic',
    category: 'cardiovascular',
    unit: 'mmHg',
    dataType: 'number',
    benchmarks: {
      excellent: { min: null, max: 120 },
      good: { min: 120, max: 129 },
      average: { min: 130, max: 139 },
      poor: { min: 140, max: null }
    },
    description: 'Systolic blood pressure'
  },
  {
    metricId: 'blood-pressure-diastolic',
    name: 'Blood Pressure - Diastolic',
    category: 'cardiovascular',
    unit: 'mmHg',
    dataType: 'number',
    benchmarks: {
      excellent: { min: null, max: 80 },
      good: { min: 80, max: 84 },
      average: { min: 85, max: 89 },
      poor: { min: 90, max: null }
    },
    description: 'Diastolic blood pressure'
  },

  // Functional Fitness (5 metrics)
  {
    metricId: 'grip-strength',
    name: 'Grip Strength',
    category: 'fitness',
    unit: 'kg',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 47, max: null },
      good: { min: 41, max: 47 },
      average: { min: 35, max: 41 },
      poor: { min: null, max: 35 }
    },
    description: 'Maximum grip strength'
  },
  {
    metricId: 'push-ups',
    name: '# of Push-ups',
    category: 'fitness',
    unit: 'count',
    dataType: 'number',
    benchmarks: {
      excellent: { min: 30, max: null },
      good: { min: 20, max: 30 },
      average: { min: 10, max: 20 },
      poor: { min: null, max: 10 }
    },
    description: 'Number of consecutive push-ups'
  },
  {
    metricId: 'plank-duration',
    name: 'Plank Duration',
    category: 'fitness',
    unit: 'seconds',
    dataType: 'duration',
    benchmarks: {
      excellent: { min: 120, max: null },
      good: { min: 60, max: 120 },
      average: { min: 30, max: 60 },
      poor: { min: null, max: 30 }
    },
    description: 'Maximum plank hold time'
  },
  {
    metricId: 'single-leg-balance',
    name: 'Single Leg Balance',
    category: 'fitness',
    unit: 'seconds',
    dataType: 'duration',
    benchmarks: {
      excellent: { min: 30, max: null },
      good: { min: 15, max: 30 },
      average: { min: 5, max: 15 },
      poor: { min: null, max: 5 }
    },
    description: 'Single leg balance time'
  },
  {
    metricId: 'dead-hang-duration',
    name: 'Dead Hang Duration',
    category: 'fitness',
    unit: 'seconds',
    dataType: 'duration',
    benchmarks: {
      excellent: { min: 60, max: null },
      good: { min: 30, max: 60 },
      average: { min: 10, max: 30 },
      poor: { min: null, max: 10 }
    },
    description: 'Maximum dead hang time'
  },

  // Recovery & Sleep (2 metrics)
  {
    metricId: 'sleep-duration',
    name: 'Sleep Duration',
    category: 'sleep',
    unit: 'hours',
    dataType: 'duration',
    benchmarks: {
      excellent: { min: 7, max: 9 },
      good: { min: 6, max: 7 },
      average: { min: 5, max: 6 },
      poor: { min: null, max: 5 }
    },
    description: 'Total sleep duration per night'
  },
  {
    metricId: 'deep-sleep-percentage',
    name: 'Deep Sleep %',
    category: 'sleep',
    unit: '%',
    dataType: 'percentage',
    benchmarks: {
      excellent: { min: 15, max: 20 },
      good: { min: 10, max: 15 },
      average: { min: 5, max: 10 },
      poor: { min: null, max: 5 }
    },
    description: 'Percentage of sleep that is deep sleep'
  }
];

async function seedHealthMetrics() {
  try {
    // Load environment variables from the same source as the main app
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });
    
    // Connect to MongoDB using the same URI as the main application
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing metrics
    await HealthMetric.deleteMany({});
    console.log('Cleared existing health metrics');

    // Insert new metrics
    const insertedMetrics = await HealthMetric.insertMany(healthMetricsData);
    console.log(`Inserted ${insertedMetrics.length} health metrics`);

    // Log summary by category
    const categories = [...new Set(healthMetricsData.map(m => m.category))];
    categories.forEach(category => {
      const count = healthMetricsData.filter(m => m.category === category).length;
      console.log(`- ${category}: ${count} metrics`);
    });

    console.log('Health metrics seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding health metrics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedHealthMetrics();
}

module.exports = { seedHealthMetrics, healthMetricsData };
// # AI: End
