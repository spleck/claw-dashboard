# TODO

## Status Summary (2026-02-27)

**Current Branch:** dev
**Total Tests:** 1057 passing
**Version:** 1.10.0 → 1.11.0 (pending release)

### Recently Completed

1. **Auto Theme Detection** - Follows system dark/light mode
   - macOS support via `AppleInterfaceStyle` detection
   - Linux support via `gsettings` (GNOME/GTK)
   - Environment variable detection (COLORFGBG, DARK_MODE, THEME)
   - Terminal background fallback detection
   - Real-time theme watching with 2-second polling on macOS
   - Theme change notification system with `onThemeChange()`
   - Dashboard auto-renders when theme changes
   - Proper cleanup on exit
   - 14 comprehensive tests (all passing)

2. **Plugin Manifest Validator CLI** (previously completed)
3. **Web Server Security** (previously completed) - Rate limiting, CORS, API key auth

### Recommendations

1. **Next Priority:** Complete test coverage for `worker-pool.js` and `gateway-manager.js`
2. **CI/CD:** Implement GitHub Actions for automated testing on PRs
3. **Documentation:** Document the auto theme detection in README.md
4. **Code Quality:** Consider TypeScript migration starting with validation.js

---

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Plugin scaffolding CLI (`clawdash create-plugin`)
- [ ] Configuration validation CLI (`clawdash validate-config`)
- [ ] Plugin debug mode improvements (verbose logging, error stack traces)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification

## Features

- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] User preferences persistence (theme, refresh rate)
- [ ] Plugin configuration UI (edit config.json from dashboard)

## Enhancements

- [ ] Real-time WebSocket updates (push data instead of polling)
- [ ] Widget drag-and-drop arrangement
- [x] Auto theme detection (follows system dark/light mode)
- [ ] Terminal keyboard shortcuts for navigation

## Plugin Developer Experience

- [ ] Plugin hot-reload with file watcher
- [ ] Better error messages for common plugin mistakes
- [ ] Generate TypeScript types from plugin manifest

---

## Backlog (Future Considerations)

- Dashboard config export/import (share layouts)
- Multiple dashboard profiles/pages
- Plugin API versioning for backward compatibility
- Widget marketplace/discovery system
- Plugin analytics (usage stats, performance metrics)
- Widget performance profiling and slow-widget detection
- Dashboard sharing via URL with embedded config
- Plugin dependency resolution (install deps alongside plugin)
