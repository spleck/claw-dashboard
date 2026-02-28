export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  // c8 handles coverage - Jest coverage disabled
  collectCoverage: false,
  coverageProvider: 'v8',
  verbose: true,
  testTimeout: 10000,
};
