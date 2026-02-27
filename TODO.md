# TODO

## Status Overview

**Last Updated:** 2026-02-26
**Current Version:** 1.9.0
**Branch:** dev

### Recently Completed
- [x] Add ESBuild for bundling (`esbuild.config.js` with dev/prod builds)
- [x] Create automated release script with version bumping (`scripts/release.js`)
- [x] Sign releases with GPG (via release script)
- [x] Add Docker support (Dockerfile + docker-compose.yml)
- [x] Optimize blessed screen rendering with differential updates (`src/differential-render.js`)
- [x] Add CLI argument parsing (`--help`, `--version`, `--debug`)
- [x] Create man page for the CLI tool (`man/clawdash.1`)

---

## Documentation

- [ ] Create architecture diagram showing data flow
  - **Priority:** Medium
  - **Notes:** Document how dashboard widgets communicate with data sources

- [ ] Document widget layout system and positioning logic
  - **Priority:** Medium
  - **Notes:** blessed-contrib grid system and responsive layout rules

- [x] Create man page for the CLI tool
  - **Priority:** Low
  - **Status:** Completed
  - **Implementation:** `man/clawdash.1` with comprehensive documentation

## Features

- [ ] Support remote dashboard access via web interface
  - **Priority:** High
  - **Notes:** Would require replacing blessed with a web-based UI (e.g., WebSocket + React)

## Performance

- [x] Optimize blessed screen rendering with differential updates
  - **Priority:** Medium
  - **Status:** Completed
  - **Implementation:** `src/differential-render.js` with `WidgetStateTracker` and `DifferentialRenderer` classes
  - **Notes:** Tracks widget state to minimize unnecessary re-renders; includes batching mode for render operations

## Build & Distribution

- [ ] Add Homebrew formula for easier installation
  - **Priority:** Medium
  - **Notes:** Create tap repo with formula pointing to GitHub releases

---

## Recommendations

### High Priority
1. **Add CI/CD Pipeline** - Automate tests and builds on PR/push to main
2. **Security Audit** - Review dependency vulnerabilities with `npm audit`
3. **Add Integration Tests** - Current tests are unit-only; add end-to-end tests

### Medium Priority
1. **ESM Compliance** - Some dependencies may have CJS/ESM compatibility issues
2. **Type Definitions** - Add JSDoc types or consider TypeScript migration
3. **Performance Monitoring** - Add metrics for refresh rates and memory usage

### Low Priority
1. **Code Splitting** - Consider lazy loading for widget modules
2. **Plugin System** - Design API for third-party widgets

---

## Technical Debt

| Issue | Location | Severity | Notes |
|-------|----------|----------|-------|
| Experimental VM Modules warning | jest tests | Low | Node.js feature flag |

---

## Notes

- The release script (`scripts/release.js`) handles versioning, building, GPG signing, and GitHub releases
- Build artifacts are output to `dist/` directory (bundled, minified executable)
- Docker support added with multi-stage build for smaller images
- Differential renderer tracks widget state changes to avoid redundant screen renders; access stats via `diffRenderer.getStats()`
- CLI argument parsing added with `--help`, `--version`, and `--debug` flags
- Man page installed at `man/clawdash.1` and referenced in `package.json`
