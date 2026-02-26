# Claw Dashboard TODO

## Completed ✓
- [x] Create a proper logger instead of using `console.error` → Implemented in `src/logger.js`
- [x] Add keyboard shortcut to export current dashboard view to file → 'e' key exports to JSON

## Code Quality & Maintainability
- [ ] Refactor monolithic `index.js` (1259 lines) into modular components
- [ ] Add JSDoc comments for all functions and classes
- [ ] Implement proper error handling with specific error classes
- [ ] Add input validation for settings and configuration values
- [ ] Move magic numbers/constants to a centralized config file
- [ ] Add TypeScript type definitions for better IDE support

## Testing
- [ ] Add unit tests for utility functions (gauge, sparkline, formatBytes, etc.)
- [ ] Add integration tests for data fetching functions
- [ ] Add mock tests for OpenClaw API interactions
- [ ] Set up a CI/CD pipeline with GitHub Actions
- [ ] Add test coverage reporting

## Features & Enhancements
- [x] Implement theme customization (colors, border styles) → 4 themes with 't' key cycling (default/dark/high-contrast/ocean)
- [ ] Add mouse support for clicking sessions and settings
- [ ] Support multiple OpenClaw gateway endpoints
- [ ] Add alert notifications when thresholds are exceeded (CPU, memory, disk)
- [ ] Implement session detail view (press Enter on a session)
- [ ] Add historical data persistence with SQLite
- [ ] Support remote dashboard access via web interface
- [ ] Add export to CSV/JSON for session data
- [ ] Implement search/filter for sessions list

## Performance
- [ ] Optimize refresh cycles with adaptive intervals (slower when idle)
- [ ] Implement data caching to reduce redundant system calls
- [ ] Add debouncing for rapid key presses
- [ ] Lazy-load widgets when they become visible
- [ ] Optimize blessed screen rendering with differential updates
- [ ] Use worker threads for heavy system information gathering

## Security
- [ ] Sanitize log output to prevent injection attacks
- [ ] Validate file paths before reading (sessions.json, settings)
- [ ] Add checksum verification for OpenClaw gateway responses
- [ ] Secure settings file with proper permissions (0600)

## Documentation
- [ ] Create API documentation for internal modules
- [ ] Add contribution guidelines (CONTRIBUTING.md)
- [ ] Create architecture diagram showing data flow
- [ ] Document widget layout system and positioning logic
- [ ] Add changelog with semantic versioning
- [ ] Create man page for the CLI tool

## Build & Distribution
- [ ] Add ESBuild or Rollup for bundling
- [ ] Create Docker image for containerized deployment
- [ ] Add Homebrew formula for easier installation
- [ ] Sign releases with GPG
- [ ] Create automated release script with version bumping

## Bug Fixes & Robustness
- [ ] Handle network interface changes gracefully
- [ ] Fix potential memory leak in log line history
- [ ] Handle corrupted sessions.json file
- [ ] Add retry logic for failed OpenClaw API calls
- [ ] Handle terminal resize edge cases better
- [ ] Fix race conditions in refresh cycle
- [ ] Add graceful degradation when systeminformation fails

## Platform Support
- [ ] Add Linux support for GPU monitoring (nvidia-smi, radeontop)
- [ ] Add Windows support with PowerShell scripts
- [ ] Detect containerized environments (Docker, Kubernetes)
- [ ] Support WSL2 on Windows

## User Experience
- [ ] Add startup splash screen with loading indicator
- [ ] Implement smooth transitions between views
- [ ] Add sound notifications for alerts (optional)
- [ ] Support terminal themes (light/dark/auto-detect)
- [ ] Add tooltip hints on first run
- [ ] Implement vi-mode for keyboard navigation
- [ ] Add bookmark/favorite sessions feature

## Code Review Notes (2025-02-25)
- ✅ Logger module properly implemented with timestamp support
- ✅ Export functionality added with 'e' key binding
- ✅ Fixed: Help text now includes 'e' key for export
- ✅ Theme system with 4 themes (default/dark/high-contrast/ocean) - press 't' to cycle
- ⚠️ Consider adding export format options (CSV, JSON) in future
- ⚠️ Export directory hardcoded to ~/.openclaw/exports - consider making configurable
- ⚠️ Theme selection does not persist between sessions - save to settings.json
