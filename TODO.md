# TODO

## High Priority
- [x] Fix integration tests for full dashboard workflows
  - [x] Fixed `validateSettings` to return consistent result format with `{valid, value}`
  - [x] Fixed variable naming conflicts in tests (renamed `alerts` to `newAlerts`)
  - [x] Mocked `systeminformation` calls to avoid system-dependent behavior
  - [x] Fixed rate limiting logic in `shouldRateLimitAlert` to not double-count timestamps
  - [x] Exported `recordAlertTimestamp` for test use

## Medium Priority
- [ ] Address CJS/ESM compatibility issues
- [ ] Add JSDoc types or consider TypeScript migration

## Low Priority
- [ ] Generate API documentation from JSDoc
- [ ] Add example plugins to examples/ directory

---

## Completed Changes

### Bug Fixes
1. **Rate Limiting Logic** (`src/alerts.js`)
   - Fixed `shouldRateLimitAlert` to not record timestamps during check phase
   - Separated concerns: `shouldRateLimitAlert` only checks, `recordAlertTimestamp` records
   - Exported `recordAlertTimestamp` for test access

2. **Settings Validation** (`src/validation.js`, `index.js`)
   - `validateSettings` now returns `{valid: boolean, value: object}` consistently
   - `loadSettings` properly handles validation result

3. **Test Fixes** (`tests/integration.test.js`, `tests/alerts.test.js`, `tests/retry.test.js`)
   - Mocked `systeminformation` to avoid system-dependent test failures
   - Fixed variable shadowing in alert escalation test
   - Updated rate limiting tests to call `recordAlertTimestamp` explicitly
   - Fixed error message patterns to match retry logic

### Test Results
- **Total Tests**: 203 passing
- **Unit Tests**: 55 passing
- **Integration Tests**: 39 passing
- **All test suites**: PASS

---

## Recommendations

### Code Quality
1. **Rate Limiting API**: The separation of `shouldRateLimitAlert` and `recordAlertTimestamp` is now correct but requires callers to remember both steps. Consider wrapping in a higher-level API.

2. **ESM/CJS Compatibility**: Monitor for any remaining CJS/ESM issues as dependencies update.

3. **Type Safety**: Consider adding JSDoc types for better IDE support.

### Documentation
1. **API Documentation**: Consider auto-generating from JSDoc
2. **Plugin Examples**: Add sample plugins to the examples/ directory
