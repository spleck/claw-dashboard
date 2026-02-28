# TODO

## Completed (2026-02-27)

- [x] Configuration validation CLI (`clawdash validate-config`)
  - Module: `src/config-validator.js` (586 lines, comprehensive validation)
  - Tests: 59 tests covering all validation scenarios
  - CLI: `clawdash validate-config [path] [options]`
  - Features: JSON output (`-j`), strict mode (`-s`), default path resolution

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)
- [ ] Complete test coverage for core modules

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Plugin scaffolding CLI (`clawdash create-plugin`)
- [ ] Plugin debug mode improvements (verbose logging, error stack traces)

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification

## Features

- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] User preferences persistence (theme, refresh rate)
- [ ] Plugin configuration UI (edit config.json from dashboard)

## Enhancements

- [ ] Real-time WebSocket updates (push data instead of polling)
- [ ] Widget drag-and-drop arrangement
- [ ] Terminal keyboard shortcuts for navigation

## Plugin Developer Experience

- [ ] Plugin hot-reload with file watcher
- [ ] Better error messages for common plugin mistakes
- [ ] Generate TypeScript types from plugin manifest
- [ ] Plugin manifest validation on load

## Backlog

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Plugin API versioning for backward compatibility
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Dashboard sharing via URL with embedded config
- [ ] Plugin dependency resolution (install deps alongside plugin)

---

## Recommendations

### Immediate Next Steps

1. **Plugin scaffolding CLI** - Next DX priority after config validation
   - Leverage existing `src/plugin-scaffold.js` foundation
   - Add interactive prompts for widget type selection
   - Include template for widget with configuration schema

2. **Test worker-pool.js** - Core infrastructure gap
   - Critical for dashboard stability under load
   - Test timeout handling and worker recovery

3. **GitHub Actions CI** - Automation foundation
   - Run 1116 tests on PR/push
   - Build CJS bundles on release
   - Blocked on: repository permissions

### Code Quality Observations

- **config-validator.js**: Well-structured with comprehensive validation
  - Consider adding `ajv` for JSON Schema validation if configs grow complex
  - Current manual validation is fine for current scope
- **Test coverage**: Excellent at 1116 tests across 24 suites
  - Consider adding stress/integration tests for concurrent widget loading

### Architecture Notes

- Theme system (`auto` detection) recently added - update docs if not done
- Rate limiting in place for Plugin API - good for security
- Consider extracting validation logic into separate package for reuse

## Recommendations

### Next Priority Actions
1. **Plugin scaffolding CLI** - High user value; can leverage existing `validateManifest()` and config validation patterns
2. **Pre-commit hooks** - Run lint + test before commits to catch issues early
3. **GitHub Actions CI** - Automate testing on PR/push; example config in `.github/workflows/test.yml`

### Technical Debt Notes
- Consider extracting CLI command handlers from `index.js` to dedicated `src/cli/` modules for better maintainability
- `config-validator.js` and `plugin-manifest-validator.js` share similar validation patterns - potential for shared schema validation utilities
- 1116 tests passing; maintain coverage when adding new features

### Recent Patterns Established
- CLI commands: `clawdash <command> [args]` with `--help` support
- Validation modules: Return `{ valid, errors, warnings, info, stats }` pattern
- Test structure: Unit tests + CLI integration tests with temp file cleanup
