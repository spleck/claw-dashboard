# TODO

## Status

**Last Updated:** 2026-02-27
**Current Version:** 1.9.0
**Branch:** dev

### Recent Changes
- Added CI/CD pipeline (`.github/workflows/ci.yml`) - tests on Node 18/20/22, builds, Docker check
- Added Security Audit workflow (`.github/workflows/security.yml`) - npm audit, Trivy, CodeQL
- Added Dependabot configuration for automated dependency updates
- Added PR template for consistent contributions

---

## Active Tasks

### High Priority
- [ ] Add Integration Tests - Current tests are unit-only; add end-to-end tests
- [ ] Support remote dashboard access via web interface

### Medium Priority
- [ ] Create architecture diagram showing data flow
- [ ] Document widget layout system and positioning logic
- [ ] Add Homebrew formula for easier installation
- [ ] ESM Compliance - Some dependencies may have CJS/ESM compatibility issues
- [ ] Type Definitions - Add JSDoc types or consider TypeScript migration
- [ ] Performance Monitoring - Add metrics for refresh rates and memory usage

### Low Priority
- [ ] Code Splitting - Consider lazy loading for widget modules
- [ ] Plugin System - Design API for third-party widgets

---

## Completed Tasks

### Recently Completed (v1.9.0)
- [x] Add CI/CD Pipeline - Automated tests and builds on PR/push to main
- [x] Security Audit - npm audit, Trivy scanner, CodeQL analysis
- [x] Add ESBuild for bundling (`esbuild.config.js` with dev/prod builds)
- [x] Create automated release script with version bumping (`scripts/release.js`)
- [x] Sign releases with GPG (via release script)
- [x] Add Docker support (Dockerfile + docker-compose.yml)
- [x] Optimize blessed screen rendering with differential updates (`src/differential-render.js`)
- [x] Add CLI argument parsing (`--help`, `--version`, `--debug`)
- [x] Create man page for the CLI tool (`man/clawdash.1`)

---

## Technical Debt

| Issue | Location | Severity | Notes |
|-------|----------|----------|-------|
| Experimental VM Modules warning | jest tests | Low | Node.js feature flag; no action needed |

---

## Repository Setup Required

1. **Codecov Token** - Add `CODECOV_TOKEN` to repository secrets for coverage reporting
2. **Branch Protection** - Consider enabling branch protection rules for `main` requiring:
   - CI checks to pass
   - Security audit to pass
   - PR reviews before merge

---

## Notes

- Build artifacts output to `dist/` directory (bundled, minified executable)
- Docker images use multi-stage builds for smaller final images
- Differential renderer available via `src/differential-render.js` with stats tracking
- Release script at `scripts/release.js` handles versioning, building, GPG signing
