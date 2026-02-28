# TODO

## Completed ✓

- [x] **Web Server Security (v1.11.0)** - Comprehensive security layer for web server
  - `WebRateLimiter` class with per-IP tracking and sliding window
  - `CorsManager` class with origin allowlist and wildcard support
  - `ApiKeyAuth` class with secure key generation and brute force protection
  - Full integration with all HTTP endpoints
  - Configurable via `WEB.RATE_LIMIT`, `WEB.CORS`, and `WEB.AUTH` config

- [x] **Plugin Manifest Validator CLI** - Developer tooling for plugin validation
  - `clawdash validate-plugin <path>` command for validating plugin.json files
  - Supports both file path and directory path inputs
  - JSON output mode with `--json` flag
  - Comprehensive validation against JSON schema
  - 23 CLI tests covering all validation scenarios

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [x] ~~Plugin manifest validator CLI~~ (`clawdash validate-plugin <path>`) - **COMPLETED**

## Code Quality

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc types for core modules (cache.js, config.js, database.js)
- [ ] Graceful degradation when worker pool is overloaded
- [ ] Handle silent database failures with user notification

## Features

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] Plugin API versioning for backward compatibility
- [ ] User preferences persistence (theme, refresh rate)

## Enhancements

- [ ] Real-time WebSocket updates (push data instead of polling)
- [ ] Widget drag-and-drop arrangement
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Auto theme detection (follows system dark/light mode)
- [ ] Terminal keyboard shortcuts for navigation
- [ ] Dashboard sharing via URL with embedded config
- [ ] Widget error boundary with retry UI

---

## Status Summary (2026-02-27)

**Current Branch:** dev
**Total Tests:** 1012 passing
**Version:** 1.10.0 → 1.11.0 (pending release)

### Recent Achievements

1. **Plugin Manifest Validator CLI:**
   - New `clawdash validate-plugin <path>` command
   - Validates plugin.json against JSON schema
   - Supports directory or file path input
   - JSON output mode with `--json` / `-j` flags
   - 23 comprehensive CLI tests (all passing)
   - Validates: required fields, ID format, semver, types, categories, priority ranges

2. **Web Server Security (Previously Completed):**
   - `WebRateLimiter` class with sliding window
   - `CorsManager` class with origin allowlist
   - `ApiKeyAuth` class with brute force protection
   - All endpoints protected except `/health`

### Recommendations

1. **Next Priority:** Complete test coverage for `worker-pool.js` and `gateway-manager.js`
2. **CI/CD:** Implement GitHub Actions for automated testing on PRs
3. **Code Quality:** Consider TypeScript migration starting with validation.js
4. **Documentation:** Document the new `validate-plugin` CLI in PLUGINS.md

### Production Deployment Notes

- **Authentication:** Disabled by default (`WEB.AUTH.ENABLED: false`). Enable explicitly for production.
- **Rate Limiting:** Currently enabled by default (100 req/min). Adjust `WEB.RATE_LIMIT.MAX_REQUESTS` based on expected load.
- **CORS:** Defaults to `'*'` (allow-all). Set `WEB.CORS.ALLOWED_ORIGINS` to specific domains in production.
- **Proxy Support:** Enable `WEB.RATE_LIMIT.TRUST_PROXY` when behind a reverse proxy to correctly identify client IPs.
- **API Keys:** Keys are shown only once upon creation. Store them securely in environment variables or secrets manager.

---

## CLI Usage Examples

```bash
# Validate a plugin manifest
clawdash validate-plugin ./my-widget/plugin.json
clawdash validate-plugin ~/.openclaw/plugins/my-widget

# Output as JSON for CI/CD
clawdash validate-plugin ./my-widget --json

# Create a new plugin scaffold
clawdash create-plugin my-widget
```
