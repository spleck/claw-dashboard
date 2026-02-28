# TODO

## Testing

- [ ] Test `gateway-manager.js` (API calls, error handling, retry logic, rate limiting)
- [ ] Test `config-watcher.js` (file watching, debouncing)
- [ ] Test `web-server.js` (routes, middleware)
- [ ] Error boundary tests for widget isolation

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
- [ ] CJS bundle asset resolution (embed schema as JSON if needed)
- [x] Implement memory pressure detection for long-running sessions

## Features

- [ ] Plugin configuration UI (edit config.json from dashboard)
- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Widget drag-and-drop arrangement
- [ ] Terminal keyboard shortcuts for navigation

## Plugin Developer Experience

- [ ] Generate TypeScript types from plugin manifest
- [ ] Plugin API versioning for backward compatibility

## Future Ideas

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

1. **Memory Pressure Detection** - **COMPLETED** ✓
   - `src/memory-pressure.js` - Full implementation with trend analysis
   - `src/config.js` - MEMORY_PRESSURE configuration added
   - `src/performance-monitor.js` - Integration with status bar and degraded state detection
   - Features:
     - 5-tier pressure levels (none, elevated, warning, critical, emergency)
     - Trend detection with growth rate calculation (MB/min)
     - Sustained pressure detection (configurable duration)
     - Auto GC requests when available (--expose-gc flag)
     - Rate-limited sustained pressure alerts
     - Recommendations based on current state

2. **CLI Module Tests** - 33 tests added and passing
   - `tests/cli.test.js` covers argument parsing, help output, version display
   - Tests all CLI flags (--help, --version, --debug, --web, --watch, etc.)
   - Validates plugin scaffolding exports

3. **Plugin Lifecycle E2E Tests** - 38 tests added (21 passing, 17 need API alignment)
   - `tests/plugin-lifecycle-e2e.test.js` covers full plugin lifecycle
   - Plugin discovery, validation, loading, rendering tests passing
   - Error handling tests partially passing
   - Tests for dependency resolution need alignment with actual API

### Test Results

- **Total: 1290 tests** (1273 passing, 17 failing)
- **E2E Tests: 21/38 passing** - failures due to API mismatches between test expectations and widget loader implementation
- CLI tests: 33/33 passing
- All existing test suites continue to pass

### Known Issues

**E2E Test API Alignment Required**

The following test failures are due to lazy-loading architecture, not bugs:

| Test | Issue | Actual Behavior |
|------|-------|-----------------|
| `isLoaded()` after `loadPlugin()` | Returns `false` | Widget registered but lazy-loaded, `isLoaded` checks `widget.loaded` flag |
| `widgetLoader.get()` | Returns `null` | Returns instance only if `widget.loaded` is true |
| Full E2E workflow | `getData` on null | Need to await `widgetLoader.load(id)` after registration |
| Hot-reload | `isLoaded` returns false | Same lazy-loading behavior |

**Recommended Fixes for E2E Tests:**

```javascript
// After loadPlugin, explicitly load the widget
await widgetLoader.loadPlugin(pluginDir);
const instance = await widgetLoader.load('widget-id'); // Force load
expect(widgetLoader.isLoaded('widget-id')).toBe(true);
expect(instance.getData).toBeDefined();
```

Or add a convenience method to `widgetLoader`:
```javascript
// Option: Add loadAndRegister method
async loadAndRegister(pluginDir) {
  const result = await this.loadPlugin(pluginDir);
  const metadata = this.getMetadata(result.id);
  if (!metadata.lazyLoad) {
    await this.load(result.id);
  }
  return result;
}
```

### Recommendations

**Next Priority: Fix E2E Test API Alignment**

Option A: Update tests to match lazy-loading behavior (recommended)
- Add `await widgetLoader.load(id)` after `loadPlugin` in tests
- Update test expectations to account for lazy-loading

Option B: Add eager loading option to `loadPlugin`
- Add `eager: true` option to load immediately after registration

**Secondary: Gateway Manager Testing**

Add tests for:
- API call retry logic with exponential backoff
- Rate limiting integration
- Error handling for various HTTP status codes
- Circuit breaker behavior on repeated failures

**Tertiary: Memory Pressure Testing**

While the implementation is complete, consider adding:
- Unit tests for `MemoryPressureDetector` class
- Mock memory usage to test threshold detection
- Trend calculation verification tests
