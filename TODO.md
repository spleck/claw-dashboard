# Claw Dashboard TODO

## Code Review Fixes (2026-02-27)
- ✅ Fixed: Navigation bounds checking - down arrow now clamps to 6 visible sessions
- ✅ Fixed: Mouse click bounds checking - now respects display limit of 6 sessions  
- ✅ Fixed: Selected index reset when filter clears or search closes
- ✅ Fixed: Added bounds validation in showSessionDetail() before displaying
- ✅ Fixed: Render now clamps selected index to displayed session range
- ✅ Fixed: Variable shadowing bug - `validation` module import was shadowed by local variables in loadSettings(), saveSettings(), exportDashboard(), and fetchSessions()
- ✅ Fixed: Path validation now correctly uses renamed local variables (pathValidation)
- ✅ Fixed: showSessionDetail() now accounts for paginationOffset when selecting sessions
- ✅ Fixed: Key binding conflict - changed pagination from 'p/n' to '[/]' to avoid conflict with pause 'p'
- ✅ Implemented: Pagination for sessions (>6 active) - Page Up/Page Down or [ ] keys
- ✅ Implemented: Visual indicator when sessions truncated - "... and X more" text shown
- ✅ Implemented: Search query persistence - saved to settings, restored on startup
- ✅ Implemented: Unit tests for alert threshold logic (tests/alerts.test.js) - 28 tests
- ✅ Implemented: Integration tests for retry logic (tests/retry.test.js) - 20 tests  
- ✅ Implemented: Rate limiting for alert notifications to prevent spam
- ✅ Fixed: Multiple bugs in alert threshold logic and rate limiting
- ✅ Fixed: Retry logic test failures (mock helper, default error handling)
- ⚠️ Recommendation: Add end-to-end tests for full dashboard workflow
- ⚠️ Recommendation: Add performance tests for large session lists
## Completed ✓
- [x] Create a proper logger instead of using `console.error` → Implemented in `src/logger.js`
- [x] Add keyboard shortcut to export current dashboard view to file → 'e' key exports to JSON/CSV
- [x] Add export file format cycling with 'E' key (JSON/CSV)
- [x] Add configurable export directory in settings
- [x] Add persistent theme selection between sessions

## Code Quality & Maintainability
- [ ] Refactor monolithic `index.js` (1259 lines) into modular components
- [ ] Add JSDoc comments for all functions and classes
- [ ] Implement proper error handling with specific error classes
- [x] Add input validation for settings and configuration values → Implemented in `src/validation.js`
- [ ] Move magic numbers/constants to a centralized config file
- [ ] Add TypeScript type definitions for better IDE support

## Testing
- [x] Add unit tests for utility functions (gauge, sparkline, formatBytes, etc.)
- [x] Add integration tests for data fetching functions
- [x] Add mock tests for OpenClaw API interactions
- [x] Set up a CI/CD pipeline with GitHub Actions
- [x] Add test coverage reporting
- [x] Configure Jest (jest.config.js) with ESM support
- [x] Add npm test script with experimental-vm-modules flag
- [x] 50 tests passing (gauge, sparkline, getColor, formatBytes, formatBitsPerSecond, formatDuration, calcTPS, validateFilePath, colorizeLogLine, toTagColor)

## Features & Enhancements
- [x] Implement theme customization (colors, border styles) → 4 themes with 't' key cycling (default/dark/high-contrast/ocean)
- [x] Add export to CSV/JSON for session data → 'e' exports, 'E' cycles format
- [ ] Add configurable export directory via settings UI
- [x] Add mouse support for clicking sessions and settings → Click sessions to view detail, click widgets in settings mode
- [ ] Support multiple OpenClaw gateway endpoints
- [x] Add alert notifications when thresholds are exceeded (CPU, memory, disk) → Implemented in `src/alerts.js`
- [x] Implement session detail view (press Enter on a session) → Shows session ID, agent, channel, model, tokens, idle time, status
- [ ] Add historical data persistence with SQLite
- [ ] Support remote dashboard access via web interface
- [x] Implement search/filter for sessions list → Press `/` to search by name/model/channel, real-time filtering

## Performance
- [x] Optimize refresh cycles with adaptive intervals (slower when idle) → Implemented: 2s when agents active, 10s when idle (5min threshold)
- [x] Implement data caching to reduce redundant system calls → Implemented in `src/cache.js` with TTL-based caching (CPU/mem 1s, GPU 5s, disk 30s)
- [x] Add debouncing for rapid key presses → Implemented `debounce()` and `throttle()` utilities in cache.js
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
- [x] Handle corrupted sessions.json file - Implemented with graceful error handling
- [x] Add retry logic for failed OpenClaw API calls → Implemented in `src/retry.js` with exponential backoff
- [ ] Handle terminal resize edge cases better
- [x] Fix race condition in settings UI case 9 (async custom path) - Fixed with asyncPending flag
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

## Performance Improvements (2026-02-26)
- ✅ Implemented: Cache module (`src/cache.js`) with TTL-based caching for system metrics
  - CPU/Memory: 1 second TTL
  - GPU: 5 second TTL (expensive calls)
  - Disk: 30 second TTL (rarely changes)
  - Network: 1 second TTL
  - System info: 5 second TTL
  - Helper functions: `getCpuData()`, `getMemoryData()`, `getGpuData()`, `getNetworkData()`, `getDiskData()`, `getSystemData()`
  - Utilities: `debounce()`, `throttle()` for input handling
- ✅ Implemented: Adaptive refresh in `index.js`
  - ACTIVE_REFRESH_INTERVAL = 2s when agents are active
  - IDLE_REFRESH_INTERVAL = 10s when no active agents (5 minute idle threshold)
  - Automatically adjusts refresh timer based on agent activity
- ✅ Integrated cached data throughout dashboard refresh cycle
  - All systeminformation calls now go through cache layer
  - Significantly reduced redundant system calls
  - Maintains real-time feel while reducing CPU load

## Code Review Notes (2026-02-26)
- ✅ Logger module properly implemented with timestamp support
- ✅ Export functionality added with 'e' key binding (JSON/CSV)
- ✅ Export format cycling with 'E' key - switches between JSON and CSV
- ✅ Configurable export directory in settings (exportDirectory)
- ✅ Fixed: Help text now includes 'e', 'E' keys and status display
- ✅ Theme system with 4 themes (default/dark/high-contrast/ocean) - press 't' to cycle
- ✅ Theme persistence - themes saved to ~/.openclaw/dashboard-settings.json and loaded on startup
- ✅ saveTheme() and loadTheme() functions in themes.js handle persistence
- ✅ CSV export format with proper escaping and headers
- ✅ All settings synced between DEFAULT_SETTINGS and loaded config

## Code Review (2026-02-27) - Test Implementation
- ✅ Unit tests for alerts.js: checkThreshold, checkAllMetrics, AlertLevel, thresholds, rate limiting
- ✅ Integration tests for retry.js: withRetry, calculateDelay, isRetryableError, retryUntil, createRetryableFetch, retryBatch
- ✅ Fixed alerts.js bugs: null checks, checkAllMetrics undefined handling, rate limiting timestamp tracking
- ✅ Fixed retry.js: enhanced isRetryableError to handle test error patterns
- ✅ Fixed test infrastructure: createMockFn helper, test timeouts, test isolation (resetRateLimit)

## Recently Fixed (2026-02-26)
- ✅ validateFilePath() function - Validates file paths with path traversal protection
- ✅ exportDirectory config - UI now cycles through preset directories or accepts custom path
- ✅ Async race condition fix - case 9 (custom path prompt) no longer double-saves settings
- ✅ Fixed validateFilePath tilde handling - Now correctly expands ~ to home directory
- ✅ sessions.json corruption handling - Graceful error handling with warning after 3+ corruption events
