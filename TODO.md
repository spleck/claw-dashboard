# TODO

## High Priority

- [x] Fix CJS/ESM compatibility with dual-package exports - Added exports field to package.json, created build-cjs.js, and generated index.cjs/dist/widgets.cjs
- [x] Create plugin troubleshooting guide in PLUGINS.md - Added Common Error Patterns, Debug Mode, Validation Errors, and Common Error Solutions sections

## Medium Priority

- [x] Extend RateLimiter to plugin API calls
- [x] Add error boundary examples for plugins - Added comprehensive error boundary examples in PLUGINS.md
- [ ] Widget configuration enhancements (env var interpolation, config versioning, hot-reload)
- [ ] Plugin developer tooling (scaffolding CLI, manifest validator, debug mode)

## Lower Priority

- [ ] TypeScript migration evaluation (start with RateLimiter, validation.js, security.js)
- [ ] JSDoc-to-API-docs generation pipeline
- [ ] JSON Schema for plugin manifest
- [ ] Plugin hot-reload for development
- [ ] CI/CD improvements (release automation, npm publish, benchmark regression tests)
- [ ] Performance optimizations (memory profiling, virtual scrolling if needed)

## Recommendations for Next Sprint

1. **Widget Configuration Enhancements** (High Impact): Config versioning and hot-reload would significantly improve developer experience
2. **Error Boundaries for Plugins** (Medium Priority): The PLUGINS.md now has examples, but actual implementation needs base widget support
3. **Plugin Developer Tooling** (Medium Priority): A CLI scaffolding tool would reduce friction for new plugin developers
4. **TypeScript Migration** (Lower Priority): Start with security.js and validation.js for type safety in critical paths

## Completed

- [x] Extend RateLimiter to plugin API calls - Added rate limiting to `getData`, `executeExtension`, and `getMetrics` methods with independent category tracking
- [x] Mock API Status widget tests - Tests now use mocked data providers instead of real HTTP requests
- [x] Jest worker process warning resolved - Warning was related to open handles during test execution
- [x] Plugin path validation for security hardening - Added `validatePluginName` and `validatePluginPath` functions
- [x] Plugin lifecycle documentation - Added PLUGINS.md with plugin architecture and lifecycle documentation
- [x] System metrics chart example plugin - Added example plugin demonstrating chart-based widgets
- [x] Comprehensive plugin API tests - Added `tests/plugin-api-rate-limit.test.js` with 21 test cases
- [x] CJS/ESM dual-package exports - Added exports field to package.json with conditional exports for ESM/CJS
- [x] Build system for CJS compatibility - Created build-cjs.js with esbuild and import.meta.url polyfill
- [x] Generated CJS bundles - index.cjs (main entry) and dist/widgets.cjs (widget exports)
