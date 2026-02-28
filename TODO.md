# TODO

## Status (2026-02-28)

### Recently Completed
- [x] Dashboard auto-save (periodic state persistence) - **COMPLETED**
  - AutoSaveManager class with backup rotation and statistics
  - 26 tests covering all functionality (all passing)
  - Backup cleanup keeps only N most recent backups
  - Statistics logging for troubleshooting

### Known Issues (Fixed)
- ~~Test isolation issue in auto-save backup cleanup test~~ - **RESOLVED**
  - Used isolated temp directory for backup cleanup test to prevent interference

## Testing & CI
- [ ] Add pre-commit hooks (lint, test)
- [ ] Set up GitHub Actions CI (test on push, build on release)
- [ ] Add code coverage reporting (c8/Istanbul)

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
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard health score (aggregate widget status)
- [ ] Crash reporting from widget sandbox

## Polish
- [ ] Error recovery UI (retry buttons for failed widgets)
- [ ] Accessibility improvements (screen reader support)

## Technical Debt
- [x] Add backup rotation for auto-save (cleanup old backup files)
- [x] Add auto-save statistics to debug output for troubleshooting

---

## Recommendations

### Next Priority
1. **Widget drag-and-drop arrangement** - High user impact feature for customization
2. **CI/CD setup** - GitHub Actions for automated testing on PRs (tests now stable)
3. **TypeScript migration** - Start with `validation.js` as it's well-structured

### Current Test Status
- **1370 tests passing** (1 skipped)
- All test suites passing (33/33)
- Auto-save tests: 26 passing with isolated backup cleanup

### Technical Debt
- Review worker pool cleanup in tests (timer unref warning)
- Consider adding performance benchmarks for auto-save

### Architecture Notes
- Auto-save uses isolated temp directories for backup tests to avoid interference
- Backup naming: `dashboard-state.json.{timestamp}.backup`
- Statistics include: totalBytesWritten, totalBackupsCreated, totalBackupsCleaned
