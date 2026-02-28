# TODO

## Status Summary (2026-02-27)

**Current Branch:** dev
**Total Tests:** 1057 passing
**Version:** 1.10.0 → 1.11.0 (pending release)

### Recently Completed

1. **Widget Error Boundary System** - Visual error handling with retry UI
   - `WidgetErrorBoundary` class for catching and displaying widget errors
   - `ErrorBoundaryManager` for managing multiple widget boundaries
   - `withErrorBoundary()` helper and `getErrorBoundaryManager()` singleton
   - Integration with `WidgetErrorIsolator` for health tracking
   - Retry functionality with configurable max retries and delay
   - 45 comprehensive tests (all passing)

2. **Plugin Manifest Validator CLI** (previously completed)
3. **Web Server Security** (previously completed) - Rate limiting, CORS, API key auth

### Recommendations

1. **Next Priority:** Complete test coverage for `worker-pool.js` and `gateway-manager.js`
2. **CI/CD:** Implement GitHub Actions for automated testing on PRs
3. **Documentation:** Document the new error boundary system in PLUGINS.md
4. **Code Quality:** Consider TypeScript migration starting with validation.js

---

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Plugin scaffolding CLI (`clawdash create-plugin`)
- [ ] Configuration validation CLI (`clawdash validate-config`)
- [ ] Plugin debug mode improvements (verbose logging, error stack traces)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [x] ~~Widget error boundary with retry UI~~ - **COMPLETED**

## Features

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] Plugin API versioning for backward compatibility
- [ ] User preferences persistence (theme, refresh rate)
- [ ] Plugin configuration UI (edit config.json from dashboard)

## Enhancements

- [ ] Real-time WebSocket updates (push data instead of polling)
- [ ] Widget drag-and-drop arrangement
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Auto theme detection (follows system dark/light mode)
- [ ] Terminal keyboard shortcuts for navigation
- [ ] Dashboard sharing via URL with embedded config

## Plugin Developer Experience

- [ ] Plugin dependency resolution (install deps alongside plugin)
- [ ] Better error messages for common plugin mistakes
- [ ] Plugin hot-reload with file watcher CLI
- [ ] Generate TypeScript types from plugin manifest
