# TODO

## Release v1.10.0

- [ ] Tag release v1.10.0

---

## Post-Release

These items are recommended for the next release cycle:

- Document command palette feature in README.md
- Integration test for command palette execution flow
- E2E test for Ctrl+K keybinding

---

## Code Review Summary (2026-02-28)

**Status: Ready for Release**

| Check | Status |
|-------|--------|
| Tests | ✓ 1414 passing |
| CJS Build | ✓ Clean |
| Lint | ✓ Clean |
| CLI | ✓ Functional |

**No issues identified.**

---

## Future Features

- Plugin marketplace/discovery - Community registry index
- Session quick-switcher - Ctrl+K fuzzy finder for profiles
- WebSocket support - Push-based real-time updates
- Multiple dashboard profiles - Tabbed navigation
- Widget grouping/collapsing - Organize dense dashboards
- Conditional widget visibility - Show/hide based on data thresholds
- Dashboard layout templates - Preset layouts for different roles
- Historical data persistence - SQLite/LevelDB backend
- Trend indicators - Compare vs historical averages
- Anomaly detection alerts - Automatic spike detection
- Webhook notifications - Threshold breach alerts (Slack/Discord)
- OpenClaw event stream - Consume events from gateway
- Plugin sandbox - Node.js VM isolation
- Widget playground - Live preview during development
- Plugin publishing CLI - npm-style workflow

## Technical Debt

- Test coverage - Improve from ~43% to 70%+
- TypeScript migration - Start with validation.js/security.js
- JSDoc completion - Complete PluginAPI public methods
