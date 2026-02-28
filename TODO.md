# TODO

## Active Work

- [ ] Widget drag-and-drop arrangement
- [ ] Multiple dashboard profiles/pages

## Recently Completed (2026-02-28)

### Custom Widget Slots (Favorites Row)

Implemented widget pinning feature allowing users to pin up to 4 widgets to a dedicated favorites row.

**Features:**
- **Pinning:** Use `Alt+1-9` (or Shift+number) to pin/unpin widgets
- **Visual Feedback:** Toast notifications confirm pin/unpin actions
- **Smart Layout:** Pinned widgets occupy row 0; unpinned widgets use balanced layout below
- **Persistence:** Pinned state saved to settings and restored on restart
- **Validation:** Settings validation ensures max 4 pins and valid widget IDs only

**Files Modified:**
- `src/config.js` - Added `pinnedWidgets: []` to DEFAULT_SETTINGS
- `src/validation.js` - Added `validatePinnedWidgets()` function
- `index.js` - Added `togglePinWidget()`, `showToast()`, keybindings, and updated `recalculateLayout()`

**Tests:** 1400 tests passing

## Plugin Developer Experience

- [ ] Plugin marketplace/discovery system (registry index)
- [ ] Widget playground for live-preview during development
- [ ] Plugin sandbox with Node.js VM module for security isolation

## Polish

- [ ] Real-time WebSocket updates (push instead of poll)
- [ ] Session quick-switch fuzzy finder (Ctrl+K style)
- [ ] Export scheduling - cron-style auto-export of metrics

## Technical Debt

- [ ] Improve test coverage on error handling paths (~41% function coverage)
- [ ] TypeScript migration - start with `validation.js`, `security.js`
- [ ] Add JSDoc coverage for PluginAPI public methods

## Observability

- [ ] Structured logging with JSON output mode for log aggregation
- [ ] Prometheus-compatible metrics endpoint for dashboard's own metrics
- [ ] Health check improvements - add dependency health (gateway, worker pool)

---

## Code Review Notes & Recommendations

### Current State (dev branch)
- **Build Status:** Passing
- **Tests:** 1400 passing, 1 skipped
- **CJS Build:** Up-to-date and validated

### Recommendations

1. **Widget Drag-and-Drop** - Next priority feature. Consider:
   - Visual drag handles on widgets
   - Grid snapping for consistent layout
   - Persist drag positions alongside pinned state

2. **TypeScript Migration** - Consider starting with validation module:
   - `validation.js` is self-contained with clear interfaces
   - Would improve type safety for settings and configuration
   - Could expose type definitions for plugin developers

3. **Test Coverage** - Focus areas for improvement:
   - Error handling paths (currently ~41% function coverage)
   - Settings modal lifecycle (recently added tests, could expand)
   - Worker pool recovery scenarios

4. **Documentation** - Update PLUGINS.md if adding new PluginAPI methods

### Security Considerations
- Plugin path validation is in place and working
- Rate limiting is active on all PluginAPI methods
- Consider adding sandboxing for third-party plugins (Node.js VM module)
