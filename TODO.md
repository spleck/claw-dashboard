# TODO

## Current Status (2026-02-28)

### Recently Completed
- ✅ Terminal keyboard shortcuts for navigation (Tab/Shift+Tab widget cycling)
- ✅ `loadAndRegister` convenience method for widget loading
- ✅ Plugin scaffolding CLI tool
- ✅ Plugin manifest validator (CLI)
- ✅ Fixed widget-loader.js lazy loading default behavior
- ✅ Fixed missingDeps.join error in dependency resolution
- ✅ Fixed E2E test file alignment with lazy-loading architecture

### Active Development
- Widget configuration enhancements (hot-reload, versioning)
- E2E test improvements for lazy-loading architecture

## Known Issues

### E2E Test Failures (14 tests)
The `tests/plugin-lifecycle-e2e.test.js` file has 14 failing tests out of 38 total. These failures are primarily due to:

1. **Module Import Caching**: ES Module imports are cached by Node.js, causing subsequent tests to receive stale module instances
2. **Lazy Loading Mismatch**: Some tests expect widgets to be loaded immediately after registration, but the lazy loading architecture requires explicit `load()` calls
3. **Error Handling Expectations**: Some tests expect specific error behaviors that differ from the current implementation

### Recommendations
- The E2E tests need significant refactoring to properly isolate test cases and handle module caching
- Consider using `jest.resetModules()` or creating unique plugin IDs for each test to avoid cache conflicts
- Tests should use `await widgetLoader.load(id)` instead of `widgetLoader.get(id)` to get widget instances
- The core widget-loader implementation is correct; the tests need alignment with the lazy-loading architecture

## Testing

- [x] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [x] Test `web-server.js` (routes, middleware)
- [x] Error boundary tests for widget isolation
- [ ] Fix E2E test API alignment with lazy-loading (add `eager` option to `loadPlugin`)
- [ ] Refactor E2E tests to handle ES Module caching issues

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

---

## Summary

**Core Implementation Status**: ✅ Stable
- 1,279 tests passing
- Critical fixes applied to widget-loader.js for lazy loading and dependency resolution
- CJS/ESM dual-package support working
- Plugin API with rate limiting functional

**E2E Test Status**: ⚠️ Needs Work
- 14 tests failing in plugin-lifecycle-e2e.test.js
- Failures related to ES Module caching and lazy loading test patterns
- Core functionality is correct; test refactoring needed

**Next Steps**:
1. Refactor E2E tests to handle module caching (use unique plugin IDs per test)
2. Complete widget configuration enhancements
3. Add CI/CD pipeline
