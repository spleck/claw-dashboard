# TODO

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
- [ ] Terminal keyboard shortcuts for navigation

## Plugin Developer Experience

- [ ] Generate TypeScript types from plugin manifest
- [ ] Plugin API versioning for backward compatibility
- [x] Add `loadAndRegister` convenience method to widgetLoader
- [x] Plugin scaffolding CLI tool
- [x] Plugin manifest validator (CLI)

## Backlog

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard sharing via URL with embedded config
- [ ] Plugin dependency resolution

---

## Current Status (2026-02-28)

### Test Results
- **Total: 1293 tests** (1276 passing, 17 failing)
- **E2E Tests: 17 failing** - failures due to lazy-loading architecture, not bugs

### Recently Completed

1. **`loadAndRegister` convenience method** - Added to WidgetLoader with tests
   - Combines `register()` and `load()` into single call
   - Useful for tests and eager-loading scenarios

2. **Plugin scaffolding CLI tool** - IMPLEMENTED

3. **Plugin manifest validator (CLI)** - IMPLEMENTED

### Known Issues

**E2E Test API Alignment Required**

The following test failures are due to lazy-loading architecture:

| Test | Issue | Root Cause |
|------|-------|------------|
| `isLoaded()` after `loadPlugin()` | Returns `false` | Widget registered but lazy-loaded; `isLoaded` checks `widget.loaded` flag |
| `widgetLoader.get()` | Returns `null` | Returns instance only if `widget.loaded` is true |
| Full E2E workflow | `getData` on null | Need to await `widgetLoader.load(id)` after registration |
| Hot-reload | `isLoaded` returns false | Same lazy-loading behavior |

**Implementation Note:**
The widget loader correctly implements lazy-loading by default. Widgets are only auto-loaded when `manifest.lazyLoad === false`. The E2E tests expect eager loading.

**Recommended Fix:**
Add an `eager: true` option to `loadPlugin()` for test scenarios:

```javascript
// In widget-loader.js loadPlugin method:
async loadPlugin(pluginPath, options = {}) {
  const { eager = false, ... } = options;
  // ... existing code ...
  this.register(id, manifest, loader);

  // Auto-load if not lazy OR if eager flag is set
  if (manifest.lazyLoad === false || eager) {
    await this.load(id);
  }
  return id;
}
```

Then update E2E tests:
```javascript
await widgetLoader.loadPlugin(pluginDir, { eager: true });
```

### Next Priorities

1. **Fix E2E tests** - Add `eager` option to `loadPlugin` and update tests
2. **Test coverage** - Add tests for `gateway-manager.js` and `web-server.js`
3. **CI/CD setup** - GitHub Actions workflow
