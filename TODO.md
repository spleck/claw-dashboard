# TODO

## High Priority

- [ ] Fix CJS/ESM compatibility with dual-package setup
  - Add conditional exports map in root `package.json`
  - Create CommonJS wrapper for users needing `require()` support

## Medium Priority

- [ ] Document widget plugin API and lifecycle hooks
  - Create markdown documentation for manifest schema
  - Document all lifecycle hooks (`init`, `create`, `getData`, `render`, `destroy`)
  - Include usage examples for each hook

- [x] Add widget integration tests
  - Test `loadAllPluginsWithFallback()` error recovery
  - Test plugin manifest validation edge cases
  - Test widget config sanitization with malicious inputs

- [x] Create example plugins in `examples/` directory
  - [x] Basic "Hello World" widget plugin (`examples/plugins/hello-world/`)
  - [x] Data-fetching widget example - API Status (`examples/plugins/api-status/`)
  - [ ] Custom chart/visualization widget

## Lower Priority / Ideas

- [ ] Evaluate TypeScript migration for core modules
  - Start with `RateLimiter`, `validation.js`, `security.js`
  - Generate `.d.ts` type definitions for plugin API

- [ ] Add JSDoc-to-API-docs generation pipeline
  - Auto-generate plugin API reference from JSDoc comments
  - Publish alongside documentation

- [ ] Security hardening
  - Audit widget sandboxing / execution isolation
  - Validate input paths for file system operations
  - Rate limiting for widget API calls

---

## Status (2026-02-27)

### Recently Completed

- [x] **Widget integration tests**
  - Added comprehensive test suite in `tests/widget-integration.test.js`
  - Tests `loadAllPluginsWithFallback()` error recovery
  - Tests plugin manifest validation edge cases
  - Tests widget config sanitization with malicious inputs

- [x] **Example plugins**
  - Hello World widget (`examples/plugins/hello-world/`)
  - API Status widget (`examples/plugins/api-status/`)
  - Both include proper manifest files and implementation

### Test Results

- **303 tests passing** (all suites: 8 passed, 8 total)
- ESLint: No issues

### Recommendations

1. **CJS/ESM Compatibility**: Remains the high-priority item
2. **Documentation**: Next step is documenting widget plugin API and lifecycle hooks
3. **TypeScript**: Consider migration for core modules for better type safety
