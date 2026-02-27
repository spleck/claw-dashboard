# TODO

## Completed (Feb 2026)

- [x] Document widget plugin API and lifecycle hooks
  - Created comprehensive PLUGINS.md documentation
  - Documented Plugin Manifest Schema with all required/optional fields
  - Documented all lifecycle hooks (`init`, `create`, `getData`, `render`, `destroy`)
  - Added error handling patterns and lifecycle events

- [x] Create custom chart/visualization widget example
  - Added `system-metrics-chart` example plugin
  - Demonstrates blessed-contrib line charts
  - Shows time-series data with configurable history
  - Multiple metric support (CPU, memory, network)

## High Priority

- [ ] Fix CJS/ESM compatibility with dual-package setup
  - Add conditional exports map in root `package.json`
  - Create CommonJS wrapper for users needing `require()` support

## Medium Priority

- [ ] Widget configuration enhancements
  - Support environment variable interpolation in config
  - Add config versioning for safe migrations
  - Implement config hot-reload for development

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
  - Create plugin scaffolding CLI tool (`clawdash create-plugin`)
  - Add debug mode with verbose logging
  - Build validation tool for manifest files

- [ ] CI/CD improvements
  - Add release automation workflow
  - Auto-publish to npm on version tag
  - Add benchmark regression tests

- [ ] Performance optimizations
  - Implement virtual scrolling for large session lists
  - Add WebGL canvas backend for charts (optional)
  - Profile memory usage during long-running sessions

---

## Recommendations from Code Review (Feb 2026)

### Documentation Quality
- The new PLUGINS.md documentation is comprehensive and well-structured
- Consider adding a "Troubleshooting" section for common plugin issues
- The lifecycle hook examples are clear and follow best practices

### Example Plugin Structure
- All 4 example plugins follow consistent patterns:
  - `hello-world` - Basic structure
  - `weather-widget` - Configuration handling
  - `api-status` - External API integration
  - `system-metrics-chart` - Data visualization
- Good separation of concerns between UI creation, data fetching, and rendering

### Potential Improvements
1. **Widget Tests**: Add unit tests for the example plugins to verify they load correctly
2. **Schema Validation**: Consider generating JSON schema from plugin.json for IDE validation
3. **Error Boundaries**: Add example of graceful error handling in widget lifecycle
4. **Hot Reload**: Add development mode for plugin hot-reloading during development