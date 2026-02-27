# TODO

## High Priority

- [ ] Fix CJS/ESM compatibility with dual-package setup

## Medium Priority

- [ ] Document widget plugin API and lifecycle hooks
- [ ] Add widget e2e/integration tests
- [ ] Create example plugins in `examples/` directory

## Lower Priority / Ideas

- [ ] Evaluate TypeScript migration for core modules (RateLimiter, validation)
- [ ] Add JSDoc-to-API-docs generation pipeline
- [ ] Security audit for user input paths and widget sandboxing

---

## Status (2026-02-27)

### Recently Completed

- [x] **Input sanitization for user-provided widget configs**
  - Added `WidgetConfigValidator` class in `src/security.js`
  - Features: type validation, depth limiting, string/array length limits, null byte stripping
  - Schema-based validation support with property whitelisting
  - Convenience functions: `sanitizeWidgetConfig()` and `validateWidgetConfig()`
  - See `src/security.js:112-234` for implementation details

- [x] **Error handling for plugin loading with fallback scenarios**
  - Enhanced `loadPlugin()` method with `options.sanitize` and `options.fallbackOnError` flags
  - Added `loadAllPluginsWithFallback()` for batch plugin loading with error recovery
  - Manifest parsing error handling with graceful degradation
  - Config sanitization integrated into plugin loading pipeline
  - Auto-load error handling with optional fallback
  - See `src/widgets/widget-loader.js:408-530` for implementation

### Test Results

- **245 tests passing** (all suites: 7 passed, 7 total)
- ESLint: No issues
- All modules using consistent ESM imports

### Code Quality

- Security module now exports 8 functions (up from 5)
- Widget loader integrates sanitization from security module
- No breaking changes to existing APIs

### Recommendations

1. **CJS/ESM Compatibility**: Remains the primary high-priority item. Consider:
   - Dual-package.json setup with separate `package.json` files
   - Conditional exports map in root `package.json`
   - CommonJS wrapper for users needing `require()` support

2. **Widget Plugin System**: Core features are now implemented. Next steps:
   - Document the API (manifest schema, lifecycle hooks, config options)
   - Add integration tests covering the new `loadAllPluginsWithFallback()` method
   - Create example plugins demonstrating best practices

3. **Security**: Widget config sanitization provides foundation, but consider:
   - Full security audit of widget sandboxing (execution isolation)
   - Input path validation for file system operations
   - Rate limiting for widget API calls
