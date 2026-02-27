# TODO

## Completed (Feb 2026)

- [x] Implement plugin path validation security
  - Added `validatePluginPath()` and `validatePluginName()` in security.js
  - Path traversal attack prevention
  - Symlink escape detection (handles macOS /var -> /private/var)
  - Hidden file filtering
  - Invalid character rejection
  - Comprehensive test coverage (81 widget tests)

## High Priority

- [ ] Fix CJS/ESM compatibility with dual-package setup
  - Add conditional exports map in root `package.json`
  - Create CommonJS wrapper for users needing `require()` support

- [ ] Add unit tests for example plugins
  - Verify plugins load correctly via plugin API
  - Test lifecycle hook execution (init, create, getData, render, destroy)
  - Validate manifest schema parsing

- [ ] Add plugin troubleshooting guide to PLUGINS.md
  - Common error patterns and solutions
  - Debug mode usage for plugin development
  - Manifest validation failures

## Medium Priority

- [ ] Widget configuration enhancements
  - Support environment variable interpolation in config
  - Add config versioning for safe migrations
  - Implement config hot-reload for development

- [ ] Plugin developer tooling
  - Create scaffolding CLI (`clawdash create-plugin <name>`)
  - Build manifest validation tool
  - Add debug mode with verbose plugin logging

- [ ] Security hardening (partially complete)
  - [x] Validate input paths for file system operations in widget-loader.js
  - [ ] Audit widget sandboxing / execution isolation
  - [ ] Rate limiting for widget API calls (extend RateLimiter to plugins)

- [ ] Error boundary examples for plugins
  - Demonstrate graceful error handling in widget lifecycle
  - Add error recovery patterns to PLUGINS.md

## Lower Priority

- [ ] TypeScript migration evaluation
  - Start with `RateLimiter`, `validation.js`, `security.js`
  - Generate `.d.ts` type definitions for plugin API

- [ ] JSDoc-to-API-docs generation pipeline
  - Auto-generate plugin API reference from JSDoc comments
  - Publish alongside documentation

- [ ] CI/CD improvements
  - Add release automation workflow
  - Auto-publish to npm on version tag
  - Add benchmark regression tests

- [ ] Performance optimizations
  - Implement virtual scrolling for large session lists
  - Add WebGL canvas backend for charts (optional)
  - Profile memory usage during long-running sessions

- [ ] JSON Schema for plugin manifest
  - Generate from plugin.json schema
  - Enable IDE validation and autocomplete

- [ ] Plugin hot-reload for development
  - Watch plugin directories for changes
  - Safe reload without dashboard restart

---

## Recommendations from Code Review (Feb 2026)

### Security Implementation Quality
- Path validation now handles macOS symlink edge cases correctly
- All 326 tests pass including 81 widget-specific tests
- Symlink escape detection prevents path traversal via symbolic links
- Character whitelisting prevents shell injection through filenames

### Potential Improvements
1. **Widget Sandbox**: Consider adding execution isolation for plugin code
2. **Rate Limiting**: Extend RateLimiter class to plugin API calls
3. **Hot Reload**: Development mode for live plugin updates without restart
4. **Schema Validation**: JSON Schema for IDE autocomplete support