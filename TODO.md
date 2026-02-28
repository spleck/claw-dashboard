# TODO

## Status (2026-02-28)

### Completed This Session

- [x] **Gateway Status Widget (Widget 9)** - Added to builtin-widgets.js and index.js
  - Shows gateway connection status with online/offline/partial indicators
  - Keyboard navigation with '9' key to toggle visibility
  - Theme support added to all themes (cyber, matrix, monochrome, ocean)
  - Settings integration with showWidget9 configuration
  - Integrated into help text and settings panel

- [x] **Gateway Auto-Retry** - Automatic retry when all gateways unreachable
  - Detects when all endpoints are offline during session fetch
  - Rate-limited to prevent spam (30 second minimum interval)
  - Shows auto-retry indicator in footer during operation
  - Triggers data refresh after successful reconnection

- [x] **Fixed uptimeBox Border Color** - Restored theme application
  - Was accidentally removed when adding gatewayBox
  - Now both uptimeBox and gatewayBox have proper theme colors

- [x] **GitHub #1 Resolved** - Better handling when gateway goes down
  - Auto-retry on detection of all gateways offline
  - Visual indicator in Gateway widget with manual retry hint
  - Partial state handling for mixed connectivity

---

## High Priority

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `src/cli/` modules (argument parsing, error paths, help output)
- [ ] Test `config-watcher.js` (file watching, debouncing)
- [ ] Test `web-server.js` (routes, middleware)
- [x] Resolve GitHub #1: Better handling when gateway goes down
  - [x] Detect gateway down during normal operation and auto-retry
  - [x] Gateway widget toggle (press '9' to show/hide GatewayStatusWidget)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Plugin debug mode (verbose logging, error stack traces)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [ ] Expand `PluginError` pattern to config/validation errors
- [ ] CJS bundle asset resolution (embed schema as JSON if needed)
- [ ] Error boundary tests for widget isolation

## Features

- [ ] Plugin configuration UI (edit config.json from dashboard)
- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Widget drag-and-drop arrangement
- [ ] Terminal keyboard shortcuts for navigation
- [ ] Performance metrics overlay (toggle with 'p')

## Plugin Developer Experience

- [ ] Plugin hot-reload with file watcher
- [ ] Generate TypeScript types from plugin manifest
- [ ] Plugin API versioning for backward compatibility

## Backlog

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard sharing via URL with embedded config
- [ ] Plugin dependency resolution
- [ ] Integration tests (end-to-end plugin load/validate/render cycle)

---

## Recommendations

### Immediate Next Steps

1. **Gateway Manager Tests** - Critical for API reliability
   - Mock API responses for various HTTP status codes (200, 404, 500, timeout)
   - Test retry logic with exponential backoff
   - Verify rate limiting integration
   - Test `forceRetry()` with both single endpoint and all unreachable

2. **CLI Unit Tests** - The `src/cli/` modules need comprehensive test coverage
   - Test argument parsing edge cases and error paths
   - Test command handler failures (file permissions, invalid inputs)
   - Verify help/version output formatting across commands

### Code Architecture

3. **Error Handling Pattern** - Expand `PluginError` usage
   - Apply to config validation errors (ConfigError)
   - Apply to validation module errors (ValidationError)
   - Create centralized error code namespaces in `src/errors.js`

4. **TypeScript Migration Path** - Incremental adoption
   - Start with `src/validation.js` and `src/security.js` (small, focused)
   - Generate `.d.ts` files for existing modules
   - Add types to worker message interfaces

### Known Limitations

5. **CJS Bundle Asset Resolution** - Schema files not bundled
   - `plugin-manifest.json` schema path resolution fails in CJS build
   - ESM is primary target; CJS has limited support for file-based assets
   - Consider embedding schema as JSON string in bundle if CJS needs full feature parity

6. **Auto-Retry Configuration** - Currently hardcoded
   - `minRetryInterval` is 30 seconds (could be user-configurable)
   - No exponential backoff for consecutive failures
   - Could add per-endpoint retry strategies

### Testing Improvements

7. **Integration Testing** - Cross-module workflows
   - End-to-end plugin load/validate/render cycle
   - Settings persistence across dashboard restarts
   - Theme change propagation to all widgets
   - Gateway retry flow: offline → retry → reconnect → data refresh

### Documentation

8. **Update README** - Gateway widget documentation
   - Add '9' key to keyboard shortcuts table
   - Document auto-retry behavior and configuration
   - Update widget list to include Gateway Status
