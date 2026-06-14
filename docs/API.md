# Claw Dashboard API Documentation

This document describes the internal API modules available in Claw Dashboard.

## Table of Contents

- [Cache Module](#cache-module)
- [Gateway Manager](#gateway-manager)
- [Error Classes](#error-classes)
- [Logger](#logger)
- [Configuration](#configuration)
- [Container Detector](#container-detector)
- [Worker Pool](#worker-pool)

---

## Cache Module

**File:** `src/cache.js`

The cache module provides TTL-based caching for expensive system information calls with optional worker thread support.

### Functions

#### `get(key)`

Retrieves a cached value if it exists and hasn't expired.

**Parameters:**
- `key` (string): Cache key

**Returns:** `any|null` - The cached value or null if expired/missing

**Example:**
```javascript
import { get } from './src/cache.js';

const cpuData = get('cpu');
if (cpuData) {
  console.log('Cached CPU:', cpuData);
}
```

---

#### `set(key, value, ttl?)`

Stores a value in the cache with an optional TTL override.

**Parameters:**
- `key` (string): Cache key
- `value` (any): Value to cache
- `ttl` (number, optional): Time to live in milliseconds (uses config default if not provided)

**Example:**
```javascript
import { set } from './src/cache.js';

set('cpu', cpuData, 5000); // Cache for 5 seconds
```

---

#### `getOrFetch(key, fetcher, ttl?)`

Gets cached data or fetches fresh data if cache miss.

**Parameters:**
- `key` (string): Cache key
- `fetcher` (Function): Async function to fetch data if cache miss
- `ttl` (number, optional): TTL override

**Returns:** `Promise<any>` - Cached or fresh data

**Example:**
```javascript
import { getOrFetch } from './src/cache.js';
import si from 'systeminformation';

const cpuData = await getOrFetch('cpu', async () => {
  return await si.currentLoad();
}, 1000);
```

---

#### `getCpuData()`

Gets cached CPU data or fetches fresh data using worker threads when available.

**Returns:** `Promise<Object>` - CPU load data

**Example:**
```javascript
import { getCpuData } from './src/cache.js';

const cpu = await getCpuData();
console.log(`CPU: ${cpu.currentLoad.toFixed(1)}%`);
```

---

#### `getMemoryData()`

Gets cached memory data or fetches fresh data.

**Returns:** `Promise<Object>` - Memory data

---

#### `getGpuData()`

Gets cached GPU data or fetches fresh data.

**Returns:** `Promise<Object>` - GPU/graphics data

---

#### `getNetworkData()`

Gets cached network data or fetches fresh data.

**Returns:** `Promise<Object>` - Network stats data

---

#### `getDiskData()`

Gets cached disk data or fetches fresh data.

**Returns:** `Promise<Object>` - Disk size data

---

#### `getSystemData()`

Gets cached system info data or fetches fresh data.

**Returns:** `Promise<Object>` - System info (osInfo, versions, time)

---

#### `invalidate(key)`

Force refreshes a specific cache entry by deleting it.

**Parameters:**
- `key` (string): Cache key to refresh

---

#### `clear()`

Clears all cache entries.

---

#### `getStatus()`

Gets cache status for debugging.

**Returns:** `Object` - Cache status info with keys containing:
- `cached` (boolean): Whether entry exists
- `age` (number): Age in milliseconds
- `ttlRemaining` (number): Remaining TTL in milliseconds
- `configTtl` (number): Configured TTL

---

#### `debounce(fn, delay)`

Creates a debounced function that delays execution until after wait period.

**Parameters:**
- `fn` (Function): Function to debounce
- `delay` (number): Delay in milliseconds

**Returns:** `Function` - Debounced function

---

#### `throttle(fn, limit)`

Creates a throttled function that limits execution rate.

**Parameters:**
- `fn` (Function): Function to throttle
- `limit` (number): Minimum interval between calls in ms

**Returns:** `Function` - Throttled function

---

## Gateway Manager

**File:** `src/gateway-manager.js`

Manages multiple OpenClaw gateway endpoints and aggregates session data.

### Class: GatewayManager

#### `gatewayManager.init(settings)`

Initialize the gateway manager with settings.

**Parameters:**
- `settings` (Object): Dashboard settings containing `gatewayEndpoints` array

**Example:**
```javascript
import { gatewayManager } from './src/gateway-manager.js';

gatewayManager.init({
  gatewayEndpoints: [
    { name: 'local', host: 'localhost', port: 18789, enabled: true },
    { name: 'remote', host: '192.168.1.100', port: 18789, token: 'secret', enabled: true }
  ]
});
```

---

#### `gatewayManager.getEnabledEndpoints()`

Gets all enabled endpoints.

**Returns:** `GatewayEndpoint[]` - Array of enabled endpoints

---

#### `gatewayManager.getAllEndpoints()`

Gets all endpoints (including disabled).

**Returns:** `GatewayEndpoint[]` - Array of all endpoints

---

#### `gatewayManager.getEndpoint(name)`

Gets a specific endpoint by name.

**Parameters:**
- `name` (string): Endpoint name

**Returns:** `GatewayEndpoint|undefined`

---

#### `gatewayManager.addEndpoint(endpointConfig)`

Adds a new gateway endpoint.

**Parameters:**
- `endpointConfig` (Object): Endpoint configuration
  - `name` (string): Display name
  - `host` (string): Hostname or IP
  - `port` (number): Port number
  - `token` (string, optional): Authentication token
  - `type` (string): 'local', 'remote', or 'cloud'

**Returns:** `GatewayEndpoint|null` - The added endpoint or null if failed

**Example:**
```javascript
const endpoint = gatewayManager.addEndpoint({
  name: 'prod-server',
  host: '10.0.0.5',
  port: 18789,
  token: 'api-token-here',
  type: 'remote'
});
```

---

#### `gatewayManager.removeEndpoint(name)`

Removes an endpoint by name.

**Parameters:**
- `name` (string): Endpoint name to remove

**Returns:** `boolean` - True if removed, false if not found or last endpoint

---

#### `gatewayManager.updateEndpoint(name, updates)`

Updates an existing endpoint.

**Parameters:**
- `name` (string): Endpoint name to update
- `updates` (Object): Fields to update

**Returns:** `GatewayEndpoint|null` - Updated endpoint or null

**Example:**
```javascript
gatewayManager.updateEndpoint('prod-server', {
  port: 8080,
  token: 'new-token'
});
```

---

#### `gatewayManager.toggleEndpoint(name, enabled)`

Toggles endpoint enabled state.

**Parameters:**
- `name` (string): Endpoint name
- `enabled` (boolean): New enabled state

**Returns:** `boolean` - True if toggled, false if not found

---

#### `gatewayManager.fetchAllSessions()`

Fetches sessions from all enabled endpoints in parallel.

**Returns:** `Promise<Object>` - Object containing:
- `sessions` (AggregatedSession[]): All sessions from all endpoints
- `stats` (Object): Fetch statistics
  - `totalEndpoints` (number): Total enabled endpoints
  - `reachableEndpoints` (number): Successfully reached endpoints
  - `unreachableEndpoints` (number): Failed endpoints

**Example:**
```javascript
const { sessions, stats } = await gatewayManager.fetchAllSessions();
console.log(`Fetched ${sessions.length} sessions from ${stats.reachableEndpoints} endpoints`);
```

---

#### `gatewayManager.getEndpointHealth()`

Gets health status for all endpoints.

**Returns:** `Object[]` - Array of endpoint health objects containing:
- `name` (string): Endpoint name
- `host` (string): Host
- `port` (number): Port
- `enabled` (boolean): Enabled state
- `reachable` (boolean): Last known reachability
- `lastSeen` (number|null): Timestamp of last successful connection
- `latency` (number|null): Response latency in ms
- `failCount` (number): Consecutive failure count
- `error` (string|null): Last error message

---

#### `gatewayManager.getSettingsForSave()`

Gets settings object for persistence.

**Returns:** `Object` - Settings containing `gatewayEndpoints` array

---

### Types

#### `GatewayEndpoint`

```typescript
{
  name: string;           // Display name
  host: string;          // Hostname or IP
  port: number;          // Port number
  token: string | null;  // Auth token
  enabled: boolean;      // Whether enabled
  type: string;          // 'local', 'remote', 'cloud'
  reachable?: boolean;   // Last known status
  lastSeen?: number;     // Timestamp
  error?: string;        // Last error
}
```

#### `AggregatedSession`

```typescript
{
  key: string;
  channel: string;
  displayName: string;
  updatedAt: number;
  sessionId: string;
  model: string;
  contextTokens: number;
  totalTokens: number;
  kind: string;
  gatewayEndpoint: string;  // Source endpoint name
  gatewayHost: string;      // Source endpoint host
  // ... other session fields
}
```

---

#### `gatewayManager.forceRetry(endpointName?)`

Force a retry for a specific endpoint or all unreachable endpoints.

**Parameters:**
- `endpointName` (string|null): Name of endpoint to retry, or null for all unreachable

**Returns:** `Promise<Object>` - Result containing:
- `attempted` (number): Number of endpoints attempted
- `successful` (number): Number of endpoints that reconnected
- `results` (Array): Per-endpoint results

---

#### `gatewayManager.getEndpointFailCount(name)`

Gets the consecutive failure count for an endpoint.

**Parameters:**
- `name` (string): Endpoint name

**Returns:** `number` - Consecutive failure count

---

#### `gatewayManager.clearEndpointFailCount(name)`

Clears the failure count for a specific endpoint.

**Parameters:**
- `name` (string): Endpoint name

---

#### `gatewayManager.getTotalFailCount()`

Gets the total failure count across all endpoints.

**Returns:** `number` - Total consecutive failures

---

#### `gatewayManager.clearAllFailCounts()`

Clears all failure counts for all endpoints.

---

## Auto-Retry Configuration

**File:** `src/config.js` (constants), `index.js` (implementation)

The dashboard automatically retries failed gateway connections with configurable exponential backoff to prevent overwhelming unresponsive gateways.

### Configuration Options

Add an `autoRetry` section to your `~/.openclaw/dashboard-settings.json`:

```json
{
  "autoRetry": {
    "enabled": true,
    "intervalMs": 30000,
    "exponentialBackoff": true,
    "backoffMultiplier": 2,
    "maxBackoffIntervalMs": 300000,
    "resetAfterSuccess": true,
    "consecutiveFailureThreshold": 3
  }
}
```

### Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable auto-retry |
| `intervalMs` | number | `30000` | Base interval between retries (ms) |
| `exponentialBackoff` | boolean | `true` | Enable exponential backoff |
| `backoffMultiplier` | number | `2` | Multiply interval by this after each failure |
| `maxBackoffIntervalMs` | number | `300000` | Cap backoff at this value (5 min) |
| `resetAfterSuccess` | boolean | `true` | Reset backoff after successful connection |
| `consecutiveFailureThreshold` | number | `3` | Failures before backoff kicks in |

### Exponential Backoff Behavior

When `exponentialBackoff` is enabled:

1. First 2 failures: Retry at `intervalMs` (30s)
2. 3rd failure: Retry at `30s × 2 = 60s`
3. 4th failure: Retry at `30s × 2² = 120s`
4. 5th failure: Retry at `30s × 2³ = 240s`
5. And so on, up to `maxBackoffIntervalMs` (5 min)

After a successful connection, if `resetAfterSuccess` is true, the backoff resets to the base interval.

### Validation Constraints

- `intervalMs`: 5000ms (5s) to 300000ms (5min)
- `backoffMultiplier`: 1 to 10
- `maxBackoffIntervalMs`: 10000ms (10s) to 600000ms (10min)
- `consecutiveFailureThreshold`: 1 to 10

### Disabling Auto-Retry

To disable auto-retry completely:

```json
{
  "autoRetry": {
    "enabled": false
  }
}
```

---

## Troubleshooting Gateway Connectivity

### Common Issues

#### "Gateway unreachable" warnings

The dashboard shows yellow/red status for gateways it cannot reach. Check:

1. **Is the OpenClaw agent running?**
   ```bash
   # Check if agent is listening
   curl http://localhost:18789/sessions
   ```

2. **Is the correct host/port configured?**
   Verify your `gatewayEndpoints` configuration in settings.

3. **Network/firewall issues?**
   Remote gateways may require VPN or specific network access.

#### Auto-retry not working

1. **Check if auto-retry is enabled:**
   Verify `autoRetry.enabled` is `true` in settings.

2. **Verify interval settings:**
   Default is 30 seconds. If you set it higher, retries will be less frequent.

3. **Check logs for retry attempts:**
   Look for `[RETRY]` log messages indicating retry activity.

#### Excessive retry delays

If gateways are retrying too slowly:

1. **Reduce the backoff multiplier:**
   ```json
   { "backoffMultiplier": 1.5 }
   ```

2. **Lower the max backoff:**
   ```json
   { "maxBackoffIntervalMs": 60000 }
   ```

3. **Lower the failure threshold:**
   ```json
   { "consecutiveFailureThreshold": 1 }
   ```

### Force Retry

Manually trigger a retry from the dashboard:

1. Press `r` to retry all unreachable gateways immediately
2. Or use the Gateway Status widget to retry individual endpoints

### Debug Logging

Enable debug logging to see detailed retry behavior:

```bash
# Start with debug logging
DEBUG=claw-dashboard npm start
```

Or set in settings:
```json
{ "logLevelFilter": "debug" }
```

---

## Error Classes

**File:** `src/errors.js`

Custom error classes for better error handling and debugging.

### Base Class: DashboardError

All dashboard errors extend this base class.

**Properties:**
- `name` (string): Error name
- `message` (string): Error message
- `code` (string): Error code constant
- `details` (Object): Additional error details
- `timestamp` (string): ISO timestamp
- `stack` (string): Stack trace

**Method:** `toJSON()`

Returns a JSON-serializable representation of the error.

---

### Error Types

| Class | Code | Use Case |
|-------|------|----------|
| `ConfigError` | `CONFIG_ERROR` | Configuration issues |
| `SettingsError` | `SETTINGS_ERROR` | Settings load/save errors |
| `GatewayError` | `GATEWAY_ERROR` | Gateway communication |
| `SessionError` | `SESSION_ERROR` | Session-related errors |
| `DataFetchError` | `DATA_FETCH_ERROR` | System info fetch failures |
| `AuthError` | `AUTH_ERROR` | Authentication failures |
| `NetworkError` | `NETWORK_ERROR` | Network issues |
| `UIError` | `UI_ERROR` | UI/rendering errors |
| `ValidationError` | `VALIDATION_ERROR` | Input validation |
| `TimeoutError` | `TIMEOUT_ERROR` | Operation timeouts |

---

### Helper Functions

#### `isDashboardError(error)`

Checks if an error is a DashboardError instance.

**Parameters:**
- `error` (Error): Error to check

**Returns:** `boolean`

---

#### `getErrorCode(error)`

Gets the error code from a DashboardError or returns 'UNKNOWN_ERROR'.

**Parameters:**
- `error` (Error): Error to check

**Returns:** `string`

---

### Constants

#### `ERROR_CODES`

Object containing all error code constants:

```javascript
import { ERROR_CODES } from './src/errors.js';

// Available codes:
// CONFIG_ERROR, SETTINGS_ERROR, GATEWAY_ERROR, SESSION_ERROR,
// DATA_FETCH_ERROR, AUTH_ERROR, NETWORK_ERROR, UI_ERROR,
// VALIDATION_ERROR, TIMEOUT_ERROR, DASHBOARD_ERROR
```

---

## Logger

**File:** `src/logger.js`

File-only logging module that avoids interfering with the blessed TUI.

**Log Location:** `~/.openclaw/claw-dashboard.log`

### Methods

#### `logger.error(...args)`

Logs error level messages.

**Example:**
```javascript
import logger from './src/logger.js';

logger.error('Failed to fetch sessions:', error.message);
```

---

#### `logger.warn(...args)`

Logs warning level messages.

---

#### `logger.info(...args)`

Logs info level messages.

---

#### `logger.debug(...args)`

Logs debug level messages (only when `DEBUG` env var is set).

**Example:**
```bash
DEBUG=1 node index.js
```

---

### Export: `LOG_FILE_PATH`

The full path to the log file.

```javascript
import { LOG_FILE_PATH } from './src/logger.js';
console.log('Logs at:', LOG_FILE_PATH);
```

---

## Configuration

**File:** `src/config.js`

Centralized configuration containing all constants and defaults.

### Refresh Intervals

```javascript
import { REFRESH_INTERVALS } from './src/config.js';

REFRESH_INTERVALS.DEFAULT  // 2000ms
REFRESH_INTERVALS.ACTIVE   // 2000ms
REFRESH_INTERVALS.IDLE     // 10000ms
REFRESH_INTERVALS.OPTIONS  // [1000, 2000, 5000, 10000]
```

### Gateway Settings

```javascript
import { GATEWAY, DEFAULT_GATEWAY_ENDPOINT } from './src/config.js';

GATEWAY.DEFAULT_PORT      // 18789
GATEWAY.TIMEOUT_MS        // 3000
GATEWAY.MAX_ENDPOINTS     // 10
```

### Cache TTL

```javascript
import { CACHE_TTL, CACHE_CONFIG } from './src/config.js';

CACHE_TTL.CPU        // 1000ms
CACHE_TTL.MEMORY     // 1000ms
CACHE_TTL.GPU        // 5000ms
CACHE_TTL.NETWORK    // 1000ms
CACHE_TTL.DISK       // 30000ms
CACHE_TTL.SYSTEM     // 5000ms
CACHE_TTL.CONTAINER  // 30000ms
CACHE_TTL.DEFAULT    // 2000ms
```

### Alert Thresholds

```javascript
import { ALERT_THRESHOLDS, ALERT_RATE_LIMIT } from './src/config.js';

ALERT_THRESHOLDS.CPU     // { warning: 70, critical: 90 }
ALERT_THRESHOLDS.MEMORY  // { warning: 75, critical: 90 }
ALERT_THRESHOLDS.DISK    // { warning: 80, critical: 95 }

ALERT_RATE_LIMIT.ENABLED     // true
ALERT_RATE_LIMIT.WINDOW_MS   // 60000
ALERT_RATE_LIMIT.MAX_ALERTS  // 5
```

### Validation Constraints

```javascript
import { VALIDATION } from './src/config.js';

VALIDATION.REFRESH_INTERVAL.MIN  // 500
VALIDATION.REFRESH_INTERVAL.MAX  // 60000
VALIDATION.VALID_THEMES          // ['default', 'dark', 'high-contrast', 'ocean', 'auto']
VALIDATION.VALID_SORT_MODES      // ['time', 'tokens', 'idle', 'name']
VALIDATION.ENDPOINT_NAME.PATTERN // /^[a-zA-Z0-9_-]+$/
```

### Worker Settings

```javascript
import { WORKERS } from './src/config.js';

WORKERS.ENABLED           // true
WORKERS.MAX_WORKERS       // 2
WORKERS.TASK_TIMEOUT      // 10000
WORKERS.FALLBACK_ON_ERROR // true
```

### Paths

```javascript
import { PATHS } from './src/config.js';

PATHS.SETTINGS      // ~/.openclaw/dashboard-settings.json
PATHS.EXPORTS       // ~/.openclaw/exports
PATHS.LOG           // ~/.openclaw/claw-dashboard.log
PATHS.HOME_DIR      // ~
PATHS.OPENCLAW_DIR  // ~/.openclaw
PATHS.AGENTS_DIR    // ~/.openclaw/agents
```

### Default Settings

```javascript
import { DEFAULT_SETTINGS } from './src/config.js';

// Complete default settings object for dashboard initialization
```

### Version

```javascript
import { DASHBOARD_VERSION } from './src/config.js';

console.log('Version:', DASHBOARD_VERSION); // e.g., "1.9.0"
```

---

## Container Detector

**File:** `src/container-detector.js`

Detects containerized environments (Docker, Kubernetes, WSL).

### Functions

#### `detectContainerEnvironment()`

Detects if running in a container environment.

**Returns:** `Promise<ContainerEnvironment>`

```typescript
{
  isContainer: boolean;
  runtime: string | null;      // 'docker', 'kubernetes', 'containerd', etc.
  containerId: string | null;
  containerName: string | null;
  podName: string | null;
  namespace: string | null;
  wslVersion: number | null; // 1 or 2 for WSL
  wslDistro: string | null;   // WSL distribution name
}
```

**Example:**
```javascript
import { detectContainerEnvironment } from './src/container-detector.js';

const env = await detectContainerEnvironment();
if (env.isContainer) {
  console.log(`Running in ${env.runtime}`);
  if (env.wslVersion) {
    console.log(`WSL${env.wslVersion} - ${env.wslDistro}`);
  }
}
```

---

#### `checkDocker()`

Checks if running inside a Docker container.

**Returns:** `Promise<Object|null>` - Container info or null

---

#### `checkKubernetes()`

Checks if running inside a Kubernetes pod.

**Returns:** `Promise<Object|null>` - Pod info or null

---

#### `checkWSL()`

Checks if running in WSL (Windows Subsystem for Linux).

**Returns:** `Promise<Object|null>` - WSL info or null

---

## Worker Pool

**File:** `src/workers/worker-pool.js`

Manages worker threads for executing heavy systeminformation commands off the main thread.

### Class: WorkerPool

#### `workerPool.execute(command)`

Execute a systeminformation command in a worker thread.

**Parameters:**
- `command` (string): Command name
  - `'currentLoad'` - CPU load
  - `'mem'` - Memory info
  - `'graphics'` - GPU info
  - `'networkStats'` - Network stats
  - `'fsSize'` - Filesystem size
  - `'systemData'` - OS info, versions, time
  - `'processes'` - Process list
  - `'diskLayout'` - Disk layout
  - `'battery'` - Battery info
  - `'users'` - User list

**Returns:** `Promise<any>` - Command result

**Example:**
```javascript
import { workerPool } from './src/workers/worker-pool.js';

try {
  const cpuData = await workerPool.execute('currentLoad');
  console.log('CPU Load:', cpuData.currentLoad);
} catch (error) {
  console.error('Worker failed:', error);
}
```

---

#### `workerPool.terminate()`

Gracefully terminates all worker threads.

**Returns:** `Promise<void>`

---

### Export: `isWorkerThreadsSupported`

Boolean indicating if worker threads are supported in the current Node.js environment.

```javascript
import { isWorkerThreadsSupported } from './src/workers/worker-pool.js';

if (isWorkerThreadsSupported) {
  // Can use worker threads
}
```

---

## Usage Examples

### Complete Dashboard Setup

```javascript
import { gatewayManager } from './src/gateway-manager.js';
import logger from './src/logger.js';
import { DEFAULT_SETTINGS } from './src/config.js';

// Initialize gateway manager
gatewayManager.init(DEFAULT_SETTINGS);

// Add a remote endpoint
const endpoint = gatewayManager.addEndpoint({
  name: 'production',
  host: 'prod.example.com',
  port: 18789,
  token: process.env.OPENCLAW_TOKEN,
  type: 'remote'
});

if (endpoint) {
  logger.info('Added production endpoint');
}

// Fetch all sessions
try {
  const { sessions, stats } = await gatewayManager.fetchAllSessions();
  logger.info(`Fetched ${sessions.length} sessions from ${stats.reachableEndpoints} endpoints`);
} catch (error) {
  logger.error('Failed to fetch sessions:', error.message);
}
```

### Error Handling Pattern

```javascript
import {
  isDashboardError,
  getErrorCode,
  ERROR_CODES,
  GatewayError,
  NetworkError
} from './src/errors.js';
import logger from './src/logger.js';

async function fetchWithErrorHandling() {
  try {
    return await fetchData();
  } catch (error) {
    if (isDashboardError(error)) {
      const code = getErrorCode(error);

      switch (code) {
        case ERROR_CODES.GATEWAY_ERROR:
          logger.warn('Gateway unavailable:', error.message);
          return null;
        case ERROR_CODES.NETWORK_ERROR:
          logger.warn('Network issue:', error.message);
          return null;
        default:
          logger.error('Dashboard error:', error.toJSON());
          throw error;
      }
    }

    // Re-throw non-dashboard errors
    throw error;
  }
}
```

---

## See Also

- [README.md](../README.md) - Project overview
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [TODO.md](../TODO.md) - Planned features and known issues
