# TODO

## Status (2026-02-28)

### Completed This Session

- [x] **Fixed lint errors** - Corrected quote style in `config-validator.js`
  - Fixed 4 template literals to use escaped single quotes instead
  - All linting now passes

- [x] **Version info display** - Press 'v' to show dashboard and OpenClaw versions
  - Shows in footer: `clawdash <version> | openclaw <version>`
  - Auto-clears after 5 seconds
  - Resolves GitHub #2

### Previous Work

- [x] CJS/ESM dual-package exports with working builds
- [x] Plugin API rate limiting and path validation
- [x] Plugin scaffolding CLI (`clawdash create-plugin`)
- [x] Plugin manifest validator CLI (`clawdash validate-plugin`)
- [x] Configuration validation CLI (`clawdash validate-config`)
- [x] Enhanced plugin error system with diagnostics
- [x] 1220 passing tests across 27 test suites
- [x] Comprehensive PLUGINS.md documentation
- [x] Theme selection in settings panel (press 's')
- [x] SettingsWidget for standalone settings management

---

## High Priority

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `src/cli/` modules (argument parsing, error paths, help output)
- [ ] Test `config-watcher.js` (file watching, debouncing)
- [ ] Test `web-server.js` (routes, middleware)
- [x] Resolve GitHub #2: Show current dashboard version in UI (press 'v' or info panel)
- [ ] Resolve GitHub #1: Better handling when gateway goes down (offline indicator, retry UI)

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
