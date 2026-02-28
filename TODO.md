# TODO

## Status (2026-02-27)

### Completed This Session

- [x] **Better error messages for common plugin mistakes** - Enhanced plugin error system
  - `src/plugin-errors.js` - New module with `PluginError` and `PluginErrorAnalyzer` classes
  - 28 comprehensive tests in `tests/plugin-errors.test.js`
  - Integrated into `src/widgets/widget-loader.js` for manifest validation, dependency resolution, and widget loading
  - Rich error context including suggestions, documentation links, and fix hints
  - Error code system with 18 distinct error types covering manifest, entry, widget, security, config, and dependency errors

### Test Summary

- **Total Tests:** 1183 passing (was 1116, +67 new tests)
- **New Tests:** 28 plugin error tests
- **All Suites:** 26 passing

---

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)
- [ ] Complete test coverage for core modules

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Plugin scaffolding CLI (`clawdash create-plugin`)
- [ ] Plugin debug mode improvements (verbose logging, error stack traces)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification

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
- [x] Better error messages for common plugin mistakes
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

### Immediate Priorities

1. **Plugin scaffolding CLI** - High DX impact
   - Leverage existing `src/plugin-scaffold.js` and validation patterns
   - Interactive prompts for widget type selection
   - Template generation with proper structure
   - Can use new error message system for validation feedback

2. **Test worker-pool.js** - Core infrastructure
   - Task execution and timeout handling
   - Worker recovery mechanisms
   - Critical for dashboard stability

3. **Test gateway-manager.js** - API reliability
   - API call error handling
   - Retry logic integration

### Code Quality Notes

- **1183 tests passing** (+67 from plugin error system)
- Plugin error system provides rich context for debugging
- Consider using PluginError pattern for other error types (config, validation)
- Error codes are namespaced (`PLUGIN_*`) for easy filtering

### Technical Debt

- CLI command handlers could be extracted from `index.js` to `src/cli/` modules
- Widget error boundaries recently added - monitor for effectiveness
- Theme system has auto-detection - verify docs are current

### Error Handling Architecture

The new plugin error system follows a consistent pattern:
- `PLUGIN_ERROR_CODES` - Centralized error code definitions
- `PluginError` class - Rich error with suggestions, docs, fixes
- `PluginErrorAnalyzer` - Automatic error type detection from messages
- `formatPluginError()` - Consistent formatting for display
- `extractErrorInfo()` - Extract structured data from any error

This pattern could be applied to other domains (config errors, validation errors).
