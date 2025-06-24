module.exports = {
  globalSetup: '<rootDir>/src/__tests__/setup.js',
  globalTeardown: '<rootDir>/src/__tests__/setup.js.teardown',
  // Test environment
  testEnvironment: 'node',

  // Test match patterns
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/__tests__/',
    '/dist/'
  ],

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Stop running tests after the first failure
  bail: false,

  // Display individual test results
  displayName: {
    name: 'Smart Expense Tracker API',
    color: 'blue'
  }
};