# TODO

## Status (2026-02-27)

### Completed This Session

- [x] **CLI Modularization** - Extracted CLI command handlers from `index.js` to `src/cli/` modules
  - `src/cli/args.js` - CLI argument parsing
  - `src/cli/help.js` - Help message display
  - `src/cli/version.js` - Version information
  - `src/cli/validate-plugin.js` - Plugin validation command
  - `src/cli/validate-config.js` - Config validation command
  - `src/cli/index.js` - Centralized exports
  - Reduced `index.js` by ~360 lines
  - All 1183 tests passing

### Previous Work

- [x] Plugin manifest validator CLI (`clawdash validate-plugin`)
- [x] Plugin scaffolding CLI (`clawdash create-plugin`)
- [x] Configuration validation CLI (`clawdash validate-config`)
- [x] Enhanced plugin error system with helpful diagnostics
- [x] Manifest validation on plugin load
- [x] Auto theme detection system with system-wide support

---

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling, worker recovery, error propagation)
- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Complete test coverage for core modules

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Plugin debug mode improvements (verbose logging, error stack traces)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [x] Extract CLI command handlers from `index.js` to `src/cli/` modules
- [ ] Apply `PluginError` pattern to config/validation errors with centralized error codes

## Features

- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] User preferences persistence (theme, refresh rate)
- [ ] Plugin configuration UI (edit config.json from dashboard)

## Enhancements

- [ ] Real-time WebSocket updates (push data instead of polling)
- [ ] Widget drag-and-drop arrangement
- [ ] Terminal keyboard shortcuts for navigation

## Plugin Developer Experience

- [ ] Plugin hot-reload with file watcher
- [ ] Generate TypeScript types from plugin manifest

## Backlog

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Plugin API versioning for backward compatibility
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard sharing via URL with embedded config
- [ ] Plugin dependency resolution (install deps alongside plugin)

---

## Recommendations

### Immediate Next Steps

1. **CLI Tests** - The new `src/cli/` modules need unit tests
   - Test argument parsing edge cases
   - Test command handler error paths
   - Test help/version output formatting

2. **Worker Pool Tests** - Critical for stability
   - Task execution and timeout handling
   - Worker recovery mechanisms
   - Error propagation from workers

### CI/CD Pipeline

3. **GitHub Actions workflow**
   - Run tests on every push
   - Build CJS bundle on release
   - Publish to npm on tag
   - Code coverage reporting with codecov/c8

### Code Architecture

4. **Error handling pattern adoption**
   - Apply `PluginError` pattern to config errors
   - Apply to validation errors
   - Create centralized error code namespaces

5. **TypeScript adoption**
   - Start with validation.js and security.js (small, focused)
   - Generate .d.ts for existing JS modules
   - Add types to worker messages

### Current Module Structure

```
src/cli/
├── index.js           # Centralized exports
├── args.js            # CLI argument parsing
├── help.js            # Help message display
├── version.js         # Version information
├── validate-plugin.js # Plugin validation command
└── validate-config.js # Config validation command
```
