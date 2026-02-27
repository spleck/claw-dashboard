# TODO

## High Priority
- [x] Update internal code to use `RateLimiter.checkAndRecord()` instead of separate calls
- [ ] Address CJS/ESM compatibility issues

## Medium Priority
- [ ] Add JSDoc types or consider TypeScript migration
- [ ] Improve error handling across alert handlers and plugins
- [ ] Add dedicated unit tests for `RateLimiter` class

## Low Priority
- [ ] Generate API documentation from JSDoc
- [ ] Add example plugins to `examples/` directory
- [ ] Expand test coverage for plugin system
- [ ] Review and harden security across user input paths

---

## Status (2026-02-27)

### Recently Completed
- [x] Migrated `checkThreshold()` to use `RateLimiter.checkAndRecord()` API
  - `thresholdRateLimiter` instance created with `alwaysAllowCritical: true`
  - Warning and critical alerts now use atomic check-and-record operations
  - Eliminates race conditions between separate check and record calls
- [x] Reorganized TODO priorities (migrated RateLimiter task to High Priority/completed)

### Test Results
- **All 203 tests passing**

### Code Quality
- ESLint: No issues
- All modules using consistent ESM imports

### Recommendations

1. **RateLimiter Class Tests**: While the existing rate limiting tests cover the underlying functions, consider adding dedicated unit tests for the `RateLimiter` class methods:
   - `check()` and `checkAndRecord()` behavior
   - `getRetryAfter()` calculations
   - `getStatus()` reporting
   - `alwaysAllowCritical` option behavior

2. **CJS/ESM Compatibility**: Still needs attention for users who need to `require()` the module.

3. **Documentation**: Consider generating API docs from the comprehensive JSDoc comments in `RateLimiter` class.
