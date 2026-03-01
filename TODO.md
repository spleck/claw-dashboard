# TODO

## Active Work

- [ ] Multiple dashboard profiles/pages

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

## Code Review Notes & Recommendations (2026-02-28)

### Current State (dev branch)

- **Build Status:** Passing
- **Tests:** 1399 passing, 1 skipped
- **CJS Build:** Up-to-date and validated

### Recently Completed

#### Widget Drag-and-Drop Arrangement (2026-02-28)

Implemented widget arrangement mode allowing users to reorder widgets via keyboard.

**Features:**
- **Activation:** Press `w` or `m` to enter arrangement mode
- **Navigation:** Arrow keys (or j/k) to move widgets left/right with wrapping
- **Exit:** Press ESC or toggle again to exit and save
- **Persistence:** Order saved to `widgetOrder` setting in settings
- **Validation:** `validateWidgetOrder()` ensures valid widget IDs, removes duplicates

**Files Modified:**
- `index.js` - Added arrangement mode state, toggle, move, save functions
- `src/validation.js` - Added `validateWidgetOrder()` and added to settings validation

**Bug Fixed:**
- Fixed variable name mismatch: `arrangeWidgetStartIndex` → `arrangeWidgetIndex` (line 840)

### Recommendations

1. **Widget Drag-and-Drop UI** - Consider adding visual feedback:
   - Numbered indicators showing current position
   - Swap preview before committing
   - Consider mouse drag support in future

2. **TypeScript Migration** - Continue with validation module:
   - `validation.js` has clear interfaces
   - Would improve type safety for settings

3. **Test Coverage** - Focus areas:
   - New widget arrangement functions
   - Error handling paths (still ~41% function coverage)

4. **Documentation** - Update PLUGINS.md with any new PluginAPI methods

### Security Considerations
- Plugin path validation is in place
- Rate limiting active on all PluginAPI methods
- Consider sandboxing for third-party plugins (Node.js VM)
