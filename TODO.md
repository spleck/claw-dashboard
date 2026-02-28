# TODO

## Status (2026-02-28)

### Recently Completed
- [x] Code coverage reporting with c8
  - Configured thresholds: statements/lines 35%, branches 30%, functions 20%
  - Added npm scripts: `test:coverage`, `test:coverage:check`, `coverage:report`, `coverage:clean`
  - Reports: text, html, lcov, json-summary

### Current Test Status
- **1370 tests passing** (1 skipped)
- **33 test suites** all passing
- **Coverage**: 48.7% statements, 79.22% branches, 41.33% functions
- **Lint**: Clean (no errors)

---

## High Priority

- [ ] Widget drag-and-drop arrangement (high user impact)
- [ ] TypeScript migration (start with `validation.js`, `security.js`)

## Code Quality

- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [ ] Expand `PluginError` pattern to config/validation errors

## Features

- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Multiple dashboard profiles/pages
- [ ] Widget marketplace/discovery (browse/install from registry)
- [ ] Multi-instance support (monitor several OpenClaw instances)
- [ ] Alerting system (notify when metrics cross thresholds)

## Plugin Developer Experience

- [ ] Generate TypeScript types from plugin manifest
- [ ] Widget playground (live-preview during development)

## Observability & Debugging

- [ ] Built-in performance profiling for widgets
- [ ] Dashboard health score (aggregate widget status)
- [ ] Crash reporting from widget sandbox

## Polish

- [ ] Error recovery UI (retry buttons for failed widgets)
- [ ] Accessibility improvements (screen reader support)

## Technical Debt

- [ ] Address worker process timer leak warning in tests
  - Warning: "A worker process has failed to exit gracefully"
  - Likely caused by improper teardown or missing .unref() calls

## Additional Ideas

- [ ] Dashboard export/import (JSON config for sharing setups)
- [ ] Widget state persistence across restarts
- [ ] Theme system (dark/light/custom color schemes)
- [ ] Keyboard shortcuts for navigation and widget actions
- [ ] Remote widget loading (load from URL)
- [ ] Plugin dependency resolution
- [ ] Widget testing utilities for plugin developers
- [ ] Configurable refresh intervals per widget
- [ ] Widget layout presets (grid layouts)

---

## Recommendations

### Next Priority
1. **Widget drag-and-drop** - High user impact feature for dashboard customization
2. **TypeScript migration** - Start with `validation.js` as it's well-structured
3. **Increase coverage thresholds** - Gradually raise as tests are added

### Coverage Notes
- Current: 48.7% statements, 79.22% branches, 41.33% functions
- Thresholds set conservatively to pass CI initially
- Target: Incrementally raise to 70%+ statements/functions
- Low coverage files: `splash.js`, `theme-selector.js`, `web-server.js`