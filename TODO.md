# TODO

## Status (2026-02-27)

### Completed This Session

- [x] **Plugin manifest validator CLI** - Enhanced validation with verbose mode
  - `clawdash validate-plugin <path>` command in `index.js`
  - JSON output support (`--json`, `-j`)
  - Verbose mode (`--verbose`, `-v`) with code analysis
  - Checks for widget index.js existence, recommended fields, plugin ID format
  - Removed duplicate `src/plugin-validate-cli.js` (functionality consolidated in index.js)

### Test Summary

- **Total Tests:** 1183 passing
- **Test Suites:** 26 passing
- **Coverage:** All existing tests pass after cleanup

---

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)
- [ ] Complete test coverage for core modules

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [x] Plugin scaffolding CLI (`clawdash create-plugin`)
- [x] Plugin manifest validator CLI (`clawdash validate-plugin`)
- [ ] Plugin debug mode improvements (verbose logging, error stack traces)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [ ] Extract CLI command handlers from `index.js` to `src/cli/` modules

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

### Testing Gaps

1. **worker-pool.js tests** - Critical for stability
   - Task execution and timeout handling
   - Worker recovery mechanisms
   - Error propagation from workers

2. **gateway-manager.js tests** - API reliability
   - API call error handling
   - Retry logic integration
   - Rate limiting behavior

### CI/CD Pipeline

3. **GitHub Actions workflow**
   - Run tests on every push
   - Build CJS bundle on release
   - Publish to npm on tag
   - Code coverage reporting with codecov/c8

### Developer Experience

4. **✅ Plugin scaffolding CLI** (COMPLETED)
   - ~~Interactive prompts for widget type~~
   - ~~Template generation with proper structure~~
   - ~~Leverage existing validation patterns~~
   - Implemented: `clawdash create-plugin <id>` with options for name, author, output, force, dry-run

5. **✅ Manifest validator CLI** (COMPLETED)
   - ~~Validate plugin manifests without loading~~
   - ~~Integration with scaffolding CLI~~
   - ~~Use new error message system for feedback~~
   - Implemented: `clawdash validate-plugin <path>` with JSON output and verbose mode support

### Code Architecture

6. **CLI modularization priority**
   - Extract CLI command handlers from `index.js` to `src/cli/` modules
   - Current CLI commands: `create-plugin`, `validate-plugin`, `validate-config`
   - Benefits: Smaller main bundle, better testability, clearer separation

7. **Error handling pattern adoption**
   - Apply `PluginError` pattern to config errors
   - Apply to validation errors
   - Create centralized error code namespaces

8. **TypeScript adoption**
   - Start with validation.js and security.js (small, focused)
   - Generate .d.ts for existing JS modules
   - Add types to worker messages
