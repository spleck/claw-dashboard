# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-02-28

### Major Features

#### Command Palette (Ctrl+K)
- Quick access to all dashboard commands via fuzzy search
- Keyboard shortcut discovery and command execution
- Categories for Navigation, Display, System, and Widgets

#### Widget System Overhaul
- **Drag-and-drop arrangement mode** - Press `w` to enter arrangement mode, use arrow keys to reorder widgets
- **Widget pinning** - Pin up to 4 favorite widgets to the top row with `Alt+1-9`
- **Widget size presets** - Resize any widget to small, medium, large, or wide
- **Improved widget navigation** - Tab/Shift+Tab to cycle focus between widgets
- **Enter key actions** - Show widget details or performance overlay when widget is focused

#### Dashboard Snapshots
- Export full dashboard state as shareable JSON files (`Ctrl+S`)
- Import snapshots to restore configurations (`Ctrl+O`)
- Includes widget visibility, sizes, positions, and settings

#### Auto-save System
- Automatic state persistence every 30 seconds
- Crash recovery with backup rotation (keeps last 5 backups)
- Restores session selection, search queries, favorites filter, and widget focus on restart

#### Export Scheduling
- Automated metric exports with cron-like scheduling
- Configurable format (JSON/CSV), directory, and retention
- Optional metrics inclusion and custom schedules

#### Plugin System
- Interactive plugin scaffolding CLI for creating new widgets
- Plugin hot-reload with `--watch` flag for development
- Plugin configuration UI in settings panel
- Manifest validation on load
- Pre-commit hooks with lint-staged for plugin development

#### Theme System Enhancements
- **Theme selector UI** - Interactive picker with live preview (`T` key)
- **Auto theme detection** - Syncs with system theme changes
- **Animated loading states** - Smooth transitions for splash screen

#### Performance & Monitoring
- **Performance metrics overlay** - Memory, CPU, and refresh rate stats (press `p`)
- **Worker thread pool** - Offloads heavy system info gathering for UI responsiveness
- **Memory pressure detection** - Monitors long-running session health
- **Graceful degradation** - Continues operating when system data fetching fails

#### Gateway Management
- **Multi-gateway support** - Connect to multiple OpenClaw endpoints
- **Auto-retry with exponential backoff** - Configurable retry logic
- **Gateway status widget** - Visual indicator of gateway health
- **Manual retry** - Press `G` to retry connection when offline

#### Error Handling
- **Widget error boundaries** - Isolates widget failures from dashboard
- **Error recovery UI** - Press `X` to retry failed widgets
- **Custom error classes** - Better error categorization and handling
- **Widget error isolation** - Failed widgets show retry button without crashing dashboard

### New Controls

| Key | Action |
|-----|--------|
| `Ctrl+K` | Open command palette |
| `w` | Enter widget arrangement mode |
| `Alt+1-9` | Pin/unpin widget to favorites |
| `T` | Open theme selector |
| `Ctrl+S` | Export dashboard snapshot |
| `Ctrl+O` | Import dashboard snapshot |
| `X` | Retry failed widgets |
| `Enter` | Show widget details (when focused) |

### Changed
- **Swapped hotkeys**: `p` now opens performance overlay, `P` (capital) pauses
- Improved settings panel with more options
- Enhanced footer with gateway status and performance metrics
- Better cross-platform GPU support (WSL2, Windows WMI, Linux nvidia-smi)
- Container environment detection (Docker, Kubernetes, WSL)

### Fixed
- Navigation crash during settings modal close (race condition)
- Worker timer leak in widget refresh intervals
- Session detail view color markup display
- Settings list refresh after changing refresh interval
- Modal state getting stuck when closing multiple modals quickly
- Performance overlay now properly captures input (q/Escape/p to close)
- Version check now non-blocking with configurable 12h interval
- Widget destroy errors with proper null checks
- Log level filter default to "all" instead of "error"

### Security
- Web server API key authentication
- Web server rate limiting and CORS configuration
- File path validation for export/import operations
- Gateway endpoint configuration validation

### Developer Features
- c8 code coverage reporting with threshold checks
- Enhanced CLI organization with modular handlers
- Plugin validator with verbose mode
- Pre-commit hooks for code quality

## [1.9.0] - 2025-02-06

### Added
- Dynamic widget reflow and show/hide functionality (keys 1-4)
- Session TPS (transactions per second) column
- Session count display in sessions header
- Data Health widget with data freshness tracking
- Sound notifications for alerts
- Auto-detect terminal theme on first run
- Vi-mode navigation (hjkl keys)
- Favorites/bookmarks feature for quick navigation
- Tooltip hints system for first-run users

### Changed
- Improved session sorting options (recent, context size, idle time, CPU, memory)
- Enhanced UI with theme persistence

### Fixed
- Arrow key navigation for session pages
- Network interface change handling
- Stale session TPS cleanup
- Toggle search binding error

## [1.8.5] - 2025-02-04

### Added
- Widget toggle feature (press 1-4 to show/hide)

## [1.8.4] - 2025-02-04

### Added
- Session duration display in session list

## [1.8.2] - 2025-02-03

### Fixed
- TPS calculation using correct session data source

## [1.8.0] - 2025-02-03

### Added
- Dashboard export functionality (JSON, CSV, markdown)
- Logger module for file-based logging
- Session sorting by CPU, memory, and load average

### Changed
- Read sessions directly from sessions.json for improved reliability

### Removed
- Load average display feature (rejected due to cross-platform inconsistencies)

## [1.7.3] - 2025-02-02

### Changed
- Stale sessions now displayed in gray instead of red

## [1.7.2] - 2025-02-02

### Changed
- Clock widget now uses local timezone

## [1.7.1] - 2025-02-02

### Added
- Clock widget displaying current time
- Log level filtering and colorizing

## [1.7.0] - 2025-02-01

### Added
- Network traffic sparkline visualization
- Top Processes widget

## [1.6.0] - 2025-01-31

### Added
- SQLite persistence for metrics and sessions
- Cache module with TTL support
- Adaptive refresh rate based on system load

## [1.5.1] - 2025-01-30

### Fixed
- Session navigation bounds checking
- Race condition in settings management

## [1.5.0] - 2025-01-30

### Added
- Alerts system with configurable thresholds
- Retry logic with exponential backoff
- Validation module for input sanitization

## [1.4.1] - 2025-01-29

### Added
- Interactive settings panel
- Version display in header
- UI polish and refinements

## [1.4.0] - 2025-01-28

### Added
- Interactive settings panel with real-time updates
- Mouse support for navigation
- Session detail view

### Changed
- Enhanced theme system with 4 customizable themes

## [1.3.0] - 2025-01-27

### Added
- Theme system with customizable color schemes
- Session search functionality
- Pagination for large session lists

## [1.2.0] - 2025-01-26

### Added
- GPU monitoring (basic support)
- Disk usage visualization
- Network interface monitoring

## [1.1.0] - 2025-01-25

### Added
- Memory usage display with progress bars
- CPU utilization sparkline
- System information panel

## [1.0.0] - 2025-01-24

### Added
- Initial release of Claw Dashboard
- Real-time OpenClaw session monitoring
- Basic CPU and memory metrics
- Terminal-based UI using blessed
- Cross-platform support (macOS, Linux)
- Session list with status indicators
- Auto-refresh with configurable interval

---

## Version Format

Versions follow [Semantic Versioning](https://semver.org/):

- **MAJOR** - Incompatible API changes or major feature rewrites
- **MINOR** - New functionality (backward compatible)
- **PATCH** - Bug fixes and small improvements (backward compatible)

## Categories

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

## Release Notes Template

When adding a new release, use this template:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Change description

### Fixed
- Bug fix description

### Security
- Security improvement description
```
