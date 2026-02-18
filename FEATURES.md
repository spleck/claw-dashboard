# Claw Dashboard Feature History

## Features Tried

### Top Processes Widget
- **Date tried**: 2026-02-11, 2026-02-12
- **Status**: REMOVED - PERMANENTLY DECLINED
- **Reason**: Layout issues (squeezed display, overflow problems)
- **User feedback (2026-02-11)**: Declined for lack of interest
- **User feedback (2026-02-12)**:
  1. Redundant to previous rejection
  2. **Colors render as markup** - blessed color tags showing literally instead of rendering
  3. **Layout problems**: Split screen makes logs unreadable, limits visible content
- **Re-added by**: Cron job 2026-02-12 (mistake - should not have been re-added)
- **Action**: NEVER implement this feature again

## Current Features (Retained)
- System stats (CPU, memory, GPU, disk, network)
- OpenClaw sessions list
- OpenClaw agents list
- Uptime tracking
- OpenClaw logs
- Settings panel

## User Preferences
- Prefer clean, uncluttered layout
- Session list format should match `clawps` style
- Memory calculation should exclude cache (Activity Monitor style)
- No interest in top processes widget

## Pending Ideas
- None currently

## Technical Notes

### Color Markup Fix (blessed)
When colors show as literal text like `{green-fg}text{/green-fg}` instead of rendering:
- **Cause**: Mixing blessed tags with plain strings, or improper tag formatting
- **Fix**: Use blessed's `{color-fg}text{/color-fg}` format consistently
- **Check**: Ensure `tags: true` is set on blessed text elements
- **Avoid**: Concatenating tagged strings with plain strings incorrectly

### Layout Guidelines
- Split-screen layouts reduce readability
- Logs need full width to be useful
- Avoid squeezing content into narrow columns

### Network Traffic Sparkline
- **Date tried**: 2026-02-13
- **Status**: SHIPPED
- **Description**: Added sparkline visualization to network widget showing upload/download traffic history
- **Implementation**: Combined RX+TX data displayed as activity sparkline, consistent with CPU/memory widgets
- **Version**: v1.7.0

### Real-time Clock Widget
- **Date tried**: 2026-02-13
- **Status**: SHIPPED
- **Description**: Added a real-time clock showing current time and date in the top-right corner of the dashboard
- **Implementation**: Displays HH:MM:SS AM/PM format with date (e.g., "Feb 13"), updates every refresh cycle
- **Timezone**: America/Chicago (CST) to match user's timezone
- **Version**: v1.7.1

### Pause/Resume Refresh Feature
- **Date tried**: 2026-02-14
- **Status**: SHIPPED
- **Description**: Added ability to pause and resume auto-refresh with 'p' or Space key
- **Implementation**: 
  - Press 'p' or Space to toggle pause state
  - When paused: clock shows [PAUSED] in yellow, footer shows "▶ running"
  - When running: footer shows "p pause"
  - Help panel updated with new key binding
- **User feedback**: (to be filled in)
- **Version**: v1.7.2

### Network Traffic Sparkline Visualization
- **Date tried**: 2026-02-15
- **Status**: SHIPPED
- **Description**: Added sparkline visualization to network widget showing combined RX+TX traffic history
- **Implementation**:
  - Extended network widget height from 4 to 5 rows to accommodate sparkline
  - Added combined network activity sparkline (RX + TX data) displayed below interface name
  - Uses existing network history data (30 data points, ~60 seconds of history)
  - Adjusted log box position to prevent overlap (top: 23, height: 100%-24)
- **User feedback**: (to be filled in)
- **Version**: v1.7.3

### Disk Usage Sparkline
- **Date tried**: 2026-02-15
- **Status**: DECLINED
- **Description**: Added sparkline visualization to disk widget showing disk usage history over time
- **Reason declined**: Disk usage changes too slowly - sparkline provides no useful insight at 2s refresh intervals
- **User feedback**: "Disk usage changes slowly. Spark line kind of useless."
- **Version**: Not shipped

### Load Average Display
- **Date tried**: 2026-02-15, 2026-02-18
- **Status**: REJECTED
- **Description**: Added 1/5/15 minute load average display to CPU widget detail line
- **Implementation**:
  - Attempt 1 (2026-02-15): Added as new row in System widget (increased all widget heights)
  - Attempt 2 (2026-02-18): Moved to CPU box detail line, replacing "X cores" text
- **Reason rejected**: Feature not needed
- **User feedback**: "It would be better added to the cpu box to replace the middle line instead of changing the row size" (2026-02-15), then ultimately rejected 2026-02-18
- **Version**: Not shipped

## Version History
- v1.5.1: Baseline
- v1.6.0: Session list improvements, memory calculation fix
- v1.7.0: **REVERT** - top processes added then removed
- v1.7.0 (new): Network traffic sparkline visualization
- v1.7.1: Real-time clock widget
- v1.7.2: Pause/resume refresh feature
- v1.7.3: Network sparkline widget enhancement
- v1.7.4: Disk usage sparkline visualization (DECLINED - not useful)
- v1.7.5: Load average display (in progress)
- v1.8.1: Session list improvements
