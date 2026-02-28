# TODO

## Status (2026-02-28)

### Completed This Session

- [x] **Fixed CJS build shebang position** - Resolved duplicate/misplaced shebang in `index.cjs`
  - Updated `build-cjs.js` to extract and re-position shebang at the start of the bundle
  - CJS bundle now correctly starts with `#!/usr/bin/env node`

- [x] **Theme selection in settings panel** - Added theme cycling to dashboard settings (press 's')
  - Cycles through: auto, default, dark, high-contrast, ocean
  - Theme applies immediately when selected
  - Settings height increased from 18 to 19 lines to accommodate theme row
  - SettingsWidget class added to builtin-widgets.js for future standalone use

- [x] **SettingsWidget implementation** - New interactive settings widget
  - Full keyboard navigation (j/k, g/G, enter, s, q)
  - Edit theme, refresh rate, log level, widget visibility, export format
  - Integrated into WIDGET_REGISTRY and widget exports

### Previous Work

- [x] CJS/ESM dual-package exports with working builds
- [x] Plugin API rate limiting and path validation
- [x] Plugin scaffolding CLI (`clawdash create-plugin`)
- [x] Plugin manifest validator CLI (`clawdash validate-plugin`)
- [x] Configuration validation CLI (`clawdash validate-config`)
- [x] Enhanced plugin error system with diagnostics
- [x] 1220 passing tests across 27 test suites
- [x] Comprehensive PLUGINS.md documentation

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

- [x] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [x] User preferences persistence (theme, refresh rate) - Theme selection added to settings panel (press 's')
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

1. **CLI Unit Tests** - The `src/cli/` modules need comprehensive test coverage
   - Test argument parsing edge cases and error paths
   - Test command handler failures (file permissions, invalid inputs)
   - Verify help/version output formatting across commands

2. **Gateway Manager Tests** - Critical for API reliability
   - Mock API responses for various HTTP status codes
   - Test retry logic with exponential backoff
   - Verify rate limiting integration

### Known Limitations

3. **CJS Bundle Asset Resolution** - Schema files not bundled
   - `plugin-manifest.json` schema path resolution fails in CJS build
   - ESM is primary target; CJS has limited support for file-based assets
   - Consider embedding schema as JSON string in bundle if CJS needs full feature parity

### Code Architecture

4. **Error Handling Pattern** - Expand `PluginError` usage
   - Apply to config validation errors (ConfigError)
   - Apply to validation module errors (ValidationError)
   - Create centralized error code namespaces in `src/errors.js`

5. **TypeScript Migration Path** - Incremental adoption
   - Start with `src/validation.js` and `src/security.js` (small, focused)
   - Generate `.d.ts` files for existing modules
   - Add types to worker message interfaces

### Testing Improvements

6. **Integration Testing** - Cross-module workflows
   - End-to-end plugin load/validate/render cycle
   - Settings persistence across dashboard restarts
   - Theme change propagation to all widgets
