/**
 * Claw Dashboard Type Definitions
 * ProvidesScript-like Type type hints for JavaScript code via JSDoc
 * IDEs like VS Code will use these for autocomplete and type checking
 */

/**
 * @typedef {Object} Session
 * @property {string} key - Unique session identifier
 * @property {string} name - Session name
 * @property {string} status - Session status (active, idle, etc.)
 * @property {number} tokens - Current token count
 * @property {number} totalTokens - Total tokens used
 * @property {number} startTime - Session start timestamp
 * @property {number} lastActive - Last activity timestamp
 * @property {string} [agentName] - Associated agent name
 * @property {boolean} [favorite] - Whether session is favorited
 */

/**
 * @typedef {Object} CPUData
 * @property {number[]} current - Current CPU usage per core
 * @property {number} avg - Average CPU usage
 * @property {string} model - CPU model name
 */

/**
 * @typedef {Object} MemoryData
 * @property {number} total - Total memory in bytes
 * @property {number} used - Used memory in bytes
 * @property {number} free - Free memory in bytes
 * @property {number} percent - Usage percentage
 * @property {string} usedGB - Formatted used memory
 * @property {string} totalGB - Formatted total memory
 */

/**
 * @typedef {Object} GPUData
 * @property {string} short - Short GPU info string
 * @property {string} long - Long GPU info string
 * @property {number} [percent] - GPU usage percentage
 * @property {number} [memory] - GPU memory usage
 */

/**
 * @typedef {Object} NetworkData
 * @property {string} iface - Network interface name
 * @property {number} rx - Receive bytes
 * @property {number} tx - Transmit bytes
 * @property {number} rx_sec - Receive bytes per second
 * @property {number} tx_sec - Transmit bytes per second
 * @property {string} rx_rate - Formatted receive rate
 * @property {string} tx_rate - Formatted transmit rate
 */

/**
 * @typedef {Object} DiskData
 * @property {string} mount - Mount point
 * @property {string} fs - Filesystem type
 * @property {number} size - Total size in bytes
 * @property {number} used - Used space in bytes
 * @property {number} available - Available space in bytes
 * @property {number} percent - Usage percentage
 * @property {string} usedGB - Formatted used space
 * @property {string} totalGB - Formatted total space
 */

/**
 * @typedef {Object} SystemData
 * @property {string} os - OS name
 * @property {string} version - OS version
 * @property {string} arch - Architecture
 * @property {string} hostname - Hostname
 */

/**
 * @typedef {Object} DashboardData
 * @property {CPUData} cpu - CPU data
 * @property {MemoryData} memory - Memory data
 * @property {GPUData} [gpu] - GPU data
 * @property {NetworkData} [network] - Network data
 * @property {DiskData} [disk] - Disk data
 * @property {SystemData} [system] - System data
 * @property {Session[]} sessions - Active sessions
 * @property {Object} sessionTPS - Tokens per second tracking
 * @property {Object} sessionLastTPS - Last TPS values
 * @property {string|null} version - OpenClaw version
 * @property {string|null} latest - Latest available version
 * @property {string|null} openclaw - OpenClaw status
 * @property {number|null} gatewayUptime - Gateway uptime in seconds
 */

/**
 * @typedef {Object} Settings
 * @property {number} refreshInterval - Refresh interval in ms
 * @property {string} logLevelFilter - Log level filter
 * @property {string} sessionSortMode - Session sort mode
 * @property {boolean} showWidget1 - Show CPU widget
 * @property {boolean} showWidget2 - Show Memory widget
 * @property {boolean} showWidget3 - Show GPU widget
 * @property {boolean} showWidget4 - Show Network widget
 * @property {boolean} showWidget5 - Show Disk widget
 * @property {boolean} showWidget6 - Show System widget
 * @property {boolean} showWidget7 - Show Uptime widget
 * @property {boolean} showWidget8 - Show Data Health widget
 * @property {string} theme - UI theme
 * @property {string} exportFormat - Export format
 * @property {string} exportDirectory - Export directory path
 * @property {string} sessionSearchQuery - Session search query
 * @property {Object.<string, boolean>} favorites - Favorited session IDs
 * @property {boolean} showFavoritesOnly - Show only favorites
 * @property {boolean} firstRun - First run flag
 */

/**
 * @typedef {'warning'|'critical'|'cleared'} AlertLevel
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - Unique alert ID
 * @property {AlertLevel} level - Alert level
 * @property {string} metric - Metric type (cpu, memory, disk)
 * @property {number} value - Current value
 * @property {number} threshold - Threshold that was crossed
 * @property {number} timestamp - Alert timestamp
 * @property {boolean} dismissed - Whether alert is dismissed
 */

/**
 * @typedef {Object} RetryOptions
 * @property {number} maxRetries - Maximum retry attempts
 * @property {number} initialDelay - Initial delay in ms
 * @property {number} maxDelay - Maximum delay in ms
 * @property {number} backoffMultiplier - Backoff multiplier
 * @property {number[]} retryableStatuses - HTTP statuses to retry
 * @property {string[]} retryableErrors - Error codes to retry
 */

/**
 * @typedef {'default'|'dark'|'high-contrast'|'ocean'|'auto'} ThemeName
 */

/**
 * @typedef {'time'|'tokens'|'idle'|'name'} SortMode
 */

/**
 * @typedef {'all'|'error'|'warn'|'info'|'debug'} LogLevel
 */

/**
 * @typedef {'json'|'csv'} ExportFormat
 */

// Export type constants for use in code
/** @type {ThemeName} */
export const VALID_THEMES = ['default', 'dark', 'high-contrast', 'ocean', 'auto'];

/** @type {SortMode} */
export const VALID_SORT_MODES = ['time', 'tokens', 'idle', 'name'];

/** @type {LogLevel} */
export const VALID_LOG_LEVELS = ['all', 'error', 'warn', 'info', 'debug'];

/** @type {ExportFormat} */
export const VALID_EXPORT_FORMATS = ['json', 'csv'];

export default {
  VALID_THEMES,
  VALID_SORT_MODES,
  VALID_LOG_LEVELS,
  VALID_EXPORT_FORMATS
};
