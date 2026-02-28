# TODO

## Completed ✓

- [x] **Web Server Security (v1.11.0)** - Production-ready rate limiting and CORS
  - `WebRateLimiter` class with sliding window per-IP tracking
  - `CorsManager` class with configurable origins and wildcard support
  - Comprehensive test suite: `tests/web-server.test.js` (42 tests)

## High Priority

- [ ] Add web server authentication (API key/token-based)
- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)

## Test Coverage

- [x] Test `web-server.js` (HTTP endpoints, rate limiting, CORS) - **42 tests**
- [ ] Test `worker-pool.js` (task execution, timeout handling)
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
- [ ] Handle silent database failures with user notification

## Future Features

- [ ] Dashboard config export/import (share layouts)
- [ ] Multiple dashboard profiles/pages
- [ ] Built-in default widgets (CPU, Memory, Disk - no plugin required)
- [ ] Plugin API versioning for backward compatibility
- [ ] User preferences persistence (theme, refresh rate)

## Creative Enhancements

- [ ] Real-time WebSocket updates (push data instead of polling)
- [ ] Widget drag-and-drop arrangement
- [ ] Widget marketplace/discovery system
- [ ] Plugin analytics (usage stats, performance metrics)
- [ ] Widget performance profiling and slow-widget detection
- [ ] Auto theme detection (follows system dark/light mode)
- [ ] Terminal keyboard shortcuts for navigation (vim-style?)
- [ ] Dashboard sharing via URL with embedded config
- [ ] Mobile-responsive UI for on-the-go monitoring
- [ ] Widget error boundary with retry UI (isolate widget crashes)

---

## Status Summary (2026-02-27)

**Current Branch:** dev
**Total Tests:** 989 passing
**Version:** 1.10.0 → 1.11.0 (pending)

### Recent Achievements

1. **Web Server Security Implementation:**
   - `WebRateLimiter` class with:
     - Per-IP request tracking with sliding window (default: 100 req/60s)
     - `X-Forwarded-For` support for reverse proxy setups
     - Automatic cleanup to prevent memory leaks
     - Configurable via `WEB.RATE_LIMIT` config
   - `CorsManager` class with:
     - Array-based origin allowlist (e.g., `['https://example.com']`)
     - Wildcard pattern support (e.g., `https://*.example.com`)
     - Credentials support with origin mirroring
     - Configurable methods, headers, and maxAge
   - Integration with all HTTP endpoints (`/health`, `/metrics`, `/sessions`, `/agents`, `/logs`, `/status`)
   - Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

2. **Test Coverage:**
   - 42 new tests for web-server security features
   - Tests for rate limiting (IP extraction, limit enforcement, headers)
   - Tests for CORS (origin validation, preflight, credentials)
   - Integration tests for HTTP endpoints

### Recommendations

1. **Next Priority:** Web server authentication (API keys/tokens) for production deployments
2. **Test Coverage:** Focus on `worker-pool.js` and `gateway-manager.js` testing
3. **CI/CD:** Implement GitHub Actions for automated testing on PRs
4. **Code Quality:** Consider TypeScript migration starting with validation.js

### Production Deployment Notes

- **Rate Limiting:** Currently enabled by default (100 req/min). Adjust `WEB.RATE_LIMIT.MAX_REQUESTS` based on expected load.
- **CORS:** Defaults to `'*'` (allow-all). Set `WEB.CORS.ALLOWED_ORIGINS` to specific domains in production.
- **Proxy Support:** Enable `WEB.RATE_LIMIT.TRUST_PROXY` when behind a reverse proxy to correctly identify client IPs.

### Configuration Example

```javascript
// config.js or environment override
export const WEB = {
  RATE_LIMIT: {
    ENABLED: true,
    WINDOW_MS: 60000,
    MAX_REQUESTS: 100,
    TRUST_PROXY: true, // When behind nginx/apache
  },
  CORS: {
    ALLOWED_ORIGINS: ['https://dashboard.example.com'],
    ALLOWED_METHODS: ['GET', 'POST'],
    CREDENTIALS: true,
  },
};
```
