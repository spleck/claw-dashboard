# TODO

## Critical

- [ ] Integrate `getOpenClawLogs()` with UI - logs showing "No log output"

## High Priority

- [ ] Widget drag-and-drop arrangement
- [ ] Multiple dashboard profiles/pages
- [ ] Debug worker timer leak (investigate if warning persists after .unref() fixes)

## Nice to Have

- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Theme auto-switching based on system preference (dark/light/auto)
- [ ] Session quick-switch fuzzy finder (Ctrl+K style)
- [ ] Custom widget slots - pin 3-4 widgets to a "favorites" row
- [ ] Export scheduling - cron-style auto-export of metrics

## Plugin Ecosystem

- [ ] Plugin template repository for developers
- [ ] Plugin marketplace/discovery system
- [ ] Widget playground for live-preview during development
- [ ] Widget testing utilities for plugin developers
- [ ] Plugin sandbox with Node.js VM module for security

## Technical Debt

- [ ] Improve test coverage on error handling paths (~41% function coverage)
- [ ] TypeScript migration - start with `validation.js`, `security.js`
- [ ] Enable ESLint for workers (currently ignored: `src/workers/**`)
- [ ] Add JSDoc coverage for PluginAPI public methods
- [ ] Bundle size audit - analyze esbuild output for optimizations

## Observability

- [ ] Structured logging with JSON output mode for log aggregation
- [ ] Prometheus-compatible metrics endpoint for dashboard's own metrics
- [ ] Health check improvements - add dependency health (gateway, worker pool)
