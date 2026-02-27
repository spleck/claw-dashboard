# TODO

## Completed ✓

- [x] Widget configuration versioning (`__version` field) - Documented in PLUGINS.md
- [x] Widget dependency system - Full implementation with topological sorting, circular dependency detection, version constraints
  - [x] `dependency-resolver.js` with 597 lines of implementation
  - [x] Integration with `widget-loader.js` via `loadAllPluginsWithFallback()`
  - [x] Comprehensive test suite: `tests/widget-dependency.test.js` (94 tests)
  - [x] Documentation in PLUGINS.md with examples

## High Priority

- [ ] Add web server rate limiting (protect HTTP API endpoints)
- [ ] Restrict CORS in production (default is `'*'`)

## Test Coverage

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `web-server.js` (HTTP endpoints, request handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Dependabot for dependency updates
- [ ] Plugin manifest validator CLI (`clawdash validate-plugin <path>`)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Add authentication to web server (API key/token-based)
- [ ] Handle silent database failures with user notification

## Future Features

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] Plugin API versioning for backward compatibility
- [ ] User preferences persistence (theme, refresh rate)

## Status Summary (2026-02-27)

**Current Branch:** dev
**Total Tests:** 947 passing
**Version:** 1.10.0

### Recent Achievements

1. **Widget Dependency System** - Complete implementation with:
   - Dependency declaration in `plugin.json` (simple strings or objects with optional/version)
   - Topological sorting for correct load order
   - Circular dependency detection with detailed error paths
   - Version constraint checking (^, ~, >=, exact)
   - Optional dependency support
   - Integration with `loadAllPluginsWithFallback()`

2. **Widget Configuration Enhancements:**
   - Environment variable interpolation (`${VAR}` and `${VAR:-default}`)
   - Version field support (`__version`) for automatic migrations
   - Config hot-reload capability

3. **Documentation:**
   - Comprehensive widget dependencies guide in PLUGINS.md
   - Configuration versioning examples
   - Troubleshooting section with common errors

### Recommendations

1. **Next Priority:** Web server rate limiting and CORS restrictions should be addressed for production readiness
2. **Test Coverage:** Focus on worker-pool.js and web-server.js testing to improve coverage
3. **CI/CD:** Implement GitHub Actions for automated testing on PRs
4. **Code Quality:** Consider TypeScript migration starting with validation.js

### Architecture Notes

- Dependency resolution is now automatic when using `loadAllPluginsWithFallback()`
- New methods available on WidgetLoader:
  - `getDependencyInfo(id)` - Get dependency details for a widget
  - `getDependencyGraph()` - Get full dependency graph
  - `validateDependencies(id?)` - Validate dependencies
  - `loadInDependencyOrder(ids?, options?)` - Load widgets in correct order
