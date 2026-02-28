# TODO

## Current Status (2026-02-28)

### Recently Completed
- ✅ Terminal keyboard shortcuts for navigation (Tab/Shift+Tab widget cycling)
- ✅ `loadAndRegister` convenience method for widget loading
- ✅ Plugin scaffolding CLI tool
- ✅ Plugin manifest validator (CLI)

### Active Development
- Widget configuration enhancements (hot-reload, versioning)
- E2E test improvements for lazy-loading architecture

## Testing

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `web-server.js` (routes, middleware)
- [ ] Error boundary tests for widget isolation
- [ ] Fix E2E test API alignment with lazy-loading (add `eager` option to `loadPlugin`)

## CI/CD

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [ ] Expand `PluginError` pattern to config/validation errors

## Features

- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Widget drag-and-drop arrangement
- [x] Terminal keyboard shortcuts for navigation
- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages

## Plugin Developer Experience

- [ ] Generate TypeScript types from plugin manifest
- [ ] Plugin API versioning for backward compatibility
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
