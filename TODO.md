# TODO

## Status (2026-02-28)

### Recently Completed
- [x] Interactive prompts for plugin scaffolding - **COMPLETED**
  - Added `--interactive` flag for guided plugin creation
  - Prompts for ID, name, template, author, category, description
  - Validates input and shows confirmation summary
- [x] Additional widget templates - **COMPLETED**
  - Added `table` template for tabular data display
  - Added `gauge` template for single metrics (circle/linear)
  - Added `logViewer` template for scrolling log entries
- [x] CLI command routing in index.js - **COMPLETED**
  - Centralized command dispatch for create-plugin, validate-plugin, etc.

### Bug Fixes
- [x] Fixed lint errors in plugin-scaffold.js
  - Removed unused variables in promptChoice function
  - Fixed duplicate `id` key in logViewer manifest template

## High Priority

- [ ] Add code coverage reporting (c8/Istanbul)
  - Configure coverage thresholds
  - Add coverage badge to README

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [ ] Expand `PluginError` pattern to config/validation errors

## Features

- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Widget drag-and-drop arrangement
- [ ] Multiple dashboard profiles/pages
- [ ] Widget marketplace/discovery (browse/install from registry)
- [ ] Multi-instance support (monitor several OpenClaw instances)
- [ ] Alerting system (notify when metrics cross thresholds)

## Plugin Developer Experience

- [x] Add more widget templates (table, gauge, log-viewer)
- [x] Interactive prompts for plugin scaffolding
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

---

## Recommendations

### Next Priority
1. **Code coverage** - Add c8/Istanbul coverage reporting with thresholds
2. **Widget drag-and-drop** - High user impact feature for dashboard customization
3. **TypeScript migration** - Start with `validation.js` as it's well-structured

### Current Test Status
- **1370 tests passing** (1 skipped)
- All 33 test suites passing
- Lint: Clean (no errors)

### Architecture Notes
- Plugin scaffolding now supports 6 templates: basic, api, chart, table, gauge, logViewer
- Interactive mode provides guided plugin creation workflow
- CLI command routing centralized in index.js for extensibility