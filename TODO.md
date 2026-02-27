# TODO

## High Priority
- [ ] Fix CJS/ESM compatibility issues in build/output

## Medium Priority
- [ ] Add error handling for plugin loading/fallback scenarios
- [ ] Document widget plugin API and lifecycle hooks
- [ ] Add widget e2e or integration tests
- [ ] Implement input sanitization for user-provided widget configs

## Backlog / Considerations
- [ ] Migrate to TypeScript for better type safety
- [ ] Add API documentation generation from JSDoc
- [ ] Create example plugins in `examples/` directory
- [ ] Add security review for user input paths

---

## Status (2026-02-27)

### Recently Completed
- [x] Added comprehensive unit tests for RateLimiter class
  - All 52 RateLimiter tests passing in `tests/rate-limiter.test.js`
  - Coverage: constructor, check, checkAndRecord, record, getCount, getRetryAfter, getStatus, configure, reset, alwaysAllowCritical behavior, and global integration
  - Tests validate atomic check-and-record operations eliminate race conditions

### Test Results
- **245 tests passing** (up from 203, +42 new RateLimiter tests)
- All test suites: 7 passed, 7 total

### Code Quality
- ESLint: No issues
- All modules using consistent ESM imports

### Recommendations

1. **CJS/ESM Compatibility**: Still the main high-priority item. Consider dual-package.json setup or exports map in package.json for users who need `require()` support.

2. **Widget Plugin System**: The medium priority items suggest this is active development - focus on error handling and documentation next.

3. **TypeScript Migration**: The RateLimiter class would benefit significantly from type safety - consider this for the backlog sprint.
