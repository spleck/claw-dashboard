# TODO

## Review Summary (2026-02-28)

### Uncommitted Changes Reviewed

#### 1. Gateway Manager Enhancement (`src/gateway-manager.js`)
- **Added**: `getOpenClawLogs()` function for fetching OpenClaw system logs
- **Added**: Log filtering by level ('all', 'error', 'warn', 'info', 'debug')
- **Uses**: `COMMAND_TIMEOUTS.OPENCLAW_LOGS` (5000ms) from config
- **Status**: ✅ Code is clean, properly documented, follows existing patterns

#### 2. Index.js Import Update (`index.js`)
- **Added**: Import of `getOpenClawLogs` from gateway-manager
- **Status**: ✅ Export properly structured for CJS/ESM dual-package

#### 3. CJS Build Compatibility Fix (`index.js`)
- **Issue Found**: Top-level await at line 184 causing CJS build failure
- **Root Cause**: `await runCliCommand(cliOptions)` not compatible with CJS format
- **Fix Applied**: Removed duplicate CLI handling from top-level; CLI commands now handled only in `main()` function at end of file
- **Status**: ✅ Fixed - CJS build now succeeds

### Code Quality Check
- **Tests**: ✅ 1393 tests passing (1 skipped), 34 test suites
- **Coverage**: 48.7% statements, 79.22% branches, 41.33% functions
- **Lint**: ✅ Clean (no errors)
- **CJS Build**: ✅ Both widgets.cjs and index.cjs build successfully

### Issues Fixed
1. CJS bundle build failure due to top-level await
2. Removed redundant `runCliCommand` function (CLI handling already in `main()`)

---

## Active

### Critical Bugs
- [ ] Fix navigation crash after opening/closing settings menu
- [ ] Fix logs not displaying ("No log output") - `getOpenClawLogs()` now available, needs integration with UI

### In Progress
- [ ] Widget drag-and-drop arrangement
- [ ] Multiple dashboard profiles/pages

## Backlog

### Features
- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Theme auto-switching based on system preference (dark/light/auto)
- [ ] Session quick-switch fuzzy finder (Ctrl+K style)
- [ ] Custom widget slots - pin 3-4 widgets to a "favorites" row
- [ ] Export scheduling - cron-style auto-export of metrics

### Plugin Ecosystem
- [ ] Plugin template repository for developers
- [ ] Plugin marketplace/discovery system
- [ ] Widget playground for live-preview during development
- [ ] Widget testing utilities for plugin developers

### Technical Debt
- [ ] Fix worker process timer leak in tests (add `.unref()` on timers)
- [ ] Improve test coverage on error handling paths (~41% function coverage)
- [ ] TypeScript migration - start with `validation.js`, `security.js`
- [ ] Enable ESLint for workers (currently ignored: `src/workers/**`)
- [ ] Add JSDoc coverage for PluginAPI public methods

### Observability
- [ ] Structured logging with JSON output mode for log aggregation
- [ ] Prometheus-compatible metrics endpoint for dashboard's own metrics
- [ ] Health check improvements - add dependency health (gateway, worker pool)

### Performance & Security
- [ ] Widget graceful degradation under memory pressure
- [ ] Connection pooling for web server `/metrics` endpoint
- [ ] Snapshot testing for UI visual regression
- [ ] Sandbox plugins in Node.js VM module
- [ ] Audit blessed-contrib dependencies for updates/replacements
- [ ] Bundle size audit - analyze esbuild output for optimizations
