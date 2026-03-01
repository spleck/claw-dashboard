# TODO

## Dashboard Features

- [ ] Multiple dashboard profiles/pages with tabbed navigation
- [ ] Session quick-switcher (Ctrl+K fuzzy finder)
- [x] Export scheduling - cron-style auto-export of metrics to CSV/JSON

## Real-time & Observability

- [ ] WebSocket support for push-based real-time updates
- [ ] Structured logging with JSON output mode for log aggregation
- [ ] Prometheus-compatible /metrics endpoint for dashboard's own health
- [ ] Enhanced health checks with dependency status (gateway, worker pool, database)

## Plugin Ecosystem

- [ ] Plugin marketplace/discovery system (community registry index)
- [ ] Plugin sandbox with Node.js VM for security isolation
- [ ] Widget playground - live preview during plugin development

## Technical Debt

- [ ] Improve function coverage from ~43% to 70%+ (focus: error handling paths)
- [ ] TypeScript migration - start with `validation.js` and `security.js`
- [ ] Complete JSDoc coverage for PluginAPI public methods

---

## Completed: Export Scheduling Feature (2026-02-28)

### Implementation Summary

Implemented cron-style scheduled auto-export of metrics to CSV/JSON files.

**Files Added:**
- `src/export-scheduler.js` - Core scheduler with cron parser
- `src/cli/export-schedule.js` - CLI commands for schedule management

**Files Modified:**
- `index.js` - Integrated scheduler into dashboard lifecycle
- `src/config.js` - Added export schedule configuration constants
- `src/validation.js` - Added `validateExportSchedule()` validator
- `src/cli/help.js` - Added CLI help documentation

**Features:**
- Cron expression parser (5-field: minute, hour, day, month, dayOfWeek)
- 12 built-in cron presets (everyMinute, hourly, daily, weekly, etc.)
- JSON and CSV export formats
- Configurable retention policy (0-365 days, auto-cleanup)
- Custom export directory support
- Manual trigger via CLI
- List recent exports

**CLI Commands:**
```bash
clawdash export-schedule status
clawdash export-schedule enable
clawdash export-schedule disable
clawdash export-schedule set hourly
clawdash export-schedule set "*/30 * * * *"
clawdash export-schedule format json|csv
clawdash export-schedule retention 30
clawdash export-schedule directory /path/to/exports
clawdash export-schedule export    # Manual trigger
clawdash export-schedule list       # List recent exports
```

**Tests:** All 1400 tests passing.

---

## Recommendations & Ideas

### Widget Enhancements
- Widget grouping/collapsing for dense dashboards
- Custom widget color themes per-widget
- Widget size presets (small, medium, large, wide)
- Conditional widget visibility based on data state

### UX Polish
- Command palette for all keyboard shortcuts
- Dashboard layout templates (devops, sre, developer, manager views)
- Dark/light theme auto-switch based on system preference
- Widget tooltips with metric explanations

### Data & Export
- Historical data persistence layer (SQLite/LevelDB)
- Trend indicators comparing current vs historical averages
- Anomaly detection alerts for metric spikes
- PDF/HTML report generation with charts

### Integration
- Webhook notifications for threshold breaches
- Slack/Discord webhook integration
- OpenClaw event stream consumption
- Custom metric ingestion API

### Developer Experience
- Plugin hot-reload during development (watch mode)
- Plugin template gallery with more examples
- Widget visual regression testing
- Plugin publishing CLI (npm-style workflow)

---

## Code Quality Notes

### Current State (dev branch)
- **Build Status:** Passing
- **Tests:** 1399 passing, 1 skipped (1400 total)
- **CJS Build:** Up-to-date and validated

### Recently Completed

#### Widget Arrangement Mode (2026-02-28)
Keyboard-based widget reordering with arrow keys, persistence to settings.

#### Export Scheduling (2026-02-28)
Cron-style scheduled exports with CLI management commands.

### Recommendations

1. **Test Coverage** - Focus on error handling paths (~43% function coverage)
2. **TypeScript Migration** - Start with `validation.js` and `security.js`
3. **JSDoc Coverage** - Complete documentation for PluginAPI public methods
