# Claw Dashboard TODO

## Current Sprint Status (Dev Branch)
**Last Review:** 2026-02-26

### Latest Changes Review (2026-02-26)
- **Custom Error Classes** (`src/errors.js`)
  - 12 error classes extending DashboardError base class
  - DashboardError, ConfigError, SettingsError, GatewayError, SessionError
  - DataFetchError, AuthError, NetworkError, UIError, DatabaseError
  - ValidationError, TimeoutError
  - ERROR_CODES constant for programmatic error handling
  - Helper functions: isDashboardError(), getErrorCode()
  - All 22 tests passing
- **TypeScript Type Definitions** (`src/types.d.ts`)
  - JSDoc-based type definitions for IDE autocomplete
  - Session, CPUData, MemoryData, GPUData, NetworkData, DiskData, SystemData
  - DashboardData, Settings, Alert, RetryOptions type definitions
  - ThemeName, SortMode, LogLevel, ExportFormat union types
  - Export type constants: VALID_THEMES, VALID_SORT_MODES, VALID_LOG_LEVELS, VALID_EXPORT_FORMATS
- **Log Line Memory Leak Fix** (`index.js`)
  - Added MAX_LOG_LINES = 500 hard cap
  - Uses slice(-MAX_LOG_LINES) to keep only latest lines
  - Prevents unbounded memory growth from log accumulation
- **Duplicate Import Fix** (`index.js`)
  - Combined duplicate error imports into single import statement

### Recently Completed
1. **Data Health Widget** (new widget in `index.js`)
   - Widget 8 shows freshness of metrics data
   - Displays "All Fresh", "Stale Data", or "Data Delayed" based on age
   - Color-coded border: green (fresh), yellow (stale), red (delayed)
   - Timestamps tracked for CPU, memory, GPU, network, disk, system, sessions
   - Toggle with '8' key, log level filter moved to '0' key

2. **First-run tooltip hints** (`src/hints.js`)
   - 5 contextual hint cards with navigation, vi-mode, bookmarks, widgets, actions
   - 'n' next hint, 'q' skip, 'r' show again, '?' manual access
   - Settings persistence via `firstRun: true` in DEFAULT_SETTINGS

2. **Vi-mode navigation** (enhanced key bindings in `index.js`)
   - h/l/j/k/g/G/Ctrl+B/Ctrl+F

3. **Favorites/bookmarks system**
   - 'f' toggle favorite, 'F' filter favorites, persisted to settings

4. **Sound notifications for alerts** (`src/alerts.js`)
   - Configurable sound on/off, bell/beep types
   - Plays on warning and critical alerts
   - Separate enable flags for warning/critical levels

5. **Auto-detect terminal theme** (`src/themes.js`)
   - Detects terminal background (light/dark) on macOS
   - Supports iTerm2, Apple Terminal, VS Code
   - 'auto' theme resolves to dark or default based on detection
   - Default theme changed to 'auto'

### Code Review Notes
- All tests pass (109 tests across utils.test.js, alerts.test.js, retry.test.js)
- `index.js`: Defensive check added for `showDetail` before binding (prevents undefined errors)
- `index.js`: Dynamic import for hints.js on '?' key (lazy loading, good practice)
- `src/config.js`: `firstRun: true` added to DEFAULT_SETTINGS
- `index.js`: Data Health widget (Widget 8) added with freshness tracking
- `index.js`: Fixed duplicate case 8 bug - log level filter moved to '0' key
- `src/config.js`: Removed duplicate `showWidget8` declaration

### Latest Changes Review (2026-02-26)
- `index.js`: Data Health widget implementation
  - Tracks data freshness timestamps for all metric types
  - Displays status: All Fresh (<5s), Stale Data (5-15s), Data Delayed (>15s)
  - Added key binding '8' for widget toggle, '0' for log level filter
  - Added `cycleLogLevel()` method for log level cycling
  - Plays terminal bell on warning/critical alerts
  - Configurable via setSoundConfig(), toggleSound()
  - Removed unused playBeep() function (dead code fix)
- `src/themes.js`: Added auto-detect theme feature
  - Detects terminal background (light/dark) on macOS
  - Supports iTerm2, Apple Terminal, VS Code
  - 'auto' theme resolves dynamically
- `src/config.js`: Default theme changed to 'auto'
- `TODO.md`: Updated with new completed features

### Code Review (2026-02-26) - Graceful Degradation
- `src/cache.js`: Added try-catch wrappers around all systeminformation fetcher functions
  - CPU, memory, GPU, network, disk, and system data all now log warnings on failure
  - Errors are re-thrown after logging for caller to handle gracefully
- `index.js`: Added try-catch blocks in refresh() method
  - CPU/memory, system data, and GPU fetches wrapped individually
  - Falls back to existing data on failure (empty arrays/objects with defaults)
  - Ensures UI never shows undefined values after a fetch failure

### Recommendations
- Consider adding a "system health" indicator widget showing data freshness (COMPLETED in dev)
- Could add retry logic with backoff for transient failures
- Consider caching "last known good" values to disk for faster recovery after restart
- **COMPLETED:** Handle network interface changes gracefully
  - Detects interface changes and counter resets (after sleep/wake)
  - Resets network history to avoid stale/incorrect data
  - Logs interface changes and counter resets for debugging
- **COMPLETED:** Fix potential memory leak in sessionTPS
  - Cleans up sessionTPS and sessionLastTPS entries for deleted sessions
  - Runs during both session data fetch paths
- **COMPLETED:** Implement custom error classes
  - Added src/errors.js with 12 error classes
  - All error classes extend DashboardError base class
  - Includes helper functions: isDashboardError(), getErrorCode()
  - 22 unit tests added and passing
- **COMPLETED:** Add TypeScript type definitions
  - Added src/types.d.ts with JSDoc-based types
  - Covers all major data structures: Session, DashboardData, Settings, etc.
  - Provides IDE autocomplete support

## Documentation
- [ ] Add JSDoc comments for all functions and classes
- [ ] Create API documentation for internal modules
- [ ] Add contribution guidelines (CONTRIBUTING.md)
- [ ] Create architecture diagram showing data flow
- [ ] Document widget layout system and positioning logic
- [ ] Add changelog with semantic versioning
- [ ] Create man page for the CLI tool

## Features
- [ ] Support multiple OpenClaw gateway endpoints
- [ ] Support remote dashboard access via web interface
- [x] **COMPLETED:** Add startup splash screen with loading indicator
  - Animated ASCII lobster logo with spinner
  - Status messages cycle through initialization steps
  - Progress bar fills as initialization progresses
  - Auto-dismisses after 2.5 seconds
  - Used in init() method on app startup
- [ ] Implement smooth transitions between views
- [x] **COMPLETED:** Sound notifications for alerts
  - Configurable enable/disable, bell or beep sound types
  - Separate controls for warning and critical alerts
  - Plays on alert trigger via process.stdout.write('\x07')
- [x] **COMPLETED:** Support terminal themes (light/dark/auto-detect)
  - 'auto' theme detects terminal background on macOS
  - Works with iTerm2, Apple Terminal, VS Code
  - Default theme changed from 'default' to 'auto'
- [x] **COMPLETED:** Add tooltip hints on first run
  - Shows 5 contextual hint cards for new users
  - Navigation tips, vi-mode shortcuts, bookmarks, widgets, actions
  - Press 'n' for next hint, 'q' to skip, 'r' to show again
  - Manual access with '?' key any time
  - firstRun setting persists to settings file
- [x] **COMPLETED:** Implement vi-mode for keyboard navigation
  - h/l: Previous/next page
  - j/k: Select next/previous session  
  - g/G: Go to first/last page
  - Ctrl+B/Ctrl+F: Page up/down
- [x] **COMPLETED:** Add bookmark/favorite sessions feature
  - 'f' key toggles favorite on current session
  - 'F' key filters to show favorites only
  - Favorites persisted to settings with sessionId as key

## Performance
- [ ] Lazy-load widgets when they become visible
- [ ] Optimize blessed screen rendering with differential updates
- [ ] Use worker threads for heavy system information gathering

## Security
- [ ] Add checksum verification for OpenClaw gateway responses

## Build & Distribution
- [ ] Add ESBuild or Rollup for bundling
- [ ] Create Docker image for containerized deployment
- [ ] Add Homebrew formula for easier installation
- [ ] Sign releases with GPG
- [ ] Create automated release script with version bumping

## Bug Fixes & Robustness
- [x] **COMPLETED:** Left and Right arrow keys do not scroll session pages but h and l work properly, fix arrow keys
  - Changed key bindings from 'up'/'down' to escape sequences (\x1b[A, \x1b[B)
  - Added left arrow (\x1b[D) for previous page navigation
  - Added right arrow (\x1b[C) for next page navigation
- [x] **COMPLETED:** Implement proper error handling with specific error classes
  - Added src/errors.js with 12 error classes extending DashboardError
  - ERROR_CODES constant, isDashboardError() and getErrorCode() helpers
  - 22 unit tests added
- [x] **COMPLETED:** Add TypeScript type definitions for better IDE support
  - Added src/types.d.ts with JSDoc-based type definitions
  - Covers all major data structures and type unions
- [x] **COMPLETED:** Handle network interface changes gracefully
- [x] **COMPLETED:** Fix potential memory leak in log line history
  - Added MAX_LOG_LINES = 500 cap, uses slice(-MAX_LOG_LINES)
- [x] Add graceful degradation when systeminformation fails
  - Wrapped CPU, memory, GPU, disk, network, and system data fetching
  - Logs warnings when systeminformation calls fail
  - Keeps existing data on failure instead of crashing
  - Added try-catch in refresh() for CPU/memory and system data

## Platform Support
- [ ] Add Linux support for GPU monitoring (nvidia-smi, radeontop)
- [ ] Add Windows support with PowerShell scripts
- [ ] Detect containerized environments (Docker, Kubernetes)
- [ ] Support WSL2 on Windows
