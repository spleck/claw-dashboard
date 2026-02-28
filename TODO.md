# TODO

## Status (2026-02-28)

### Completed This Session

- [x] **Fixed duplicate functions** - Removed duplicate `retryGatewayConnection()` in `index.js`
  - Also removed duplicate key binding for 'G' key
  - Consolidated to single implementation with proper error handling

- [x] **Fixed duplicate forceRetry** - Removed second `forceRetry()` implementation in `gateway-manager.js`
  - Consolidated to single implementation returning `{attempted, successful, results}`
  - Added `getEndpointFailCount()` and `clearEndpointFailCount()` helpers

- [x] **Gateway Status Widget** - Added `GatewayStatusWidget` to builtin-widgets.js
  - Shows gateway connection status with offline indicator
  - Keyboard navigation (j/k) and retry (r) support
  - Integrated into WIDGET_REGISTRY and exports

- [x] **Gateway retry UI** - Press 'G' to retry unreachable gateways
  - Footer shows gateway connection status (green/yellow/red indicators)
  - Shows count of reconnected gateways on success
  - Auto-clears status after 3 seconds
  - Partially resolves GitHub #1 (retry UI implemented)

### Previous Work

- [x] CJS/ESM dual-package exports with working builds
- [x] Plugin API rate limiting and path validation
- [x] Plugin scaffolding CLI (`clawdash create-plugin`)
- [x] Plugin manifest validator CLI (`clawdash validate-plugin`)
- [x] Configuration validation CLI (`clawdash validate-config`)
- [x] Enhanced plugin error system with diagnostics
- [x] 375 passing tests across 10 test suites
- [x] Comprehensive PLUGINS.md documentation
- [x] Theme selection in settings panel (press 's')
- [x] SettingsWidget for standalone settings management
- [x] Version info display (press 'v')

---

## High Priority

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `src/cli/` modules (argument parsing, error paths, help output)
- [ ] Test `config-watcher.js` (file watching, debouncing)
- [ ] Test `web-server.js` (routes, middleware)
- [ ] Resolve GitHub #1: Better handling when gateway goes down (offline indicator, retry UI)
  - Partially complete: Retry UI implemented with 'G' key
  - Remaining: Detect gateway down during normal operation and auto-retry

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
- [ ] Gateway widget toggle (press '9' to show/hide GatewayStatusWidget)

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

3. **Widget Toggle Integration** - Gateway widget needs toggle support
   - Add key '9' binding to toggle GatewayStatusWidget visibility
   - Update help text: change "1-8 toggle" to "1-9 toggle"
   - Add widget position/layout handling for 9th widget

4. **Error Handling Pattern** - Expand `PluginError` usage
   - Apply to config validation errors (ConfigError)
   - Apply to validation module errors (ValidationError)
   - Create centralized error code namespaces in `src/errors.js`

5. **TypeScript Migration Path** - Incremental adoption
   - Start with `src/validation.js` and `src/security.js` (small, focused)
   - Generate `.d.ts` files for existing modules
   - Add types to worker message interfaces

### Known Limitations

6. **CJS Bundle Asset Resolution** - Schema files not bundled
   - `plugin-manifest.json` schema path resolution fails in CJS build
   - ESM is primary target; CJS has limited support for file-based assets
   - Consider embedding schema as JSON string in bundle if CJS needs full feature parity

### Testing Improvements

7. **Integration Testing** - Cross-module workflows
   - End-to-end plugin load/validate/render cycle
   - Settings persistence across dashboard restarts
   - Theme change propagation to all widgets
   - Gateway retry flow: offline → retry → reconnect → data refresh
