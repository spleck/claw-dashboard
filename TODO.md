# TODO

**Last Updated:** 2026-02-27
**Current Version:** 1.9.0

---

## High Priority
- [ ] Add Integration Tests - Add end-to-end tests to cover full dashboard workflows
  - **Note:** 3 integration tests fail due to alert rate limiting test setup issues (pre-existing)
- [ ] Add Codecov token to repository secrets for coverage reporting
- [ ] Enable branch protection rules for `main` (CI checks, security audit, PR reviews)
- [ ] Support remote dashboard access via web interface

## Medium Priority
- [ ] Create architecture diagram showing data flow
- [ ] Document widget layout system and positioning logic
- [ ] Add Homebrew formula for easier installation
- [ ] ESM Compliance - Address CJS/ESM compatibility issues
- [ ] Type Definitions - Add JSDoc types or consider TypeScript migration

## Low Priority
- [ ] Code Splitting - Implement lazy loading for widget modules
- [ ] Plugin System - Design API for third-party widgets

---

## Completed in v1.9.0
- [x] Performance Monitoring - Add metrics for refresh rates and memory usage
