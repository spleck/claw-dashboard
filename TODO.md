# TODO

## Status (2026-02-28)

### Recently Completed
- [x] Dashboard auto-save (periodic state persistence) - **NEW**
  - AutoSaveManager class for periodic state saves (30s default)
  - State restoration on startup (selected session, search query, favorites, etc.)
  - Save on graceful shutdown
  - 20 tests covering all functionality
  - Integrated into main dashboard (index.js)

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
- [x] Dashboard auto-save (periodic state persistence) - **COMPLETED**

## Plugin Developer Experience
- [ ] Generate TypeScript types from plugin manifest
- [ ] Widget playground (live-preview during development)

## Observability & Debugging
- [ ] Built-in performance profiling for widgets
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard health score (aggregate widget status)
- [ ] Crash reporting from widget sandbox

## Polish
- [ ] Error recovery UI (retry buttons for failed widgets)
- [ ] Accessibility improvements (screen reader support)

---

## Backlog

### Widget Templates
- [ ] Add more templates (table, gauge, log-viewer) based on user feedback
- [ ] Interactive prompts for plugin scaffolding (inquirer.js)

### Infrastructure
- [x] Dashboard auto-save for state persistence - **COMPLETED**
- [ ] Graceful degradation for worker pool overload

---

## Recommendations

### Next Priority
1. **Widget drag-and-drop arrangement** - High user impact feature for customization
2. **TypeScript migration** - Start with `validation.js` as it's well-structured and heavily used
3. **CI/CD setup** - GitHub Actions for automated testing on PRs

### Technical Debt
- Consider adding backup rotation for auto-save (currently keeps N files but needs cleanup logic)
- Review security module exports to ensure `isValidPath` is properly documented
- Add auto-save statistics to debug/info output for troubleshooting

### Current Test Status
- **1364 tests passing** (1 skipped)
- New auto-save tests: 20 passing
- All existing functionality preserved
