# TODO

## Medium Priority
- [ ] Address CJS/ESM compatibility issues
- [ ] Add JSDoc types or consider TypeScript migration

## Low Priority
- [ ] Generate API documentation from JSDoc
- [ ] Add example plugins to examples/ directory

---
## Status (2026-02-27)

### Completed
- [x] Higher-level RateLimiter API added to `src/alerts.js`
  - New `RateLimiter` class with clean interface
  - Methods: `check()`, `record()`, `checkAndRecord()`, `getCount()`, `getRetryAfter()`, `getStatus()`
  - Default instance available as `defaultRateLimiter`
- [x] Fixed duplicate `recordAlertTimestamp` export
- [x] Migrated `tests/utils.js` from CJS `require()` to ESM imports

### Test Results
- **All 203 tests passing**

### Code Quality
- ESLint: No issues
- All modules using consistent ESM imports

### Recommendations
1. **RateLimiter Usage**: The new `RateLimiter` class provides a cleaner API than calling `shouldRateLimitAlert()` + `recordAlertTimestamp()` separately. Consider updating internal code to use `defaultRateLimiter.checkAndRecord()`.

2. **Documentation**: The `RateLimiter` class has comprehensive JSDoc - consider generating API docs.

3. **Tests for RateLimiter**: Consider adding dedicated unit tests for the `RateLimiter` class (current rate limiting tests cover the underlying functions).