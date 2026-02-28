# TODO

## Status (2026-02-28)

### Recently Completed

#### Widget Refresh Intervals (Done)
- [x] Per-widget configurable refresh intervals
  - `WIDGET_REFRESH_INTERVALS` in config.js with sensible defaults
  - CPU/Memory: 1s, GPU: 5s, Disk: 30s, Uptime: 60s
  - BaseWidget integration with `shouldUpdate()`, `recordUpdate()`, `getRefreshStats()`
  - Validation constraints (500ms - 60s)
  - 23 tests passing in `tests/widget-refresh-intervals.test.js`

#### Worker Pool Graceful Degradation (Done)
- [x] Worker pool overload handling with degradation levels
  - Queue size thresholds (warning: 10, critical: 25, max: 50)
  - Utilization thresholds (warning: 75%, critical: 90%)
  - Circuit breaker pattern (5 failures opens, 30s reset)
  - Adaptive timeouts (1.5x warning, 2x critical)
  - Load shedding for non-critical tasks
  - Automatic recovery tracking
- [x] `WorkerPoolOverloadError` error class for proper error handling
- [x] `DegradationLevel` export for widget integration

#### Widget Degradation Integration (Done)
- [x] BaseWidget degradation support
  - `shouldUpdateUnderDegradation()` method
  - Critical widgets (cpu, memory) always update
  - Extended intervals under degradation (1.5x warning, 2x critical)
  - Skip non-critical widgets in critical mode
  - Priority-based update decisions
- [x] `setDegradationLevel()` for dynamic adjustment
- [x] `updateRefreshInterval()` with validation

### Current Test Status
- **1393 tests passing** (1 skipped)
- **34 test suites** all passing
- **Coverage**: 48.7% statements, 79.22% branches, 41.33% functions
- **Lint**: Clean (no errors)

### Known Issues
- Worker process timer leak warning in tests (existing, non-critical)
  - Tests pass but Jest warns about unclosed handles
  - Affects test suite cleanup only, not production code

---

## High Priority

- [ ] Widget drag-and-drop arrangement
- [ ] TypeScript migration (start with validation.js, security.js)
- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Multiple dashboard profiles/pages
- [ ] Widget marketplace/discovery

## Technical Debt

- [ ] Address worker process timer leak warning in tests
  - Requires proper .unref() on timers in worker pool shutdown
  - Low impact, tests pass but with warning

## Plugin Developer Experience

- [ ] Widget playground (live-preview during development)
- [ ] Widget testing utilities for plugin developers

## Polish

- [ ] Error recovery UI (retry buttons for failed widgets)
- [ ] Theme system (dark/light/custom color schemes)
- [ ] Keyboard shortcuts for navigation and widget actions

---

## Recommendations

### Next Steps (Suggested Priority)

1. **Widget drag-and-drop arrangement** - High user impact, differentiating feature
2. **TypeScript migration** - Start with validation.js and security.js
   - Provides immediate value with type safety
   - Good foundation for the rest of the migration
3. **Real-time WebSocket updates** - Major architectural improvement
   - Reduces polling overhead
   - Enables push-based alerts

### Technical Debt Priority

1. **Worker timer leak** - Fix before adding more worker features
   - Check `worker-pool.js` shutdown sequence
   - Ensure all timers have `.unref()` called
2. **Test coverage gaps** - Focus on error handling paths

### Architecture Observations

- **Worker pool degradation** is production-ready with circuit breaker and load shedding
- **Widget refresh intervals** provide good foundation for performance optimization
- **Plugin API rate limiting** protects against misbehaving plugins
- Consider extracting degradation logic into reusable module for other components

### Plugin API Stability

The plugin API is now feature-complete for v1:
- Rate limiting with configurable windows
- Per-widget refresh intervals
- Degradation awareness
- Config validation
- Stable error handling patterns

Ready for plugin developer documentation and community plugins.
