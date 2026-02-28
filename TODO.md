# TODO

## Status (2026-02-28)

### Recently Completed

- [x] **Gateway Status Widget (Widget 9)** - Added to builtin-widgets.js and index.js
  - Shows gateway connection status with online/offline/partial indicators
  - Keyboard navigation with '9' key to toggle visibility
  - Theme support added to all themes (default, dark, high-contrast, ocean)
  - Settings integration with showWidget9 configuration
  - Integrated into help text and settings panel

- [x] **Gateway Auto-Retry** - Automatic retry when all gateways unreachable
  - Detects when all endpoints are offline during session fetch
  - Rate-limited to prevent spam (30 second minimum interval)
  - Shows auto-retry indicator in footer during operation
  - Triggers data refresh after successful reconnection

- [x] **Performance Metrics Overlay** - Toggle with 'p' key
  - Shows current memory, CPU usage, refresh rate, and uptime
  - Displays aggregate metrics (averages, peak memory)
  - Health check indicators for degraded performance
  - Color-coded thresholds (green/yellow/red) for resource usage

- [x] **Keyboard Shortcuts** - Enhanced control scheme
  - 'p' toggles performance overlay (was 'p' for pause)
  - 'P' or Space pauses/resumes auto-refresh
  - '9' toggles Gateway widget visibility
  - Added export format cycling with 'E'
  - Added version info with 'v'

### Test Results

- **All 1220 tests passing** (27 test suites)
- No regressions detected in widget system or gateway manager

---

## High Priority

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `src/cli/` modules (argument parsing, error paths, help output)
- [ ] Test `config-watcher.js` (file watching, debouncing)
- [ ] Test `web-server.js` (routes, middleware)

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
- [x] Performance metrics overlay (toggle with 'p')

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

## Immediate Next Steps

- [ ] Gateway Manager Tests - Mock API responses for HTTP status codes, test retry logic with exponential backoff, verify rate limiting integration
- [ ] CLI Unit Tests - Test argument parsing edge cases, test command handler failures
- [ ] Error Handling Pattern - Expand PluginError to config/validation errors, create centralized error code namespaces
- [ ] TypeScript Migration - Start with src/validation.js and src/security.js
- [ ] CJS Bundle Asset Resolution - Embed schema as JSON string in bundle
- [ ] Auto-Retry Configuration - Make minRetryInterval user-configurable, add exponential backoff
- [ ] Integration Testing - End-to-end plugin load/validate/render cycle, settings persistence, theme propagation

---

## Recommendations

### Current Sprint Focus (Next 1-2 Weeks)

1. **Gateway Manager Tests** - Critical for API reliability
   - Mock API responses for various HTTP status codes (200, 404, 500, timeout)
   - Test retry logic with exponential backoff
   - Verify rate limiting integration
   - Test `forceRetry()` with both single endpoint and all unreachable scenarios

2. **CLI Unit Tests** - The `src/cli/` modules need comprehensive coverage
   - Test argument parsing edge cases and error paths
   - Test command handler failures (file permissions, invalid inputs)
   - Verify help/version output formatting across commands

### Code Quality Improvements

3. **Error Handling Pattern** - Expand `PluginError` usage consistently
   - Apply to config validation errors (ConfigError)
   - Apply to validation module errors (ValidationError)
   - Create centralized error code namespaces in `src/errors.js`

4. **TypeScript Migration Path** - Incremental adoption
   - Start with `src/validation.js` and `src/security.js` (small, focused modules)
   - Generate `.d.ts` files for existing modules
   - Add types to worker message interfaces

### Known Limitations & Technical Debt

5. **CJS Bundle Asset Resolution** - Schema files not properly bundled
   - `plugin-manifest.json` schema path resolution fails in CJS build
   - ESM is primary target; CJS has limited support for file-based assets
   - Consider embedding schema as JSON string in bundle if CJS needs full feature parity

6. **Auto-Retry Configuration** - Currently hardcoded values
   - `minRetryInterval` is 30 seconds (should be user-configurable)
   - No exponential backoff for consecutive failures
   - Could add per-endpoint retry strategies

### Testing Priorities

7. **Integration Testing** - Cross-module workflows
   - End-to-end plugin load/validate/render cycle
   - Settings persistence across dashboard restarts
   - Theme change propagation to all widgets
   - Gateway retry flow: offline → retry → reconnect → data refresh

8. **Config Watcher Tests** - File watching and debouncing
   - Test file change detection
   - Verify debouncing behavior
   - Test error handling for invalid config files

### Documentation

9. **README Updates** - Already partially done
   - ✅ Added '9' key to keyboard shortcuts table
   - ✅ Added performance metrics overlay documentation
   - Consider documenting auto-retry behavior and configuration options
   - Add troubleshooting section for gateway connectivity issues

### Performance Optimizations

10. **Worker Pool Optimization** - Graceful degradation
    - Handle worker pool overload scenarios
    - Implement request queuing with timeouts
    - Add worker pool metrics to performance overlay

11. **Memory Management** - Dashboard long-running sessions
    - Monitor memory growth over time
    - Implement periodic garbage collection hints
    - Add memory pressure detection
