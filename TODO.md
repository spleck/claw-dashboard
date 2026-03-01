# TODO

## In Progress

*None currently*

## Core Features

- [ ] Multiple dashboard profiles/pages with tabbed navigation
- [ ] Session quick-switcher (Ctrl+K fuzzy finder)
- [ ] Widget grouping/collapsing for dense dashboards
- [ ] Widget size presets (small, medium, large, wide)
- [ ] Conditional widget visibility based on data state
- [ ] Command palette for all keyboard shortcuts
- [ ] Dashboard layout templates (devops, sre, developer, manager views)
- [x] Dark/light theme auto-switch based on system preference

## Real-time & Observability

- [ ] WebSocket support for push-based real-time updates
- [ ] Structured logging with JSON output mode for log aggregation
- [ ] Prometheus-compatible /metrics endpoint for dashboard's own health
- [ ] Enhanced health checks with dependency status (gateway, worker pool, database)
- [ ] Historical data persistence layer (SQLite/LevelDB)
- [ ] Trend indicators comparing current vs historical averages
- [ ] Anomaly detection alerts for metric spikes

## Plugin Ecosystem

- [ ] Plugin marketplace/discovery system (community registry index)
- [ ] Plugin sandbox with Node.js VM for security isolation
- [ ] Widget playground - live preview during plugin development
- [ ] Plugin hot-reload during development (watch mode)
- [ ] Plugin template gallery with more examples
- [ ] Plugin publishing CLI (npm-style workflow)
- [ ] Widget visual regression testing

## Data & Export

- [ ] PDF/HTML report generation with charts
- [ ] Webhook notifications for threshold breaches
- [ ] Slack/Discord webhook integration
- [ ] OpenClaw event stream consumption
- [ ] Custom metric ingestion API

## Technical Debt

- [ ] Improve function coverage from ~43% to 70%+ (focus: error handling paths)
- [ ] TypeScript migration - start with `validation.js` and `security.js`
- [ ] Complete JSDoc coverage for PluginAPI public methods

---

## Recently Completed

- Dark/light theme auto-switch based on system preference (cross-platform: macOS + Linux)
- Widget pinning to favorites row
- Widget drag-and-drop arrangement mode
- Export scheduling with cron-style auto-export to CSV/JSON
- Widget arrangement mode with keyboard-based reordering

---

## Code Review Notes (2026-02-28)

### Status: Ready for Release

**Tests:** All 1400 tests passing (1399 passed, 1 skipped)
**Build:** Clean
**CJS Bundle:** Up-to-date

### Recent Theme System Improvements

The `src/themes.js` changes add Linux support for system theme detection:
- `detectLinuxAppearance()` uses gsettings for GNOME/GTK desktops
- `startLinuxThemeWatcher()` monitors dconf database via fs.watch
- Falls back to polling (3s interval) if file watching unavailable
- Maintains macOS compatibility with existing polling approach

### Recommendations

1. **Next Priority:** Plugin hot-reload (watch mode) - highest developer experience impact
2. **Technical Debt:** TypeScript migration starting with validation.js would improve maintainability
3. **Feature Opportunity:** Widget grouping/collapsing would address dense dashboard usability
4. **Testing:** Consider adding tests for Linux theme detection mocking
