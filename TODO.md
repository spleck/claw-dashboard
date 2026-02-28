# TODO

## Current Status (2026-02-28)

### Recently Completed
- ✅ Widget templates CLI - `create-plugin` now supports 3 templates (basic, api, chart)
- ✅ `list-templates` CLI command to view available templates
- ✅ Template-specific widget generation with proper manifest and code
- ✅ Plugin scaffolding enhanced with category, description options
- ✅ All 1345 tests passing (32 test suites)

### Test Status
- **All tests passing**: 32 test suites, 1344 passed, 1 skipped
- **Skipped test**: "should handle plugin with syntax error in entry point" - Known Jest/VM module limitation

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
- [ ] Dashboard auto-save (periodic state persistence)

## Plugin Developer Experience
- [ ] Generate TypeScript types from plugin manifest
- [x] Plugin API versioning for backward compatibility
- [x] Widget templates CLI (scaffold new widgets from templates)
- [ ] Widget playground (live-preview during development)

## Observability & Debugging
- [ ] Built-in performance profiling for widgets
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard health score (aggregate widget status)
- [ ] Crash reporting from widget sandbox

## Polish
- [ ] Error recovery UI (retry buttons for failed widgets)
- [ ] Accessibility improvements (screen reader support)

## Developer Experience
- [x] Interactive debug mode (verbose logging toggle)

---

## Recommendations for Next Sprint

### High Priority
1. **Widget Playground** - Live preview during development would complete the DX improvements
2. **TypeScript Migration** - Start with validation.js and security.js for type safety
3. **Error Recovery UI** - Build on existing error handling to add retry buttons

### Medium Priority
4. **GitHub Actions CI** - Set up automated testing on push/PR
5. **Dashboard Auto-Save** - Periodic state persistence to prevent config loss
6. **Widget Performance Profiling** - Detect slow widgets before they impact dashboard

### Technical Debt
7. **Graceful Degradation** - Handle worker pool overload scenarios
8. **Code Coverage Reporting** - Add c8/Istanbul for visibility into untested code

### Notes
- Widget templates CLI is production-ready with 3 template types
- Consider adding more templates (table, gauge, log-viewer) based on user feedback
- Plugin scaffolding could be extended with interactive prompts (inquirer.js)
