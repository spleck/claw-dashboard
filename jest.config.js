export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  // Jest owns coverage via its native V8 provider. Previously c8 wrapped
  // jest, but under --experimental-vm-modules V8 coverage does not
  // propagate out of jest's VM contexts on Node 20, so c8 reported ~3.5%
  // functions against ~70% real. Jest's own provider is correct on all
  // supported runtimes.
  collectCoverage: false,
  coverageProvider: 'v8',
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],
  collectCoverageFrom: [
    'index.js',
    'src/**/*.js',
    '!src/workers/**',
    '!src/database.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/tests/',
    '/dist/',
    '/scripts/',
    '/examples/',
    '\\.test\\.js$',
    '\\.config\\.js$',
  ],
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 35,
      functions: 20,
      lines: 35,
    },
  },
  verbose: true,
  testTimeout: 10000,
};
