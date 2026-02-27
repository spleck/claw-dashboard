# TODO

## High Priority

- [ ] Fix CJS/ESM compatibility with dual-package exports
  - Add conditional exports map in root `package.json`
  - Create CommonJS wrapper for users needing `require()` support

- [x] Add unit tests for example plugins
  - Verify plugins load correctly via plugin API
  - Test lifecycle hook execution (init, create, getData, render, destroy)
  - Validate manifest schema parsing
  - **Completed**: 25 tests added in `tests/example-plugins.test.js` (Feb 2026)

- [ ] Create plugin troubleshooting guide in PLUGINS.md
  - Common error patterns and solutions
  - Debug mode usage for plugin development
  - Manifest validation failures

## Medium Priority

- [ ] Extend RateLimiter to plugin API calls
  - Currently used for alerts, should apply to plugin operations
  - Prevent plugin abuse of external APIs

- [ ] Add error boundary examples for plugins
  - Demonstrate graceful error handling in widget lifecycle
  - Add error recovery patterns to PLUGINS.md

- [ ] Widget configuration enhancements
  - Support environment variable interpolation in config
  - Add config versioning for safe migrations
  - Implement config hot-reload for development

- [ ] Plugin developer tooling
  - Create scaffolding CLI (`clawdash create-plugin <name>`)
  - Build manifest validation tool
  - Add debug mode with verbose plugin logging

## Lower Priority

- [ ] TypeScript migration evaluation
  - Start with `RateLimiter`, `validation.js`, `security.js`
  - Generate `.d.ts` type definitions for plugin API

- [ ] JSDoc-to-API-docs generation pipeline
  - Auto-generate plugin API reference from JSDoc comments
  - Publish alongside documentation

- [ ] JSON Schema for plugin manifest
  - Generate from plugin.json schema
  - Enable IDE validation and autocomplete

- [ ] Plugin hot-reload for development
  - Watch plugin directories for changes
  - Safe reload without dashboard restart

- [ ] CI/CD improvements
  - Add release automation workflow
  - Auto-publish to npm on version tag
  - Add benchmark regression tests

- [ ] Performance optimizations
  - Profile memory usage during long-running sessions
  - Consider virtual scrolling for large session lists (if needed)

---

## Notes

- **Completed**: Security hardening with plugin path validation (Feb 2026)
- **Completed**: Example plugin tests with 25 test cases (Feb 2026)
- **Declined**: Top processes widget (user rejected twice - layout issues)
- **Declined**: Disk usage sparkline (changes too slowly to be useful)
- **Declined**: Load average display (cross-platform inconsistencies)

---

## Review Notes (Feb 2026)

### Code Quality
- All 351 tests pass across 9 test suites
- Test coverage includes widget lifecycle, manifest validation, and plugin loading
- API Status widget tests include network calls (3s timeout) - consider mocking for faster tests

### Recommendations
1. **Mock external API calls**: The API Status widget test makes real HTTP requests, causing slow tests (3+ seconds). Consider mocking fetch for unit tests.

2. **Test file organization**: The new `example-plugins.test.js` is comprehensive. Consider splitting into separate files if more example plugins are added:
   - `tests/plugins/manifest-validation.test.js`
   - `tests/plugins/lifecycle.test.js`
   - `tests/plugins/loading.test.js`

3. **Widget subclass pattern**: The tests reveal that subclasses should call `super.destroy()` for proper cleanup. This should be documented in PLUGINS.md.

4. **Worker process warning**: Jest reports a worker process not exiting gracefully. This could be due to timers in tests - investigate with `--detectOpenHandles`.