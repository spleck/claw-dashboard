# TODO

## High Priority

- [ ] Fix CJS/ESM compatibility with dual-package exports
- [ ] Create plugin troubleshooting guide in PLUGINS.md
- [x] Mock API Status widget tests (currently makes real HTTP requests, 3s+ slowdown)
- [x] Investigate Jest worker process warning (`--detectOpenHandles`)

## Medium Priority

- [ ] Extend RateLimiter to plugin API calls
- [ ] Add error boundary examples for plugins
- [ ] Widget configuration enhancements (env var interpolation, config versioning, hot-reload)
- [ ] Plugin developer tooling (scaffolding CLI, manifest validator, debug mode)

## Lower Priority

- [ ] TypeScript migration evaluation (start with RateLimiter, validation.js, security.js)
- [ ] JSDoc-to-API-docs generation pipeline
- [ ] JSON Schema for plugin manifest
- [ ] Plugin hot-reload for development
- [ ] CI/CD improvements (release automation, npm publish, benchmark regression tests)
- [ ] Performance optimizations (memory profiling, virtual scrolling if needed)

## Backlog Ideas

- Plugin gallery/directory for community sharing
- Theme marketplace or preset packager
- Real-time collaboration for shared dashboards
- Mobile-responsive layout mode
