# TODO

## Completed ✓

- [x] **Web Server Authentication (v1.11.0)** - API key/token-based authentication
  - `ApiKeyAuth` class in `security.js` with secure key generation using `crypto.randomBytes`
  - Configurable auth scheme (Bearer), header name, and key format (`cd_` prefix + 32 chars)
  - IP-based brute force protection with automatic blocking (5 failed attempts → 60s block)
  - Key revocation support with hash-based storage (SHA-256, actual keys never stored)
  - Full integration with `WebServer` - auth applied to all endpoints except `/health`
  - Management methods: `generateApiKey()`, `revokeApiKey()`, `listApiKeys()`

## High Priority

- [ ] Test `worker-pool.js` (task execution, timeout handling)
- [ ] Test `gateway-manager.js` (API calls, error handling)

## DX & Tooling

- [ ] Pre-commit hooks (lint, test)
- [ ] GitHub Actions CI (test on push, build on release)
- [ ] Code coverage reporting (c8/Istanbul)
- [ ] Plugin manifest validator CLI (`clawdash validate-plugin <path>`)

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
**Total Tests:** 989 passing
**Version:** 1.10.0 → 1.11.0 (pending release)

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
   - `ApiKeyAuth` class with:
     - Cryptographically secure key generation (`crypto.randomBytes`)
     - SHA-256 hashed key storage (plaintext keys never stored)
     - Brute force protection with IP-based blocking
     - Configurable key format and auth scheme
   - Integration with all HTTP endpoints (`/health`, `/metrics`, `/sessions`, `/agents`, `/logs`, `/status`)
   - Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
   - Auth headers: `WWW-Authenticate`, `X-Auth-Key-Id`

2. **Test Coverage:**
   - 989 total tests across 21 test suites
   - All tests passing (no regressions)

### Recommendations

1. **Next Priority:** Complete test coverage for `worker-pool.js` and `gateway-manager.js`
2. **CI/CD:** Implement GitHub Actions for automated testing on PRs
3. **Code Quality:** Consider TypeScript migration starting with validation.js
4. **Security:** Document API key management best practices for production

### Production Deployment Notes

- **Authentication:** Disabled by default (`WEB.AUTH.ENABLED: false`). Enable explicitly for production.
- **Rate Limiting:** Currently enabled by default (100 req/min). Adjust `WEB.RATE_LIMIT.MAX_REQUESTS` based on expected load.
- **CORS:** Defaults to `'*'` (allow-all). Set `WEB.CORS.ALLOWED_ORIGINS` to specific domains in production.
- **Proxy Support:** Enable `WEB.RATE_LIMIT.TRUST_PROXY` when behind a reverse proxy to correctly identify client IPs.
- **API Keys:** Keys are shown only once upon creation. Store them securely in environment variables or secrets manager.

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
  AUTH: {
    ENABLED: true,            // Enable for production
    HEADER_NAME: 'Authorization',
    SCHEME: 'Bearer',
    KEY_PREFIX: 'cd_',
    KEY_LENGTH: 32,
    MAX_KEYS: 10,
  },
};
```
