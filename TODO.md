# TODO

## High Priority

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `src/cli/` modules (argument parsing, error paths, help output)
- [ ] Test `config-watcher.js` (file watching, debouncing)
- [ ] Test `web-server.js` (routes, middleware)

## Testing & CI

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Integration tests (end-to-end plugin load/validate/render cycle)

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

## Plugin Developer Experience

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

## Technical Debt

- [x] Auto-retry configuration (make 30s interval user-configurable)
- [x] Add exponential backoff for consecutive gateway failures
- [x] Document auto-retry behavior and configuration options
- [x] Add troubleshooting section for gateway connectivity issues
- [ ] Add worker pool metrics to performance overlay
- [ ] Implement memory pressure detection for long-running sessions

---

## Status Summary (2026-02-28)

### Recently Completed

1. **Auto-Retry Configuration** - Fully implemented with exponential backoff
   - Configuration in `src/config.js` with validation constraints
   - `validateAutoRetry()` function in `src/validation.js`
   - Dynamic backoff calculation in `shouldAutoRetryGateway()` in `index.js`
   - Failure count tracking in `gateway-manager.js` with `getTotalFailCount()` and `clearAllFailCounts()`

2. **API Documentation** - Comprehensive docs in `docs/API.md`
   - Configuration options reference table
   - Exponential backoff behavior explanation
   - Validation constraints documented
   - Troubleshooting section for gateway connectivity
   - Force retry and debug logging instructions

### Test Results

- **All 1220 tests passing** (27 test suites)
- No regressions in auto-retry or gateway manager functionality

### Recommendations

**Next Priority: Worker Pool Metrics**

The performance metrics overlay currently shows memory and CPU usage. Adding worker pool metrics would:
- Show active/busy worker count
- Display task queue length
- Help diagnose bottlenecks during high load

Implementation should mirror the existing `performanceMonitor` pattern in `index.js` and `src/performance-monitor.js`.

**Memory Pressure Detection**

Consider implementing this in `src/performance-monitor.js`:
- Track memory usage trends over time
- Alert when memory growth rate exceeds threshold
- Trigger garbage collection hints when under pressure
