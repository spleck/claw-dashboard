# TODO

**Last Updated:** 2026-02-27
**Current Version:** 1.9.0

---

## High Priority
- [ ] Add Integration Tests - Current tests are unit-only; add end-to-end tests
- [x] Install ESLint - Run `npm install --save-dev eslint` and create `.eslintrc.json` (referenced in CI but missing)
- [ ] Add Codecov token to repository secrets for coverage reporting
- [ ] Enable branch protection rules for `main` (CI checks, security audit, PR reviews)
- [ ] Support remote dashboard access via web interface

## Medium Priority
- [ ] Create architecture diagram showing data flow
- [ ] Document widget layout system and positioning logic
- [ ] Add Homebrew formula for easier installation
- [ ] ESM Compliance - Address CJS/ESM compatibility issues
- [ ] Type Definitions - Add JSDoc types or consider TypeScript migration
- [ ] Performance Monitoring - Add metrics for refresh rates and memory usage

## Low Priority
- [ ] Code Splitting - Implement lazy loading for widget modules
- [ ] Plugin System - Design API for third-party widgets

---

## Recently Completed (v1.9.0)
- CI/CD pipeline with tests, builds, and security audits
- ESBuild bundling and automated release pipeline
- GPG-signed releases
- Docker support
- Differential rendering for optimized screen updates
- CLI argument parsing and man page
