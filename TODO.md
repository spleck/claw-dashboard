# TODO

## Status (2026-02-27)

### Completed

- [x] Plugin manifest validation on load (39 tests)
  - Validates in `discoverPlugins()`, `loadPlugin()`, and `registerPlugin()`
  - Schema validation with clear error messages
  - Graceful handling with fallbackOnError option

### Current Focus

Widget configuration enhancements remain the primary development track:
- Worker pool and gateway manager testing
- Built-in default widgets (CPU, Memory, Disk)

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
- [ ] Better error messages for common plugin mistakes
- [ ] Generate TypeScript types from plugin manifest
- [x] Plugin manifest validation on load

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

2. **Test worker-pool.js** - Core infrastructure
   - Task execution and timeout handling
   - Worker recovery mechanisms
   - Critical for dashboard stability

3. **Test gateway-manager.js** - API reliability
   - API call error handling
   - Retry logic integration

### Code Quality Notes

- **1116 tests passing** (was 1116, now 1155 with manifest validation)
- Manifest validation uses same patterns as config-validator.js - potential for shared utilities
- Consider extracting validation logic into reusable module

### Technical Debt

- CLI command handlers could be extracted from `index.js` to `src/cli/` modules
- Widget error boundaries recently added - monitor for effectiveness
- Theme system has auto-detection - verify docs are current
