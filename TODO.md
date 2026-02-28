# TODO

## Status (2026-02-28)

### Recently Completed
- [x] Dashboard auto-save (periodic state persistence) - **COMPLETED**
  - AutoSaveManager class with backup rotation and statistics
  - 26 tests covering all functionality (all passing)
  - Backup cleanup keeps only N most recent backups
  - Statistics logging for troubleshooting
- [x] Pre-commit hooks with lint-staged - **COMPLETED**
  - Husky pre-commit hook running lint and tests on staged files
  - lint-staged configured for efficient incremental linting
- [x] GitHub Actions CI workflow - **COMPLETED**
  - release.yml workflow for automated build and publish
  - Runs tests, builds ESM and CJS bundles, publishes to npm

### Bug Fixes
- [x] Fixed auto-save backup test isolation issue
  - Added counter suffix for rapid saves within same millisecond
  - Prevents backup file overwrites during fast sequential saves

## High Priority

- [ ] Set up GitHub Actions CI (test on push, build on release)
  - Add workflow for PR testing (test on push to dev/main)
  - Add code coverage reporting with c8/Istanbul
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

- [ ] Generate TypeScript types from plugin manifest
- [ ] Widget playground (live-preview during development)
- [ ] Add more widget templates (table, gauge, log-viewer)
- [ ] Interactive prompts for plugin scaffolding

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
1. **CI/CD expansion** - Add workflow for PR testing on push to dev/main branches
2. **Code coverage** - Add c8/Istanbul coverage reporting with thresholds
3. **Widget drag-and-drop** - High user impact feature for dashboard customization
4. **TypeScript migration** - Start with `validation.js` as it's well-structured

### Current Test Status
- **1370 tests passing** (1 skipped)
- All 33 test suites passing
- Auto-save tests: 26 passing with fixed backup isolation

### Architecture Notes
- Auto-save backup naming: `dashboard-state.json.{timestamp}.backup`
- Backup collision handling: adds counter suffix for same-millisecond saves
- Statistics tracked: totalBytesWritten, totalBackupsCreated, totalBackupsCleaned
- Pre-commit hooks: runs eslint and related tests on staged files via lint-staged

### Known Warnings
- Worker process timer leak in tests (non-blocking, cosmetic warning)
- `--localstorage-file` warning (Node.js configuration issue, not project-related)
