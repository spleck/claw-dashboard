# TODO

## Status Overview

**Last Review:** 2026-02-27
**Branch:** dev
**Overall Health:** Excellent (769 tests passing, all features functional)

### Recently Completed

- [x] ConfigWatcher module (`src/config-watcher.js`) for file watching
- [x] Hot-reload integration in main dashboard lifecycle
- [x] Dashboard settings hot-reload (theme, refresh interval, widget visibility, gateways)
- [x] Test coverage for cache.js (TTL, getOrFetch, debounce/throttle)
- [x] Test coverage for config-watcher.js (debouncing, polling, reload events)
- [x] Test coverage for security.js (path validation, plugin security, widget config)
- [x] Test coverage for config.js (constants validation)
- [x] Test coverage for validation.js (input validation functions)
- [x] Plugin scaffolding CLI (`clawdash create-plugin <name>`)
- [x] JSON Schema for plugin manifest (`schemas/plugin-manifest.json`)
- [x] Plugin manifest validation module (`src/plugin-validator.js`)
- [x] Plugin manifest format utilities (`src/plugin-manifest-validator.js`)
- [x] CLI command integration in `index.js` for `create-plugin`

---

## High Priority

- [ ] Document `__version` field in PLUGINS.md (widget config versioning)
- [ ] Plugin hot-reload for development (auto-reload on file change)
- [ ] Widget dependency system (declare dependencies for ordered init)
- [ ] Widget error isolation (crashed widget doesn't break dashboard)

## Test Coverage

- [ ] Test `database.js` (history persistence)
- [ ] Test `worker-pool.js` (task execution, timeout handling)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Dependabot for dependency updates
- [ ] Plugin manifest validator CLI tool (e.g., `clawdash validate-plugin <path>`)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded

---

## Recommendations for Next Sprint

1. **Plugin Developer Tooling** (High Priority): CLI scaffolding tool would reduce friction for new plugin developers
2. **Document `__version` Field** (Medium Priority): Important for plugin developers to understand config versioning
3. **CI/CD Pipeline** (Medium Priority): GitHub Actions would ensure tests run on all PRs and provide automated releases

## Known Issues / Technical Debt

- Widget config versioning uses `__version` field (needs documentation in PLUGINS.md)
- ConfigWatcher plugin directory watching is implemented but not integrated (see `watchPluginsDirectory` function for future use)

## Future Ideas

- [ ] Dashboard config export/import (share dashboard layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] Richer notifications/alerts beyond rate limiting
- [ ] Plugin API versioning for backward compatibility
