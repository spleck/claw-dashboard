# TODO

## High Priority

- [ ] Fix CJS/ESM compatibility with dual-package exports
- [ ] Create plugin troubleshooting guide in PLUGINS.md

## Medium Priority

- [x] Extend RateLimiter to plugin API calls
- [ ] Add error boundary examples for plugins
- [ ] Widget configuration enhancements (env var interpolation, config versioning, hot-reload)
- [ ] Plugin developer tooling (scaffolding CLI, manifest validator, debug mode)

## Lower Priority

- [ ] TypeScript migration evaluation (start with RateLimiter, validation.js, security.js)
- [ ] JSDoc-to-API-docs generation pipeline
- [ ] JSON Schema for plugin manifest
- [ ] Plugin hot-reload for development
- [ ] CI/CD improvements (release automation, npm publish, benchmark regression tests)
- [ ] Performance optimizations (memory profiling, virtual scrolling if needed)

## Completed

- [x] Extend RateLimiter to plugin API calls - Added rate limiting to `getData`, `executeExtension`, and `getMetrics` methods with independent category tracking
- [x] Mock API Status widget tests - Tests now use mocked data providers instead of real HTTP requests
- [x] Jest worker process warning resolved - Warning was related to open handles during test execution
- [x] Plugin path validation for security hardening - Added `validatePluginName` and `validatePluginPath` functions
- [x] Plugin lifecycle documentation - Added PLUGINS.md with plugin architecture and lifecycle documentation
- [x] System metrics chart example plugin - Added example plugin demonstrating chart-based widgets
- [x] Comprehensive plugin API tests - Added `tests/plugin-api-rate-limit.test.js` with 21 test cases
