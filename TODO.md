# TODO

## Current Status (as of 2026-02-27)

**Version:** 1.10.0 (web interface shipped)
**Branch:** dev
**Test Status:** 148/148 unit tests passing, 9 integration tests failing (pre-existing)

---

## High Priority
- [ ] Add integration tests for full dashboard workflows
  - **Note:** 9 integration tests fail due to pre-existing test logic issues:
    - `validateSettings` doesn't return a `valid` property (returns settings object directly)
    - Variable shadowing in alert escalation test (`let alerts = alerts.checkAllMetrics`)
    - Brittle assertions depending on system state
  - **Recommendation:** Refactor integration tests to mock system dependencies
- [x] ~~Support remote dashboard access via web interface~~ (SHIPPED in v1.10.0)
  - Web server with REST API endpoints
  - CORS-enabled for cross-origin requests
  - CLI flags: `--web`, `--web-port`, `--web-host`

## Medium Priority
- [ ] Address CJS/ESM compatibility issues
  - Some dependencies may still have CJS-only exports
  - Consider dual-mode publishing if needed
- [ ] Add JSDoc types or consider TypeScript migration
  - Type definitions would improve IDE support
  - Consider gradual migration approach

## Low Priority
- [x] ~~Implement lazy loading for widget modules~~ (Implemented - see src/widgets/)
- [x] ~~Design plugin API for third-party widgets~~ (Implemented - see docs/PLUGINS.md)

---

## Completed in v1.10.0
- [x] Web Interface - HTTP API for remote dashboard access
  - New `--web` CLI flag
  - REST endpoints: /health, /metrics, /sessions, /agents, /logs, /status
  - CORS support for cross-origin requests
  - Graceful shutdown handling
- [x] Widget Plugin System - Lazy loading and plugin API
  - Auto-discovery in ~/.openclaw/plugins/
  - BaseWidget class for extensions
  - PluginAPI for data access and UI components

## Completed in v1.9.0
- [x] Performance Monitoring - Metrics for refresh rates and memory usage

---

## Recommendations

### Testing
1. **Integration Test Refactoring:** The failing integration tests need refactoring:
   - Mock `systeminformation` calls to avoid system-dependent behavior
   - Fix `validateSettings` to return consistent result format
   - Fix variable naming conflicts in tests

### Code Quality
1. **Type Safety:** Consider adding JSDoc types incrementally:
   ```javascript
   /**
    * @param {Object} options
    * @param {number} options.port
    * @returns {Promise<WebServer>}
    */
   ```

2. **ESM Compatibility:** Monitor dependencies for ESM compatibility
   - All source files now use ES modules
   - Package.json has `"type": "module"`

### Documentation
1. **API Documentation:** Consider auto-generating API docs from JSDoc
2. **Examples:** Add example plugins to the examples/ directory

---

## Technical Debt

### Fixed in this session
- [x] Fixed `require('path')` in validation.js (line 74) - changed to ES module import
- [x] Added missing `validateGatewayEndpoint` function to validation.js
- [x] Updated package.json version from 1.9.0 to 1.10.0

### Outstanding
- Integration test brittleness (9 tests)
- Some alert threshold tests depend on actual system state
