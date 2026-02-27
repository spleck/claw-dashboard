# TODO

## Status Overview

**Last Review:** 2026-02-27
**Branch:** dev
**Overall Health:** Excellent (854 tests passing, all features functional)

### Recently Completed

- [x] Widget error isolation (`src/widgets/widget-error-isolation.js`) - prevents widget crashes from breaking dashboard
- [x] Database test coverage (`tests/database.test.js`) - 46 tests for metrics persistence
- [x] ConfigWatcher module (`src/config-watcher.js`) for file watching
- [x] Hot-reload integration in main dashboard lifecycle
- [x] Dashboard settings hot-reload (theme, refresh interval, widget visibility, gateways)
- [x] Plugin scaffolding CLI (`clawdash create-plugin <name>`)
- [x] JSON Schema for plugin manifest (`schemas/plugin-manifest.json`)
- [x] Plugin manifest validation module (`src/plugin-validator.js`)
- [x] Plugin manifest format utilities (`src/plugin-manifest-validator.js`)
- [x] CLI command integration in `index.js` for `create-plugin`
- [x] Widget config environment interpolation and versioning
- [x] CJS/ESM dual-package exports

---

## High Priority

- [ ] Document `__version` field in PLUGINS.md (widget config versioning)
- [ ] Plugin hot-reload for development (auto-reload on file change)
- [ ] Widget dependency system (declare dependencies for ordered init)

## Test Coverage

- [ ] Test `worker-pool.js` (task execution, timeout handling)

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

## Future Features

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] Plugin API versioning for backward compatibility
- [ ] User preferences persistence (theme, refresh rate)

---

## Recommendations for Next Sprint

1. **Document `__version` Field** (High Priority): Plugin developers need to understand config versioning for migration support
2. **Plugin Hot-Reload** (High Priority): Auto-reload during development would significantly improve DX
3. **CI/CD Pipeline** (Medium Priority): GitHub Actions would ensure tests run on all PRs and provide automated releases
4. **Widget Dependency System** (Medium Priority): Ordered widget initialization would enable complex widget interactions

## Known Issues / Technical Debt

- Widget config versioning uses `__version` field (needs documentation in PLUGINS.md)
- ConfigWatcher plugin directory watching is implemented but not integrated (see `watchPluginsDirectory` function for future use)
- Jest test runner shows open handles warning for widget-error-isolation.test.js (non-critical, tests pass)

## Stats

- **Total Tests:** 854
- **Test Suites:** 18
- **Coverage Areas:** errors, rate-limiter, plugin-api, example-plugins, integration, database, widget-error-isolation, security, config-watcher, validation, config, cache, retry
