# TODO

## Status Overview

**Last Review:** 2026-02-27
**Branch:** dev
**Overall Health:** Excellent (895 tests passing, all features functional)

### Recently Completed

- [x] **Plugin Hot-Reload** (`src/plugin-reload.js`) - Auto-reload plugins during development with `PluginReloadManager` (41 tests)
- [x] ConfigWatcher plugin directory watching integration (`PluginReloadManager` integrates with `WidgetLoader`)
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
- [x] Plugin hot-reload for development (auto-reload on file change)
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

1. **Document `__version` Field** (High Priority): Plugin developers need to understand config versioning for migration support. Add section to PLUGINS.md explaining:
   - How to use `__version` in widget configs
   - Migration patterns for config upgrades
   - Backward compatibility best practices

2. **Widget Dependency System** (High Priority): Enable widgets to declare dependencies on other widgets for ordered initialization. Design considerations:
   - Add `dependencies` field to plugin manifest
   - Implement topological sort for init order
   - Handle circular dependency errors gracefully

3. **CI/CD Pipeline** (Medium Priority): GitHub Actions workflow for:
   - Run tests on all PRs
   - Lint and type-check validation
   - Automated releases on version tags
   - C8 code coverage reporting

4. **Plugin Manifest Validator CLI** (Medium Priority): Implement `clawdash validate-plugin <path>`:
   - Validate against JSON Schema
   - Check required files exist
   - Warn about common mistakes

5. **TypeScript Migration** (Medium Priority): Start migration with:
   - `src/validation.js` and `src/security.js` first
   - Gradual adoption with `.d.ts` files
   - Maintain CJS/ESM dual-package compatibility

## Known Issues / Technical Debt

- Widget config versioning uses `__version` field (needs documentation in PLUGINS.md)
- [x] ConfigWatcher plugin directory watching - **DONE** via `PluginReloadManager` in `src/plugin-reload.js`
- Jest test runner shows open handles warning for widget-error-isolation.test.js (non-critical, tests pass)

## Stats

- **Total Tests:** 895
- **Test Suites:** 19
- **Coverage Areas:** errors, rate-limiter, plugin-api, example-plugins, integration, database, widget-error-isolation, security, config-watcher, validation, config, cache, retry, plugin-reload
