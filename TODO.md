# Claw Dashboard TODO

## In Progress

*No tasks currently in progress*

## Recently Completed

### Platform Support
- [x] **COMPLETED:** Add Linux support for GPU monitoring (nvidia-smi, radeontop)
  - Added `getLinuxGPU()` function for Linux systems
  - Supports NVIDIA GPUs via nvidia-smi (model, utilization, memory, temperature)
  - Supports AMD GPUs via lspci for model detection and radeontop for utilization
  - Falls back to systeminformation library as last resort
  - Added `getPlatform()` helper to detect OS
  - Integrated platform-aware GPU fetching in Dashboard.refresh()
  - Added COMMAND_TIMEOUTS for NVIDIA_SMI, LSPCI, RADEONTOP
- [x] **COMPLETED:** Add Windows support with PowerShell scripts
  - Added `getWindowsGPU()` function for Windows systems
  - Uses WMI queries via PowerShell (Get-CimInstance Win32_VideoController)
  - Supports GPU utilization via performance counters for some GPUs
  - Supports NVIDIA WMI namespace for NVIDIA GPUs with driver WMI support
  - Falls back to nvidia-smi if available on Windows
  - Falls back to systeminformation library as last resort
  - Added COMMAND_TIMEOUTS.POWERSHELL for WMI queries
  - Updated refresh() to detect 'win32' platform and call getWindowsGPU()

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
- [ ] Detect containerized environments (Docker, Kubernetes)
- [ ] Support WSL2 on Windows

---

## Review Log

### 2026-02-26 - Windows GPU Support Review
**Status:** ✅ Approved

**Changes Reviewed:**
- `index.js`: Added `getWindowsGPU()` function with comprehensive WMI/PowerShell support
- `src/config.js`: Added `COMMAND_TIMEOUTS.POWERSHELL` (5000ms timeout)
- `TODO.md`: Marked Windows GPU support as completed

**Code Quality Assessment:**
- ✅ Proper error handling with empty catch blocks (consistent with existing patterns)
- ✅ Multiple fallback strategies: WMI → Performance Counters → NVIDIA WMI → nvidia-smi → systeminformation
- ✅ Platform detection using `os.platform()` returns 'win32' for Windows
- ✅ Proper timeout configuration prevents hanging on slow WMI queries
- ✅ GPU model name normalization (removes vendor prefixes, limits to 16 chars)
- ✅ Memory conversion handling (bytes → GB for WMI, MB → GB for NVIDIA WMI)

**Recommendations:**
1. Consider adding WSL2 detection as it reports 'linux' platform but has Windows-specific GPU access patterns
2. Add unit tests for platform-specific GPU functions using mocks
3. Consider caching GPU info that rarely changes (model name) to avoid repeated PowerShell calls
4. Monitor for PowerShell execution policy issues on locked-down Windows systems

**Next Priority:**
- Container detection (Docker/Kubernetes) for cloud deployment scenarios
- WSL2 support for Windows developers using Linux environment
