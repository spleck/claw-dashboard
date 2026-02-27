# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Worker thread support for heavy system information gathering
- WSL2 GPU monitoring via Windows host interop
- Container environment detection (Docker, Kubernetes, WSL)
- Multi-gateway support for multiple OpenClaw endpoints
- Graceful degradation for system data fetching failures
- Windows GPU monitoring via WMI/PowerShell
- Linux GPU monitoring via nvidia-smi and radeontop

### Changed
- Improved error handling with custom error classes
- Enhanced cache module with worker thread integration
- Updated platform detection for cross-platform GPU support

### Security
- File-only logging with data sanitization
- Added validation for gateway endpoint configurations

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
