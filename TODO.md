# TODO

## Status (2026-02-28)

### Completed This Session

- [x] **Fixed CJS build** - Resolved top-level await issues in `index.js` and `src/plugin-scaffold.js`
  - Wrapped CLI command handlers in async `main()` function
  - CJS build now succeeds: `index.cjs` and `dist/widgets.cjs`
  - All 1220 tests passing

- [x] **CLI modularization cleanup** - Fixed async CLI command handling
  - Moved async CLI commands (`create-plugin`, `validate-plugin`, `validate-config`) into `main()` function
  - Proper process exit after CLI commands execute
  - Prevents dashboard from starting when running CLI commands

### Previous Work

- [x] Test `worker-pool.js` (task execution, timeout handling, worker recovery, error propagation) - 37 tests in `tests/worker-pool.test.js`
- [x] Plugin manifest validator CLI (`clawdash validate-plugin`)
- [x] Plugin scaffolding CLI (`clawdash create-plugin`)
- [x] Configuration validation CLI (`clawdash validate-config`)
- [x] Enhanced plugin error system with helpful diagnostics
- [x] Manifest validation on plugin load
- [x] Auto theme detection system with system-wide support

---

## High Priority

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Complete test coverage for core modules
- [ ] CLI Tests for `src/cli/` modules (argument parsing edge cases, command handler error paths, help/version output)

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

2. **GitHub Actions CI/CD**
   - Run tests on every push and PR
   - Build CJS bundle on release
   - Publish to npm on tag
   - Code coverage reporting with codecov/c8

### Code Architecture

3. **Error handling pattern adoption**
   - Apply `PluginError` pattern to config errors
   - Apply to validation errors
   - Create centralized error code namespaces

4. **TypeScript adoption**
   - Start with validation.js and security.js (small, focused)
   - Generate .d.ts for existing JS modules
   - Add types to worker messages

### Module Structure

```
src/cli/
├── index.js           # Centralized exports
├── args.js            # CLI argument parsing
├── help.js            # Help message display
├── version.js         # Version information
├── validate-plugin.js # Plugin validation command
└── validate-config.js # Config validation command
```
