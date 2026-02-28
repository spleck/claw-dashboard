# TODO

## High Priority

- [x] Test `src/cli/` modules (argument parsing, error paths, help output) - **COMPLETED: 33 tests passing**
- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `config-watcher.js` (file watching, debouncing)
- [ ] Test `web-server.js` (routes, middleware)
- [ ] Implement memory pressure detection for long-running sessions

## Testing & CI

- [x] Integration tests (end-to-end plugin load/validate/render cycle) - **PARTIAL: E2E tests added (21/38 passing), needs API alignment**
- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification
- [ ] Expand `PluginError` pattern to config/validation errors
- [ ] CJS bundle asset resolution (embed schema as JSON if needed)
- [ ] Error boundary tests for widget isolation

## Features

- [ ] Plugin configuration UI (edit config.json from dashboard)
- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Widget drag-and-drop arrangement
- [ ] Terminal keyboard shortcuts for navigation

## Plugin Developer Experience

- [ ] Generate TypeScript types from plugin manifest
- [ ] Plugin API versioning for backward compatibility

## Backlog

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard sharing via URL with embedded config
- [ ] Plugin dependency resolution

---

## Status Summary (2026-02-28)

### Recently Completed

1. **CLI Module Tests** - 33 tests added and passing
   - `tests/cli.test.js` covers argument parsing, help output, version display
   - Tests all CLI flags (--help, --version, --debug, --web, --watch, etc.)
   - Validates plugin scaffolding exports

2. **Plugin Lifecycle E2E Tests** - 38 tests added (21 passing, 17 need API alignment)
   - `tests/plugin-lifecycle-e2e.test.js` covers full plugin lifecycle
   - Plugin discovery, validation, loading, rendering tests passing
   - Error handling tests partially passing
   - Tests for dependency resolution need alignment with actual API

### Test Results

- **Total: 1273 tests passing** across 28 test suites
- **E2E Tests: 21/38 passing** - failures due to API mismatches between test expectations and widget loader implementation
- CLI tests: 33/33 passing
- All existing test suites continue to pass

### Recommendations

**Next Priority: Fix E2E Test API Alignment**

The following E2E test areas need updates to match actual widget loader behavior:
- `isLoaded()` checks after `loadPlugin()` - widget loader registers but lazy-loads
- `widgetLoader.get()` returns widget registry entry, not instance directly
- Dependency resolution tests need to account for async loading behavior
- Hot-reload test needs to use actual file watcher or manual re-registration

**Secondary: Gateway Manager Testing**

Add tests for:
- API call retry logic with exponential backoff
- Rate limiting integration
- Error handling for various HTTP status codes
- Circuit breaker behavior on repeated failures
