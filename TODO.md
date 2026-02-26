# Claw Dashboard TODO

## Current Sprint Status (Dev Branch)
**Last Review:** 2026-02-26

### Recently Completed
1. **First-run tooltip hints** (`src/hints.js`)
   - 5 contextual hint cards with navigation, vi-mode, bookmarks, widgets, actions
   - 'n' next hint, 'q' skip, 'r' show again, '?' manual access
   - Settings persistence via `firstRun: true` in DEFAULT_SETTINGS

2. **Vi-mode navigation** (enhanced key bindings in `index.js`)
   - h/l/j/k/g/G/Ctrl+B/Ctrl+F

3. **Favorites/bookmarks system**
   - 'f' toggle favorite, 'F' filter favorites, persisted to settings

### Code Review Notes
- All tests pass (49 tests across utils.test.js and alerts.test.js)
- `index.js`: Defensive check added for `showDetail` before binding (prevents undefined errors)
- `index.js`: Dynamic import for hints.js on '?' key (lazy loading, good practice)
- `src/config.js`: `firstRun: true` added to DEFAULT_SETTINGS

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
- [ ] Add startup splash screen with loading indicator
- [ ] Implement smooth transitions between views
- [ ] Add sound notifications for alerts (optional)
- [ ] Support terminal themes (light/dark/auto-detect)
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
- [ ] Implement proper error handling with specific error classes
- [ ] Add TypeScript type definitions for better IDE support
- [ ] Handle network interface changes gracefully
- [ ] Fix potential memory leak in log line history
- [ ] Add graceful degradation when systeminformation fails

## Platform Support
- [ ] Add Linux support for GPU monitoring (nvidia-smi, radeontop)
- [ ] Add Windows support with PowerShell scripts
- [ ] Detect containerized environments (Docker, Kubernetes)
- [ ] Support WSL2 on Windows
