# Claw Dashboard TODO

## Open Tasks

### Documentation
- [ ] Add JSDoc comments for all functions and classes
- [ ] Create API documentation for internal modules
- [ ] Add contribution guidelines (CONTRIBUTING.md)
- [ ] Create architecture diagram showing data flow
- [ ] Document widget layout system and positioning logic
- [ ] Add changelog with semantic versioning
- [ ] Create man page for the CLI tool

### Features
- [ ] Support multiple OpenClaw gateway endpoints
- [ ] Support remote dashboard access via web interface
- [ ] Implement smooth transitions between views

### Performance
- [ ] Lazy-load widgets when they become visible
- [ ] Optimize blessed screen rendering with differential updates
- [ ] Use worker threads for heavy system information gathering

### Security
- [ ] Add checksum verification for OpenClaw gateway responses

### Build & Distribution
- [ ] Add ESBuild or Rollup for bundling
- [ ] Create Docker image for containerized deployment
- [ ] Add Homebrew formula for easier installation
- [ ] Sign releases with GPG
- [ ] Create automated release script with version bumping

### Bug Fixes & Robustness
- [ ] Add graceful degradation when systeminformation fails
  - Wrapped CPU, memory, GPU, disk, network, and system data fetching
  - Logs warnings when systeminformation calls fail
  - Keeps existing data on failure instead of crashing
  - Added try-catch in refresh() for CPU/memory and system data

### Platform Support
- [x] **COMPLETED:** Add Linux support for GPU monitoring (nvidia-smi, radeontop)
  - Added `getLinuxGPU()` function for Linux systems
  - Supports NVIDIA GPUs via nvidia-smi (model, utilization, memory, temperature)
  - Supports AMD GPUs via lspci for model detection and radeontop for utilization
  - Falls back to systeminformation library as last resort
  - Added `getPlatform()` helper to detect OS
  - Integrated platform-aware GPU fetching in Dashboard.refresh()
  - Added COMMAND_TIMEOUTS for NVIDIA_SMI, LSPCI, RADEONTOP
- [ ] Add Windows support with PowerShell scripts
- [ ] Detect containerized environments (Docker, Kubernetes)
- [ ] Support WSL2 on Windows
