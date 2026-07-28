## TODO

## Backlog

- Integration test for command palette execution flow
- E2E test for Ctrl+K keybinding
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

- Test coverage at ~35% — target 70%+ (raised from 25% floor in v2.2.0)
- TypeScript migration - Start with validation.js/security.js
- JSDoc completion - Complete PluginAPI public methods
- Worker thread pool leak in tests — "worker process failed to exit gracefully" warning persists
- ESLint warnings (234) — gradual cleanup of no-unused-vars, no-console, prefer-const