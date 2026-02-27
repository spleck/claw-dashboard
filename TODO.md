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
- [x] **COMPLETED:** Support multiple OpenClaw gateway endpoints
  - Added `gateway-manager.js` module for endpoint management
  - Updated `config.js` with multi-gateway support (GATEWAY.MAX_ENDPOINTS, DEFAULT_GATEWAY_ENDPOINT)
  - Dashboard now fetches sessions from multiple gateways and aggregates results
  - Gateway health is tracked with latency and reachability metrics
  - Help panel displays gateway endpoint status
  - Settings persist gatewayEndpoints configuration
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
- [x] **COMPLETED:** Add graceful degradation when systeminformation fails
  - Wrapped CPU, memory, GPU, disk, network, and system data fetching
  - Logs warnings when systeminformation calls fail via `logger.warn()`
  - Keeps existing data on failure instead of crashing
  - Added try-catch in refresh() for all system data fetching (CPU/memory, system, disk, network, GPU)
  - Cache module (cache.js) already has try-catch wrappers with logging for all systeminformation calls
  - Dashboard refresh() now has consistent error handling pattern: catch error → log warning → preserve existing data

### Platform Support
- [ ] Detect containerized environments (Docker, Kubernetes)
- [ ] Support WSL2 on Windows

---

## Review Log

### 2026-02-26 - Multi-Gateway Support Review
**Status:** Approved

**Changes Reviewed:**
- `src/gateway-manager.js`: New module for managing multiple OpenClaw gateway endpoints
- `src/config.js`: Added GATEWAY.MAX_ENDPOINTS, DEFAULT_GATEWAY_ENDPOINT, and VALIDATION constraints
- `index.js`: Integrated gateway manager for fetching sessions from multiple endpoints
- `TODO.md`: Marked multi-gateway support as completed

**Code Quality Assessment:**
- Clean architecture with GatewayManager class using singleton pattern
- Proper JSDoc type definitions for GatewayEndpoint and AggregatedSession
- Comprehensive endpoint management: add, remove, update, toggle endpoints
- Health tracking with latency metrics and failure counting
- Dual fetch strategy: HTTP API first, fallback to local filesystem
- Authentication support via Bearer tokens
- Parallel fetching from all enabled endpoints with Promise.all
- Session enrichment with gateway metadata (endpoint name, host)
- Proper error handling with custom error classes (GatewayError, AuthError, NetworkError, TimeoutError)
- Prevents removal/disabling of the last endpoint (safety guard)
- Duplicate name validation for endpoints

**Security Considerations:**
- Token-based authentication supported for remote endpoints
- File path validation in local file fallback
- Input validation for endpoint names (regex pattern: `/^[a-zA-Z0-9_-]+$/`)
- Maximum endpoints limit (10) prevents resource exhaustion

**Recommendations:**
1. Consider implementing circuit breaker pattern for repeatedly failing endpoints
2. Add endpoint priority/weight for load balancing when multiple gateways are available
3. Consider adding endpoint discovery via DNS SRV records or service mesh
4. Add metrics export for gateway health monitoring
5. Consider session deduplication if same session exists on multiple gateways
6. Add retry with exponential backoff for transient failures
7. Consider implementing endpoint selection UI for interactive session management

---

### 2026-02-26 - Graceful Degradation Review
**Status:** ✅ Approved

**Changes Reviewed:**
- `index.js`: Enhanced error handling in Dashboard.refresh() for disk and network data fetching
- `TODO.md`: Updated documentation to reflect completed graceful degradation work

**Code Quality Assessment:**
- ✅ Consistent error handling pattern across all data fetching operations
- ✅ Existing data preserved on fetch failure (disk, network, GPU)
- ✅ Proper warning logs via `logger.warn()` for debugging
- ✅ Follows existing codebase patterns and conventions
- ✅ No breaking changes - maintains backward compatibility

**Recommendations:**
1. Consider adding metrics/logging for fetch failure rates to identify systemic issues
2. Add exponential backoff for transient failures (network hiccups, etc.)
3. Consider adding user-facing indicator when data is stale due to fetch failures

---

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
