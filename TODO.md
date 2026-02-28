# TODO

## Review Summary (2026-02-28)

### Changes Committed

**Navigation Crash Fix (index.js)**
- Added `_settingsClosing` flag to prevent race condition during settings close
- Updated 13 navigation guards to check flag before accessing `settingsList.focused`
- Used try/finally pattern to ensure flag is always cleared

**New Tests (tests/settings-modal.test.js)**
- 6 tests covering navigation blocking, rapid open/close cycles, and state management
- Verifies the fix prevents crashes when navigation keys are pressed during close transition

### Code Quality
- Tests: 1399 passing (1 skipped), 35 suites
- Coverage: 48.7% statements, 79.22% branches, 41.33% functions
- Lint: Clean (no errors)
- CJS Build: Both bundles compile successfully

### Recommendations

1. **Worker Timer Leak** (High Priority) - Test output shows:
   > "A worker process has failed to exit gracefully..."
   > "Active timers can also cause this, ensure .unref() was called on them."

2. **Logs Integration** - `getOpenClawLogs()` function exists but needs UI wiring

3. **Test Coverage** - Function coverage at 41% - focus on error handling paths

---

## Critical

- [x] Fix navigation crash after opening/closing settings menu
- [ ] Integrate `getOpenClawLogs()` with UI - logs showing "No log output"

## High Priority

- [ ] Widget drag-and-drop arrangement
- [ ] Multiple dashboard profiles/pages
- [ ] Fix worker timer leak - add `.unref()` to timers (causing test warnings)

## Nice to Have

- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Theme auto-switching based on system preference (dark/light/auto)
- [ ] Session quick-switch fuzzy finder (Ctrl+K style)
- [ ] Custom widget slots - pin 3-4 widgets to a "favorites" row
- [ ] Export scheduling - cron-style auto-export of metrics

## Plugin Ecosystem

- [ ] Plugin template repository for developers
- [ ] Plugin marketplace/discovery system
- [ ] Widget playground for live-preview during development
- [ ] Widget testing utilities for plugin developers
- [ ] Plugin sandbox with Node.js VM module for security

## Technical Debt

- [ ] Improve test coverage on error handling paths (~41% function coverage)
- [ ] TypeScript migration - start with `validation.js`, `security.js`
- [ ] Enable ESLint for workers (currently ignored: `src/workers/**`)
- [ ] Add JSDoc coverage for PluginAPI public methods
- [ ] Bundle size audit - analyze esbuild output for optimizations

## Observability

- [ ] Structured logging with JSON output mode for log aggregation
- [ ] Prometheus-compatible metrics endpoint for dashboard's own metrics
- [ ] Health check improvements - add dependency health (gateway, worker pool)