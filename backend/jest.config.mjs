export default {
  collectCoverage: false,
  coverageDirectory: '../coverage/backend',
  coverageReporters: ['lcov', 'text-summary', 'json'],
  testEnvironment: 'node',
  reporters: ['default'],
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    '!models/**/*.js',
    '!server.js',
    '!**/node_modules/**'
  ],
  testResultsProcessor: 'jest-sonar-reporter',
};
