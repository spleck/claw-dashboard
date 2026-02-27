# TODO

## Status Overview

**Last Review:** 2026-02-27
**Branch:** dev
**Overall Health:** Excellent (375 tests passing, all features functional)

### Recently Completed

- [x] CJS/ESM dual-package exports with conditional exports in package.json
- [x] Build system for CJS compatibility (build-cjs.js with esbuild)
- [x] Plugin API rate limiting with independent category tracking
- [x] Comprehensive plugin API tests (21 test cases)
- [x] Plugin path validation for security hardening
- [x] PLUGINS.md troubleshooting guide with Common Error Patterns
- [x] Example plugins: api-status, hello-world, system-metrics-chart, weather-widget
- [x] Mock API status widget tests (no real HTTP requests)

---

## High Priority

- [ ] Widget config hot-reload (watch config file, reinitialize changed widgets without restart)
- [ ] Widget config versioning (migrate configs on breaking changes)
- [ ] Environment variable interpolation in widget configs (`${ENV_VAR}`)

## Medium Priority

- [ ] Plugin scaffolding CLI (`clawdash create-plugin <name>`)
- [ ] Plugin manifest validator (lint plugin before install)
- [ ] JSON Schema for plugin manifest
- [ ] Plugin developer debug mode (verbose logging, stack traces)

## Lower Priority

- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] JSDoc-to-API-docs generation pipeline
- [ ] Plugin hot-reload for development (auto-reload on file change)
- [ ] CI/CD release automation (npm publish on tag)
- [ ] Memory profiling tools (detect leaks in long-running sessions)

## Backlog (Ideas)

- [ ] Widget import/export (share widget configs)
- [ ] Plugin marketplace discovery (registry format)
- [ ] Theme builder CLI (interactive theme creation)
- [ ] Dashboard layout save/restore (persist arrangement)
- [ ] Keyboard macro recording (custom key sequences)
- [ ] Log filtering/search (regex-based log filtering)

---

## Recommendations for Next Sprint

1. **Widget Configuration Enhancements** (High Impact): Config versioning and hot-reload would significantly improve developer experience
2. **Plugin Developer Tooling** (Medium Priority): A CLI scaffolding tool would reduce friction for new plugin developers
3. **TypeScript Migration** (Lower Priority): Start with security.js and validation.js for type safety in critical paths
