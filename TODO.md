# TODO

## Status (2026-02-28)

### Recently Completed

#### Error Recovery UI (Done)
- [x] Widget error boundary system with visual error states
  - `ErrorBoundaryManager` for managing multiple widget boundaries
  - `WidgetErrorBoundary` class wrapping individual widgets
  - Integration with `widget-error-isolation.js` for health tracking
- [x] Global retry mechanism (`X` key)
  - Retry all failed widgets at once
  - Footer indicator showing failed widget count
  - Clear error states on successful retry
- [x] Help documentation updated
  - New `X` key documented in help panel
  - Error recovery workflow described

#### Keyboard Navigation Improvements (Done)
- [x] Modal-aware key handling
  - Prevent quit while modals are active
  - Global escape key handler for all modals
  - Proper key guards for search/settings focus states
- [x] Settings panel keyboard support
  - Enter/Space to toggle settings
  - Mouse click support retained
- [x] Arrow key normalization
  - Combined escape sequences with named keys
  - Consistent behavior across terminals

#### Theme Color Consistency (Done)
- [x] Updated deprecated color syntax
  - Changed `{green}` to `{green-fg}` throughout
  - Consistent `-fg` suffix for foreground colors

---

## Bugs

- [ ] Navigation crash after opening/closing settings menu - session list navigation crashes app
- [ ] Logs not displaying ("No log output") - investigate log pipeline and worker communication

## Features

### High Priority
- [ ] Widget drag-and-drop arrangement
- [ ] Multiple dashboard profiles/pages
- [ ] Real-time WebSocket updates (push instead of poll)

### Plugin Ecosystem
- [ ] Plugin template repository for developers
- [ ] Plugin marketplace/discovery system
- [ ] Publish plugin developer guide

### Developer Experience
- [ ] Widget playground for live-preview during development
- [ ] Widget testing utilities for plugin developers
- [x] Error recovery UI (retry buttons for failed widgets) - Implemented with [X] key to retry all failed widgets + footer indicator

### Polish
- [ ] Theme auto-switching based on system preference (dark/light/auto)
- [ ] Keyboard shortcuts documentation and discoverability (in-app help panel)

## Technical Debt

- [ ] Fix worker process timer leak in tests - ensure `.unref()` on timers during worker pool shutdown
- [ ] Improve test coverage on error handling paths (currently ~41% function coverage)
- [ ] TypeScript migration - start with `validation.js`, `security.js`

## Recommendations (Deep Review)

### Performance & Reliability
1. **Graceful degradation system** - Already have worker pool degradation; extend to widgets (disable non-essential widgets under memory pressure)
2. **Connection pooling for web server** - Currently creates new connections; pool could improve `/metrics` endpoint performance
3. **Snapshot testing for UI** - Visual regression testing for terminal UI layouts

### Observability
4. **Structured logging** - Current logger is basic; add JSON output mode for log aggregation
5. **Metrics export** - Prometheus-compatible endpoint for dashboard's own metrics
6. **Health check improvements** - Add dependency health (gateway connectivity, worker pool status)

### User Experience
7. **Session quick-switch** - Fuzzy finder (Ctrl+K style) to jump between sessions
8. **Custom widget slots** - Allow users to pin 3-4 custom widgets to a "favorites" row
9. **Export scheduling** - Cron-style auto-export of metrics to file

### Code Quality
10. **ESLint for workers** - Currently ignored in lint config (`src/workers/**`)
11. **JSDoc coverage** - Add type documentation for PluginAPI public methods
12. **Bundle size audit** - Analyze esbuild output for optimization opportunities

### Security
13. **Sandbox plugins in VM** - Currently plugins run in main process; use Node.js VM module
14. **Audit blessed-contrib dependencies** - Several are outdated; evaluate replacements

---

## Test Status

- **1393 tests passing** (1 skipped)
- **34 test suites** all passing
- **Coverage**: 48.7% statements, 79.22% branches, 41.33% functions
- **Lint**: Clean (no errors)

## Known Issues

- Worker process timer leak warning in tests (existing, non-critical)
  - Tests pass but Jest warns about unclosed handles
  - Affects test suite cleanup only, not production code
