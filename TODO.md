# TODO

## Status Overview

**Last Review:** 2026-02-27
**Branch:** dev
**Overall Health:** Excellent (427 tests passing, all features functional)

### Recently Completed

- [x] Environment variable interpolation in widget configs (`${VAR}` and `${VAR:-default}`)
- [x] Config versioning with migration framework (`__version` field support)
- [x] Config processor module (`src/widgets/config-processor.js`) with:
  - Environment variable interpolation
  - Config version validation
  - Migration path registry
  - `extractEnvRequirements()` for docs
- [x] Widget loader integration (processes plugin configs before instantiation)
- [x] Example plugin updates (api-status v1.1.0, weather-widget with env vars)
- [x] Comprehensive tests for config-processor (452+ test cases)
- [x] CJS build updated with new exports

---

## Test Coverage Gaps

- [ ] Add tests for `cache.js` (TTL cache, getOrFetch, debounce/throttle)
- [ ] Add tests for `validation.js` (input validation functions)
- [ ] Add tests for `security.js` (path validation, sanitization)
- [ ] Add tests for `config.js` (constants, defaults validation)
- [ ] Add tests for `database.js` (history persistence)
- [ ] Add tests for `worker-pool.js` (task execution, timeout handling)

## Widget System

- [ ] Widget config hot-reload (watch config file, reinitialize without restart)
- [ ] Plugin scaffolding CLI (`clawdash create-plugin <name>`)
- [ ] JSON Schema for plugin manifest with validation
- [ ] Plugin hot-reload for development (auto-reload on file change)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (Istanbul/c8)
- [ ] Dependabot for dependency updates

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc-to-API-docs generation pipeline
- [ ] Add JSDoc types to core modules (cache.js, config.js, database.js)

## Future Ideas

- [ ] Dashboard layout save/restore (persist widget arrangement)
- [ ] Plugin marketplace discovery (registry format)
- [ ] Theme builder CLI (interactive theme creation)
- [ ] Keyboard macro recording (custom key sequences)
- [ ] Memory profiling tools (detect leaks in long-running sessions)

---

## Recommendations for Next Sprint

1. **Widget Config Hot-Reload** (High Impact): Building on the config processor work, add file watching to automatically reload widget configs
2. **Plugin Developer Tooling** (Medium Priority): CLI scaffolding tool would reduce friction for new plugin developers
3. **CI/CD Pipeline** (Medium Priority): GitHub Actions would ensure tests run on all PRs and provide automated releases

## Known Issues / Technical Debt

- Duplicate `src/config-processor.js` removed (was unused, src/widgets/config-processor.js is the correct location)
- Widget config versioning uses `__version` field (consider documenting this in PLUGINS.md)
