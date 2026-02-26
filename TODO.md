# Claw Dashboard TODO

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
- [ ] Add tooltip hints on first run
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
