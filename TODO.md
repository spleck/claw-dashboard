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

- [ ] Create custom chart/visualization widget example
  - Add to `examples/plugins/` directory
  - Demonstrate data visualization capabilities

- [x] Expose RateLimiter API for plugin authors
  - Add `RateLimiter` to public exports
  - Document usage in plugin developer guide

## Lower Priority

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

- [ ] Plugin developer experience improvements
  - Create plugin scaffolding CLI tool
  - Add debug mode with verbose logging
  - Build validation tool for manifest files

- [ ] Widget configuration enhancements
  - Support environment variable interpolation in config
  - Add config versioning for safe migrations
  - Implement config hot-reload for development

## Status (2026-02-27)

### Recently Completed

- [x] **Expose RateLimiter API for plugin authors**
  - Added `RateLimiter` class export from `src/alerts.js`
  - Re-exported through `src/widgets/index.js` for plugin access
  - Imported and used in `src/widgets/plugin-api.js`
  - Comprehensive documentation added to `docs/PLUGINS.md`
  - Includes usage examples for rate-limited API clients and notification throttling

### Test Results

- **303 tests passing** (all suites: 8 passed, 8 total)
- ESLint: No issues
- RateLimiter tests: 41 tests passing
- Widget integration tests: 33 tests passing

### Code Quality

- No circular dependencies introduced
- All new exports properly documented
- RateLimiter API follows clean atomic design (`checkAndRecord` pattern)

### Recommendations

1. **CJS/ESM Compatibility**: Still the high-priority item for broader adoption
2. **Example Plugins**: Consider creating the custom chart/visualization widget example
3. **Developer Experience**: Plugin scaffolding tool would lower barrier for new plugins
4. **TypeScript**: Consider migration for core modules for better type safety and IDE support
