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

## Current Features (Retained)

### Core Features
- System stats (CPU, memory, GPU, disk, network)
- OpenClaw sessions list
- OpenClaw agents list
- Uptime tracking
- OpenClaw logs
- Settings panel
- Web interface / Remote access (HTTP API)

### v2.0.0 Features
- **Command Palette** (`Ctrl+K`) - Quick access to all commands
- **Widget Arrangement Mode** (`w`) - Drag-and-drop widget reordering
- **Widget Pinning** (`Alt+1-9`) - Pin favorites to top row
- **Widget Size Presets** - Small/medium/large/wide per widget
- **Dashboard Snapshots** (`Ctrl+S`/`Ctrl+O`) - Export/import state
- **Auto-save** - State persistence with backup rotation
- **Export Scheduling** - Automated cron-like metric exports
- **Plugin System** - Scaffolding CLI, hot-reload, config UI
- **Theme Selector** (`T`) - Interactive theme picker
- **Performance Metrics Overlay** (`p`) - Memory, CPU, refresh stats
- **Worker Thread Pool** - Background system info gathering
- **Memory Pressure Detection** - Long-running session health
- **Multi-gateway Support** - Multiple OpenClaw endpoints
- **Gateway Auto-retry** - Exponential backoff for reconnections
- **Widget Error Boundaries** - Isolate failures, retry UI (`X`)
- **Auto Theme Detection** - Sync with system theme

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

## Feature History

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
- **Version**: v1.7.3

### Session Sorting Feature
- **Date tried**: 2026-02-19
- **Status**: SHIPPED
- **Description**: Added ability to sort sessions by different criteria using the 'o' key
- **Sort modes**:
  - `time`: Most recently updated first (default)
  - `tokens`: Highest token usage first
  - `idle`: Longest idle time first
  - `name`: Alphabetical by agent name
- **Implementation**:
  - Press 'o' to cycle through sort modes
  - Current sort mode shown in footer and session box label
  - Setting persists across restarts
  - Updated help panel with new key binding
- **Version**: v1.8.3

### Performance Monitoring Feature
- **Date tried**: 2026-02-27
- **Status**: SHIPPED
- **Description**: Added performance metrics tracking and display for dashboard monitoring
- **Metrics tracked**:
  - Memory usage (heap used/total, percentage)
  - CPU usage (process-specific)
  - Refresh rate
  - Event loop lag
  - Process uptime
- **Implementation**:
  - Toggle via Settings panel ("Perf Metrics")
  - When enabled, shows live metrics in footer: MEM, CPU, refresh rate
  - Color-coded indicators (green/yellow/red) for memory and CPU levels
  - History tracking for sparkline visualization
- **Version**: v1.9.0

### Web Interface / Remote Access Feature
- **Date tried**: 2026-02-27
- **Status**: SHIPPED
- **Description**: Added web server mode for remote dashboard access via HTTP API
- **Implementation**:
  - New `--web` CLI flag to run in web server mode (no TUI)
  - New `--web-port` flag to configure the port (default: 18790)
  - New `--web-host` flag to configure the bind host (default: 0.0.0.0)
  - REST API endpoints: `/health`, `/metrics`, `/sessions`, `/agents`, `/logs`, `/status`
  - CORS-enabled for cross-origin requests
  - JSON responses for all endpoints
  - Graceful shutdown handling
- **Endpoints**:
  - `GET /health` - Health check with version and uptime
  - `GET /metrics` - System metrics (CPU, memory, GPU, disk, network)
  - `GET /sessions` - Active OpenClaw sessions
  - `GET /agents` - Available OpenClaw agents
  - `GET /logs` - Recent OpenClaw logs
  - `GET /status` - Full dashboard status (all data combined)
- **Security**: API key authentication and rate limiting added in v2.0.0
- **Version**: v1.10.0

### Command Palette Feature
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Quick access to all dashboard commands via fuzzy search overlay
- **Implementation**:
  - Press `Ctrl+K` to open command palette
  - Type to filter commands by name or description
  - Navigate with arrow keys, select with Enter
  - Categories: Navigation, Display, System, Widgets
  - Shows keyboard shortcuts for each command
- **Version**: v2.0.0

### Widget Arrangement Mode
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Drag-and-drop style widget reordering
- **Implementation**:
  - Press `w` to enter arrangement mode
  - Use arrow keys to move focused widget
  - Press Escape or `w` again to exit
  - Layout persists across restarts
- **Version**: v2.0.0

### Widget Pinning Feature
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Pin up to 4 favorite widgets to a dedicated top row
- **Implementation**:
  - Press `Alt+1` through `Alt+9` to pin/unpin widgets
  - Pinned widgets appear in a fixed top row
  - Independent from visibility toggles
  - Useful for keeping important widgets always visible
- **Version**: v2.0.0

### Dashboard Snapshots
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Export and import dashboard state as shareable JSON files
- **Implementation**:
  - Press `Ctrl+S` to export current state (settings, widget visibility, sizes, positions)
  - Press `Ctrl+O` to import a previously saved snapshot
  - Useful for sharing configurations across machines or backing up preferences
- **Version**: v2.0.0

### Auto-save System
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Automatic state persistence with crash recovery
- **Implementation**:
  - Saves state every 30 seconds (configurable)
  - Maintains last 5 backups with rotation
  - Restores on startup: session selection, search query, favorites filter, widget focus
  - Configurable via settings (interval, saveOnExit)
- **Version**: v2.0.0

### Plugin System
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Extensible widget plugin architecture with scaffolding
- **Implementation**:
  - Interactive scaffolding CLI: `clawdash plugin:create`
  - Plugin hot-reload with `--watch` flag for development
  - Plugin configuration UI in settings panel
  - Manifest validation on load
  - Pre-commit hooks with lint-staged
- **Version**: v2.0.0

### Theme Selector UI
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Interactive theme picker with live preview
- **Implementation**:
  - Press `T` to open theme selector
  - Navigate with arrow keys, preview live
  - Themes: default, dark, high-contrast, ocean, auto (system sync)
  - Auto theme detection syncs with system theme changes
- **Version**: v2.0.0

### Worker Thread Pool
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Offload heavy system info gathering to background threads
- **Implementation**:
  - Configurable worker pool for systeminformation calls
  - Graceful degradation when workers unavailable
  - Prevents UI blocking during expensive operations
  - Status shown in performance overlay
- **Version**: v2.0.0

### Multi-gateway Support
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Connect to multiple OpenClaw endpoints
- **Implementation**:
  - Configure multiple gateways in settings
  - Visual indicator in footer shows gateway status
  - Per-gateway health monitoring
  - Auto-retry with exponential backoff for failed connections
- **Version**: v2.0.0

### Widget Error Boundaries
- **Date tried**: 2026-02-28
- **Status**: SHIPPED (v2.0.0)
- **Description**: Isolate widget failures from crashing entire dashboard
- **Implementation**:
  - Failed widgets show error state with retry button
  - Press `X` to retry all failed widgets
  - Other widgets continue operating normally
  - Error details logged for debugging
- **Version**: v2.0.0

## Version History
- v1.5.1: Baseline
- v1.6.0: Session list improvements, memory calculation fix
- v1.7.0: **REVERT** - top processes added then removed
- v1.7.0 (new): Network traffic sparkline visualization
- v1.7.1: Real-time clock widget
- v1.7.2: Pause/resume refresh feature
- v1.7.3: Network sparkline widget enhancement
- v1.7.4: Disk usage sparkline visualization (DECLINED - not useful)
- v1.7.5: Load average display (REJECTED)
- v1.8.1: Session list improvements
- v1.8.2: Session sorting feature
- v1.8.3: Session sorting enhancements
- v1.9.0: Performance monitoring, web interface
- v2.0.0: **MAJOR** - Command palette, widget system overhaul, snapshots, auto-save, plugin system, theme selector, multi-gateway, worker threads, error boundaries
