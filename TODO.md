# TODO

## Release v1.10.0

- [x] Verify all tests pass (1409 passed, 1 skipped)
- [x] Update CHANGELOG.md
- [ ] Tag release

---

## Code Review Notes (2026-02-28)

### Issues Fixed During Review
1. **Method name mismatch** - `cycleLogLevelFilter()` was referenced in command palette but method is named `cycleLogLevel()`. Fixed by correcting the reference.

### Quality Assessment
- All 36 test suites pass
- Command palette implementation follows established patterns (similar to settings modal)
- Navigation guards properly prevent race conditions during modal transitions
- Tests cover command palette lifecycle and navigation guard logic

### Recommendations for Future Releases
- Consider adding integration test for command palette execution flow
- Add E2E test for Ctrl+K keybinding
- Document command palette feature in README.md

---

# Backlog

## Future Features

### High Value / Low Effort

- Plugin marketplace/discovery - Community registry index
- Session quick-switcher - Ctrl+K fuzzy finder for profiles
- WebSocket support - Push-based real-time updates

### Core Features

- Multiple dashboard profiles - Tabbed navigation
- Widget grouping/collapsing - Organize dense dashboards
- Conditional widget visibility - Show/hide based on data thresholds
- Dashboard layout templates - Preset layouts for different roles

### Data & Export

- Historical data persistence - SQLite/LevelDB backend
- Trend indicators - Compare vs historical averages
- Anomaly detection alerts - Automatic spike detection
- Webhook notifications - Threshold breach alerts (Slack/Discord)
- OpenClaw event stream - Consume events from gateway

### Developer Experience

- Plugin sandbox - Node.js VM isolation
- Widget playground - Live preview during development
- Plugin publishing CLI - npm-style workflow

## Technical Debt

- Test coverage - Improve from ~43% to 70%+
- TypeScript migration - Start with validation.js/security.js
- JSDoc completion - Complete PluginAPI public methods