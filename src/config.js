/**
 * Centralized configuration file for Claw Dashboard
 * Contains all magic numbers, constants, and configurable values
 */

import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load dashboard version from package.json
let DASHBOARD_VERSION = 'unknown';
try {
  const pkg = JSON.parse(fs.readFileSync(join(__dirname, '../package.json'), 'utf8'));
  DASHBOARD_VERSION = pkg.version || 'unknown';
} catch {}

export { DASHBOARD_VERSION };

// ============================================================================
// REFRESH & TIMING SETTINGS
// ============================================================================

export const REFRESH_INTERVALS = {
  DEFAULT: 2000,
  ACTIVE: 2000,           // 2 seconds when agents active
  IDLE: 10000,            // 10 seconds when idle (no active agents)
  OPTIONS: [1000, 2000, 5000, 10000],  // Available refresh interval options
};

export const IDLE_THRESHOLD_MS = 5 * 60 * 1000;  // 5 minutes to consider session idle

// ============================================================================
// HISTORY & DISPLAY LIMITS
// ============================================================================

export const HISTORY = {
  LENGTH: 60,              // Default history length for charts
  NETWORK_LENGTH: 30,      // Network history length
};

// ============================================================================
// GATEWAY CONFIGURATION
// ============================================================================

export const GATEWAY = {
  DEFAULT_PORT: 18789,
  TIMEOUT_MS: 3000,
  MAX_ENDPOINTS: 10,           // Maximum number of gateway endpoints
  DEFAULT_ENDPOINT_NAME: 'local',  // Default name for local gateway
};

// Default gateway endpoint configuration
export const DEFAULT_GATEWAY_ENDPOINT = {
  name: 'local',
  host: 'localhost',
  port: 18789,
  token: null,
  enabled: true,
  type: 'local',  // 'local', 'remote', 'cloud'
};

// ============================================================================
// UI DIMENSIONS & DEFAULTS
// ============================================================================

export const UI = {
  GAUGE_WIDTH: 15,
  SPARKLINE_WIDTH: 15,
  LOG_BOX_MIN_HEIGHT: 10,
  DEFAULT_WIDTH: 80,
  DEFAULT_HEIGHT: 24,
};

// ============================================================================
// CACHE TTL SETTINGS (in milliseconds)
// ============================================================================

export const CACHE_TTL = {
  CPU: 1000,               // 1 second TTL for CPU
  MEMORY: 1000,            // 1 second TTL for memory
  GPU: 5000,               // 5 second TTL for GPU (expensive)
  NETWORK: 1000,           // 1 second TTL for network
  DISK: 30000,             // 30 second TTL for disk (rarely changes)
  SYSTEM: 5000,            // 5 second TTL for system info
  CONTAINER: 30000,        // 30 second TTL for container detection (rarely changes)
  DEFAULT: 2000,           // Default TTL fallback
};

// Cache configuration object (for direct use)
export const CACHE_CONFIG = {
  cpu: { ttl: CACHE_TTL.CPU },
  memory: { ttl: CACHE_TTL.MEMORY },
  gpu: { ttl: CACHE_TTL.GPU },
  network: { ttl: CACHE_TTL.NETWORK },
  disk: { ttl: CACHE_TTL.DISK },
  system: { ttl: CACHE_TTL.SYSTEM },
  container: { ttl: CACHE_TTL.CONTAINER },
};

// ============================================================================
// DATABASE SETTINGS
// ============================================================================

export const DATABASE = {
  PATH: os.homedir() + '/.openclaw/dashboard-history.db',
  SAVE_INTERVAL_MS: 30000,     // Save every 30 seconds
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000,  // Cleanup every hour
  DEFAULT_RETENTION_DAYS: 30,
};

// ============================================================================
// CHECKSUM VERIFICATION SETTINGS
// ============================================================================

export const CHECKSUM = {
  ENABLED: true,                    // Enable checksum verification by default
  ALGORITHM: 'sha256',              // Hash algorithm: sha256, sha512, md5
  HEADER_NAME: 'x-response-checksum', // HTTP header containing the checksum
  STRICT_MODE: false,               // If true, reject responses without checksums
  MAX_AGE_MS: 300000,               // Maximum age of checksum (5 minutes)
};

// ============================================================================
// RETRY SETTINGS
// ============================================================================

export const RETRY = {
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_INITIAL_DELAY: 1000,     // 1 second
  DEFAULT_MAX_DELAY: 10000,         // 10 seconds
  DEFAULT_BACKOFF_MULTIPLIER: 2,
  TIMEOUT: 30000,                  // Max time to keep retrying
  INTERVAL: 1000,                  // Time between retries
  JITTER_FACTOR: 0.1,              // ±10% jitter
  RETRYABLE_STATUSES: [408, 429, 500, 502, 503, 504],
  RETRYABLE_ERRORS: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'ECONNRESET',
    'EPIPE'
  ],
};

// Retry configuration object (for direct use)
export const DEFAULT_RETRY_OPTIONS = {
  maxRetries: RETRY.DEFAULT_MAX_RETRIES,
  initialDelay: RETRY.DEFAULT_INITIAL_DELAY,
  maxDelay: RETRY.DEFAULT_MAX_DELAY,
  backoffMultiplier: RETRY.DEFAULT_BACKOFF_MULTIPLIER,
  retryableStatuses: RETRY.RETRYABLE_STATUSES,
  retryableErrors: RETRY.RETRYABLE_ERRORS,
};

// ============================================================================
// AUTO-RETRY SETTINGS (Gateway connectivity)
// ============================================================================

export const AUTO_RETRY = {
  ENABLED: true,                    // Enable auto-retry by default
  DEFAULT_INTERVAL_MS: 30000,       // Default: 30 seconds between auto-retries
  MIN_INTERVAL_MS: 5000,            // Minimum: 5 seconds (prevent hammering)
  MAX_INTERVAL_MS: 300000,          // Maximum: 5 minutes
  EXPONENTIAL_BACKOFF: true,        // Enable exponential backoff for consecutive failures
  BACKOFF_MULTIPLIER: 2,            // Multiply interval by this after each failure
  MAX_BACKOFF_INTERVAL_MS: 300000, // Cap backoff at 5 minutes
  RESET_AFTER_SUCCESS: true,        // Reset backoff after successful connection
  CONSECUTIVE_FAILURE_THRESHOLD: 3, // Number of failures before applying backoff
};

// ============================================================================
// ALERT THRESHOLDS
// ============================================================================

export const ALERT_THRESHOLDS = {
  CPU: { warning: 70, critical: 90 },
  MEMORY: { warning: 75, critical: 90 },
  DISK: { warning: 80, critical: 95 },
};

// Alert rate limiting
export const ALERT_RATE_LIMIT = {
  ENABLED: true,
  WINDOW_MS: 60000,      // 1 minute window
  MAX_ALERTS: 5,         // Max alerts per window per type
};

// Alert history limit
export const MAX_ALERT_HISTORY = 100;

// ============================================================================
// MEMORY PRESSURE DETECTION SETTINGS
// ============================================================================

export const MEMORY_PRESSURE = {
  // Thresholds for memory pressure detection (applies to dashboard process itself)
  THRESHOLDS: {
    WARNING_MB: 512,      // Warning when heap reaches 512MB
    CRITICAL_MB: 1024,    // Critical when heap reaches 1GB
    EMERGENCY_MB: 1536,   // Emergency when heap reaches 1.5GB
  },
  // Trend detection settings
  TREND: {
    SAMPLE_COUNT: 10,     // Number of samples to analyze for trend
    GROWTH_THRESHOLD_MB: 50,  // Minimum MB growth to consider a trend
    TIME_WINDOW_MS: 60000,    // 1 minute window for trend analysis
  },
  // Sustained pressure detection
  SUSTAINED: {
    DURATION_MS: 120000,  // 2 minutes of high memory to trigger sustained alert
    CHECK_INTERVAL_MS: 10000, // Check every 10 seconds
  },
  // Actions
  ACTIONS: {
    // Automatically clear old performance history when memory is high
    AUTO_CLEAR_HISTORY: true,
    // Request garbage collection hint (if available)
    REQUEST_GC: true,
  },
};

// ============================================================================
// VALIDATION CONSTRAINTS
// ============================================================================

export const VALIDATION = {
  REFRESH_INTERVAL: {
    MIN: 500,
    MAX: 60000,
  },
  VALID_THEMES: ['default', 'dark', 'high-contrast', 'ocean', 'auto'],
  VALID_SORT_MODES: ['time', 'tokens', 'idle', 'name'],
  VALID_LOG_LEVELS: ['all', 'error', 'warn', 'info', 'debug'],
  VALID_EXPORT_FORMATS: ['json', 'csv'],
  VALID_ENDPOINT_TYPES: ['local', 'remote', 'cloud'],
  ENDPOINT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 32,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  AUTO_RETRY: {
    INTERVAL_MS: {
      MIN: 5000,      // Minimum 5 seconds
      MAX: 300000,    // Maximum 5 minutes
    },
    BACKOFF_MULTIPLIER: {
      MIN: 1,
      MAX: 10,
    },
    MAX_BACKOFF_INTERVAL_MS: {
      MIN: 10000,     // Minimum 10 seconds
      MAX: 600000,    // Maximum 10 minutes
    },
    CONSECUTIVE_FAILURE_THRESHOLD: {
      MIN: 1,
      MAX: 10,
    },
  },
};

// ============================================================================
// COMMAND TIMEOUTS (in milliseconds)
// ============================================================================

export const COMMAND_TIMEOUTS = {
  LAUNCHCTL: 2000,
  PS: 2000,
  SYSTEM_PROFILER: 5000,
  IOREG: 3000,
  POWERMETRICS: 3000,
  OPENCLAW_VERSION: 3000,
  OPENCLAW_LOGS: 5000,
  NVIDIA_SMI: 3000,
  LSPCI: 3000,
  RADEONTOP: 3000,
  POWERSHELL: 5000,  // Windows PowerShell WMI queries
  WSL_SMI: 5000,  // WSL2 nvidia-smi.exe via Windows host
};

// ============================================================================
// WORKER THREAD SETTINGS
// ============================================================================

export const WORKERS = {
  ENABLED: true,              // Enable worker threads for heavy operations
  MAX_WORKERS: 2,             // Number of worker threads to spawn
  TASK_TIMEOUT: 10000,        // Task timeout in milliseconds (10 seconds)
  FALLBACK_ON_ERROR: true,    // Fall back to direct execution if workers fail
};

// ============================================================================
// WEB INTERFACE SETTINGS
// ============================================================================

export const WEB = {
  DEFAULT_PORT: 18790,        // Default port for web interface
  HOST: '0.0.0.0',            // Bind to all interfaces by default
  CORS_ORIGIN: '*',           // CORS origin (restrict in production)
  REQUEST_TIMEOUT: 30000,       // Request timeout in milliseconds
  REFRESH_CACHE_MS: 2000,     // Cache data for 2 seconds
  ENDPOINTS: {
    HEALTH: '/health',        // Health check endpoint
    METRICS: '/metrics',      // System metrics endpoint
    SESSIONS: '/sessions',    // Sessions list endpoint
    AGENTS: '/agents',        // Agents list endpoint
    LOGS: '/logs',            // Logs endpoint
    STATUS: '/status',        // Full dashboard status endpoint
  },
  // Rate limiting configuration
  RATE_LIMIT: {
    ENABLED: true,              // Enable rate limiting by default
    WINDOW_MS: 60000,         // Time window in milliseconds (1 minute)
    MAX_REQUESTS: 100,        // Max requests per IP per window
    TRUST_PROXY: false,       // Trust X-Forwarded-For header (set true behind reverse proxy)
  },
  // CORS configuration
  CORS: {
    // Production: specify allowed origins as array (e.g., ['https://example.com'])
    // Development: use '*' to allow all origins
    ALLOWED_ORIGINS: '*',     // Default to allow all (restrict in production)
    ALLOWED_METHODS: ['GET', 'POST', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
    CREDENTIALS: false,       // Allow cookies/credentials
    MAX_AGE: 86400,          // Preflight cache duration (24 hours)
  },
  // Authentication configuration
  AUTH: {
    ENABLED: false,           // Disabled by default (enable explicitly)
    HEADER_NAME: 'Authorization',  // HTTP header for API key
    SCHEME: 'Bearer',         // Auth scheme (Bearer, ApiKey, etc.)
    KEY_PREFIX: 'cd_',        // Prefix for auto-generated API keys
    KEY_LENGTH: 32,           // Length of random API key
    KEY_PATTERN: /^cd_[a-zA-Z0-9]{32}$/,  // Pattern for valid keys
    MAX_KEYS: 10,             // Maximum number of API keys allowed
    KEY_NAME_MIN_LENGTH: 1,   // Minimum length for key name
    KEY_NAME_MAX_LENGTH: 64,  // Maximum length for key name
  },
};

// ============================================================================
// WIDGET SETTINGS
// ============================================================================

export const WIDGETS = {
  ENABLED: true,              // Enable widget lazy loading
  AUTO_DISCOVER: true,        // Auto-discover plugins in plugins directory
  PRELOAD_PRIORITY: ['cpu', 'memory', 'gpu'],  // Widgets to preload immediately
  LAZY_LOAD_DELAY: 500,       // Delay before loading non-priority widgets (ms)
  MAX_CONCURRENT_LOADS: 3,  // Maximum concurrent widget loads
  FALLBACK_ON_ERROR: true,    // Fall back to default widgets if loading fails
  CACHE_TTL: 60000,          // Widget data cache TTL (ms)
  BUILTIN: {
    cpu: { priority: 10, lazyLoad: false },
    memory: { priority: 20, lazyLoad: false },
    gpu: { priority: 30, lazyLoad: false },
    network: { priority: 40, lazyLoad: true },
    disk: { priority: 50, lazyLoad: true },
    system: { priority: 60, lazyLoad: true },
    uptime: { priority: 70, lazyLoad: true },
    dataHealth: { priority: 80, lazyLoad: true },
  },
};

// ============================================================================
// PATH SETTINGS
// ============================================================================

export const PATHS = {
  SETTINGS: os.homedir() + '/.openclaw/dashboard-settings.json',
  EXPORTS: os.homedir() + '/.openclaw/exports',
  OPENCLAW_CONFIG: os.homedir() + '/.openclaw/openclaw.json',
  LOG: os.homedir() + '/.openclaw/claw-dashboard.log',
  HOME_DIR: os.homedir(),
  OPENCLAW_DIR: os.homedir() + '/.openclaw',
  AGENTS_DIR: os.homedir() + '/.openclaw/agents',
  WIDGETS_DIR: os.homedir() + '/.openclaw/widgets',
  PLUGINS_DIR: os.homedir() + '/.openclaw/plugins',
};

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

export const DEFAULT_SETTINGS = {
  refreshInterval: REFRESH_INTERVALS.DEFAULT,
  logLevelFilter: 'all',
  sessionSortMode: 'time',
  showWidget1: true,  // CPU
  showWidget2: true,  // Memory
  showWidget3: true,  // GPU
  showWidget4: true,  // Network
  showWidget5: true,  // Disk
  showWidget6: true,  // System
  showWidget7: true,  // Uptime
  showWidget8: true,  // Data Health
  showWidget9: true,  // Gateway Status
  showPerformanceMetrics: false,  // Show performance metrics in footer
  theme: 'auto',
  exportFormat: 'json',
  exportDirectory: PATHS.EXPORTS,
  sessionSearchQuery: '',
  favorites: {},  // Map of sessionId -> true
  showFavoritesOnly: false,
  firstRun: true,  // Show tooltip hints on first run
  gatewayEndpoints: [  // Support for multiple gateway endpoints
    { ...DEFAULT_GATEWAY_ENDPOINT }
  ],
  activeGatewayEndpoint: 'local',  // Currently selected/active endpoint
  webInterface: {
    enabled: false,     // Web interface disabled by default
    port: WEB.DEFAULT_PORT,
    host: WEB.HOST,
    cors: true,         // Enable CORS by default
    // CORS origins - set to specific origins in production (e.g., ['https://example.com'])
    // Use '*' for development to allow all origins
    corsOrigins: WEB.CORS.ALLOWED_ORIGINS,
    // Rate limiting configuration
    rateLimit: {
      enabled: WEB.RATE_LIMIT.ENABLED,
      windowMs: WEB.RATE_LIMIT.WINDOW_MS,
      maxRequests: WEB.RATE_LIMIT.MAX_REQUESTS,
      trustProxy: WEB.RATE_LIMIT.TRUST_PROXY,
    },
    // Authentication configuration
    auth: {
      enabled: WEB.AUTH.ENABLED,    // Disabled by default - must explicitly enable
      keys: [],                    // Array of { id, name, createdAt, keyHash } - keys are not stored in plain text
    },
  },
  widgetLoading: {
    enabled: true,      // Enable lazy loading
    preloadPriority: ['cpu', 'memory', 'gpu'],  // Widgets to load immediately
    lazyLoadDelay: 500, // Delay before loading other widgets
    maxConcurrent: 3,   // Max concurrent widget loads
    autoDiscover: true, // Auto-discover plugins
  },
  plugins: {},          // Plugin-specific configurations
  autoRetry: {          // Auto-retry configuration for gateway connectivity
    enabled: AUTO_RETRY.ENABLED,
    intervalMs: AUTO_RETRY.DEFAULT_INTERVAL_MS,
    exponentialBackoff: AUTO_RETRY.EXPONENTIAL_BACKOFF,
    backoffMultiplier: AUTO_RETRY.BACKOFF_MULTIPLIER,
    maxBackoffIntervalMs: AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS,
    resetAfterSuccess: AUTO_RETRY.RESET_AFTER_SUCCESS,
    consecutiveFailureThreshold: AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD,
  },
};

// ============================================================================
// EXPORT DEFAULT OBJECT (for backward compatibility)
// ============================================================================

export default {
  REFRESH_INTERVALS,
  IDLE_THRESHOLD_MS,
  HISTORY,
  GATEWAY,
  DEFAULT_GATEWAY_ENDPOINT,
  CHECKSUM,
  UI,
  CACHE_TTL,
  CACHE_CONFIG,
  DATABASE,
  RETRY,
  DEFAULT_RETRY_OPTIONS,
  AUTO_RETRY,
  ALERT_THRESHOLDS,
  ALERT_RATE_LIMIT,
  MAX_ALERT_HISTORY,
  MEMORY_PRESSURE,
  VALIDATION,
  COMMAND_TIMEOUTS,
  PATHS,
  DEFAULT_SETTINGS,
  WORKERS,
  WEB,
  WIDGETS,
  DASHBOARD_VERSION,
};
