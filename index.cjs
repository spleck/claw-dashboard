#!/usr/bin/env node
// Polyfill for __dirname in CJS bundle
var path = require('path');
var __filename = process.argv[1] || process.cwd() + '/index.js';
var __dirname = path.dirname(__filename);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/config.js
var import_os, import_fs, import_url, import_path, __filename2, __dirname2, DASHBOARD_VERSION, REFRESH_INTERVALS, IDLE_THRESHOLD_MS, HISTORY, GATEWAY, DEFAULT_GATEWAY_ENDPOINT, UI, CACHE_TTL, CACHE_CONFIG, DATABASE, CHECKSUM, RETRY, DEFAULT_RETRY_OPTIONS, AUTO_RETRY, ALERT_THRESHOLDS, ALERT_RATE_LIMIT, MAX_ALERT_HISTORY, MEMORY_PRESSURE, VALIDATION, COMMAND_TIMEOUTS, WORKERS, WORKER_DEGRADATION, WEB, WIDGETS, WIDGET_REFRESH_INTERVALS, WIDGET_SIZE_PRESETS, WIDGET_SIZES, WIDGET_DEFAULT_SIZES, WIDGET_REFRESH_VALIDATION, WIDGET_DEGRADATION, PATHS, AUTO_SAVE, EXPORT_SCHEDULE, DEFAULT_SETTINGS, config_default;
var init_config = __esm({
  "src/config.js"() {
    import_os = __toESM(require("os"), 1);
    import_fs = __toESM(require("fs"), 1);
    import_url = require("url");
    import_path = require("path");
    __filename2 = (0, import_url.fileURLToPath)("file://" + (typeof __dirname2 !== "undefined" ? require("path").join(__dirname2, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
    __dirname2 = (0, import_path.dirname)(__filename2);
    DASHBOARD_VERSION = "unknown";
    try {
      const pkg = JSON.parse(import_fs.default.readFileSync((0, import_path.join)(__dirname2, "../package.json"), "utf8"));
      DASHBOARD_VERSION = pkg.version || "unknown";
    } catch {
    }
    REFRESH_INTERVALS = {
      DEFAULT: 2e3,
      ACTIVE: 2e3,
      // 2 seconds when agents active
      IDLE: 1e4,
      // 10 seconds when idle (no active agents)
      OPTIONS: [1e3, 2e3, 5e3, 1e4]
      // Available refresh interval options
    };
    IDLE_THRESHOLD_MS = 5 * 60 * 1e3;
    HISTORY = {
      LENGTH: 60,
      // Default history length for charts
      NETWORK_LENGTH: 30
      // Network history length
    };
    GATEWAY = {
      DEFAULT_PORT: 18789,
      TIMEOUT_MS: 3e3,
      MAX_ENDPOINTS: 10,
      // Maximum number of gateway endpoints
      DEFAULT_ENDPOINT_NAME: "local"
      // Default name for local gateway
    };
    DEFAULT_GATEWAY_ENDPOINT = {
      name: "local",
      host: "localhost",
      port: 18789,
      token: null,
      enabled: true,
      type: "local"
      // 'local', 'remote', 'cloud'
    };
    UI = {
      GAUGE_WIDTH: 15,
      SPARKLINE_WIDTH: 15,
      LOG_BOX_MIN_HEIGHT: 10,
      DEFAULT_WIDTH: 80,
      DEFAULT_HEIGHT: 24
    };
    CACHE_TTL = {
      CPU: 1e3,
      // 1 second TTL for CPU
      MEMORY: 1e3,
      // 1 second TTL for memory
      GPU: 5e3,
      // 5 second TTL for GPU (expensive)
      NETWORK: 1e3,
      // 1 second TTL for network
      DISK: 3e4,
      // 30 second TTL for disk (rarely changes)
      SYSTEM: 5e3,
      // 5 second TTL for system info
      CONTAINER: 3e4,
      // 30 second TTL for container detection (rarely changes)
      DEFAULT: 2e3
      // Default TTL fallback
    };
    CACHE_CONFIG = {
      cpu: { ttl: CACHE_TTL.CPU },
      memory: { ttl: CACHE_TTL.MEMORY },
      gpu: { ttl: CACHE_TTL.GPU },
      network: { ttl: CACHE_TTL.NETWORK },
      disk: { ttl: CACHE_TTL.DISK },
      system: { ttl: CACHE_TTL.SYSTEM },
      container: { ttl: CACHE_TTL.CONTAINER }
    };
    DATABASE = {
      PATH: import_os.default.homedir() + "/.openclaw/dashboard-history.db",
      SAVE_INTERVAL_MS: 3e4,
      // Save every 30 seconds
      CLEANUP_INTERVAL_MS: 60 * 60 * 1e3,
      // Cleanup every hour
      DEFAULT_RETENTION_DAYS: 30
    };
    CHECKSUM = {
      ENABLED: true,
      // Enable checksum verification by default
      ALGORITHM: "sha256",
      // Hash algorithm: sha256, sha512, md5
      HEADER_NAME: "x-response-checksum",
      // HTTP header containing the checksum
      STRICT_MODE: false,
      // If true, reject responses without checksums
      MAX_AGE_MS: 3e5
      // Maximum age of checksum (5 minutes)
    };
    RETRY = {
      DEFAULT_MAX_RETRIES: 3,
      DEFAULT_INITIAL_DELAY: 1e3,
      // 1 second
      DEFAULT_MAX_DELAY: 1e4,
      // 10 seconds
      DEFAULT_BACKOFF_MULTIPLIER: 2,
      TIMEOUT: 3e4,
      // Max time to keep retrying
      INTERVAL: 1e3,
      // Time between retries
      JITTER_FACTOR: 0.1,
      // ±10% jitter
      RETRYABLE_STATUSES: [408, 429, 500, 502, 503, 504],
      RETRYABLE_ERRORS: [
        "ECONNREFUSED",
        "ETIMEDOUT",
        "ENOTFOUND",
        "EAI_AGAIN",
        "ECONNRESET",
        "EPIPE"
      ]
    };
    DEFAULT_RETRY_OPTIONS = {
      maxRetries: RETRY.DEFAULT_MAX_RETRIES,
      initialDelay: RETRY.DEFAULT_INITIAL_DELAY,
      maxDelay: RETRY.DEFAULT_MAX_DELAY,
      backoffMultiplier: RETRY.DEFAULT_BACKOFF_MULTIPLIER,
      retryableStatuses: RETRY.RETRYABLE_STATUSES,
      retryableErrors: RETRY.RETRYABLE_ERRORS
    };
    AUTO_RETRY = {
      ENABLED: true,
      // Enable auto-retry by default
      DEFAULT_INTERVAL_MS: 3e4,
      // Default: 30 seconds between auto-retries
      MIN_INTERVAL_MS: 5e3,
      // Minimum: 5 seconds (prevent hammering)
      MAX_INTERVAL_MS: 3e5,
      // Maximum: 5 minutes
      EXPONENTIAL_BACKOFF: true,
      // Enable exponential backoff for consecutive failures
      BACKOFF_MULTIPLIER: 2,
      // Multiply interval by this after each failure
      MAX_BACKOFF_INTERVAL_MS: 3e5,
      // Cap backoff at 5 minutes
      RESET_AFTER_SUCCESS: true,
      // Reset backoff after successful connection
      CONSECUTIVE_FAILURE_THRESHOLD: 3
      // Number of failures before applying backoff
    };
    ALERT_THRESHOLDS = {
      CPU: { warning: 70, critical: 90 },
      MEMORY: { warning: 75, critical: 90 },
      DISK: { warning: 80, critical: 95 }
    };
    ALERT_RATE_LIMIT = {
      ENABLED: true,
      WINDOW_MS: 6e4,
      // 1 minute window
      MAX_ALERTS: 5
      // Max alerts per window per type
    };
    MAX_ALERT_HISTORY = 100;
    MEMORY_PRESSURE = {
      // Thresholds for memory pressure detection (applies to dashboard process itself)
      THRESHOLDS: {
        WARNING_MB: 512,
        // Warning when heap reaches 512MB
        CRITICAL_MB: 1024,
        // Critical when heap reaches 1GB
        EMERGENCY_MB: 1536
        // Emergency when heap reaches 1.5GB
      },
      // Trend detection settings
      TREND: {
        SAMPLE_COUNT: 10,
        // Number of samples to analyze for trend
        GROWTH_THRESHOLD_MB: 50,
        // Minimum MB growth to consider a trend
        TIME_WINDOW_MS: 6e4
        // 1 minute window for trend analysis
      },
      // Sustained pressure detection
      SUSTAINED: {
        DURATION_MS: 12e4,
        // 2 minutes of high memory to trigger sustained alert
        CHECK_INTERVAL_MS: 1e4
        // Check every 10 seconds
      },
      // Actions
      ACTIONS: {
        // Automatically clear old performance history when memory is high
        AUTO_CLEAR_HISTORY: true,
        // Request garbage collection hint (if available)
        REQUEST_GC: true
      }
    };
    VALIDATION = {
      REFRESH_INTERVAL: {
        MIN: 500,
        MAX: 6e4
      },
      VALID_THEMES: ["default", "dark", "high-contrast", "ocean", "auto"],
      VALID_SORT_MODES: ["time", "tokens", "idle", "name"],
      VALID_LOG_LEVELS: ["all", "error", "warn", "info", "debug"],
      VALID_EXPORT_FORMATS: ["json", "csv"],
      VALID_ENDPOINT_TYPES: ["local", "remote", "cloud"],
      ENDPOINT_NAME: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 32,
        PATTERN: /^[a-zA-Z0-9_-]+$/
      },
      AUTO_RETRY: {
        INTERVAL_MS: {
          MIN: 5e3,
          // Minimum 5 seconds
          MAX: 3e5
          // Maximum 5 minutes
        },
        BACKOFF_MULTIPLIER: {
          MIN: 1,
          MAX: 10
        },
        MAX_BACKOFF_INTERVAL_MS: {
          MIN: 1e4,
          // Minimum 10 seconds
          MAX: 6e5
          // Maximum 10 minutes
        },
        CONSECUTIVE_FAILURE_THRESHOLD: {
          MIN: 1,
          MAX: 10
        }
      }
    };
    COMMAND_TIMEOUTS = {
      LAUNCHCTL: 2e3,
      PS: 2e3,
      SYSTEM_PROFILER: 5e3,
      IOREG: 3e3,
      POWERMETRICS: 3e3,
      OPENCLAW_VERSION: 3e3,
      OPENCLAW_LOGS: 5e3,
      NVIDIA_SMI: 3e3,
      LSPCI: 3e3,
      RADEONTOP: 3e3,
      POWERSHELL: 5e3,
      // Windows PowerShell WMI queries
      WSL_SMI: 5e3
      // WSL2 nvidia-smi.exe via Windows host
    };
    WORKERS = {
      ENABLED: true,
      // Enable worker threads for heavy operations
      MAX_WORKERS: 2,
      // Number of worker threads to spawn
      TASK_TIMEOUT: 1e4,
      // Task timeout in milliseconds (10 seconds)
      FALLBACK_ON_ERROR: true
      // Fall back to direct execution if workers fail
    };
    WORKER_DEGRADATION = {
      // Queue size thresholds
      QUEUE: {
        WARNING_SIZE: 10,
        // Warn when queue reaches this size
        CRITICAL_SIZE: 25,
        // Critical when queue reaches this size
        MAX_SIZE: 50
        // Max queue size before rejecting tasks
      },
      // Worker utilization thresholds (percentage)
      UTILIZATION: {
        WARNING_PCT: 75,
        // Warning when utilization exceeds this
        CRITICAL_PCT: 90
        // Critical when utilization exceeds this
      },
      // Degradation strategies
      STRATEGIES: {
        // Increase timeout during overload (multiplier)
        ADAPTIVE_TIMEOUT: {
          ENABLED: true,
          WARNING_MULTIPLIER: 1.5,
          // 1.5x timeout at warning level
          CRITICAL_MULTIPLIER: 2
          // 2x timeout at critical level
        },
        // Shed load by rejecting non-critical tasks
        SHED_LOAD: {
          ENABLED: true,
          SHED_NON_CRITICAL: true
          // Reject non-critical tasks when overloaded
        },
        // Circuit breaker for repeated failures
        CIRCUIT_BREAKER: {
          ENABLED: true,
          FAILURE_THRESHOLD: 5,
          // Open circuit after N consecutive failures
          RESET_TIMEOUT_MS: 3e4
          // Try to close circuit after 30s
        }
      },
      // Recovery settings
      RECOVERY: {
        COOLDOWN_MS: 5e3,
        // Time before lowering degradation level
        MIN_NORMAL_OPERATIONS: 5
        // Successful ops before marking healthy
      }
    };
    WEB = {
      DEFAULT_PORT: 18790,
      // Default port for web interface
      HOST: "0.0.0.0",
      // Bind to all interfaces by default
      CORS_ORIGIN: "*",
      // CORS origin (restrict in production)
      REQUEST_TIMEOUT: 3e4,
      // Request timeout in milliseconds
      REFRESH_CACHE_MS: 2e3,
      // Cache data for 2 seconds
      ENDPOINTS: {
        HEALTH: "/health",
        // Health check endpoint
        METRICS: "/metrics",
        // System metrics endpoint
        SESSIONS: "/sessions",
        // Sessions list endpoint
        AGENTS: "/agents",
        // Agents list endpoint
        LOGS: "/logs",
        // Logs endpoint
        STATUS: "/status"
        // Full dashboard status endpoint
      },
      // Rate limiting configuration
      RATE_LIMIT: {
        ENABLED: true,
        // Enable rate limiting by default
        WINDOW_MS: 6e4,
        // Time window in milliseconds (1 minute)
        MAX_REQUESTS: 100,
        // Max requests per IP per window
        TRUST_PROXY: false
        // Trust X-Forwarded-For header (set true behind reverse proxy)
      },
      // CORS configuration
      CORS: {
        // Production: specify allowed origins as array (e.g., ['https://example.com'])
        // Development: use '*' to allow all origins
        ALLOWED_ORIGINS: "*",
        // Default to allow all (restrict in production)
        ALLOWED_METHODS: ["GET", "POST", "OPTIONS"],
        ALLOWED_HEADERS: ["Content-Type", "Authorization"],
        CREDENTIALS: false,
        // Allow cookies/credentials
        MAX_AGE: 86400
        // Preflight cache duration (24 hours)
      },
      // Authentication configuration
      AUTH: {
        ENABLED: false,
        // Disabled by default (enable explicitly)
        HEADER_NAME: "Authorization",
        // HTTP header for API key
        SCHEME: "Bearer",
        // Auth scheme (Bearer, ApiKey, etc.)
        KEY_PREFIX: "cd_",
        // Prefix for auto-generated API keys
        KEY_LENGTH: 32,
        // Length of random API key
        KEY_PATTERN: /^cd_[a-zA-Z0-9]{32}$/,
        // Pattern for valid keys
        MAX_KEYS: 10,
        // Maximum number of API keys allowed
        KEY_NAME_MIN_LENGTH: 1,
        // Minimum length for key name
        KEY_NAME_MAX_LENGTH: 64
        // Maximum length for key name
      }
    };
    WIDGETS = {
      ENABLED: true,
      // Enable widget lazy loading
      AUTO_DISCOVER: true,
      // Auto-discover plugins in plugins directory
      PRELOAD_PRIORITY: ["cpu", "memory", "gpu"],
      // Widgets to preload immediately
      LAZY_LOAD_DELAY: 500,
      // Delay before loading non-priority widgets (ms)
      MAX_CONCURRENT_LOADS: 3,
      // Maximum concurrent widget loads
      FALLBACK_ON_ERROR: true,
      // Fall back to default widgets if loading fails
      CACHE_TTL: 6e4,
      // Widget data cache TTL (ms)
      BUILTIN: {
        cpu: { priority: 10, lazyLoad: false },
        memory: { priority: 20, lazyLoad: false },
        gpu: { priority: 30, lazyLoad: false },
        network: { priority: 40, lazyLoad: true },
        disk: { priority: 50, lazyLoad: true },
        system: { priority: 60, lazyLoad: true },
        uptime: { priority: 70, lazyLoad: true },
        dataHealth: { priority: 80, lazyLoad: true }
      }
    };
    WIDGET_REFRESH_INTERVALS = {
      // Per-widget refresh intervals (in milliseconds)
      // null = use global refresh interval
      DEFAULT: null,
      // Default: use global interval
      CPU: 1e3,
      // CPU updates frequently (1 second)
      MEMORY: 1e3,
      // Memory updates frequently (1 second)
      GPU: 5e3,
      // GPU is expensive to query (5 seconds)
      NETWORK: 1e3,
      // Network updates frequently (1 second)
      DISK: 3e4,
      // Disk rarely changes (30 seconds)
      SYSTEM: 5e3,
      // System info changes occasionally (5 seconds)
      UPTIME: 6e4,
      // Uptime only changes every minute (60 seconds)
      DATA_HEALTH: 1e4
      // Data health checks every 10 seconds
    };
    WIDGET_SIZE_PRESETS = {
      SMALL: "small",
      MEDIUM: "medium",
      LARGE: "large",
      WIDE: "wide"
    };
    WIDGET_SIZES = {
      [WIDGET_SIZE_PRESETS.SMALL]: 3,
      [WIDGET_SIZE_PRESETS.MEDIUM]: 5,
      [WIDGET_SIZE_PRESETS.LARGE]: 8,
      [WIDGET_SIZE_PRESETS.WIDE]: 5
      // Wide uses medium height by default
    };
    WIDGET_DEFAULT_SIZES = {
      cpu: WIDGET_SIZE_PRESETS.MEDIUM,
      mem: WIDGET_SIZE_PRESETS.MEDIUM,
      gpu: WIDGET_SIZE_PRESETS.MEDIUM,
      net: WIDGET_SIZE_PRESETS.MEDIUM,
      disk: WIDGET_SIZE_PRESETS.MEDIUM,
      sys: WIDGET_SIZE_PRESETS.MEDIUM,
      uptime: WIDGET_SIZE_PRESETS.MEDIUM,
      health: WIDGET_SIZE_PRESETS.MEDIUM,
      gateway: WIDGET_SIZE_PRESETS.MEDIUM
    };
    WIDGET_REFRESH_VALIDATION = {
      MIN_INTERVAL: 500,
      // Minimum 500ms between refreshes
      MAX_INTERVAL: 6e4,
      // Maximum 60 seconds between refreshes
      ALLOWED_CUSTOM_INTERVALS: [500, 1e3, 2e3, 5e3, 1e4, 3e4, 6e4]
    };
    WIDGET_DEGRADATION = {
      // When degradation level is WARNING
      WARNING: {
        SKIP_NON_CRITICAL: false,
        // Don't skip updates, just extend intervals
        EXTEND_INTERVAL_MULTIPLIER: 1.5,
        // 1.5x refresh intervals
        PRIORITY_THRESHOLD: 50
        // Only update widgets with priority <= 50
      },
      // When degradation level is CRITICAL
      CRITICAL: {
        SKIP_NON_CRITICAL: true,
        // Skip non-critical widgets
        EXTEND_INTERVAL_MULTIPLIER: 2,
        // 2x refresh intervals
        PRIORITY_THRESHOLD: 30
        // Only update widgets with priority <= 30
      },
      // Widget categories for degradation decisions
      CRITICAL_WIDGETS: ["cpu", "memory"],
      // Always update these if possible
      NON_CRITICAL_WIDGETS: ["disk", "system", "uptime", "dataHealth"]
      // Can be skipped
    };
    PATHS = {
      SETTINGS: import_os.default.homedir() + "/.openclaw/dashboard-settings.json",
      STATE: import_os.default.homedir() + "/.openclaw/dashboard-state.json",
      EXPORTS: import_os.default.homedir() + "/.openclaw/exports",
      OPENCLAW_CONFIG: import_os.default.homedir() + "/.openclaw/openclaw.json",
      LOG: import_os.default.homedir() + "/.openclaw/claw-dashboard.log",
      HOME_DIR: import_os.default.homedir(),
      OPENCLAW_DIR: import_os.default.homedir() + "/.openclaw",
      AGENTS_DIR: import_os.default.homedir() + "/.openclaw/agents",
      WIDGETS_DIR: import_os.default.homedir() + "/.openclaw/widgets",
      PLUGINS_DIR: import_os.default.homedir() + "/.openclaw/plugins"
    };
    AUTO_SAVE = {
      ENABLED: true,
      // Enable auto-save by default
      INTERVAL_MS: 3e4,
      // Auto-save every 30 seconds
      SAVE_ON_EXIT: true,
      // Save on graceful shutdown
      MAX_CONSECUTIVE_FAILURES: 3,
      // Disable auto-save after N failures
      BACKUP_COUNT: 3
      // Keep N backup state files
    };
    EXPORT_SCHEDULE = {
      ENABLED: false,
      // Disabled by default (must explicitly enable)
      DEFAULT_FORMAT: "json",
      // Default export format: 'json' or 'csv'
      DEFAULT_SCHEDULE: "0 * * * *",
      // Default: every hour at minute 0
      MIN_RETENTION_DAYS: 0,
      // Minimum retention (0 = forever)
      MAX_RETENTION_DAYS: 365,
      // Maximum retention days
      DEFAULT_RETENTION_DAYS: 30,
      // Default: keep 30 days of exports
      MAX_SCHEDULED_EXPORTS_PER_DAY: 1440
      // Max exports per day (once per minute)
    };
    DEFAULT_SETTINGS = {
      refreshInterval: REFRESH_INTERVALS.DEFAULT,
      logLevelFilter: "all",
      sessionSortMode: "time",
      showWidget1: true,
      // CPU
      showWidget2: true,
      // Memory
      showWidget3: true,
      // GPU
      showWidget4: true,
      // Network
      showWidget5: true,
      // Disk
      showWidget6: true,
      // System
      showWidget7: true,
      // Uptime
      showWidget8: true,
      // Data Health
      showWidget9: true,
      // Gateway Status
      showPerformanceMetrics: false,
      // Show performance metrics in footer
      theme: "auto",
      exportFormat: "json",
      exportDirectory: PATHS.EXPORTS,
      sessionSearchQuery: "",
      favorites: {},
      // Map of sessionId -> true
      showFavoritesOnly: false,
      pinnedWidgets: [],
      // Array of widget IDs (1-9) pinned to favorites row (max 4)
      firstRun: true,
      // Show tooltip hints on first run
      gatewayEndpoints: [
        // Support for multiple gateway endpoints
        { ...DEFAULT_GATEWAY_ENDPOINT }
      ],
      activeGatewayEndpoint: "local",
      // Currently selected/active endpoint
      webInterface: {
        enabled: false,
        // Web interface disabled by default
        port: WEB.DEFAULT_PORT,
        host: WEB.HOST,
        cors: true,
        // Enable CORS by default
        // CORS origins - set to specific origins in production (e.g., ['https://example.com'])
        // Use '*' for development to allow all origins
        corsOrigins: WEB.CORS.ALLOWED_ORIGINS,
        // Rate limiting configuration
        rateLimit: {
          enabled: WEB.RATE_LIMIT.ENABLED,
          windowMs: WEB.RATE_LIMIT.WINDOW_MS,
          maxRequests: WEB.RATE_LIMIT.MAX_REQUESTS,
          trustProxy: WEB.RATE_LIMIT.TRUST_PROXY
        },
        // Authentication configuration
        auth: {
          enabled: WEB.AUTH.ENABLED,
          // Disabled by default - must explicitly enable
          keys: []
          // Array of { id, name, createdAt, keyHash } - keys are not stored in plain text
        }
      },
      widgetLoading: {
        enabled: true,
        // Enable lazy loading
        preloadPriority: ["cpu", "memory", "gpu"],
        // Widgets to load immediately
        lazyLoadDelay: 500,
        // Delay before loading other widgets
        maxConcurrent: 3,
        // Max concurrent widget loads
        autoDiscover: true
        // Auto-discover plugins
      },
      widgetSizes: {},
      // Map of widget name -> size preset (small, medium, large, wide)
      plugins: {},
      // Plugin-specific configurations
      autoRetry: {
        // Auto-retry configuration for gateway connectivity
        enabled: AUTO_RETRY.ENABLED,
        intervalMs: AUTO_RETRY.DEFAULT_INTERVAL_MS,
        exponentialBackoff: AUTO_RETRY.EXPONENTIAL_BACKOFF,
        backoffMultiplier: AUTO_RETRY.BACKOFF_MULTIPLIER,
        maxBackoffIntervalMs: AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS,
        resetAfterSuccess: AUTO_RETRY.RESET_AFTER_SUCCESS,
        consecutiveFailureThreshold: AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD
      },
      autoSave: {
        // Dashboard auto-save configuration
        enabled: AUTO_SAVE.ENABLED,
        intervalMs: AUTO_SAVE.INTERVAL_MS,
        saveOnExit: AUTO_SAVE.SAVE_ON_EXIT
      },
      exportSchedule: {
        // Scheduled metric exports configuration
        enabled: EXPORT_SCHEDULE.ENABLED,
        format: EXPORT_SCHEDULE.DEFAULT_FORMAT,
        schedule: EXPORT_SCHEDULE.DEFAULT_SCHEDULE,
        retentionDays: EXPORT_SCHEDULE.DEFAULT_RETENTION_DAYS,
        directory: null,
        // null = use default snapshots directory
        includeMetrics: true
      }
    };
    config_default = {
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
      AUTO_SAVE,
      EXPORT_SCHEDULE,
      ALERT_THRESHOLDS,
      ALERT_RATE_LIMIT,
      MAX_ALERT_HISTORY,
      MEMORY_PRESSURE,
      VALIDATION,
      COMMAND_TIMEOUTS,
      PATHS,
      DEFAULT_SETTINGS,
      WORKERS,
      WORKER_DEGRADATION,
      WEB,
      WIDGETS,
      WIDGET_REFRESH_INTERVALS,
      WIDGET_REFRESH_VALIDATION,
      WIDGET_DEGRADATION,
      WIDGET_SIZE_PRESETS,
      WIDGET_SIZES,
      WIDGET_DEFAULT_SIZES,
      DASHBOARD_VERSION
    };
  }
});

// src/security.js
function isValidPath(filePath) {
  if (!filePath || typeof filePath !== "string") return false;
  if (filePath.includes("\0")) return false;
  if (filePath.length === 0 || filePath.length > 4096) return false;
  return true;
}
function isSafeToChmodSync(filePath) {
  try {
    const stats = import_fs2.default.lstatSync(filePath);
    if (!stats.isFile() || stats.isSymbolicLink()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
function setSecurePermissionsSync(filePath) {
  if (!isValidPath(filePath)) {
    console.error("Invalid file path provided for permission setting");
    return false;
  }
  if (!isSafeToChmodSync(filePath)) {
    console.error(`Cannot set permissions on non-file path: ${filePath}`);
    return false;
  }
  try {
    import_fs2.default.chmodSync(filePath, 384);
    return true;
  } catch (err) {
    console.error(`Failed to set permissions on ${filePath}: ${err.message}`);
    return false;
  }
}
function sanitizeWidgetConfig(config, schema2 = null) {
  const validator = new WidgetConfigValidator();
  return validator.validate(config, schema2);
}
function validatePluginPath(inputPath, options = {}) {
  const { allowedDirs = [], allowAbsolute = false, mustExist = false, expectedType = null } = options;
  if (!inputPath || typeof inputPath !== "string") {
    return { valid: false, path: null, error: "Path must be a non-empty string" };
  }
  if (inputPath.includes("\0")) {
    return { valid: false, path: null, error: "Path contains null bytes" };
  }
  if (import_path2.default.isAbsolute(inputPath) && !allowAbsolute) {
    return { valid: false, path: null, error: "Absolute paths are not allowed" };
  }
  const normalizedInput = import_path2.default.normalize(inputPath);
  if (normalizedInput.startsWith("..")) {
    return { valid: false, path: null, error: "Path traversal detected" };
  }
  if (inputPath.includes("../") || inputPath.includes("..\\")) {
    return { valid: false, path: null, error: "Path traversal detected" };
  }
  const parts = inputPath.split(import_path2.default.sep).filter((part) => part.length > 0);
  for (const part of parts) {
    if (part === "." || part === "..") {
      continue;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(part)) {
      return { valid: false, path: null, error: `Invalid characters in path component: ${part}` };
    }
    if (part.startsWith(".") && part !== "." && part !== "..") {
      const allowedHidden = [".gitkeep", ".gitignore", ".npmignore"];
      if (!allowedHidden.includes(part)) {
        return { valid: false, path: null, error: `Hidden files/directories are not allowed: ${part}` };
      }
    }
  }
  let resolvedPath;
  try {
    if (allowedDirs.length > 0) {
      const baseDir = allowedDirs[0];
      resolvedPath = import_path2.default.resolve(baseDir, inputPath);
    } else {
      resolvedPath = import_path2.default.resolve(inputPath);
    }
  } catch (err) {
    return { valid: false, path: null, error: `Failed to resolve path: ${err.message}` };
  }
  if (allowedDirs.length > 0) {
    const isWithinAllowed = allowedDirs.some((allowedDir) => {
      const normalizedAllowed = allowedDir.endsWith(import_path2.default.sep) ? allowedDir : allowedDir + import_path2.default.sep;
      const normalizedResolved = resolvedPath.endsWith(import_path2.default.sep) ? resolvedPath : resolvedPath + import_path2.default.sep;
      return normalizedResolved.startsWith(normalizedAllowed);
    });
    if (!isWithinAllowed) {
      return { valid: false, path: null, error: "Path is outside allowed directories" };
    }
  }
  if (mustExist) {
    try {
      const stats = import_fs2.default.statSync(resolvedPath);
      if (expectedType === "file" && !stats.isFile()) {
        return { valid: false, path: null, error: "Path exists but is not a file" };
      }
      if (expectedType === "directory" && !stats.isDirectory()) {
        return { valid: false, path: null, error: "Path exists but is not a directory" };
      }
    } catch (err) {
      return { valid: false, path: null, error: `Path does not exist: ${resolvedPath}` };
    }
  }
  try {
    const realPath = import_fs2.default.realpathSync(resolvedPath);
    if (allowedDirs.length > 0) {
      const realAllowedDirs = allowedDirs.map((allowedDir) => {
        try {
          return import_fs2.default.realpathSync(allowedDir);
        } catch {
          return allowedDir;
        }
      });
      const isRealPathWithinAllowed = realAllowedDirs.some((realAllowedDir) => {
        const normalizedAllowed = realAllowedDir.endsWith(import_path2.default.sep) ? realAllowedDir : realAllowedDir + import_path2.default.sep;
        const normalizedReal = realPath.endsWith(import_path2.default.sep) ? realPath : realPath + import_path2.default.sep;
        return normalizedReal.startsWith(normalizedAllowed);
      });
      if (!isRealPathWithinAllowed) {
        return { valid: false, path: null, error: "Path resolves outside allowed directories via symlink" };
      }
    }
  } catch (err) {
    if (mustExist) {
      return { valid: false, path: null, error: `Failed to resolve real path: ${err.message}` };
    }
  }
  return { valid: true, path: resolvedPath, error: null };
}
function validatePluginName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Plugin name must be a non-empty string" };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Plugin name cannot be empty" };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: "Plugin name too long (max 100 characters)" };
  }
  const reservedNames = ["node_modules", "package.json", "package-lock.json", ".git", ".hg", ".svn"];
  if (reservedNames.includes(trimmed.toLowerCase())) {
    return { valid: false, error: `Plugin name '${trimmed}' is reserved` };
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(trimmed)) {
    return { valid: false, error: "Plugin name must contain only alphanumeric characters, hyphens, and underscores, and must start with alphanumeric" };
  }
  return { valid: true, error: null };
}
var import_fs2, import_path2, import_crypto, WidgetConfigValidator, ApiKeyAuth;
var init_security = __esm({
  "src/security.js"() {
    import_fs2 = __toESM(require("fs"), 1);
    import_path2 = __toESM(require("path"), 1);
    import_crypto = __toESM(require("crypto"), 1);
    init_config();
    WidgetConfigValidator = class {
      constructor(options = {}) {
        this.maxStringLength = options.maxStringLength || 1e3;
        this.maxDepth = options.maxDepth || 10;
        this.maxArrayLength = options.maxArrayLength || 100;
        this.allowedTypes = options.allowedTypes || ["string", "number", "boolean", "object", "array", "null"];
        this.stripNullBytes = options.stripNullBytes !== false;
        this.maxKeyLength = options.maxKeyLength || 100;
      }
      /**
       * Validate and sanitize a widget configuration
       * @param {*} config - Raw configuration object
       * @param {Object} schema - Optional schema to validate against
       * @returns {Object} Sanitized configuration
       */
      validate(config, schema2 = null) {
        if (config === null || config === void 0) {
          return {};
        }
        if (typeof config !== "object") {
          throw new Error("Widget config must be an object");
        }
        return this._sanitizeValue(config, 0, schema2);
      }
      /**
       * Internal sanitization method with depth tracking
       * @private
       */
      _sanitizeValue(value, depth, schema2) {
        if (depth > this.maxDepth) {
          throw new Error(`Configuration exceeds maximum depth of ${this.maxDepth}`);
        }
        if (value === null) {
          return null;
        }
        if (value === void 0) {
          return void 0;
        }
        const type = Array.isArray(value) ? "array" : typeof value;
        if (!this.allowedTypes.includes(type)) {
          throw new Error(`Invalid type: ${type}`);
        }
        if (type === "string") {
          return this._sanitizeString(value);
        }
        if (type === "number") {
          return this._sanitizeNumber(value);
        }
        if (type === "boolean") {
          return value;
        }
        if (type === "array") {
          return this._sanitizeArray(value, depth, schema2);
        }
        if (type === "object") {
          return this._sanitizeObject(value, depth, schema2);
        }
        return value;
      }
      /**
       * Sanitize a string value
       * @private
       */
      _sanitizeString(str) {
        if (typeof str !== "string") {
          return String(str);
        }
        if (this.stripNullBytes) {
          str = str.replace(/\0/g, "");
        }
        if (str.length > this.maxStringLength) {
          str = str.substring(0, this.maxStringLength);
        }
        return str;
      }
      /**
       * Sanitize a number value
       * @private
       */
      _sanitizeNumber(num) {
        if (typeof num !== "number") {
          return NaN;
        }
        if (Number.isNaN(num) || !Number.isFinite(num)) {
          return 0;
        }
        return num;
      }
      /**
       * Sanitize an array
       * @private
       */
      _sanitizeArray(arr, depth, schema2) {
        if (!Array.isArray(arr)) {
          return [];
        }
        if (arr.length > this.maxArrayLength) {
          arr = arr.slice(0, this.maxArrayLength);
        }
        const itemSchema = schema2?.items;
        return arr.map((item, index) => {
          try {
            return this._sanitizeValue(item, depth + 1, itemSchema);
          } catch (err) {
            return null;
          }
        });
      }
      /**
       * Sanitize an object
       * @private
       */
      _sanitizeObject(obj, depth, schema2) {
        if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
          return {};
        }
        const sanitized = {};
        const properties = schema2?.properties || {};
        const allowedKeys = schema2 ? new Set(Object.keys(properties)) : null;
        for (const key of Object.keys(obj)) {
          if (key.length > this.maxKeyLength) {
            continue;
          }
          if (allowedKeys && !allowedKeys.has(key)) {
            continue;
          }
          try {
            const keySchema = properties?.[key];
            sanitized[key] = this._sanitizeValue(obj[key], depth + 1, keySchema);
          } catch (err) {
            const defaultValue = properties?.[key]?.default;
            sanitized[key] = defaultValue !== void 0 ? defaultValue : null;
          }
        }
        return sanitized;
      }
    };
    ApiKeyAuth = class {
      constructor(options = {}) {
        this.keys = /* @__PURE__ */ new Map();
        this.revokedKeys = /* @__PURE__ */ new Set();
        this.failedAttempts = /* @__PURE__ */ new Map();
        this.enabled = options.enabled ?? WEB.AUTH.ENABLED;
        this.headerName = options.headerName ?? WEB.AUTH.HEADER_NAME;
        this.scheme = options.scheme ?? WEB.AUTH.SCHEME;
        this.keyPrefix = options.keyPrefix ?? WEB.AUTH.KEY_PREFIX;
        this.keyLength = options.keyLength ?? WEB.AUTH.KEY_LENGTH;
        this.maxKeys = options.maxKeys ?? WEB.AUTH.MAX_KEYS;
        this.maxFailedAttempts = options.maxFailedAttempts ?? 5;
        this.blockDurationMs = options.blockDurationMs ?? 6e4;
        const prefix = this.keyPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        this.keyPattern = new RegExp(`^${prefix}[a-zA-Z0-9]{${this.keyLength}}$`);
      }
      /**
       * Generate a cryptographically secure API key
       * @param {string} name - Human-readable name for the key
       * @returns {Object} { key, id, name, createdAt } - Returns the full key (only shown once)
       */
      generateKey(name) {
        if (!name || typeof name !== "string") {
          throw new Error("API key name is required");
        }
        if (name.length < WEB.AUTH.KEY_NAME_MIN_LENGTH || name.length > WEB.AUTH.KEY_NAME_MAX_LENGTH) {
          throw new Error(`Key name must be between ${WEB.AUTH.KEY_NAME_MIN_LENGTH} and ${WEB.AUTH.KEY_NAME_MAX_LENGTH} characters`);
        }
        if (this.keys.size >= this.maxKeys) {
          throw new Error(`Maximum number of API keys (${this.maxKeys}) reached`);
        }
        const randomBytes = import_crypto.default.randomBytes(Math.ceil(this.keyLength / 2));
        const randomPart = randomBytes.toString("hex").slice(0, this.keyLength);
        const key = `${this.keyPrefix}${randomPart}`;
        const keyData = {
          id: import_crypto.default.randomUUID(),
          name: name.trim(),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastUsed: null,
          usageCount: 0,
          keyHash: this._hashKey(key)
        };
        this.keys.set(key, keyData);
        return {
          key,
          // Full key - only returned once
          id: keyData.id,
          name: keyData.name,
          createdAt: keyData.createdAt
        };
      }
      /**
       * Hash a key for secure storage/comparison
       * @private
       * @param {string} key - The API key
       * @returns {string} SHA-256 hash of the key
       */
      _hashKey(key) {
        return import_crypto.default.createHash("sha256").update(key).digest("hex");
      }
      /**
       * Validate an API key format without checking existence
       * @param {string} key - The API key to validate
       * @returns {boolean} True if format is valid
       */
      isValidKeyFormat(key) {
        if (!key || typeof key !== "string") {
          return false;
        }
        return this.keyPattern.test(key);
      }
      /**
       * Check if an IP is currently blocked due to failed attempts
       * @param {string} ip - Client IP address
       * @returns {Object} { blocked: boolean, retryAfter?: number }
       */
      isBlocked(ip) {
        if (!ip) return { blocked: false };
        const attemptData = this.failedAttempts.get(ip);
        if (!attemptData) return { blocked: false };
        const now = Date.now();
        if (attemptData.blockedUntil && now < attemptData.blockedUntil) {
          return {
            blocked: true,
            retryAfter: Math.ceil((attemptData.blockedUntil - now) / 1e3)
          };
        }
        if (attemptData.blockedUntil && now >= attemptData.blockedUntil) {
          this.failedAttempts.delete(ip);
        }
        return { blocked: false };
      }
      /**
       * Record a failed authentication attempt
       * @private
       * @param {string} ip - Client IP address
       */
      _recordFailedAttempt(ip) {
        if (!ip) return;
        const now = Date.now();
        let attemptData = this.failedAttempts.get(ip);
        if (!attemptData) {
          attemptData = { count: 0, firstAttempt: now, blockedUntil: null };
        }
        attemptData.count++;
        if (attemptData.count >= this.maxFailedAttempts) {
          attemptData.blockedUntil = now + this.blockDurationMs;
        }
        this.failedAttempts.set(ip, attemptData);
      }
      /**
       * Clear failed attempts for an IP (after successful auth)
       * @private
       * @param {string} ip - Client IP address
       */
      _clearFailedAttempts(ip) {
        if (ip) {
          this.failedAttempts.delete(ip);
        }
      }
      /**
       * Extract API key from request headers
       * @param {Object} headers - HTTP request headers
       * @returns {string|null} Extracted API key or null
       */
      extractKey(headers) {
        if (!headers || typeof headers !== "object") {
          return null;
        }
        const headerNameLower = this.headerName.toLowerCase();
        const authHeader = Object.entries(headers).find(
          ([key]) => key.toLowerCase() === headerNameLower
        )?.[1];
        if (!authHeader) return null;
        if (this.scheme) {
          const schemeLower = this.scheme.toLowerCase();
          const authLower = authHeader.toLowerCase();
          if (authLower.startsWith(`${schemeLower} `)) {
            return authHeader.slice(this.scheme.length + 1).trim();
          }
        }
        return authHeader;
      }
      /**
       * Authenticate a request
       * @param {Object} headers - HTTP request headers
       * @param {string} ip - Client IP address
       * @returns {Object} Authentication result { authenticated: boolean, keyId?: string, error?: string }
       */
      authenticate(headers, ip) {
        if (!this.enabled) {
          return { authenticated: true };
        }
        const blockStatus = this.isBlocked(ip);
        if (blockStatus.blocked) {
          return {
            authenticated: false,
            error: `Too many failed attempts. Retry after ${blockStatus.retryAfter} seconds`,
            code: "AUTH_BLOCKED",
            retryAfter: blockStatus.retryAfter
          };
        }
        const key = this.extractKey(headers);
        if (!key) {
          this._recordFailedAttempt(ip);
          return {
            authenticated: false,
            error: "Authentication required. Provide API key in header",
            code: "AUTH_REQUIRED"
          };
        }
        if (!this.isValidKeyFormat(key)) {
          this._recordFailedAttempt(ip);
          return {
            authenticated: false,
            error: "Invalid API key format",
            code: "AUTH_INVALID_FORMAT"
          };
        }
        const keyData = this.keys.get(key);
        if (!keyData) {
          this._recordFailedAttempt(ip);
          return {
            authenticated: false,
            error: "Invalid API key",
            code: "AUTH_INVALID_KEY"
          };
        }
        if (this.revokedKeys.has(keyData.keyHash)) {
          this._recordFailedAttempt(ip);
          return {
            authenticated: false,
            error: "API key has been revoked",
            code: "AUTH_REVOKED"
          };
        }
        this._clearFailedAttempts(ip);
        keyData.lastUsed = (/* @__PURE__ */ new Date()).toISOString();
        keyData.usageCount++;
        return {
          authenticated: true,
          keyId: keyData.id,
          keyName: keyData.name
        };
      }
      /**
       * Revoke an API key
       * @param {string} keyId - The key ID to revoke
       * @returns {boolean} True if key was found and revoked
       */
      revokeKey(keyId) {
        for (const [key, data] of this.keys.entries()) {
          if (data.id === keyId) {
            this.revokedKeys.add(data.keyHash);
            this.keys.delete(key);
            return true;
          }
        }
        return false;
      }
      /**
       * List all active API keys (without exposing the actual keys)
       * @returns {Array} List of key metadata
       */
      listKeys() {
        return Array.from(this.keys.values()).map((data) => ({
          id: data.id,
          name: data.name,
          createdAt: data.createdAt,
          lastUsed: data.lastUsed,
          usageCount: data.usageCount
        }));
      }
      /**
       * Get the number of active keys
       * @returns {number} Number of active API keys
       */
      getKeyCount() {
        return this.keys.size;
      }
      /**
       * Check if authentication is enabled
       * @returns {boolean} True if authentication is enabled
       */
      isEnabled() {
        return this.enabled;
      }
      /**
       * Enable authentication
       */
      enable() {
        this.enabled = true;
      }
      /**
       * Disable authentication
       */
      disable() {
        this.enabled = false;
      }
      /**
       * Clear all API keys and failed attempts
       */
      clear() {
        this.keys.clear();
        this.revokedKeys.clear();
        this.failedAttempts.clear();
      }
    };
  }
});

// src/logger.js
function ensureLogDir() {
  const logDir = import_os2.default.homedir() + "/.openclaw";
  if (!import_fs3.default.existsSync(logDir)) {
    import_fs3.default.mkdirSync(logDir, { recursive: true });
  }
}
function sanitize(value) {
  if (value === null || value === void 0) {
    return String(value);
  }
  let str = String(value);
  str = str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
  str = str.replace(/\x1b\][^\x07]*\x07/g, "");
  str = str.replace(/\x1b[P][a-zA-Z0-9]/g, "");
  str = str.replace(/\x1b\[[0-9;]*[@-~]/g, "");
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, (char) => {
    if (char === "	") return "	";
    if (char === "\n") return "\\n";
    if (char === "\r") return "\\r";
    return "\\x" + char.charCodeAt(0).toString(16).padStart(2, "0");
  });
  str = str.replace(/\r\n/g, "\\r\\n");
  str = str.replace(/\n/g, "\\n");
  str = str.replace(/\r/g, "\\r");
  return str;
}
function sanitizeArgs(args) {
  return args.map((arg) => {
    if (typeof arg === "object") {
      try {
        return sanitize(JSON.stringify(arg));
      } catch {
        return sanitize(String(arg));
      }
    }
    return sanitize(arg);
  });
}
function writeLog(level, args) {
  const timestamp = getTimestamp();
  const sanitizedArgs = sanitizeArgs(args);
  const message = sanitizedArgs.join(" ");
  const logLine = `${timestamp} [${level}] ${message}
`;
  try {
    ensureLogDir();
    let isNewFile = false;
    try {
      import_fs3.default.accessSync(LOG_FILE_PATH, import_fs3.default.constants.F_OK);
    } catch {
      isNewFile = true;
    }
    import_fs3.default.appendFileSync(LOG_FILE_PATH, logLine);
    if (isNewFile) {
      setSecurePermissionsSync(LOG_FILE_PATH);
    }
  } catch (err) {
    if (level === "ERROR") {
      process.stderr.write(`[Log Error] Failed to write ERROR log: ${err.message}
`);
    }
  }
}
function getTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
}
var import_fs3, import_os2, import_url2, import_path3, __filename3, __dirname3, LOG_FILE_PATH, logger, logger_default;
var init_logger = __esm({
  "src/logger.js"() {
    import_fs3 = __toESM(require("fs"), 1);
    init_security();
    import_os2 = __toESM(require("os"), 1);
    import_url2 = require("url");
    import_path3 = require("path");
    __filename3 = (0, import_url2.fileURLToPath)("file://" + (typeof __dirname3 !== "undefined" ? require("path").join(__dirname3, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
    __dirname3 = (0, import_path3.dirname)(__filename3);
    LOG_FILE_PATH = import_os2.default.homedir() + "/.openclaw/claw-dashboard.log";
    logger = {
      /**
       * Log error level messages to file
       * @param {...any} args - Arguments to log
       */
      error(...args) {
        writeLog("ERROR", args);
      },
      /**
       * Log warning level messages to file
       * @param {...any} args - Arguments to log
       */
      warn(...args) {
        writeLog("WARN", args);
      },
      /**
       * Log info level messages to file
       * @param {...any} args - Arguments to log
       */
      info(...args) {
        writeLog("INFO", args);
      },
      /**
       * Log debug level messages to file (only when DEBUG env var is set)
       * @param {...any} args - Arguments to log
       */
      debug(...args) {
        if (process.env.DEBUG) {
          writeLog("DEBUG", args);
        }
      }
    };
    logger_default = logger;
  }
});

// src/errors.js
var DashboardError, GatewayError, AuthError, NetworkError, TimeoutError, WorkerPoolOverloadError, ChecksumError;
var init_errors = __esm({
  "src/errors.js"() {
    DashboardError = class extends Error {
      constructor(message, code = "DASHBOARD_ERROR", details = {}) {
        super(message);
        this.name = "DashboardError";
        this.code = code;
        this.details = details;
        this.timestamp = (/* @__PURE__ */ new Date()).toISOString();
        Error.captureStackTrace(this, this.constructor);
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          code: this.code,
          details: this.details,
          timestamp: this.timestamp,
          stack: this.stack
        };
      }
    };
    GatewayError = class extends DashboardError {
      constructor(message, details = {}) {
        super(message, "GATEWAY_ERROR", details);
        this.name = "GatewayError";
      }
    };
    AuthError = class extends DashboardError {
      constructor(message, details = {}) {
        super(message, "AUTH_ERROR", details);
        this.name = "AuthError";
      }
    };
    NetworkError = class extends DashboardError {
      constructor(message, details = {}) {
        super(message, "NETWORK_ERROR", details);
        this.name = "NetworkError";
      }
    };
    TimeoutError = class extends DashboardError {
      constructor(message, details = {}) {
        super(message, "TIMEOUT_ERROR", details);
        this.name = "TimeoutError";
      }
    };
    WorkerPoolOverloadError = class extends DashboardError {
      constructor(message, details = {}) {
        super(message, "WORKER_POOL_OVERLOAD", details);
        this.name = "WorkerPoolOverloadError";
        this.degradationLevel = details.degradationLevel || "none";
        this.queueSize = details.queueSize || 0;
        this.utilizationPercent = details.utilizationPercent || 0;
      }
    };
    ChecksumError = class extends DashboardError {
      constructor(message, details = {}) {
        super(message, "CHECKSUM_ERROR", details);
        this.name = "ChecksumError";
      }
    };
  }
});

// src/workers/worker-pool.js
var worker_pool_exports = {};
__export(worker_pool_exports, {
  CIRCUIT_STATES: () => CIRCUIT_STATES,
  DEGRADATION_LEVELS: () => DEGRADATION_LEVELS,
  DegradationLevel: () => DegradationLevel,
  WorkerPool: () => WorkerPool,
  default: () => worker_pool_default
});
var import_worker_threads, import_url4, import_path7, __filename5, __dirname5, DEGRADATION_LEVELS, CIRCUIT_STATES, DegradationLevel, WorkerPool, workerPool, worker_pool_default;
var init_worker_pool = __esm({
  "src/workers/worker-pool.js"() {
    import_worker_threads = require("worker_threads");
    import_url4 = require("url");
    import_path7 = require("path");
    init_logger();
    init_config();
    init_errors();
    __filename5 = (0, import_url4.fileURLToPath)("file://" + (typeof __dirname5 !== "undefined" ? require("path").join(__dirname5, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
    __dirname5 = (0, import_path7.dirname)(__filename5);
    DEGRADATION_LEVELS = {
      NONE: "none",
      WARNING: "warning",
      CRITICAL: "critical"
    };
    CIRCUIT_STATES = {
      CLOSED: "closed",
      OPEN: "open",
      HALF_OPEN: "half_open"
    };
    DegradationLevel = {
      NONE: "none",
      WARNING: "warning",
      CRITICAL: "critical"
    };
    WorkerPool = class {
      constructor(options = {}) {
        this.workerPath = options.workerPath || (0, import_path7.join)(__dirname5, "system-worker.js");
        this.maxWorkers = options.maxWorkers || config_default.WORKERS?.MAX_WORKERS || 2;
        this.taskTimeout = options.taskTimeout || config_default.WORKERS?.TASK_TIMEOUT || 1e4;
        this.enableWorkers = options.enableWorkers ?? config_default.WORKERS?.ENABLED ?? true;
        this.workers = [];
        this.taskQueue = [];
        this.taskId = 0;
        this.pendingTasks = /* @__PURE__ */ new Map();
        this.isShutdown = false;
        const degradationConfig = options.degradationConfig || config_default.WORKER_DEGRADATION || {};
        this.degradationConfig = {
          queue: degradationConfig.QUEUE || { WARNING_SIZE: 10, CRITICAL_SIZE: 25, MAX_SIZE: 50 },
          utilization: degradationConfig.UTILIZATION || { WARNING_PCT: 75, CRITICAL_PCT: 90 },
          strategies: degradationConfig.STRATEGIES || {
            ADAPTIVE_TIMEOUT: { ENABLED: true, WARNING_MULTIPLIER: 1.5, CRITICAL_MULTIPLIER: 2 },
            SHED_LOAD: { ENABLED: true, SHED_NON_CRITICAL: true },
            CIRCUIT_BREAKER: { ENABLED: true, FAILURE_THRESHOLD: 5, RESET_TIMEOUT_MS: 3e4 }
          },
          recovery: degradationConfig.RECOVERY || { COOLDOWN_MS: 5e3, MIN_NORMAL_OPERATIONS: 5 }
        };
        this.degradationLevel = DEGRADATION_LEVELS.NONE;
        this.degradationSince = null;
        this.consecutiveFailures = 0;
        this.circuitBreakerState = CIRCUIT_STATES.CLOSED;
        this.circuitBreakerOpenedAt = null;
        this.successfulOperations = 0;
        this.overloadEvents = 0;
        this.lastOverloadTime = null;
        this.totalRejected = 0;
        this.totalShed = 0;
        this.workersSupported = this.checkWorkerSupport();
        if (this.enableWorkers && this.workersSupported) {
          this.initializeWorkers();
        }
      }
      /**
       * Check if worker threads are supported
       * @returns {boolean} True if worker threads are available
       */
      checkWorkerSupport() {
        try {
          const [major] = process.versions.node.split(".").map(Number);
          if (major < 12) {
            logger_default.info("Worker threads not available (Node.js < 12)");
            return false;
          }
          return true;
        } catch (error) {
          logger_default.info("Worker threads not supported in this environment:", error.message);
          return false;
        }
      }
      /**
       * Initialize worker threads
       */
      initializeWorkers() {
        try {
          for (let i = 0; i < this.maxWorkers; i++) {
            this.createWorker(i);
          }
          logger_default.info(`Initialized ${this.maxWorkers} system information worker threads`);
        } catch (error) {
          logger_default.error("Failed to initialize workers:", error.message);
          this.workersSupported = false;
          this.workers = [];
        }
      }
      /**
       * Create a new worker thread
       * @param {number} id - Worker ID
       * @returns {Worker} Created worker
       */
      createWorker(id) {
        const worker = new import_worker_threads.Worker(this.workerPath);
        worker.id = id;
        worker.isReady = false;
        worker.isBusy = false;
        worker.on("message", (message) => {
          this.handleWorkerMessage(worker, message);
        });
        worker.on("error", (error) => {
          logger_default.error(`Worker ${id} error:`, error.message);
          this.restartWorker(id);
        });
        worker.on("exit", (code) => {
          if (code !== 0) {
            logger_default.warn(`Worker ${id} exited with code ${code}`);
          }
          this.removeWorker(id);
        });
        this.workers.push(worker);
        return worker;
      }
      /**
       * Handle messages from worker threads
       * @param {Worker} worker - Worker that sent the message
       * @param {Object} message - Message from worker
       */
      handleWorkerMessage(worker, message) {
        if (message.type === "ready") {
          worker.isReady = true;
          this.processQueue();
          return;
        }
        if (message.id !== void 0) {
          const task = this.pendingTasks.get(message.id);
          if (task) {
            this.pendingTasks.delete(message.id);
            worker.isBusy = false;
            if (task.timeout) {
              clearTimeout(task.timeout);
            }
            if (message.success) {
              this.recordSuccess();
              task.resolve(message.data);
            } else {
              this.recordFailure();
              const error = new Error(message.error || "Worker task failed");
              if (message.stack) {
                error.stack = message.stack;
              }
              task.reject(error);
            }
            this.processQueue();
          }
        }
      }
      /**
       * Restart a worker thread
       * @param {number} id - Worker ID to restart
       */
      restartWorker(id) {
        const existingWorker = this.workers.find((w) => w.id === id);
        if (existingWorker) {
          existingWorker.terminate().catch(() => {
          });
        }
        setTimeout(() => {
          if (!this.isShutdown) {
            this.createWorker(id);
          }
        }, 100).unref();
      }
      /**
       * Remove a worker from the pool
       * @param {number} id - Worker ID to remove
       */
      removeWorker(id) {
        const index = this.workers.findIndex((w) => w.id === id);
        if (index !== -1) {
          this.workers.splice(index, 1);
        }
      }
      /**
       * Check current system load and detect overload conditions
       * @returns {Object} Load status with degradation level
       */
      checkOverload() {
        const queueSize = this.taskQueue.length;
        const busyWorkers = this.workers.filter((w) => w.isBusy).length;
        const utilizationPercent = this.workers.length > 0 ? Math.round(busyWorkers / this.workers.length * 100) : 0;
        if (this.circuitBreakerState === CIRCUIT_STATES.OPEN) {
          const timeOpen = Date.now() - this.circuitBreakerOpenedAt;
          if (timeOpen >= this.degradationConfig.strategies.CIRCUIT_BREAKER.RESET_TIMEOUT_MS) {
            this.circuitBreakerState = CIRCUIT_STATES.HALF_OPEN;
            logger_default.info("Circuit breaker entering half-open state");
          } else {
            return {
              level: DEGRADATION_LEVELS.CRITICAL,
              queueSize,
              utilizationPercent,
              circuitOpen: true,
              reason: "circuit_breaker"
            };
          }
        }
        const { WARNING_SIZE, CRITICAL_SIZE, MAX_SIZE } = this.degradationConfig.queue;
        if (queueSize >= MAX_SIZE) {
          return {
            level: DEGRADATION_LEVELS.CRITICAL,
            queueSize,
            utilizationPercent,
            reason: "max_queue_size"
          };
        }
        if (queueSize >= CRITICAL_SIZE || utilizationPercent >= this.degradationConfig.utilization.CRITICAL_PCT) {
          return {
            level: DEGRADATION_LEVELS.CRITICAL,
            queueSize,
            utilizationPercent,
            reason: queueSize >= CRITICAL_SIZE ? "queue_size" : "utilization"
          };
        }
        if (queueSize >= WARNING_SIZE || utilizationPercent >= this.degradationConfig.utilization.WARNING_PCT) {
          return {
            level: DEGRADATION_LEVELS.WARNING,
            queueSize,
            utilizationPercent,
            reason: queueSize >= WARNING_SIZE ? "queue_size" : "utilization"
          };
        }
        return {
          level: DEGRADATION_LEVELS.NONE,
          queueSize,
          utilizationPercent,
          reason: null
        };
      }
      /**
       * Get adaptive timeout based on current degradation level
       * @returns {number} Adjusted timeout in milliseconds
       */
      getAdaptiveTimeout() {
        const baseTimeout = this.taskTimeout;
        if (!this.degradationConfig.strategies.ADAPTIVE_TIMEOUT.ENABLED) {
          return baseTimeout;
        }
        switch (this.degradationLevel) {
          case DEGRADATION_LEVELS.CRITICAL:
            return baseTimeout * this.degradationConfig.strategies.ADAPTIVE_TIMEOUT.CRITICAL_MULTIPLIER;
          case DEGRADATION_LEVELS.WARNING:
            return baseTimeout * this.degradationConfig.strategies.ADAPTIVE_TIMEOUT.WARNING_MULTIPLIER;
          default:
            return baseTimeout;
        }
      }
      /**
       * Update degradation level based on current load
       * @param {Object} loadStatus - Result from checkOverload()
       */
      updateDegradationLevel(loadStatus) {
        const previousLevel = this.degradationLevel;
        const newLevel = loadStatus.level;
        if (previousLevel !== newLevel) {
          this.degradationLevel = newLevel;
          this.degradationSince = Date.now();
          if (newLevel === DEGRADATION_LEVELS.CRITICAL) {
            this.overloadEvents++;
            this.lastOverloadTime = Date.now();
            logger_default.warn(`Worker pool entering critical degradation: ${loadStatus.reason} (queue: ${loadStatus.queueSize}, utilization: ${loadStatus.utilizationPercent}%)`);
          } else if (newLevel === DEGRADATION_LEVELS.WARNING) {
            logger_default.warn(`Worker pool entering warning state: ${loadStatus.reason} (queue: ${loadStatus.queueSize}, utilization: ${loadStatus.utilizationPercent}%)`);
          } else if (previousLevel !== DEGRADATION_LEVELS.NONE) {
            logger_default.info(`Worker pool returning to normal operation from ${previousLevel}`);
          }
        }
        if (previousLevel !== newLevel) {
          this.successfulOperations = 0;
        }
      }
      /**
       * Record a successful operation for recovery tracking
       */
      recordSuccess() {
        this.consecutiveFailures = 0;
        this.successfulOperations++;
        if (this.circuitBreakerState === CIRCUIT_STATES.HALF_OPEN) {
          this.circuitBreakerState = CIRCUIT_STATES.CLOSED;
          this.circuitBreakerOpenedAt = null;
          logger_default.info("Circuit breaker closed - service recovered");
        }
        if (this.degradationLevel !== DEGRADATION_LEVELS.NONE) {
          const cooldownElapsed = Date.now() - this.degradationSince >= this.degradationConfig.recovery.COOLDOWN_MS;
          const minOpsMet = this.successfulOperations >= this.degradationConfig.recovery.MIN_NORMAL_OPERATIONS;
          if (cooldownElapsed && minOpsMet) {
            const loadStatus = this.checkOverload();
            if (loadStatus.level === DEGRADATION_LEVELS.NONE) {
              this.updateDegradationLevel(loadStatus);
            }
          }
        }
      }
      /**
       * Record a failed operation and potentially open circuit breaker
       */
      recordFailure() {
        this.consecutiveFailures++;
        this.successfulOperations = 0;
        const threshold = this.degradationConfig.strategies.CIRCUIT_BREAKER.FAILURE_THRESHOLD;
        if (this.degradationConfig.strategies.CIRCUIT_BREAKER.ENABLED && this.consecutiveFailures >= threshold && this.circuitBreakerState === CIRCUIT_STATES.CLOSED) {
          this.circuitBreakerState = CIRCUIT_STATES.OPEN;
          this.circuitBreakerOpenedAt = Date.now();
          logger_default.error(`Circuit breaker opened after ${this.consecutiveFailures} consecutive failures`);
        }
      }
      /**
       * Check if we should reject/shed a new task due to overload
       * @param {Object} options - Task options
       * @returns {boolean} True if task should be rejected
       */
      shouldShedLoad(options = {}) {
        if (options.critical || options.priority === "high") {
          return false;
        }
        if (!this.degradationConfig.strategies.SHED_LOAD.ENABLED) {
          return false;
        }
        if (this.degradationLevel === DEGRADATION_LEVELS.CRITICAL && this.degradationConfig.strategies.SHED_LOAD.SHED_NON_CRITICAL) {
          return true;
        }
        return false;
      }
      /**
       * Execute a systeminformation command via worker thread
       * @param {string} command - Command to execute
       * @param {Object} options - Command options
       * @returns {Promise<any>} Command result
       */
      async execute(command, options = {}) {
        const loadStatus = this.checkOverload();
        this.updateDegradationLevel(loadStatus);
        if (loadStatus.level === DEGRADATION_LEVELS.CRITICAL && loadStatus.reason === "max_queue_size") {
          this.totalRejected++;
          throw new WorkerPoolOverloadError("Worker pool queue at maximum capacity", {
            degradationLevel: this.degradationLevel,
            queueSize: loadStatus.queueSize,
            utilizationPercent: loadStatus.utilizationPercent
          });
        }
        if (loadStatus.circuitOpen) {
          this.totalRejected++;
          throw new WorkerPoolOverloadError("Worker pool circuit breaker is open", {
            degradationLevel: this.degradationLevel,
            queueSize: loadStatus.queueSize,
            utilizationPercent: loadStatus.utilizationPercent
          });
        }
        if (this.shouldShedLoad(options)) {
          this.totalShed++;
          logger_default.debug(`Shedding load for command: ${command}`);
          try {
            const result = await this.fallbackExecute(command, options);
            this.recordSuccess();
            return result;
          } catch (error) {
            this.recordFailure();
            throw error;
          }
        }
        if (!this.workersSupported || !this.enableWorkers || this.workers.length === 0) {
          try {
            const result = await this.fallbackExecute(command, options);
            this.recordSuccess();
            return result;
          } catch (error) {
            this.recordFailure();
            throw error;
          }
        }
        return new Promise((resolve9, reject) => {
          const id = ++this.taskId;
          const adaptiveTimeout = this.getAdaptiveTimeout();
          const timeout = setTimeout(() => {
            this.pendingTasks.delete(id);
            this.recordFailure();
            reject(new Error(`Worker task timeout: ${command}`));
          }, adaptiveTimeout).unref();
          this.pendingTasks.set(id, {
            id,
            command,
            options,
            resolve: resolve9,
            reject,
            timeout,
            timestamp: Date.now()
          });
          this.taskQueue.push({ id, command, options });
          this.processQueue();
        });
      }
      /**
       * Process the task queue
       */
      processQueue() {
        if (this.taskQueue.length === 0) return;
        const availableWorker = this.workers.find((w) => w.isReady && !w.isBusy);
        if (!availableWorker) return;
        const task = this.taskQueue.shift();
        if (!task) return;
        availableWorker.isBusy = true;
        availableWorker.postMessage({
          id: task.id,
          command: task.command,
          options: task.options
        });
      }
      /**
       * Fallback execution when workers aren't available
       * Executes directly in the main thread
       * @param {string} command - Command to execute
       * @param {Object} options - Command options
       * @returns {Promise<any>} Command result
       */
      async fallbackExecute(command, options = {}) {
        try {
          const si2 = await import("systeminformation");
          const systemInfo = si2.default || si2;
          switch (command) {
            case "currentLoad":
              return await systemInfo.currentLoad();
            case "mem":
              return await systemInfo.mem();
            case "graphics":
              return await systemInfo.graphics();
            case "networkStats":
              return await systemInfo.networkStats();
            case "fsSize":
              return await systemInfo.fsSize();
            case "systemData": {
              const [os13, ver, time] = await Promise.all([
                systemInfo.osInfo(),
                systemInfo.versions(),
                systemInfo.time()
              ]);
              return { os: os13, ver, time };
            }
            default:
              throw new Error(`Unknown command: ${command}`);
          }
        } catch (error) {
          logger_default.warn(`Fallback execution failed for ${command}:`, error.message);
          throw error;
        }
      }
      /**
       * Get worker pool status
       * @returns {Object} Pool status
       */
      getStatus() {
        const loadStatus = this.checkOverload();
        return {
          enabled: this.enableWorkers,
          supported: this.workersSupported,
          totalWorkers: this.workers.length,
          busyWorkers: this.workers.filter((w) => w.isBusy).length,
          readyWorkers: this.workers.filter((w) => w.isReady).length,
          pendingTasks: this.pendingTasks.size,
          queuedTasks: this.taskQueue.length,
          degradation: {
            level: this.degradationLevel,
            since: this.degradationSince,
            queueSize: loadStatus.queueSize,
            utilizationPercent: loadStatus.utilizationPercent,
            circuitBreakerState: this.circuitBreakerState,
            consecutiveFailures: this.consecutiveFailures,
            successfulOperations: this.successfulOperations,
            overloadEvents: this.overloadEvents,
            lastOverloadTime: this.lastOverloadTime,
            totalRejected: this.totalRejected,
            totalShed: this.totalShed
          }
        };
      }
      /**
       * Shut down all workers
       */
      async shutdown() {
        this.isShutdown = true;
        for (const [id, task] of this.pendingTasks) {
          if (task.timeout) {
            clearTimeout(task.timeout);
          }
          task.reject(new Error("Worker pool shutting down"));
        }
        this.pendingTasks.clear();
        this.taskQueue = [];
        const terminationPromises = this.workers.map(
          (worker) => worker.terminate().catch(() => {
          })
        );
        await Promise.all(terminationPromises);
        this.workers = [];
        logger_default.info("Worker pool shut down");
      }
    };
    workerPool = new WorkerPool();
    worker_pool_default = workerPool;
  }
});

// node_modules/sql.js/dist/sql-wasm.js
var require_sql_wasm = __commonJS({
  "node_modules/sql.js/dist/sql-wasm.js"(exports2, module2) {
    var initSqlJsPromise = void 0;
    var initSqlJs2 = function(moduleConfig) {
      if (initSqlJsPromise) {
        return initSqlJsPromise;
      }
      initSqlJsPromise = new Promise(function(resolveModule, reject) {
        var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
        var originalOnAbortFunction = Module["onAbort"];
        Module["onAbort"] = function(errorThatCausedAbort) {
          reject(new Error(errorThatCausedAbort));
          if (originalOnAbortFunction) {
            originalOnAbortFunction(errorThatCausedAbort);
          }
        };
        Module["postRun"] = Module["postRun"] || [];
        Module["postRun"].push(function() {
          resolveModule(Module);
        });
        module2 = void 0;
        var k;
        k ||= typeof Module != "undefined" ? Module : {};
        var aa = !!globalThis.window, ba = !!globalThis.WorkerGlobalScope, ca = globalThis.process?.versions?.node && "renderer" != globalThis.process?.type;
        k.onRuntimeInitialized = function() {
          function a(f, l) {
            switch (typeof l) {
              case "boolean":
                dc(f, l ? 1 : 0);
                break;
              case "number":
                ec(f, l);
                break;
              case "string":
                fc(f, l, -1, -1);
                break;
              case "object":
                if (null === l) lb(f);
                else if (null != l.length) {
                  var n = da(l.length);
                  m.set(l, n);
                  gc(f, n, l.length, -1);
                  ea(n);
                } else sa(f, "Wrong API use : tried to return a value of an unknown type (" + l + ").", -1);
                break;
              default:
                lb(f);
            }
          }
          function b(f, l) {
            for (var n = [], p = 0; p < f; p += 1) {
              var u = r(l + 4 * p, "i32"), v = hc(u);
              if (1 === v || 2 === v) u = ic(u);
              else if (3 === v) u = jc(u);
              else if (4 === v) {
                v = u;
                u = kc(v);
                v = lc(v);
                for (var K = new Uint8Array(u), I = 0; I < u; I += 1) K[I] = m[v + I];
                u = K;
              } else u = null;
              n.push(u);
            }
            return n;
          }
          function c(f, l) {
            this.Qa = f;
            this.db = l;
            this.Oa = 1;
            this.lb = [];
          }
          function d(f, l) {
            this.db = l;
            this.eb = fa(f);
            if (null === this.eb) throw Error("Unable to allocate memory for the SQL string");
            this.kb = this.eb;
            this.Za = this.qb = null;
          }
          function e(f) {
            this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
            if (null != f) {
              var l = this.filename, n = "/", p = l;
              n && (n = "string" == typeof n ? n : ha(n), p = l ? ia(n + "/" + l) : n);
              l = ja(true, true);
              p = ka(
                p,
                l
              );
              if (f) {
                if ("string" == typeof f) {
                  n = Array(f.length);
                  for (var u = 0, v = f.length; u < v; ++u) n[u] = f.charCodeAt(u);
                  f = n;
                }
                la(p, l | 146);
                n = ma(p, 577);
                na(n, f, 0, f.length, 0);
                oa(n);
                la(p, l);
              }
            }
            this.handleError(q(this.filename, g));
            this.db = r(g, "i32");
            ob(this.db);
            this.fb = {};
            this.Sa = {};
          }
          var g = y(4), h = k.cwrap, q = h("sqlite3_open", "number", ["string", "number"]), w = h("sqlite3_close_v2", "number", ["number"]), t = h("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), x = h("sqlite3_changes", "number", ["number"]), D = h(
            "sqlite3_prepare_v2",
            "number",
            ["number", "string", "number", "number", "number"]
          ), pb = h("sqlite3_sql", "string", ["number"]), nc = h("sqlite3_normalized_sql", "string", ["number"]), qb = h("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), oc = h("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = h("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), pc = h("sqlite3_bind_double", "number", ["number", "number", "number"]), qc = h("sqlite3_bind_int", "number", [
            "number",
            "number",
            "number"
          ]), rc = h("sqlite3_bind_parameter_index", "number", ["number", "string"]), sc = h("sqlite3_step", "number", ["number"]), tc = h("sqlite3_errmsg", "string", ["number"]), uc = h("sqlite3_column_count", "number", ["number"]), vc = h("sqlite3_data_count", "number", ["number"]), wc = h("sqlite3_column_double", "number", ["number", "number"]), sb = h("sqlite3_column_text", "string", ["number", "number"]), xc = h("sqlite3_column_blob", "number", ["number", "number"]), yc = h("sqlite3_column_bytes", "number", ["number", "number"]), zc = h(
            "sqlite3_column_type",
            "number",
            ["number", "number"]
          ), Ac = h("sqlite3_column_name", "string", ["number", "number"]), Bc = h("sqlite3_reset", "number", ["number"]), Cc = h("sqlite3_clear_bindings", "number", ["number"]), Dc = h("sqlite3_finalize", "number", ["number"]), tb = h("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), hc = h("sqlite3_value_type", "number", ["number"]), kc = h("sqlite3_value_bytes", "number", ["number"]), jc = h("sqlite3_value_text", "string", ["number"]), lc = h(
            "sqlite3_value_blob",
            "number",
            ["number"]
          ), ic = h("sqlite3_value_double", "number", ["number"]), ec = h("sqlite3_result_double", "", ["number", "number"]), lb = h("sqlite3_result_null", "", ["number"]), fc = h("sqlite3_result_text", "", ["number", "string", "number", "number"]), gc = h("sqlite3_result_blob", "", ["number", "number", "number", "number"]), dc = h("sqlite3_result_int", "", ["number", "number"]), sa = h("sqlite3_result_error", "", ["number", "string", "number"]), ub = h("sqlite3_aggregate_context", "number", ["number", "number"]), ob = h(
            "RegisterExtensionFunctions",
            "number",
            ["number"]
          ), vb = h("sqlite3_update_hook", "number", ["number", "number", "number"]);
          c.prototype.bind = function(f) {
            if (!this.Qa) throw "Statement closed";
            this.reset();
            return Array.isArray(f) ? this.Cb(f) : null != f && "object" === typeof f ? this.Db(f) : true;
          };
          c.prototype.step = function() {
            if (!this.Qa) throw "Statement closed";
            this.Oa = 1;
            var f = sc(this.Qa);
            switch (f) {
              case 100:
                return true;
              case 101:
                return false;
              default:
                throw this.db.handleError(f);
            }
          };
          c.prototype.wb = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            return wc(this.Qa, f);
          };
          c.prototype.Gb = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            f = sb(this.Qa, f);
            if ("function" !== typeof BigInt) throw Error("BigInt is not supported");
            return BigInt(f);
          };
          c.prototype.Hb = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            return sb(this.Qa, f);
          };
          c.prototype.getBlob = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            var l = yc(this.Qa, f);
            f = xc(this.Qa, f);
            for (var n = new Uint8Array(l), p = 0; p < l; p += 1) n[p] = m[f + p];
            return n;
          };
          c.prototype.get = function(f, l) {
            l = l || {};
            null != f && this.bind(f) && this.step();
            f = [];
            for (var n = vc(this.Qa), p = 0; p < n; p += 1) switch (zc(this.Qa, p)) {
              case 1:
                var u = l.useBigInt ? this.Gb(p) : this.wb(p);
                f.push(u);
                break;
              case 2:
                f.push(this.wb(p));
                break;
              case 3:
                f.push(this.Hb(p));
                break;
              case 4:
                f.push(this.getBlob(p));
                break;
              default:
                f.push(null);
            }
            return f;
          };
          c.prototype.getColumnNames = function() {
            for (var f = [], l = uc(this.Qa), n = 0; n < l; n += 1) f.push(Ac(this.Qa, n));
            return f;
          };
          c.prototype.getAsObject = function(f, l) {
            f = this.get(f, l);
            l = this.getColumnNames();
            for (var n = {}, p = 0; p < l.length; p += 1) n[l[p]] = f[p];
            return n;
          };
          c.prototype.getSQL = function() {
            return pb(this.Qa);
          };
          c.prototype.getNormalizedSQL = function() {
            return nc(this.Qa);
          };
          c.prototype.run = function(f) {
            null != f && this.bind(f);
            this.step();
            return this.reset();
          };
          c.prototype.tb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            f = fa(f);
            this.lb.push(f);
            this.db.handleError(oc(this.Qa, l, f, -1, 0));
          };
          c.prototype.Bb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            var n = da(f.length);
            m.set(f, n);
            this.lb.push(n);
            this.db.handleError(rb(this.Qa, l, n, f.length, 0));
          };
          c.prototype.sb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            this.db.handleError((f === (f | 0) ? qc : pc)(this.Qa, l, f));
          };
          c.prototype.Eb = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            rb(this.Qa, f, 0, 0, 0);
          };
          c.prototype.ub = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            switch (typeof f) {
              case "string":
                this.tb(f, l);
                return;
              case "number":
                this.sb(f, l);
                return;
              case "bigint":
                this.tb(f.toString(), l);
                return;
              case "boolean":
                this.sb(f + 0, l);
                return;
              case "object":
                if (null === f) {
                  this.Eb(l);
                  return;
                }
                if (null != f.length) {
                  this.Bb(f, l);
                  return;
                }
            }
            throw "Wrong API use : tried to bind a value of an unknown type (" + f + ").";
          };
          c.prototype.Db = function(f) {
            var l = this;
            Object.keys(f).forEach(function(n) {
              var p = rc(l.Qa, n);
              0 !== p && l.ub(f[n], p);
            });
            return true;
          };
          c.prototype.Cb = function(f) {
            for (var l = 0; l < f.length; l += 1) this.ub(f[l], l + 1);
            return true;
          };
          c.prototype.reset = function() {
            this.freemem();
            return 0 === Cc(this.Qa) && 0 === Bc(this.Qa);
          };
          c.prototype.freemem = function() {
            for (var f; void 0 !== (f = this.lb.pop()); ) ea(f);
          };
          c.prototype.free = function() {
            this.freemem();
            var f = 0 === Dc(this.Qa);
            delete this.db.fb[this.Qa];
            this.Qa = 0;
            return f;
          };
          d.prototype.next = function() {
            if (null === this.eb) return { done: true };
            null !== this.Za && (this.Za.free(), this.Za = null);
            if (!this.db.db) throw this.nb(), Error("Database closed");
            var f = pa(), l = y(4);
            qa(g);
            qa(l);
            try {
              this.db.handleError(qb(this.db.db, this.kb, -1, g, l));
              this.kb = r(l, "i32");
              var n = r(g, "i32");
              if (0 === n) return this.nb(), { done: true };
              this.Za = new c(n, this.db);
              this.db.fb[n] = this.Za;
              return { value: this.Za, done: false };
            } catch (p) {
              throw this.qb = z(this.kb), this.nb(), p;
            } finally {
              ra(f);
            }
          };
          d.prototype.nb = function() {
            ea(this.eb);
            this.eb = null;
          };
          d.prototype.getRemainingSQL = function() {
            return null !== this.qb ? this.qb : z(this.kb);
          };
          "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (d.prototype[Symbol.iterator] = function() {
            return this;
          });
          e.prototype.run = function(f, l) {
            if (!this.db) throw "Database closed";
            if (l) {
              f = this.prepare(f, l);
              try {
                f.step();
              } finally {
                f.free();
              }
            } else this.handleError(t(this.db, f, 0, 0, g));
            return this;
          };
          e.prototype.exec = function(f, l, n) {
            if (!this.db) throw "Database closed";
            var p = null, u = null, v = null;
            try {
              v = u = fa(f);
              var K = y(4);
              for (f = []; 0 !== r(v, "i8"); ) {
                qa(g);
                qa(K);
                this.handleError(qb(this.db, v, -1, g, K));
                var I = r(g, "i32");
                v = r(K, "i32");
                if (0 !== I) {
                  var H = null;
                  p = new c(I, this);
                  for (null != l && p.bind(l); p.step(); ) null === H && (H = { columns: p.getColumnNames(), values: [] }, f.push(H)), H.values.push(p.get(null, n));
                  p.free();
                }
              }
              return f;
            } catch (L) {
              throw p && p.free(), L;
            } finally {
              u && ea(u);
            }
          };
          e.prototype.each = function(f, l, n, p, u) {
            "function" === typeof l && (p = n, n = l, l = void 0);
            f = this.prepare(f, l);
            try {
              for (; f.step(); ) n(f.getAsObject(null, u));
            } finally {
              f.free();
            }
            if ("function" === typeof p) return p();
          };
          e.prototype.prepare = function(f, l) {
            qa(g);
            this.handleError(D(this.db, f, -1, g, 0));
            f = r(g, "i32");
            if (0 === f) throw "Nothing to prepare";
            var n = new c(f, this);
            null != l && n.bind(l);
            return this.fb[f] = n;
          };
          e.prototype.iterateStatements = function(f) {
            return new d(f, this);
          };
          e.prototype["export"] = function() {
            Object.values(this.fb).forEach(function(l) {
              l.free();
            });
            Object.values(this.Sa).forEach(A);
            this.Sa = {};
            this.handleError(w(this.db));
            var f = ta(this.filename);
            this.handleError(q(this.filename, g));
            this.db = r(g, "i32");
            ob(this.db);
            return f;
          };
          e.prototype.close = function() {
            null !== this.db && (Object.values(this.fb).forEach(function(f) {
              f.free();
            }), Object.values(this.Sa).forEach(A), this.Sa = {}, this.Ya && (A(this.Ya), this.Ya = void 0), this.handleError(w(this.db)), ua("/" + this.filename), this.db = null);
          };
          e.prototype.handleError = function(f) {
            if (0 === f) return null;
            f = tc(this.db);
            throw Error(f);
          };
          e.prototype.getRowsModified = function() {
            return x(this.db);
          };
          e.prototype.create_function = function(f, l) {
            Object.prototype.hasOwnProperty.call(this.Sa, f) && (A(this.Sa[f]), delete this.Sa[f]);
            var n = va(function(p, u, v) {
              u = b(u, v);
              try {
                var K = l.apply(null, u);
              } catch (I) {
                sa(p, I, -1);
                return;
              }
              a(p, K);
            }, "viii");
            this.Sa[f] = n;
            this.handleError(tb(this.db, f, l.length, 1, 0, n, 0, 0, 0));
            return this;
          };
          e.prototype.create_aggregate = function(f, l) {
            var n = l.init || function() {
              return null;
            }, p = l.finalize || function(H) {
              return H;
            }, u = l.step;
            if (!u) throw "An aggregate function must have a step function in " + f;
            var v = {};
            Object.hasOwnProperty.call(this.Sa, f) && (A(this.Sa[f]), delete this.Sa[f]);
            l = f + "__finalize";
            Object.hasOwnProperty.call(
              this.Sa,
              l
            ) && (A(this.Sa[l]), delete this.Sa[l]);
            var K = va(function(H, L, Pa) {
              var V = ub(H, 1);
              Object.hasOwnProperty.call(v, V) || (v[V] = n());
              L = b(L, Pa);
              L = [v[V]].concat(L);
              try {
                v[V] = u.apply(null, L);
              } catch (Fc) {
                delete v[V], sa(H, Fc, -1);
              }
            }, "viii"), I = va(function(H) {
              var L = ub(H, 1);
              try {
                var Pa = p(v[L]);
              } catch (V) {
                delete v[L];
                sa(H, V, -1);
                return;
              }
              a(H, Pa);
              delete v[L];
            }, "vi");
            this.Sa[f] = K;
            this.Sa[l] = I;
            this.handleError(tb(this.db, f, u.length - 1, 1, 0, 0, K, I, 0));
            return this;
          };
          e.prototype.updateHook = function(f) {
            this.Ya && (vb(this.db, 0, 0), A(this.Ya), this.Ya = void 0);
            if (!f) return this;
            this.Ya = va(function(l, n, p, u, v) {
              switch (n) {
                case 18:
                  l = "insert";
                  break;
                case 23:
                  l = "update";
                  break;
                case 9:
                  l = "delete";
                  break;
                default:
                  throw "unknown operationCode in updateHook callback: " + n;
              }
              p = z(p);
              u = z(u);
              if (v > Number.MAX_SAFE_INTEGER) throw "rowId too big to fit inside a Number";
              f(l, p, u, Number(v));
            }, "viiiij");
            vb(this.db, this.Ya, 0);
            return this;
          };
          k.Database = e;
        };
        var wa = "./this.program", xa = (a, b) => {
          throw b;
        }, ya = globalThis.document?.currentScript?.src;
        "undefined" != typeof __filename ? ya = __filename : ba && (ya = self.location.href);
        var za = "", Aa, Ba;
        if (ca) {
          var fs17 = require("node:fs");
          za = __dirname + "/";
          Ba = (a) => {
            a = Ca(a) ? new URL(a) : a;
            return fs17.readFileSync(a);
          };
          Aa = async (a) => {
            a = Ca(a) ? new URL(a) : a;
            return fs17.readFileSync(a, void 0);
          };
          1 < process.argv.length && (wa = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          "undefined" != typeof module2 && (module2.exports = k);
          xa = (a, b) => {
            process.exitCode = a;
            throw b;
          };
        } else if (aa || ba) {
          try {
            za = new URL(".", ya).href;
          } catch {
          }
          ba && (Ba = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          });
          Aa = async (a) => {
            if (Ca(a)) return new Promise((c, d) => {
              var e = new XMLHttpRequest();
              e.open("GET", a, true);
              e.responseType = "arraybuffer";
              e.onload = () => {
                200 == e.status || 0 == e.status && e.response ? c(e.response) : d(e.status);
              };
              e.onerror = d;
              e.send(null);
            });
            var b = await fetch(a, { credentials: "same-origin" });
            if (b.ok) return b.arrayBuffer();
            throw Error(b.status + " : " + b.url);
          };
        }
        var Da = console.log.bind(console), B = console.error.bind(console), Ea, Fa = false, Ga, Ca = (a) => a.startsWith("file://"), m, C2, Ha, E, F, Ia, Ja, G;
        function Ka() {
          var a = La.buffer;
          m = new Int8Array(a);
          Ha = new Int16Array(a);
          C2 = new Uint8Array(a);
          new Uint16Array(a);
          E = new Int32Array(a);
          F = new Uint32Array(a);
          Ia = new Float32Array(a);
          Ja = new Float64Array(a);
          G = new BigInt64Array(a);
          new BigUint64Array(a);
        }
        function Ma(a) {
          k.onAbort?.(a);
          a = "Aborted(" + a + ")";
          B(a);
          Fa = true;
          throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
        }
        var Na;
        async function Oa(a) {
          if (!Ea) try {
            var b = await Aa(a);
            return new Uint8Array(b);
          } catch {
          }
          if (a == Na && Ea) a = new Uint8Array(Ea);
          else if (Ba) a = Ba(a);
          else throw "both async and sync fetching of the wasm failed";
          return a;
        }
        async function Qa(a, b) {
          try {
            var c = await Oa(a);
            return await WebAssembly.instantiate(c, b);
          } catch (d) {
            B(`failed to asynchronously prepare wasm: ${d}`), Ma(d);
          }
        }
        async function Ra(a) {
          var b = Na;
          if (!Ea && !Ca(b) && !ca) try {
            var c = fetch(b, { credentials: "same-origin" });
            return await WebAssembly.instantiateStreaming(c, a);
          } catch (d) {
            B(`wasm streaming compile failed: ${d}`), B("falling back to ArrayBuffer instantiation");
          }
          return Qa(b, a);
        }
        class Sa {
          name = "ExitStatus";
          constructor(a) {
            this.message = `Program terminated with exit(${a})`;
            this.status = a;
          }
        }
        var Ta = (a) => {
          for (; 0 < a.length; ) a.shift()(k);
        }, Ua = [], Va = [], Wa = () => {
          var a = k.preRun.shift();
          Va.push(a);
        }, J = 0, Xa = null;
        function r(a, b = "i8") {
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              return m[a];
            case "i8":
              return m[a];
            case "i16":
              return Ha[a >> 1];
            case "i32":
              return E[a >> 2];
            case "i64":
              return G[a >> 3];
            case "float":
              return Ia[a >> 2];
            case "double":
              return Ja[a >> 3];
            case "*":
              return F[a >> 2];
            default:
              Ma(`invalid type for getValue: ${b}`);
          }
        }
        var Ya = true;
        function qa(a) {
          var b = "i32";
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              m[a] = 0;
              break;
            case "i8":
              m[a] = 0;
              break;
            case "i16":
              Ha[a >> 1] = 0;
              break;
            case "i32":
              E[a >> 2] = 0;
              break;
            case "i64":
              G[a >> 3] = BigInt(0);
              break;
            case "float":
              Ia[a >> 2] = 0;
              break;
            case "double":
              Ja[a >> 3] = 0;
              break;
            case "*":
              F[a >> 2] = 0;
              break;
            default:
              Ma(`invalid type for setValue: ${b}`);
          }
        }
        var Za = new TextDecoder(), $a = (a, b, c, d) => {
          c = b + c;
          if (d) return c;
          for (; a[b] && !(b >= c); ) ++b;
          return b;
        }, z = (a, b, c) => a ? Za.decode(C2.subarray(a, $a(C2, a, b, c))) : "", ab = (a, b) => {
          for (var c = 0, d = a.length - 1; 0 <= d; d--) {
            var e = a[d];
            "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
          }
          if (b) for (; c; c--) a.unshift("..");
          return a;
        }, ia = (a) => {
          var b = "/" === a.charAt(0), c = "/" === a.slice(-1);
          (a = ab(a.split("/").filter((d) => !!d), !b).join("/")) || b || (a = ".");
          a && c && (a += "/");
          return (b ? "/" : "") + a;
        }, bb = (a) => {
          var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
          a = b[0];
          b = b[1];
          if (!a && !b) return ".";
          b &&= b.slice(0, -1);
          return a + b;
        }, cb = (a) => a && a.match(/([^\/]+|\/)\/*$/)[1], db2 = () => {
          if (ca) {
            var a = require("node:crypto");
            return (b) => a.randomFillSync(b);
          }
          return (b) => crypto.getRandomValues(b);
        }, eb = (a) => {
          (eb = db2())(a);
        }, fb = (...a) => {
          for (var b = "", c = false, d = a.length - 1; -1 <= d && !c; d--) {
            c = 0 <= d ? a[d] : "/";
            if ("string" != typeof c) throw new TypeError("Arguments to path.resolve must be strings");
            if (!c) return "";
            b = c + "/" + b;
            c = "/" === c.charAt(0);
          }
          b = ab(b.split("/").filter((e) => !!e), !c).join("/");
          return (c ? "/" : "") + b || ".";
        }, gb = (a) => {
          var b = $a(a, 0);
          return Za.decode(a.buffer ? a.subarray(0, b) : new Uint8Array(a.slice(0, b)));
        }, hb = [], ib = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, M = (a, b, c, d) => {
          if (!(0 < d)) return 0;
          var e = c;
          d = c + d - 1;
          for (var g = 0; g < a.length; ++g) {
            var h = a.codePointAt(g);
            if (127 >= h) {
              if (c >= d) break;
              b[c++] = h;
            } else if (2047 >= h) {
              if (c + 1 >= d) break;
              b[c++] = 192 | h >> 6;
              b[c++] = 128 | h & 63;
            } else if (65535 >= h) {
              if (c + 2 >= d) break;
              b[c++] = 224 | h >> 12;
              b[c++] = 128 | h >> 6 & 63;
              b[c++] = 128 | h & 63;
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | h >> 18;
              b[c++] = 128 | h >> 12 & 63;
              b[c++] = 128 | h >> 6 & 63;
              b[c++] = 128 | h & 63;
              g++;
            }
          }
          b[c] = 0;
          return c - e;
        }, jb = [];
        function kb(a, b) {
          jb[a] = { input: [], output: [], cb: b };
          mb(a, nb);
        }
        var nb = { open(a) {
          var b = jb[a.node.rdev];
          if (!b) throw new N(43);
          a.tty = b;
          a.seekable = false;
        }, close(a) {
          a.tty.cb.fsync(a.tty);
        }, fsync(a) {
          a.tty.cb.fsync(a.tty);
        }, read(a, b, c, d) {
          if (!a.tty || !a.tty.cb.xb) throw new N(60);
          for (var e = 0, g = 0; g < d; g++) {
            try {
              var h = a.tty.cb.xb(a.tty);
            } catch (q) {
              throw new N(29);
            }
            if (void 0 === h && 0 === e) throw new N(6);
            if (null === h || void 0 === h) break;
            e++;
            b[c + g] = h;
          }
          e && (a.node.atime = Date.now());
          return e;
        }, write(a, b, c, d) {
          if (!a.tty || !a.tty.cb.rb) throw new N(60);
          try {
            for (var e = 0; e < d; e++) a.tty.cb.rb(a.tty, b[c + e]);
          } catch (g) {
            throw new N(29);
          }
          d && (a.node.mtime = a.node.ctime = Date.now());
          return e;
        } }, wb = { xb() {
          a: {
            if (!hb.length) {
              var a = null;
              if (ca) {
                var b = Buffer.alloc(256), c = 0, d = process.stdin.fd;
                try {
                  c = fs17.readSync(d, b, 0, 256);
                } catch (e) {
                  if (e.toString().includes("EOF")) c = 0;
                  else throw e;
                }
                0 < c && (a = b.slice(0, c).toString("utf-8"));
              } else globalThis.window?.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
              if (!a) {
                a = null;
                break a;
              }
              b = Array(ib(a) + 1);
              a = M(a, b, 0, b.length);
              b.length = a;
              hb = b;
            }
            a = hb.shift();
          }
          return a;
        }, rb(a, b) {
          null === b || 10 === b ? (Da(gb(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, fsync(a) {
          0 < a.output?.length && (Da(gb(a.output)), a.output = []);
        }, Tb() {
          return { Ob: 25856, Qb: 5, Nb: 191, Pb: 35387, Mb: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
        }, Ub() {
          return 0;
        }, Vb() {
          return [24, 80];
        } }, xb = { rb(a, b) {
          null === b || 10 === b ? (B(gb(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, fsync(a) {
          0 < a.output?.length && (B(gb(a.output)), a.output = []);
        } }, O = { Wa: null, Xa() {
          return O.createNode(null, "/", 16895, 0);
        }, createNode(a, b, c, d) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new N(63);
          O.Wa || (O.Wa = { dir: { node: { Ta: O.La.Ta, Ua: O.La.Ua, lookup: O.La.lookup, hb: O.La.hb, rename: O.La.rename, unlink: O.La.unlink, rmdir: O.La.rmdir, readdir: O.La.readdir, symlink: O.La.symlink }, stream: { Va: O.Ma.Va } }, file: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: { Va: O.Ma.Va, read: O.Ma.read, write: O.Ma.write, ib: O.Ma.ib, jb: O.Ma.jb } }, link: { node: { Ta: O.La.Ta, Ua: O.La.Ua, readlink: O.La.readlink }, stream: {} }, vb: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: yb } });
          c = zb(a, b, c, d);
          P(c.mode) ? (c.La = O.Wa.dir.node, c.Ma = O.Wa.dir.stream, c.Na = {}) : 32768 === (c.mode & 61440) ? (c.La = O.Wa.file.node, c.Ma = O.Wa.file.stream, c.Ra = 0, c.Na = null) : 40960 === (c.mode & 61440) ? (c.La = O.Wa.link.node, c.Ma = O.Wa.link.stream) : 8192 === (c.mode & 61440) && (c.La = O.Wa.vb.node, c.Ma = O.Wa.vb.stream);
          c.atime = c.mtime = c.ctime = Date.now();
          a && (a.Na[b] = c, a.atime = a.mtime = a.ctime = c.atime);
          return c;
        }, Sb(a) {
          return a.Na ? a.Na.subarray ? a.Na.subarray(0, a.Ra) : new Uint8Array(a.Na) : new Uint8Array(0);
        }, La: {
          Ta(a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            P(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.Ra : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
            b.atime = new Date(a.atime);
            b.mtime = new Date(a.mtime);
            b.ctime = new Date(a.ctime);
            b.blksize = 4096;
            b.blocks = Math.ceil(b.size / b.blksize);
            return b;
          },
          Ua(a, b) {
            for (var c of ["mode", "atime", "mtime", "ctime"]) null != b[c] && (a[c] = b[c]);
            void 0 !== b.size && (b = b.size, a.Ra != b && (0 == b ? (a.Na = null, a.Ra = 0) : (c = a.Na, a.Na = new Uint8Array(b), c && a.Na.set(c.subarray(0, Math.min(b, a.Ra))), a.Ra = b)));
          },
          lookup() {
            O.mb || (O.mb = new N(44), O.mb.stack = "<generic error, no stack>");
            throw O.mb;
          },
          hb(a, b, c, d) {
            return O.createNode(a, b, c, d);
          },
          rename(a, b, c) {
            try {
              var d = Q(b, c);
            } catch (g) {
            }
            if (d) {
              if (P(a.mode)) for (var e in d.Na) throw new N(55);
              Ab(d);
            }
            delete a.parent.Na[a.name];
            b.Na[c] = a;
            a.name = c;
            b.ctime = b.mtime = a.parent.ctime = a.parent.mtime = Date.now();
          },
          unlink(a, b) {
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          },
          rmdir(a, b) {
            var c = Q(a, b), d;
            for (d in c.Na) throw new N(55);
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          },
          readdir(a) {
            return [".", "..", ...Object.keys(a.Na)];
          },
          symlink(a, b, c) {
            a = O.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink(a) {
            if (40960 !== (a.mode & 61440)) throw new N(28);
            return a.link;
          }
        }, Ma: { read(a, b, c, d, e) {
          var g = a.node.Na;
          if (e >= a.node.Ra) return 0;
          a = Math.min(a.node.Ra - e, d);
          if (8 < a && g.subarray) b.set(g.subarray(e, e + a), c);
          else for (d = 0; d < a; d++) b[c + d] = g[e + d];
          return a;
        }, write(a, b, c, d, e, g) {
          b.buffer === m.buffer && (g = false);
          if (!d) return 0;
          a = a.node;
          a.mtime = a.ctime = Date.now();
          if (b.subarray && (!a.Na || a.Na.subarray)) {
            if (g) return a.Na = b.subarray(c, c + d), a.Ra = d;
            if (0 === a.Ra && 0 === e) return a.Na = b.slice(c, c + d), a.Ra = d;
            if (e + d <= a.Ra) return a.Na.set(b.subarray(c, c + d), e), d;
          }
          g = e + d;
          var h = a.Na ? a.Na.length : 0;
          h >= g || (g = Math.max(g, h * (1048576 > h ? 2 : 1.125) >>> 0), 0 != h && (g = Math.max(g, 256)), h = a.Na, a.Na = new Uint8Array(g), 0 < a.Ra && a.Na.set(h.subarray(0, a.Ra), 0));
          if (a.Na.subarray && b.subarray) a.Na.set(b.subarray(c, c + d), e);
          else for (g = 0; g < d; g++) a.Na[e + g] = b[c + g];
          a.Ra = Math.max(a.Ra, e + d);
          return d;
        }, Va(a, b, c) {
          1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Ra);
          if (0 > b) throw new N(28);
          return b;
        }, ib(a, b, c, d, e) {
          if (32768 !== (a.node.mode & 61440)) throw new N(43);
          a = a.node.Na;
          if (e & 2 || !a || a.buffer !== m.buffer) {
            e = true;
            d = 65536 * Math.ceil(b / 65536);
            var g = Bb(65536, d);
            g && C2.fill(0, g, g + d);
            d = g;
            if (!d) throw new N(48);
            if (a) {
              if (0 < c || c + b < a.length) a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
              m.set(a, d);
            }
          } else e = false, d = a.byteOffset;
          return { Kb: d, Ab: e };
        }, jb(a, b, c, d) {
          O.Ma.write(a, b, 0, d, c, false);
          return 0;
        } } }, ja = (a, b) => {
          var c = 0;
          a && (c |= 365);
          b && (c |= 146);
          return c;
        }, Cb = null, Db = {}, Eb = [], Fb = 1, R = null, Gb = false, Hb = true, Ib = {}, N = class {
          name = "ErrnoError";
          constructor(a) {
            this.Pa = a;
          }
        }, Jb = class {
          gb = {};
          node = null;
          get flags() {
            return this.gb.flags;
          }
          set flags(a) {
            this.gb.flags = a;
          }
          get position() {
            return this.gb.position;
          }
          set position(a) {
            this.gb.position = a;
          }
        }, Kb = class {
          La = {};
          Ma = {};
          ab = null;
          constructor(a, b, c, d) {
            a ||= this;
            this.parent = a;
            this.Xa = a.Xa;
            this.id = Fb++;
            this.name = b;
            this.mode = c;
            this.rdev = d;
            this.atime = this.mtime = this.ctime = Date.now();
          }
          get read() {
            return 365 === (this.mode & 365);
          }
          set read(a) {
            a ? this.mode |= 365 : this.mode &= -366;
          }
          get write() {
            return 146 === (this.mode & 146);
          }
          set write(a) {
            a ? this.mode |= 146 : this.mode &= -147;
          }
        };
        function S(a, b = {}) {
          if (!a) throw new N(44);
          b.ob ?? (b.ob = true);
          "/" === a.charAt(0) || (a = "//" + a);
          var c = 0;
          a: for (; 40 > c; c++) {
            a = a.split("/").filter((q) => !!q);
            for (var d = Cb, e = "/", g = 0; g < a.length; g++) {
              var h = g === a.length - 1;
              if (h && b.parent) break;
              if ("." !== a[g]) if (".." === a[g]) if (e = bb(e), d === d.parent) {
                a = e + "/" + a.slice(g + 1).join("/");
                c--;
                continue a;
              } else d = d.parent;
              else {
                e = ia(e + "/" + a[g]);
                try {
                  d = Q(d, a[g]);
                } catch (q) {
                  if (44 === q?.Pa && h && b.Jb) return { path: e };
                  throw q;
                }
                !d.ab || h && !b.ob || (d = d.ab.root);
                if (40960 === (d.mode & 61440) && (!h || b.$a)) {
                  if (!d.La.readlink) throw new N(52);
                  d = d.La.readlink(d);
                  "/" === d.charAt(0) || (d = bb(e) + "/" + d);
                  a = d + "/" + a.slice(g + 1).join("/");
                  continue a;
                }
              }
            }
            return { path: e, node: d };
          }
          throw new N(32);
        }
        function ha(a) {
          for (var b; ; ) {
            if (a === a.parent) return a = a.Xa.zb, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
            b = b ? `${a.name}/${b}` : a.name;
            a = a.parent;
          }
        }
        function Lb(a, b) {
          for (var c = 0, d = 0; d < b.length; d++) c = (c << 5) - c + b.charCodeAt(d) | 0;
          return (a + c >>> 0) % R.length;
        }
        function Ab(a) {
          var b = Lb(a.parent.id, a.name);
          if (R[b] === a) R[b] = a.bb;
          else for (b = R[b]; b; ) {
            if (b.bb === a) {
              b.bb = a.bb;
              break;
            }
            b = b.bb;
          }
        }
        function Q(a, b) {
          var c = P(a.mode) ? (c = Mb(a, "x")) ? c : a.La.lookup ? 0 : 2 : 54;
          if (c) throw new N(c);
          for (c = R[Lb(a.id, b)]; c; c = c.bb) {
            var d = c.name;
            if (c.parent.id === a.id && d === b) return c;
          }
          return a.La.lookup(a, b);
        }
        function zb(a, b, c, d) {
          a = new Kb(a, b, c, d);
          b = Lb(a.parent.id, a.name);
          a.bb = R[b];
          return R[b] = a;
        }
        function P(a) {
          return 16384 === (a & 61440);
        }
        function Nb(a) {
          var b = ["r", "w", "rw"][a & 3];
          a & 512 && (b += "w");
          return b;
        }
        function Mb(a, b) {
          if (Hb) return 0;
          if (!b.includes("r") || a.mode & 292) {
            if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) return 2;
          } else return 2;
          return 0;
        }
        function Ob(a, b) {
          if (!P(a.mode)) return 54;
          try {
            return Q(a, b), 20;
          } catch (c) {
          }
          return Mb(a, "wx");
        }
        function Pb(a, b, c) {
          try {
            var d = Q(a, b);
          } catch (e) {
            return e.Pa;
          }
          if (a = Mb(a, "wx")) return a;
          if (c) {
            if (!P(d.mode)) return 54;
            if (d === d.parent || "/" === ha(d)) return 10;
          } else if (P(d.mode)) return 31;
          return 0;
        }
        function Qb(a) {
          if (!a) throw new N(63);
          return a;
        }
        function T(a) {
          a = Eb[a];
          if (!a) throw new N(8);
          return a;
        }
        function Rb(a, b = -1) {
          a = Object.assign(new Jb(), a);
          if (-1 == b) a: {
            for (b = 0; 4096 >= b; b++) if (!Eb[b]) break a;
            throw new N(33);
          }
          a.fd = b;
          return Eb[b] = a;
        }
        function Sb(a, b = -1) {
          a = Rb(a, b);
          a.Ma?.Rb?.(a);
          return a;
        }
        function Tb(a, b, c) {
          var d = a?.Ma.Ua;
          a = d ? a : b;
          d ??= b.La.Ua;
          Qb(d);
          d(a, c);
        }
        var yb = { open(a) {
          a.Ma = Db[a.node.rdev].Ma;
          a.Ma.open?.(a);
        }, Va() {
          throw new N(70);
        } };
        function mb(a, b) {
          Db[a] = { Ma: b };
        }
        function Ub(a, b) {
          var c = "/" === b;
          if (c && Cb) throw new N(10);
          if (!c && b) {
            var d = S(b, { ob: false });
            b = d.path;
            d = d.node;
            if (d.ab) throw new N(10);
            if (!P(d.mode)) throw new N(54);
          }
          b = { type: a, Wb: {}, zb: b, Ib: [] };
          a = a.Xa(b);
          a.Xa = b;
          b.root = a;
          c ? Cb = a : d && (d.ab = b, d.Xa && d.Xa.Ib.push(b));
        }
        function Vb(a, b, c) {
          var d = S(a, { parent: true }).node;
          a = cb(a);
          if (!a) throw new N(28);
          if ("." === a || ".." === a) throw new N(20);
          var e = Ob(d, a);
          if (e) throw new N(e);
          if (!d.La.hb) throw new N(63);
          return d.La.hb(d, a, b, c);
        }
        function ka(a, b = 438) {
          return Vb(a, b & 4095 | 32768, 0);
        }
        function U(a, b = 511) {
          return Vb(a, b & 1023 | 16384, 0);
        }
        function Wb(a, b, c) {
          "undefined" == typeof c && (c = b, b = 438);
          Vb(a, b | 8192, c);
        }
        function Xb(a, b) {
          if (!fb(a)) throw new N(44);
          var c = S(b, { parent: true }).node;
          if (!c) throw new N(44);
          b = cb(b);
          var d = Ob(c, b);
          if (d) throw new N(d);
          if (!c.La.symlink) throw new N(63);
          c.La.symlink(c, b, a);
        }
        function Yb(a) {
          var b = S(a, { parent: true }).node;
          a = cb(a);
          var c = Q(b, a), d = Pb(b, a, true);
          if (d) throw new N(d);
          if (!b.La.rmdir) throw new N(63);
          if (c.ab) throw new N(10);
          b.La.rmdir(b, a);
          Ab(c);
        }
        function ua(a) {
          var b = S(a, { parent: true }).node;
          if (!b) throw new N(44);
          a = cb(a);
          var c = Q(b, a), d = Pb(b, a, false);
          if (d) throw new N(d);
          if (!b.La.unlink) throw new N(63);
          if (c.ab) throw new N(10);
          b.La.unlink(b, a);
          Ab(c);
        }
        function Zb(a, b) {
          a = S(a, { $a: !b }).node;
          return Qb(a.La.Ta)(a);
        }
        function $b(a, b, c, d) {
          Tb(a, b, { mode: c & 4095 | b.mode & -4096, ctime: Date.now(), Fb: d });
        }
        function la(a, b) {
          a = "string" == typeof a ? S(a, { $a: true }).node : a;
          $b(null, a, b);
        }
        function ac(a, b, c) {
          if (P(b.mode)) throw new N(31);
          if (32768 !== (b.mode & 61440)) throw new N(28);
          var d = Mb(b, "w");
          if (d) throw new N(d);
          Tb(a, b, { size: c, timestamp: Date.now() });
        }
        function ma(a, b, c = 438) {
          if ("" === a) throw new N(44);
          if ("string" == typeof b) {
            var d = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
            if ("undefined" == typeof d) throw Error(`Unknown file open mode: ${b}`);
            b = d;
          }
          c = b & 64 ? c & 4095 | 32768 : 0;
          if ("object" == typeof a) d = a;
          else {
            var e = a.endsWith("/");
            a = S(a, { $a: !(b & 131072), Jb: true });
            d = a.node;
            a = a.path;
          }
          var g = false;
          if (b & 64) if (d) {
            if (b & 128) throw new N(20);
          } else {
            if (e) throw new N(31);
            d = Vb(a, c | 511, 0);
            g = true;
          }
          if (!d) throw new N(44);
          8192 === (d.mode & 61440) && (b &= -513);
          if (b & 65536 && !P(d.mode)) throw new N(54);
          if (!g && (e = d ? 40960 === (d.mode & 61440) ? 32 : P(d.mode) && ("r" !== Nb(b) || b & 576) ? 31 : Mb(d, Nb(b)) : 44)) throw new N(e);
          b & 512 && !g && (e = d, e = "string" == typeof e ? S(e, { $a: true }).node : e, ac(null, e, 0));
          b &= -131713;
          e = Rb({ node: d, path: ha(d), flags: b, seekable: true, position: 0, Ma: d.Ma, Lb: [], error: false });
          e.Ma.open && e.Ma.open(e);
          g && la(d, c & 511);
          !k.logReadFiles || b & 1 || a in Ib || (Ib[a] = 1);
          return e;
        }
        function oa(a) {
          if (null === a.fd) throw new N(8);
          a.pb && (a.pb = null);
          try {
            a.Ma.close && a.Ma.close(a);
          } catch (b) {
            throw b;
          } finally {
            Eb[a.fd] = null;
          }
          a.fd = null;
        }
        function bc(a, b, c) {
          if (null === a.fd) throw new N(8);
          if (!a.seekable || !a.Ma.Va) throw new N(70);
          if (0 != c && 1 != c && 2 != c) throw new N(28);
          a.position = a.Ma.Va(a, b, c);
          a.Lb = [];
        }
        function cc(a, b, c, d, e) {
          if (0 > d || 0 > e) throw new N(28);
          if (null === a.fd) throw new N(8);
          if (1 === (a.flags & 2097155)) throw new N(8);
          if (P(a.node.mode)) throw new N(31);
          if (!a.Ma.read) throw new N(28);
          var g = "undefined" != typeof e;
          if (!g) e = a.position;
          else if (!a.seekable) throw new N(70);
          b = a.Ma.read(a, b, c, d, e);
          g || (a.position += b);
          return b;
        }
        function na(a, b, c, d, e) {
          if (0 > d || 0 > e) throw new N(28);
          if (null === a.fd) throw new N(8);
          if (0 === (a.flags & 2097155)) throw new N(8);
          if (P(a.node.mode)) throw new N(31);
          if (!a.Ma.write) throw new N(28);
          a.seekable && a.flags & 1024 && bc(a, 0, 2);
          var g = "undefined" != typeof e;
          if (!g) e = a.position;
          else if (!a.seekable) throw new N(70);
          b = a.Ma.write(a, b, c, d, e, void 0);
          g || (a.position += b);
          return b;
        }
        function ta(a) {
          var b = b || 0;
          var c = "binary";
          "utf8" !== c && "binary" !== c && Ma(`Invalid encoding type "${c}"`);
          b = ma(a, b);
          a = Zb(a).size;
          var d = new Uint8Array(a);
          cc(b, d, 0, a, 0);
          "utf8" === c && (d = gb(d));
          oa(b);
          return d;
        }
        function W(a, b, c) {
          a = ia("/dev/" + a);
          var d = ja(!!b, !!c);
          W.yb ?? (W.yb = 64);
          var e = W.yb++ << 8 | 0;
          mb(e, { open(g) {
            g.seekable = false;
          }, close() {
            c?.buffer?.length && c(10);
          }, read(g, h, q, w) {
            for (var t = 0, x = 0; x < w; x++) {
              try {
                var D = b();
              } catch (pb) {
                throw new N(29);
              }
              if (void 0 === D && 0 === t) throw new N(6);
              if (null === D || void 0 === D) break;
              t++;
              h[q + x] = D;
            }
            t && (g.node.atime = Date.now());
            return t;
          }, write(g, h, q, w) {
            for (var t = 0; t < w; t++) try {
              c(h[q + t]);
            } catch (x) {
              throw new N(29);
            }
            w && (g.node.mtime = g.node.ctime = Date.now());
            return t;
          } });
          Wb(a, d, e);
        }
        var X = {};
        function Y(a, b, c) {
          if ("/" === b.charAt(0)) return b;
          a = -100 === a ? "/" : T(a).path;
          if (0 == b.length) {
            if (!c) throw new N(44);
            return a;
          }
          return a + "/" + b;
        }
        function mc(a, b) {
          F[a >> 2] = b.dev;
          F[a + 4 >> 2] = b.mode;
          F[a + 8 >> 2] = b.nlink;
          F[a + 12 >> 2] = b.uid;
          F[a + 16 >> 2] = b.gid;
          F[a + 20 >> 2] = b.rdev;
          G[a + 24 >> 3] = BigInt(b.size);
          E[a + 32 >> 2] = 4096;
          E[a + 36 >> 2] = b.blocks;
          var c = b.atime.getTime(), d = b.mtime.getTime(), e = b.ctime.getTime();
          G[a + 40 >> 3] = BigInt(Math.floor(c / 1e3));
          F[a + 48 >> 2] = c % 1e3 * 1e6;
          G[a + 56 >> 3] = BigInt(Math.floor(d / 1e3));
          F[a + 64 >> 2] = d % 1e3 * 1e6;
          G[a + 72 >> 3] = BigInt(Math.floor(e / 1e3));
          F[a + 80 >> 2] = e % 1e3 * 1e6;
          G[a + 88 >> 3] = BigInt(b.ino);
          return 0;
        }
        var Ec = void 0, Gc = () => {
          var a = E[+Ec >> 2];
          Ec += 4;
          return a;
        }, Hc = 0, Ic = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Jc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Kc = {}, Lc = (a) => {
          Ga = a;
          Ya || 0 < Hc || (k.onExit?.(a), Fa = true);
          xa(a, new Sa(a));
        }, Mc = (a) => {
          if (!Fa) try {
            a();
          } catch (b) {
            b instanceof Sa || "unwind" == b || xa(1, b);
          } finally {
            if (!(Ya || 0 < Hc)) try {
              Ga = a = Ga, Lc(a);
            } catch (b) {
              b instanceof Sa || "unwind" == b || xa(1, b);
            }
          }
        }, Nc = {}, Pc = () => {
          if (!Oc) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: wa || "./this.program" }, b;
            for (b in Nc) void 0 === Nc[b] ? delete a[b] : a[b] = Nc[b];
            var c = [];
            for (b in a) c.push(`${b}=${a[b]}`);
            Oc = c;
          }
          return Oc;
        }, Oc, Qc = (a, b, c, d) => {
          var e = { string: (t) => {
            var x = 0;
            if (null !== t && void 0 !== t && 0 !== t) {
              x = ib(t) + 1;
              var D = y(x);
              M(t, C2, D, x);
              x = D;
            }
            return x;
          }, array: (t) => {
            var x = y(t.length);
            m.set(t, x);
            return x;
          } };
          a = k["_" + a];
          var g = [], h = 0;
          if (d) for (var q = 0; q < d.length; q++) {
            var w = e[c[q]];
            w ? (0 === h && (h = pa()), g[q] = w(d[q])) : g[q] = d[q];
          }
          c = a(...g);
          return c = (function(t) {
            0 !== h && ra(h);
            return "string" === b ? z(t) : "boolean" === b ? !!t : t;
          })(c);
        }, fa = (a) => {
          var b = ib(a) + 1, c = da(b);
          c && M(a, C2, c, b);
          return c;
        }, Rc, Sc = [], A = (a) => {
          Rc.delete(Z.get(a));
          Z.set(a, null);
          Sc.push(a);
        }, Tc = (a) => {
          const b = a.length;
          return [b % 128 | 128, b >> 7, ...a];
        }, Uc = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 }, Vc = (a) => Tc(Array.from(a, (b) => Uc[b])), va = (a, b) => {
          if (!Rc) {
            Rc = /* @__PURE__ */ new WeakMap();
            var c = Z.length;
            if (Rc) for (var d = 0; d < 0 + c; d++) {
              var e = Z.get(d);
              e && Rc.set(e, d);
            }
          }
          if (c = Rc.get(a) || 0) return c;
          c = Sc.length ? Sc.pop() : Z.grow(1);
          try {
            Z.set(c, a);
          } catch (g) {
            if (!(g instanceof TypeError)) throw g;
            b = Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0, 1, ...Tc([1, 96, ...Vc(b.slice(1)), ...Vc("v" === b[0] ? "" : b[0])]), 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
            b = new WebAssembly.Module(b);
            b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
            Z.set(c, b);
          }
          Rc.set(a, c);
          return c;
        };
        R = Array(4096);
        Ub(O, "/");
        U("/tmp");
        U("/home");
        U("/home/web_user");
        (function() {
          U("/dev");
          mb(259, { read: () => 0, write: (d, e, g, h) => h, Va: () => 0 });
          Wb("/dev/null", 259);
          kb(1280, wb);
          kb(1536, xb);
          Wb("/dev/tty", 1280);
          Wb("/dev/tty1", 1536);
          var a = new Uint8Array(1024), b = 0, c = () => {
            0 === b && (eb(a), b = a.byteLength);
            return a[--b];
          };
          W("random", c);
          W("urandom", c);
          U("/dev/shm");
          U("/dev/shm/tmp");
        })();
        (function() {
          U("/proc");
          var a = U("/proc/self");
          U("/proc/self/fd");
          Ub({ Xa() {
            var b = zb(a, "fd", 16895, 73);
            b.Ma = { Va: O.Ma.Va };
            b.La = { lookup(c, d) {
              c = +d;
              var e = T(c);
              c = { parent: null, Xa: { zb: "fake" }, La: { readlink: () => e.path }, id: c + 1 };
              return c.parent = c;
            }, readdir() {
              return Array.from(Eb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
            } };
            return b;
          } }, "/proc/self/fd");
        })();
        k.noExitRuntime && (Ya = k.noExitRuntime);
        k.print && (Da = k.print);
        k.printErr && (B = k.printErr);
        k.wasmBinary && (Ea = k.wasmBinary);
        k.thisProgram && (wa = k.thisProgram);
        if (k.preInit) for ("function" == typeof k.preInit && (k.preInit = [k.preInit]); 0 < k.preInit.length; ) k.preInit.shift()();
        k.stackSave = () => pa();
        k.stackRestore = (a) => ra(a);
        k.stackAlloc = (a) => y(a);
        k.cwrap = (a, b, c, d) => {
          var e = !c || c.every((g) => "number" === g || "boolean" === g);
          return "string" !== b && e && !d ? k["_" + a] : (...g) => Qc(a, b, c, g);
        };
        k.addFunction = va;
        k.removeFunction = A;
        k.UTF8ToString = z;
        k.stringToNewUTF8 = fa;
        k.writeArrayToMemory = (a, b) => {
          m.set(a, b);
        };
        var da, ea, Bb, Wc, ra, y, pa, La, Z, Xc = {
          a: (a, b, c, d) => Ma(`Assertion failed: ${z(a)}, at: ` + [b ? z(b) : "unknown filename", c, d ? z(d) : "unknown function"]),
          i: function(a, b) {
            try {
              return a = z(a), la(a, b), 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          L: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b);
              if (c & -8) return -28;
              var d = S(b, { $a: true }).node;
              if (!d) return -44;
              a = "";
              c & 4 && (a += "r");
              c & 2 && (a += "w");
              c & 1 && (a += "x");
              return a && Mb(d, a) ? -2 : 0;
            } catch (e) {
              if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
              return -e.Pa;
            }
          },
          j: function(a, b) {
            try {
              var c = T(a);
              $b(c, c.node, b, false);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          h: function(a) {
            try {
              var b = T(a);
              Tb(b, b.node, { timestamp: Date.now(), Fb: false });
              return 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          b: function(a, b, c) {
            Ec = c;
            try {
              var d = T(a);
              switch (b) {
                case 0:
                  var e = Gc();
                  if (0 > e) break;
                  for (; Eb[e]; ) e++;
                  return Sb(d, e).fd;
                case 1:
                case 2:
                  return 0;
                case 3:
                  return d.flags;
                case 4:
                  return e = Gc(), d.flags |= e, 0;
                case 12:
                  return e = Gc(), Ha[e + 0 >> 1] = 2, 0;
                case 13:
                case 14:
                  return 0;
              }
              return -28;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          g: function(a, b) {
            try {
              var c = T(a), d = c.node, e = c.Ma.Ta;
              a = e ? c : d;
              e ??= d.La.Ta;
              Qb(e);
              var g = e(a);
              return mc(b, g);
            } catch (h) {
              if ("undefined" == typeof X || "ErrnoError" !== h.name) throw h;
              return -h.Pa;
            }
          },
          H: function(a, b) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return -61;
              var c = T(a);
              if (0 > b || 0 === (c.flags & 2097155)) throw new N(28);
              ac(c, c.node, b);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          G: function(a, b) {
            try {
              if (0 === b) return -28;
              var c = ib("/") + 1;
              if (b < c) return -68;
              M("/", C2, a, b);
              return c;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          K: function(a, b) {
            try {
              return a = z(a), mc(b, Zb(a, true));
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          C: function(a, b, c) {
            try {
              return b = z(b), b = Y(a, b), U(b, c), 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          J: function(a, b, c, d) {
            try {
              b = z(b);
              var e = d & 256;
              b = Y(a, b, d & 4096);
              return mc(c, e ? Zb(b, true) : Zb(b));
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          x: function(a, b, c, d) {
            Ec = d;
            try {
              b = z(b);
              b = Y(a, b);
              var e = d ? Gc() : 0;
              return ma(b, c, e).fd;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          v: function(a, b, c, d) {
            try {
              b = z(b);
              b = Y(a, b);
              if (0 >= d) return -28;
              var e = S(b).node;
              if (!e) throw new N(44);
              if (!e.La.readlink) throw new N(28);
              var g = e.La.readlink(e);
              var h = Math.min(d, ib(g)), q = m[c + h];
              M(
                g,
                C2,
                c,
                d + 1
              );
              m[c + h] = q;
              return h;
            } catch (w) {
              if ("undefined" == typeof X || "ErrnoError" !== w.name) throw w;
              return -w.Pa;
            }
          },
          u: function(a) {
            try {
              return a = z(a), Yb(a), 0;
            } catch (b) {
              if ("undefined" == typeof X || "ErrnoError" !== b.name) throw b;
              return -b.Pa;
            }
          },
          f: function(a, b) {
            try {
              return a = z(a), mc(b, Zb(a));
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          r: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b);
              if (c) if (512 === c) Yb(b);
              else return -28;
              else ua(b);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          q: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b, true);
              var d = Date.now(), e, g;
              if (c) {
                var h = F[c >> 2] + 4294967296 * E[c + 4 >> 2], q = E[c + 8 >> 2];
                1073741823 == q ? e = d : 1073741822 == q ? e = null : e = 1e3 * h + q / 1e6;
                c += 16;
                h = F[c >> 2] + 4294967296 * E[c + 4 >> 2];
                q = E[c + 8 >> 2];
                1073741823 == q ? g = d : 1073741822 == q ? g = null : g = 1e3 * h + q / 1e6;
              } else g = e = d;
              if (null !== (g ?? e)) {
                a = e;
                var w = S(b, { $a: true }).node;
                Qb(w.La.Ua)(w, { atime: a, mtime: g });
              }
              return 0;
            } catch (t) {
              if ("undefined" == typeof X || "ErrnoError" !== t.name) throw t;
              return -t.Pa;
            }
          },
          m: () => Ma(""),
          l: () => {
            Ya = false;
            Hc = 0;
          },
          A: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            a = new Date(1e3 * a);
            E[b >> 2] = a.getSeconds();
            E[b + 4 >> 2] = a.getMinutes();
            E[b + 8 >> 2] = a.getHours();
            E[b + 12 >> 2] = a.getDate();
            E[b + 16 >> 2] = a.getMonth();
            E[b + 20 >> 2] = a.getFullYear() - 1900;
            E[b + 24 >> 2] = a.getDay();
            var c = a.getFullYear();
            E[b + 28 >> 2] = (0 !== c % 4 || 0 === c % 100 && 0 !== c % 400 ? Jc : Ic)[a.getMonth()] + a.getDate() - 1 | 0;
            E[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
            c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            E[b + 32 >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
          },
          y: function(a, b, c, d, e, g, h) {
            e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e);
            try {
              var q = T(d);
              if (0 !== (b & 2) && 0 === (c & 2) && 2 !== (q.flags & 2097155)) throw new N(2);
              if (1 === (q.flags & 2097155)) throw new N(2);
              if (!q.Ma.ib) throw new N(43);
              if (!a) throw new N(28);
              var w = q.Ma.ib(q, a, e, b, c);
              var t = w.Kb;
              E[g >> 2] = w.Ab;
              F[h >> 2] = t;
              return 0;
            } catch (x) {
              if ("undefined" == typeof X || "ErrnoError" !== x.name) throw x;
              return -x.Pa;
            }
          },
          z: function(a, b, c, d, e, g) {
            g = -9007199254740992 > g || 9007199254740992 < g ? NaN : Number(g);
            try {
              var h = T(e);
              if (c & 2) {
                c = g;
                if (32768 !== (h.node.mode & 61440)) throw new N(43);
                if (!(d & 2)) {
                  var q = C2.slice(a, a + b);
                  h.Ma.jb && h.Ma.jb(h, q, c, b, d);
                }
              }
            } catch (w) {
              if ("undefined" == typeof X || "ErrnoError" !== w.name) throw w;
              return -w.Pa;
            }
          },
          n: (a, b) => {
            Kc[a] && (clearTimeout(Kc[a].id), delete Kc[a]);
            if (!b) return 0;
            var c = setTimeout(() => {
              delete Kc[a];
              Mc(() => Wc(a, performance.now()));
            }, b);
            Kc[a] = { id: c, Xb: b };
            return 0;
          },
          B: (a, b, c, d) => {
            var e = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(e, 0, 1).getTimezoneOffset();
            e = new Date(e, 6, 1).getTimezoneOffset();
            F[a >> 2] = 60 * Math.max(g, e);
            E[b >> 2] = Number(g != e);
            b = (h) => {
              var q = Math.abs(h);
              return `UTC${0 <= h ? "-" : "+"}${String(Math.floor(q / 60)).padStart(2, "0")}${String(q % 60).padStart(2, "0")}`;
            };
            a = b(g);
            b = b(e);
            e < g ? (M(a, C2, c, 17), M(b, C2, d, 17)) : (M(a, C2, d, 17), M(b, C2, c, 17));
          },
          d: () => Date.now(),
          s: () => 2147483648,
          c: () => performance.now(),
          o: (a) => {
            var b = C2.length;
            a >>>= 0;
            if (2147483648 < a) return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              a: {
                d = (Math.min(2147483648, 65536 * Math.ceil(Math.max(
                  a,
                  d
                ) / 65536)) - La.buffer.byteLength + 65535) / 65536 | 0;
                try {
                  La.grow(d);
                  Ka();
                  var e = 1;
                  break a;
                } catch (g) {
                }
                e = void 0;
              }
              if (e) return true;
            }
            return false;
          },
          E: (a, b) => {
            var c = 0, d = 0, e;
            for (e of Pc()) {
              var g = b + c;
              F[a + d >> 2] = g;
              c += M(e, C2, g, Infinity) + 1;
              d += 4;
            }
            return 0;
          },
          F: (a, b) => {
            var c = Pc();
            F[a >> 2] = c.length;
            a = 0;
            for (var d of c) a += ib(d) + 1;
            F[b >> 2] = a;
            return 0;
          },
          e: function(a) {
            try {
              var b = T(a);
              oa(b);
              return 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          },
          p: function(a, b) {
            try {
              var c = T(a);
              m[b] = c.tty ? 2 : P(c.mode) ? 3 : 40960 === (c.mode & 61440) ? 7 : 4;
              Ha[b + 2 >> 1] = 0;
              G[b + 8 >> 3] = BigInt(0);
              G[b + 16 >> 3] = BigInt(0);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return d.Pa;
            }
          },
          w: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var g, h = b = 0; h < c; h++) {
                  var q = F[a >> 2], w = F[a + 4 >> 2];
                  a += 8;
                  var t = cc(e, m, q, w, g);
                  if (0 > t) {
                    var x = -1;
                    break a;
                  }
                  b += t;
                  if (t < w) break;
                  "undefined" != typeof g && (g += t);
                }
                x = b;
              }
              F[d >> 2] = x;
              return 0;
            } catch (D) {
              if ("undefined" == typeof X || "ErrnoError" !== D.name) throw D;
              return D.Pa;
            }
          },
          D: function(a, b, c, d) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return 61;
              var e = T(a);
              bc(e, b, c);
              G[d >> 3] = BigInt(e.position);
              e.pb && 0 === b && 0 === c && (e.pb = null);
              return 0;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return g.Pa;
            }
          },
          I: function(a) {
            try {
              var b = T(a);
              return b.Ma?.fsync?.(b);
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          },
          t: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var g, h = b = 0; h < c; h++) {
                  var q = F[a >> 2], w = F[a + 4 >> 2];
                  a += 8;
                  var t = na(e, m, q, w, g);
                  if (0 > t) {
                    var x = -1;
                    break a;
                  }
                  b += t;
                  if (t < w) break;
                  "undefined" != typeof g && (g += t);
                }
                x = b;
              }
              F[d >> 2] = x;
              return 0;
            } catch (D) {
              if ("undefined" == typeof X || "ErrnoError" !== D.name) throw D;
              return D.Pa;
            }
          },
          k: Lc
        };
        function Yc() {
          function a() {
            k.calledRun = true;
            if (!Fa) {
              if (!k.noFSInit && !Gb) {
                var b, c;
                Gb = true;
                b ??= k.stdin;
                c ??= k.stdout;
                d ??= k.stderr;
                b ? W("stdin", b) : Xb("/dev/tty", "/dev/stdin");
                c ? W("stdout", null, c) : Xb("/dev/tty", "/dev/stdout");
                d ? W("stderr", null, d) : Xb("/dev/tty1", "/dev/stderr");
                ma("/dev/stdin", 0);
                ma("/dev/stdout", 1);
                ma("/dev/stderr", 1);
              }
              Zc.N();
              Hb = false;
              k.onRuntimeInitialized?.();
              if (k.postRun) for ("function" == typeof k.postRun && (k.postRun = [k.postRun]); k.postRun.length; ) {
                var d = k.postRun.shift();
                Ua.push(d);
              }
              Ta(Ua);
            }
          }
          if (0 < J) Xa = Yc;
          else {
            if (k.preRun) for ("function" == typeof k.preRun && (k.preRun = [k.preRun]); k.preRun.length; ) Wa();
            Ta(Va);
            0 < J ? Xa = Yc : k.setStatus ? (k.setStatus("Running..."), setTimeout(() => {
              setTimeout(() => k.setStatus(""), 1);
              a();
            }, 1)) : a();
          }
        }
        var Zc;
        (async function() {
          function a(c) {
            c = Zc = c.exports;
            k._sqlite3_free = c.P;
            k._sqlite3_value_text = c.Q;
            k._sqlite3_prepare_v2 = c.R;
            k._sqlite3_step = c.S;
            k._sqlite3_reset = c.T;
            k._sqlite3_exec = c.U;
            k._sqlite3_finalize = c.V;
            k._sqlite3_column_name = c.W;
            k._sqlite3_column_text = c.X;
            k._sqlite3_column_type = c.Y;
            k._sqlite3_errmsg = c.Z;
            k._sqlite3_clear_bindings = c._;
            k._sqlite3_value_blob = c.$;
            k._sqlite3_value_bytes = c.aa;
            k._sqlite3_value_double = c.ba;
            k._sqlite3_value_int = c.ca;
            k._sqlite3_value_type = c.da;
            k._sqlite3_result_blob = c.ea;
            k._sqlite3_result_double = c.fa;
            k._sqlite3_result_error = c.ga;
            k._sqlite3_result_int = c.ha;
            k._sqlite3_result_int64 = c.ia;
            k._sqlite3_result_null = c.ja;
            k._sqlite3_result_text = c.ka;
            k._sqlite3_aggregate_context = c.la;
            k._sqlite3_column_count = c.ma;
            k._sqlite3_data_count = c.na;
            k._sqlite3_column_blob = c.oa;
            k._sqlite3_column_bytes = c.pa;
            k._sqlite3_column_double = c.qa;
            k._sqlite3_bind_blob = c.ra;
            k._sqlite3_bind_double = c.sa;
            k._sqlite3_bind_int = c.ta;
            k._sqlite3_bind_text = c.ua;
            k._sqlite3_bind_parameter_index = c.va;
            k._sqlite3_sql = c.wa;
            k._sqlite3_normalized_sql = c.xa;
            k._sqlite3_changes = c.ya;
            k._sqlite3_close_v2 = c.za;
            k._sqlite3_create_function_v2 = c.Aa;
            k._sqlite3_update_hook = c.Ba;
            k._sqlite3_open = c.Ca;
            da = k._malloc = c.Da;
            ea = k._free = c.Ea;
            k._RegisterExtensionFunctions = c.Fa;
            Bb = c.Ga;
            Wc = c.Ha;
            ra = c.Ia;
            y = c.Ja;
            pa = c.Ka;
            La = c.M;
            Z = c.O;
            Ka();
            J--;
            k.monitorRunDependencies?.(J);
            0 == J && Xa && (c = Xa, Xa = null, c());
            return Zc;
          }
          J++;
          k.monitorRunDependencies?.(J);
          var b = { a: Xc };
          if (k.instantiateWasm) return new Promise((c) => {
            k.instantiateWasm(b, (d, e) => {
              c(a(d, e));
            });
          });
          Na ??= k.locateFile ? k.locateFile("sql-wasm.wasm", za) : za + "sql-wasm.wasm";
          return a((await Ra(b)).instance);
        })();
        Yc();
        return Module;
      });
      return initSqlJsPromise;
    };
    if (typeof exports2 === "object" && typeof module2 === "object") {
      module2.exports = initSqlJs2;
      module2.exports.default = initSqlJs2;
    } else if (typeof define === "function" && define["amd"]) {
      define([], function() {
        return initSqlJs2;
      });
    } else if (typeof exports2 === "object") {
      exports2["Module"] = initSqlJs2;
    }
  }
});

// index.js
var import_blessed7 = __toESM(require("blessed"), 1);
var import_blessed_contrib2 = __toESM(require("blessed-contrib"), 1);
var import_systeminformation = __toESM(require("systeminformation"), 1);
var import_child_process4 = require("child_process");
var import_util3 = require("util");
var import_https2 = __toESM(require("https"), 1);
var import_os13 = __toESM(require("os"), 1);
var import_fs22 = __toESM(require("fs"), 1);
var import_url11 = require("url");
var import_path20 = require("path");
init_logger();

// src/themes.js
init_logger();
var import_fs4 = __toESM(require("fs"), 1);
var import_child_process = require("child_process");
var import_os3 = __toESM(require("os"), 1);
var SETTINGS_PATH = process.env.HOME + "/.openclaw/dashboard-settings.json";
var THEME_KEY = "theme";
var themeChangeListeners = /* @__PURE__ */ new Set();
var systemThemeWatcher = null;
function detectMacOSAppearance() {
  try {
    const result = (0, import_child_process.execSync)(
      'defaults read -g AppleInterfaceStyle 2>/dev/null || echo "Light"',
      { encoding: "utf8", timeout: 1e3 }
    );
    const style = result.trim();
    return style === "Dark" ? "dark" : "light";
  } catch {
    return null;
  }
}
function detectLinuxAppearance() {
  try {
    const result = (0, import_child_process.execSync)(
      'gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null || echo "default"',
      { encoding: "utf8", timeout: 1e3 }
    );
    const scheme = result.trim().replace(/'/g, "");
    if (scheme === "prefer-dark") return "dark";
    if (scheme === "prefer-light") return "light";
    const themeResult = (0, import_child_process.execSync)(
      'gsettings get org.gnome.desktop.interface gtk-theme 2>/dev/null || echo ""',
      { encoding: "utf8", timeout: 1e3 }
    );
    const theme = themeResult.trim().toLowerCase();
    if (theme.includes("dark")) return "dark";
    if (theme.includes("light")) return "light";
    return null;
  } catch {
    return null;
  }
}
function detectFromEnvironment() {
  const colorFgBg = process.env.COLORFGBG;
  if (colorFgBg) {
    const parts = colorFgBg.split(";");
    if (parts.length >= 2) {
      const bgColor = parseInt(parts[1], 10);
      if (bgColor >= 0 && bgColor <= 7) return "dark";
      if (bgColor >= 8 && bgColor <= 15) return "light";
    }
  }
  if (process.env.DARK_MODE === "1" || process.env.THEME === "dark") {
    return "dark";
  }
  if (process.env.THEME === "light") {
    return "light";
  }
  return null;
}
function detectSystemTheme() {
  let theme = null;
  const platform = import_os3.default.platform();
  if (platform === "darwin") {
    theme = detectMacOSAppearance();
  } else if (platform === "linux") {
    theme = detectLinuxAppearance();
  }
  if (!theme) {
    theme = detectFromEnvironment();
  }
  if (!theme) {
    theme = detectTerminalBackground();
  }
  return theme;
}
function startSystemThemeWatcher(callback) {
  const platform = import_os3.default.platform();
  if (platform === "darwin") {
    return startMacOSThemeWatcher(callback);
  } else if (platform === "linux") {
    return startLinuxThemeWatcher(callback);
  }
  logger_default.debug("System theme watching not supported on this platform");
  return null;
}
function startMacOSThemeWatcher(callback) {
  let lastTheme = detectMacOSAppearance();
  const intervalId = setInterval(() => {
    const currentTheme = detectMacOSAppearance();
    if (currentTheme && currentTheme !== lastTheme) {
      logger_default.info(`System theme changed: ${lastTheme} -> ${currentTheme}`);
      lastTheme = currentTheme;
      callback(currentTheme);
    }
  }, 2e3);
  return {
    stop: () => {
      clearInterval(intervalId);
      logger_default.debug("macOS theme watcher stopped");
    }
  };
}
function startLinuxThemeWatcher(callback) {
  const dconfPath = process.env.DCONF_PROFILE ? `/etc/dconf/db/${process.env.DCONF_PROFILE}` : `${process.env.HOME}/.config/dconf/user`;
  let lastTheme = detectLinuxAppearance();
  let watcher = null;
  let intervalId = null;
  if (import_fs4.default.existsSync(dconfPath)) {
    try {
      watcher = import_fs4.default.watch(dconfPath, (eventType) => {
        if (eventType === "change") {
          const currentTheme = detectLinuxAppearance();
          if (currentTheme && currentTheme !== lastTheme) {
            logger_default.info(`System theme changed: ${lastTheme} -> ${currentTheme}`);
            lastTheme = currentTheme;
            callback(currentTheme);
          }
        }
      });
      logger_default.debug(`Linux theme watcher started via fs.watch on ${dconfPath}`);
    } catch (err) {
      logger_default.debug(`Failed to watch dconf file: ${err.message}, falling back to polling`);
      watcher = null;
    }
  }
  if (!watcher) {
    intervalId = setInterval(() => {
      const currentTheme = detectLinuxAppearance();
      if (currentTheme && currentTheme !== lastTheme) {
        logger_default.info(`System theme changed: ${lastTheme} -> ${currentTheme}`);
        lastTheme = currentTheme;
        callback(currentTheme);
      }
    }, 3e3);
  }
  return {
    stop: () => {
      if (watcher) {
        watcher.close();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      logger_default.debug("Linux theme watcher stopped");
    }
  };
}
function onThemeChange(callback) {
  themeChangeListeners.add(callback);
  return () => themeChangeListeners.delete(callback);
}
function notifyThemeChange(themeName) {
  themeChangeListeners.forEach((callback) => {
    try {
      callback(themeName);
    } catch (err) {
      logger_default.debug(`Theme change listener error: ${err.message}`);
    }
  });
}
function startAutoThemeDetection() {
  if (systemThemeWatcher) {
    systemThemeWatcher.stop();
    systemThemeWatcher = null;
  }
  if (currentThemeName !== "auto") {
    return null;
  }
  systemThemeWatcher = startSystemThemeWatcher((newTheme) => {
    detectedBackground = newTheme;
    notifyThemeChange("auto");
  });
  if (systemThemeWatcher) {
    logger_default.info("Auto theme detection started - watching for system theme changes");
  }
  return systemThemeWatcher;
}
function stopAutoThemeDetection() {
  if (systemThemeWatcher) {
    systemThemeWatcher.stop();
    systemThemeWatcher = null;
    logger_default.debug("Auto theme detection stopped");
  }
}
function detectTerminalBackground() {
  try {
    const termProgram = process.env.TERM_PROGRAM || "";
    const colorTerm = process.env.COLORTERM || "";
    const term = process.env.TERM || "";
    if (termProgram === "iTerm.app" || termProgram === "vscode") {
      if (termProgram === "iTerm.app") {
        try {
          const itermBg = (0, import_child_process.execSync)(
            `osascript -e 'tell app "System Events" to tell process "iTerm2" to get value of attribute "AXBackgroundColor" of window 1'`,
            { encoding: "utf8", timeout: 1e3 }
          );
          if (itermBg && itermBg.trim()) {
            const rgb = itermBg.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / (255 * 3);
              return brightness < 0.5 ? "dark" : "light";
            }
          }
        } catch {
        }
      }
      if (termProgram === "vscode") {
        return "dark";
      }
    }
    const lightTermIndicators = ["-light", "light"];
    const isLightTerm = lightTermIndicators.some(
      (ind) => term.toLowerCase().includes(ind) || colorTerm.toLowerCase().includes(ind)
    );
    if (isLightTerm) {
      return "light";
    }
    const darkTermIndicators = ["-256color", "dark", "truecolor"];
    const isDarkTerm = darkTermIndicators.some(
      (ind) => term.toLowerCase().includes(ind)
    ) || termProgram !== "";
    if (isDarkTerm) {
      return "dark";
    }
    if (process.env.TERM_SESSION_ID) {
      try {
        const profile = (0, import_child_process.execSync)(
          `osascript -e 'tell app "iTerm2" to tell current session of current window to get background color'`,
          { encoding: "utf8", timeout: 1e3 }
        );
        if (profile) {
          const rgb = profile.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / (255 * 3);
            return brightness < 0.5 ? "dark" : "light";
          }
        }
      } catch {
      }
    }
    if (termProgram === "Apple_Terminal") {
      try {
        const bgColor = (0, import_child_process.execSync)(
          `osascript -e 'tell app "Terminal" to get background color of window 1'`,
          { encoding: "utf8", timeout: 1e3 }
        );
        if (bgColor) {
          const rgb = bgColor.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / (255 * 3);
            return brightness < 0.5 ? "dark" : "light";
          }
        }
      } catch {
      }
    }
    return "dark";
  } catch (err) {
    logger_default.debug(`Background detection failed: ${err.message}`);
    return "dark";
  }
}
var themes = {
  default: {
    name: "Default",
    colors: {
      // Borders
      border: {
        sessions: "blue",
        logs: "cyan",
        cpu: "cyan",
        memory: "magenta",
        gpu: "yellow",
        network: "brightCyan",
        disk: "green",
        system: "gray",
        uptime: "brightMagenta",
        gateway: "cyan",
        help: "brightCyan",
        settings: "brightCyan",
        modal: "brightBlue"
      },
      // Text
      text: {
        primary: "white",
        secondary: "gray",
        bright: "brightWhite",
        header: "brightWhite"
      },
      // Status indicators
      status: {
        active: "green",
        idle: "yellow",
        stale: "gray",
        error: "red",
        warning: "yellow",
        success: "green"
      },
      // Gauges and values
      gauge: {
        low: "green",
        medium: "yellow",
        high: "red",
        critical: "brightRed"
      },
      // Charts
      chart: {
        line: "cyan",
        fill: "blue",
        grid: "gray"
      },
      // Alerts
      alert: {
        info: "cyan",
        warning: "yellow",
        error: "red",
        success: "green"
      },
      // Logo and title
      branding: {
        logo: "brightCyan",
        title: "brightWhite",
        clock: "brightCyan"
      },
      // Footer
      footer: {
        bg: "black",
        fg: "gray"
      }
    }
  },
  dark: {
    name: "Dark",
    colors: {
      // Borders - muted tones
      border: {
        sessions: "cyan",
        logs: "blue",
        cpu: "green",
        memory: "magenta",
        gpu: "yellow",
        network: "cyan",
        disk: "green",
        system: "gray",
        uptime: "magenta",
        gateway: "cyan",
        help: "cyan",
        settings: "cyan",
        modal: "cyan"
      },
      // Text
      text: {
        primary: "white",
        secondary: "black",
        bright: "brightWhite",
        header: "brightWhite"
      },
      // Status indicators
      status: {
        active: "green",
        idle: "yellow",
        stale: "black",
        error: "red",
        warning: "yellow",
        success: "green"
      },
      // Gauges and values
      gauge: {
        low: "green",
        medium: "yellow",
        high: "red",
        critical: "brightRed"
      },
      // Charts
      chart: {
        line: "green",
        fill: "cyan",
        grid: "black"
      },
      // Alerts
      alert: {
        info: "cyan",
        warning: "yellow",
        error: "red",
        success: "green"
      },
      // Logo and title
      branding: {
        logo: "green",
        title: "brightGreen",
        clock: "green"
      },
      // Footer
      footer: {
        bg: "black",
        fg: "green"
      }
    }
  },
  "high-contrast": {
    name: "High Contrast",
    colors: {
      // Borders - bright on black
      border: {
        sessions: "brightWhite",
        logs: "brightWhite",
        cpu: "brightWhite",
        memory: "brightWhite",
        gpu: "brightWhite",
        network: "brightWhite",
        disk: "brightWhite",
        system: "brightWhite",
        uptime: "brightWhite",
        gateway: "brightWhite",
        help: "brightWhite",
        settings: "brightWhite",
        modal: "brightWhite"
      },
      // Text
      text: {
        primary: "white",
        secondary: "brightWhite",
        bright: "brightWhite",
        header: "brightWhite"
      },
      // Status indicators
      status: {
        active: "brightGreen",
        idle: "brightYellow",
        stale: "brightWhite",
        error: "brightRed",
        warning: "brightYellow",
        success: "brightGreen"
      },
      // Gauges and values
      gauge: {
        low: "brightGreen",
        medium: "brightYellow",
        high: "brightRed",
        critical: "brightRed"
      },
      // Charts
      chart: {
        line: "brightWhite",
        fill: "brightWhite",
        grid: "brightWhite"
      },
      // Alerts
      alert: {
        info: "brightCyan",
        warning: "brightYellow",
        error: "brightRed",
        success: "brightGreen"
      },
      // Logo and title
      branding: {
        logo: "brightWhite",
        title: "brightWhite",
        clock: "brightWhite"
      },
      // Footer
      footer: {
        bg: "white",
        fg: "black"
      }
    }
  },
  ocean: {
    name: "Ocean",
    colors: {
      // Borders - ocean blues
      border: {
        sessions: "blue",
        logs: "cyan",
        cpu: "blue",
        memory: "cyan",
        gpu: "blue",
        network: "cyan",
        disk: "blue",
        system: "cyan",
        uptime: "blue",
        gateway: "cyan",
        help: "cyan",
        settings: "cyan",
        modal: "brightBlue"
      },
      // Text
      text: {
        primary: "white",
        secondary: "blue",
        bright: "brightWhite",
        header: "brightCyan"
      },
      // Status indicators
      status: {
        active: "cyan",
        idle: "blue",
        stale: "gray",
        error: "red",
        warning: "yellow",
        success: "green"
      },
      // Gauges and values
      gauge: {
        low: "cyan",
        medium: "blue",
        high: "yellow",
        critical: "red"
      },
      // Charts
      chart: {
        line: "cyan",
        fill: "blue",
        grid: "blue"
      },
      // Alerts
      alert: {
        info: "cyan",
        warning: "yellow",
        error: "red",
        success: "green"
      },
      // Logo and title
      branding: {
        logo: "cyan",
        title: "brightCyan",
        clock: "cyan"
      },
      // Footer
      footer: {
        bg: "blue",
        fg: "cyan"
      }
    }
  },
  // Auto-detect theme - resolves to dark or light based on terminal background
  auto: {
    name: "Auto-detect",
    isAuto: true,
    colors: null
    // Will be resolved dynamically
  }
};
var detectedBackground = null;
function getDetectedBackground() {
  if (!detectedBackground) {
    detectedBackground = detectSystemTheme();
    logger_default.info(`Theme background detected: ${detectedBackground}`);
  }
  return detectedBackground;
}
function resolveAutoTheme() {
  const background = getDetectedBackground();
  return background === "light" ? themes.default : themes.dark;
}
var currentThemeName = "default";
function getCurrentTheme() {
  if (currentThemeName === "auto") {
    return resolveAutoTheme();
  }
  return themes[currentThemeName] || themes.default;
}
function getThemeName() {
  return currentThemeName;
}
function getTheme(name) {
  if (name === "auto") {
    return themes.auto;
  }
  return themes[name] || null;
}
function getThemeNames() {
  return Object.keys(themes);
}
function setTheme(name) {
  if (!themes[name]) {
    logger_default.warn(`Theme '${name}' not found, keeping current theme`);
    return false;
  }
  currentThemeName = name;
  const displayName = name === "auto" ? `Auto-detect (${getDetectedBackground()})` : themes[name].name;
  logger_default.info(`Theme changed to: ${displayName}`);
  return true;
}
function cycleTheme() {
  const themeNames = Object.keys(themes);
  const currentIndex = themeNames.indexOf(currentThemeName);
  const nextIndex = (currentIndex + 1) % themeNames.length;
  currentThemeName = themeNames[nextIndex];
  const displayName = currentThemeName === "auto" ? `Auto-detect (${getDetectedBackground()})` : themes[currentThemeName].name;
  logger_default.info(`Theme cycled to: ${displayName}`);
  return currentThemeName;
}
function loadTheme() {
  try {
    const data = import_fs4.default.readFileSync(SETTINGS_PATH, "utf8");
    const settings = JSON.parse(data);
    if (settings[THEME_KEY] && themes[settings[THEME_KEY]]) {
      currentThemeName = settings[THEME_KEY];
      if (currentThemeName === "auto") {
        const bg = getDetectedBackground();
        logger_default.info(`Loaded theme: Auto-detect (${bg} background)`);
      } else {
        logger_default.info(`Loaded theme: ${themes[currentThemeName].name}`);
      }
    }
  } catch {
  }
}
function saveTheme() {
  try {
    let settings = {};
    try {
      const data = import_fs4.default.readFileSync(SETTINGS_PATH, "utf8");
      settings = JSON.parse(data);
    } catch {
    }
    settings[THEME_KEY] = currentThemeName;
    const dir = process.env.HOME + "/.openclaw";
    if (!import_fs4.default.existsSync(dir)) import_fs4.default.mkdirSync(dir, { recursive: true });
    import_fs4.default.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  } catch (err) {
    logger_default.warn(`Failed to save theme: ${err.message}`);
  }
}

// src/alerts.js
init_logger();
init_config();
var import_process = __toESM(require("process"), 1);
var DEFAULT_THRESHOLDS = {
  cpu: { warning: config_default.ALERT_THRESHOLDS.CPU.warning, critical: config_default.ALERT_THRESHOLDS.CPU.critical },
  memory: { warning: config_default.ALERT_THRESHOLDS.MEMORY.warning, critical: config_default.ALERT_THRESHOLDS.MEMORY.critical },
  disk: { warning: config_default.ALERT_THRESHOLDS.DISK.warning, critical: config_default.ALERT_THRESHOLDS.DISK.critical }
};
var AlertLevel = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
  CLEARED: "cleared"
};
var soundConfig = {
  enabled: false,
  soundType: "bell",
  // 'bell' = terminal bell, 'beep' = system beep
  warningEnabled: true,
  criticalEnabled: true
};
var alerts = [];
var thresholds = { ...DEFAULT_THRESHOLDS };
var alertHistory = [];
var MAX_HISTORY = config_default.MAX_ALERT_HISTORY;
var DEFAULT_RATE_LIMIT = config_default.ALERT_RATE_LIMIT;
var rateLimit = {
  enabled: config_default.ALERT_RATE_LIMIT.ENABLED,
  windowMs: config_default.ALERT_RATE_LIMIT.WINDOW_MS,
  maxAlerts: config_default.ALERT_RATE_LIMIT.MAX_ALERTS
};
var alertTimestamps = {};
function shouldRateLimitAlert(type) {
  if (!rateLimit.enabled) {
    return false;
  }
  const now = Date.now();
  const timestamps = alertTimestamps[type] || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < rateLimit.windowMs);
  if (validTimestamps.length >= rateLimit.maxAlerts) {
    logger_default.debug(`[RATE LIMIT] Alert for ${type} suppressed - rate limit exceeded (${validTimestamps.length}/${rateLimit.maxAlerts} in ${rateLimit.windowMs}ms)`);
    return true;
  }
  alertTimestamps[type] = validTimestamps;
  return false;
}
function recordAlertTimestamp(type) {
  if (!rateLimit.enabled) {
    return;
  }
  if (!alertTimestamps[type]) {
    alertTimestamps[type] = [];
  }
  alertTimestamps[type].push(Date.now());
}
function setRateLimit(config) {
  rateLimit = { ...rateLimit, ...config };
  logger_default.info(`Rate limiting updated: enabled=${rateLimit.enabled}, window=${rateLimit.windowMs}ms, max=${rateLimit.maxAlerts}`);
}
function getRateLimit() {
  return { ...rateLimit };
}
function resetRateLimit() {
  alertTimestamps = {};
  rateLimit = {
    enabled: config_default.ALERT_RATE_LIMIT.ENABLED,
    windowMs: config_default.ALERT_RATE_LIMIT.WINDOW_MS,
    maxAlerts: config_default.ALERT_RATE_LIMIT.MAX_ALERTS
  };
}
function createAlert(type, level, value, threshold) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    level,
    value,
    threshold,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    message: getAlertMessage(type, level, value, threshold),
    dismissed: false
  };
}
function getAlertMessage(type, level, value, threshold) {
  const typeNames = {
    cpu: "CPU usage",
    memory: "Memory usage",
    disk: "Disk usage"
  };
  const levelNames = {
    info: "Information",
    warning: "Warning",
    critical: "Critical",
    cleared: "Resolved"
  };
  if (level === AlertLevel.CLEARED) {
    return `${typeNames[type]} normalized (${value}% - was above ${threshold}%)`;
  }
  return `${levelNames[level]}: ${typeNames[type]} at ${value}% (threshold: ${threshold}%)`;
}
function checkThreshold(type, value) {
  if (!thresholds[type]) {
    logger_default.warn(`Unknown alert type: ${type}`);
    return null;
  }
  const { warning, critical } = thresholds[type];
  const existingAlert = alerts.find((a) => a.type === type && !a.dismissed);
  if (value >= critical) {
    if (!existingAlert || existingAlert.level !== AlertLevel.CRITICAL) {
      const rateLimitResult = thresholdRateLimiter.checkAndRecord(type, AlertLevel.CRITICAL);
      if (rateLimitResult.allowed) {
        const alert = createAlert(type, AlertLevel.CRITICAL, value, critical);
        addAlert(alert);
        return alert;
      }
    }
    if (existingAlert) {
      existingAlert.value = value;
      existingAlert.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    }
    return null;
  }
  if (value >= warning) {
    if (!existingAlert || existingAlert.level === AlertLevel.CLEARED) {
      const rateLimitResult = thresholdRateLimiter.checkAndRecord(type, AlertLevel.WARNING);
      if (rateLimitResult.allowed) {
        const alert = createAlert(type, AlertLevel.WARNING, value, warning);
        addAlert(alert);
        return alert;
      }
    }
    if (existingAlert) {
      existingAlert.value = value;
      existingAlert.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    }
    return null;
  }
  if (existingAlert) {
    const clearedAlert = createAlert(type, AlertLevel.CLEARED, value, existingAlert.threshold);
    dismissAlert(existingAlert.id);
    addAlert(clearedAlert);
    return clearedAlert;
  }
  return null;
}
function playAlertSound(level) {
  if (!soundConfig.enabled) {
    return;
  }
  if (level === AlertLevel.WARNING && !soundConfig.warningEnabled) {
    return;
  }
  if (level === AlertLevel.CRITICAL && !soundConfig.criticalEnabled) {
    return;
  }
  try {
    if (soundConfig.soundType === "bell") {
      import_process.default.stdout.write("\x07");
    } else if (soundConfig.soundType === "beep") {
      const count = level === AlertLevel.CRITICAL ? 3 : 1;
      import_process.default.stdout.write("\x07".repeat(count));
    }
  } catch (err) {
    logger_default.debug(`Failed to play sound: ${err.message}`);
  }
}
function setSoundConfig(config) {
  soundConfig = { ...soundConfig, ...config };
  logger_default.info(`Sound notifications: enabled=${soundConfig.enabled}, type=${soundConfig.soundType}`);
}
function getSoundConfig() {
  return { ...soundConfig };
}
function toggleSound(enabled) {
  soundConfig.enabled = enabled;
  logger_default.info(`Sound notifications ${enabled ? "enabled" : "disabled"}`);
}
function addAlert(alert) {
  alerts = alerts.filter((a) => a.type !== alert.type || a.dismissed);
  alerts.push(alert);
  alertHistory.push(alert);
  if (alertHistory.length > MAX_HISTORY) {
    alertHistory = alertHistory.slice(-MAX_HISTORY);
  }
  if (alert.level === AlertLevel.WARNING || alert.level === AlertLevel.CRITICAL) {
    playAlertSound(alert.level);
  }
  logger_default.info(`[ALERT] ${alert.message}`);
}
function dismissAlert(id) {
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.dismissed = true;
    alert.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  }
}
function getActiveAlerts() {
  return alerts.filter((a) => !a.dismissed);
}
function getAlertsByLevel(level) {
  return alerts.filter((a) => a.level === level && !a.dismissed);
}
function getAlertHistory() {
  return [...alertHistory];
}
function clearAllAlerts() {
  alerts.forEach((a) => a.dismissed = true);
}
function setThresholds(newThresholds) {
  if (newThresholds.cpu) {
    thresholds.cpu = { ...thresholds.cpu, ...newThresholds.cpu };
  }
  if (newThresholds.memory) {
    thresholds.memory = { ...thresholds.memory, ...newThresholds.memory };
  }
  if (newThresholds.disk) {
    thresholds.disk = { ...thresholds.disk, ...newThresholds.disk };
  }
  logger_default.info(`Alert thresholds updated: CPU ${thresholds.cpu.warning}/${thresholds.cpu.critical}%, Memory ${thresholds.memory.warning}/${thresholds.memory.critical}%, Disk ${thresholds.disk.warning}/${thresholds.disk.critical}%`);
}
function getThresholds() {
  return { ...thresholds };
}
function resetThresholds() {
  thresholds = { ...DEFAULT_THRESHOLDS };
  logger_default.info("Alert thresholds reset to defaults");
}
function checkAllMetrics(metrics) {
  const newAlerts = [];
  if (metrics && metrics.cpu !== void 0) {
    const alert = checkThreshold("cpu", metrics.cpu);
    if (alert) newAlerts.push(alert);
  }
  if (metrics && metrics.memory !== void 0) {
    const alert = checkThreshold("memory", metrics.memory);
    if (alert) newAlerts.push(alert);
  }
  if (metrics && metrics.disk !== void 0) {
    const alert = checkThreshold("disk", metrics.disk);
    if (alert) newAlerts.push(alert);
  }
  return newAlerts;
}
function getAlertColor(level) {
  const theme = getCurrentTheme();
  const colorMap = {
    [AlertLevel.INFO]: theme.colors.alert?.info || "cyan",
    [AlertLevel.WARNING]: theme.colors.alert?.warning || "yellow",
    [AlertLevel.CRITICAL]: theme.colors.alert?.error || "red",
    [AlertLevel.CLEARED]: theme.colors.alert?.success || "green"
  };
  return colorMap[level] || "white";
}
function formatAlert(alert) {
  const color = getAlertColor(alert.level);
  const icon = getAlertIcon(alert.level);
  return `{${color}-fg}${icon} ${alert.message}{/}`;
}
function getAlertIcon(level) {
  const icons = {
    [AlertLevel.INFO]: "\u2139",
    [AlertLevel.WARNING]: "\u26A0",
    [AlertLevel.CRITICAL]: "\u2716",
    [AlertLevel.CLEARED]: "\u2713"
  };
  return icons[level] || "\u2022";
}
function getAlertCounts() {
  const active = getActiveAlerts();
  return {
    info: active.filter((a) => a.level === AlertLevel.INFO).length,
    warning: active.filter((a) => a.level === AlertLevel.WARNING).length,
    critical: active.filter((a) => a.level === AlertLevel.CRITICAL).length,
    total: active.length
  };
}
var RateLimiter = class {
  /**
   * Create a RateLimiter instance
   * @param {object} options - Configuration options
   * @param {boolean} options.enabled - Enable rate limiting (default: true)
   * @param {number} options.windowMs - Time window in milliseconds (default: 60000)
   * @param {number} options.maxAlerts - Max alerts per window (default: 5)
   * @param {boolean} options.alwaysAllowCritical - Always allow critical alerts (default: true)
   */
  constructor(options = {}) {
    this.enabled = options.enabled ?? rateLimit.enabled;
    this.windowMs = options.windowMs ?? rateLimit.windowMs;
    this.maxAlerts = options.maxAlerts ?? rateLimit.maxAlerts;
    this.alwaysAllowCritical = options.alwaysAllowCritical ?? true;
    this.timestamps = {};
    setRateLimit({
      enabled: this.enabled,
      windowMs: this.windowMs,
      maxAlerts: this.maxAlerts
    });
  }
  /**
   * Check if an alert should be allowed or rate-limited
   * @param {string} type - Alert type (cpu, memory, disk)
   * @param {string} [level] - Alert level (critical, warning, info)
   * @returns {object} Result with allowed boolean and reason
   */
  check(type, level = "warning") {
    if (!this.enabled) {
      return { allowed: true, reason: "rate_limiting_disabled" };
    }
    if (this.alwaysAllowCritical && level === "critical") {
      return { allowed: true, reason: "critical_always_allowed" };
    }
    const shouldLimit = shouldRateLimitAlert(type);
    if (shouldLimit) {
      return { allowed: false, reason: "rate_limit_exceeded" };
    }
    return { allowed: true, reason: "ok" };
  }
  /**
   * Record an alert occurrence after it's been allowed
   * @param {string} type - Alert type
   * @param {string} [level] - Alert level
   */
  record(type, level = "warning") {
    if (!this.enabled) {
      return;
    }
    this._addTimestamp(type);
    recordAlertTimestamp(type);
  }
  /**
   * Internal method to add timestamp
   * @private
   */
  _addTimestamp(type) {
    if (!this.timestamps[type]) {
      this.timestamps[type] = [];
    }
    this.timestamps[type].push(Date.now());
  }
  /**
   * Get the count of alerts in current window for a type
   * @param {string} type - Alert type
   * @returns {number} Current count
   */
  getCount(type) {
    const timestamps = this.timestamps[type] || [];
    const now = Date.now();
    const valid = timestamps.filter((ts) => now - ts < this.windowMs);
    return valid.length;
  }
  /**
   * Get time until next alert is allowed for a type
   * @param {string} type - Alert type
   * @returns {number} Milliseconds until next alert, or 0 if allowed now
   */
  getRetryAfter(type) {
    const timestamps = this.timestamps[type] || [];
    if (timestamps.length === 0) {
      return 0;
    }
    const now = Date.now();
    const valid = timestamps.filter((ts) => now - ts < this.windowMs);
    if (valid.length < this.maxAlerts) {
      return 0;
    }
    const oldest = Math.min(...valid);
    return Math.max(0, oldest + this.windowMs - now);
  }
  /**
   * Get status of rate limiter
   * @returns {object} Status object
   */
  getStatus() {
    const now = Date.now();
    const types = Object.keys(this.timestamps);
    const typeStatus = {};
    for (const type of types) {
      const valid = this.timestamps[type].filter((ts) => now - ts < this.windowMs);
      typeStatus[type] = {
        current: valid.length,
        max: this.maxAlerts,
        retryAfter: valid.length >= this.maxAlerts ? this.getRetryAfter(type) : 0
      };
    }
    return {
      enabled: this.enabled,
      windowMs: this.windowMs,
      maxAlerts: this.maxAlerts,
      alwaysAllowCritical: this.alwaysAllowCritical,
      types: typeStatus
    };
  }
  /**
   * Update configuration
   * @param {object} options - New options
   */
  configure(options) {
    if (options.enabled !== void 0) this.enabled = options.enabled;
    if (options.windowMs !== void 0) this.windowMs = options.windowMs;
    if (options.maxAlerts !== void 0) this.maxAlerts = options.maxAlerts;
    if (options.alwaysAllowCritical !== void 0) this.alwaysAllowCritical = options.alwaysAllowCritical;
    setRateLimit({
      enabled: this.enabled,
      windowMs: this.windowMs,
      maxAlerts: this.maxAlerts
    });
  }
  /**
   * Reset all timestamps (clear rate limit state)
   */
  reset() {
    this.timestamps = {};
    resetRateLimit();
  }
  /**
   * Create a combined check-and-record operation
   * Use this for the common pattern of checking then recording
   * @param {string} type - Alert type
   * @param {string} [level] - Alert level
   * @returns {object} Result with allowed boolean and reason; if allowed, also records the alert
   */
  checkAndRecord(type, level = "warning") {
    const result = this.check(type, level);
    if (result.allowed) {
      this.record(type, level);
    }
    return result;
  }
};
var thresholdRateLimiter = new RateLimiter({ alwaysAllowCritical: true });
var defaultRateLimiter = new RateLimiter();
var alerts_default = {
  AlertLevel,
  checkThreshold,
  checkAllMetrics,
  dismissAlert,
  getActiveAlerts,
  getAlertsByLevel,
  getAlertHistory,
  getAlertCounts,
  getAlertColor,
  formatAlert,
  setThresholds,
  getThresholds,
  resetThresholds,
  clearAllAlerts,
  // Rate limiting exports
  setRateLimit,
  getRateLimit,
  resetRateLimit,
  shouldRateLimitAlert,
  recordAlertTimestamp,
  // Higher-level RateLimiter API
  RateLimiter,
  defaultRateLimiter,
  // Sound notification exports
  setSoundConfig,
  getSoundConfig,
  toggleSound,
  playAlertSound
};

// src/retry.js
init_logger();
init_config();
var DEFAULT_OPTIONS = config_default.DEFAULT_RETRY_OPTIONS;

// index.js
init_config();

// src/validation.js
init_logger();
var import_os5 = __toESM(require("os"), 1);
init_config();
var import_fs7 = __toESM(require("fs"), 1);
var import_path6 = require("path");

// src/export-scheduler.js
var import_fs6 = __toESM(require("fs"), 1);
var import_path5 = __toESM(require("path"), 1);
var import_url3 = require("url");
init_logger();
init_config();

// src/snapshot.js
var import_fs5 = __toESM(require("fs"), 1);
var import_os4 = __toESM(require("os"), 1);
var import_path4 = require("path");
init_config();
init_logger();
var SNAPSHOT_SCHEMA_VERSION = "1.0.0";
var EXPORTABLE_SETTINGS = [
  "refreshInterval",
  "logLevelFilter",
  "sessionSortMode",
  "showWidget1",
  "showWidget2",
  "showWidget3",
  "showWidget4",
  "showWidget5",
  "showWidget6",
  "showWidget7",
  "showWidget8",
  "showWidget9",
  "showPerformanceMetrics",
  "theme",
  "exportFormat",
  "exportDirectory",
  "favorites",
  "showFavoritesOnly",
  "gatewayEndpoints",
  "activeGatewayEndpoint",
  "webInterface",
  "widgetLoading",
  "plugins",
  "autoRetry"
];
function createSnapshot(currentSettings, options = {}) {
  const snapshot = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    dashboardVersion: DASHBOARD_VERSION,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    name: options.name || "Dashboard Snapshot",
    description: options.description || "",
    platform: {
      os: import_os4.default.platform(),
      arch: import_os4.default.arch(),
      nodeVersion: process.version
    },
    settings: {}
  };
  for (const key of EXPORTABLE_SETTINGS) {
    if (key in currentSettings) {
      snapshot.settings[key] = currentSettings[key];
    }
  }
  snapshot.metadata = {
    widgetCount: [
      "showWidget1",
      "showWidget2",
      "showWidget3",
      "showWidget4",
      "showWidget5",
      "showWidget6",
      "showWidget7",
      "showWidget8",
      "showWidget9"
    ].filter((w) => snapshot.settings[w] !== false).length,
    pluginCount: Object.keys(snapshot.settings.plugins || {}).length,
    endpointCount: (snapshot.settings.gatewayEndpoints || []).length
  };
  return snapshot;
}
function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return { valid: false, error: "Invalid snapshot format" };
  }
  const schemaVersion = snapshot.schemaVersion || "0.0.0";
  const [major] = schemaVersion.split(".");
  const [currentMajor] = SNAPSHOT_SCHEMA_VERSION.split(".");
  if (parseInt(major) > parseInt(currentMajor)) {
    return {
      valid: false,
      error: `Snapshot version ${schemaVersion} is newer than supported (${SNAPSHOT_SCHEMA_VERSION})`
    };
  }
  if (!snapshot.settings || typeof snapshot.settings !== "object") {
    return { valid: false, error: "Missing or invalid settings in snapshot" };
  }
  const validations = [
    { key: "refreshInterval", type: "number", min: 500, max: 6e4 },
    { key: "theme", type: "string", allowed: ["auto", "default", "dark", "high-contrast", "ocean"] },
    { key: "logLevelFilter", type: "string", allowed: ["all", "debug", "info", "warn", "error"] }
  ];
  for (const v of validations) {
    const value = snapshot.settings[v.key];
    if (value !== void 0) {
      if (v.type && typeof value !== v.type) {
        return { valid: false, error: `Invalid type for ${v.key}: expected ${v.type}` };
      }
      if (v.min !== void 0 && value < v.min) {
        return { valid: false, error: `${v.key} must be at least ${v.min}` };
      }
      if (v.max !== void 0 && value > v.max) {
        return { valid: false, error: `${v.key} must be at most ${v.max}` };
      }
      if (v.allowed && !v.allowed.includes(value)) {
        return { valid: false, error: `${v.key} must be one of: ${v.allowed.join(", ")}` };
      }
    }
  }
  for (let i = 1; i <= 9; i++) {
    const key = `showWidget${i}`;
    const value = snapshot.settings[key];
    if (value !== void 0 && typeof value !== "boolean") {
      return { valid: false, error: `${key} must be a boolean` };
    }
  }
  return { valid: true };
}
function mergeSnapshotSettings(existingSettings, snapshotSettings) {
  const merged = { ...existingSettings };
  for (const key of EXPORTABLE_SETTINGS) {
    if (key in snapshotSettings) {
      if (typeof snapshotSettings[key] === "object" && snapshotSettings[key] !== null) {
        merged[key] = JSON.parse(JSON.stringify(snapshotSettings[key]));
      } else {
        merged[key] = snapshotSettings[key];
      }
    }
  }
  return merged;
}
function exportSnapshotToFile(snapshot, filePath) {
  try {
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    if (dir && !import_fs5.default.existsSync(dir)) {
      import_fs5.default.mkdirSync(dir, { recursive: true });
    }
    import_fs5.default.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
    try {
      import_fs5.default.chmodSync(filePath, 384);
    } catch (permErr) {
      logger_default.warn(`Could not set permissions on snapshot: ${permErr.message}`);
    }
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
function importSnapshotFromFile(filePath) {
  try {
    if (!import_fs5.default.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }
    const data = import_fs5.default.readFileSync(filePath, "utf8");
    const snapshot = JSON.parse(data);
    const validation = validateSnapshot(snapshot);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    return { success: true, snapshot };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { success: false, error: "Invalid JSON format" };
    }
    return { success: false, error: err.message };
  }
}
function generateSnapshotFilename(name) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const safeName = name ? name.replace(/[^a-zA-Z0-9-_]/g, "_") : "dashboard";
  return `claw-snapshot-${safeName}-${timestamp}.json`;
}
function getSnapshotsDirectory() {
  return (0, import_path4.join)(PATHS.OPENCLAW_DIR, "snapshots");
}
function listSnapshots() {
  const dir = getSnapshotsDirectory();
  if (!import_fs5.default.existsSync(dir)) {
    return [];
  }
  try {
    const files = import_fs5.default.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
      const path6 = (0, import_path4.join)(dir, f);
      try {
        const data = import_fs5.default.readFileSync(path6, "utf8");
        const snapshot = JSON.parse(data);
        const stats = import_fs5.default.statSync(path6);
        return {
          filename: f,
          path: path6,
          name: snapshot.name || "Unnamed",
          description: snapshot.description || "",
          createdAt: snapshot.createdAt || stats.mtime.toISOString(),
          dashboardVersion: snapshot.dashboardVersion || "unknown",
          schemaVersion: snapshot.schemaVersion || "unknown",
          metadata: snapshot.metadata || {}
        };
      } catch (err) {
        return null;
      }
    }).filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return files;
  } catch (err) {
    logger_default.warn(`Failed to list snapshots: ${err.message}`);
    return [];
  }
}
function getSnapshotSummary(snapshot) {
  if (!snapshot) return "Invalid snapshot";
  const lines = [
    `Name: ${snapshot.name || "Unnamed"}`,
    `Created: ${snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleString() : "Unknown"}`
  ];
  if (snapshot.description) {
    lines.push(`Description: ${snapshot.description}`);
  }
  if (snapshot.metadata) {
    const { widgetCount, pluginCount, endpointCount } = snapshot.metadata;
    lines.push(`Widgets: ${widgetCount}, Plugins: ${pluginCount}, Endpoints: ${endpointCount}`);
  }
  if (snapshot.settings) {
    const theme = snapshot.settings.theme || "auto";
    const refresh = snapshot.settings.refreshInterval || 2e3;
    lines.push(`Theme: ${theme}, Refresh: ${refresh}ms`);
  }
  return lines.join("\n");
}

// src/export-scheduler.js
var __filename4 = (0, import_url3.fileURLToPath)("file://" + (typeof __dirname4 !== "undefined" ? require("path").join(__dirname4, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname4 = import_path5.default.dirname(__filename4);
var DEFAULT_SCHEDULE_CONFIG = {
  enabled: false,
  format: "json",
  // 'json' or 'csv'
  directory: null,
  // null = use default snapshots directory
  filename: null,
  // null = auto-generated with timestamp
  schedule: "0 * * * *",
  // cron expression: every hour at minute 0
  includeMetrics: true,
  // include current metrics in export
  compressOlder: false,
  // compress exports older than 24h
  retentionDays: 30
  // keep exports for 30 days (0 = forever)
};
var CronParser = class {
  /**
   * Parse a cron expression into field constraints
   * @param {string} expression - Cron expression (5 fields)
   * @returns {Object} Parsed cron fields
   */
  static parse(expression) {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error(`Invalid cron expression: expected 5 fields, got ${parts.length}`);
    }
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    return {
      minute: this._parseField(minute, 0, 59),
      hour: this._parseField(hour, 0, 23),
      dayOfMonth: this._parseField(dayOfMonth, 1, 31),
      month: this._parseField(month, 1, 12),
      dayOfWeek: this._parseField(dayOfWeek, 0, 6)
    };
  }
  /**
   * Parse a single cron field into allowed values
   * Supports: *, ranges (1-5), lists (1,3,5), steps (star/5, 1-10/2)
   * @param {string} field - Field value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {Set} Set of allowed values
   */
  static _parseField(field, min, max) {
    const values = /* @__PURE__ */ new Set();
    const parts = field.split(",");
    for (const part of parts) {
      const [range, stepStr] = part.split("/");
      const step = stepStr ? parseInt(stepStr, 10) : 1;
      if (range === "*") {
        for (let i = min; i <= max; i += step) {
          values.add(i);
        }
      } else if (range.includes("-")) {
        const [startStr, endStr] = range.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
          throw new Error(`Invalid range: ${range}`);
        }
        for (let i = start; i <= end; i += step) {
          values.add(i);
        }
      } else {
        const value = parseInt(range, 10);
        if (isNaN(value) || value < min || value > max) {
          throw new Error(`Invalid value: ${range}`);
        }
        values.add(value);
      }
    }
    return values;
  }
  /**
   * Check if a given time matches the cron expression
   * @param {Date} date - Date to check
   * @param {Object} parsed - Parsed cron fields
   * @returns {boolean} True if time matches
   */
  static matches(date, parsed) {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    return parsed.minute.has(minute) && parsed.hour.has(hour) && parsed.dayOfMonth.has(day) && parsed.month.has(month) && parsed.dayOfWeek.has(dayOfWeek);
  }
  /**
   * Calculate the next execution time from a given date
   * @param {Date} fromDate - Starting date
   * @param {string} expression - Cron expression
   * @returns {Date} Next execution date
   */
  static nextExecution(fromDate, expression) {
    const parsed = this.parse(expression);
    const date = new Date(fromDate);
    date.setSeconds(0, 0);
    date.setMinutes(date.getMinutes() + 1);
    const maxIterations = 366 * 24 * 60;
    for (let i = 0; i < maxIterations; i++) {
      if (this.matches(date, parsed)) {
        return date;
      }
      date.setMinutes(date.getMinutes() + 1);
    }
    throw new Error("Could not find next execution time within 1 year");
  }
};
var ExportScheduler = class _ExportScheduler {
  constructor(options = {}) {
    this.config = { ...DEFAULT_SCHEDULE_CONFIG, ...options };
    this.enabled = this.config.enabled;
    this.timer = null;
    this.lastExport = null;
    this.nextExport = null;
    this.exportCount = 0;
    this.failedCount = 0;
    this.getMetricsCallback = null;
    this.exportDir = this.config.directory || getSnapshotsDirectory();
  }
  /**
   * Set the metrics callback function
   * @param {Function} callback - Function that returns current metrics
   */
  setMetricsCallback(callback) {
    if (typeof callback !== "function") {
      throw new Error("Metrics callback must be a function");
    }
    this.getMetricsCallback = callback;
  }
  /**
   * Update scheduler configuration
   * @param {Object} newConfig - New configuration values
   */
  configure(newConfig) {
    const validatedConfig = _ExportScheduler.validateConfig(newConfig);
    this.config = { ...this.config, ...validatedConfig };
    this.enabled = this.config.enabled;
    this.exportDir = this.config.directory || getSnapshotsDirectory();
    if (this.enabled && this.timer) {
      this.stop();
      this.start();
    }
    logger_default.info(`Export scheduler configured: ${this.enabled ? "enabled" : "disabled"}`);
  }
  /**
   * Start the scheduler
   */
  start() {
    if (!this.enabled) {
      logger_default.debug("Export scheduler not enabled, skipping start");
      return;
    }
    try {
      this.nextExport = CronParser.nextExecution(/* @__PURE__ */ new Date(), this.config.schedule);
      const delay = this.nextExport.getTime() - Date.now();
      logger_default.info(`Export scheduler started, next export in ${this._formatDelay(delay)}`);
      this.timer = setTimeout(() => this._onExportTime(), delay);
    } catch (err) {
      logger_default.error(`Failed to start export scheduler: ${err.message}`);
      this.enabled = false;
    }
  }
  /**
   * Stop the scheduler
   */
  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      logger_default.debug("Export scheduler stopped");
    }
  }
  /**
   * Trigger an immediate export (manual)
   * @returns {Promise<Object>} Export result
   */
  async triggerExport() {
    return this._performExport("manual");
  }
  /**
   * Handle scheduled export time
   * @private
   */
  async _onExportTime() {
    try {
      const result = await this._performExport("scheduled");
      if (result.success) {
        this.lastExport = /* @__PURE__ */ new Date();
        this.exportCount++;
        logger_default.info(`Scheduled export completed: ${result.path}`);
      } else {
        this.failedCount++;
        logger_default.error(`Scheduled export failed: ${result.error}`);
      }
    } catch (err) {
      this.failedCount++;
      logger_default.error(`Export scheduler error: ${err.message}`);
    }
    if (this.enabled) {
      this.nextExport = CronParser.nextExecution(/* @__PURE__ */ new Date(), this.config.schedule);
      const delay = this.nextExport.getTime() - Date.now();
      this.timer = setTimeout(() => this._onExportTime(), delay);
      logger_default.debug(`Next export scheduled for ${this.nextExport.toISOString()}`);
    }
  }
  /**
   * Perform the actual export
   * @private
   * @param {string} trigger - 'manual' or 'scheduled'
   * @returns {Promise<Object>} Export result
   */
  async _performExport(trigger) {
    try {
      if (!import_fs6.default.existsSync(this.exportDir)) {
        import_fs6.default.mkdirSync(this.exportDir, { recursive: true });
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = this.config.filename ? `${this.config.filename}-${timestamp}.${this.config.format}` : `claw-export-${timestamp}.${this.config.format}`;
      const filePath = import_path5.default.join(this.exportDir, filename);
      const exportData = await this._getExportData(trigger);
      const content2 = this.config.format === "csv" ? this._convertToCSV(exportData) : JSON.stringify(exportData, null, 2);
      import_fs6.default.writeFileSync(filePath, content2);
      try {
        import_fs6.default.chmodSync(filePath, 384);
      } catch (permErr) {
        logger_default.warn(`Could not set permissions on export: ${permErr.message}`);
      }
      if (this.config.retentionDays > 0) {
        this._cleanupOldExports();
      }
      return { success: true, path: filePath, data: exportData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  /**
   * Get data for export
   * @private
   * @param {string} trigger - Export trigger type
   * @returns {Promise<Object>} Export data
   */
  async _getExportData(trigger) {
    const data = {
      schemaVersion: "1.0.0",
      dashboardVersion: DASHBOARD_VERSION,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      trigger,
      format: this.config.format,
      schedule: this.config.schedule,
      metrics: null
    };
    if (this.config.includeMetrics && typeof this.getMetricsCallback === "function") {
      try {
        data.metrics = await this.getMetricsCallback();
      } catch (err) {
        logger_default.warn(`Failed to collect metrics for export: ${err.message}`);
        data.metrics = { error: "Failed to collect metrics" };
      }
    }
    return data;
  }
  /**
   * Convert export data to CSV format
   * @private
   * @param {Object} data - Export data
   * @returns {string} CSV string
   */
  _convertToCSV(data) {
    const lines = [];
    lines.push(`# Claw Dashboard Export - ${data.exportedAt}`);
    lines.push(`# Format: ${data.format}`);
    lines.push(`# Schedule: ${data.schedule}`);
    lines.push("");
    if (data.metrics) {
      const metrics = data.metrics;
      const timestamp = data.exportedAt;
      const headers = ["timestamp"];
      const values = [timestamp];
      if (metrics.cpu !== void 0) {
        headers.push("cpu_percent");
        values.push(metrics.cpu);
      }
      if (metrics.memory !== void 0) {
        headers.push("memory_percent");
        values.push(metrics.memory);
      }
      if (metrics.disk !== void 0) {
        headers.push("disk_percent");
        values.push(metrics.disk);
      }
      if (metrics.network !== void 0) {
        if (metrics.network.rx !== void 0) {
          headers.push("network_rx_bytes");
          values.push(metrics.network.rx);
        }
        if (metrics.network.tx !== void 0) {
          headers.push("network_tx_bytes");
          values.push(metrics.network.tx);
        }
      }
      lines.push(headers.join(","));
      lines.push(values.join(","));
    }
    return lines.join("\n");
  }
  /**
   * Cleanup old exports based on retention policy
   * @private
   */
  _cleanupOldExports() {
    try {
      const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1e3;
      const files = import_fs6.default.readdirSync(this.exportDir).filter((f) => f.startsWith("claw-export-")).map((f) => ({
        name: f,
        path: import_path5.default.join(this.exportDir, f),
        mtime: import_fs6.default.statSync(import_path5.default.join(this.exportDir, f)).mtimeMs
      }));
      for (const file of files) {
        if (file.mtime < cutoff) {
          import_fs6.default.unlinkSync(file.path);
          logger_default.debug(`Cleaned up old export: ${file.name}`);
        }
      }
    } catch (err) {
      logger_default.warn(`Failed to cleanup old exports: ${err.message}`);
    }
  }
  /**
   * Format delay in human-readable form
   * @private
   * @param {number} ms - Delay in milliseconds
   * @returns {string} Formatted delay
   */
  _formatDelay(ms) {
    const minutes = Math.floor(ms / 6e4);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }
  /**
   * Get scheduler status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      enabled: this.enabled,
      schedule: this.config.schedule,
      format: this.config.format,
      exportDir: this.exportDir,
      lastExport: this.lastExport?.toISOString(),
      nextExport: this.nextExport?.toISOString(),
      exportCount: this.exportCount,
      failedCount: this.failedCount,
      retentionDays: this.config.retentionDays
    };
  }
  /**
   * Validate export scheduler configuration
   * @static
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validated configuration
   */
  static validateConfig(config) {
    const validated = {};
    const errors = [];
    if (config.enabled !== void 0) {
      validated.enabled = Boolean(config.enabled);
    }
    if (config.format !== void 0) {
      if (["json", "csv"].includes(config.format)) {
        validated.format = config.format;
      } else {
        errors.push(`Invalid format: ${config.format}`);
      }
    }
    if (config.schedule !== void 0) {
      try {
        CronParser.parse(config.schedule);
        validated.schedule = config.schedule;
      } catch (err) {
        errors.push(`Invalid cron expression: ${config.schedule}`);
      }
    }
    if (config.directory !== void 0) {
      if (config.directory === null || typeof config.directory === "string") {
        validated.directory = config.directory;
      } else {
        errors.push("Directory must be a string or null");
      }
    }
    if (config.retentionDays !== void 0) {
      const days = Number(config.retentionDays);
      if (!isNaN(days) && days >= 0 && days <= 365) {
        validated.retentionDays = days;
      } else {
        errors.push("retentionDays must be 0-365");
      }
    }
    if (config.includeMetrics !== void 0) {
      validated.includeMetrics = Boolean(config.includeMetrics);
    }
    if (errors.length > 0) {
      logger_default.warn(`Export scheduler config validation warnings: ${errors.join("; ")}`);
    }
    return validated;
  }
};
var CRON_PRESETS = {
  everyMinute: "* * * * *",
  every5Minutes: "*/5 * * * *",
  every10Minutes: "*/10 * * * *",
  every15Minutes: "*/15 * * * *",
  every30Minutes: "*/30 * * * *",
  hourly: "0 * * * *",
  every6Hours: "0 */6 * * *",
  every12Hours: "0 */12 * * *",
  daily: "0 0 * * *",
  weekly: "0 0 * * 0",
  monthly: "0 0 1 * *"
};

// src/validation.js
var VALID_THEMES = config_default.VALIDATION.VALID_THEMES;
var VALID_SORT_MODES = config_default.VALIDATION.VALID_SORT_MODES;
var VALID_LOG_LEVELS = config_default.VALIDATION.VALID_LOG_LEVELS;
var VALID_EXPORT_FORMATS = config_default.VALIDATION.VALID_EXPORT_FORMATS;
var CONSTRAINTS = {
  refreshInterval: {
    min: config_default.VALIDATION.REFRESH_INTERVAL.MIN,
    max: config_default.VALIDATION.REFRESH_INTERVAL.MAX,
    type: "number"
  },
  logLevelFilter: {
    type: "string",
    values: VALID_LOG_LEVELS
  },
  sessionSortMode: {
    type: "string",
    values: VALID_SORT_MODES
  },
  theme: {
    type: "string",
    values: VALID_THEMES
  },
  exportFormat: {
    type: "string",
    values: VALID_EXPORT_FORMATS
  },
  exportDirectory: {
    type: "string",
    required: false
  }
};
function validatePath(filePath, mustExist = false) {
  if (!filePath || typeof filePath !== "string") {
    return { valid: false, error: "Path must be a non-empty string" };
  }
  if (filePath.includes("..")) {
    return { valid: false, error: "Path traversal not allowed" };
  }
  const expandedPath = filePath.startsWith("~") ? (0, import_path6.resolve)(import_os5.default.homedir(), filePath.slice(1)) : (0, import_path6.resolve)(filePath);
  if (mustExist && !import_fs7.default.existsSync(expandedPath)) {
    return { valid: false, error: `Path does not exist: ${expandedPath}` };
  }
  const parentDir = (0, import_path6.dirname)(expandedPath);
  if (!import_fs7.default.existsSync(parentDir) && !import_fs7.default.existsSync(expandedPath)) {
    try {
      const parentExists = import_fs7.default.existsSync(parentDir);
      if (!parentExists) {
        return { valid: true, resolvedPath: expandedPath, warning: "Parent directory will be created" };
      }
    } catch {
      return { valid: false, error: "Cannot determine if path is writable" };
    }
  }
  return { valid: true, resolvedPath: expandedPath };
}
function validateRefreshInterval(value) {
  if (value === void 0 || value === null) {
    return { valid: true, value: config_default.REFRESH_INTERVALS.DEFAULT };
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, error: "Refresh interval must be a number" };
  }
  if (num < CONSTRAINTS.refreshInterval.min || num > CONSTRAINTS.refreshInterval.max) {
    return {
      valid: false,
      error: `Refresh interval must be between ${CONSTRAINTS.refreshInterval.min}ms and ${CONSTRAINTS.refreshInterval.max}ms`
    };
  }
  return { valid: true, value: num };
}
function validateLogLevelFilter(value) {
  if (!value) {
    return { valid: true, value: "all" };
  }
  if (typeof value !== "string") {
    return { valid: false, error: "Log level must be a string" };
  }
  const normalized = value.toLowerCase();
  if (!CONSTRAINTS.logLevelFilter.values.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid log level. Must be one of: ${CONSTRAINTS.logLevelFilter.values.join(", ")}`
    };
  }
  return { valid: true, value: normalized };
}
function validateSessionSortMode(value) {
  if (!value) {
    return { valid: true, value: "time" };
  }
  if (typeof value !== "string") {
    return { valid: false, error: "Sort mode must be a string" };
  }
  const normalized = value.toLowerCase();
  if (!CONSTRAINTS.sessionSortMode.values.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid sort mode. Must be one of: ${CONSTRAINTS.sessionSortMode.values.join(", ")}`
    };
  }
  return { valid: true, value: normalized };
}
function validateTheme(value) {
  if (!value) {
    return { valid: true, value: "default" };
  }
  if (typeof value !== "string") {
    return { valid: false, error: "Theme must be a string" };
  }
  const normalized = value.toLowerCase();
  if (!CONSTRAINTS.theme.values.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid theme. Must be one of: ${CONSTRAINTS.theme.values.join(", ")}`
    };
  }
  return { valid: true, value: normalized };
}
function validateExportFormat(value) {
  if (!value) {
    return { valid: true, value: "json" };
  }
  if (typeof value !== "string") {
    return { valid: false, error: "Export format must be a string" };
  }
  const normalized = value.toLowerCase();
  if (!CONSTRAINTS.exportFormat.values.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid export format. Must be one of: ${CONSTRAINTS.exportFormat.values.join(", ")}`
    };
  }
  return { valid: true, value: normalized };
}
function validateExportDirectory(value) {
  if (!value) {
    return { valid: true, value: config_default.PATHS.EXPORTS };
  }
  if (typeof value !== "string") {
    return { valid: false, error: "Export directory must be a string" };
  }
  return validatePath(value, false);
}
function validateBoolean(value, name = "setting") {
  if (value === void 0 || value === null) {
    return { valid: true, value: true };
  }
  if (typeof value !== "boolean") {
    if (value === "true" || value === "1" || value === "yes") {
      return { valid: true, value: true };
    }
    if (value === "false" || value === "0" || value === "no") {
      return { valid: true, value: false };
    }
    return { valid: false, error: `${name} must be a boolean` };
  }
  return { valid: true, value: Boolean(value) };
}
function validateWidgetVisibility(value) {
  return validateBoolean(value, "Widget visibility");
}
function validatePinnedWidgets(value) {
  if (!value) {
    return { valid: true, value: [] };
  }
  if (!Array.isArray(value)) {
    return { valid: false, error: "pinnedWidgets must be an array" };
  }
  const validWidgetIds = ["cpu", "mem", "gpu", "net", "disk", "sys", "uptime", "health", "gateway"];
  const validated = [];
  for (const widgetId of value) {
    if (typeof widgetId === "string" && validWidgetIds.includes(widgetId)) {
      validated.push(widgetId);
    }
  }
  if (validated.length > 4) {
    return { valid: true, value: validated.slice(0, 4), warning: "Maximum 4 widgets can be pinned, truncating to first 4" };
  }
  return { valid: true, value: validated };
}
function validateWidgetOrder(value) {
  if (!value) {
    return { valid: true, value: [] };
  }
  if (!Array.isArray(value)) {
    return { valid: false, error: "widgetOrder must be an array" };
  }
  const validWidgetIds = ["cpu", "mem", "gpu", "net", "disk", "sys", "uptime", "health", "gateway"];
  const validated = [];
  const seen = /* @__PURE__ */ new Set();
  for (const widgetId of value) {
    if (typeof widgetId === "string" && validWidgetIds.includes(widgetId) && !seen.has(widgetId)) {
      validated.push(widgetId);
      seen.add(widgetId);
    }
  }
  return { valid: true, value: validated };
}
function validateWidgetSizes(widgetSizes) {
  if (!widgetSizes || typeof widgetSizes !== "object") {
    return { valid: true, value: {} };
  }
  const validSizes = ["small", "medium", "large", "wide"];
  const validWidgetIds = ["cpu", "mem", "gpu", "net", "disk", "sys", "uptime", "health", "gateway"];
  const result = { valid: true, value: {} };
  for (const [widgetId, size] of Object.entries(widgetSizes)) {
    if (validWidgetIds.includes(widgetId)) {
      if (validSizes.includes(size)) {
        result.value[widgetId] = size;
      }
    }
  }
  return result;
}
function validateAlertThresholds(thresholds2) {
  if (!thresholds2 || typeof thresholds2 !== "object") {
    return { valid: false, error: "Alert thresholds must be an object" };
  }
  const result = { valid: true, value: {} };
  const allowedTypes = ["cpu", "memory", "disk"];
  for (const type of allowedTypes) {
    if (thresholds2[type]) {
      const t = thresholds2[type];
      if (typeof t !== "object") {
        return { valid: false, error: `Alert threshold for ${type} must be an object` };
      }
      result.value[type] = {};
      if (t.warning !== void 0) {
        const warning = Number(t.warning);
        if (isNaN(warning) || warning < 0 || warning > 100) {
          return { valid: false, error: `${type} warning threshold must be 0-100` };
        }
        result.value[type].warning = warning;
      } else {
        result.value[type].warning = type === "disk" ? 80 : 70;
      }
      if (t.critical !== void 0) {
        const critical = Number(t.critical);
        if (isNaN(critical) || critical < 0 || critical > 100) {
          return { valid: false, error: `${type} critical threshold must be 0-100` };
        }
        result.value[type].critical = critical;
      } else {
        result.value[type].critical = type === "disk" ? 95 : 90;
      }
      if (result.value[type].critical < result.value[type].warning) {
        return { valid: false, error: `${type} critical threshold must be >= warning threshold` };
      }
    }
  }
  return result;
}
function validateAutoRetry(autoRetry) {
  if (!autoRetry || typeof autoRetry !== "object") {
    return {
      valid: true,
      value: {
        enabled: config_default.AUTO_RETRY.ENABLED,
        intervalMs: config_default.AUTO_RETRY.DEFAULT_INTERVAL_MS,
        exponentialBackoff: config_default.AUTO_RETRY.EXPONENTIAL_BACKOFF,
        backoffMultiplier: config_default.AUTO_RETRY.BACKOFF_MULTIPLIER,
        maxBackoffIntervalMs: config_default.AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS,
        resetAfterSuccess: config_default.AUTO_RETRY.RESET_AFTER_SUCCESS,
        consecutiveFailureThreshold: config_default.AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD
      }
    };
  }
  const validated = {};
  const constraints = config_default.VALIDATION.AUTO_RETRY;
  validated.enabled = autoRetry.enabled !== false;
  const interval = Number(autoRetry.intervalMs);
  if (autoRetry.intervalMs !== void 0 && (!isNaN(interval) && interval >= constraints.INTERVAL_MS.MIN && interval <= constraints.INTERVAL_MS.MAX)) {
    validated.intervalMs = interval;
  } else {
    validated.intervalMs = config_default.AUTO_RETRY.DEFAULT_INTERVAL_MS;
  }
  validated.exponentialBackoff = autoRetry.exponentialBackoff !== false;
  const multiplier = Number(autoRetry.backoffMultiplier);
  if (autoRetry.backoffMultiplier !== void 0 && (!isNaN(multiplier) && multiplier >= constraints.BACKOFF_MULTIPLIER.MIN && multiplier <= constraints.BACKOFF_MULTIPLIER.MAX)) {
    validated.backoffMultiplier = multiplier;
  } else {
    validated.backoffMultiplier = config_default.AUTO_RETRY.BACKOFF_MULTIPLIER;
  }
  const maxBackoff = Number(autoRetry.maxBackoffIntervalMs);
  if (autoRetry.maxBackoffIntervalMs !== void 0 && (!isNaN(maxBackoff) && maxBackoff >= constraints.MAX_BACKOFF_INTERVAL_MS.MIN && maxBackoff <= constraints.MAX_BACKOFF_INTERVAL_MS.MAX)) {
    validated.maxBackoffIntervalMs = maxBackoff;
  } else {
    validated.maxBackoffIntervalMs = config_default.AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS;
  }
  validated.resetAfterSuccess = autoRetry.resetAfterSuccess !== false;
  const threshold = Number(autoRetry.consecutiveFailureThreshold);
  if (autoRetry.consecutiveFailureThreshold !== void 0 && (!isNaN(threshold) && threshold >= constraints.CONSECUTIVE_FAILURE_THRESHOLD.MIN && threshold <= constraints.CONSECUTIVE_FAILURE_THRESHOLD.MAX)) {
    validated.consecutiveFailureThreshold = threshold;
  } else {
    validated.consecutiveFailureThreshold = config_default.AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD;
  }
  return { valid: true, value: validated };
}
function validateAutoSave(autoSave) {
  if (!autoSave || typeof autoSave !== "object") {
    return {
      valid: true,
      value: {
        enabled: config_default.AUTO_SAVE.ENABLED,
        intervalMs: config_default.AUTO_SAVE.INTERVAL_MS,
        saveOnExit: config_default.AUTO_SAVE.SAVE_ON_EXIT
      }
    };
  }
  const validated = {};
  validated.enabled = autoSave.enabled !== false;
  const interval = Number(autoSave.intervalMs);
  if (!isNaN(interval) && interval >= 5e3 && interval <= 3e5) {
    validated.intervalMs = interval;
  } else {
    validated.intervalMs = config_default.AUTO_SAVE.INTERVAL_MS;
  }
  validated.saveOnExit = autoSave.saveOnExit !== false;
  return { valid: true, value: validated };
}
function validateExportSchedule(exportSchedule) {
  if (!exportSchedule || typeof exportSchedule !== "object") {
    return {
      valid: true,
      value: {
        enabled: EXPORT_SCHEDULE.ENABLED,
        format: EXPORT_SCHEDULE.DEFAULT_FORMAT,
        schedule: EXPORT_SCHEDULE.DEFAULT_SCHEDULE,
        retentionDays: EXPORT_SCHEDULE.DEFAULT_RETENTION_DAYS,
        directory: null,
        includeMetrics: true
      }
    };
  }
  const validated = {};
  const errors = [];
  validated.enabled = Boolean(exportSchedule.enabled);
  if (exportSchedule.format !== void 0) {
    if (["json", "csv"].includes(exportSchedule.format)) {
      validated.format = exportSchedule.format;
    } else {
      errors.push(`Invalid format: ${exportSchedule.format}`);
      validated.format = EXPORT_SCHEDULE.DEFAULT_FORMAT;
    }
  } else {
    validated.format = EXPORT_SCHEDULE.DEFAULT_FORMAT;
  }
  if (exportSchedule.schedule !== void 0) {
    try {
      CronParser.parse(exportSchedule.schedule);
      validated.schedule = exportSchedule.schedule;
    } catch (err) {
      errors.push(`Invalid cron expression: ${exportSchedule.schedule}`);
      validated.schedule = EXPORT_SCHEDULE.DEFAULT_SCHEDULE;
    }
  } else {
    validated.schedule = EXPORT_SCHEDULE.DEFAULT_SCHEDULE;
  }
  if (exportSchedule.retentionDays !== void 0) {
    const days = Number(exportSchedule.retentionDays);
    if (!isNaN(days) && days >= EXPORT_SCHEDULE.MIN_RETENTION_DAYS && days <= EXPORT_SCHEDULE.MAX_RETENTION_DAYS) {
      validated.retentionDays = days;
    } else {
      errors.push(`retentionDays must be ${EXPORT_SCHEDULE.MIN_RETENTION_DAYS}-${EXPORT_SCHEDULE.MAX_RETENTION_DAYS}`);
      validated.retentionDays = EXPORT_SCHEDULE.DEFAULT_RETENTION_DAYS;
    }
  } else {
    validated.retentionDays = EXPORT_SCHEDULE.DEFAULT_RETENTION_DAYS;
  }
  if (exportSchedule.directory !== void 0 && exportSchedule.directory !== null) {
    if (typeof exportSchedule.directory === "string") {
      const pathResult = validatePath(exportSchedule.directory, false);
      if (pathResult.valid) {
        validated.directory = pathResult.resolvedPath;
      } else {
        errors.push(`Invalid directory: ${pathResult.error}`);
        validated.directory = null;
      }
    } else {
      errors.push("directory must be a string or null");
      validated.directory = null;
    }
  } else {
    validated.directory = null;
  }
  validated.includeMetrics = exportSchedule.includeMetrics !== false;
  if (errors.length > 0) {
    logger_default.warn(`Export schedule validation warnings: ${errors.join("; ")}`);
  }
  return { valid: true, value: validated };
}
function validateSettings(settings) {
  if (!settings || typeof settings !== "object") {
    logger_default.warn("Settings must be an object, using defaults");
    return getDefaultSettings();
  }
  const validated = {};
  const errors = [];
  const validators = {
    refreshInterval: validateRefreshInterval,
    logLevelFilter: validateLogLevelFilter,
    sessionSortMode: validateSessionSortMode,
    theme: validateTheme,
    exportFormat: validateExportFormat,
    exportDirectory: validateExportDirectory,
    showWidget1: validateWidgetVisibility,
    showWidget2: validateWidgetVisibility,
    showWidget3: validateWidgetVisibility,
    showWidget4: validateWidgetVisibility,
    showWidget5: validateWidgetVisibility,
    showWidget6: validateWidgetVisibility,
    showWidget7: validateWidgetVisibility,
    pinnedWidgets: validatePinnedWidgets,
    widgetOrder: validateWidgetOrder,
    widgetSizes: validateWidgetSizes,
    exportSchedule: validateExportSchedule
  };
  for (const [key, validator] of Object.entries(validators)) {
    const result = validator(settings[key]);
    if (result.valid) {
      validated[key] = result.value;
    } else {
      errors.push(`${key}: ${result.error}`);
      validated[key] = getDefaultValue(key);
    }
  }
  const autoRetryResult = validateAutoRetry(settings.autoRetry);
  if (autoRetryResult.valid) {
    validated.autoRetry = autoRetryResult.value;
  } else {
    errors.push(`autoRetry: ${autoRetryResult.error}`);
    validated.autoRetry = autoRetryResult.value;
  }
  const autoSaveResult = validateAutoSave(settings.autoSave);
  if (autoSaveResult.valid) {
    validated.autoSave = autoSaveResult.value;
  } else {
    errors.push(`autoSave: ${autoSaveResult.error}`);
    validated.autoSave = autoSaveResult.value;
  }
  const exportScheduleResult = validateExportSchedule(settings.exportSchedule);
  if (exportScheduleResult.valid) {
    validated.exportSchedule = exportScheduleResult.value;
  } else {
    errors.push(`exportSchedule: ${exportScheduleResult.error}`);
    validated.exportSchedule = exportScheduleResult.value;
  }
  if (errors.length > 0) {
    logger_default.warn(`Settings validation errors: ${errors.join("; ")}`);
  }
  return { valid: true, value: validated };
}
function getDefaultValue(key) {
  const defaults = {
    refreshInterval: config_default.REFRESH_INTERVALS.DEFAULT,
    logLevelFilter: "all",
    sessionSortMode: "time",
    theme: "default",
    exportFormat: "json",
    exportDirectory: config_default.PATHS.EXPORTS,
    autoRetry: {
      enabled: config_default.AUTO_RETRY.ENABLED,
      intervalMs: config_default.AUTO_RETRY.DEFAULT_INTERVAL_MS,
      exponentialBackoff: config_default.AUTO_RETRY.EXPONENTIAL_BACKOFF,
      backoffMultiplier: config_default.AUTO_RETRY.BACKOFF_MULTIPLIER,
      maxBackoffIntervalMs: config_default.AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS,
      resetAfterSuccess: config_default.AUTO_RETRY.RESET_AFTER_SUCCESS,
      consecutiveFailureThreshold: config_default.AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD
    },
    showWidget1: true,
    showWidget2: true,
    showWidget3: true,
    showWidget4: true,
    showWidget5: true,
    showWidget6: true,
    showWidget7: true,
    pinnedWidgets: [],
    widgetOrder: [],
    exportSchedule: {
      enabled: EXPORT_SCHEDULE.ENABLED,
      format: EXPORT_SCHEDULE.DEFAULT_FORMAT,
      schedule: EXPORT_SCHEDULE.DEFAULT_SCHEDULE,
      retentionDays: EXPORT_SCHEDULE.DEFAULT_RETENTION_DAYS,
      directory: null,
      includeMetrics: true
    }
  };
  return defaults[key];
}
function getDefaultSettings() {
  return {
    refreshInterval: config_default.REFRESH_INTERVALS.DEFAULT,
    logLevelFilter: "all",
    sessionSortMode: "time",
    theme: "default",
    exportFormat: "json",
    exportDirectory: config_default.PATHS.EXPORTS,
    showWidget1: true,
    showWidget2: true,
    showWidget3: true,
    showWidget4: true,
    showWidget5: true,
    showWidget6: true,
    showWidget7: true,
    showWidget8: true,
    showPerformanceMetrics: false,
    sessionSearchQuery: "",
    favorites: {},
    showFavoritesOnly: false,
    pinnedWidgets: [],
    widgetOrder: [],
    widgetSizes: {
      cpu: "medium",
      mem: "medium",
      gpu: "medium",
      net: "medium",
      disk: "medium",
      sys: "medium",
      uptime: "medium",
      health: "medium",
      gateway: "medium"
    },
    firstRun: true,
    gatewayEndpoints: [{
      name: "local",
      host: "localhost",
      port: 18789,
      token: null,
      enabled: true,
      type: "local"
    }],
    activeGatewayEndpoint: "local",
    webInterface: {
      enabled: false,
      port: config_default.WEB.DEFAULT_PORT,
      host: config_default.WEB.HOST,
      cors: true
    }
  };
}
function validateGatewayEndpoint(endpoint) {
  if (!endpoint || typeof endpoint !== "object") {
    return { valid: false, error: "Endpoint must be an object" };
  }
  if (!endpoint.name || typeof endpoint.name !== "string" || endpoint.name.length === 0) {
    return { valid: false, error: "Endpoint name is required and must be a non-empty string" };
  }
  if (endpoint.name.length > config_default.VALIDATION.ENDPOINT_NAME.MAX_LENGTH) {
    return { valid: false, error: `Endpoint name must be at most ${config_default.VALIDATION.ENDPOINT_NAME.MAX_LENGTH} characters` };
  }
  if (!config_default.VALIDATION.ENDPOINT_NAME.PATTERN.test(endpoint.name)) {
    return { valid: false, error: "Endpoint name must contain only alphanumeric characters, underscores, and hyphens" };
  }
  if (!endpoint.host || typeof endpoint.host !== "string" || endpoint.host.length === 0) {
    return { valid: false, error: "Endpoint host is required and must be a non-empty string" };
  }
  const port = Number(endpoint.port);
  if (isNaN(port) || port < 1 || port > 65535) {
    return { valid: false, error: "Endpoint port must be a valid port number (1-65535)" };
  }
  if (endpoint.type !== void 0) {
    if (!config_default.VALIDATION.VALID_ENDPOINT_TYPES.includes(endpoint.type)) {
      return { valid: false, error: `Endpoint type must be one of: ${config_default.VALIDATION.VALID_ENDPOINT_TYPES.join(", ")}` };
    }
  }
  if (endpoint.enabled !== void 0 && typeof endpoint.enabled !== "boolean") {
    return { valid: false, error: "Endpoint enabled must be a boolean" };
  }
  if (endpoint.token !== void 0 && endpoint.token !== null && typeof endpoint.token !== "string") {
    return { valid: false, error: "Endpoint token must be a string or null" };
  }
  return {
    valid: true,
    value: {
      name: endpoint.name,
      host: endpoint.host,
      port,
      token: endpoint.token || null,
      enabled: endpoint.enabled !== false,
      // default true
      type: endpoint.type || "local"
    }
  };
}
function validateType(value, type) {
  switch (type) {
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "string":
      return typeof value === "string";
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return typeof value === "object" && value !== null;
    default:
      return false;
  }
}
var validation_default = {
  validateSettings,
  validateRefreshInterval,
  validateLogLevelFilter,
  validateSessionSortMode,
  validateTheme,
  validateExportFormat,
  validateExportDirectory,
  validateWidgetVisibility,
  validateAlertThresholds,
  validateAutoRetry,
  validateAutoSave,
  validateExportSchedule,
  validatePath,
  validateType,
  validateGatewayEndpoint,
  getDefaultSettings,
  VALID_THEMES,
  VALID_SORT_MODES,
  VALID_LOG_LEVELS,
  VALID_EXPORT_FORMATS
};

// src/cache.js
init_config();
init_logger();
var workerPool2 = null;
async function getWorkerPool() {
  if (!config_default.WORKERS?.ENABLED) {
    return null;
  }
  if (!workerPool2) {
    try {
      const { default: pool } = await Promise.resolve().then(() => (init_worker_pool(), worker_pool_exports));
      workerPool2 = pool;
    } catch (error) {
      logger_default.debug("Worker pool not available:", error.message);
      return null;
    }
  }
  return workerPool2;
}
var cache = /* @__PURE__ */ new Map();
function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}
function set(key, value, ttl) {
  const cacheTtlConfig = config_default.CACHE_CONFIG[key] || { ttl: config_default.CACHE_TTL.DEFAULT };
  const actualTtl = ttl || cacheTtlConfig.ttl;
  cache.set(key, {
    value,
    expiresAt: Date.now() + actualTtl,
    createdAt: Date.now()
  });
}
async function getOrFetch(key, fetcher, ttl) {
  const cached = get(key);
  if (cached !== null) {
    return cached;
  }
  const data = await fetcher();
  set(key, data, ttl);
  return data;
}
async function executeWithWorker(command, fallbackFn) {
  const pool = await getWorkerPool();
  if (pool) {
    try {
      return await pool.execute(command);
    } catch (error) {
      logger_default.debug(`Worker execution failed for ${command}, using fallback: ${error.message}`);
    }
  }
  return fallbackFn();
}
async function getCpuData() {
  return getOrFetch("cpu", async () => {
    try {
      return await executeWithWorker("currentLoad", async () => {
        const si2 = await import("systeminformation");
        return await si2.currentLoad();
      });
    } catch (e) {
      logger_default.warn(`systeminformation.currentLoad() failed: ${e.message}`);
      throw e;
    }
  });
}
async function getMemoryData() {
  return getOrFetch("memory", async () => {
    try {
      return await executeWithWorker("mem", async () => {
        const si2 = await import("systeminformation");
        return await si2.mem();
      });
    } catch (e) {
      logger_default.warn(`systeminformation.mem() failed: ${e.message}`);
      throw e;
    }
  });
}
async function getGpuData() {
  return getOrFetch("gpu", async () => {
    try {
      return await executeWithWorker("graphics", async () => {
        const si2 = await import("systeminformation");
        return await si2.graphics();
      });
    } catch (e) {
      logger_default.warn(`systeminformation.graphics() failed: ${e.message}`);
      throw e;
    }
  });
}
async function getNetworkData() {
  return getOrFetch("network", async () => {
    try {
      return await executeWithWorker("networkStats", async () => {
        const si2 = await import("systeminformation");
        return await si2.networkStats();
      });
    } catch (e) {
      logger_default.warn(`systeminformation.networkStats() failed: ${e.message}`);
      throw e;
    }
  });
}
async function getDiskData() {
  return getOrFetch("disk", async () => {
    try {
      return await executeWithWorker("fsSize", async () => {
        const si2 = await import("systeminformation");
        return await si2.fsSize();
      });
    } catch (e) {
      logger_default.warn(`systeminformation.fsSize() failed: ${e.message}`);
      throw e;
    }
  });
}
async function getSystemData() {
  return getOrFetch("system", async () => {
    try {
      return await executeWithWorker("systemData", async () => {
        const si2 = await import("systeminformation");
        const [os13, ver, time] = await Promise.all([
          si2.osInfo(),
          si2.versions(),
          si2.time()
        ]);
        return { os: os13, ver, time };
      });
    } catch (e) {
      logger_default.warn(`systeminformation system data fetch failed: ${e.message}`);
      throw e;
    }
  });
}
function invalidate(key) {
  cache.delete(key);
}
function clear() {
  cache.clear();
}
function getStatus() {
  const now = Date.now();
  const status = {};
  for (const [key, entry] of cache) {
    const remaining = Math.max(0, entry.expiresAt - now);
    status[key] = {
      cached: true,
      age: now - entry.createdAt,
      ttlRemaining: remaining,
      configTtl: config_default.CACHE_CONFIG[key]?.ttl || config_default.CACHE_TTL.DEFAULT
    };
  }
  return status;
}
function debounce(fn, delay) {
  let timeoutId = null;
  let lastArgs = null;
  return function(...args) {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, lastArgs);
      timeoutId = null;
    }, delay);
  };
}
function throttle(fn, limit) {
  let lastCall = 0;
  let timeoutId = null;
  return function(...args) {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
var cache_default = {
  get,
  set,
  getOrFetch,
  getCpuData,
  getMemoryData,
  getGpuData,
  getNetworkData,
  getDiskData,
  getSystemData,
  invalidate,
  clear,
  getStatus,
  debounce,
  throttle,
  CACHE_CONFIG: config_default.CACHE_CONFIG
};

// src/database.js
var import_sql = __toESM(require_sql_wasm(), 1);
var import_fs8 = __toESM(require("fs"), 1);
var import_path8 = __toESM(require("path"), 1);
var import_url5 = require("url");
init_logger();
init_config();
var __filename6 = (0, import_url5.fileURLToPath)("file://" + (typeof __dirname6 !== "undefined" ? require("path").join(__dirname6, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname6 = import_path8.default.dirname(__filename6);
var DB_PATH = config_default.DATABASE.PATH;
var db = null;
var SQL = null;
var saveInterval = null;
var cleanupInterval = null;
async function initDatabase() {
  try {
    SQL = await (0, import_sql.default)();
    let data = null;
    try {
      if (import_fs8.default.existsSync(DB_PATH)) {
        data = import_fs8.default.readFileSync(DB_PATH);
        logger_default.info("Loaded existing database from " + DB_PATH);
      }
    } catch (err) {
      logger_default.warn("Could not load existing database: " + err.message);
    }
    db = new SQL.Database(data);
    createTables();
    saveInterval = setInterval(saveDatabase, config_default.DATABASE.SAVE_INTERVAL_MS).unref();
    cleanupInterval = setInterval(cleanupOldData, config_default.DATABASE.CLEANUP_INTERVAL_MS).unref();
    logger_default.info("Database initialized successfully");
    return true;
  } catch (err) {
    logger_default.error("Failed to initialize database: " + err.message);
    return false;
  }
}
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS session_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      agent TEXT,
      channel TEXT,
      model TEXT,
      tokens INTEGER DEFAULT 0,
      status TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_session_snapshots_created 
    ON session_snapshots(created_at)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_session_snapshots_session_id 
    ON session_snapshots(session_id)
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS cpu_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      cpu_count INTEGER,
      load_avg_1 REAL,
      load_avg_5 REAL,
      load_avg_15 REAL,
      cpu_usage_user REAL,
      cpu_usage_system REAL,
      cpu_usage_idle REAL,
      cpu_usage_irq REAL,
      cpu_usage_soft_irq REAL,
      cpu_usage_stolen REAL
    )
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_cpu_metrics_timestamp 
    ON cpu_metrics(timestamp)
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS memory_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      total_bytes INTEGER,
      used_bytes INTEGER,
      free_bytes INTEGER,
      available_bytes INTEGER,
      used_percent REAL,
      swap_total_bytes INTEGER,
      swap_used_bytes INTEGER,
      swap_free_bytes INTEGER,
      swap_used_percent REAL
    )
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_memory_metrics_timestamp 
    ON memory_metrics(timestamp)
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS network_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      interface_name TEXT,
      rx_bytes INTEGER,
      tx_bytes INTEGER,
      rx_sec REAL,
      tx_sec REAL,
      ms REAL
    )
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_network_metrics_timestamp 
    ON network_metrics(timestamp)
  `);
  logger_default.debug("Database tables created");
}
function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dir = import_path8.default.dirname(DB_PATH);
    if (!import_fs8.default.existsSync(dir)) {
      import_fs8.default.mkdirSync(dir, { recursive: true });
    }
    import_fs8.default.writeFileSync(DB_PATH, buffer);
    logger_default.debug("Database saved to disk");
  } catch (err) {
    logger_default.error("Failed to save database: " + err.message);
  }
}
function storeSessionSnapshot(session) {
  if (!db || !session) return;
  try {
    const now = Date.now();
    const sessionId = session.sessionId || session.key || null;
    const agent = session.agent || extractAgent(session.key) || "unknown";
    const channel = session.deliveryContext?.channel || session.origin?.channel || session.origin?.surface || "unknown";
    const model = session.model || session.llmModel || "unknown";
    const tokens = session.totalTokens || session.tokens || 0;
    const status = session.status || (session.systemRunning ? "running" : "idle");
    const existing = db.exec(
      "SELECT id FROM session_snapshots WHERE session_id = ? ORDER BY created_at DESC LIMIT 1",
      [sessionId]
    );
    if (existing.length > 0 && existing[0].values.length > 0) {
      db.run(
        `UPDATE session_snapshots 
         SET agent = ?, channel = ?, model = ?, tokens = ?, status = ?, updated_at = ?
         WHERE session_id = ?`,
        [agent, channel, model, tokens, status, now, sessionId]
      );
    } else {
      db.run(
        `INSERT INTO session_snapshots (session_id, agent, channel, model, tokens, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, agent, channel, model, tokens, status, now, now]
      );
    }
    logger_default.debug("Stored session snapshot: " + sessionId);
  } catch (err) {
    logger_default.error("Failed to store session snapshot: " + err.message);
  }
}
function storeCpuMetrics(cpuData) {
  if (!db || !cpuData) return;
  try {
    const now = Date.now();
    const cpus = cpuData.cpus || [cpuData];
    for (const cpu of cpus) {
      db.run(
        `INSERT INTO cpu_metrics (
          timestamp, cpu_count, load_avg_1, load_avg_5, load_avg_15,
          cpu_usage_user, cpu_usage_system, cpu_usage_idle,
          cpu_usage_irq, cpu_usage_soft_irq, cpu_usage_stolen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          now,
          cpu.cpuCount || cpu.cpu_count || cpus.length || 1,
          cpu.loadAvg1 || cpu.load_avg_1 || cpu.loadavg?.[0] || 0,
          cpu.loadAvg5 || cpu.load_avg_5 || cpu.loadavg?.[1] || 0,
          cpu.loadAvg15 || cpu.load_avg_15 || cpu.loadavg?.[2] || 0,
          cpu.cpuUsageUser || cpu.cpu_usage_user || cpu.cpuUsage?.[0] || 0,
          cpu.cpuUsageSystem || cpu.cpu_usage_system || cpu.cpuUsage?.[1] || 0,
          cpu.cpuUsageIdle || cpu.cpu_usage_idle || cpu.cpuUsage?.[2] || 100,
          cpu.cpuUsageIrq || cpu.cpu_usage_irq || cpu.cpuUsage?.[3] || 0,
          cpu.cpuUsageSoftIrq || cpu.cpu_usage_soft_irq || cpu.cpuUsage?.[4] || 0,
          cpu.cpuUsageStolen || cpu.cpu_usage_stolen || cpu.cpuUsage?.[5] || 0
        ]
      );
    }
    logger_default.debug("Stored CPU metrics");
  } catch (err) {
    logger_default.error("Failed to store CPU metrics: " + err.message);
  }
}
function storeMemoryMetrics(memoryData) {
  if (!db || !memoryData) return;
  try {
    const now = Date.now();
    db.run(
      `INSERT INTO memory_metrics (
        timestamp, total_bytes, used_bytes, free_bytes, available_bytes,
        used_percent, swap_total_bytes, swap_used_bytes, swap_free_bytes, swap_used_percent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        now,
        memoryData.totalBytes || memoryData.total_bytes || 0,
        memoryData.usedBytes || memoryData.used_bytes || 0,
        memoryData.freeBytes || memoryData.free_bytes || 0,
        memoryData.availableBytes || memoryData.available_bytes || 0,
        memoryData.usedPercent || memoryData.used_percent || 0,
        memoryData.swapTotalBytes || memoryData.swap_total_bytes || 0,
        memoryData.swapUsedBytes || memoryData.swap_used_bytes || 0,
        memoryData.swapFreeBytes || memoryData.swap_free_bytes || 0,
        memoryData.swapUsedPercent || memoryData.swap_used_percent || 0
      ]
    );
    logger_default.debug("Stored memory metrics");
  } catch (err) {
    logger_default.error("Failed to store memory metrics: " + err.message);
  }
}
function storeNetworkMetrics(networkData) {
  if (!db || !networkData) return;
  try {
    const now = Date.now();
    const interfaces = Array.isArray(networkData) ? networkData : [networkData];
    for (const iface of interfaces) {
      db.run(
        `INSERT INTO network_metrics (
          timestamp, interface_name, rx_bytes, tx_bytes, rx_sec, tx_sec, ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          now,
          iface.interfaceName || iface.interface_name || "unknown",
          iface.rxBytes || iface.rx_bytes || 0,
          iface.txBytes || iface.tx_bytes || 0,
          iface.rxSec || iface.rx_sec || 0,
          iface.txSec || iface.tx_sec || 0,
          iface.ms || 0
        ]
      );
    }
    logger_default.debug("Stored network metrics");
  } catch (err) {
    logger_default.error("Failed to store network metrics: " + err.message);
  }
}
function getSessionsLast24Hours() {
  return getSessionsByHours(24);
}
function getSessionsLast7Days() {
  return getSessionsByDays(7);
}
function getSessionsByHours(hours = 24) {
  if (!db) return [];
  try {
    const cutoff = Date.now() - hours * 60 * 60 * 1e3;
    const result = db.exec(
      `SELECT session_id, agent, channel, model, tokens, status, created_at, updated_at
       FROM session_snapshots
       WHERE created_at >= ?
       ORDER BY created_at DESC`,
      [cutoff]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => ({
      sessionId: row[0],
      agent: row[1],
      channel: row[2],
      model: row[3],
      tokens: row[4],
      status: row[5],
      createdAt: row[6],
      updatedAt: row[7]
    }));
  } catch (err) {
    logger_default.error("Failed to get sessions by hours: " + err.message);
    return [];
  }
}
function getSessionsByDays(days = 7) {
  if (!db) return [];
  try {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1e3;
    const result = db.exec(
      `SELECT session_id, agent, channel, model, tokens, status, created_at, updated_at
       FROM session_snapshots
       WHERE created_at >= ?
       ORDER BY created_at DESC`,
      [cutoff]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => ({
      sessionId: row[0],
      agent: row[1],
      channel: row[2],
      model: row[3],
      tokens: row[4],
      status: row[5],
      createdAt: row[6],
      updatedAt: row[7]
    }));
  } catch (err) {
    logger_default.error("Failed to get sessions by days: " + err.message);
    return [];
  }
}
function getCpuMetricsHistory(hours = 24) {
  if (!db) return [];
  try {
    const cutoff = Date.now() - hours * 60 * 60 * 1e3;
    const result = db.exec(
      `SELECT timestamp, cpu_count, load_avg_1, load_avg_5, load_avg_15,
              cpu_usage_user, cpu_usage_system, cpu_usage_idle
       FROM cpu_metrics
       WHERE timestamp >= ?
       ORDER BY timestamp ASC`,
      [cutoff]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => ({
      timestamp: row[0],
      cpuCount: row[1],
      loadAvg1: row[2],
      loadAvg5: row[3],
      loadAvg15: row[4],
      cpuUsageUser: row[5],
      cpuUsageSystem: row[6],
      cpuUsageIdle: row[7]
    }));
  } catch (err) {
    logger_default.error("Failed to get CPU metrics history: " + err.message);
    return [];
  }
}
function getMemoryMetricsHistory(hours = 24) {
  if (!db) return [];
  try {
    const cutoff = Date.now() - hours * 60 * 60 * 1e3;
    const result = db.exec(
      `SELECT timestamp, total_bytes, used_bytes, free_bytes, available_bytes, used_percent
       FROM memory_metrics
       WHERE timestamp >= ?
       ORDER BY timestamp ASC`,
      [cutoff]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => ({
      timestamp: row[0],
      totalBytes: row[1],
      usedBytes: row[2],
      freeBytes: row[3],
      availableBytes: row[4],
      usedPercent: row[5]
    }));
  } catch (err) {
    logger_default.error("Failed to get memory metrics history: " + err.message);
    return [];
  }
}
function getNetworkMetricsHistory(hours = 24) {
  if (!db) return [];
  try {
    const cutoff = Date.now() - hours * 60 * 60 * 1e3;
    const result = db.exec(
      `SELECT timestamp, interface_name, rx_bytes, tx_bytes, rx_sec, tx_sec
       FROM network_metrics
       WHERE timestamp >= ?
       ORDER BY timestamp ASC`,
      [cutoff]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => ({
      timestamp: row[0],
      interfaceName: row[1],
      rxBytes: row[2],
      txBytes: row[3],
      rxSec: row[4],
      txSec: row[5]
    }));
  } catch (err) {
    logger_default.error("Failed to get network metrics history: " + err.message);
    return [];
  }
}
function getMetricsSummary(hours = 24) {
  if (!db) return null;
  try {
    const cutoff = Date.now() - hours * 60 * 60 * 1e3;
    const cpuResult = db.exec(
      `SELECT 
        AVG(cpu_usage_user) as avg_user,
        MAX(cpu_usage_user) as max_user,
        AVG(load_avg_1) as avg_load
       FROM cpu_metrics
       WHERE timestamp >= ?`,
      [cutoff]
    );
    const memResult = db.exec(
      `SELECT 
        AVG(used_percent) as avg_used,
        MAX(used_percent) as max_used,
        AVG(available_bytes) as avg_available
       FROM memory_metrics
       WHERE timestamp >= ?`,
      [cutoff]
    );
    const sessionResult = db.exec(
      `SELECT COUNT(DISTINCT session_id) as session_count
       FROM session_snapshots
       WHERE created_at >= ?`,
      [cutoff]
    );
    const tokensResult = db.exec(
      `SELECT SUM(tokens) as total_tokens
       FROM session_snapshots
       WHERE created_at >= ?`,
      [cutoff]
    );
    return {
      cpu: cpuResult.length > 0 && cpuResult[0].values.length > 0 ? {
        avgUser: cpuResult[0].values[0][0] || 0,
        maxUser: cpuResult[0].values[0][1] || 0,
        avgLoad: cpuResult[0].values[0][2] || 0
      } : null,
      memory: memResult.length > 0 && memResult[0].values.length > 0 ? {
        avgUsed: memResult[0].values[0][0] || 0,
        maxUsed: memResult[0].values[0][1] || 0,
        avgAvailable: memResult[0].values[0][2] || 0
      } : null,
      sessions: sessionResult.length > 0 && sessionResult[0].values.length > 0 ? {
        count: sessionResult[0].values[0][0] || 0
      } : { count: 0 },
      tokens: tokensResult.length > 0 && tokensResult[0].values.length > 0 ? {
        total: tokensResult[0].values[0][0] || 0
      } : { total: 0 }
    };
  } catch (err) {
    logger_default.error("Failed to get metrics summary: " + err.message);
    return null;
  }
}
function cleanupOldData(days = 30) {
  if (!db) return;
  try {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1e3;
    db.run("DELETE FROM session_snapshots WHERE created_at < ?", [cutoff]);
    db.run("DELETE FROM cpu_metrics WHERE timestamp < ?", [cutoff]);
    db.run("DELETE FROM memory_metrics WHERE timestamp < ?", [cutoff]);
    db.run("DELETE FROM network_metrics WHERE timestamp < ?", [cutoff]);
    logger_default.info("Cleaned up data older than " + days + " days");
  } catch (err) {
    logger_default.error("Failed to cleanup old data: " + err.message);
  }
  try {
    saveDatabase();
  } catch (err) {
    logger_default.error("Failed to save database after cleanup: " + err.message);
  }
}
function storeMetricsSnapshot(data) {
  if (!data) return;
  if (data.cpu) {
    const cpuData = Array.isArray(data.cpu) ? { cpus: data.cpu } : data.cpu;
    storeCpuMetrics(cpuData);
  }
  if (data.memory) {
    storeMemoryMetrics(data.memory);
  }
  if (data.network) {
    storeNetworkMetrics(data.network);
  }
  if (data.sessions && data.sessions.length > 0) {
    for (const session of data.sessions) {
      storeSessionSnapshot(session);
    }
  }
}
function extractAgent(key) {
  if (!key) return "unknown";
  const parts = key.split(":");
  return parts[1] || parts[0] || "unknown";
}
function closeDatabase() {
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  if (db) {
    try {
      saveDatabase();
    } catch (err) {
      logger_default.error("Failed to save database during close: " + err.message);
    }
    try {
      db.close();
    } catch (err) {
      logger_default.error("Failed to close database: " + err.message);
    }
    db = null;
    logger_default.info("Database closed");
  }
}
var database_default = {
  initDatabase,
  closeDatabase,
  storeSessionSnapshot,
  storeCpuMetrics,
  storeMemoryMetrics,
  storeNetworkMetrics,
  storeMetricsSnapshot,
  getSessionsLast24Hours,
  getSessionsLast7Days,
  getSessionsByHours,
  getSessionsByDays,
  getCpuMetricsHistory,
  getMemoryMetricsHistory,
  getNetworkMetricsHistory,
  getMetricsSummary,
  cleanupOldData
};

// index.js
init_security();

// src/splash.js
var import_blessed = __toESM(require("blessed"), 1);
init_config();
var SPLASH_LOGO = [
  "        \u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E",
  "       \u2571  \u{1F99E}  C L A W   D A S H B O A R D  \u{1F99E} \u2572",
  "      \u2571                                      \u2572",
  "     \u2502     \u2580\u2580\u2588\u2580\u2580  \u2588\u2580\u2580\u2588 \u2588\u2580\u2580\u2588 \u2588\u2580\u2580\u2588 \u2588\u2580\u2580\u2588 \u2588\u2580\u2580     \u2502",
  "     \u2502       \u2588   \u2588\u2584\u2584\u2580 \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588 \u2588\u2584\u2584     \u2502",
  "     \u2502       \u2588   \u2588 \u2580\u2584 \u2588\u2584\u2584\u2584 \u2588\u2584\u2584\u2584 \u2588\u2584\u2584\u2584 \u2588\u2584\u2584     \u2502",
  "     \u2502       \u2588   \u2588  \u2580\u2584                       \u2502",
  "     \u2502     \u2584\u2584\u2588\u2584\u2584\u2588\u2584\u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584\u2584\u2588\u2584\u2584\u2588\u2584\u2584         \u2502",
  "     \u2502    \u2580                        \u2580        \u2502",
  "     \u2572                                      \u2571",
  "       \u2572                                  \u2571",
  "         \u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F"
];
var INIT_STATUS_MESSAGES = [
  "Initializing terminal interface...",
  "Loading configuration...",
  "Connecting to database...",
  "Setting up session monitoring...",
  "Preparing system metrics...",
  "Loading themes and preferences...",
  "Starting data refresh loops...",
  "Ready!"
];
var SPINNER_FRAMES = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
var SPINNER_SPEED = 100;
function showSplashScreen(screen) {
  return new Promise((resolve9) => {
    const splashBox = import_blessed.default.box({
      parent: screen,
      top: "center",
      left: "center",
      width: 54,
      height: SPLASH_LOGO.length + 8,
      border: { type: "double", fg: "cyan" },
      style: {
        fg: "white",
        bg: "black",
        border: { fg: "cyan", bg: "black" }
      },
      shadow: true
    });
    const logoTop = 1;
    SPLASH_LOGO.forEach((line, index) => {
      import_blessed.default.text({
        parent: splashBox,
        top: logoTop + index,
        left: "center",
        content: line,
        style: {
          fg: index === 1 ? "brightCyan" : "cyan",
          bold: index === 1,
          transparent: true
        }
      });
    });
    const spinnerText = import_blessed.default.text({
      parent: splashBox,
      top: SPLASH_LOGO.length + 2,
      left: "center",
      content: SPINNER_FRAMES[0],
      style: { fg: "brightGreen", bold: true }
    });
    const statusText = import_blessed.default.text({
      parent: splashBox,
      top: SPLASH_LOGO.length + 2,
      left: 4,
      width: 46,
      content: INIT_STATUS_MESSAGES[0],
      style: { fg: "gray" }
    });
    const progressBox = import_blessed.default.box({
      parent: splashBox,
      top: SPLASH_LOGO.length + 4,
      left: "center",
      width: 40,
      height: 1,
      style: { bg: "black" }
    });
    const progressBar = import_blessed.default.text({
      parent: progressBox,
      top: 0,
      left: 0,
      content: "\u2591".repeat(20),
      style: { fg: "dim" }
    });
    const versionText = import_blessed.default.text({
      parent: splashBox,
      bottom: 0,
      left: "center",
      content: `v${DASHBOARD_VERSION}`,
      style: { fg: "dim" }
    });
    screen.render();
    let spinnerIndex = 0;
    let statusIndex = 0;
    let progress = 0;
    let lastStatusChange = Date.now();
    const statusChangeInterval = 400;
    const animationInterval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % SPINNER_FRAMES.length;
      spinnerText.setContent(SPINNER_FRAMES[spinnerIndex]);
      if (Date.now() - lastStatusChange > statusChangeInterval) {
        statusIndex = (statusIndex + 1) % INIT_STATUS_MESSAGES.length;
        statusText.setContent(INIT_STATUS_MESSAGES[statusIndex]);
        progress = Math.min(Math.floor(statusIndex / (INIT_STATUS_MESSAGES.length - 1) * 20), 20);
        const filled = "\u2588".repeat(progress);
        const empty = "\u2591".repeat(20 - progress);
        progressBar.setContent(filled + empty);
        if (progress < 7) {
          progressBar.style.fg = "red";
        } else if (progress < 14) {
          progressBar.style.fg = "yellow";
        } else {
          progressBar.style.fg = "green";
        }
        lastStatusChange = Date.now();
      }
      screen.render();
    }, SPINNER_SPEED);
    setTimeout(() => {
      clearInterval(animationInterval);
      splashBox.destroy();
      screen.render();
      resolve9();
    }, 2500);
  });
}

// src/hints.js
var import_blessed2 = __toESM(require("blessed"), 1);
init_config();
init_logger();
var { PATHS: PATHS2, DASHBOARD_VERSION: DASHBOARD_VERSION2 } = config_default;
var HINTS = [
  {
    id: "navigation",
    title: "\u{1F4CB} Navigation Tips",
    content: [
      "Use \u2191/\u2193 arrows to navigate sessions",
      "Use h/l or \u2190/\u2192 to change pages",
      "Press Enter to select a session",
      "Press / to search sessions"
    ],
    position: { top: "center", left: "center" }
  },
  {
    id: "vi-mode",
    title: "\u2328\uFE0F  Vi-Mode Navigation",
    content: [
      "h / l : Previous/next page",
      "j / k : Select next/previous session",
      "g / G : Go to first/last page",
      "Ctrl+B / Ctrl+F : Page up/down"
    ],
    position: { top: "center", left: "center" }
  },
  {
    id: "bookmarks",
    title: "\u2B50 Bookmarks & Favorites",
    content: [
      "Press 'f' to toggle favorite on current session",
      "Press 'F' to filter/show favorites only",
      "Favorites persist across restarts",
      "Access them quickly with the F filter"
    ],
    position: { top: "center", left: "center" }
  },
  {
    id: "widgets",
    title: "\u{1F4CA} Widget Controls",
    content: [
      "Use number keys 1-7 to toggle widgets",
      "Tab to cycle through widgets",
      "Resize terminal to adjust layout",
      "Widgets auto-refresh with live data"
    ],
    position: { top: "center", left: "center" }
  },
  {
    id: "actions",
    title: "\u26A1 Quick Actions",
    content: [
      "r : Refresh data immediately",
      "s : Change sort mode",
      "e : Export session data",
      "d : View session details",
      "q : Quit dashboard"
    ],
    position: { top: "center", left: "center" }
  }
];
var dismissedHints = /* @__PURE__ */ new Set();
var currentHintIndex = 0;
var hintOverlay = null;
var screenRef = null;
function shouldShowHints(settings) {
  return settings?.firstRun === true;
}
function markFirstRunComplete(settings, saveSettingsFn) {
  if (settings && settings.firstRun) {
    settings.firstRun = false;
    if (typeof saveSettingsFn === "function") {
      saveSettingsFn(settings);
      logger_default.info("First run hints marked as complete");
    }
  }
}
function createHintBox(screen, hint, index, total) {
  const width = 50;
  const height = 14;
  const container = import_blessed2.default.box({
    parent: screen,
    top: "center",
    left: "center",
    width,
    height,
    border: { type: "line", fg: "brightCyan" },
    style: {
      bg: "black",
      border: { fg: "brightCyan" }
    },
    tags: true,
    shadow: true
  });
  import_blessed2.default.text({
    parent: container,
    top: 0,
    left: "center",
    width: width - 2,
    content: ` {bold}${hint.title}{/bold} `,
    style: {
      fg: "brightCyan",
      bg: "black"
    },
    tags: true
  });
  import_blessed2.default.line({
    parent: container,
    top: 2,
    left: 1,
    right: 1,
    orientation: "horizontal",
    style: { fg: "dim" }
  });
  let contentY = 3;
  hint.content.forEach((line) => {
    import_blessed2.default.text({
      parent: container,
      top: contentY++,
      left: 2,
      width: width - 4,
      content: `  ${line}`,
      style: {
        fg: "white",
        bg: "black"
      }
    });
  });
  import_blessed2.default.line({
    parent: container,
    top: height - 4,
    left: 1,
    right: 1,
    orientation: "horizontal",
    style: { fg: "dim" }
  });
  const navText = index < total - 1 ? " {bold}n{/bold}: Next  {bold}q{/bold}: Skip all" : " {bold}q{/bold}: Close hints  {bold}r{/bold}: Show again later";
  import_blessed2.default.text({
    parent: container,
    top: height - 3,
    left: "center",
    width: width - 2,
    content: navText,
    style: {
      fg: "gray",
      bg: "black"
    },
    tags: true
  });
  const progress = ` (${index + 1}/${total})`;
  import_blessed2.default.text({
    parent: container,
    top: height - 2,
    left: "center",
    content: progress,
    style: {
      fg: "dim",
      bg: "black"
    }
  });
  return container;
}
function showNextHint(screen) {
  if (hintOverlay) {
    hintOverlay.destroy();
    hintOverlay = null;
  }
  if (currentHintIndex >= HINTS.length) {
    return false;
  }
  const hint = HINTS[currentHintIndex];
  hintOverlay = createHintBox(screen, hint, currentHintIndex, HINTS.length);
  screen.render();
  return true;
}
async function showFirstRunHints(screen, settings, saveSettingsFn) {
  if (!shouldShowHints(settings)) {
    return;
  }
  screenRef = screen;
  currentHintIndex = 0;
  dismissedHints.clear();
  return new Promise((resolve9) => {
    showNextHint(screen);
    const keyHandler = (ch, key) => {
      if (ch === "n" || ch === " " || key.name === "right") {
        currentHintIndex++;
        if (!showNextHint(screen)) {
          if (hintOverlay) {
            hintOverlay.destroy();
            hintOverlay = null;
          }
          screen.removeListener("keypress", keyHandler);
          markFirstRunComplete(settings, saveSettingsFn);
          screen.render();
          resolve9();
        }
      }
      if (ch === "q" || key.name === "escape") {
        if (hintOverlay) {
          hintOverlay.destroy();
          hintOverlay = null;
        }
        screen.removeListener("keypress", keyHandler);
        markFirstRunComplete(settings, saveSettingsFn);
        screen.render();
        resolve9();
      }
      if (ch === "r" && currentHintIndex >= HINTS.length - 1) {
        settings.firstRun = true;
        if (typeof saveSettingsFn === "function") {
          saveSettingsFn(settings);
        }
        if (hintOverlay) {
          hintOverlay.destroy();
          hintOverlay = null;
        }
        screen.removeListener("keypress", keyHandler);
        screen.render();
        resolve9();
      }
    };
    screen.on("keypress", keyHandler);
  });
}

// index.js
init_errors();

// src/config-watcher.js
var import_fs9 = require("fs");
var import_events = require("events");
init_logger();
var DEFAULT_WATCHER_OPTIONS = {
  debounceMs: 500,
  // Debounce interval for file changes
  persistent: true,
  // Keep process running while watching
  encoding: "utf8",
  // File encoding
  usePolling: false,
  // Use polling instead of native events (more reliable on some systems)
  pollInterval: 1e3,
  // Polling interval when usePolling is true
  ignoreInitial: true
  // Ignore the initial 'add' event
};
var ConfigWatcher = class extends import_events.EventEmitter {
  constructor(options = {}) {
    super();
    this.options = { ...DEFAULT_WATCHER_OPTIONS, ...options };
    this.watchers = /* @__PURE__ */ new Map();
    this.pollWatchers = /* @__PURE__ */ new Map();
    this.lastModified = /* @__PURE__ */ new Map();
    this.debounceTimers = /* @__PURE__ */ new Map();
    this.watchedFiles = /* @__PURE__ */ new Set();
    this.isRunning = false;
  }
  /**
   * Start watching a config file
   * @param {string} filePath - Path to the file to watch
   * @param {Object} options - Optional override options
   * @returns {boolean} True if successfully started watching
   */
  watchFile(filePath, options = {}) {
    if (!filePath || typeof filePath !== "string") {
      logger_default.error("ConfigWatcher: Invalid file path provided");
      return false;
    }
    if (this.watchers.has(filePath)) {
      logger_default.debug(`ConfigWatcher: Already watching ${filePath}`);
      return true;
    }
    const opts = { ...this.options, ...options };
    if (!(0, import_fs9.existsSync)(filePath)) {
      logger_default.warn(`ConfigWatcher: File not found: ${filePath}`);
      return false;
    }
    try {
      if (opts.usePolling) {
        this._startPolling(filePath, opts);
      } else {
        this._startNativeWatch(filePath, opts);
      }
      this.watchedFiles.add(filePath);
      this.lastModified.set(filePath, Date.now());
      this.isRunning = true;
      logger_default.info(`ConfigWatcher: Started watching ${filePath}`);
      return true;
    } catch (err) {
      logger_default.error(`ConfigWatcher: Failed to watch ${filePath}: ${err.message}`);
      return false;
    }
  }
  /**
   * Stop watching a config file
   * @param {string} filePath - Path to stop watching
   */
  unwatchFile(filePath) {
    if (!this.watchers.has(filePath) && !this.pollWatchers.has(filePath)) {
      return;
    }
    const timer = this.debounceTimers.get(filePath);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(filePath);
    }
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
    }
    if (this.pollWatchers.has(filePath)) {
      (0, import_fs9.unwatchFile)(filePath);
      this.pollWatchers.delete(filePath);
    }
    this.watchedFiles.delete(filePath);
    this.lastModified.delete(filePath);
    logger_default.info(`ConfigWatcher: Stopped watching ${filePath}`);
    if (this.watchers.size === 0 && this.pollWatchers.size === 0) {
      this.isRunning = false;
    }
  }
  /**
   * Start watching multiple files
   * @param {string[]} filePaths - Array of file paths to watch
   * @returns {Object} Results with successful and failed paths
   */
  watchFiles(filePaths) {
    const results = { successful: [], failed: [] };
    for (const filePath of filePaths) {
      if (this.watchFile(filePath)) {
        results.successful.push(filePath);
      } else {
        results.failed.push(filePath);
      }
    }
    return results;
  }
  /**
   * Stop watching all files
   */
  unwatchAll() {
    for (const filePath of this.watchedFiles) {
      this.unwatchFile(filePath);
    }
  }
  /**
   * Get list of watched files
   * @returns {string[]} Array of watched file paths
   */
  getWatchedFiles() {
    return Array.from(this.watchedFiles);
  }
  /**
   * Check if a file is being watched
   * @param {string} filePath - Path to check
   * @returns {boolean} True if being watched
   */
  isWatching(filePath) {
    return this.watchedFiles.has(filePath);
  }
  /**
   * Start native file watcher (fs.watch)
   * @private
   */
  _startNativeWatch(filePath, opts) {
    const watcher = (0, import_fs9.watch)(filePath, { persistent: opts.persistent, encoding: opts.encoding });
    watcher.on("change", (eventType) => {
      if (eventType === "change") {
        this._handleChange(filePath, opts);
      }
    });
    watcher.on("error", (err) => {
      logger_default.error(`ConfigWatcher: Watcher error for ${filePath}: ${err.message}`);
      this.emit("error", { filePath, error: err });
    });
    watcher.on("close", () => {
      this.watchers.delete(filePath);
      if (this.watchers.size === 0 && this.pollWatchers.size === 0) {
        this.isRunning = false;
      }
    });
    this.watchers.set(filePath, watcher);
  }
  /**
   * Start polling-based watcher (fs.watchFile)
   * @private
   */
  _startPolling(filePath, opts) {
    (0, import_fs9.watchFile)(filePath, { persistent: opts.persistent, interval: opts.pollInterval }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        this._handleChange(filePath, opts);
      }
    });
    this.pollWatchers.set(filePath, true);
  }
  /**
   * Handle file change with debouncing
   * @private
   */
  _handleChange(filePath, opts) {
    const now = Date.now();
    const last = this.lastModified.get(filePath) || 0;
    this.lastModified.set(filePath, now);
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this._emitReload(filePath);
    }, opts.debounceMs);
    this.debounceTimers.set(filePath, timer);
  }
  /**
   * Emit reload event for a file
   * @private
   */
  _emitReload(filePath) {
    logger_default.info(`ConfigWatcher: File changed: ${filePath}`);
    this.emit("reload", { filePath, timestamp: Date.now() });
  }
  /**
   * Get watcher statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      watchedFiles: this.watchedFiles.size,
      nativeWatchers: this.watchers.size,
      pollWatchers: this.pollWatchers.size,
      pendingDebounces: this.debounceTimers.size
    };
  }
};
function createConfigWatcher(options = {}) {
  return new ConfigWatcher(options);
}
function watchSettingsFile(settingsPath, callback, options = {}) {
  if (!(0, import_fs9.existsSync)(settingsPath)) {
    logger_default.warn(`ConfigWatcher: Settings file not found: ${settingsPath}`);
    return null;
  }
  const watcher = createConfigWatcher(options);
  watcher.on("reload", async ({ filePath }) => {
    try {
      const content2 = (0, import_fs9.readFileSync)(filePath, "utf8");
      const settings = JSON.parse(content2);
      logger_default.info(`ConfigWatcher: Settings reloaded from ${filePath}`);
      if (typeof callback === "function") {
        await callback(settings, filePath);
      }
    } catch (err) {
      logger_default.error(`ConfigWatcher: Failed to reload settings: ${err.message}`);
      watcher.emit("error", { filePath, error: err });
    }
  });
  watcher.on("error", ({ filePath, error }) => {
    logger_default.error(`ConfigWatcher: Error for ${filePath}: ${error.message}`);
  });
  if (!watcher.watchFile(settingsPath)) {
    return null;
  }
  return watcher;
}

// src/plugin-reload.js
var import_path11 = require("path");
var import_url8 = require("url");
var import_fs12 = require("fs");

// src/widgets/widget-loader.js
var import_fs11 = require("fs");
var import_path10 = require("path");
var import_url7 = require("url");
init_logger();
init_config();
init_security();

// src/widgets/config-processor.js
init_logger();
var DEFAULT_PROCESSING_OPTIONS = {
  interpolateEnv: true,
  supportLegacy: true,
  validateVersion: true,
  throwOnError: false
};
function interpolateEnvVars(value, env = process.env) {
  if (typeof value !== "string") {
    return value;
  }
  const pattern = /\$\{([^}]+)\}/g;
  return value.replace(pattern, (match, content2) => {
    const colonIndex = content2.indexOf(":-");
    if (colonIndex !== -1) {
      const varName = content2.substring(0, colonIndex);
      const defaultValue = content2.substring(colonIndex + 2);
      return env[varName] !== void 0 ? env[varName] : defaultValue;
    }
    return env[content2] !== void 0 ? env[content2] : match;
  });
}
function processConfigValues(config, env = process.env, visited = /* @__PURE__ */ new Set()) {
  if (config === null || config === void 0) {
    return config;
  }
  if (typeof config === "string") {
    return interpolateEnvVars(config, env);
  }
  if (Array.isArray(config)) {
    return config.map((item) => processConfigValues(item, env, visited));
  }
  if (typeof config === "object" && config.constructor === Object) {
    if (visited.has(config)) {
      logger_default.warn("Circular reference detected in config, skipping");
      return config;
    }
    visited.add(config);
    const result = {};
    for (const [key, value] of Object.entries(config)) {
      result[key] = processConfigValues(value, env, visited);
    }
    visited.delete(config);
    return result;
  }
  return config;
}
var CONFIG_VERSION = {
  CURRENT: "1.0.0",
  MIN_SUPPORTED: "1.0.0"
};
function parseVersion(version) {
  const parts = version.split(".").map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}
function compareVersions(v1, v2) {
  const a = parseVersion(v1);
  const b = parseVersion(v2);
  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}
var migrations = /* @__PURE__ */ new Map();
function findMigrationPath(fromVersion, toVersion) {
  if (fromVersion === toVersion) {
    return [];
  }
  const directKey = `${fromVersion}\u2192${toVersion}`;
  if (migrations.has(directKey)) {
    return [migrations.get(directKey)];
  }
  for (const [key, migration] of migrations) {
    if (migration.fromVersion === fromVersion) {
      const remainingPath = findMigrationPath(migration.toVersion, toVersion);
      if (remainingPath !== null) {
        return [migration, ...remainingPath];
      }
    }
  }
  return null;
}
function validateConfigVersion(config) {
  const configVersion = config?.__version || "1.0.0";
  if (compareVersions(configVersion, CONFIG_VERSION.MIN_SUPPORTED) < 0) {
    return {
      valid: false,
      error: `Config version ${configVersion} is below minimum supported ${CONFIG_VERSION.MIN_SUPPORTED}`
    };
  }
  if (compareVersions(configVersion, CONFIG_VERSION.CURRENT) > 0) {
    return {
      valid: false,
      error: `Config version ${configVersion} is newer than current ${CONFIG_VERSION.CURRENT}. Please upgrade the dashboard.`
    };
  }
  return { valid: true, version: configVersion };
}
function migrateConfig(config, targetVersion = CONFIG_VERSION.CURRENT) {
  if (!config || typeof config !== "object") {
    return { success: false, error: "Invalid config object" };
  }
  const sourceVersion = config.__version || "1.0.0";
  if (sourceVersion === targetVersion) {
    return { success: true, config, path: [] };
  }
  const migrationPath = findMigrationPath(sourceVersion, targetVersion);
  if (migrationPath === null) {
    return {
      success: false,
      error: `No migration path from ${sourceVersion} to ${targetVersion}`
    };
  }
  let migratedConfig = { ...config };
  const path6 = [];
  try {
    for (const migration of migrationPath) {
      migratedConfig = migration.migrate(migratedConfig);
      migratedConfig.__version = migration.toVersion;
      path6.push(`${migration.fromVersion}\u2192${migration.toVersion}`);
    }
    return {
      success: true,
      config: migratedConfig,
      path: path6
    };
  } catch (err) {
    return {
      success: false,
      error: `Migration failed: ${err.message}`,
      path: path6
    };
  }
}
function processWidgetConfig(config, options = {}) {
  const opts = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
  const warnings = [];
  try {
    let processedConfig = config;
    if (opts.validateVersion) {
      const validation = validateConfigVersion(processedConfig);
      if (!validation.valid) {
        if (validation.error?.includes("below minimum")) {
          if (opts.throwOnError) {
            throw new Error(validation.error);
          }
          return { success: false, error: validation.error };
        }
        if (opts.throwOnError) {
          throw new Error(validation.error);
        }
        return { success: false, error: validation.error };
      }
      if (validation.version !== CONFIG_VERSION.CURRENT) {
        const migration = migrateConfig(processedConfig);
        if (!migration.success) {
          if (opts.throwOnError) {
            throw new Error(migration.error);
          }
          warnings.push(`Config migration failed: ${migration.error}`);
        } else {
          processedConfig = migration.config;
          if (migration.path?.length > 0) {
            warnings.push(`Migrated config: ${migration.path.join(", ")}`);
          }
        }
      }
    }
    if (opts.interpolateEnv) {
      processedConfig = processConfigValues(processedConfig);
    }
    return {
      success: true,
      config: processedConfig,
      warnings: warnings.length > 0 ? warnings : void 0
    };
  } catch (err) {
    const error = `Config processing failed: ${err.message}`;
    if (opts.throwOnError) {
      throw err;
    }
    return { success: false, error };
  }
}

// src/plugin-manifest-validator.js
var import_fs10 = require("fs");
var import_url6 = require("url");
var import_path9 = require("path");
var __filename7 = (0, import_url6.fileURLToPath)("file://" + (typeof __dirname7 !== "undefined" ? require("path").join(__dirname7, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname7 = (0, import_path9.dirname)(__filename7);
var schemaPath = (0, import_path9.join)(__dirname7, "..", "schemas", "plugin-manifest.json");
var schema;
try {
  schema = JSON.parse((0, import_fs10.readFileSync)(schemaPath, "utf8"));
} catch (err) {
  throw new Error(`Failed to load plugin manifest schema: ${err.message}`);
}
function validateType2(value, type) {
  if (type === "string") return typeof value === "string";
  if (type === "number") return typeof value === "number" && !isNaN(value);
  if (type === "boolean") return typeof value === "boolean";
  if (type === "object") return typeof value === "object" && value !== null && !Array.isArray(value);
  if (type === "array") return Array.isArray(value);
  return true;
}
function validatePattern(value, pattern) {
  const regex = new RegExp(pattern);
  return regex.test(value);
}
function validateSemver(version) {
  const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return semverPattern.test(version);
}
function validatePluginId(id) {
  const idPattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;
  return idPattern.test(id);
}
function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== "object") {
    return { valid: false, errors: ["Manifest must be a valid object"] };
  }
  const required = schema.required || [];
  for (const field of required) {
    if (!(field in manifest)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  const properties = schema.properties || {};
  for (const [key, value] of Object.entries(manifest)) {
    const propSchema = properties[key];
    if (!propSchema) {
      if (schema.additionalProperties === false) {
        errors.push(`Unknown property: ${key}`);
      }
      continue;
    }
    if (propSchema.type && !validateType2(value, propSchema.type)) {
      errors.push(`Invalid type for ${key}: expected ${propSchema.type}, got ${typeof value}`);
      continue;
    }
    if (propSchema.type === "string") {
      if (propSchema.minLength !== void 0 && value.length < propSchema.minLength) {
        errors.push(`${key} must be at least ${propSchema.minLength} characters`);
      }
      if (propSchema.maxLength !== void 0 && value.length > propSchema.maxLength) {
        errors.push(`${key} must be at most ${propSchema.maxLength} characters`);
      }
      if (propSchema.pattern && !validatePattern(value, propSchema.pattern)) {
        errors.push(`${key} format is invalid`);
      }
    }
    if (propSchema.type === "number") {
      if (propSchema.minimum !== void 0 && value < propSchema.minimum) {
        errors.push(`${key} must be at least ${propSchema.minimum}`);
      }
      if (propSchema.maximum !== void 0 && value > propSchema.maximum) {
        errors.push(`${key} must be at most ${propSchema.maximum}`);
      }
    }
    if (propSchema.type === "array" && Array.isArray(value)) {
      if (propSchema.uniqueItems) {
        const uniqueValues = new Set(value);
        if (uniqueValues.size !== value.length) {
          errors.push(`${key} contains duplicate values`);
        }
      }
      if (propSchema.items) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (propSchema.items.type && !validateType2(item, propSchema.items.type)) {
            errors.push(`${key}[${i}] must be of type ${propSchema.items.type}`);
          }
          if (propSchema.items.pattern && !validatePattern(item, propSchema.items.pattern)) {
            errors.push(`${key}[${i}] format is invalid`);
          }
          if (propSchema.items.enum && !propSchema.items.enum.includes(item)) {
            errors.push(`${key}[${i}] must be one of: ${propSchema.items.enum.join(", ")}`);
          }
        }
      }
    }
    if (propSchema.enum && !propSchema.enum.includes(value)) {
      errors.push(`${key} must be one of: ${propSchema.enum.join(", ")}`);
    }
  }
  if (manifest.version && typeof manifest.version === "string") {
    if (!validateSemver(manifest.version)) {
      errors.push("version must be a valid semantic version (e.g., 1.0.0)");
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function validatePluginIdFormat(id) {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "Plugin ID must be a non-empty string" };
  }
  if (!validatePluginId(id)) {
    return {
      valid: false,
      error: "Plugin ID must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with a hyphen/underscore"
    };
  }
  if (id.length > 64) {
    return { valid: false, error: "Plugin ID must be 64 characters or less" };
  }
  return { valid: true };
}

// src/widgets/dependency-resolver.js
function parseDependency(dep) {
  if (typeof dep === "string") {
    return { id: dep, optional: false };
  }
  if (typeof dep === "object" && dep !== null) {
    if (!dep.id || typeof dep.id !== "string") {
      throw new Error('Dependency object must have a string "id" property');
    }
    return {
      id: dep.id,
      optional: dep.optional === true,
      version: dep.version
    };
  }
  throw new Error('Dependency must be a string or an object with an "id" property');
}
function parseDependencies(metadata) {
  if (!metadata.dependencies || !Array.isArray(metadata.dependencies)) {
    return [];
  }
  const deps = [];
  for (const dep of metadata.dependencies) {
    try {
      deps.push(parseDependency(dep));
    } catch (err) {
      console.warn(`Invalid dependency format in widget "${metadata.id || "unknown"}": ${err.message}`);
    }
  }
  return deps;
}
function buildDependencyGraph(registry) {
  const graph = /* @__PURE__ */ new Map();
  for (const [id, widget] of registry) {
    const deps = parseDependencies(widget.metadata || {});
    graph.set(id, {
      id,
      dependencies: deps,
      inDegree: 0,
      dependents: /* @__PURE__ */ new Set()
    });
  }
  for (const [id, node] of graph) {
    for (const dep of node.dependencies) {
      const depNode = graph.get(dep.id);
      if (depNode) {
        depNode.dependents.add(id);
        node.inDegree++;
      }
    }
  }
  return graph;
}
function detectCircularDependency(graph) {
  const visited = /* @__PURE__ */ new Set();
  const recStack = /* @__PURE__ */ new Set();
  const path6 = [];
  function dfs(nodeId) {
    visited.add(nodeId);
    recStack.add(nodeId);
    path6.push(nodeId);
    const node = graph.get(nodeId);
    if (node) {
      for (const dep of node.dependencies) {
        const depId = dep.id;
        if (!visited.has(depId)) {
          const cycle = dfs(depId);
          if (cycle) return cycle;
        } else if (recStack.has(depId)) {
          const cycleStart = path6.indexOf(depId);
          return [...path6.slice(cycleStart), depId];
        }
      }
    }
    path6.pop();
    recStack.delete(nodeId);
    return null;
  }
  for (const [id] of graph) {
    if (!visited.has(id)) {
      const cycle = dfs(id);
      if (cycle) return cycle;
    }
  }
  return null;
}
function satisfiesVersion(version, constraint) {
  if (!version || !constraint) return true;
  const parseVersion2 = (v2) => {
    const parts = v2.replace(/^[=v]+/, "").split(".").map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  };
  const v = parseVersion2(version);
  const c = parseVersion2(constraint.replace(/^[>=^~]+/, ""));
  if (constraint.startsWith(">=")) {
    if (v.major < c.major) return false;
    if (v.major === c.major && v.minor < c.minor) return false;
    if (v.major === c.major && v.minor === c.minor && v.patch < c.patch) return false;
    return true;
  }
  if (constraint.startsWith("^")) {
    if (v.major !== c.major) return false;
    if (v.major === 0) {
      if (v.minor < c.minor) return false;
      if (v.minor === c.minor && v.patch < c.patch) return false;
    }
    return true;
  }
  if (constraint.startsWith("~")) {
    if (v.major !== c.major) return false;
    if (v.minor !== c.minor) return false;
    if (v.patch < c.patch) return false;
    return true;
  }
  return v.major === c.major && v.minor === c.minor && v.patch === c.patch;
}
function checkVersionConstraints(graph, registry) {
  const violations = {};
  for (const [id, node] of graph) {
    const widgetViolations = [];
    for (const dep of node.dependencies) {
      if (!dep.version) continue;
      const depWidget = registry.get(dep.id);
      if (!depWidget) continue;
      const depVersion = depWidget.metadata?.version;
      if (!depVersion) {
        widgetViolations.push({
          dependency: dep.id,
          constraint: dep.version,
          actual: "unknown",
          reason: "Dependency has no version specified"
        });
      } else if (!satisfiesVersion(depVersion, dep.version)) {
        widgetViolations.push({
          dependency: dep.id,
          constraint: dep.version,
          actual: depVersion,
          reason: `Version ${depVersion} does not satisfy constraint ${dep.version}`
        });
      }
    }
    if (widgetViolations.length > 0) {
      violations[id] = widgetViolations;
    }
  }
  return Object.keys(violations).length > 0 ? violations : null;
}
function findMissingDependencies(graph, registry) {
  const missing = {};
  for (const [id, node] of graph) {
    const missingDeps = [];
    for (const dep of node.dependencies) {
      if (!dep.optional && !registry.has(dep.id)) {
        missingDeps.push(dep.id);
      }
    }
    if (missingDeps.length > 0) {
      missing[id] = missingDeps;
    }
  }
  return Object.keys(missing).length > 0 ? missing : null;
}
function topologicalSort(graph, targetIds = null) {
  const inDegrees = /* @__PURE__ */ new Map();
  for (const [id, node] of graph) {
    inDegrees.set(id, node.inDegree);
  }
  const includeSet = targetIds ? new Set(targetIds) : null;
  if (includeSet) {
    const queue2 = [...targetIds];
    const visited = /* @__PURE__ */ new Set();
    for (const id of queue2) {
      if (visited.has(id)) continue;
      visited.add(id);
      const node = graph.get(id);
      if (node) {
        for (const dep of node.dependencies) {
          if (graph.has(dep.id)) {
            includeSet.add(dep.id);
            queue2.push(dep.id);
          }
        }
      }
    }
  }
  const queue = [];
  for (const [id, degree] of inDegrees) {
    if (degree === 0 && (!includeSet || includeSet.has(id))) {
      queue.push(id);
    }
  }
  queue.sort();
  const result = [];
  while (queue.length > 0) {
    const id = queue.shift();
    result.push(id);
    const node = graph.get(id);
    if (node) {
      for (const dependentId of node.dependents) {
        if (includeSet && !includeSet.has(dependentId)) continue;
        const newDegree = inDegrees.get(dependentId) - 1;
        inDegrees.set(dependentId, newDegree);
        if (newDegree === 0) {
          const insertIndex = queue.findIndex((x) => x > dependentId);
          if (insertIndex === -1) {
            queue.push(dependentId);
          } else {
            queue.splice(insertIndex, 0, dependentId);
          }
        }
      }
    }
  }
  return result;
}
function resolveDependencies(registry, options = {}) {
  const { targetIds = null, skipVersionCheck = false, allowPartial = false } = options;
  if (registry.size === 0) {
    return {
      success: true,
      order: []
    };
  }
  const graph = buildDependencyGraph(registry);
  const circularPath = detectCircularDependency(graph);
  if (circularPath) {
    return {
      success: false,
      order: [],
      error: `Circular dependency detected: ${circularPath.join(" -> ")}`,
      circularPath
    };
  }
  const missingDeps = findMissingDependencies(graph, registry);
  if (missingDeps && !allowPartial) {
    const details = Object.entries(missingDeps).map(([id, deps]) => `"${id}" requires: ${deps.join(", ")}`).join("; ");
    return {
      success: false,
      order: [],
      error: `Missing required dependencies: ${details}`,
      missingDeps
    };
  }
  if (!skipVersionCheck) {
    const violations = checkVersionConstraints(graph, registry);
    if (violations) {
      const details = Object.entries(violations).map(([id, v]) => `"${id}": ${v.map((x) => x.reason).join(", ")}`).join("; ");
      return {
        success: false,
        order: [],
        error: `Version constraint violations: ${details}`,
        constraintViolations: violations
      };
    }
  }
  const idsToSort = targetIds || Array.from(registry.keys());
  const order = topologicalSort(graph, idsToSort);
  let finalOrder = order;
  if (allowPartial && missingDeps) {
    const widgetsWithMissingDeps = new Set(Object.keys(missingDeps));
    finalOrder = order.filter((id) => !widgetsWithMissingDeps.has(id));
  }
  return {
    success: true,
    order: finalOrder,
    ...missingDeps && { missingDeps }
  };
}
function getAllDependencies(graph, widgetId, options = {}) {
  const { includeOptional = true } = options;
  const deps = /* @__PURE__ */ new Set();
  const visited = /* @__PURE__ */ new Set();
  function collect(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = graph.get(id);
    if (!node) return;
    for (const dep of node.dependencies) {
      if (!includeOptional && dep.optional) continue;
      deps.add(dep.id);
      collect(dep.id);
    }
  }
  collect(widgetId);
  return Array.from(deps);
}
function getAllDependents(graph, widgetId) {
  const dependents = /* @__PURE__ */ new Set();
  const visited = /* @__PURE__ */ new Set();
  function collect(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = graph.get(id);
    if (!node) return;
    for (const depId of node.dependents) {
      dependents.add(depId);
      collect(depId);
    }
  }
  collect(widgetId);
  return Array.from(dependents);
}
function validateWidgetDependencies(registry, widgetId) {
  const graph = buildDependencyGraph(registry);
  const node = graph.get(widgetId);
  if (!node) {
    return {
      valid: false,
      error: `Widget "${widgetId}" not found in registry`
    };
  }
  const missing = [];
  for (const dep of node.dependencies) {
    if (!dep.optional && !registry.has(dep.id)) {
      missing.push(dep.id);
    }
  }
  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required dependencies: ${missing.join(", ")}`,
      missing
    };
  }
  const circularPath = detectCircularDependency(graph);
  if (circularPath && circularPath.includes(widgetId)) {
    return {
      valid: false,
      error: `Circular dependency detected: ${circularPath.join(" -> ")}`,
      circularPath
    };
  }
  for (const dep of node.dependencies) {
    if (!dep.version) continue;
    const depWidget = registry.get(dep.id);
    if (!depWidget) continue;
    const depVersion = depWidget.metadata?.version;
    if (!depVersion) {
      return {
        valid: false,
        error: `Dependency "${dep.id}" has no version for constraint "${dep.version}"`,
        constraintViolation: { dependency: dep.id, constraint: dep.version, actual: null }
      };
    }
    if (!satisfiesVersion(depVersion, dep.version)) {
      return {
        valid: false,
        error: `Dependency "${dep.id}" version ${depVersion} does not satisfy constraint ${dep.version}`,
        constraintViolation: { dependency: dep.id, constraint: dep.version, actual: depVersion }
      };
    }
  }
  return {
    valid: true,
    dependencies: node.dependencies.map((d) => d.id),
    allDependencies: getAllDependencies(graph, widgetId)
  };
}

// src/plugin-errors.js
init_errors();
var PLUGIN_ERROR_CODES = {
  // Manifest errors
  MANIFEST_NOT_FOUND: "PLUGIN_MANIFEST_NOT_FOUND",
  MANIFEST_INVALID_JSON: "PLUGIN_MANIFEST_INVALID_JSON",
  MANIFEST_MISSING_FIELD: "PLUGIN_MANIFEST_MISSING_FIELD",
  MANIFEST_INVALID_FIELD: "PLUGIN_MANIFEST_INVALID_FIELD",
  MANIFEST_SCHEMA_ERROR: "PLUGIN_MANIFEST_SCHEMA_ERROR",
  // Entry point errors
  ENTRY_NOT_FOUND: "PLUGIN_ENTRY_NOT_FOUND",
  ENTRY_NO_EXPORT: "PLUGIN_ENTRY_NO_EXPORT",
  ENTRY_INVALID_EXPORT: "PLUGIN_ENTRY_INVALID_EXPORT",
  ENTRY_RUNTIME_ERROR: "PLUGIN_ENTRY_RUNTIME_ERROR",
  // Widget class errors
  WIDGET_MISSING_METHODS: "PLUGIN_WIDGET_MISSING_METHODS",
  WIDGET_NOT_A_CLASS: "PLUGIN_WIDGET_NOT_A_CLASS",
  WIDGET_CONSTRUCTOR_ERROR: "PLUGIN_WIDGET_CONSTRUCTOR_ERROR",
  // Security errors
  PATH_INVALID: "PLUGIN_PATH_INVALID",
  NAME_INVALID: "PLUGIN_NAME_INVALID",
  // Config errors
  CONFIG_INVALID: "PLUGIN_CONFIG_INVALID",
  CONFIG_PROCESSING_ERROR: "PLUGIN_CONFIG_PROCESSING_ERROR",
  // Dependency errors
  DEPENDENCY_MISSING: "PLUGIN_DEPENDENCY_MISSING",
  DEPENDENCY_VERSION_MISMATCH: "PLUGIN_DEPENDENCY_VERSION_MISMATCH",
  DEPENDENCY_CIRCULAR: "PLUGIN_DEPENDENCY_CIRCULAR",
  // General errors
  PLUGIN_LOAD_ERROR: "PLUGIN_LOAD_ERROR",
  PLUGIN_INIT_ERROR: "PLUGIN_INIT_ERROR"
};
var ERROR_SUGGESTIONS = {
  // Manifest suggestions
  [PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND]: {
    suggestion: "Create a plugin.json file in your plugin directory",
    docs: "https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#plugin-structure",
    example: `{
  "id": "my-widget",
  "name": "My Widget",
  "description": "A custom widget",
  "version": "1.0.0",
  "type": "widget",
  "category": "custom"
}`
  },
  [PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON]: {
    suggestion: "Fix the JSON syntax in your plugin.json file",
    commonCauses: [
      "Trailing commas after the last property",
      "Missing quotes around property names or string values",
      "Unclosed brackets or braces",
      "Comments (JSON does not support comments)"
    ],
    fix: "Use a JSON linter or validator to find the syntax error"
  },
  [PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD]: {
    suggestion: "Add the required field to your plugin.json",
    requiredFields: ["id", "name", "version", "type"],
    docs: "https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#manifest-schema"
  },
  [PLUGIN_ERROR_CODES.MANIFEST_INVALID_FIELD]: {
    suggestion: "Correct the invalid field in your plugin.json",
    commonFixes: {
      id: "Must contain only letters, numbers, hyphens, and underscores (cannot start/end with hyphen/underscore)",
      version: 'Must follow semantic versioning (e.g., "1.0.0", "2.1.0-beta.1")',
      type: 'Must be "widget" (currently the only supported type)',
      category: "Must be one of: system, monitoring, custom, example",
      priority: "Must be a number between 0 and 1000"
    }
  },
  // Entry point suggestions
  [PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND]: {
    suggestion: "Create an index.js file in your plugin directory",
    docs: "https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#widget-structure",
    example: `import { BaseWidget } from 'claw-dashboard/widgets';

export default class MyWidget extends BaseWidget {
  async init() { return true; }
  async create(screen, theme) { /* create UI */ }
  async getData() { return { value: 42 }; }
  render(data) { /* render data */ }
  async destroy() { /* cleanup */ }
}`
  },
  [PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT]: {
    suggestion: "Export your widget class from index.js",
    options: [
      "Use default export: export default class MyWidget extends BaseWidget { ... }",
      "Use named export: export class Widget extends BaseWidget { ... }"
    ],
    docs: "https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#export-formats"
  },
  [PLUGIN_ERROR_CODES.ENTRY_INVALID_EXPORT]: {
    suggestion: "Your index.js must export a valid class or constructor function",
    commonMistakes: [
      "Exporting an object literal instead of a class",
      "Forgetting to import BaseWidget",
      "Exporting a plain function instead of a class"
    ],
    fix: "Ensure you export a class that extends BaseWidget"
  },
  [PLUGIN_ERROR_CODES.ENTRY_RUNTIME_ERROR]: {
    suggestion: "Fix the runtime error in your widget code",
    tips: [
      "Check for syntax errors in your JavaScript",
      "Ensure all imported modules are installed: npm install <dependency>",
      "Check for undefined variables or misspelled function names",
      "Make sure you are using ES modules syntax (import/export)"
    ]
  },
  // Widget class suggestions
  [PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS]: {
    suggestion: "Add the required methods to your widget class",
    requiredMethods: ["render", "getData"],
    optionalMethods: ["init", "create", "destroy"],
    example: `class MyWidget extends BaseWidget {
  // Required
  async getData() {
    return { value: 123 };
  }

  render(data) {
    if (this.box) {
      this.box.setContent(String(data.value));
    }
  }

  // Optional but recommended
  async init() { return true; }
  async create(screen, theme) { /* create blessed elements */ }
  async destroy() { /* cleanup */ }
}`
  },
  [PLUGIN_ERROR_CODES.WIDGET_NOT_A_CLASS]: {
    suggestion: "Your widget must be a class that extends BaseWidget",
    example: `import { BaseWidget } from 'claw-dashboard/widgets';

export default class MyWidget extends BaseWidget {
  constructor(options) {
    super(options);
    // your initialization
  }
}`
  },
  [PLUGIN_ERROR_CODES.WIDGET_CONSTRUCTOR_ERROR]: {
    suggestion: "Fix the error in your widget constructor",
    tips: [
      "Remember to call super(options) before accessing this",
      "Ensure constructor arguments match the expected signature",
      "Check for null/undefined values in your constructor logic"
    ]
  },
  // Security suggestions
  [PLUGIN_ERROR_CODES.PATH_INVALID]: {
    suggestion: "Use a valid plugin path within the allowed directory",
    rules: [
      'Plugin paths cannot contain ".." (directory traversal)',
      "Plugin paths must be within ~/.openclaw/plugins/ or the configured plugins directory",
      "Plugin names must be alphanumeric with hyphens/underscores only"
    ]
  },
  [PLUGIN_ERROR_CODES.NAME_INVALID]: {
    suggestion: "Use a valid plugin name",
    rules: [
      "Must start and end with alphanumeric character",
      "Can contain letters, numbers, hyphens (-), and underscores (_)",
      "Cannot contain spaces or special characters",
      'Examples: "my-widget", "cpu_monitor", "plugin1"'
    ]
  },
  // Config suggestions
  [PLUGIN_ERROR_CODES.CONFIG_INVALID]: {
    suggestion: "Fix the config in your plugin.json",
    tips: [
      "Config must be a valid JSON object",
      "Property names must be quoted in JSON",
      "Check for proper nesting of objects and arrays"
    ]
  },
  // Dependency suggestions
  [PLUGIN_ERROR_CODES.DEPENDENCY_MISSING]: {
    suggestion: "Install the missing dependency",
    options: [
      "Install the missing plugin to ~/.openclaw/plugins/",
      "Add the dependency to your plugin's dependencies array in plugin.json",
      "Remove the dependency from your plugin if not needed"
    ]
  },
  [PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR]: {
    suggestion: "Remove circular dependencies between plugins",
    example: "If Plugin A depends on Plugin B, Plugin B cannot depend on Plugin A"
  },
  // General suggestions
  [PLUGIN_ERROR_CODES.PLUGIN_LOAD_ERROR]: {
    suggestion: "Check the plugin documentation and examples",
    docs: "https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md",
    examples: "See example plugins in examples/plugins/ directory"
  }
};
var PluginError = class extends DashboardError {
  constructor(code, message, details = {}) {
    super(message, code, details);
    this.name = "PluginError";
    this.code = code;
    this.pluginId = details.pluginId || details.id || "unknown";
    this.suggestion = this._getSuggestion();
    this.docs = this._getDocs();
    this.fix = this._getFix();
  }
  /**
   * Get the suggestion for this error code
   * @private
   */
  _getSuggestion() {
    const info = ERROR_SUGGESTIONS[this.code];
    return info?.suggestion || "Check the plugin documentation for more information";
  }
  /**
   * Get documentation URL for this error
   * @private
   */
  _getDocs() {
    const info = ERROR_SUGGESTIONS[this.code];
    return info?.docs || null;
  }
  /**
   * Get fix instructions for this error
   * @private
   */
  _getFix() {
    const info = ERROR_SUGGESTIONS[this.code];
    return info?.fix || info?.tips || info?.commonCauses || info?.rules || info?.options || null;
  }
  /**
   * Get a formatted error message with suggestion
   * @returns {string} Formatted error message
   */
  getFormattedMessage() {
    const lines = [
      `Plugin Error [${this.code}]: ${this.message}`,
      "",
      `Plugin: ${this.pluginId}`,
      "",
      `\u{1F4A1} Suggestion: ${this.suggestion}`
    ];
    if (this.docs) {
      lines.push("", `\u{1F4DA} Documentation: ${this.docs}`);
    }
    if (this.fix) {
      if (Array.isArray(this.fix)) {
        lines.push("", "\u{1F527} Possible fixes:");
        this.fix.forEach((f, i) => lines.push(`   ${i + 1}. ${f}`));
      } else {
        lines.push("", `\u{1F527} Fix: ${this.fix}`);
      }
    }
    const info = ERROR_SUGGESTIONS[this.code];
    if (info?.example) {
      lines.push("", "\u{1F4BB} Example:", ...info.example.split("\n").map((l) => `   ${l}`));
    }
    return lines.join("\n");
  }
  /**
   * Get a short hint for console display
   * @returns {string} Short hint message
   */
  getHint() {
    return `${this.suggestion} (see docs: ${this.docs || "PLUGINS.md"})`;
  }
  toJSON() {
    return {
      ...super.toJSON(),
      pluginId: this.pluginId,
      suggestion: this.suggestion,
      docs: this.docs,
      fix: this.fix
    };
  }
};
var PluginErrorAnalyzer = class {
  /**
   * Analyze an error and create a PluginError with helpful suggestions
   * @param {Error} originalError - The original error
   * @param {string} pluginId - Plugin ID or path
   * @param {Object} context - Additional context
   * @returns {PluginError} Enhanced plugin error
   */
  static analyze(originalError, pluginId, context = {}) {
    const { phase = "unknown", manifest = null } = context;
    const code = this._determineErrorCode(originalError, phase);
    const message = this._createMessage(code, originalError, pluginId, context);
    return new PluginError(code, message, {
      pluginId,
      originalError: originalError?.message || originalError,
      phase,
      manifest,
      stack: originalError?.stack
    });
  }
  /**
   * Determine the error code from the error and phase
   * @private
   */
  static _determineErrorCode(error, phase) {
    const msg = (error?.message || String(error)).toLowerCase();
    if (phase === "manifest") {
      if (msg.includes("enoent") || msg.includes("not found")) {
        return PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND;
      }
      if (msg.includes("json") && (msg.includes("parse") || msg.includes("syntax") || msg.includes("unexpected"))) {
        return PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON;
      }
      if (msg.includes("missing") || msg.includes("required")) {
        return PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD;
      }
      if (msg.includes("invalid")) {
        return PLUGIN_ERROR_CODES.MANIFEST_INVALID_FIELD;
      }
      return PLUGIN_ERROR_CODES.MANIFEST_SCHEMA_ERROR;
    }
    if (phase === "entry") {
      if (msg.includes("enoent") || msg.includes("not found") || msg.includes("cannot find module")) {
        return PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND;
      }
      if (msg.includes("export") || msg.includes("does not provide")) {
        return PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT;
      }
      return PLUGIN_ERROR_CODES.ENTRY_RUNTIME_ERROR;
    }
    if (phase === "widget") {
      if (msg.includes("method") || msg.includes("render") || msg.includes("getdata")) {
        return PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS;
      }
      if (msg.includes("class") || msg.includes("constructor")) {
        return PLUGIN_ERROR_CODES.WIDGET_NOT_A_CLASS;
      }
      if (msg.includes("super") || msg.includes("this")) {
        return PLUGIN_ERROR_CODES.WIDGET_CONSTRUCTOR_ERROR;
      }
    }
    if (phase === "config") {
      return PLUGIN_ERROR_CODES.CONFIG_INVALID;
    }
    if (msg.includes("path") || msg.includes("traversal") || msg.includes("unsafe")) {
      return PLUGIN_ERROR_CODES.PATH_INVALID;
    }
    if (msg.includes("name") && (msg.includes("invalid") || msg.includes("format"))) {
      return PLUGIN_ERROR_CODES.NAME_INVALID;
    }
    if (msg.includes("dependency") || msg.includes("depends")) {
      if (msg.includes("circular")) {
        return PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR;
      }
      return PLUGIN_ERROR_CODES.DEPENDENCY_MISSING;
    }
    return PLUGIN_ERROR_CODES.PLUGIN_LOAD_ERROR;
  }
  /**
   * Create a descriptive message for the error
   * @private
   */
  static _createMessage(code, error, pluginId, context) {
    const originalMsg = error?.message || String(error);
    switch (code) {
      case PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND:
        return `Plugin "${pluginId}" is missing a plugin.json manifest file`;
      case PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON:
        return `Plugin "${pluginId}" has invalid JSON in plugin.json: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD:
        return `Plugin "${pluginId}" manifest is missing required fields: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.MANIFEST_INVALID_FIELD:
        return `Invalid plugin manifest for "${pluginId}": ${originalMsg}`;
      case PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND:
        return `Plugin "${pluginId}" is missing its entry point (index.js)`;
      case PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT:
        return `Plugin "${pluginId}" index.js does not export a widget class`;
      case PLUGIN_ERROR_CODES.ENTRY_INVALID_EXPORT:
        return `Plugin "${pluginId}" exports an invalid widget class: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS:
        return `Plugin "${pluginId}" widget is missing required methods: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.WIDGET_NOT_A_CLASS:
        return `Plugin "${pluginId}" must export a class that extends BaseWidget`;
      case PLUGIN_ERROR_CODES.WIDGET_CONSTRUCTOR_ERROR:
        return `Plugin "${pluginId}" widget failed to construct: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.PATH_INVALID:
        return `Plugin "${pluginId}" has an invalid path: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.NAME_INVALID:
        return `Plugin "${pluginId}" has an invalid name format`;
      case PLUGIN_ERROR_CODES.DEPENDENCY_MISSING:
        return `Plugin "${pluginId}" is missing a dependency: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR:
        return `Plugin "${pluginId}" has circular dependencies: ${originalMsg}`;
      default:
        return `Failed to load plugin "${pluginId}": ${originalMsg}`;
    }
  }
  /**
   * Check if an error is a common plugin mistake
   * @param {Error} error - The error to check
   * @returns {Object|null} Analysis result or null
   */
  static checkCommonMistakes(error) {
    const msg = (error?.message || "").toLowerCase();
    const stack = (error?.stack || "").toLowerCase();
    const checks = [
      {
        pattern: /super\s*\(/,
        check: () => stack.includes("super") && stack.includes("constructor"),
        mistake: "Missing super() call in constructor",
        fix: "Add super(options) as the first line of your constructor"
      },
      {
        pattern: /cannot find module/,
        check: () => msg.includes("cannot find module"),
        mistake: "Missing import/module",
        fix: "Install the missing module with npm install or check the import path"
      },
      {
        pattern: /is not a function/,
        check: () => msg.includes("is not a function"),
        mistake: "Calling a non-function",
        fix: "Check that the variable is a function before calling it, or verify the import"
      },
      {
        pattern: /cannot read propert/,
        check: () => msg.includes("cannot read property") || msg.includes("cannot read properties"),
        mistake: "Accessing property of undefined/null",
        fix: "Add null checks before accessing properties: obj?.property"
      },
      {
        pattern: /trailing comma/,
        check: () => msg.includes("trailing comma") || msg.includes("unexpected token }"),
        mistake: "Trailing comma in JSON",
        fix: "Remove the comma after the last property in your JSON file"
      },
      {
        pattern: /unexpected token/i,
        check: () => msg.includes("unexpected token") && msg.includes("json"),
        mistake: "Invalid JSON syntax",
        fix: "Validate your JSON syntax - check for quotes, brackets, and commas"
      }
    ];
    for (const check of checks) {
      if (check.check()) {
        return {
          mistake: check.mistake,
          fix: check.fix,
          pattern: check.pattern
        };
      }
    }
    return null;
  }
};

// src/widgets/widget-loader.js
var import_events2 = require("events");
var { PATHS: PATHS3, WIDGETS: WIDGETS2 } = config_default;
function extractDefaultsFromSchema(configSchema) {
  if (!configSchema || typeof configSchema !== "object") {
    return {};
  }
  const result = {};
  for (const [key, value] of Object.entries(configSchema)) {
    if (value && typeof value === "object" && value.type !== void 0) {
      result[key] = value.default !== void 0 ? value.default : null;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = extractDefaultsFromSchema(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
var WidgetLoader = class extends import_events2.EventEmitter {
  constructor(options = {}) {
    super();
    this.widgetsDir = options.widgetsDir || PATHS3.WIDGETS_DIR;
    this.pluginsDir = options.pluginsDir || PATHS3.PLUGINS_DIR;
    this.loadedWidgets = /* @__PURE__ */ new Map();
    this.widgetRegistry = /* @__PURE__ */ new Map();
    this.loadPromises = /* @__PURE__ */ new Map();
    this.hooks = {
      beforeLoad: [],
      afterLoad: [],
      beforeUnload: []
    };
    this.configWatcher = null;
    this._reloadStats = {
      reloads: 0,
      errors: 0,
      lastReload: null
    };
  }
  /**
   * Register a widget without loading it
   * @param {string} id - Unique widget identifier
   * @param {Object} metadata - Widget metadata
   * @param {Function} loader - Async function that returns the widget module
   */
  register(id, metadata, loader) {
    if (this.widgetRegistry.has(id)) {
      logger_default.warn(`Widget '${id}' is already registered, overwriting`);
    }
    this.widgetRegistry.set(id, {
      id,
      metadata: {
        name: metadata.name || id,
        description: metadata.description || "",
        version: metadata.version || "1.0.0",
        author: metadata.author || "",
        category: metadata.category || "system",
        priority: metadata.priority || 100,
        lazyLoad: metadata.lazyLoad !== false,
        // default true
        dependencies: metadata.dependencies || [],
        permissions: metadata.permissions || [],
        ...metadata
      },
      loader,
      loaded: false,
      instance: null,
      error: null
    });
    logger_default.debug(`Widget '${id}' registered`);
    return this;
  }
  /**
   * Unregister a widget
   * @param {string} id - Widget identifier
   */
  async unregister(id) {
    const widget = this.widgetRegistry.get(id);
    if (!widget) {
      logger_default.warn(`Widget '${id}' not found in registry`);
      return false;
    }
    await this.runHooks("beforeUnload", widget);
    if (widget.loaded && widget.instance?.destroy) {
      try {
        await widget.instance.destroy();
      } catch (err) {
        logger_default.error(`Error destroying widget '${id}': ${err.message}`);
      }
    }
    this.loadedWidgets.delete(id);
    this.widgetRegistry.delete(id);
    this.loadPromises.delete(id);
    logger_default.debug(`Widget '${id}' unregistered`);
    return true;
  }
  /**
   * Load a widget by ID (lazy loading)
   * @param {string} id - Widget identifier
   * @returns {Promise<Object>} Loaded widget instance
   */
  async load(id) {
    if (this.loadPromises.has(id)) {
      return this.loadPromises.get(id);
    }
    const widget = this.widgetRegistry.get(id);
    if (!widget) {
      throw new Error(`Widget '${id}' not registered`);
    }
    if (widget.loaded && widget.instance) {
      return widget.instance;
    }
    const loadPromise = this._doLoad(widget);
    this.loadPromises.set(id, loadPromise);
    try {
      const instance = await loadPromise;
      return instance;
    } finally {
      this.loadPromises.delete(id);
    }
  }
  /**
   * Convenience method to register and load a widget in one call
   * @param {string} id - Unique widget identifier
   * @param {Object} metadata - Widget metadata
   * @param {Function} loader - Async function that returns the widget module
   * @returns {Promise<Object>} Loaded widget instance
   */
  async loadAndRegister(id, metadata, loader) {
    this.register(id, metadata, loader);
    return this.load(id);
  }
  /**
   * Internal method to perform the actual loading
   * @private
   */
  async _doLoad(widget) {
    const startTime = Date.now();
    try {
      await this.runHooks("beforeLoad", widget);
      await this._resolveDependencies(widget);
      const instance = await widget.loader();
      if (!instance || typeof instance !== "object") {
        throw new Error("Widget loader did not return a valid object");
      }
      this._validateWidget(instance, widget.id);
      widget.instance = instance;
      widget.loaded = true;
      widget.loadTime = Date.now() - startTime;
      widget.error = null;
      this.loadedWidgets.set(widget.id, instance);
      await this.runHooks("afterLoad", widget);
      logger_default.debug(`Widget '${widget.id}' loaded in ${widget.loadTime}ms`);
      return instance;
    } catch (err) {
      widget.error = err;
      widget.loaded = false;
      if (!(err instanceof PluginError)) {
        const enhanced = PluginErrorAnalyzer.analyze(err, widget.id, { phase: "widget" });
        logger_default.error(`Failed to load widget '${widget.id}': ${enhanced.getFormattedMessage()}`);
      } else {
        logger_default.error(`Failed to load widget '${widget.id}': ${err.getFormattedMessage()}`);
      }
      throw err;
    }
  }
  /**
   * Resolve widget dependencies
   * @private
   */
  async _resolveDependencies(widget) {
    const deps = widget.metadata.dependencies || [];
    for (const depId of deps) {
      if (!this.widgetRegistry.has(depId)) {
        const pluginError = new PluginError(
          PLUGIN_ERROR_CODES.DEPENDENCY_MISSING,
          `Dependency "${depId}" not found for widget "${widget.id}"`,
          {
            pluginId: widget.id,
            dependencyId: depId,
            availableDependencies: Array.from(this.widgetRegistry.keys())
          }
        );
        throw pluginError;
      }
      const depWidget = this.widgetRegistry.get(depId);
      if (!depWidget.loaded) {
        await this.load(depId);
      }
    }
  }
  /**
   * Validate widget has required methods
   * @private
   */
  _validateWidget(instance, id) {
    const required = ["render", "getData"];
    const missing = required.filter((method) => typeof instance[method] !== "function");
    if (missing.length > 0) {
      const pluginError = new PluginError(
        PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS,
        `Widget "${id}" is missing required methods: ${missing.join(", ")}`,
        {
          pluginId: id,
          missingMethods: missing,
          hasRender: typeof instance.render === "function",
          hasGetData: typeof instance.getData === "function"
        }
      );
      throw pluginError;
    }
  }
  /**
   * Unload a widget
   * @param {string} id - Widget identifier
   */
  async unload(id) {
    const widget = this.widgetRegistry.get(id);
    if (!widget || !widget.loaded) {
      return false;
    }
    await this.runHooks("beforeUnload", widget);
    if (widget.instance?.destroy) {
      try {
        await widget.instance.destroy();
      } catch (err) {
        logger_default.error(`Error destroying widget '${id}': ${err.message}`);
      }
    }
    widget.instance = null;
    widget.loaded = false;
    this.loadedWidgets.delete(id);
    logger_default.debug(`Widget '${id}' unloaded`);
    return true;
  }
  /**
   * Load multiple widgets in parallel
   * @param {string[]} ids - Array of widget IDs
   * @returns {Promise<Map>} Map of id to loaded instance
   */
  async loadMany(ids) {
    const results = await Promise.allSettled(
      ids.map((id) => this.load(id).then((instance) => ({ id, instance })))
    );
    const loaded = /* @__PURE__ */ new Map();
    const errors = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        loaded.set(result.value.id, result.value.instance);
      } else {
        errors.push(result.reason);
      }
    }
    if (errors.length > 0) {
      logger_default.warn(`Failed to load ${errors.length} widget(s): ${errors.map((e) => e.message).join(", ")}`);
    }
    return loaded;
  }
  /**
   * Preload widgets that are likely to be needed
   * @param {string[]} priorityIds - Widget IDs to preload
   */
  async preload(priorityIds) {
    const preloadList = priorityIds.filter((id) => {
      const widget = this.widgetRegistry.get(id);
      return widget && widget.metadata.lazyLoad && !widget.loaded;
    });
    if (preloadList.length === 0) return;
    logger_default.debug(`Preloading ${preloadList.length} widget(s)`);
    const sorted = preloadList.map((id) => ({ id, priority: this.widgetRegistry.get(id).metadata.priority })).sort((a, b) => a.priority - b.priority);
    for (const { id } of sorted.filter((w) => w.priority < 50)) {
      try {
        await this.load(id);
      } catch (err) {
      }
    }
    const remaining = sorted.filter((w) => w.priority >= 50).map((w) => w.id);
    if (remaining.length > 0) {
      this.loadMany(remaining).catch(() => {
      });
    }
  }
  /**
   * Get widget metadata without loading
   * @param {string} id - Widget identifier
   */
  getMetadata(id) {
    const widget = this.widgetRegistry.get(id);
    return widget ? { ...widget.metadata } : null;
  }
  /**
   * Get all registered widget metadata
   */
  getAllMetadata() {
    const metadata = [];
    for (const [id, widget] of this.widgetRegistry) {
      metadata.push({
        id,
        ...widget.metadata,
        loaded: widget.loaded,
        hasError: !!widget.error
      });
    }
    return metadata.sort((a, b) => a.priority - b.priority);
  }
  /**
   * Get loaded widget instance
   * @param {string} id - Widget identifier
   */
  get(id) {
    const widget = this.widgetRegistry.get(id);
    return widget?.loaded ? widget.instance : null;
  }
  /**
   * Check if widget is loaded
   * @param {string} id - Widget identifier
   */
  isLoaded(id) {
    const widget = this.widgetRegistry.get(id);
    return widget?.loaded || false;
  }
  /**
   * Add a hook
   * @param {string} type - Hook type: 'beforeLoad', 'afterLoad', 'beforeUnload'
   * @param {Function} handler - Hook handler
   */
  addHook(type, handler) {
    if (!this.hooks[type]) {
      throw new Error(`Unknown hook type: ${type}`);
    }
    this.hooks[type].push(handler);
  }
  /**
   * Run hooks for a type
   * @private
   */
  async runHooks(type, widget) {
    for (const handler of this.hooks[type]) {
      try {
        await handler(widget);
      } catch (err) {
        logger_default.error(`Hook error (${type}): ${err.message}`);
      }
    }
  }
  /**
   * Discover widgets from plugins directory
   */
  async discoverPlugins() {
    const pluginsDirValidation = validatePluginPath(this.pluginsDir, {
      allowAbsolute: true,
      mustExist: true,
      expectedType: "directory"
    });
    if (!pluginsDirValidation.valid) {
      logger_default.warn(`Plugins directory validation failed: ${pluginsDirValidation.error}`);
      return [];
    }
    const validatedPluginsDir = pluginsDirValidation.path;
    if (!(0, import_fs11.existsSync)(validatedPluginsDir)) {
      return [];
    }
    const discovered = [];
    const entries = (0, import_fs11.readdirSync)(validatedPluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const nameValidation = validatePluginName(entry.name);
      if (!nameValidation.valid) {
        logger_default.warn(`Skipping plugin directory with invalid name '${entry.name}': ${nameValidation.error}`);
        continue;
      }
      const pluginPath = (0, import_path10.join)(validatedPluginsDir, entry.name);
      const pathValidation = validatePluginPath(entry.name, {
        allowedDirs: [validatedPluginsDir],
        allowAbsolute: false,
        mustExist: true,
        expectedType: "directory"
      });
      if (!pathValidation.valid) {
        logger_default.warn(`Skipping plugin with unsafe path '${entry.name}': ${pathValidation.error}`);
        continue;
      }
      const manifestPath = (0, import_path10.join)(pluginPath, "plugin.json");
      const indexPath = (0, import_path10.join)(pluginPath, "index.js");
      const manifestValidation = validatePluginPath("plugin.json", {
        allowedDirs: [pluginPath],
        allowAbsolute: false,
        mustExist: true,
        expectedType: "file"
      });
      if (!manifestValidation.valid) {
        logger_default.warn(`Plugin '${entry.name}' has invalid manifest path: ${manifestValidation.error}`);
        continue;
      }
      const indexValidation = validatePluginPath("index.js", {
        allowedDirs: [pluginPath],
        allowAbsolute: false,
        mustExist: true,
        expectedType: "file"
      });
      if (!indexValidation.valid) {
        logger_default.warn(`Plugin '${entry.name}' has invalid entry point: ${indexValidation.error}`);
        continue;
      }
      if (!(0, import_fs11.existsSync)(manifestPath) || !(0, import_fs11.existsSync)(indexPath)) {
        continue;
      }
      try {
        const manifest = JSON.parse(await import("fs").then((m) => m.readFileSync(manifestPath, "utf8")));
        if (manifest.type !== "widget") continue;
        const validation = validateManifest(manifest);
        if (!validation.valid) {
          const pluginError = PluginErrorAnalyzer.analyze(
            new Error(validation.errors.join(", ")),
            manifest.id || entry.name,
            { phase: "manifest", manifest }
          );
          logger_default.warn(pluginError.getFormattedMessage());
          continue;
        }
        discovered.push({
          id: manifest.id || entry.name,
          manifest,
          path: pluginPath,
          entryPoint: indexPath
        });
      } catch (err) {
        if (err instanceof PluginError) {
          logger_default.warn(err.getFormattedMessage());
        } else {
          const pluginError = PluginErrorAnalyzer.analyze(err, entry.name, { phase: "manifest" });
          logger_default.warn(pluginError.getFormattedMessage());
        }
      }
    }
    return discovered;
  }
  /**
   * Load and register a plugin
   * @param {string} pluginPath - Path to plugin directory
   * @param {Object} options - Load options
   * @param {boolean} options.sanitize - Whether to sanitize config (default: true)
   * @param {boolean} options.fallbackOnError - Fall back to defaults on error (default: true)
   */
  async loadPlugin(pluginPath, options = {}) {
    const {
      sanitize: sanitize2 = true,
      fallbackOnError = true,
      eager = true
      // Default to eager loading (load immediately after register)
    } = options;
    const pathValidation = validatePluginPath(pluginPath, {
      allowedDirs: [this.pluginsDir],
      allowAbsolute: true,
      mustExist: true,
      expectedType: "directory"
    });
    if (!pathValidation.valid) {
      throw new Error(`Invalid plugin path: ${pathValidation.error}`);
    }
    const validatedPluginPath = pathValidation.path;
    const manifestPath = (0, import_path10.join)(validatedPluginPath, "plugin.json");
    const indexPath = (0, import_path10.join)(validatedPluginPath, "index.js");
    const manifestValidation = validatePluginPath(manifestPath, {
      allowedDirs: [validatedPluginPath],
      allowAbsolute: true,
      mustExist: true,
      expectedType: "file"
    });
    if (!manifestValidation.valid) {
      const error = new Error(`Invalid manifest path: ${manifestValidation.error}`);
      if (fallbackOnError) {
        logger_default.warn(`Failed to load plugin at ${validatedPluginPath}: ${error.message}`);
        return null;
      }
      throw error;
    }
    const indexValidation = validatePluginPath(indexPath, {
      allowedDirs: [validatedPluginPath],
      allowAbsolute: true,
      mustExist: true,
      expectedType: "file"
    });
    if (!indexValidation.valid) {
      const error = new Error(`Invalid entry point path: ${indexValidation.error}`);
      if (fallbackOnError) {
        logger_default.warn(`Failed to load plugin at ${validatedPluginPath}: ${error.message}`);
        return null;
      }
      throw error;
    }
    if (!(0, import_fs11.existsSync)(manifestPath)) {
      const pluginError = new PluginError(
        PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
        `Plugin manifest not found at ${validatedPluginPath}`,
        { pluginId: (0, import_path10.basename)(validatedPluginPath) }
      );
      throw pluginError;
    }
    let manifest;
    try {
      const manifestContent = await import("fs").then((m) => m.readFileSync(manifestPath, "utf8"));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      const pluginError = PluginErrorAnalyzer.analyze(err, (0, import_path10.basename)(validatedPluginPath), {
        phase: "manifest",
        path: validatedPluginPath
      });
      if (fallbackOnError) {
        logger_default.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      const pluginError = PluginErrorAnalyzer.analyze(
        new Error(`Validation failed: ${validation.errors.join(", ")}`),
        manifest.id || (0, import_path10.basename)(validatedPluginPath),
        { phase: "manifest", manifest }
      );
      if (fallbackOnError) {
        logger_default.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }
    if (!manifest.id && !manifest.name) {
      manifest.id = (0, import_path10.basename)(validatedPluginPath);
    }
    const id = manifest.id || (0, import_path10.basename)(validatedPluginPath);
    manifest._pluginPath = validatedPluginPath;
    manifest._manifestPath = manifestPath;
    manifest._indexPath = indexPath;
    let processedConfig = extractDefaultsFromSchema(manifest.config);
    if (manifest.config) {
      const processingResult = processWidgetConfig(processedConfig, {
        interpolateEnv: true,
        validateVersion: false,
        supportLegacy: true,
        throwOnError: false
      });
      if (processingResult.success) {
        processedConfig = processingResult.config;
        if (processingResult.warnings) {
          processingResult.warnings.forEach((warning) => {
            logger_default.debug(`[${id}] ${warning}`);
          });
        }
      }
      if (sanitize2) {
        try {
          processedConfig = sanitizeWidgetConfig(processedConfig);
        } catch (err) {
          logger_default.warn(`Failed to sanitize config for plugin '${id}': ${err.message}, using processed config`);
        }
      }
    }
    const loader = async () => {
      try {
        const module2 = await import((0, import_url7.pathToFileURL)(indexPath).href);
        const WidgetClass = module2.default || module2.Widget || module2;
        if (typeof WidgetClass === "function") {
          return new WidgetClass(processedConfig);
        }
        const pluginError = new PluginError(
          PLUGIN_ERROR_CODES.ENTRY_INVALID_EXPORT,
          `Plugin "${id}" does not export a valid widget class`,
          {
            pluginId: id,
            exportType: typeof WidgetClass,
            hasDefault: !!module2.default,
            hasNamed: !!module2.Widget
          }
        );
        throw pluginError;
      } catch (err) {
        if (err instanceof PluginError) {
          throw err;
        }
        const pluginError = PluginErrorAnalyzer.analyze(err, id, {
          phase: "entry",
          path: indexPath
        });
        throw pluginError;
      }
    };
    this.register(id, manifest, loader);
    const shouldLoad = eager !== false && manifest.lazyLoad !== true;
    if (shouldLoad) {
      try {
        await this.load(id);
      } catch (err) {
        if (fallbackOnError) {
          logger_default.warn(`Failed to auto-load plugin '${id}': ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    return id;
  }
  /**
   * Load all discovered plugins with error handling and fallback
   * Uses dependency resolution to ensure correct load order
   * @param {Object} options - Load options
   * @param {boolean} [options.resolveDependencies=true] - Whether to resolve and load in dependency order
   * @param {boolean} [options.allowPartial=false] - Allow partial loading when dependencies are missing
   * @returns {Object} Results with successful and failed plugin IDs
   */
  async loadAllPluginsWithFallback(options = {}) {
    const {
      sanitize: sanitize2 = true,
      fallbackOnError = true,
      continueOnError = true,
      resolveDependencies: shouldResolveDeps = true,
      allowPartial = false
    } = options;
    const discovered = await this.discoverPlugins();
    const results = {
      successful: [],
      failed: [],
      skipped: [],
      dependencyErrors: []
    };
    for (const plugin of discovered) {
      try {
        const id = await this.registerPlugin(plugin.path, { sanitize: sanitize2, fallbackOnError });
        if (id) {
          if (!results.successful.includes(id)) {
            results.successful.push(id);
          }
        } else {
          results.skipped.push(plugin.id);
          const idx = results.successful.indexOf(plugin.id);
          if (idx > -1) results.successful.splice(idx, 1);
        }
      } catch (err) {
        results.failed.push({ id: plugin.id, error: err.message });
        const idx = results.successful.indexOf(plugin.id);
        if (idx > -1) results.successful.splice(idx, 1);
        logger_default.warn(`Plugin '${plugin.id}' failed to register: ${err.message}`);
      }
    }
    if (shouldResolveDeps && this.widgetRegistry.size > 0) {
      const resolution = resolveDependencies(this.widgetRegistry, {
        allowPartial
      });
      if (!resolution.success) {
        results.dependencyErrors.push({
          error: resolution.error,
          circularPath: resolution.circularPath,
          missingDeps: resolution.missingDeps,
          constraintViolations: resolution.constraintViolations
        });
        const missingDepIds = resolution.missingDeps ? Object.entries(resolution.missingDeps).map(([id, deps]) => `${id}(${deps.join(", ")})`).join("; ") : "unknown";
        const depError = new PluginError(
          resolution.circularPath ? PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR : PLUGIN_ERROR_CODES.DEPENDENCY_MISSING,
          resolution.error,
          {
            pluginId: missingDepIds,
            circularPath: resolution.circularPath,
            missingDeps: resolution.missingDeps
          }
        );
        if (!continueOnError) {
          logger_default.error(depError.getFormattedMessage());
          return results;
        }
        logger_default.warn(depError.getFormattedMessage());
      }
      for (const id of resolution.order) {
        const widget = this.widgetRegistry.get(id);
        if (!widget || widget.loaded) continue;
        try {
          await this.load(id);
          results.successful.push(id);
        } catch (err) {
          results.failed.push({ id, error: err.message });
          logger_default.warn(`Widget '${id}' failed to load: ${err.message}`);
          if (!continueOnError && !fallbackOnError) {
            break;
          }
        }
      }
    } else {
      for (const plugin of discovered) {
        if (this.widgetRegistry.has(plugin.id)) continue;
        try {
          const id = await this.loadPlugin(plugin.path, { sanitize: sanitize2, fallbackOnError });
          if (id) {
            results.successful.push(id);
          } else {
            results.skipped.push(plugin.id);
          }
        } catch (err) {
          results.failed.push({ id: plugin.id, error: err.message });
          logger_default.warn(`Plugin '${plugin.id}' failed to load: ${err.message}`);
          if (!continueOnError && !fallbackOnError) {
            break;
          }
        }
      }
    }
    logger_default.debug(`Plugin loading complete: ${results.successful.length} loaded, ${results.failed.length} failed, ${results.skipped.length} skipped`);
    return results;
  }
  /**
   * Register a plugin without loading it (for dependency resolution)
   * @param {string} pluginPath - Path to plugin directory
   * @param {Object} options - Registration options
   * @returns {string|null} Plugin ID or null if skipped
   */
  async registerPlugin(pluginPath, options = {}) {
    const { sanitize: sanitize2 = true, fallbackOnError = true } = options;
    const pathValidation = validatePluginPath(pluginPath, {
      allowedDirs: [this.pluginsDir],
      allowAbsolute: true,
      mustExist: true,
      expectedType: "directory"
    });
    if (!pathValidation.valid) {
      throw new Error(`Invalid plugin path: ${pathValidation.error}`);
    }
    const validatedPluginPath = pathValidation.path;
    const manifestPath = (0, import_path10.join)(validatedPluginPath, "plugin.json");
    const indexPath = (0, import_path10.join)(validatedPluginPath, "index.js");
    if (!(0, import_fs11.existsSync)(manifestPath)) {
      return null;
    }
    let manifest;
    try {
      const manifestContent = await import("fs").then((m) => m.readFileSync(manifestPath, "utf8"));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      const pluginError = PluginErrorAnalyzer.analyze(err, (0, import_path10.basename)(validatedPluginPath), {
        phase: "manifest",
        path: validatedPluginPath
      });
      if (fallbackOnError) {
        logger_default.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      const pluginError = PluginErrorAnalyzer.analyze(
        new Error(`Validation failed: ${validation.errors.join(", ")}`),
        manifest.id || (0, import_path10.basename)(validatedPluginPath),
        { phase: "manifest", manifest }
      );
      if (fallbackOnError) {
        logger_default.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }
    const id = manifest.id || (0, import_path10.basename)(validatedPluginPath);
    manifest._pluginPath = validatedPluginPath;
    manifest._manifestPath = manifestPath;
    manifest._indexPath = indexPath;
    let processedConfig = {};
    if (manifest.config) {
      const processingResult = processWidgetConfig(manifest.config, {
        interpolateEnv: true,
        validateVersion: true,
        supportLegacy: true,
        throwOnError: false
      });
      if (processingResult.success) {
        processedConfig = processingResult.config;
      }
      if (sanitize2) {
        try {
          processedConfig = sanitizeWidgetConfig(processedConfig);
        } catch (err) {
          logger_default.warn(`Failed to sanitize config for plugin '${id}': ${err.message}`);
        }
      }
    }
    const loader = async () => {
      try {
        const module2 = await import((0, import_url7.pathToFileURL)(indexPath).href);
        const WidgetClass = module2.default || module2.Widget || module2;
        if (typeof WidgetClass === "function") {
          return new WidgetClass(processedConfig);
        }
        return WidgetClass;
      } catch (err) {
        logger_default.error(`Failed to load plugin '${id}': ${err.message}`);
        throw err;
      }
    };
    this.register(id, manifest, loader);
    return id;
  }
  /**
   * Load widgets in dependency order
   * @param {string[]} ids - Widget IDs to load (loads all registered if empty)
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Loading results
   */
  async loadInDependencyOrder(ids = null, options = {}) {
    const { allowPartial = false, continueOnError = true } = options;
    const targetIds = ids || Array.from(this.widgetRegistry.keys());
    const resolution = resolveDependencies(this.widgetRegistry, {
      targetIds,
      allowPartial
    });
    const results = {
      successful: [],
      failed: [],
      skipped: [],
      resolution
    };
    if (!resolution.success) {
      logger_default.error(`Dependency resolution failed: ${resolution.error}`);
      return results;
    }
    for (const id of resolution.order) {
      const widget = this.widgetRegistry.get(id);
      if (!widget || widget.loaded) continue;
      try {
        await this.load(id);
        results.successful.push(id);
      } catch (err) {
        results.failed.push({ id, error: err.message });
        if (!continueOnError) break;
      }
    }
    return results;
  }
  /**
   * Get dependency information for a widget
   * @param {string} id - Widget ID
   * @returns {Object|null} Dependency information
   */
  getDependencyInfo(id) {
    const widget = this.widgetRegistry.get(id);
    if (!widget) return null;
    const validation = validateWidgetDependencies(this.widgetRegistry, id);
    const graph = buildDependencyGraph(this.widgetRegistry);
    return {
      id,
      dependencies: widget.metadata.dependencies || [],
      allDependencies: getAllDependencies(graph, id),
      dependents: getAllDependents(graph, id),
      validation
    };
  }
  /**
   * Get the full dependency graph
   * @returns {Object} Dependency graph representation
   */
  getDependencyGraph() {
    const graph = buildDependencyGraph(this.widgetRegistry);
    const result = {};
    for (const [id, node] of graph) {
      result[id] = {
        id,
        dependencies: node.dependencies.map((d) => ({
          id: d.id,
          optional: d.optional,
          version: d.version
        })),
        dependents: Array.from(node.dependents)
      };
    }
    return result;
  }
  /**
   * Validate dependencies for one or all widgets
   * @param {string} [id] - Specific widget ID (validates all if omitted)
   * @returns {Object} Validation results
   */
  validateDependencies(id = null) {
    if (id) {
      return {
        [id]: validateWidgetDependencies(this.widgetRegistry, id)
      };
    }
    const results = {};
    for (const [widgetId] of this.widgetRegistry) {
      results[widgetId] = validateWidgetDependencies(this.widgetRegistry, widgetId);
    }
    return results;
  }
  /**
   * Get loading statistics
   */
  getStats() {
    const all = Array.from(this.widgetRegistry.values());
    return {
      total: all.length,
      loaded: all.filter((w) => w.loaded).length,
      failed: all.filter((w) => w.error).length,
      loading: this.loadPromises.size,
      averageLoadTime: all.filter((w) => w.loadTime).reduce((sum, w) => sum + w.loadTime, 0) / all.filter((w) => w.loadTime).length || 0
    };
  }
  /**
   * Clear all widgets
   */
  async clear() {
    const ids = Array.from(this.loadedWidgets.keys());
    await Promise.all(ids.map((id) => this.unload(id)));
    this.widgetRegistry.clear();
    this.loadedWidgets.clear();
    this.loadPromises.clear();
  }
  /**
   * Enable hot-reload for widget configurations
   * Watches plugin.json files and reloads widgets when changed
   * @param {Object} options - Hot-reload options
   * @param {number} options.debounceMs - Debounce interval for changes (default: 500)
   * @param {boolean} options.usePolling - Use polling instead of native events (default: false)
   * @param {boolean} options.reloadWidgets - Automatically reload widgets when config changes (default: true)
   * @returns {ConfigWatcher|null} The config watcher instance or null if disabled
   */
  enableConfigHotReload(options = {}) {
    const {
      debounceMs = 500,
      usePolling = false,
      reloadWidgets = true
    } = options;
    if (this.configWatcher) {
      logger_default.debug("Config hot-reload already enabled");
      return this.configWatcher;
    }
    this.configWatcher = new ConfigWatcher({
      debounceMs,
      usePolling
    });
    this._reloadStats = {
      reloads: 0,
      errors: 0,
      lastReload: null
    };
    this.configWatcher.on("reload", async ({ filePath, timestamp }) => {
      try {
        const widgetId = this._findWidgetIdByConfigPath(filePath);
        if (!widgetId) {
          logger_default.debug(`Config reload: Could not find widget for ${filePath}`);
          return;
        }
        logger_default.info(`Config hot-reload triggered for widget: ${widgetId}`);
        const reloadResult = await this._reloadWidgetConfig(widgetId, filePath);
        if (reloadResult.success) {
          this._reloadStats.reloads++;
          this._reloadStats.lastReload = { widgetId, timestamp };
          logger_default.info(`Config hot-reload successful for ${widgetId}`);
          this.emit?.("configReloaded", { widgetId, timestamp, config: reloadResult.config });
        } else {
          this._reloadStats.errors++;
          logger_default.error(`Config hot-reload failed for ${widgetId}: ${reloadResult.error}`);
          this.emit?.("configReloadError", { widgetId, error: reloadResult.error, timestamp });
        }
      } catch (err) {
        this._reloadStats.errors++;
        logger_default.error(`Config hot-reload error: ${err.message}`);
        this.emit?.("configReloadError", { filePath, error: err.message, timestamp });
      }
    });
    this.configWatcher.on("error", ({ filePath, error }) => {
      this._reloadStats.errors++;
      logger_default.error(`Config watcher error for ${filePath}: ${error.message}`);
      this.emit?.("configWatcherError", { filePath, error: error.message });
    });
    this._startWatchingWidgetConfigs();
    logger_default.info("Widget config hot-reload enabled");
    return this.configWatcher;
  }
  /**
   * Disable config hot-reload
   */
  disableConfigHotReload() {
    if (this.configWatcher) {
      this.configWatcher.unwatchAll();
      this.configWatcher = null;
      logger_default.info("Widget config hot-reload disabled");
    }
  }
  /**
   * Check if hot-reload is enabled
   * @returns {boolean}
   */
  isConfigHotReloadEnabled() {
    return !!this.configWatcher;
  }
  /**
   * Get hot-reload statistics
   * @returns {Object} Stats object
   */
  getHotReloadStats() {
    return {
      enabled: this.isConfigHotReloadEnabled(),
      ...this._reloadStats,
      watchedFiles: this.configWatcher?.getWatchedFiles().length || 0
    };
  }
  /**
   * Find widget ID by its config file path
   * @private
   * @param {string} configPath - Path to config file
   * @returns {string|null} Widget ID or null
   */
  _findWidgetIdByConfigPath(configPath) {
    for (const [id, widget] of this.widgetRegistry) {
      if (widget.metadata?._pluginPath) {
        const expectedPath = (0, import_path10.join)(widget.metadata._pluginPath, "plugin.json");
        if (configPath === expectedPath || configPath.endsWith(expectedPath)) {
          return id;
        }
      }
    }
    return null;
  }
  /**
   * Reload widget configuration from file
   * @private
   * @param {string} widgetId - Widget ID
   * @param {string} filePath - Path to plugin.json
   * @returns {Object} Reload result { success: boolean, config?: Object, error?: string }
   */
  async _reloadWidgetConfig(widgetId, filePath) {
    const widget = this.widgetRegistry.get(widgetId);
    if (!widget) {
      return { success: false, error: "Widget not found in registry" };
    }
    try {
      const fs17 = await import("fs");
      const manifestContent = fs17.readFileSync(filePath, "utf8");
      const manifest = JSON.parse(manifestContent);
      const validation = validateManifest(manifest);
      if (!validation.valid) {
        return { success: false, error: `Manifest validation failed: ${validation.errors.join(", ")}` };
      }
      let newConfig = {};
      if (manifest.config) {
        const processingResult = processWidgetConfig(manifest.config, {
          interpolateEnv: true,
          validateVersion: true,
          supportLegacy: true,
          throwOnError: false
        });
        if (!processingResult.success) {
          return { success: false, error: `Config processing failed: ${processingResult.error}` };
        }
        newConfig = processingResult.config;
        try {
          newConfig = sanitizeWidgetConfig(newConfig);
        } catch (err) {
          return { success: false, error: `Config sanitization failed: ${err.message}` };
        }
      }
      widget.metadata = {
        ...widget.metadata,
        ...manifest,
        config: newConfig
      };
      if (widget.loaded && widget.instance) {
        if (widget.instance.config) {
          widget.instance.config = newConfig;
        } else {
          widget.instance.config = newConfig;
        }
        if (typeof widget.instance.onConfigChange === "function") {
          try {
            await widget.instance.onConfigChange(newConfig, widget.instance.config);
          } catch (err) {
            logger_default.warn(`Widget ${widgetId} onConfigChange failed: ${err.message}`);
          }
        }
      }
      return { success: true, config: newConfig };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  /**
   * Start watching all widget config files
   * @private
   */
  _startWatchingWidgetConfigs() {
    if (!this.configWatcher) return;
    for (const [id, widget] of this.widgetRegistry) {
      if (widget.metadata?._pluginPath) {
        const configPath = (0, import_path10.join)(widget.metadata._pluginPath, "plugin.json");
        this.configWatcher.watchFile(configPath);
      }
    }
  }
  /**
   * Watch a specific widget's config file
   * @param {string} widgetId - Widget ID to watch
   * @returns {boolean} True if watching started
   */
  watchWidgetConfig(widgetId) {
    if (!this.configWatcher) {
      logger_default.warn("Config hot-reload not enabled, call enableConfigHotReload() first");
      return false;
    }
    const widget = this.widgetRegistry.get(widgetId);
    if (!widget?.metadata?._pluginPath) {
      logger_default.warn(`Widget ${widgetId} does not have a plugin path to watch`);
      return false;
    }
    const configPath = (0, import_path10.join)(widget.metadata._pluginPath, "plugin.json");
    return this.configWatcher.watchFile(configPath);
  }
  /**
   * Stop watching a specific widget's config file
   * @param {string} widgetId - Widget ID to unwatch
   */
  unwatchWidgetConfig(widgetId) {
    if (!this.configWatcher) return;
    const widget = this.widgetRegistry.get(widgetId);
    if (!widget?.metadata?._pluginPath) return;
    const configPath = (0, import_path10.join)(widget.metadata._pluginPath, "plugin.json");
    this.configWatcher.unwatchFile(configPath);
  }
};

// src/plugin-reload.js
init_logger();
init_config();
var import_meta = {};
var { PATHS: PATHS4 } = config_default;
var PluginReloadManager = class {
  constructor(options = {}) {
    this.widgetLoader = options.widgetLoader || null;
    this.pluginsDir = options.pluginsDir || PATHS4.PLUGINS_DIR;
    this.watcher = null;
    this.watchedPlugins = /* @__PURE__ */ new Map();
    this.isRunning = false;
    this.options = {
      debounceMs: 300,
      // Faster debounce for dev mode
      persistent: true,
      usePolling: false,
      pollInterval: 500,
      autoReload: true,
      // Automatically reload on change
      showNotifications: true,
      // Show reload notifications
      ...options
    };
    this.hooks = {
      beforeReload: [],
      afterReload: [],
      onError: []
    };
  }
  /**
   * Set the widget loader instance
   * @param {WidgetLoader} loader - WidgetLoader instance
   */
  setWidgetLoader(loader) {
    this.widgetLoader = loader;
  }
  /**
   * Add a hook
   * @param {string} type - Hook type: 'beforeReload', 'afterReload', 'onError'
   * @param {Function} handler - Hook handler
   */
  addHook(type, handler) {
    if (!this.hooks[type]) {
      throw new Error(`Unknown hook type: ${type}`);
    }
    this.hooks[type].push(handler);
  }
  /**
   * Run hooks for a type
   * @private
   */
  async runHooks(type, data) {
    for (const handler of this.hooks[type]) {
      try {
        await handler(data);
      } catch (err) {
        logger_default.error(`PluginReloadManager hook error (${type}): ${err.message}`);
      }
    }
  }
  /**
   * Start watching plugins directory for changes
   * @returns {boolean} True if started successfully
   */
  start() {
    if (this.isRunning) {
      logger_default.debug("PluginReloadManager: Already running");
      return true;
    }
    if (!this.widgetLoader) {
      logger_default.error("PluginReloadManager: No WidgetLoader set. Call setWidgetLoader() first.");
      return false;
    }
    try {
      this.watcher = new ConfigWatcher({
        debounceMs: this.options.debounceMs,
        persistent: this.options.persistent,
        usePolling: this.options.usePolling,
        pollInterval: this.options.pollInterval
      });
      this.watcher.on("reload", async ({ filePath }) => {
        await this._handleFileChange(filePath);
      });
      this.watcher.on("error", ({ filePath, error }) => {
        logger_default.error(`PluginReloadManager: Watcher error for ${filePath}: ${error.message}`);
        this.runHooks("onError", { filePath, error, type: "watch" });
      });
      this._scanAndWatchPlugins();
      this.isRunning = true;
      logger_default.info("PluginReloadManager: Started watching for plugin changes");
      return true;
    } catch (err) {
      logger_default.error(`PluginReloadManager: Failed to start: ${err.message}`);
      return false;
    }
  }
  /**
   * Stop watching for changes
   */
  stop() {
    if (!this.isRunning) {
      return;
    }
    if (this.watcher) {
      this.watcher.unwatchAll();
      this.watcher = null;
    }
    this.watchedPlugins.clear();
    this.isRunning = false;
    logger_default.info("PluginReloadManager: Stopped");
  }
  /**
   * Scan plugins directory and watch all manifests
   * @private
   */
  _scanAndWatchPlugins() {
    if (!(0, import_fs12.existsSync)(this.pluginsDir)) {
      logger_default.warn(`PluginReloadManager: Plugins directory not found: ${this.pluginsDir}`);
      return;
    }
    try {
      const entries = (0, import_fs12.readdirSync)(this.pluginsDir, { withFileTypes: true });
      let watchCount = 0;
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const pluginPath = (0, import_path11.join)(this.pluginsDir, entry.name);
        const manifestPath = (0, import_path11.join)(pluginPath, "plugin.json");
        const indexPath = (0, import_path11.join)(pluginPath, "index.js");
        if (!(0, import_fs12.existsSync)(manifestPath)) continue;
        this.watchedPlugins.set(entry.name, {
          manifestPath,
          indexPath,
          pluginPath,
          id: entry.name
        });
        if (this.watcher.watchFile(manifestPath)) {
          watchCount++;
        }
        if ((0, import_fs12.existsSync)(indexPath)) {
          if (this.watcher.watchFile(indexPath)) {
            watchCount++;
          }
        }
      }
      logger_default.info(`PluginReloadManager: Watching ${this.watchedPlugins.size} plugins (${watchCount} files)`);
    } catch (err) {
      logger_default.error(`PluginReloadManager: Failed to scan plugins: ${err.message}`);
    }
  }
  /**
   * Handle file change event
   * @private
   * @param {string} filePath - Path of changed file
   */
  async _handleFileChange(filePath) {
    const pluginInfo = this._findPluginByPath(filePath);
    if (!pluginInfo) {
      logger_default.debug(`PluginReloadManager: Changed file not associated with a known plugin: ${filePath}`);
      return;
    }
    const { id, pluginPath, manifestPath, indexPath } = pluginInfo;
    logger_default.info(`PluginReloadManager: Detected change in plugin '${id}'`);
    if (!this.options.autoReload) {
      logger_default.info(`PluginReloadManager: Auto-reload disabled, skipping reload of '${id}'`);
      return;
    }
    await this.reloadPlugin(id, pluginPath, manifestPath, indexPath);
  }
  /**
   * Find plugin info by file path
   * @private
   */
  _findPluginByPath(filePath) {
    for (const [id, info] of this.watchedPlugins) {
      if (filePath === info.manifestPath || filePath === info.indexPath) {
        return { ...info, id };
      }
    }
    return null;
  }
  /**
   * Reload a single plugin
   * @param {string} id - Plugin ID
   * @param {string} pluginPath - Path to plugin directory
   * @param {string} manifestPath - Path to plugin.json
   * @param {string} indexPath - Path to index.js
   * @returns {Object} Reload result
   */
  async reloadPlugin(id, pluginPath, manifestPath, indexPath) {
    const startTime = Date.now();
    try {
      await this.runHooks("beforeReload", { id, pluginPath, manifestPath, indexPath });
      const isLoaded = this.widgetLoader.isLoaded(id);
      const wasRegistered = this.widgetLoader.widgetRegistry.has(id);
      logger_default.debug(`PluginReloadManager: Reloading plugin '${id}' (was loaded: ${isLoaded}, was registered: ${wasRegistered})`);
      if (wasRegistered) {
        try {
          await this.widgetLoader.unregister(id);
          logger_default.debug(`PluginReloadManager: Unregistered plugin '${id}'`);
        } catch (err) {
          logger_default.warn(`PluginReloadManager: Error unregistering plugin '${id}': ${err.message}`);
        }
      }
      this._clearModuleCache(indexPath);
      const newId = await this.widgetLoader.loadPlugin(pluginPath, {
        sanitize: true,
        fallbackOnError: false
      });
      const loadTime = Date.now() - startTime;
      await this._updateWatchedFiles(id, pluginPath, manifestPath, indexPath);
      await this.runHooks("afterReload", {
        id: newId,
        pluginPath,
        manifestPath,
        indexPath,
        loadTime,
        isNew: !wasRegistered
      });
      if (this.options.showNotifications) {
        logger_default.info(`\u2713 Plugin '${newId}' reloaded successfully in ${loadTime}ms`);
      }
      return {
        success: true,
        id: newId,
        loadTime,
        isNew: !wasRegistered
      };
    } catch (err) {
      logger_default.error(`\u2717 Failed to reload plugin '${id}': ${err.message}`);
      await this.runHooks("onError", {
        id,
        pluginPath,
        manifestPath,
        indexPath,
        error: err,
        type: "reload"
      });
      return {
        success: false,
        id,
        error: err.message
      };
    }
  }
  /**
   * Clear module cache for a file
   * @private
   * @param {string} filePath - Path to clear from cache
   */
  _clearModuleCache(filePath) {
    try {
      const fileUrl = (0, import_url8.pathToFileURL)(filePath).href;
      if (import_meta.resolve && typeof import_meta.resolve === "function") {
      }
      logger_default.debug(`PluginReloadManager: Module cache cleared for ${filePath}`);
    } catch (err) {
      logger_default.debug(`PluginReloadManager: Could not clear module cache: ${err.message}`);
    }
  }
  /**
   * Update watched files for a plugin
   * @private
   */
  async _updateWatchedFiles(id, pluginPath, manifestPath, indexPath) {
    if ((0, import_fs12.existsSync)(manifestPath)) {
      this.watcher.watchFile(manifestPath);
    }
    if ((0, import_fs12.existsSync)(indexPath)) {
      this.watcher.watchFile(indexPath);
    }
    this.watchedPlugins.set(id, {
      manifestPath,
      indexPath,
      pluginPath,
      id
    });
  }
  /**
   * Manually trigger reload of a specific plugin
   * @param {string} id - Plugin ID to reload
   * @returns {Object} Reload result
   */
  async reload(id) {
    const pluginInfo = this.watchedPlugins.get(id);
    if (!pluginInfo) {
      throw new Error(`Plugin '${id}' is not being watched`);
    }
    return this.reloadPlugin(id, pluginInfo.pluginPath, pluginInfo.manifestPath, pluginInfo.indexPath);
  }
  /**
   * Add a new plugin to watch
   * @param {string} pluginPath - Path to plugin directory
   * @returns {boolean} True if added successfully
   */
  async addPlugin(pluginPath) {
    const pluginId = (0, import_path11.basename)(pluginPath);
    const manifestPath = (0, import_path11.join)(pluginPath, "plugin.json");
    const indexPath = (0, import_path11.join)(pluginPath, "index.js");
    if (!(0, import_fs12.existsSync)(manifestPath)) {
      throw new Error(`Plugin manifest not found at ${pluginPath}`);
    }
    this.watchedPlugins.set(pluginId, {
      manifestPath,
      indexPath,
      pluginPath,
      id: pluginId
    });
    let watched = 0;
    if (this.watcher?.watchFile(manifestPath)) watched++;
    if ((0, import_fs12.existsSync)(indexPath) && this.watcher?.watchFile(indexPath)) watched++;
    logger_default.debug(`PluginReloadManager: Added plugin '${pluginId}' to watch list (${watched} files)`);
    return true;
  }
  /**
   * Remove a plugin from watching
   * @param {string} id - Plugin ID to remove
   */
  removePlugin(id) {
    const pluginInfo = this.watchedPlugins.get(id);
    if (!pluginInfo) {
      return false;
    }
    if (this.watcher) {
      this.watcher.unwatchFile(pluginInfo.manifestPath);
      this.watcher.unwatchFile(pluginInfo.indexPath);
    }
    this.watchedPlugins.delete(id);
    logger_default.debug(`PluginReloadManager: Removed plugin '${id}' from watch list`);
    return true;
  }
  /**
   * Get list of watched plugins
   * @returns {string[]} Array of plugin IDs
   */
  getWatchedPlugins() {
    return Array.from(this.watchedPlugins.keys());
  }
  /**
   * Check if a plugin is being watched
   * @param {string} id - Plugin ID
   * @returns {boolean}
   */
  isWatching(id) {
    return this.watchedPlugins.has(id);
  }
  /**
   * Get statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      watchedPlugins: this.watchedPlugins.size,
      watchedFiles: this.watcher?.getWatchedFiles().length || 0,
      autoReload: this.options.autoReload
    };
  }
};

// src/plugin-scaffold.js
var import_fs13 = require("fs");
var import_path12 = require("path");
var import_os6 = require("os");
var import_readline = __toESM(require("readline"), 1);
function createReadlineInterface() {
  return import_readline.default.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}
function prompt(question) {
  return new Promise((resolve9) => {
    const rl = createReadlineInterface();
    rl.question(question, (answer) => {
      rl.close();
      resolve9(answer);
    });
  });
}
async function promptWithDefault(question, defaultValue) {
  const answer = await prompt(`${question} [${defaultValue}]: `);
  return answer.trim() || defaultValue;
}
async function promptChoice(question, choices, defaultIndex = 0) {
  const options = choices.map((c, i) => `  ${i + 1}. ${c}`).join("\n");
  while (true) {
    const answer = await prompt(`${question}
${options}
Select (1-${choices.length}) [${defaultIndex + 1}]: `);
    const input = answer.trim() || String(defaultIndex + 1);
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 1 && num <= choices.length) {
      return choices[num - 1];
    }
    console.log("Invalid selection. Please enter a number between 1 and " + choices.length);
  }
}
async function runInteractiveMode() {
  console.log("");
  console.log("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557");
  console.log("\u2551     Claw Dashboard - Create New Widget Plugin               \u2551");
  console.log("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
  console.log("");
  const id = await prompt('Plugin ID (kebab-case, e.g., "my-widget"): ');
  if (!id.trim()) {
    console.log("Error: Plugin ID is required");
    return null;
  }
  const idValidation = validatePluginId2(id.trim());
  if (!idValidation.valid) {
    console.log("Error: " + idValidation.error);
    return null;
  }
  const defaultName = id.trim().split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const name = await promptWithDefault("Display name", defaultName);
  const templates = listTemplates();
  const templateNames = templates.map((t) => t.name + " (" + t.id + ")");
  const selectedTemplate = await promptChoice("Select template:", templateNames, 0);
  const template = templates[templateNames.indexOf(selectedTemplate)].id;
  const author = await promptWithDefault("Author name/email", "");
  const category = await promptChoice("Select category:", ["Custom", "System", "Monitoring", "Example"], 0);
  const description = await promptWithDefault("Description", "A custom widget for Claw Dashboard");
  console.log("");
  console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  console.log("Summary:");
  console.log("  ID:          " + id.trim());
  console.log("  Name:        " + name);
  console.log("  Template:    " + template);
  console.log("  Category:    " + category.toLowerCase());
  console.log("  Author:      " + (author || "(none)"));
  console.log("  Description: " + description);
  console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  console.log("");
  const confirm = await promptChoice("Create plugin?", ["Yes", "No"], 0);
  if (confirm !== "Yes") {
    console.log("Cancelled.");
    return null;
  }
  return {
    id: id.trim(),
    name,
    template,
    author,
    category: category.toLowerCase(),
    description
  };
}
var TEMPLATES = {
  basic: {
    name: "Basic Widget",
    description: "Simple widget with minimal setup - displays static or simple data",
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: options.description || "A custom widget plugin for Claw Dashboard",
      version: "1.0.0",
      author: author || "",
      category: options.category || "custom",
      type: "widget",
      lazyLoad: true,
      priority: 100,
      config: {
        message: "Hello, World!",
        showTimestamp: true
      },
      __version: 1
    }),
    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Generated by clawdash create-plugin
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - A custom widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'A custom widget';
  }

  /**
   * Initialize the widget
   * Called once when the widget is first loaded
   */
  async init() {
    this.log('info', '${className} widget initialized');
    return true;
  }

  /**
   * Create the widget UI
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');

    // Create main container
    this.box = blessed.default.box({
      parent: screen,
      width: '50%',
      height: 10,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create content text
    this.contentText = blessed.default.text({
      parent: this.box,
      top: 2,
      left: 1,
      content: 'Loading...',
      style: { fg: C.white || 'white' },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    return this;
  }

  /**
   * Get data for the widget
   * Fetch and return data for rendering
   */
  async getData() {
    const message = this.config.message || 'Hello, World!';
    const showTimestamp = this.config.showTimestamp !== false;

    return {
      message,
      timestamp: showTimestamp ? new Date().toISOString() : null,
    };
  }

  /**
   * Render the widget with data
   * @param {Object} data - Data from getData()
   */
  render(data) {
    if (!this.box || !data) return;

    let content = data.message;
    if (data.timestamp) {
      content += '\\n[' + data.timestamp + ']';
    }

    this.contentText.setContent(content);
  }

  /**
   * Destroy the widget
   * Clean up resources
   */
  async destroy() {
    if (this.box) {
      this.box.destroy();
      this.box = null;
    }
    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

// Export named export for flexibility
export { ${className} };
`
  },
  api: {
    name: "API Widget",
    description: "Widget with API fetching, error handling, and retry logic",
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: options.description || "A widget that fetches data from an external API",
      version: "1.0.0",
      author: author || "",
      category: options.category || "monitoring",
      type: "widget",
      lazyLoad: true,
      priority: 100,
      config: {
        apiUrl: "${API_URL:-https://api.github.com/zen}",
        apiKey: "${API_KEY:-}",
        refreshInterval: 6e4,
        timeout: 5e3,
        retries: 3
      },
      __version: 1
    }),
    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * API-powered widget with error handling and retry logic
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - API-powered widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'API-powered widget';

    // Internal state
    this.loading = false;
    this.error = null;
    this.lastFetch = null;
    this.refreshTimer = null;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
    return true;
  }

  /**
   * Create the widget UI
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');

    this.screen = screen;
    this.theme = theme;

    // Main container
    this.box = blessed.default.box({
      parent: screen,
      width: '50%',
      height: 7,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: { border: { fg: C.cyan || 'cyan' } },
    });

    // Status line
    this.statusText = blessed.default.text({
      parent: this.box,
      top: 0,
      left: 1,
      content: 'Initializing...',
      style: { fg: C.gray || 'gray' },
    });

    // Data content
    this.contentText = blessed.default.text({
      parent: this.box,
      top: 1,
      left: 1,
      content: '',
      style: { fg: C.white || 'white' },
      wrap: true,
    });

    // Last updated
    this.updatedText = blessed.default.text({
      parent: this.box,
      top: 3,
      left: 1,
      content: 'Never updated',
      style: { fg: C.gray || 'gray' },
    });

    // Stats
    this.statsText = blessed.default.text({
      parent: this.box,
      top: 4,
      left: 1,
      content: 'Requests: 0 | Errors: 0',
      style: { fg: C.gray || 'gray' },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    const refreshInterval = this.config.refreshInterval || 60000;
    if (refreshInterval > 0) {
      this.startAutoRefresh(refreshInterval);
    }

    return this;
  }

  /**
   * Fetch data from the configured API
   */
  async getData() {
    const apiUrl = this.config.apiUrl || 'https://api.github.com/zen';
    const timeout = this.config.timeout || 5000;
    const maxRetries = this.config.retries || 3;

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.loading = true;
        this.error = null;
        this.updateStatus('loading', 'Fetching (attempt ' + attempt + '/' + maxRetries + ')...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Claw-Dashboard-Widget/1.0',
            ...(this.config.apiKey && { 'Authorization': 'Bearer ' + this.config.apiKey }),
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }

        // Handle different response types
        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        this.loading = false;
        this.lastFetch = new Date();

        return {
          success: true,
          data,
          timestamp: this.lastFetch.toISOString(),
          apiUrl,
        };
      } catch (err) {
        lastError = err;
        this.log('warn', 'API fetch attempt ' + attempt + ' failed: ' + err.message);

        if (err.name === 'AbortError') {
          break;
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All retries failed
    this.loading = false;
    this.error = lastError;

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      apiUrl,
    };
  }

  /**
   * Render the widget with fetched data
   */
  render(result) {
    if (!this.box) return;

    if (result.success) {
      this.updateStatus('success', 'Connected');

      // Format the data for display
      let content;
      if (typeof result.data === 'object') {
        content = JSON.stringify(result.data, null, 0).slice(0, 100);
      } else {
        content = String(result.data).slice(0, 100);
      }

      this.contentText.setContent(content);
      this.contentText.style.fg = this.theme?.colors?.white || 'white';
    } else {
      this.updateStatus('error', 'Error: ' + result.error);
      this.contentText.setContent('Unable to fetch data');
      this.contentText.style.fg = this.theme?.colors?.red || 'red';
    }

    this.updatedText.setContent('Last: ' + (result.timestamp || 'Never'));

    const stats = this.getStats();
    this.statsText.setContent('Requests: ' + stats.requests + ' | Errors: ' + stats.errors);
  }

  /**
   * Update the status indicator
   */
  updateStatus(status, message) {
    const colors = {
      loading: this.theme?.colors?.yellow || 'yellow',
      success: this.theme?.colors?.green || 'green',
      error: this.theme?.colors?.red || 'red',
    };

    this.statusText.setContent(message);
    this.statusText.style.fg = colors[status] || 'white';
  }

  /**
   * Track request statistics
   */
  getStats() {
    if (!this._stats) {
      this._stats = { requests: 0, errors: 0 };
    }
    return this._stats;
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh(intervalMs) {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      if (!this.loading) {
        this.getData()
          .then(data => this.render(data))
          .catch(err => this.log('error', 'Auto-refresh failed: ' + err.message));
      }
    }, intervalMs);

    this.log('debug', 'Auto-refresh started (' + intervalMs + 'ms interval)');
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      this.log('debug', 'Auto-refresh stopped');
    }
  }

  /**
   * Destroy the widget
   */
  async destroy() {
    this.stopAutoRefresh();

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`
  },
  chart: {
    name: "Chart Widget",
    description: "Widget with real-time line chart visualization using blessed-contrib",
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: options.description || "A widget that displays real-time data with charts",
      version: "1.0.0",
      author: author || "",
      category: options.category || "monitoring",
      type: "widget",
      lazyLoad: true,
      priority: 100,
      config: {
        metricType: "cpu",
        maxDataPoints: 30,
        refreshInterval: 2e3,
        showLegend: true
      },
      __version: 1
    }),
    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Chart widget with real-time data visualization using blessed-contrib
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Chart widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Chart widget with real-time data';

    // Chart configuration
    this.metricType = this.config.metricType || 'cpu';
    this.maxDataPoints = this.config.maxDataPoints || 30;
    this.refreshInterval = this.config.refreshInterval || 2000;
    this.showLegend = this.config.showLegend !== false;

    // Data storage for time series
    this.dataHistory = { labels: [], values: [] };

    // Widget state
    this.chart = null;
    this.refreshTimer = null;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
    return true;
  }

  /**
   * Create the widget UI with blessed-contrib line chart
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');
    const contrib = await import('blessed-contrib');

    this.screen = screen;
    this.theme = theme;

    // Create main container box
    this.box = blessed.default.box({
      parent: screen,
      width: '70%',
      height: 17,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create the line chart using blessed-contrib
    this.chart = contrib.default.line({
      parent: this.box,
      top: 1,
      left: 1,
      width: '95%',
      height: 14,
      style: {
        line: C.green || 'green',
        text: C.white || 'white',
        baseline: C.gray || 'gray',
      },
      xLabelPadding: 3,
      xPadding: 5,
      numYLabels: 5,
      showNthLabel: Math.ceil(this.maxDataPoints / 6),
      showLegend: this.showLegend,
      legend: { width: 12 },
      minY: 0,
      maxY: 100,
      wholeNumbersOnly: true,
    });

    // Add info text
    this.infoText = blessed.default.text({
      parent: this.box,
      bottom: 0,
      left: 1,
      content: 'Initializing...',
      style: { fg: C.gray || 'gray' },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Generate sample data - customize this for your data source
   */
  async getData() {
    const now = new Date();
    const timeLabel = now.getHours().toString().padStart(2, '0') + ':' +
                     now.getMinutes().toString().padStart(2, '0') + ':' +
                     now.getSeconds().toString().padStart(2, '0');

    // Generate sample data - replace with actual data fetching
    const baseValue = 30;
    const variance = Math.random() * 40;
    const value = Math.min(100, Math.max(0, Math.floor(baseValue + variance)));

    // Store in history
    this.dataHistory.labels.push(timeLabel);
    this.dataHistory.values.push(value);

    // Trim to max data points
    if (this.dataHistory.labels.length > this.maxDataPoints) {
      this.dataHistory.labels.shift();
      this.dataHistory.values.shift();
    }

    return {
      currentValue: value,
      timestamp: now.toISOString(),
      labels: [...this.dataHistory.labels],
      values: [...this.dataHistory.values],
      dataPoints: this.dataHistory.values.length,
    };
  }

  /**
   * Render the chart with data
   */
  render(data) {
    if (!this.chart || !data) return;

    // Prepare chart data
    const chartData = {
      title: '${className}',
      x: data.labels,
      y: data.values,
      style: { line: 'green' },
    };

    // Update the chart
    this.chart.setData([chartData]);

    // Update info text
    const avg = data.values.length > 0
      ? Math.floor(data.values.reduce((a, b) => a + b, 0) / data.values.length)
      : 0;
    const current = data.currentValue;
    const max = data.values.length > 0 ? Math.max(...data.values) : 0;

    this.infoText.setContent(
      'Current: ' + current + ' | Avg: ' + avg + ' | Peak: ' + max +
      ' | Points: ' + data.dataPoints + '/' + this.maxDataPoints
    );
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      this.log('debug', 'Auto-refresh stopped');
    }
  }

  /**
   * Destroy the widget
   */
  async destroy() {
    this.stopAutoRefresh();

    // Clear data history
    this.dataHistory = { labels: [], values: [] };

    if (this.chart) {
      this.chart = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`
  },
  table: {
    name: "Table Widget",
    description: "Widget that displays data in a sortable table format",
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: options.description || "A widget that displays tabular data",
      version: "1.0.0",
      author: author || "",
      category: options.category || "monitoring",
      type: "widget",
      lazyLoad: true,
      priority: 100,
      config: {
        columns: ["Name", "Status", "Value"],
        refreshInterval: 5e3,
        maxRows: 10
      },
      __version: 1
    }),
    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Table widget for displaying tabular data
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Table widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Table widget';

    // Table configuration
    this.columns = this.config.columns || ['Name', 'Status', 'Value'];
    this.refreshInterval = this.config.refreshInterval || 5000;
    this.maxRows = this.config.maxRows || 10;

    // Widget state
    this.table = null;
    this.refreshTimer = null;
    this.sortColumn = 0;
    this.sortAsc = true;
    this.data = [];
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
    return true;
  }

  /**
   * Create the widget UI
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');

    this.screen = screen;
    this.theme = theme;

    // Main container
    this.box = blessed.default.box({
      parent: screen,
      width: '60%',
      height: 15,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create table
    this.table = blessed.default.table({
      parent: this.box,
      top: 1,
      left: 1,
      width: '98%',
      height: '90%',
      border: { type: 'none' },
      style: {
        header: { fg: C.cyan || 'cyan', bold: true },
        cell: { fg: C.white || 'white' },
      },
      columns: this.columns,
      rows: [],
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Generate sample data - customize this for your data source
   */
  async getData() {
    // Sample data - replace with actual data fetching
    const sampleData = [
      ['Server 1', 'Online', Math.floor(Math.random() * 100) + '%'],
      ['Server 2', 'Online', Math.floor(Math.random() * 100) + '%'],
      ['Server 3', 'Warning', Math.floor(Math.random() * 100) + '%'],
      ['Server 4', 'Online', Math.floor(Math.random() * 100) + '%'],
      ['Server 5', 'Offline', '0%'],
    ];

    // Sort data
    const sorted = [...sampleData].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];
      const cmp = aVal.localeCompare(bVal);
      return this.sortAsc ? cmp : -cmp;
    });

    this.data = sorted.slice(0, this.maxRows);

    return {
      rows: this.data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Render the table with data
   */
  render(result) {
    if (!this.table || !result) return;

    this.table.setData({
      headers: this.columns,
      rows: result.rows,
    });
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      this.log('debug', 'Auto-refresh stopped');
    }
  }

  /**
   * Destroy the widget
   */
  async destroy() {
    this.stopAutoRefresh();

    if (this.table) {
      this.table.destroy();
      this.table = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`
  },
  gauge: {
    name: "Gauge Widget",
    description: "Widget that displays a circular or linear gauge for single metrics",
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: options.description || "A widget that displays metrics with a gauge",
      version: "1.0.0",
      author: author || "",
      category: options.category || "monitoring",
      type: "widget",
      lazyLoad: true,
      priority: 100,
      config: {
        gaugeType: "circle",
        minValue: 0,
        maxValue: 100,
        refreshInterval: 2e3,
        unit: "%"
      },
      __version: 1
    }),
    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Gauge widget for displaying single metrics
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Gauge widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Gauge widget';

    // Gauge configuration
    this.gaugeType = this.config.gaugeType || 'circle';
    this.minValue = this.config.minValue || 0;
    this.maxValue = this.config.maxValue || 100;
    this.refreshInterval = this.config.refreshInterval || 2000;
    this.unit = this.config.unit || '%';

    // Widget state
    this.gauge = null;
    this.refreshTimer = null;
    this.currentValue = 0;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
    return true;
  }

  /**
   * Create the widget UI
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');
    const contrib = await import('blessed-contrib');

    this.screen = screen;
    this.theme = theme;

    // Main container
    this.box = blessed.default.box({
      parent: screen,
      width: '30%',
      height: 10,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create gauge based on type
    if (this.gaugeType === 'circle') {
      this.gauge = contrib.default.gauge({
        parent: this.box,
        top: 1,
        left: 'center',
        width: '90%',
        height: 6,
        style: {
          label: { fg: C.white || 'white' },
          value: { fg: C.green || 'green' },
        },
        label: this.name,
      });
    } else {
      // Linear gauge
      this.gauge = contrib.default.gauge({
        parent: this.box,
        top: 2,
        left: 1,
        width: '96%',
        height: 4,
        style: {
          label: { fg: C.white || 'white' },
          value: { fg: C.green || 'green' },
        },
        label: this.name,
      });
    }

    // Value display
    this.valueText = blessed.default.text({
      parent: this.box,
      bottom: 0,
      left: 'center',
      content: '0' + this.unit,
      style: { fg: C.white || 'white', bold: true },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Generate sample data - customize this for your data source
   */
  async getData() {
    // Sample data - replace with actual data fetching
    const value = Math.floor(Math.random() * (this.maxValue - this.minValue) + this.minValue);
    this.currentValue = value;

    return {
      value: value,
      percentage: ((value - this.minValue) / (this.maxValue - this.minValue)) * 100,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Render the gauge with data
   */
  render(result) {
    if (!this.gauge || !result) return;

    // Set gauge percentage (0-100)
    this.gauge.setData(result.percentage);

    // Update value text
    this.valueText.setContent(result.value + this.unit);

    // Color based on value
    let color = 'green';
    if (result.percentage > 80) {
      color = 'red';
    } else if (result.percentage > 60) {
      color = 'yellow';
    }

    this.valueText.style.fg = this.theme?.colors?.[color] || color;
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      this.log('debug', 'Auto-refresh stopped');
    }
  }

  /**
   * Destroy the widget
   */
  async destroy() {
    this.stopAutoRefresh();

    if (this.gauge) {
      this.gauge.destroy();
      this.gauge = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`
  },
  logViewer: {
    name: "Log Viewer Widget",
    description: "Widget that displays scrolling log entries with filtering",
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: options.description || "A widget that displays scrolling log entries",
      version: "1.0.0",
      author: author || "",
      category: options.category || "monitoring",
      type: "widget",
      lazyLoad: true,
      priority: 100,
      config: {
        maxLines: 50,
        showTimestamp: true,
        filterLevels: ["info", "warn", "error"],
        refreshInterval: 1e3
      },
      __version: 1
    }),
    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Log viewer widget for displaying scrolling log entries
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Log viewer widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Log viewer widget';

    // Log viewer configuration
    this.maxLines = this.config.maxLines || 50;
    this.showTimestamp = this.config.showTimestamp !== false;
    this.filterLevels = this.config.filterLevels || ['info', 'warn', 'error'];
    this.refreshInterval = this.config.refreshInterval || 1000;

    // Widget state
    this.logBox = null;
    this.refreshTimer = null;
    this.logEntries = [];
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');

    // Add initial log entries
    this.addLogEntry('info', 'Log viewer initialized');
    this.addLogEntry('info', 'Waiting for log data...');

    return true;
  }

  /**
   * Add a log entry
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   */
  addLogEntry(level, message) {
    const entry = {
      level,
      message,
      timestamp: new Date(),
    };

    this.logEntries.push(entry);

    // Trim to max lines
    if (this.logEntries.length > this.maxLines) {
      this.logEntries.shift();
    }
  }

  /**
   * Create the widget UI
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');

    this.screen = screen;
    this.theme = theme;

    // Main container
    this.box = blessed.default.box({
      parent: screen,
      width: '70%',
      height: 15,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Log entries box with scrolling
    this.logBox = blessed.default.log({
      parent: this.box,
      top: 1,
      left: 1,
      width: '98%',
      height: '90%',
      scrollable: true,
      scrollbar: {
        style: {
          bg: C.gray || 'gray',
        },
      },
      style: {
        fg: C.white || 'white',
        bg: C.black || 'black',
      },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Initial render
    this.renderLogs();

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Get filtered log entries
   */
  async getData() {
    // Sample log generation - replace with actual log fetching
    const levels = ['info', 'info', 'info', 'warn', 'error'];
    const messages = [
      'Request processed successfully',
      'Connection established',
      'Data synchronized',
      'High memory usage detected',
      'Failed to connect to service',
    ];

    // Randomly add new log entry
    if (Math.random() > 0.7) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      this.addLogEntry(level, message);
    }

    // Filter by level
    const filtered = this.logEntries.filter(entry =>
      this.filterLevels.includes(entry.level)
    );

    return {
      entries: filtered,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Render the log entries
   */
  renderLogs() {
    if (!this.logBox) return;

    this.logBox.setContent('');

    for (const entry of this.logEntries) {
      if (!this.filterLevels.includes(entry.level)) continue;

      let line = '';

      if (this.showTimestamp) {
        const time = entry.timestamp.toLocaleTimeString();
        line += '[' + time + '] ';
      }

      const levelStr = entry.level.toUpperCase().padEnd(5);
      line += '[' + levelStr + '] ' + entry.message;

      // Set color based on level
      const colorMap = {
        info: this.theme?.colors?.white || 'white',
        warn: this.theme?.colors?.yellow || 'yellow',
        error: this.theme?.colors?.red || 'red',
      };

      this.logBox.add(line, colorMap[entry.level] || 'white');
    }

    // Scroll to bottom
    this.logBox.setScrollPerc(100);
  }

  /**
   * Render the widget with data
   */
  render(result) {
    if (!result) return;
    this.renderLogs();
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      this.log('debug', 'Auto-refresh stopped');
    }
  }

  /**
   * Destroy the widget
   */
  async destroy() {
    this.stopAutoRefresh();

    if (this.logBox) {
      this.logBox.destroy();
      this.logBox = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.logEntries = [];
    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`
  }
};
function toClassName(id) {
  return id.split(/[-_]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
}
function validatePluginId2(id) {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "Plugin ID must be a non-empty string" };
  }
  if (id.length < 1 || id.length > 64) {
    return { valid: false, error: "Plugin ID must be between 1 and 64 characters" };
  }
  const validPattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;
  if (!validPattern.test(id)) {
    return {
      valid: false,
      error: "Plugin ID must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with a hyphen/underscore"
    };
  }
  const reservedNames = ["claw", "dashboard", "admin", "system", "test"];
  if (reservedNames.includes(id.toLowerCase())) {
    return { valid: false, error: `'${id}' is a reserved name` };
  }
  return { valid: true };
}
function generateReadme(id, name, templateType) {
  const template = TEMPLATES[templateType] || TEMPLATES.basic;
  return `# ${name}

${template.description} for Claw Dashboard.

## Installation

1. Copy this directory to your Claw Dashboard plugins folder:
   \`\`\`bash
   cp -r ${id} ~/.openclaw/plugins/
   \`\`\`

2. Restart Claw Dashboard or reload plugins

## Configuration

Edit \`plugin.json\` to customize the widget:

\`\`\`json
{
  "config": {
    // See plugin.json for available options
  }
}
\`\`\`

## Development

### File Structure

\`\`\`
${id}/
\u251C\u2500\u2500 plugin.json    # Plugin manifest
\u251C\u2500\u2500 index.js       # Widget code
\u2514\u2500\u2500 README.md      # This file
\`\`\`

### Testing

Run your widget in Claw Dashboard:

\`\`\`bash
clawdash --debug
\`\`\`

## API Reference

See [Claw Dashboard Plugin Documentation](https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md) for full API reference.

## License

MIT
`;
}
function listTemplates() {
  return Object.entries(TEMPLATES).map(([key, template]) => ({
    id: key,
    name: template.name,
    description: template.description
  }));
}
async function createPlugin(id, options = {}) {
  const {
    name,
    author,
    outputDir,
    template = "basic",
    dryRun = false,
    force = false
  } = options;
  const validation = validatePluginId2(id);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      code: "INVALID_ID"
    };
  }
  const selectedTemplate = TEMPLATES[template];
  if (!selectedTemplate) {
    return {
      success: false,
      error: `Unknown template: ${template}. Available: ${Object.keys(TEMPLATES).join(", ")}`,
      code: "INVALID_TEMPLATE"
    };
  }
  const pluginsDir = outputDir || (0, import_path12.join)((0, import_os6.homedir)(), ".openclaw", "plugins");
  const pluginDir = (0, import_path12.join)(pluginsDir, id);
  if ((0, import_fs13.existsSync)(pluginDir) && !force) {
    return {
      success: false,
      error: `Plugin directory already exists: ${pluginDir}`,
      code: "ALREADY_EXISTS",
      path: pluginDir
    };
  }
  const className = toClassName(id);
  const files = {
    "plugin.json": JSON.stringify(
      selectedTemplate.manifest(id, name, author, options),
      null,
      2
    ),
    "index.js": selectedTemplate.widgetCode(id, className),
    "README.md": generateReadme(id, name || id, template)
  };
  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      path: pluginDir,
      files: Object.keys(files),
      template
    };
  }
  try {
    (0, import_fs13.mkdirSync)(pluginDir, { recursive: true });
  } catch (err) {
    return {
      success: false,
      error: `Failed to create directory: ${err.message}`,
      code: "MKDIR_ERROR"
    };
  }
  const createdFiles = [];
  for (const [filename, content2] of Object.entries(files)) {
    const filePath = (0, import_path12.join)(pluginDir, filename);
    try {
      (0, import_fs13.writeFileSync)(filePath, content2);
      createdFiles.push(filename);
    } catch (err) {
      return {
        success: false,
        error: `Failed to write ${filename}: ${err.message}`,
        code: "WRITE_ERROR",
        path: filePath
      };
    }
  }
  return {
    success: true,
    path: pluginDir,
    files: createdFiles,
    id,
    className,
    template
  };
}
async function runScaffoldCli(args) {
  const command = args[0];
  if (!command || command === "--help" || command === "-h") {
    console.log(`
Plugin Scaffolding CLI for Claw Dashboard

Usage: clawdash create-plugin <id> [options]

Arguments:
  id                Plugin ID (kebab-case, e.g., "my-custom-widget")

Options:
  -t, --template    Template to use (basic, api, chart, table, gauge, logViewer)
                    Default: basic
  -n, --name        Display name for the widget
  -a, --author      Author name or email
  -c, --category    Widget category (system, monitoring, custom, example)
                    Default: custom
  --desc            Widget description
  -o, --output      Output directory (default: ~/.openclaw/plugins/)
  -f, --force       Overwrite existing plugin
  --dry-run         Show what would be created without creating it
  --list-templates  Show available templates
  -i, --interactive Start interactive mode (prompts for all options)
  -h, --help        Show this help message

Examples:
  clawdash create-plugin my-widget
  clawdash create-plugin api-status --template api --author "John Doe"
  clawdash create-plugin metrics --template chart --category monitoring
  clawdash create-plugin my-widget --interactive
  clawdash create-plugin --list-templates
`);
    return 0;
  }
  if (command === "--version" || command === "-v") {
    console.log("clawdash-create-plugin 1.1.0");
    return 0;
  }
  if (command === "--list-templates" || command === "list-templates") {
    console.log("Available Templates:");
    console.log("");
    const templates = listTemplates();
    templates.forEach((t) => {
      console.log(`  ${t.id.padEnd(12)} ${t.name}`);
      console.log(`              ${t.description}`);
      console.log("");
    });
    return 0;
  }
  const options = {
    name: void 0,
    author: void 0,
    category: "custom",
    description: void 0,
    template: "basic",
    outputDir: void 0,
    force: false,
    dryRun: false
  };
  let pluginId = null;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("-") && !pluginId) {
      pluginId = arg;
      continue;
    }
    switch (arg) {
      case "-t":
      case "--template":
        options.template = args[++i];
        break;
      case "-n":
      case "--name":
        options.name = args[++i];
        break;
      case "-a":
      case "--author":
        options.author = args[++i];
        break;
      case "-c":
      case "--category":
        options.category = args[++i];
        break;
      case "--desc":
        options.description = args[++i];
        break;
      case "-o":
      case "--output":
        options.outputDir = args[++i];
        break;
      case "-f":
      case "--force":
        options.force = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "-i":
      case "--interactive":
        options.interactive = true;
        break;
      case "-h":
      case "--help":
        break;
    }
  }
  if (options.interactive) {
    const interactiveOptions = await runInteractiveMode();
    if (!interactiveOptions) {
      return 0;
    }
    Object.assign(options, interactiveOptions);
    pluginId = interactiveOptions.id;
  }
  if (!pluginId) {
    console.error("Error: Plugin ID is required");
    console.error("Run with --help for usage information");
    return 1;
  }
  const result = await createPlugin(pluginId, options);
  if (!result.success) {
    console.error(`Error: ${result.error}`);
    return 1;
  }
  if (result.dryRun) {
    console.log("Dry run - would create:");
    console.log(`  Directory: ${result.path}`);
    console.log(`  Template: ${result.template}`);
    console.log("  Files:");
    result.files.forEach((f) => console.log(`    - ${f}`));
  } else {
    console.log(`\u2713 Created plugin: ${pluginId}`);
    console.log(`  Path: ${result.path}`);
    console.log(`  Template: ${result.template}`);
    console.log(`  Files: ${result.files.join(", ")}`);
    console.log("");
    console.log("Next steps:");
    console.log(`  1. Edit ${result.path}/index.js to implement your widget`);
    console.log(`  2. Update ${result.path}/plugin.json with your configuration`);
    console.log("  3. Run clawdash to see your widget in action");
  }
  return 0;
}
if ("file://" + (typeof __dirname !== "undefined" ? require("path").join(__dirname, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js") === `file://${process.argv[1]}`) {
  (async () => {
    const exitCode = await runScaffoldCli(process.argv.slice(2));
    process.exit(exitCode);
  })();
}

// src/gateway-manager.js
var import_fs14 = __toESM(require("fs"), 1);
var import_https = __toESM(require("https"), 1);
var import_http = __toESM(require("http"), 1);
var import_child_process2 = require("child_process");
var import_util = require("util");
init_logger();
init_config();
init_errors();

// src/checksum.js
var import_crypto2 = __toESM(require("crypto"), 1);
init_config();
init_logger();
var SUPPORTED_ALGORITHMS = ["sha256", "sha512", "md5"];
function computeChecksum(data, algorithm = null) {
  const algo = algorithm || config_default.CHECKSUM.ALGORITHM;
  if (!SUPPORTED_ALGORITHMS.includes(algo)) {
    throw new Error(`Unsupported hash algorithm: ${algo}. Supported: ${SUPPORTED_ALGORITHMS.join(", ")}`);
  }
  const hash = import_crypto2.default.createHash(algo);
  hash.update(data);
  return hash.digest("hex");
}
function verifyChecksum(data, expectedChecksum, algorithm = null) {
  if (!expectedChecksum) {
    return false;
  }
  try {
    const computed = computeChecksum(data, algorithm);
    return import_crypto2.default.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(expectedChecksum, "hex")
    );
  } catch (err) {
    logger_default.debug(`Checksum verification failed: ${err.message}`);
    return false;
  }
}
function verifyResponseChecksum(response, responseBody) {
  if (!config_default.CHECKSUM.ENABLED) {
    return { verified: true, checksum: null, error: null };
  }
  const headerName = config_default.CHECKSUM.HEADER_NAME.toLowerCase();
  const expectedChecksum = response.headers[headerName];
  if (!expectedChecksum) {
    if (config_default.CHECKSUM.STRICT_MODE) {
      return {
        verified: false,
        checksum: null,
        error: `Missing ${config_default.CHECKSUM.HEADER_NAME} header (strict mode enabled)`
      };
    }
    return { verified: true, checksum: null, error: null };
  }
  const checksumStr = Array.isArray(expectedChecksum) ? expectedChecksum[0] : expectedChecksum;
  if (!/^[a-f0-9]+$/i.test(checksumStr)) {
    return {
      verified: false,
      checksum: checksumStr,
      error: "Invalid checksum format: expected hex string"
    };
  }
  const isValid = verifyChecksum(responseBody, checksumStr);
  if (!isValid) {
    return {
      verified: false,
      checksum: checksumStr,
      error: "Checksum mismatch: computed checksum does not match header"
    };
  }
  return { verified: true, checksum: checksumStr, error: null };
}
function getChecksumMetadata(response) {
  const headerName = config_default.CHECKSUM.HEADER_NAME.toLowerCase();
  const checksum = response.headers[headerName];
  return {
    algorithm: config_default.CHECKSUM.ALGORITHM,
    headerName: config_default.CHECKSUM.HEADER_NAME,
    headerPresent: !!checksum,
    checksum: checksum || null,
    strictMode: config_default.CHECKSUM.STRICT_MODE,
    enabled: config_default.CHECKSUM.ENABLED
  };
}

// src/gateway-manager.js
var execAsync = (0, import_util.promisify)(import_child_process2.exec);
function getLogFilterFn(filter) {
  switch (filter) {
    case "error":
      return (line) => line.includes("ERROR") || line.includes("error") || line.includes("ERR");
    case "warn":
      return (line) => line.includes("WARN") || line.includes("warning") || line.includes("WARNING");
    case "info":
      return (line) => !line.includes("DEBUG") && !line.includes("debug");
    case "debug":
    case "all":
    default:
      return () => true;
  }
}
async function getOpenClawLogs(options = {}) {
  const { limit = 200, filter = "all" } = options;
  try {
    const { stdout } = await execAsync(
      `openclaw logs --limit ${limit} --plain 2>/dev/null`,
      { timeout: config_default.COMMAND_TIMEOUTS.OPENCLAW_LOGS }
    );
    const filterFn = getLogFilterFn(filter);
    const lines = stdout.trim().split("\n").filter((line) => !line.includes("plugin CLI register skipped")).filter((line) => filterFn(line)).filter((line) => line.length > 0);
    return {
      logs: lines,
      count: lines.length,
      timestamp: Date.now()
    };
  } catch (err) {
    logger_default.debug(`Failed to fetch OpenClaw logs: ${err.message}`);
    return {
      logs: [],
      count: 0,
      timestamp: Date.now(),
      error: err.message
    };
  }
}
var GatewayManager = class {
  constructor() {
    this.endpoints = [];
    this.endpointLatency = /* @__PURE__ */ new Map();
    this.endpointFailCount = /* @__PURE__ */ new Map();
    this.endpointChecksumFailCount = /* @__PURE__ */ new Map();
    this.endpointChecksumVerified = /* @__PURE__ */ new Map();
  }
  /**
   * Initialize the gateway manager with settings
   * @param {Object} settings - Dashboard settings
   */
  init(settings) {
    if (settings.gatewayEndpoints && Array.isArray(settings.gatewayEndpoints)) {
      this.endpoints = settings.gatewayEndpoints.map((ep) => ({
        ...DEFAULT_GATEWAY_ENDPOINT,
        ...ep,
        // Ensure required fields
        name: ep.name || "unnamed",
        host: ep.host || "localhost",
        port: ep.port || GATEWAY.DEFAULT_PORT,
        enabled: ep.enabled !== false
        // Default to true
      }));
    } else {
      this.endpoints = [{ ...DEFAULT_GATEWAY_ENDPOINT }];
    }
    logger_default.info(`GatewayManager initialized with ${this.endpoints.length} endpoint(s)`);
  }
  /**
   * Get all enabled endpoints
   * @returns {GatewayEndpoint[]}
   */
  getEnabledEndpoints() {
    return this.endpoints.filter((ep) => ep.enabled);
  }
  /**
   * Get all endpoints (including disabled)
   * @returns {GatewayEndpoint[]}
   */
  getAllEndpoints() {
    return [...this.endpoints];
  }
  /**
   * Get a specific endpoint by name
   * @param {string} name - Endpoint name
   * @returns {GatewayEndpoint|undefined}
   */
  getEndpoint(name) {
    return this.endpoints.find((ep) => ep.name === name);
  }
  /**
   * Add a new endpoint
   * @param {Partial<GatewayEndpoint>} endpointConfig - Endpoint configuration
   * @returns {GatewayEndpoint|null} - The added endpoint or null if failed
   */
  addEndpoint(endpointConfig) {
    if (this.endpoints.length >= GATEWAY.MAX_ENDPOINTS) {
      logger_default.warn(`Cannot add endpoint: maximum of ${GATEWAY.MAX_ENDPOINTS} endpoints reached`);
      return null;
    }
    if (this.endpoints.some((ep) => ep.name === endpointConfig.name)) {
      logger_default.warn(`Cannot add endpoint: name '${endpointConfig.name}' already exists`);
      return null;
    }
    const newEndpoint = {
      ...DEFAULT_GATEWAY_ENDPOINT,
      ...endpointConfig,
      enabled: true
    };
    this.endpoints.push(newEndpoint);
    logger_default.info(`Added gateway endpoint: ${newEndpoint.name} (${newEndpoint.host}:${newEndpoint.port})`);
    return newEndpoint;
  }
  /**
   * Remove an endpoint by name
   * @param {string} name - Endpoint name to remove
   * @returns {boolean} - True if removed, false if not found
   */
  removeEndpoint(name) {
    const idx = this.endpoints.findIndex((ep) => ep.name === name);
    if (idx === -1) {
      return false;
    }
    if (this.endpoints.length <= 1) {
      logger_default.warn("Cannot remove the last gateway endpoint");
      return false;
    }
    this.endpoints.splice(idx, 1);
    logger_default.info(`Removed gateway endpoint: ${name}`);
    return true;
  }
  /**
   * Update an endpoint
   * @param {string} name - Endpoint name to update
   * @param {Partial<GatewayEndpoint>} updates - Fields to update
   * @returns {GatewayEndpoint|null} - Updated endpoint or null if not found
   */
  updateEndpoint(name, updates) {
    const idx = this.endpoints.findIndex((ep) => ep.name === name);
    if (idx === -1) {
      return null;
    }
    if (updates.name && updates.name !== name && this.endpoints.some((ep) => ep.name === updates.name)) {
      logger_default.warn(`Cannot rename endpoint: name '${updates.name}' already exists`);
      return null;
    }
    this.endpoints[idx] = { ...this.endpoints[idx], ...updates };
    logger_default.info(`Updated gateway endpoint: ${name}`);
    return this.endpoints[idx];
  }
  /**
   * Toggle endpoint enabled state
   * @param {string} name - Endpoint name
   * @param {boolean} enabled - New enabled state
   * @returns {boolean} - True if toggled, false if not found
   */
  toggleEndpoint(name, enabled) {
    const ep = this.getEndpoint(name);
    if (!ep) {
      return false;
    }
    if (!enabled && this.getEnabledEndpoints().length <= 1) {
      logger_default.warn("Cannot disable the last enabled gateway endpoint");
      return false;
    }
    ep.enabled = enabled;
    logger_default.info(`Gateway endpoint ${name} ${enabled ? "enabled" : "disabled"}`);
    return true;
  }
  /**
   * Build sessions URL for an endpoint
   * @param {GatewayEndpoint} endpoint
   * @returns {string}
   */
  buildSessionsUrl(endpoint) {
    const protocol = endpoint.port === 443 ? "https" : "http";
    return `${protocol}://${endpoint.host}:${endpoint.port}/sessions`;
  }
  /**
   * Fetch sessions from a single endpoint
   * @param {GatewayEndpoint} endpoint
   * @returns {Promise<AggregatedSession[]>}
   */
  async fetchSessionsFromEndpoint(endpoint) {
    const startTime = Date.now();
    try {
      const sessions = await this.fetchFromHttpApi(endpoint);
      if (sessions && sessions.length > 0) {
        this.updateEndpointHealth(endpoint.name, true, Date.now() - startTime, null, true, false);
        return sessions.map((s) => this.enrichSession(s, endpoint));
      }
    } catch (err) {
      logger_default.debug(`HTTP API fetch failed for ${endpoint.name}: ${err.message}`);
      if (err instanceof ChecksumError) {
        this.updateEndpointHealth(endpoint.name, false, null, err.message, false, true);
        logger_default.error(`Checksum verification failed for ${endpoint.name}: ${err.message}`);
        return [];
      }
    }
    if (endpoint.type === "local" || endpoint.host === "localhost" || endpoint.host === "127.0.0.1") {
      try {
        const sessions = await this.fetchFromLocalFile(endpoint);
        if (sessions) {
          this.updateEndpointHealth(endpoint.name, true, Date.now() - startTime);
          return sessions.map((s) => this.enrichSession(s, endpoint));
        }
      } catch (err) {
        logger_default.debug(`Local file fetch failed for ${endpoint.name}: ${err.message}`);
      }
    }
    this.updateEndpointHealth(endpoint.name, false, null, "Failed to fetch sessions");
    return [];
  }
  /**
   * Fetch sessions from HTTP API
   * @param {GatewayEndpoint} endpoint
   * @returns {Promise<Object[]|null>}
   */
  fetchFromHttpApi(endpoint) {
    return new Promise((resolve9, reject) => {
      const url2 = this.buildSessionsUrl(endpoint);
      const client = url2.startsWith("https:") ? import_https.default : import_http.default;
      const options = {
        timeout: GATEWAY.TIMEOUT_MS,
        headers: {
          "Accept": "application/json"
        }
      };
      if (endpoint.token) {
        options.headers["Authorization"] = `Bearer ${endpoint.token}`;
      }
      const req = client.get(url2, options, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const checksumResult = verifyResponseChecksum(res, data);
              if (!checksumResult.verified) {
                const metadata = getChecksumMetadata(res);
                logger_default.warn(`Checksum verification failed for ${endpoint.name}: ${checksumResult.error}`, {
                  endpoint: endpoint.name,
                  headerPresent: metadata.headerPresent,
                  strictMode: metadata.strictMode
                });
                reject(new ChecksumError(
                  `Response integrity check failed: ${checksumResult.error}`,
                  {
                    endpoint: endpoint.name,
                    headerName: metadata.headerName,
                    headerPresent: metadata.headerPresent
                  }
                ));
                return;
              }
              if (checksumResult.checksum) {
                logger_default.debug(`Checksum verified for ${endpoint.name}: ${checksumResult.checksum.substring(0, 16)}...`);
              }
              const parsed = JSON.parse(data);
              resolve9(Array.isArray(parsed) ? parsed : Object.values(parsed));
            } catch (err) {
              if (err instanceof ChecksumError) {
                reject(err);
              } else {
                reject(new GatewayError(`Invalid JSON response: ${err.message}`));
              }
            }
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            reject(new AuthError(`Authentication failed for ${endpoint.name}`));
          } else {
            reject(new GatewayError(`HTTP ${res.statusCode}`));
          }
        });
      });
      req.on("error", (err) => {
        reject(new NetworkError(`Connection error: ${err.message}`));
      });
      req.on("timeout", () => {
        req.destroy();
        reject(new TimeoutError("Request timeout"));
      });
      req.setTimeout(GATEWAY.TIMEOUT_MS);
    });
  }
  /**
   * Fetch sessions from local file system
   * @param {GatewayEndpoint} endpoint
   * @returns {Promise<Object[]|null>}
   */
  async fetchFromLocalFile(endpoint) {
    const sessionsPath = config_default.PATHS.AGENTS_DIR + "/main/sessions/sessions.json";
    if (!import_fs14.default.existsSync(sessionsPath)) {
      return null;
    }
    const data = import_fs14.default.readFileSync(sessionsPath, "utf8");
    const sessionsObj = JSON.parse(data);
    if (!sessionsObj || typeof sessionsObj !== "object") {
      return null;
    }
    return Object.entries(sessionsObj).map(([key, session]) => ({
      key,
      channel: session.channel || "unknown",
      displayName: session.displayName || key,
      updatedAt: session.updatedAt || session.lastMessageAt || 0,
      sessionId: session.sessionId || key,
      model: session.model || "unknown",
      contextTokens: session.contextWindow || session.contextTokens || 0,
      totalTokens: session.totalTokens || 0,
      kind: session.kind || "other",
      deliveryContext: session.deliveryContext || {},
      systemSent: session.systemSent || false,
      abortedLastRun: session.abortedLastRun || false,
      lastChannel: session.lastChannel || session.channel || "",
      lastTo: session.lastTo || "",
      lastAccountId: session.lastAccountId || "",
      transcriptPath: session.transcriptPath || ""
    }));
  }
  /**
   * Enrich session with gateway endpoint info
   * @param {Object} session
   * @param {GatewayEndpoint} endpoint
   * @returns {AggregatedSession}
   */
  enrichSession(session, endpoint) {
    return {
      ...session,
      gatewayEndpoint: endpoint.name,
      gatewayHost: `${endpoint.host}:${endpoint.port}`
    };
  }
  /**
   * Update endpoint health status
   * @param {string} name - Endpoint name
   * @param {boolean} reachable - Whether endpoint is reachable
   * @param {number|null} latency - Response latency in ms
   * @param {string} [error] - Error message if failed
   * @param {boolean} [checksumVerified] - Whether checksum verification passed
   * @param {boolean} [checksumFailed] - Whether checksum verification failed
   */
  updateEndpointHealth(name, reachable, latency, error = null, checksumVerified = false, checksumFailed = false) {
    const ep = this.getEndpoint(name);
    if (!ep) return;
    ep.reachable = reachable;
    ep.lastSeen = reachable ? Date.now() : ep.lastSeen;
    ep.error = error;
    if (latency !== null) {
      this.endpointLatency.set(name, latency);
    }
    if (reachable) {
      this.endpointFailCount.set(name, 0);
    } else {
      const currentFails = this.endpointFailCount.get(name) || 0;
      this.endpointFailCount.set(name, currentFails + 1);
    }
    if (checksumVerified) {
      this.endpointChecksumVerified.set(name, true);
    }
    if (checksumFailed) {
      const currentChecksumFails = this.endpointChecksumFailCount.get(name) || 0;
      this.endpointChecksumFailCount.set(name, currentChecksumFails + 1);
    }
  }
  /**
   * Fetch sessions from all enabled endpoints
   * @returns {Promise<{sessions: AggregatedSession[], stats: Object}>}
   */
  async fetchAllSessions() {
    const enabledEndpoints = this.getEnabledEndpoints();
    if (enabledEndpoints.length === 0) {
      logger_default.warn("No enabled gateway endpoints");
      return { sessions: [], stats: { totalEndpoints: 0, reachableEndpoints: 0 } };
    }
    const fetchPromises = enabledEndpoints.map(async (ep) => {
      try {
        const sessions = await this.fetchSessionsFromEndpoint(ep);
        return { endpoint: ep.name, sessions, error: null };
      } catch (err) {
        logger_default.warn(`Failed to fetch from ${ep.name}: ${err.message}`);
        return { endpoint: ep.name, sessions: [], error: err.message };
      }
    });
    const results = await Promise.all(fetchPromises);
    const allSessions = [];
    let reachableCount = 0;
    for (const result of results) {
      if (!result.error) {
        reachableCount++;
        allSessions.push(...result.sessions);
      }
    }
    const stats = {
      totalEndpoints: enabledEndpoints.length,
      reachableEndpoints: reachableCount,
      unreachableEndpoints: enabledEndpoints.length - reachableCount
    };
    logger_default.debug(`Fetched ${allSessions.length} sessions from ${reachableCount}/${enabledEndpoints.length} endpoints`);
    return { sessions: allSessions, stats };
  }
  /**
   * Get endpoint health summary
   * @returns {Object[]}
   */
  getEndpointHealth() {
    return this.endpoints.map((ep) => ({
      name: ep.name,
      host: ep.host,
      port: ep.port,
      enabled: ep.enabled,
      reachable: ep.reachable || false,
      lastSeen: ep.lastSeen || null,
      latency: this.endpointLatency.get(ep.name) || null,
      failCount: this.endpointFailCount.get(ep.name) || 0,
      error: ep.error || null,
      checksum: {
        verified: this.endpointChecksumVerified.get(ep.name) || false,
        failCount: this.endpointChecksumFailCount.get(ep.name) || 0,
        enabled: config_default.CHECKSUM.ENABLED
      }
    }));
  }
  /**
   * Force a retry for a specific endpoint or all unreachable endpoints
   * @param {string|null} endpointName - Name of endpoint to retry, or null for all unreachable
   * @returns {Promise<Object>} - Result of retry attempts
   */
  async forceRetry(endpointName = null) {
    const results = [];
    const targets = endpointName ? this.endpoints.filter((ep) => ep.name === endpointName) : this.endpoints.filter((ep) => ep.enabled && !ep.reachable);
    if (targets.length === 0) {
      return { attempted: 0, results: [] };
    }
    logger_default.info(`Force retrying ${targets.length} endpoint(s)`);
    for (const ep of targets) {
      this.endpointFailCount.set(ep.name, 0);
      try {
        const sessions = await this.fetchSessionsFromEndpoint(ep);
        results.push({
          name: ep.name,
          success: ep.reachable === true,
          sessions: sessions.length,
          latency: this.endpointLatency.get(ep.name) || null,
          error: ep.error || null
        });
      } catch (err) {
        results.push({
          name: ep.name,
          success: false,
          sessions: 0,
          latency: null,
          error: err.message
        });
      }
    }
    const successCount = results.filter((r) => r.success).length;
    logger_default.info(`Force retry complete: ${successCount}/${results.length} endpoints reachable`);
    return {
      attempted: results.length,
      successful: successCount,
      results
    };
  }
  /**
   * Get the number of consecutive failures for an endpoint
   * @param {string} name - Endpoint name
   * @returns {number} - Number of consecutive failures
   */
  getEndpointFailCount(name) {
    return this.endpointFailCount.get(name) || 0;
  }
  /**
   * Clear the failure count for an endpoint
   * @param {string} name - Endpoint name
   */
  clearEndpointFailCount(name) {
    this.endpointFailCount.set(name, 0);
    logger_default.debug(`Cleared fail count for endpoint: ${name}`);
  }
  /**
   * Get the total failure count across all endpoints
   * @returns {number} - Total number of consecutive failures
   */
  getTotalFailCount() {
    let total = 0;
    for (const count of this.endpointFailCount.values()) {
      total += count;
    }
    return total;
  }
  /**
   * Clear all failure counts for all endpoints
   */
  clearAllFailCounts() {
    for (const name of this.endpointFailCount.keys()) {
      this.endpointFailCount.set(name, 0);
    }
    logger_default.debug("Cleared all endpoint failure counts");
  }
  /**
   * Get settings object for saving
   * @returns {Object}
   */
  getSettingsForSave() {
    return {
      gatewayEndpoints: this.endpoints.map((ep) => ({
        name: ep.name,
        host: ep.host,
        port: ep.port,
        token: ep.token,
        enabled: ep.enabled,
        type: ep.type
      }))
    };
  }
};
var gatewayManager = new GatewayManager();
var gateway_manager_default = gatewayManager;

// src/widgets/builtin-widgets.js
var import_blessed4 = __toESM(require("blessed"), 1);
var import_blessed_contrib = __toESM(require("blessed-contrib"), 1);

// src/widgets/plugin-api.js
var import_blessed3 = __toESM(require("blessed"), 1);
init_logger();
init_config();

// src/cli/args.js
init_config();
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    version: false,
    debug: false,
    web: false,
    webPort: config_default.WEB.DEFAULT_PORT,
    webHost: config_default.WEB.HOST,
    watch: false,
    watchPlugins: false,
    command: null,
    commandArgs: []
  };
  if (args.length > 0 && !args[0].startsWith("-")) {
    const firstArg = args[0];
    if (firstArg === "create-plugin") {
      options.command = "create-plugin";
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === "validate-plugin") {
      options.command = "validate-plugin";
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === "validate-config") {
      options.command = "validate-config";
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === "export-snapshot") {
      options.command = "export-snapshot";
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === "import-snapshot") {
      options.command = "import-snapshot";
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === "list-templates") {
      options.command = "list-templates";
      options.commandArgs = args.slice(1);
      return options;
    }
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-v":
      case "--version":
        options.version = true;
        break;
      case "-d":
      case "--debug":
        options.debug = true;
        break;
      case "-w":
      case "--web":
        options.web = true;
        break;
      case "-p":
      case "--web-port":
        options.web = true;
        if (i + 1 < args.length) {
          const port = parseInt(args[++i], 10);
          if (!isNaN(port) && port > 0 && port < 65536) {
            options.webPort = port;
          }
        }
        break;
      case "--web-host":
        options.web = true;
        if (i + 1 < args.length) {
          options.webHost = args[++i];
        }
        break;
      case "-W":
      case "--watch":
        options.watch = true;
        break;
      case "--watch-plugins":
        options.watchPlugins = true;
        break;
    }
  }
  return options;
}

// src/cli/help.js
function showHelp() {
  console.log(`
Claw Dashboard - A beautiful terminal dashboard for monitoring OpenClaw instances

Usage: clawdash [OPTIONS] [COMMAND]

Commands:
  create-plugin <id>      Create a new widget plugin scaffold
                          Use -h with this command for options
  validate-plugin <path>  Validate a plugin.json manifest file
                          Use -h with this command for options
  validate-config [path]  Validate dashboard configuration file
                          Uses ~/.openclaw/dashboard-settings.json by default
  export-snapshot [path]  Export dashboard configuration snapshot
                          Shareable JSON format for backups and sharing
                          Use -h with this command for options
  import-snapshot [path]  Import dashboard configuration snapshot
                          Use --list to see available snapshots
                          Use -h with this command for options
  list-templates          List available widget templates
                          Shows all templates for create-plugin command
  export-schedule         Manage scheduled metric exports
                          Configure cron-style auto-exports to CSV/JSON
                          Use -h with this command for options

Options:
  -h, --help       Display this help message
  -v, --version    Display version information
  -d, --debug      Run in debug mode with additional logging
  -w, --web        Run web server mode (no TUI, HTTP API only)
  -p, --web-port   Set web server port (default: 18790, requires --web)
  --web-host       Set web server host (default: 0.0.0.0, requires --web)
  -W, --watch      Enable plugin hot-reload (watches ~/.openclaw/plugins/)

Developer Mode:
  --watch          Automatically reload plugins when files change
                   Watches plugin.json and index.js files in plugin directories
                   Shows notifications in dashboard when plugins reload

Web Server Endpoints (when --web is enabled):
  GET /health      Health check
  GET /metrics     System metrics (CPU, memory, GPU, etc.)
  GET /sessions    Active OpenClaw sessions
  GET /agents      Available OpenClaw agents
  GET /logs        Recent OpenClaw logs
  GET /status      Full dashboard status (all data)

Controls:
  q, Q, Ctrl+C     Quit the dashboard
  r, R             Force refresh data
  p, Space         Pause/resume auto-refresh
  o                Cycle session sort (time/tokens/idle/name)
  ?                Toggle help panel
  s, S             Open settings panel
  1-8              Toggle widgets

For full documentation, see: man clawdash
`);
}

// src/cli/version.js
init_config();
function showVersion() {
  console.log(`clawdash ${DASHBOARD_VERSION}`);
}

// src/cli/validate-plugin.js
var import_fs15 = __toESM(require("fs"), 1);
var import_os7 = __toESM(require("os"), 1);
var import_path13 = require("path");
async function runValidatePluginCli(args) {
  const pluginPath = args[0];
  const jsonOutput = args.includes("--json") || args.includes("-j");
  const verbose = args.includes("--verbose") || args.includes("-v");
  const showHelp2 = args.includes("--help") || args.includes("-h");
  if (showHelp2) {
    console.log(`
Validate Plugin Manifest for Claw Dashboard

Usage: clawdash validate-plugin <path> [options]

Arguments:
  path              Path to plugin.json file or plugin directory

Options:
  -j, --json        Output results as JSON
  -v, --verbose     Show detailed output including code analysis
  -h, --help        Show this help message

Examples:
  clawdash validate-plugin ./my-widget/plugin.json
  clawdash validate-plugin ~/.openclaw/plugins/my-widget
  clawdash validate-plugin ./my-widget --json
  clawdash validate-plugin ./my-widget --verbose
`);
    return 0;
  }
  if (!pluginPath) {
    console.error("Error: Path is required");
    console.error("Run with --help for usage information");
    return 1;
  }
  let resolvedPath = pluginPath;
  if (pluginPath.startsWith("~")) {
    resolvedPath = (0, import_path13.join)(import_os7.default.homedir(), pluginPath.slice(1));
  }
  resolvedPath = (0, import_path13.resolve)(resolvedPath);
  if (!import_fs15.default.existsSync(resolvedPath)) {
    const result2 = {
      valid: false,
      error: `Path does not exist: ${pluginPath}`
    };
    if (jsonOutput) {
      console.log(JSON.stringify(result2, null, 2));
    } else {
      console.error(`Error: ${result2.error}`);
    }
    return 1;
  }
  let manifestPath = resolvedPath;
  const stats = import_fs15.default.statSync(resolvedPath);
  if (stats.isDirectory()) {
    manifestPath = (0, import_path13.join)(resolvedPath, "plugin.json");
    if (!import_fs15.default.existsSync(manifestPath)) {
      const result2 = {
        valid: false,
        path: resolvedPath,
        error: `No plugin.json found in directory: ${pluginPath}`
      };
      if (jsonOutput) {
        console.log(JSON.stringify(result2, null, 2));
      } else {
        console.error(`Error: ${result2.error}`);
      }
      return 1;
    }
  }
  let manifest;
  try {
    const content2 = import_fs15.default.readFileSync(manifestPath, "utf8");
    manifest = JSON.parse(content2);
  } catch (err) {
    const result2 = {
      valid: false,
      path: manifestPath,
      error: `Failed to read/parse plugin.json: ${err.message}`
    };
    if (jsonOutput) {
      console.log(JSON.stringify(result2, null, 2));
    } else {
      console.error(`Error: ${result2.error}`);
    }
    return 1;
  }
  const validation = validateManifest(manifest);
  let idValidation = { valid: true };
  if (manifest.id) {
    idValidation = validatePluginIdFormat(manifest.id);
  }
  const result = {
    valid: validation.valid && idValidation.valid,
    path: manifestPath,
    errors: validation.errors,
    id: manifest.id || null,
    name: manifest.name || null,
    version: manifest.version || null
  };
  if (!idValidation.valid) {
    result.errors.push(`Invalid plugin ID: ${idValidation.error}`);
  }
  let warnings = [];
  if (verbose && result.valid) {
    if (!manifest.description || manifest.description === "A custom widget plugin for Claw Dashboard") {
      warnings.push("Add a meaningful description to your plugin");
    }
    if (!manifest.author) {
      warnings.push("Missing author - recommended for plugin distribution");
    }
    if (!manifest.config || Object.keys(manifest.config).length === 0) {
      warnings.push("Consider adding configurable options to your plugin");
    }
    if (manifest.type === "widget") {
      const indexPath = stats.isDirectory() ? (0, import_path13.join)(resolvedPath, "index.js") : (0, import_path13.join)((0, import_path13.dirname)(resolvedPath), "index.js");
      if (!import_fs15.default.existsSync(indexPath)) {
        result.valid = false;
        result.errors.push("Widget plugins must have an index.js file");
      }
    }
  }
  if (jsonOutput) {
    if (verbose) {
      result.warnings = warnings;
    }
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.valid) {
      console.log(`\u2713 Valid plugin manifest: ${manifestPath}`);
      console.log(`  ID: ${result.id}`);
      console.log(`  Name: ${result.name}`);
      console.log(`  Version: ${result.version}`);
      if (verbose && warnings.length > 0) {
        console.log("");
        console.log("Warnings:");
        warnings.forEach((warning) => {
          console.log(`  \u26A0 ${warning}`);
        });
      }
    } else {
      console.error(`\u2717 Invalid plugin manifest: ${manifestPath}`);
      console.error("  Errors:");
      result.errors.forEach((error) => {
        console.error(`    - ${error}`);
      });
    }
  }
  return result.valid ? 0 : 1;
}

// src/cli/validate-config.js
var import_os8 = __toESM(require("os"), 1);
var import_path15 = require("path");

// src/config-validator.js
var import_fs16 = require("fs");
var import_path14 = require("path");
init_config();
function validateType3(value, expectedType, path6) {
  if (value === void 0 || value === null) {
    return null;
  }
  const actualType = Array.isArray(value) ? "array" : typeof value;
  if (expectedType === "integer") {
    if (!Number.isInteger(value)) {
      return `'${path6}' must be an integer, got ${actualType}`;
    }
    return null;
  }
  if (expectedType === "port") {
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      return `'${path6}' must be a valid port number (1-65535), got ${value}`;
    }
    return null;
  }
  if (actualType !== expectedType) {
    return `'${path6}' must be of type ${expectedType}, got ${actualType}`;
  }
  return null;
}
function validateGatewayEndpoint2(endpoint, index) {
  const errors = [];
  const warnings = [];
  const path6 = `gatewayEndpoints[${index}]`;
  if (!endpoint || typeof endpoint !== "object") {
    errors.push(`'${path6}' must be an object`);
    return { errors, warnings };
  }
  if (!("name" in endpoint)) {
    errors.push(`'${path6}.name' is required`);
  } else if (typeof endpoint.name === "string") {
    const nameLen = endpoint.name.length;
    if (nameLen < VALIDATION.ENDPOINT_NAME.MIN_LENGTH) {
      errors.push(`'${path6}.name' must be at least ${VALIDATION.ENDPOINT_NAME.MIN_LENGTH} character(s)`);
    }
    if (nameLen > VALIDATION.ENDPOINT_NAME.MAX_LENGTH) {
      errors.push(`'${path6}.name' must be at most ${VALIDATION.ENDPOINT_NAME.MAX_LENGTH} characters`);
    }
    if (!VALIDATION.ENDPOINT_NAME.PATTERN.test(endpoint.name)) {
      errors.push(`'${path6}.name' must match pattern: ${VALIDATION.ENDPOINT_NAME.PATTERN.source}`);
    }
  }
  if (!("host" in endpoint)) {
    errors.push(`'${path6}.host' is required`);
  } else {
    const hostError = validateType3(endpoint.host, "string", `${path6}.host`);
    if (hostError) errors.push(hostError);
  }
  if (!("port" in endpoint)) {
    errors.push(`'${path6}.port' is required`);
  } else {
    const portError = validateType3(endpoint.port, "port", `${path6}.port`);
    if (portError) errors.push(portError);
  }
  if ("enabled" in endpoint) {
    const enabledError = validateType3(endpoint.enabled, "boolean", `${path6}.enabled`);
    if (enabledError) errors.push(enabledError);
  }
  if ("type" in endpoint) {
    if (!VALIDATION.VALID_ENDPOINT_TYPES.includes(endpoint.type)) {
      errors.push(`'${path6}.type' must be one of: ${VALIDATION.VALID_ENDPOINT_TYPES.join(", ")}`);
    }
  }
  if ("token" in endpoint && endpoint.token !== null) {
    const tokenError = validateType3(endpoint.token, "string", `${path6}.token`);
    if (tokenError) errors.push(tokenError);
  }
  const knownFields = ["name", "host", "port", "enabled", "type", "token"];
  const extraFields = Object.keys(endpoint).filter((k) => !knownFields.includes(k));
  for (const field of extraFields) {
    warnings.push(`'${path6}.${field}' is not a standard endpoint field`);
  }
  return { errors, warnings };
}
function validateWebInterfaceConfig(webConfig) {
  const errors = [];
  const warnings = [];
  const path6 = "webInterface";
  if (!webConfig || typeof webConfig !== "object") {
    errors.push(`'${path6}' must be an object`);
    return { errors, warnings };
  }
  if ("enabled" in webConfig) {
    const err = validateType3(webConfig.enabled, "boolean", `${path6}.enabled`);
    if (err) errors.push(err);
  }
  if ("port" in webConfig) {
    const err = validateType3(webConfig.port, "port", `${path6}.port`);
    if (err) errors.push(err);
  }
  if ("host" in webConfig) {
    const err = validateType3(webConfig.host, "string", `${path6}.host`);
    if (err) errors.push(err);
  }
  if ("cors" in webConfig) {
    const err = validateType3(webConfig.cors, "boolean", `${path6}.cors`);
    if (err) errors.push(err);
  }
  if ("corsOrigins" in webConfig) {
    const origins = webConfig.corsOrigins;
    if (typeof origins !== "string" && !Array.isArray(origins)) {
      errors.push(`'${path6}.corsOrigins' must be a string or array`);
    } else if (Array.isArray(origins)) {
      for (let i = 0; i < origins.length; i++) {
        if (typeof origins[i] !== "string") {
          errors.push(`'${path6}.corsOrigins[${i}]' must be a string`);
        }
      }
    }
  }
  if ("rateLimit" in webConfig) {
    const rl = webConfig.rateLimit;
    if (!rl || typeof rl !== "object") {
      errors.push(`'${path6}.rateLimit' must be an object`);
    } else {
      if ("enabled" in rl) {
        const err = validateType3(rl.enabled, "boolean", `${path6}.rateLimit.enabled`);
        if (err) errors.push(err);
      }
      if ("windowMs" in rl) {
        const err = validateType3(rl.windowMs, "integer", `${path6}.rateLimit.windowMs`);
        if (err) errors.push(err);
        else if (rl.windowMs < 1e3) {
          warnings.push(`'${path6}.rateLimit.windowMs' is less than 1 second (${rl.windowMs}ms)`);
        }
      }
      if ("maxRequests" in rl) {
        const err = validateType3(rl.maxRequests, "integer", `${path6}.rateLimit.maxRequests`);
        if (err) errors.push(err);
        else if (rl.maxRequests < 1) {
          errors.push(`'${path6}.rateLimit.maxRequests' must be at least 1`);
        }
      }
    }
  }
  if ("auth" in webConfig) {
    const auth = webConfig.auth;
    if (!auth || typeof auth !== "object") {
      errors.push(`'${path6}.auth' must be an object`);
    } else {
      if ("enabled" in auth) {
        const err = validateType3(auth.enabled, "boolean", `${path6}.auth.enabled`);
        if (err) errors.push(err);
      }
      if ("keys" in auth) {
        if (!Array.isArray(auth.keys)) {
          errors.push(`'${path6}.auth.keys' must be an array`);
        } else {
          for (let i = 0; i < auth.keys.length; i++) {
            const key = auth.keys[i];
            if (!key || typeof key !== "object") {
              errors.push(`'${path6}.auth.keys[${i}]' must be an object`);
            }
          }
        }
      }
    }
  }
  return { errors, warnings };
}
function validateWidgetLoadingConfig(widgetConfig) {
  const errors = [];
  const warnings = [];
  const path6 = "widgetLoading";
  if (!widgetConfig || typeof widgetConfig !== "object") {
    errors.push(`'${path6}' must be an object`);
    return { errors, warnings };
  }
  if ("enabled" in widgetConfig) {
    const err = validateType3(widgetConfig.enabled, "boolean", `${path6}.enabled`);
    if (err) errors.push(err);
  }
  if ("preloadPriority" in widgetConfig) {
    if (!Array.isArray(widgetConfig.preloadPriority)) {
      errors.push(`'${path6}.preloadPriority' must be an array`);
    } else {
      for (let i = 0; i < widgetConfig.preloadPriority.length; i++) {
        if (typeof widgetConfig.preloadPriority[i] !== "string") {
          errors.push(`'${path6}.preloadPriority[${i}]' must be a string`);
        }
      }
    }
  }
  if ("lazyLoadDelay" in widgetConfig) {
    const err = validateType3(widgetConfig.lazyLoadDelay, "integer", `${path6}.lazyLoadDelay`);
    if (err) errors.push(err);
    else if (widgetConfig.lazyLoadDelay < 0) {
      errors.push(`'${path6}.lazyLoadDelay' must be non-negative`);
    }
  }
  if ("maxConcurrent" in widgetConfig) {
    const err = validateType3(widgetConfig.maxConcurrent, "integer", `${path6}.maxConcurrent`);
    if (err) errors.push(err);
    else if (widgetConfig.maxConcurrent < 1) {
      errors.push(`'${path6}.maxConcurrent' must be at least 1`);
    }
  }
  if ("autoDiscover" in widgetConfig) {
    const err = validateType3(widgetConfig.autoDiscover, "boolean", `${path6}.autoDiscover`);
    if (err) errors.push(err);
  }
  return { errors, warnings };
}
function validateConfig(config, options = {}) {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];
  const info = [];
  if (!config || typeof config !== "object") {
    return {
      valid: false,
      errors: ["Config must be a valid JSON object"],
      warnings: [],
      info: [],
      stats: { fieldCount: 0 }
    };
  }
  const fieldCount = Object.keys(config).length;
  if ("refreshInterval" in config) {
    const err = validateType3(config.refreshInterval, "integer", "refreshInterval");
    if (err) errors.push(err);
    else if (config.refreshInterval < VALIDATION.REFRESH_INTERVAL.MIN) {
      errors.push(`'refreshInterval' must be at least ${VALIDATION.REFRESH_INTERVAL.MIN}ms`);
    } else if (config.refreshInterval > VALIDATION.REFRESH_INTERVAL.MAX) {
      errors.push(`'refreshInterval' must be at most ${VALIDATION.REFRESH_INTERVAL.MAX}ms`);
    }
    const standardOptions = [1e3, 2e3, 5e3, 1e4];
    if (!standardOptions.includes(config.refreshInterval)) {
      const closest = standardOptions.reduce(
        (prev, curr) => Math.abs(curr - config.refreshInterval) < Math.abs(prev - config.refreshInterval) ? curr : prev
      );
      info.push(`'refreshInterval' value ${config.refreshInterval}ms is not standard. Closest: ${closest}ms`);
    }
  }
  if ("logLevelFilter" in config) {
    if (!VALIDATION.VALID_LOG_LEVELS.includes(config.logLevelFilter)) {
      errors.push(`'logLevelFilter' must be one of: ${VALIDATION.VALID_LOG_LEVELS.join(", ")}`);
    }
  }
  if ("sessionSortMode" in config) {
    if (!VALIDATION.VALID_SORT_MODES.includes(config.sessionSortMode)) {
      errors.push(`'sessionSortMode' must be one of: ${VALIDATION.VALID_SORT_MODES.join(", ")}`);
    }
  }
  if ("theme" in config) {
    if (!VALIDATION.VALID_THEMES.includes(config.theme)) {
      errors.push(`'theme' must be one of: ${VALIDATION.VALID_THEMES.join(", ")}`);
    }
  }
  if ("exportFormat" in config) {
    if (!VALIDATION.VALID_EXPORT_FORMATS.includes(config.exportFormat)) {
      errors.push(`'exportFormat' must be one of: ${VALIDATION.VALID_EXPORT_FORMATS.join(", ")}`);
    }
  }
  for (let i = 1; i <= 8; i++) {
    const field = `showWidget${i}`;
    if (field in config) {
      const err = validateType3(config[field], "boolean", field);
      if (err) errors.push(err);
    }
  }
  if ("showPerformanceMetrics" in config) {
    const err = validateType3(config.showPerformanceMetrics, "boolean", "showPerformanceMetrics");
    if (err) errors.push(err);
  }
  if ("firstRun" in config) {
    const err = validateType3(config.firstRun, "boolean", "firstRun");
    if (err) errors.push(err);
  }
  if ("showFavoritesOnly" in config) {
    const err = validateType3(config.showFavoritesOnly, "boolean", "showFavoritesOnly");
    if (err) errors.push(err);
  }
  if ("favorites" in config) {
    if (!config.favorites || typeof config.favorites !== "object") {
      errors.push("'favorites' must be an object");
    }
  }
  if ("gatewayEndpoints" in config) {
    if (!Array.isArray(config.gatewayEndpoints)) {
      errors.push("'gatewayEndpoints' must be an array");
    } else {
      if (config.gatewayEndpoints.length === 0) {
        warnings.push("'gatewayEndpoints' is empty - no endpoints configured");
      }
      if (config.gatewayEndpoints.length > GATEWAY.MAX_ENDPOINTS) {
        errors.push(`'gatewayEndpoints' exceeds maximum of ${GATEWAY.MAX_ENDPOINTS} endpoints`);
      }
      for (let i = 0; i < config.gatewayEndpoints.length; i++) {
        const result = validateGatewayEndpoint2(config.gatewayEndpoints[i], i);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }
  }
  if ("activeGatewayEndpoint" in config) {
    const err = validateType3(config.activeGatewayEndpoint, "string", "activeGatewayEndpoint");
    if (err) errors.push(err);
  }
  if ("webInterface" in config) {
    const result = validateWebInterfaceConfig(config.webInterface);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }
  if ("widgetLoading" in config) {
    const result = validateWidgetLoadingConfig(config.widgetLoading);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }
  if ("plugins" in config) {
    if (!config.plugins || typeof config.plugins !== "object") {
      errors.push("'plugins' must be an object");
    } else {
      const pluginCount = Object.keys(config.plugins).length;
      if (pluginCount > 0) {
        info.push(`Found configuration for ${pluginCount} plugin(s)`);
      }
    }
  }
  if ("exportDirectory" in config) {
    const err = validateType3(config.exportDirectory, "string", "exportDirectory");
    if (err) errors.push(err);
  }
  if ("sessionSearchQuery" in config) {
    const err = validateType3(config.sessionSearchQuery, "string", "sessionSearchQuery");
    if (err) errors.push(err);
  }
  if (strict) {
    const knownProps = Object.keys(DEFAULT_SETTINGS);
    for (const key of Object.keys(config)) {
      if (!knownProps.includes(key)) {
        errors.push(`Unknown property: '${key}'`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    stats: { fieldCount }
  };
}
function validateConfigFile(filePath, options = {}) {
  const resolvedPath = (0, import_path14.resolve)(filePath);
  if (!(0, import_fs16.existsSync)(resolvedPath)) {
    return {
      valid: false,
      errors: [`File not found: ${resolvedPath}`],
      warnings: [],
      info: [],
      stats: { fieldCount: 0 }
    };
  }
  let config;
  try {
    const content2 = (0, import_fs16.readFileSync)(resolvedPath, "utf8");
    config = JSON.parse(content2);
  } catch (err) {
    return {
      valid: false,
      errors: [`Failed to parse JSON: ${err.message}`],
      warnings: [],
      info: [],
      stats: { fieldCount: 0 }
    };
  }
  return validateConfig(config, options);
}
function formatConfigValidationResult(result, configPath = "") {
  const lines = [];
  const name = configPath ? ` ${configPath} ` : " ";
  if (result.valid) {
    lines.push(`\u2713 Configuration${name}is valid`);
  } else {
    lines.push(`\u2717 Configuration${name}validation failed`);
  }
  if (result.stats?.fieldCount !== void 0) {
    lines.push(`  ${result.stats.fieldCount} field(s) checked`);
  }
  if (result.errors.length > 0) {
    lines.push("");
    lines.push("Errors:");
    result.errors.forEach((err) => lines.push(`  \u2717 ${err}`));
  }
  if (result.warnings.length > 0) {
    lines.push("");
    lines.push("Warnings:");
    result.warnings.forEach((warn) => lines.push(`  \u26A0 ${warn}`));
  }
  if (result.info.length > 0) {
    lines.push("");
    lines.push("Info:");
    result.info.forEach((i) => lines.push(`  \u2139 ${i}`));
  }
  return lines.join("\n");
}
function getDefaultConfigPath() {
  return PATHS.SETTINGS;
}

// src/cli/validate-config.js
async function runValidateConfigCli(args) {
  const configPath = args[0];
  const jsonOutput = args.includes("--json") || args.includes("-j");
  const showHelp2 = args.includes("--help") || args.includes("-h");
  const strict = args.includes("--strict") || args.includes("-s");
  if (showHelp2) {
    console.log(`
Validate Dashboard Configuration for Claw Dashboard

Usage: clawdash validate-config [path] [options]

Arguments:
  path                Path to configuration file (optional)
                      Defaults to: ~/.openclaw/dashboard-settings.json

Options:
  -j, --json          Output results as JSON
  -s, --strict        Fail on unknown properties
  -h, --help          Show this help message

Examples:
  clawdash validate-config
  clawdash validate-config ~/.openclaw/dashboard-settings.json
  clawdash validate-config ./my-config.json --json
  clawdash validate-config --strict
`);
    return 0;
  }
  const targetPath = configPath || getDefaultConfigPath();
  let resolvedPath = targetPath;
  if (targetPath.startsWith("~")) {
    resolvedPath = (0, import_path15.join)(import_os8.default.homedir(), targetPath.slice(1));
  }
  resolvedPath = (0, import_path15.resolve)(resolvedPath);
  const result = validateConfigFile(resolvedPath, { strict });
  if (jsonOutput) {
    const output = {
      valid: result.valid,
      path: resolvedPath,
      errors: result.errors,
      warnings: result.warnings,
      info: result.info,
      stats: result.stats
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(formatConfigValidationResult(result, resolvedPath));
  }
  return result.valid ? 0 : 1;
}

// src/cli/export-snapshot.js
var import_fs17 = __toESM(require("fs"), 1);
var import_os9 = __toESM(require("os"), 1);
var import_path16 = require("path");
init_config();
function loadCurrentSettings() {
  try {
    const settingsPath = PATHS.SETTINGS;
    if (import_fs17.default.existsSync(settingsPath)) {
      const data = import_fs17.default.readFileSync(settingsPath, "utf8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
  }
  return { ...DEFAULT_SETTINGS };
}
async function runExportSnapshotCli(args) {
  const jsonOutput = args.includes("--json") || args.includes("-j");
  const showHelp2 = args.includes("--help") || args.includes("-h");
  const nameFlag = args.findIndex((a) => a === "--name" || a === "-n");
  const snapshotName = nameFlag !== -1 && args[nameFlag + 1] ? args[nameFlag + 1] : "Dashboard Configuration";
  const outputPath = args.find((a) => !a.startsWith("-") && !args[args.indexOf(a) - 1]?.startsWith("-"));
  if (showHelp2) {
    console.log(`
Export Dashboard Snapshot for Claw Dashboard

Usage: clawdash export-snapshot [path] [options]

Arguments:
  path              Output file path (optional, defaults to ~/.openclaw/snapshots/)

Options:
  -n, --name        Snapshot name (default: "Dashboard Configuration")
  -j, --json        Output results as JSON
  -h, --help        Show this help message

Examples:
  clawdash export-snapshot
  clawdash export-snapshot ~/my-layout.json
  clawdash export-snapshot --name "Production Setup"
  clawdash export-snapshot ~/backup.json --json
`);
    return 0;
  }
  try {
    const settings = loadCurrentSettings();
    const snapshot = createSnapshot(settings, {
      name: snapshotName,
      description: `Claw Dashboard v${DASHBOARD_VERSION} - Exported via CLI`
    });
    let filePath;
    if (outputPath) {
      let resolvedPath = outputPath;
      if (outputPath.startsWith("~")) {
        resolvedPath = (0, import_path16.join)(import_os9.default.homedir(), outputPath.slice(1));
      }
      filePath = (0, import_path16.resolve)(resolvedPath);
    } else {
      const snapshotDir = getSnapshotsDirectory();
      const filename = generateSnapshotFilename(snapshotName);
      filePath = (0, import_path16.join)(snapshotDir, filename);
    }
    const result = exportSnapshotToFile(snapshot, filePath);
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: result.success,
        path: result.path,
        error: result.error,
        snapshot: {
          name: snapshot.name,
          version: snapshot.dashboardVersion,
          schemaVersion: snapshot.schemaVersion,
          createdAt: snapshot.createdAt,
          metadata: snapshot.metadata
        }
      }, null, 2));
    } else {
      if (result.success) {
        console.log("\u2713 Snapshot exported successfully");
        console.log(`  Name: ${snapshot.name}`);
        console.log(`  Path: ${result.path}`);
        console.log(`  Version: ${snapshot.dashboardVersion}`);
        console.log(`  Widgets: ${snapshot.metadata?.widgetCount || "N/A"}`);
        console.log(`  Plugins: ${snapshot.metadata?.pluginCount || "N/A"}`);
      } else {
        console.error(`\u2717 Export failed: ${result.error}`);
      }
    }
    return result.success ? 0 : 1;
  } catch (err) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: false,
        error: err.message
      }, null, 2));
    } else {
      console.error(`\u2717 Export error: ${err.message}`);
    }
    return 1;
  }
}

// src/cli/import-snapshot.js
var import_fs18 = __toESM(require("fs"), 1);
var import_os10 = __toESM(require("os"), 1);
var import_path17 = require("path");
init_config();
function saveSettings(settings) {
  try {
    const settingsPath = PATHS.SETTINGS;
    const dir = PATHS.OPENCLAW_DIR;
    if (!import_fs18.default.existsSync(dir)) {
      import_fs18.default.mkdirSync(dir, { recursive: true });
    }
    import_fs18.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (err) {
    throw new Error(`Failed to save settings: ${err.message}`);
  }
}
async function runImportSnapshotCli(args) {
  const jsonOutput = args.includes("--json") || args.includes("-j");
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const force = args.includes("--force") || args.includes("-f");
  const showHelp2 = args.includes("--help") || args.includes("-h");
  const listMode = args.includes("--list") || args.includes("-l");
  const filePath = args.find((a) => !a.startsWith("-"));
  if (showHelp2) {
    console.log(`
Import Dashboard Snapshot for Claw Dashboard

Usage: clawdash import-snapshot [path] [options]

Arguments:
  path              Path to snapshot file (optional with --list)

Options:
  -l, --list        List available snapshots
  -d, --dry-run     Validate without applying
  -f, --force       Skip confirmation
  -j, --json        Output results as JSON
  -h, --help        Show this help message

Examples:
  clawdash import-snapshot --list
  clawdash import-snapshot ~/my-layout.json
  clawdash import-snapshot ~/.openclaw/snapshots/claw-snapshot-*.json --dry-run
  clawdash import-snapshot ~/backup.json --force
`);
    return 0;
  }
  if (listMode) {
    const snapshots = listSnapshots();
    if (jsonOutput) {
      console.log(JSON.stringify({ snapshots }, null, 2));
    } else {
      if (snapshots.length === 0) {
        console.log("No snapshots found in ~/.openclaw/snapshots/");
      } else {
        console.log("Available snapshots:");
        console.log("");
        snapshots.forEach((s, i) => {
          const date = new Date(s.createdAt).toLocaleDateString();
          console.log(`  ${i + 1}. ${s.name}`);
          console.log(`     Created: ${date}`);
          console.log(`     Path: ${s.path}`);
          if (s.metadata) {
            console.log(`     Widgets: ${s.metadata.widgetCount}, Plugins: ${s.metadata.pluginCount}`);
          }
          console.log("");
        });
      }
    }
    return 0;
  }
  if (!filePath) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: false,
        error: "File path is required (use --list to see available snapshots)"
      }, null, 2));
    } else {
      console.error("Error: File path is required");
      console.error("Run with --list to see available snapshots");
      console.error("Run with --help for usage information");
    }
    return 1;
  }
  try {
    let resolvedPath = filePath;
    if (filePath.startsWith("~")) {
      resolvedPath = (0, import_path17.join)(import_os10.default.homedir(), filePath.slice(1));
    }
    resolvedPath = (0, import_path17.resolve)(resolvedPath);
    const result = importSnapshotFromFile(resolvedPath);
    if (!result.success) {
      if (jsonOutput) {
        console.log(JSON.stringify({
          success: false,
          error: result.error,
          path: resolvedPath
        }, null, 2));
      } else {
        console.error(`\u2717 Import failed: ${result.error}`);
      }
      return 1;
    }
    const { snapshot } = result;
    if (dryRun) {
      const summary = getSnapshotSummary(snapshot);
      if (jsonOutput) {
        console.log(JSON.stringify({
          success: true,
          dryRun: true,
          path: resolvedPath,
          snapshot: {
            name: snapshot.name,
            description: snapshot.description,
            version: snapshot.dashboardVersion,
            schemaVersion: snapshot.schemaVersion,
            createdAt: snapshot.createdAt,
            metadata: snapshot.metadata
          },
          summary: summary.split("\n")
        }, null, 2));
      } else {
        console.log("\u2713 Snapshot is valid (dry run, no changes applied)");
        console.log("");
        console.log(summary);
      }
      return 0;
    }
    if (!jsonOutput && !force) {
      const summary = getSnapshotSummary(snapshot);
      console.log("Snapshot to import:");
      console.log("");
      console.log(summary);
      console.log("");
      console.log("Run with --force to apply, or --dry-run to preview");
      return 0;
    }
    const currentSettings = { ...DEFAULT_SETTINGS };
    try {
      if (import_fs18.default.existsSync(PATHS.SETTINGS)) {
        const data = import_fs18.default.readFileSync(PATHS.SETTINGS, "utf8");
        Object.assign(currentSettings, JSON.parse(data));
      }
    } catch (err) {
    }
    const mergedSettings = mergeSnapshotSettings(currentSettings, snapshot.settings);
    saveSettings(mergedSettings);
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: true,
        path: resolvedPath,
        snapshot: {
          name: snapshot.name,
          version: snapshot.dashboardVersion,
          createdAt: snapshot.createdAt
        },
        applied: Object.keys(snapshot.settings)
      }, null, 2));
    } else {
      console.log("\u2713 Snapshot imported successfully");
      console.log(`  Name: ${snapshot.name}`);
      console.log(`  Version: ${snapshot.dashboardVersion}`);
      console.log("");
      console.log("Settings have been merged and saved.");
      console.log("Restart Claw Dashboard to apply all changes.");
    }
    return 0;
  } catch (err) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: false,
        error: err.message
      }, null, 2));
    } else {
      console.error(`\u2717 Import error: ${err.message}`);
    }
    return 1;
  }
}

// src/cli/list-templates.js
async function runListTemplatesCli(args) {
  const showHelp2 = args.includes("--help") || args.includes("-h");
  if (showHelp2) {
    console.log(`
List Available Widget Templates

Usage: clawdash list-templates [options]

Options:
  -j, --json        Output as JSON
  -h, --help        Show this help message

Examples:
  clawdash list-templates
  clawdash list-templates --json
`);
    return 0;
  }
  const jsonOutput = args.includes("--json") || args.includes("-j");
  try {
    const templates = listTemplates();
    if (jsonOutput) {
      console.log(JSON.stringify(templates, null, 2));
    } else {
      console.log("");
      console.log("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557");
      console.log("\u2551           Available Widget Templates                         \u2551");
      console.log("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
      console.log("");
      templates.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name}`);
        console.log(`     ID: ${template.id}`);
        console.log(`     ${template.description}`);
        console.log("");
      });
      console.log("Usage:");
      console.log("  clawdash create-plugin <name> --template <id>");
      console.log("");
      console.log("Example:");
      console.log("  clawdash create-plugin my-widget --template api");
      console.log("");
    }
    return 0;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return 1;
  }
}

// src/cli/export-schedule.js
var import_fs19 = __toESM(require("fs"), 1);
var import_path18 = __toESM(require("path"), 1);
var import_url9 = require("url");
init_logger();
init_config();
var __filename8 = (0, import_url9.fileURLToPath)("file://" + (typeof __dirname8 !== "undefined" ? require("path").join(__dirname8, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname8 = import_path18.default.dirname(__filename8);
var SETTINGS_PATH2 = config_default.PATHS.SETTINGS;
function loadSettings() {
  try {
    if (!import_fs19.default.existsSync(SETTINGS_PATH2)) {
      return config_default.DEFAULT_SETTINGS;
    }
    const data = import_fs19.default.readFileSync(SETTINGS_PATH2, "utf8");
    const loaded = JSON.parse(data);
    const result = validation_default.validateSettings(loaded);
    return result.valid ? result.value : config_default.DEFAULT_SETTINGS;
  } catch (err) {
    logger_default.error(`Failed to load settings: ${err.message}`);
    return config_default.DEFAULT_SETTINGS;
  }
}
function saveSettings2(settings) {
  try {
    const dir = import_path18.default.dirname(SETTINGS_PATH2);
    if (!import_fs19.default.existsSync(dir)) {
      import_fs19.default.mkdirSync(dir, { recursive: true });
    }
    import_fs19.default.writeFileSync(SETTINGS_PATH2, JSON.stringify(settings, null, 2));
    logger_default.info("Settings saved successfully");
  } catch (err) {
    logger_default.error(`Failed to save settings: ${err.message}`);
  }
}
function showScheduleStatus() {
  const settings = loadSettings();
  const schedule = settings.exportSchedule || DEFAULT_SCHEDULE_CONFIG;
  console.log("\n=== Export Schedule Status ===\n");
  console.log(`Enabled: ${schedule.enabled ? "Yes" : "No"}`);
  console.log(`Format: ${schedule.format}`);
  console.log(`Schedule: ${schedule.schedule}`);
  console.log(`Retention: ${schedule.retentionDays} days${schedule.retentionDays === 0 ? " (forever)" : ""}`);
  console.log(`Directory: ${schedule.directory || "(default)"}`);
  console.log(`Include Metrics: ${schedule.includeMetrics ? "Yes" : "No"}`);
  const presetName = Object.entries(CRON_PRESETS).find(([_, value]) => value === schedule.schedule);
  if (presetName) {
    console.log(`Preset: ${presetName[0]}`);
  }
  console.log("\n=== Available Cron Presets ===\n");
  for (const [name, expression] of Object.entries(CRON_PRESETS)) {
    console.log(`  ${name.padEnd(20)} ${expression}`);
  }
  console.log("");
}
function setScheduleEnabled(enabled) {
  const settings = loadSettings();
  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }
  settings.exportSchedule.enabled = Boolean(enabled);
  saveSettings2(settings);
  console.log(`Export schedule ${enabled ? "enabled" : "disabled"}`);
}
function setSchedule(expression) {
  const settings = loadSettings();
  let cronExpression = expression;
  if (CRON_PRESETS[expression]) {
    cronExpression = CRON_PRESETS[expression];
    console.log(`Using preset: ${expression} (${cronExpression})`);
  }
  try {
    const { CronParser: CronParser2 } = ExportScheduler;
    CronParser2.parse(cronExpression);
  } catch (err) {
    console.error(`Invalid cron expression: ${err.message}`);
    console.error("\nAvailable presets:");
    for (const [name, expr] of Object.entries(CRON_PRESETS)) {
      console.error(`  ${name}: ${expr}`);
    }
    process.exit(1);
  }
  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }
  settings.exportSchedule.schedule = cronExpression;
  saveSettings2(settings);
  console.log(`Export schedule set to: ${cronExpression}`);
}
function setScheduleFormat(format) {
  const normalizedFormat = format.toLowerCase();
  if (!["json", "csv"].includes(normalizedFormat)) {
    console.error(`Invalid format: ${format}`);
    console.error("Valid formats: json, csv");
    process.exit(1);
  }
  const settings = loadSettings();
  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }
  settings.exportSchedule.format = normalizedFormat;
  saveSettings2(settings);
  console.log(`Export format set to: ${normalizedFormat}`);
}
function setScheduleRetention(days) {
  const daysNum = parseInt(days, 10);
  if (isNaN(daysNum) || daysNum < 0 || daysNum > 365) {
    console.error("Invalid retention days: must be 0-365");
    console.error("  0 = keep forever");
    console.error("  1-365 = keep for N days");
    process.exit(1);
  }
  const settings = loadSettings();
  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }
  settings.exportSchedule.retentionDays = daysNum;
  saveSettings2(settings);
  console.log(`Export retention set to: ${daysNum === 0 ? "forever" : `${daysNum} days`}`);
}
function setScheduleDirectory(directory) {
  const settings = loadSettings();
  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }
  settings.exportSchedule.directory = directory || null;
  saveSettings2(settings);
  console.log(`Export directory set to: ${directory || "(default)"}`);
}
async function triggerExport() {
  const settings = loadSettings();
  const schedule = settings.exportSchedule || DEFAULT_SCHEDULE_CONFIG;
  console.log("\nTriggering immediate export...\n");
  const scheduler = new ExportScheduler(schedule);
  scheduler.setMetricsCallback(async () => {
    return {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "cli-manual-export"
    };
  });
  const result = await scheduler.triggerExport();
  if (result.success) {
    console.log(`Export completed successfully: ${result.path}`);
  } else {
    console.error(`Export failed: ${result.error}`);
    process.exit(1);
  }
}
function listExports() {
  const settings = loadSettings();
  const schedule = settings.exportSchedule || DEFAULT_SCHEDULE_CONFIG;
  const exportDir = schedule.directory || import_path18.default.join(config_default.PATHS.OPENCLAW_DIR, "snapshots");
  console.log(`
=== Recent Exports in ${exportDir} ===
`);
  if (!import_fs19.default.existsSync(exportDir)) {
    console.log("No exports found (directory does not exist)");
    return;
  }
  try {
    const files = import_fs19.default.readdirSync(exportDir).filter((f) => f.startsWith("claw-export-") || f.startsWith("claw-snapshot-")).map((f) => {
      const filePath = import_path18.default.join(exportDir, f);
      const stats = import_fs19.default.statSync(filePath);
      return {
        name: f,
        size: stats.size,
        mtime: stats.mtime
      };
    }).sort((a, b) => b.mtime - a.mtime).slice(0, 20);
    if (files.length === 0) {
      console.log("No exports found");
      return;
    }
    console.log("Filename".padEnd(50) + "Size".padEnd(15) + "Modified");
    console.log("-".repeat(80));
    for (const file of files) {
      const sizeStr = formatFileSize(file.size);
      const dateStr = file.mtime.toISOString().replace("T", " ").slice(0, 19);
      console.log(file.name.padEnd(50) + sizeStr.padEnd(15) + dateStr);
    }
    console.log("");
  } catch (err) {
    console.error(`Failed to list exports: ${err.message}`);
  }
}
function formatFileSize(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
function showExportScheduleHelp() {
  console.log(`
Export Schedule Management Commands

Usage: clawdash export-schedule <command> [options]

Commands:
  status              Show current schedule configuration
  enable              Enable scheduled exports
  disable             Disable scheduled exports
  set <expression>    Set cron schedule (or preset name)
  format <format>     Set export format (json or csv)
  retention <days>    Set retention period (0-365 days, 0=forever)
  directory <path>    Set export directory
  export              Trigger immediate export
  list                List recent exports

Cron Presets:
  everyMinute         * * * * *
  every5Minutes       */5 * * * *
  every15Minutes      */15 * * * *
  hourly              0 * * * *
  every6Hours         0 */6 * * *
  daily               0 0 * * *
  weekly              0 0 * * 0
  monthly             0 0 1 * *

Examples:
  clawdash export-schedule status
  clawdash export-schedule enable
  clawdash export-schedule set hourly
  clawdash export-schedule set "*/30 * * * *"
  clawdash export-schedule format csv
  clawdash export-schedule retention 7
  clawdash export-schedule export
`);
}
async function runExportScheduleCli(args = []) {
  const command = args[0];
  const arg = args[1];
  switch (command) {
    case "status":
      showScheduleStatus();
      break;
    case "enable":
      setScheduleEnabled(true);
      break;
    case "disable":
      setScheduleEnabled(false);
      break;
    case "set":
      if (!arg) {
        console.error("Error: cron expression required");
        console.error("Usage: clawdash export-schedule set <expression>");
        console.error('Example: clawdash export-schedule set "0 * * * *"');
        return 1;
      }
      setSchedule(arg);
      break;
    case "format":
      if (!arg) {
        console.error("Error: format required");
        console.error("Usage: clawdash export-schedule format <json|csv>");
        return 1;
      }
      setScheduleFormat(arg);
      break;
    case "retention":
      if (arg === void 0) {
        console.error("Error: retention days required");
        console.error("Usage: clawdash export-schedule retention <days>");
        return 1;
      }
      setScheduleRetention(arg);
      break;
    case "directory":
      setScheduleDirectory(arg || "");
      break;
    case "export":
      await triggerExport();
      break;
    case "list":
      listExports();
      break;
    case "help":
    case "--help":
    case "-h":
      showExportScheduleHelp();
      break;
    default:
      if (!command) {
        showScheduleStatus();
      } else {
        console.error(`Unknown command: ${command}`);
        console.error("Run with --help for usage");
        return 1;
      }
  }
  return 0;
}

// src/container-detector.js
var import_fs20 = __toESM(require("fs"), 1);
var import_os11 = __toESM(require("os"), 1);
var import_child_process3 = require("child_process");
var import_util2 = require("util");
init_logger();
var execAsync2 = (0, import_util2.promisify)(import_child_process3.exec);
var DEFAULT_CONTAINER_ENV = {
  isContainer: false,
  isDocker: false,
  isKubernetes: false,
  isWSL: false,
  wslVersion: 0,
  wslDistro: null,
  containerId: null,
  containerName: null,
  podName: null,
  namespace: null,
  runtime: "none"
};
var cachedContainerEnv = null;
var cacheTimestamp = 0;
var CACHE_TTL_MS = 3e4;
async function checkDockerCgroup() {
  try {
    const cgroupContent = import_fs20.default.readFileSync("/proc/self/cgroup", "utf8");
    return cgroupContent.includes("docker") || cgroupContent.includes("containerd") || cgroupContent.includes("crio") || /[0-9a-f]{64}/.test(cgroupContent);
  } catch {
    return false;
  }
}
function checkDockerEnvFile() {
  try {
    import_fs20.default.accessSync("/.dockerenv", import_fs20.default.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function checkKubernetes() {
  const result = {
    isKubernetes: false,
    podName: null,
    namespace: null
  };
  try {
    if (import_fs20.default.existsSync("/var/run/secrets/kubernetes.io")) {
      result.isKubernetes = true;
    }
    if (process.env.KUBERNETES_SERVICE_HOST || process.env.KUBERNETES_PORT) {
      result.isKubernetes = true;
    }
    if (process.env.HOSTNAME) {
      const hostname = process.env.HOSTNAME;
      if (hostname.includes("-") && /[a-f0-9]{5,10}$/.test(hostname)) {
        result.podName = hostname;
      }
    }
    try {
      const namespacePath = "/var/run/secrets/kubernetes.io/serviceaccount/namespace";
      if (import_fs20.default.existsSync(namespacePath)) {
        result.namespace = import_fs20.default.readFileSync(namespacePath, "utf8").trim();
      }
    } catch {
    }
    if (!result.namespace && process.env.KUBERNETES_NAMESPACE) {
      result.namespace = process.env.KUBERNETES_NAMESPACE;
    }
  } catch {
  }
  return result;
}
function checkWSL() {
  try {
    const version = import_fs20.default.readFileSync("/proc/version", "utf8").toLowerCase();
    if (version.includes("microsoft") || version.includes("wsl")) {
      return true;
    }
  } catch {
  }
  if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) {
    return true;
  }
  try {
    if (import_fs20.default.existsSync("/mnt/c/Windows")) {
      return true;
    }
  } catch {
  }
  return false;
}
function detectWSLVersion() {
  if (!checkWSL()) {
    return 0;
  }
  try {
    const version = import_fs20.default.readFileSync("/proc/version", "utf8").toLowerCase();
    if (version.includes("wsl2") || version.includes("microsoft-standard")) {
      return 2;
    }
  } catch {
  }
  try {
    if (import_fs20.default.existsSync("/run/systemd/system")) {
      return 2;
    }
  } catch {
  }
  try {
    const version = import_fs20.default.readFileSync("/proc/version", "utf8");
    const kernelMatch = version.match(/Linux version (\d+)\.(\d+)/);
    if (kernelMatch) {
      const major = parseInt(kernelMatch[1]);
      const minor = parseInt(kernelMatch[2]);
      if (major > 4 || major === 4 && minor >= 19) {
        return 2;
      }
    }
  } catch {
  }
  return 1;
}
function getWSLDistroName() {
  if (process.env.WSL_DISTRO_NAME) {
    return process.env.WSL_DISTRO_NAME;
  }
  try {
    const osRelease = import_fs20.default.readFileSync("/etc/os-release", "utf8");
    const nameMatch = osRelease.match(/PRETTY_NAME="([^"]+)"/);
    if (nameMatch) {
      return nameMatch[1];
    }
  } catch {
  }
  return null;
}
function getContainerId() {
  try {
    const cgroupContent = import_fs20.default.readFileSync("/proc/self/cgroup", "utf8");
    const match = cgroupContent.match(/[0-9a-f]{64}/);
    if (match) {
      return match[0].substring(0, 12);
    }
    const lines = cgroupContent.split("\n");
    for (const line of lines) {
      const dockerMatch = line.match(/\/docker\/([0-9a-f]{12,64})/i);
      if (dockerMatch) {
        return dockerMatch[1].substring(0, 12);
      }
      const containerdMatch = line.match(/\/containerd\/.*\/([0-9a-f]{12,64})/i);
      if (containerdMatch) {
        return containerdMatch[1].substring(0, 12);
      }
      const criMatch = line.match(/\/cri-containerd\/([0-9a-f]{12,64})/i);
      if (criMatch) {
        return criMatch[1].substring(0, 12);
      }
    }
  } catch {
  }
  return null;
}
async function getContainerName() {
  if (process.env.CONTAINER_NAME) {
    return process.env.CONTAINER_NAME;
  }
  if (process.env.HOSTNAME && !checkWSL()) {
    return process.env.HOSTNAME;
  }
  return null;
}
async function detectRuntime() {
  try {
    const cgroupContent = import_fs20.default.readFileSync("/proc/self/cgroup", "utf8");
    if (cgroupContent.includes("docker")) {
      return "docker";
    }
    if (cgroupContent.includes("containerd")) {
      return "containerd";
    }
    if (cgroupContent.includes("crio")) {
      return "cri-o";
    }
    if (cgroupContent.includes("podman")) {
      return "podman";
    }
    if (cgroupContent.includes("lxc")) {
      return "lxc";
    }
    if (cgroupContent.includes("systemd-nspawn")) {
      return "systemd-nspawn";
    }
    if (import_fs20.default.existsSync("/run/containerd")) {
      return "containerd";
    }
    if (import_fs20.default.existsSync("/run/crio")) {
      return "cri-o";
    }
    if (import_fs20.default.existsSync("/run/docker.sock") || import_fs20.default.existsSync("/var/run/docker.sock")) {
      return "docker-accessible";
    }
    if (cgroupContent.includes("0::/") && cgroupContent.split("\n").length > 1) {
      return "container";
    }
  } catch {
  }
  return "unknown";
}
async function detectContainerEnv() {
  const now = Date.now();
  if (cachedContainerEnv && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedContainerEnv;
  }
  const env = { ...DEFAULT_CONTAINER_ENV };
  const platform = import_os11.default.platform();
  if (platform === "win32") {
    return env;
  }
  try {
    const [dockerCgroup, dockerEnvFile] = await Promise.all([
      checkDockerCgroup(),
      Promise.resolve(checkDockerEnvFile())
    ]);
    if (dockerCgroup || dockerEnvFile) {
      env.isContainer = true;
      env.isDocker = true;
      env.containerId = getContainerId();
      env.containerName = await getContainerName();
    }
    const k8sInfo = await checkKubernetes();
    if (k8sInfo.isKubernetes) {
      env.isContainer = true;
      env.isKubernetes = true;
      env.podName = k8sInfo.podName;
      env.namespace = k8sInfo.namespace;
    }
    env.isWSL = checkWSL();
    if (env.isWSL) {
      env.wslVersion = detectWSLVersion();
      env.wslDistro = getWSLDistroName();
    }
    if (env.isContainer) {
      env.runtime = await detectRuntime();
    }
    cachedContainerEnv = env;
    cacheTimestamp = now;
  } catch (err) {
    logger_default.warn(`Container detection failed: ${err.message}`);
  }
  return env;
}
function getContainerDescription(env) {
  if (!env.isContainer) {
    return "Bare Metal/VM";
  }
  const parts = [];
  if (env.isKubernetes) {
    parts.push("Kubernetes");
    if (env.namespace) {
      parts.push(`ns:${env.namespace}`);
    }
    if (env.podName) {
      const shortPod = env.podName.length > 20 ? env.podName.substring(0, 17) + "..." : env.podName;
      parts.push(`pod:${shortPod}`);
    }
  } else if (env.isDocker) {
    parts.push("Docker");
    if (env.containerId) {
      parts.push(`id:${env.containerId}`);
    }
  } else {
    parts.push(env.runtime !== "unknown" ? env.runtime : "Container");
  }
  if (env.isWSL) {
    const wslLabel = env.wslVersion === 2 ? "WSL2" : env.wslVersion === 1 ? "WSL1" : "WSL";
    parts.push(`(${wslLabel})`);
  }
  return parts.join(" ");
}
function getContainerIndicator(env) {
  if (env.isWSL) {
    const wslLabel = env.wslVersion === 2 ? "WSL2" : env.wslVersion === 1 ? "WSL1" : "WSL";
    return `\u229E ${wslLabel}`;
  }
  if (!env.isContainer) {
    return "";
  }
  if (env.isKubernetes) {
    return "\u2638 K8s";
  }
  if (env.isDocker) {
    return "\u{1F433} Docker";
  }
  return "\u2B21 Container";
}
function clearContainerCache() {
  cachedContainerEnv = null;
  cacheTimestamp = 0;
}
var container_detector_default = {
  detectContainerEnv,
  getContainerDescription,
  getContainerIndicator,
  clearContainerCache,
  DEFAULT_CONTAINER_ENV
};

// src/transitions.js
var import_blessed5 = __toESM(require("blessed"), 1);
var EASING = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  spring: (t) => {
    const c4 = 2 * Math.PI / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};
var DEFAULT_OPTIONS2 = {
  duration: 200,
  // Animation duration in ms
  easing: "easeOut",
  // Easing function name
  fade: true,
  // Fade opacity
  slide: false,
  // Slide from direction
  scale: false,
  // Scale effect
  slideDirection: "up",
  // 'up', 'down', 'left', 'right'
  fadeBackground: true
  // Fade background opacity
};
var activeAnimations = /* @__PURE__ */ new Map();
function createBackground(screen, options = {}) {
  const bg = import_blessed5.default.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    style: {
      bg: "black"
    },
    transparent: true
  });
  const opacity = options.fadeBackground !== false ? 0 : 0.4;
  bg.style.transparent = true;
  bg._targetOpacity = options.backgroundOpacity || 0.4;
  bg._currentOpacity = opacity;
  return bg;
}
function animate({
  from,
  to,
  duration = 200,
  easing = "easeOut",
  onUpdate,
  onComplete
}) {
  const easeFn = EASING[easing] || EASING.easeOut;
  const startTime = Date.now();
  let animationId = null;
  let stopped = false;
  const step = () => {
    if (stopped) return;
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeFn(progress);
    const currentValue = from + (to - from) * easedProgress;
    onUpdate(currentValue);
    if (progress < 1) {
      animationId = setImmediate(step);
    } else {
      onComplete?.();
    }
  };
  animationId = setImmediate(step);
  return {
    stop: () => {
      stopped = true;
      if (animationId) {
        clearImmediate(animationId);
      }
    }
  };
}
function transitionIn(screen, widget, options = {}) {
  const opts = { ...DEFAULT_OPTIONS2, ...options };
  const animationId = `in_${widget.uid || Math.random().toString(36).substr(2, 9)}`;
  if (activeAnimations.has(animationId)) {
    activeAnimations.get(animationId).stop();
  }
  return new Promise((resolve9) => {
    const animations = [];
    const originalTop = widget.top;
    const originalLeft = widget.left;
    const originalWidth = widget.width;
    const originalHeight = widget.height;
    widget._originalPosition = {
      top: originalTop,
      left: originalLeft,
      width: originalWidth,
      height: originalHeight
    };
    if (opts.fade) {
      widget.style.transparent = true;
      widget._opacity = 0;
      const fadeAnim = animate({
        from: 0,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget._opacity = value;
          widget.style.alpha = value;
          widget.style.transparent = value < 0.1;
        }
      });
      animations.push(fadeAnim);
    }
    if (opts.slide) {
      let fromTop = originalTop;
      let fromLeft = originalLeft;
      const slideDistance = 20;
      switch (opts.slideDirection) {
        case "up":
          fromTop = originalTop + slideDistance;
          break;
        case "down":
          fromTop = originalTop - slideDistance;
          break;
        case "left":
          fromLeft = originalLeft + slideDistance;
          break;
        case "right":
          fromLeft = originalLeft - slideDistance;
          break;
      }
      widget.top = fromTop;
      widget.left = fromLeft;
      const slideAnim = animate({
        from: 0,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget.top = fromTop + (originalTop - fromTop) * value;
          widget.left = fromLeft + (originalLeft - fromLeft) * value;
          screen.render();
        }
      });
      animations.push(slideAnim);
    }
    if (opts.scale) {
      const parseDim = (dim) => {
        if (typeof dim === "string" && dim.includes("%")) {
          return { value: parseInt(dim), unit: "%" };
        }
        return { value: parseInt(dim) || 10, unit: typeof dim === "string" && dim.includes("%") ? "%" : "" };
      };
      const origW = parseDim(originalWidth);
      const origH = parseDim(originalHeight);
      const startScale = 0.9;
      const currentW = Math.round(origW.value * startScale);
      const currentH = Math.round(origH.value * startScale);
      widget.width = currentW + origW.unit;
      widget.height = currentH + origH.unit;
      const scaleAnim = animate({
        from: startScale,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          const newW = Math.round(origW.value * value);
          const newH = Math.round(origH.value * value);
          widget.width = newW + origW.unit;
          widget.height = newH + origH.unit;
          screen.render();
        },
        onComplete: () => {
          widget.width = originalWidth;
          widget.height = originalHeight;
        }
      });
      animations.push(scaleAnim);
    }
    let bgAnim = null;
    if (opts.fadeBackground && opts.background) {
      bgAnim = animate({
        from: 0,
        to: opts.background._targetOpacity || 0.4,
        duration: opts.duration,
        easing: "linear",
        onUpdate: (value) => {
          opts.background._currentOpacity = value;
          opts.background.style.alpha = value;
        }
      });
    }
    setTimeout(() => {
      animations.forEach((a) => a.stop());
      if (bgAnim) bgAnim.stop();
      activeAnimations.delete(animationId);
      widget.top = originalTop;
      widget.left = originalLeft;
      widget.width = originalWidth;
      widget.height = originalHeight;
      widget.style.transparent = false;
      widget.style.alpha = 1;
      screen.render();
      resolve9();
    }, opts.duration);
    activeAnimations.set(animationId, {
      stop: () => {
        animations.forEach((a) => a.stop());
        if (bgAnim) bgAnim.stop();
        activeAnimations.delete(animationId);
      }
    });
    screen.render();
  });
}
function transitionOut(screen, widget, options = {}) {
  if (!widget || widget.destroyed) {
    return Promise.resolve();
  }
  const opts = { ...DEFAULT_OPTIONS2, ...options };
  const animationId = `out_${widget.uid || Math.random().toString(36).substr(2, 9)}`;
  if (activeAnimations.has(animationId)) {
    activeAnimations.get(animationId).stop();
  }
  return new Promise((resolve9) => {
    const animations = [];
    const originalPosition = widget._originalPosition || {
      top: widget.top,
      left: widget.left,
      width: widget.width,
      height: widget.height
    };
    if (opts.fade) {
      const fadeAnim = animate({
        from: 1,
        to: 0,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget.style.alpha = value;
          widget.style.transparent = value < 0.1;
          screen.render();
        }
      });
      animations.push(fadeAnim);
    }
    if (opts.slide) {
      let toTop = originalPosition.top;
      let toLeft = originalPosition.left;
      const slideDistance = 20;
      switch (opts.slideDirection) {
        case "up":
          toTop = originalPosition.top - slideDistance;
          break;
        case "down":
          toTop = originalPosition.top + slideDistance;
          break;
        case "left":
          toLeft = originalPosition.left - slideDistance;
          break;
        case "right":
          toLeft = originalPosition.left + slideDistance;
          break;
      }
      const slideAnim = animate({
        from: 0,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget.top = originalPosition.top + (toTop - originalPosition.top) * value;
          widget.left = originalPosition.left + (toLeft - originalPosition.left) * value;
          screen.render();
        }
      });
      animations.push(slideAnim);
    }
    if (opts.scale) {
      const parseDim = (dim) => {
        if (typeof dim === "string" && dim.includes("%")) {
          return { value: parseInt(dim), unit: "%" };
        }
        return { value: parseInt(dim) || 10, unit: typeof dim === "string" && dim.includes("%") ? "%" : "" };
      };
      const origW = parseDim(originalPosition.width);
      const origH = parseDim(originalPosition.height);
      const endScale = 0.9;
      const scaleAnim = animate({
        from: 1,
        to: endScale,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          const newW = Math.round(origW.value * value);
          const newH = Math.round(origH.value * value);
          widget.width = newW + origW.unit;
          widget.height = newH + origH.unit;
          screen.render();
        }
      });
      animations.push(scaleAnim);
    }
    let bgAnim = null;
    if (opts.fadeBackground && opts.background) {
      const startOpacity = opts.background._currentOpacity || 0.4;
      bgAnim = animate({
        from: startOpacity,
        to: 0,
        duration: opts.duration,
        easing: "linear",
        onUpdate: (value) => {
          opts.background._currentOpacity = value;
          opts.background.style.alpha = value;
          screen.render();
        }
      });
    }
    setTimeout(() => {
      animations.forEach((a) => a.stop());
      if (bgAnim) bgAnim.stop();
      activeAnimations.delete(animationId);
      resolve9();
    }, opts.duration);
    activeAnimations.set(animationId, {
      stop: () => {
        animations.forEach((a) => a.stop());
        if (bgAnim) bgAnim.stop();
        activeAnimations.delete(animationId);
      }
    });
  });
}
function quickFade(screen, widget, show, duration = 150) {
  if (!widget || widget.destroyed) return Promise.resolve();
  return new Promise((resolve9) => {
    const from = show ? 0 : 1;
    const to = show ? 1 : 0;
    animate({
      from,
      to,
      duration,
      easing: "easeOut",
      onUpdate: (value) => {
        widget.style.alpha = value;
        widget.style.transparent = value < 0.1;
        screen.render();
      },
      onComplete: () => {
        if (!show) {
          widget.hide();
        } else {
          widget.show();
          widget.style.alpha = 1;
          widget.style.transparent = false;
        }
        screen.render();
        resolve9();
      }
    });
  });
}
function staggeredFade(screen, items, show, options = {}) {
  const delay = options.staggerDelay || 30;
  const duration = options.duration || 100;
  const promises = items.map((item, index) => {
    return new Promise((resolve9) => {
      setTimeout(() => {
        quickFade(screen, item, show, duration).then(resolve9);
      }, index * delay);
    });
  });
  return Promise.all(promises);
}
function isAnimating() {
  return activeAnimations.size > 0;
}
function stopAll() {
  activeAnimations.forEach((anim) => anim.stop());
  activeAnimations.clear();
}
var transitions_default = {
  animate,
  transitionIn,
  transitionOut,
  quickFade,
  staggeredFade,
  createBackground,
  isAnimating,
  stopAll,
  EASING
};

// src/differential-render.js
init_logger();
var WidgetStateTracker = class {
  constructor() {
    this.states = /* @__PURE__ */ new Map();
    this.stats = {
      totalUpdates: 0,
      skippedUpdates: 0,
      actualUpdates: 0,
      screenRenders: 0,
      skippedRenders: 0
    };
  }
  /**
   * Generate a hash for comparing complex objects
   * @param {*} value - Value to hash
   * @returns {string} Hash string
   */
  _hash(value) {
    if (value === null || value === void 0) return String(value);
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }
  /**
   * Track widget content update
   * @param {string} widgetId - Unique widget identifier
   * @param {string} newContent - New content to set
   * @param {Function} updateFn - Function to call if update is needed
   * @returns {boolean} True if update was performed
   */
  trackContent(widgetId, newContent, updateFn) {
    const key = `${widgetId}:content`;
    const current = this.states.get(key);
    const newValue = String(newContent ?? "");
    this.stats.totalUpdates++;
    if (current === newValue) {
      this.stats.skippedUpdates++;
      return false;
    }
    this.states.set(key, newValue);
    this.stats.actualUpdates++;
    updateFn(newValue);
    return true;
  }
  /**
   * Track style update for a widget
   * @param {string} widgetId - Unique widget identifier
   * @param {string} styleProp - Style property name
   * @param {*} newValue - New style value
   * @param {Function} updateFn - Function to call if update is needed
   * @returns {boolean} True if update was performed
   */
  trackStyle(widgetId, styleProp, newValue, updateFn) {
    const key = `${widgetId}:style:${styleProp}`;
    const current = this.states.get(key);
    const hashedNew = this._hash(newValue);
    if (current === hashedNew) {
      return false;
    }
    this.states.set(key, hashedNew);
    updateFn(newValue);
    return true;
  }
  /**
   * Track label update for a widget
   * @param {string} widgetId - Unique widget identifier
   * @param {string} newLabel - New label value
   * @param {Function} updateFn - Function to call if update is needed
   * @returns {boolean} True if update was performed
   */
  trackLabel(widgetId, newLabel, updateFn) {
    const key = `${widgetId}:label`;
    const current = this.states.get(key);
    const newValue = String(newLabel ?? "");
    if (current === newValue) {
      return false;
    }
    this.states.set(key, newValue);
    updateFn(newValue);
    return true;
  }
  /**
   * Reset state for a specific widget (e.g., after resize)
   * @param {string} widgetId - Widget identifier
   */
  resetWidget(widgetId) {
    for (const key of this.states.keys()) {
      if (key.startsWith(`${widgetId}:`)) {
        this.states.delete(key);
      }
    }
  }
  /**
   * Reset all tracked state
   */
  resetAll() {
    this.states.clear();
    logger_default.debug("Differential render state reset");
  }
  /**
   * Get current statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const efficiency = this.stats.totalUpdates > 0 ? (this.stats.skippedUpdates / this.stats.totalUpdates * 100).toFixed(1) : 0;
    const renderEfficiency = this.stats.screenRenders > 0 ? (this.stats.skippedRenders / (this.stats.screenRenders + this.stats.skippedRenders) * 100).toFixed(1) : 0;
    return {
      ...this.stats,
      efficiency: `${efficiency}%`,
      renderEfficiency: `${renderEfficiency}%`,
      trackedWidgets: this.states.size
    };
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalUpdates: 0,
      skippedUpdates: 0,
      actualUpdates: 0,
      screenRenders: 0,
      skippedRenders: 0
    };
  }
};
var DifferentialRenderer = class {
  constructor(screen) {
    this.screen = screen;
    this.tracker = new WidgetStateTracker();
    this.pendingChanges = /* @__PURE__ */ new Set();
    this.batchMode = false;
    this.deferredRender = null;
  }
  /**
   * Start batching mode - screen.render() will be deferred
   */
  beginBatch() {
    this.batchMode = true;
    this.pendingChanges.clear();
  }
  /**
   * End batching and render if changes occurred
   */
  endBatch() {
    this.batchMode = false;
    const hasChanges = this.pendingChanges.size > 0;
    this.pendingChanges.clear();
    if (hasChanges) {
      this.tracker.stats.screenRenders++;
      this.screen.render();
      return true;
    } else {
      this.tracker.stats.skippedRenders++;
      return false;
    }
  }
  /**
   * Request a screen render, may be deferred in batch mode
   */
  requestRender() {
    if (this.batchMode) {
      this.pendingChanges.add("render");
    } else {
      this.tracker.stats.screenRenders++;
      this.screen.render();
    }
  }
  /**
   * Set widget content with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} content - New content
   * @returns {boolean} True if content was updated
   */
  setContent(widgetId, widget, content2) {
    if (!widget || widget.destroyed) return false;
    const changed = this.tracker.trackContent(widgetId, content2, (newContent) => {
      widget.setContent(newContent);
      this.pendingChanges.add(widgetId);
    });
    return changed;
  }
  /**
   * Set widget style property with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} prop - Style property
   * @param {*} value - New value
   * @returns {boolean} True if style was updated
   */
  setStyle(widgetId, widget, prop, value) {
    if (!widget || widget.destroyed) return false;
    const changed = this.tracker.trackStyle(widgetId, prop, value, (newValue) => {
      widget.style[prop] = newValue;
      this.pendingChanges.add(`${widgetId}:style`);
    });
    return changed;
  }
  /**
   * Set widget foreground color with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} color - New color
   * @returns {boolean} True if color was updated
   */
  setFg(widgetId, widget, color) {
    return this.setStyle(widgetId, widget, "fg", color);
  }
  /**
   * Set border color with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget with border
   * @param {string} color - New color
   * @returns {boolean} True if border was updated
   */
  setBorderFg(widgetId, widget, color) {
    if (!widget || widget.destroyed || !widget.style.border) return false;
    const changed = this.tracker.trackStyle(widgetId, "border.fg", color, (newValue) => {
      widget.style.border.fg = newValue;
      this.pendingChanges.add(`${widgetId}:border`);
    });
    return changed;
  }
  /**
   * Set widget label with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} label - New label
   * @returns {boolean} True if label was updated
   */
  setLabel(widgetId, widget, label) {
    if (!widget || widget.destroyed) return false;
    const changed = this.tracker.trackLabel(widgetId, label, (newLabel) => {
      widget.setLabel(newLabel);
      this.pendingChanges.add(`${widgetId}:label`);
    });
    return changed;
  }
  /**
   * Reset state for a widget (useful after resize events)
   * @param {string} widgetId - Widget identifier
   */
  resetWidget(widgetId) {
    this.tracker.resetWidget(widgetId);
  }
  /**
   * Reset all tracked state
   */
  resetAll() {
    this.tracker.resetAll();
    this.pendingChanges.clear();
  }
  /**
   * Get rendering statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return this.tracker.getStats();
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.tracker.resetStats();
  }
};

// src/performance-monitor.js
init_logger();

// src/memory-pressure.js
init_logger();
init_config();
var { MEMORY_PRESSURE: MEMORY_PRESSURE2 } = config_default;
var PressureLevel = {
  NONE: "none",
  ELEVATED: "elevated",
  WARNING: "warning",
  CRITICAL: "critical",
  EMERGENCY: "emergency"
};
var TrendDirection = {
  STABLE: "stable",
  GROWING: "growing",
  SHRINKING: "shrinking"
};
var MemoryPressureDetector = class {
  constructor() {
    this.samples = [];
    this.maxSamples = MEMORY_PRESSURE2.TREND.SAMPLE_COUNT * 2;
    this.currentLevel = PressureLevel.NONE;
    this.sustainedSince = null;
    this.lastCheck = Date.now();
    this.lastTrend = TrendDirection.STABLE;
    this.lastTrendRate = 0;
    this.rateLimiter = new RateLimiter({
      enabled: true,
      windowMs: 3e5,
      // 5 minutes between pressure alerts
      maxAlerts: 3,
      alwaysAllowCritical: true
    });
    this.stats = {
      peakHeapMB: 0,
      pressureEvents: 0,
      sustainedEvents: 0,
      lastPressureTime: null
    };
    this.onPressureChange = null;
    this.onSustainedPressure = null;
    this.onEmergency = null;
    this.isRunning = false;
  }
  /**
   * Start memory pressure monitoring
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger_default.debug("Memory pressure monitoring started");
  }
  /**
   * Stop memory pressure monitoring
   */
  stop() {
    this.isRunning = false;
    logger_default.debug("Memory pressure monitoring stopped");
  }
  /**
   * Record a memory sample
   * @returns {MemorySample}
   */
  recordSample() {
    const usage = process.memoryUsage();
    const sample = {
      timestamp: Date.now(),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      external: Math.round((usage.external || 0) / 1024 / 1024)
    };
    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    if (sample.heapUsed > this.stats.peakHeapMB) {
      this.stats.peakHeapMB = sample.heapUsed;
    }
    return sample;
  }
  /**
   * Analyze memory trend from samples
   * @returns {{direction: string, rateMBPerMin: number}}
   */
  analyzeTrend() {
    if (this.samples.length < MEMORY_PRESSURE2.TREND.SAMPLE_COUNT) {
      return { direction: TrendDirection.STABLE, rateMBPerMin: 0 };
    }
    const recentSamples = this.samples.slice(-MEMORY_PRESSURE2.TREND.SAMPLE_COUNT);
    const first = recentSamples[0];
    const last = recentSamples[recentSamples.length - 1];
    const durationMinutes = (last.timestamp - first.timestamp) / 6e4;
    if (durationMinutes < 0.5) {
      return { direction: TrendDirection.STABLE, rateMBPerMin: 0 };
    }
    const growthMB = last.heapUsed - first.heapUsed;
    const rateMBPerMin = growthMB / durationMinutes;
    const threshold = MEMORY_PRESSURE2.TREND.GROWTH_THRESHOLD_MB;
    if (growthMB > threshold) {
      return { direction: TrendDirection.GROWING, rateMBPerMin };
    } else if (growthMB < -threshold) {
      return { direction: TrendDirection.SHRINKING, rateMBPerMin };
    }
    return { direction: TrendDirection.STABLE, rateMBPerMin };
  }
  /**
   * Determine pressure level from heap usage
   * @param {number} heapUsedMB
   * @returns {string}
   */
  getPressureLevel(heapUsedMB) {
    const { THRESHOLDS } = MEMORY_PRESSURE2;
    if (heapUsedMB >= THRESHOLDS.EMERGENCY_MB) return PressureLevel.EMERGENCY;
    if (heapUsedMB >= THRESHOLDS.CRITICAL_MB) return PressureLevel.CRITICAL;
    if (heapUsedMB >= THRESHOLDS.WARNING_MB) return PressureLevel.WARNING;
    if (heapUsedMB >= THRESHOLDS.WARNING_MB * 0.75) return PressureLevel.ELEVATED;
    return PressureLevel.NONE;
  }
  /**
   * Check for sustained pressure
   * @param {string} level - Current pressure level
   * @returns {{sustained: boolean, durationMs: number}}
   */
  checkSustainedPressure(level) {
    const isElevated = level !== PressureLevel.NONE && level !== PressureLevel.ELEVATED;
    if (!isElevated) {
      this.sustainedSince = null;
      return { sustained: false, durationMs: 0 };
    }
    if (!this.sustainedSince) {
      this.sustainedSince = Date.now();
    }
    const durationMs = Date.now() - this.sustainedSince;
    const sustained = durationMs >= MEMORY_PRESSURE2.SUSTAINED.DURATION_MS;
    return { sustained, durationMs };
  }
  /**
   * Get recommendations based on pressure state
   * @param {PressureState} state
   * @returns {string[]}
   */
  getRecommendations(state) {
    const recommendations = [];
    if (state.level === PressureLevel.EMERGENCY) {
      recommendations.push("Consider restarting the dashboard immediately");
      recommendations.push("Check for memory leaks in custom widgets/plugins");
    } else if (state.level === PressureLevel.CRITICAL) {
      recommendations.push("Enable performance metrics to identify resource-heavy widgets");
      recommendations.push("Consider disabling unused widgets");
      if (state.trend === TrendDirection.GROWING) {
        recommendations.push(`Memory growing at ${state.trendRateMB.toFixed(1)}MB/min - possible leak detected`);
      }
    } else if (state.level === PressureLevel.WARNING) {
      if (state.trend === TrendDirection.GROWING) {
        recommendations.push("Memory trend indicates potential leak - monitor closely");
      }
      recommendations.push("Dashboard memory is elevated but stable");
    }
    if (this.samples.length > MEMORY_PRESSURE2.TREND.SAMPLE_COUNT) {
      const ageMs = Date.now() - this.samples[0].timestamp;
      const ageHours = ageMs / (1e3 * 60 * 60);
      if (ageHours > 24) {
        recommendations.push(`Dashboard has been running for ${ageHours.toFixed(1)} hours - consider periodic restarts`);
      }
    }
    return recommendations;
  }
  /**
   * Perform memory pressure check
   * @returns {PressureState}
   */
  check() {
    if (!this.isRunning) {
      this.start();
    }
    const sample = this.recordSample();
    const trend = this.analyzeTrend();
    const level = this.getPressureLevel(sample.heapUsed);
    const { sustained, durationMs } = this.checkSustainedPressure(level);
    const usagePercent = sample.heapTotal > 0 ? Math.round(sample.heapUsed / sample.heapTotal * 100) : 0;
    const state = {
      level,
      heapUsedMB: sample.heapUsed,
      heapTotalMB: sample.heapTotal,
      usagePercent,
      trend: trend.direction,
      trendRateMB: trend.rateMBPerMin,
      sustained,
      sustainedDurationMs: durationMs,
      recommendations: []
    };
    state.recommendations = this.getRecommendations(state);
    if (level !== this.currentLevel) {
      this.handleLevelChange(this.currentLevel, level, state);
      this.currentLevel = level;
    }
    if (sustained && durationMs >= MEMORY_PRESSURE2.SUSTAINED.DURATION_MS) {
      this.handleSustainedPressure(state);
    }
    this.lastTrend = trend.direction;
    this.lastTrendRate = trend.rateMBPerMin;
    this.lastCheck = Date.now();
    return state;
  }
  /**
   * Handle pressure level change
   * @param {string} oldLevel
   * @param {string} newLevel
   * @param {PressureState} state
   */
  handleLevelChange(oldLevel, newLevel, state) {
    const escalation = [
      PressureLevel.NONE,
      PressureLevel.ELEVATED,
      PressureLevel.WARNING,
      PressureLevel.CRITICAL,
      PressureLevel.EMERGENCY
    ];
    const oldIndex = escalation.indexOf(oldLevel);
    const newIndex = escalation.indexOf(newLevel);
    if (newIndex > oldIndex) {
      logger_default.warn(`Memory pressure escalating: ${oldLevel} -> ${newLevel} (${state.heapUsedMB}MB)`);
      this.stats.pressureEvents++;
      this.stats.lastPressureTime = Date.now();
      if (newLevel === PressureLevel.EMERGENCY && this.onEmergency) {
        this.onEmergency(state);
      }
    } else {
      logger_default.info(`Memory pressure de-escalating: ${oldLevel} -> ${newLevel} (${state.heapUsedMB}MB)`);
    }
    if (this.onPressureChange) {
      this.onPressureChange(oldLevel, newLevel, state);
    }
  }
  /**
   * Handle sustained pressure
   * @param {PressureState} state
   */
  handleSustainedPressure(state) {
    const rateLimitResult = this.rateLimiter.checkAndRecord("sustained-pressure", state.level);
    if (!rateLimitResult.allowed) {
      return;
    }
    logger_default.warn(`Sustained memory pressure detected: ${state.level} for ${(state.sustainedDurationMs / 1e3).toFixed(0)}s`);
    this.stats.sustainedEvents++;
    if (this.onSustainedPressure) {
      this.onSustainedPressure(state);
    }
    if (MEMORY_PRESSURE2.ACTIONS.REQUEST_GC && global.gc) {
      logger_default.debug("Requesting garbage collection");
      try {
        global.gc();
      } catch (error) {
        logger_default.debug("GC request failed:", error.message);
      }
    }
  }
  /**
   * Get memory pressure status for display
   * @returns {Object}
   */
  getStatus() {
    const latest = this.samples[this.samples.length - 1];
    return {
      isRunning: this.isRunning,
      currentLevel: this.currentLevel,
      samples: this.samples.length,
      peakHeapMB: this.stats.peakHeapMB,
      pressureEvents: this.stats.pressureEvents,
      sustainedEvents: this.stats.sustainedEvents,
      lastPressureTime: this.stats.lastPressureTime,
      latest: latest || null,
      trend: {
        direction: this.lastTrend,
        rateMBPerMin: this.lastTrendRate
      },
      thresholds: MEMORY_PRESSURE2.THRESHOLDS
    };
  }
  /**
   * Get formatted status string for display
   * @returns {string}
   */
  getStatusString() {
    const status = this.getStatus();
    const latest = status.latest;
    if (!latest) {
      return "Memory pressure monitoring inactive";
    }
    const colors = {
      [PressureLevel.NONE]: "green-fg",
      [PressureLevel.ELEVATED]: "cyan-fg",
      [PressureLevel.WARNING]: "yellow-fg",
      [PressureLevel.CRITICAL]: "red-fg",
      [PressureLevel.EMERGENCY]: "red-fg"
    };
    const color = colors[this.currentLevel] || "white-fg";
    const trendIcon = this.lastTrend === TrendDirection.GROWING ? "\u2191" : this.lastTrend === TrendDirection.SHRINKING ? "\u2193" : "\u2192";
    return `{${color}}MEM:${latest.heapUsed}MB ${trendIcon}{/${color}}`;
  }
  /**
   * Check if memory pressure is currently elevated
   * @returns {boolean}
   */
  isElevated() {
    return this.currentLevel === PressureLevel.WARNING || this.currentLevel === PressureLevel.CRITICAL || this.currentLevel === PressureLevel.EMERGENCY;
  }
  /**
   * Check if memory pressure is critical
   * @returns {boolean}
   */
  isCritical() {
    return this.currentLevel === PressureLevel.CRITICAL || this.currentLevel === PressureLevel.EMERGENCY;
  }
  /**
   * Reset all statistics and samples
   */
  reset() {
    this.samples = [];
    this.currentLevel = PressureLevel.NONE;
    this.sustainedSince = null;
    this.lastTrend = TrendDirection.STABLE;
    this.lastTrendRate = 0;
    this.stats = {
      peakHeapMB: 0,
      pressureEvents: 0,
      sustainedEvents: 0,
      lastPressureTime: null
    };
    this.rateLimiter.reset();
    logger_default.debug("Memory pressure detector reset");
  }
  /**
   * Get recommendations for current state
   * @returns {string[]}
   */
  getCurrentRecommendations() {
    if (this.samples.length === 0) {
      return [];
    }
    const state = {
      level: this.currentLevel,
      trend: this.lastTrend,
      trendRateMB: this.lastTrendRate,
      heapUsedMB: this.samples[this.samples.length - 1]?.heapUsed || 0
    };
    return this.getRecommendations(state);
  }
};
var memory_pressure_default = new MemoryPressureDetector();

// src/performance-monitor.js
var workerPoolRef = null;
function setWorkerPool(pool) {
  workerPoolRef = pool;
}
function getWorkerPoolMetrics() {
  if (!workerPoolRef) {
    return null;
  }
  try {
    return workerPoolRef.getStatus();
  } catch (error) {
    logger_default.debug("Failed to get worker pool metrics:", error.message);
    return null;
  }
}
var PerformanceMonitor = class {
  constructor() {
    this.history = [];
    this.maxHistory = 60;
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    this.isTracking = false;
    this.memoryPressure = memory_pressure_default;
    this.enableMemoryPressure = true;
    this.metrics = {
      avgRefreshRate: 0,
      avgMemoryUsed: 0,
      peakMemoryUsed: 0,
      avgCpuPercent: 0,
      avgEventLoopLag: 0
    };
  }
  /**
   * Start performance tracking
   */
  start() {
    this.isTracking = true;
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    memory_pressure_default.start();
    logger_default.debug("Performance monitoring started");
  }
  /**
   * Stop performance tracking
   */
  stop() {
    this.isTracking = false;
    memory_pressure_default.stop();
    logger_default.debug("Performance monitoring stopped");
  }
  /**
   * Record a performance snapshot
   * @param {number} refreshRate - Current refresh interval in ms
   * @returns {PerformanceSnapshot}
   */
  record(refreshRate = 2e3) {
    if (!this.isTracking) {
      return null;
    }
    const now = Date.now();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCPUUsage);
    const elapsedMs = now - this.lastCheck;
    const cpuPercent = elapsedMs > 0 ? Math.min(100, (cpuUsage.user + cpuUsage.system) / 1e3 / elapsedMs * 100) : 0;
    const eventLoopLag = Math.max(0, now - this.lastCheck - refreshRate);
    const snapshot = {
      timestamp: now,
      refreshRate,
      memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      memoryPercent: memoryUsage.heapTotal > 0 ? Math.round(memoryUsage.heapUsed / memoryUsage.heapTotal * 100) : 0,
      cpuPercent: Math.round(cpuPercent * 10) / 10,
      eventLoopLag: Math.round(eventLoopLag),
      uptime: Math.floor(process.uptime())
    };
    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this._updateMetrics();
    this.lastCheck = now;
    this.lastCPUUsage = process.cpuUsage();
    return snapshot;
  }
  /**
   * Update cached aggregate metrics
   * @private
   */
  _updateMetrics() {
    if (this.history.length === 0) {
      return;
    }
    const count = this.history.length;
    const sum = (arr, key) => arr.reduce((a, b) => a + (b[key] || 0), 0);
    this.metrics = {
      avgRefreshRate: Math.round(sum(this.history, "refreshRate") / count),
      avgMemoryUsed: Math.round(sum(this.history, "memoryUsed") / count),
      peakMemoryUsed: Math.max(...this.history.map((h) => h.memoryUsed)),
      avgCpuPercent: Math.round(sum(this.history, "cpuPercent") / count * 10) / 10,
      avgEventLoopLag: Math.round(sum(this.history, "eventLoopLag") / count)
    };
  }
  /**
   * Get current metrics summary
   * @returns {Object}
   */
  getMetrics() {
    const latest = this.history[this.history.length - 1] || null;
    return {
      current: latest,
      history: [...this.history],
      aggregates: { ...this.metrics },
      isTracking: this.isTracking
    };
  }
  /**
   * Get formatted status string for display
   * @param {boolean} detailed - Include detailed metrics
   * @returns {string}
   */
  getStatusString(detailed = false) {
    const latest = this.history[this.history.length - 1];
    if (!latest) {
      return "Performance monitoring inactive";
    }
    const memoryColor = latest.memoryPercent >= 80 ? "red-fg" : latest.memoryPercent >= 60 ? "yellow-fg" : "green-fg";
    const cpuColor = latest.cpuPercent >= 80 ? "red-fg" : latest.cpuPercent >= 50 ? "yellow-fg" : "green-fg";
    let status = `{${memoryColor}}MEM: ${latest.memoryUsed}MB (${latest.memoryPercent}%){/${memoryColor}}`;
    if (this.enableMemoryPressure) {
      const pressureStatus = memory_pressure_default.getStatusString();
      if (memory_pressure_default.isElevated()) {
        status += ` | ${pressureStatus}`;
      }
    }
    status += ` | {${cpuColor}}CPU: ${latest.cpuPercent}%{/${cpuColor}}`;
    status += ` | Refresh: ${latest.refreshRate}ms`;
    if (detailed && this.metrics.avgEventLoopLag > 0) {
      const lagColor = this.metrics.avgEventLoopLag > 100 ? "red-fg" : this.metrics.avgEventLoopLag > 50 ? "yellow-fg" : "gray-fg";
      status += ` | {${lagColor}}Lag: ${this.metrics.avgEventLoopLag}ms{/${lagColor}}`;
    }
    const workerMetrics = getWorkerPoolMetrics();
    if (workerMetrics) {
      const workerColor = workerMetrics.pendingTasks > 0 ? "yellow-fg" : "green-fg";
      const busyCount = workerMetrics.busyWorkers || 0;
      const totalCount = workerMetrics.totalWorkers || 0;
      const pendingCount = workerMetrics.pendingTasks || 0;
      status += ` | {${workerColor}}Workers: ${busyCount}/${totalCount}{/${workerColor}}`;
      if (pendingCount > 0) {
        status += ` ({yellow-fg}${pendingCount} pending{/${yellow - fg}})`;
      }
    }
    if (detailed && this.enableMemoryPressure) {
      const pressureStatus = memory_pressure_default.getStatus();
      if (pressureStatus.currentLevel !== "none") {
        const pressureColor = pressureStatus.currentLevel === "emergency" ? "red-fg" : pressureStatus.currentLevel === "critical" ? "red-fg" : pressureStatus.currentLevel === "warning" ? "yellow-fg" : "cyan-fg";
        status += ` | {${pressureColor}}Pressure: ${pressureStatus.currentLevel}{/${pressureColor}}`;
        if (pressureStatus.trend?.direction === "growing") {
          status += ` {yellow-fg}\u2191${pressureStatus.trend.rateMBPerMin.toFixed(0)}MB/min{/}`;
        }
      }
    }
    return status;
  }
  /**
   * Get memory usage sparkline data
   * @param {number} points - Number of data points
   * @returns {number[]}
   */
  getMemorySparkline(points = 30) {
    const data = this.history.slice(-points).map((h) => h.memoryUsed);
    return data.length > 0 ? data : [0];
  }
  /**
   * Get CPU usage sparkline data
   * @param {number} points - Number of data points
   * @returns {number[]}
   */
  getCpuSparkline(points = 30) {
    const data = this.history.slice(-points).map((h) => h.cpuPercent);
    return data.length > 0 ? data : [0];
  }
  /**
   * Check if performance is degraded
   * @returns {{degraded: boolean, reasons: string[]}}
   */
  checkHealth() {
    const reasons = [];
    const latest = this.history[this.history.length - 1];
    if (!latest) {
      return { degraded: false, reasons: [] };
    }
    if (latest.memoryPercent >= 85) {
      reasons.push(`High memory usage: ${latest.memoryPercent}%`);
    }
    if (latest.cpuPercent >= 80) {
      reasons.push(`High CPU usage: ${latest.cpuPercent}%`);
    }
    if (this.metrics.avgEventLoopLag > 100) {
      reasons.push(`Event loop lag: ${this.metrics.avgEventLoopLag}ms`);
    }
    const pressureState = memory_pressure_default.check();
    if (pressureState.level !== "none" && pressureState.level !== "elevated") {
      reasons.push(`Memory pressure: ${pressureState.level} (${pressureState.heapUsedMB}MB)`);
    }
    return {
      degraded: reasons.length > 0,
      reasons
    };
  }
  /**
   * Check memory pressure state
   * @returns {import('./memory-pressure.js').PressureState}
   */
  checkMemoryPressure() {
    return memory_pressure_default.check();
  }
  /**
   * Reset all metrics and history
   */
  reset() {
    this.history = [];
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    this.metrics = {
      avgRefreshRate: 0,
      avgMemoryUsed: 0,
      peakMemoryUsed: 0,
      avgCpuPercent: 0,
      avgEventLoopLag: 0
    };
    memory_pressure_default.reset();
    logger_default.debug("Performance metrics reset");
  }
};
var performance_monitor_default = new PerformanceMonitor();

// index.js
init_worker_pool();

// src/web-server.js
var import_http2 = __toESM(require("http"), 1);
var import_url10 = __toESM(require("url"), 1);
init_logger();
init_config();
init_security();
var { WEB: WEB2, DASHBOARD_VERSION: DASHBOARD_VERSION3 } = config_default;
var WebRateLimiter = class {
  constructor(options = {}) {
    this.enabled = options.enabled ?? WEB2.RATE_LIMIT.ENABLED;
    this.windowMs = options.windowMs ?? WEB2.RATE_LIMIT.WINDOW_MS;
    this.maxRequests = options.maxRequests ?? WEB2.RATE_LIMIT.MAX_REQUESTS;
    this.trustProxy = options.trustProxy ?? WEB2.RATE_LIMIT.TRUST_PROXY;
    this.requests = /* @__PURE__ */ new Map();
    this.blocked = /* @__PURE__ */ new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }
  /**
   * Get client IP from request
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {string} Client IP address
   */
  getClientIp(req) {
    if (this.trustProxy) {
      const forwarded = req.headers["x-forwarded-for"];
      if (forwarded) {
        return forwarded.split(",")[0].trim();
      }
      const realIp = req.headers["x-real-ip"];
      if (realIp) {
        return realIp;
      }
    }
    return req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";
  }
  /**
   * Check if request is allowed or rate limited
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {object} Result with allowed boolean and retryAfter
   */
  check(req) {
    if (!this.enabled) {
      return { allowed: true, remaining: this.maxRequests };
    }
    const ip = this.getClientIp(req);
    const now = Date.now();
    const unblockTime = this.blocked.get(ip);
    if (unblockTime && now < unblockTime) {
      return {
        allowed: false,
        retryAfter: Math.ceil((unblockTime - now) / 1e3),
        ip
      };
    }
    if (unblockTime && now >= unblockTime) {
      this.blocked.delete(ip);
    }
    let history = this.requests.get(ip);
    if (!history) {
      history = [];
      this.requests.set(ip, history);
    }
    const windowStart = now - this.windowMs;
    const validRequests = history.filter((ts) => ts > windowStart);
    this.requests.set(ip, validRequests);
    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = validRequests[0];
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1e3);
      this.blocked.set(ip, now + this.windowMs);
      logger_default.warn(`[RATE LIMIT] IP ${ip} blocked - exceeded ${this.maxRequests} requests in ${this.windowMs}ms`);
      return {
        allowed: false,
        retryAfter: Math.max(1, retryAfter),
        ip
      };
    }
    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      ip
    };
  }
  /**
   * Record a request for an IP
   * @param {http.IncomingMessage} req - HTTP request
   */
  record(req) {
    if (!this.enabled) return;
    const ip = this.getClientIp(req);
    const history = this.requests.get(ip) || [];
    history.push(Date.now());
    this.requests.set(ip, history);
  }
  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [ip, history] of this.requests.entries()) {
      const validRequests = history.filter((ts) => ts > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }
    for (const [ip, unblockTime] of this.blocked.entries()) {
      if (now >= unblockTime) {
        this.blocked.delete(ip);
      }
    }
  }
  /**
   * Get rate limit status for an IP
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {object} Status with count, limit, remaining, resetTime
   */
  getStatus(req) {
    const ip = this.getClientIp(req);
    if (!this.enabled) {
      return {
        enabled: false,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        current: 0,
        resetTime: null,
        ip
      };
    }
    const history = this.requests.get(ip) || [];
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const validRequests = history.filter((ts) => ts > windowStart);
    let resetTime = null;
    if (validRequests.length > 0) {
      const oldestRequest = Math.min(...validRequests);
      resetTime = new Date(oldestRequest + this.windowMs).toISOString();
    }
    return {
      enabled: true,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      current: validRequests.length,
      resetTime,
      ip
    };
  }
  /**
   * Stop the cleanup interval
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
};
var CorsManager = class {
  constructor(options = {}) {
    this.allowedOrigins = options.allowedOrigins ?? WEB2.CORS.ALLOWED_ORIGINS;
    this.allowedMethods = options.allowedMethods ?? WEB2.CORS.ALLOWED_METHODS;
    this.allowedHeaders = options.allowedHeaders ?? WEB2.CORS.ALLOWED_HEADERS;
    this.credentials = options.credentials ?? WEB2.CORS.CREDENTIALS;
    this.maxAge = options.maxAge ?? WEB2.CORS.MAX_AGE;
  }
  /**
   * Check if an origin is allowed
   * @param {string} origin - Request origin
   * @returns {boolean} True if allowed
   */
  isOriginAllowed(origin) {
    if (this.allowedOrigins === "*") {
      return true;
    }
    if (!origin) {
      return true;
    }
    if (Array.isArray(this.allowedOrigins)) {
      return this.allowedOrigins.some((allowed) => {
        if (allowed.includes("*")) {
          const pattern = allowed.replace(/\*/g, ".*");
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowed === origin;
      });
    }
    return this.allowedOrigins === origin;
  }
  /**
   * Get CORS headers for a request
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {Object} CORS headers
   */
  getHeaders(req) {
    const origin = req.headers.origin;
    const headers = {
      "Access-Control-Allow-Methods": this.allowedMethods.join(", "),
      "Access-Control-Allow-Headers": this.allowedHeaders.join(", "),
      "Access-Control-Max-Age": this.maxAge.toString(),
      "Content-Type": "application/json"
    };
    if (this.allowedOrigins === "*") {
      if (this.credentials && origin) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers["Access-Control-Allow-Credentials"] = "true";
      } else {
        headers["Access-Control-Allow-Origin"] = "*";
      }
    } else if (this.isOriginAllowed(origin)) {
      headers["Access-Control-Allow-Origin"] = origin || "*";
      if (this.credentials) {
        headers["Access-Control-Allow-Credentials"] = "true";
      }
    }
    return headers;
  }
  /**
   * Check if credentials should be allowed
   * @returns {boolean} True if credentials are allowed
   */
  allowsCredentials() {
    return this.credentials;
  }
};
function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, { ...headers, "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}
function sendError(res, statusCode, message, headers = {}, extra = {}) {
  sendJson(res, statusCode, { error: message, status: statusCode, ...extra }, headers);
}
var WebServer = class {
  constructor(options = {}) {
    this.port = options.port || WEB2.DEFAULT_PORT;
    this.host = options.host || WEB2.HOST;
    this.server = null;
    this.dataProvider = null;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.rateLimiter = new WebRateLimiter({
      enabled: options.rateLimit?.enabled ?? WEB2.RATE_LIMIT.ENABLED,
      windowMs: options.rateLimit?.windowMs ?? WEB2.RATE_LIMIT.WINDOW_MS,
      maxRequests: options.rateLimit?.maxRequests ?? WEB2.RATE_LIMIT.MAX_REQUESTS,
      trustProxy: options.rateLimit?.trustProxy ?? WEB2.RATE_LIMIT.TRUST_PROXY
    });
    this.corsManager = new CorsManager({
      allowedOrigins: options.corsOrigins ?? WEB2.CORS.ALLOWED_ORIGINS,
      allowedMethods: options.corsMethods ?? WEB2.CORS.ALLOWED_METHODS,
      allowedHeaders: options.corsHeaders ?? WEB2.CORS.ALLOWED_HEADERS,
      credentials: options.corsCredentials ?? WEB2.CORS.CREDENTIALS,
      maxAge: options.corsMaxAge ?? WEB2.CORS.MAX_AGE
    });
    this.apiKeyAuth = new ApiKeyAuth({
      enabled: options.auth?.enabled ?? WEB2.AUTH.ENABLED,
      headerName: options.auth?.headerName ?? WEB2.AUTH.HEADER_NAME,
      scheme: options.auth?.scheme ?? WEB2.AUTH.SCHEME,
      keyPrefix: options.auth?.keyPrefix ?? WEB2.AUTH.KEY_PREFIX,
      keyLength: options.auth?.keyLength ?? WEB2.AUTH.KEY_LENGTH,
      maxKeys: options.auth?.maxKeys ?? WEB2.AUTH.MAX_KEYS
    });
    this.generateApiKey = this.generateApiKey.bind(this);
    this.revokeApiKey = this.revokeApiKey.bind(this);
    this.listApiKeys = this.listApiKeys.bind(this);
  }
  /**
   * Set the data provider function that will supply dashboard data
   * @param {Function} provider - Function that returns dashboard data
   */
  setDataProvider(provider) {
    this.dataProvider = provider;
  }
  /**
   * Get health status
   * @returns {Object} Health status
   */
  getHealth() {
    const uptime = Date.now() - this.startTime;
    return {
      status: "healthy",
      version: DASHBOARD_VERSION3,
      uptime,
      uptimeHuman: this.formatUptime(uptime),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Format uptime in human-readable format
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted uptime
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
  /**
   * Send rate limit response
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} rateLimitResult - Rate limit check result
   */
  sendRateLimitResponse(res, rateLimitResult) {
    const headers = this.corsManager.getHeaders({ headers: {} });
    headers["Retry-After"] = rateLimitResult.retryAfter.toString();
    headers["X-RateLimit-Limit"] = this.rateLimiter.maxRequests.toString();
    headers["X-RateLimit-Remaining"] = "0";
    headers["X-RateLimit-Reset"] = (Date.now() + rateLimitResult.retryAfter * 1e3).toString();
    sendError(res, 429, "Too many requests", headers, {
      retryAfter: rateLimitResult.retryAfter
    });
  }
  /**
   * Send CORS-related error (origin not allowed)
   * @param {http.ServerResponse} res - HTTP response
   */
  sendCorsError(res) {
    sendError(res, 403, "Origin not allowed", {
      "Content-Type": "application/json"
    });
  }
  /**
   * Add rate limit headers to response
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} rateLimitStatus - Rate limit status
   */
  addRateLimitHeaders(res, rateLimitStatus) {
    res.setHeader("X-RateLimit-Limit", rateLimitStatus.limit.toString());
    res.setHeader("X-RateLimit-Remaining", rateLimitStatus.remaining.toString());
    if (rateLimitStatus.resetTime) {
      res.setHeader("X-RateLimit-Reset", new Date(rateLimitStatus.resetTime).getTime().toString());
    }
  }
  /**
   * Send authentication error response
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} authResult - Authentication result from ApiKeyAuth
   * @param {Object} headers - Additional headers
   */
  sendAuthError(res, authResult, headers = {}) {
    const errorHeaders = { ...headers };
    if (authResult.retryAfter) {
      errorHeaders["Retry-After"] = authResult.retryAfter.toString();
    }
    const authScheme = this.apiKeyAuth.scheme || "Bearer";
    errorHeaders["WWW-Authenticate"] = `${authScheme} realm="Claw Dashboard API"`;
    const statusCode = authResult.code === "AUTH_BLOCKED" ? 429 : 401;
    const extra = authResult.retryAfter ? { retryAfter: authResult.retryAfter } : {};
    sendError(res, statusCode, authResult.error, errorHeaders, { code: authResult.code, ...extra });
  }
  /**
   * Generate a new API key
   * @param {string} name - Human-readable name for the key
   * @returns {Object} Key data including the full key (only shown once)
   */
  generateApiKey(name) {
    return this.apiKeyAuth.generateKey(name);
  }
  /**
   * Revoke an API key
   * @param {string} keyId - The key ID to revoke
   * @returns {boolean} True if key was found and revoked
   */
  revokeApiKey(keyId) {
    const revoked = this.apiKeyAuth.revokeKey(keyId);
    if (revoked) {
      logger_default.info(`[AUTH] Revoked API key: ${keyId}`);
    }
    return revoked;
  }
  /**
   * List all active API keys
   * @returns {Array} List of key metadata (without actual keys)
   */
  listApiKeys() {
    return this.apiKeyAuth.listKeys();
  }
  /**
   * Check if authentication is enabled
   * @returns {boolean} True if authentication is enabled
   */
  isAuthEnabled() {
    return this.apiKeyAuth.isEnabled();
  }
  /**
   * Enable authentication
   */
  enableAuth() {
    this.apiKeyAuth.enable();
    logger_default.info("[AUTH] Authentication enabled");
  }
  /**
   * Disable authentication
   */
  disableAuth() {
    this.apiKeyAuth.disable();
    logger_default.info("[AUTH] Authentication disabled");
  }
  /**
   * Handle incoming HTTP requests
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   */
  async handleRequest(req, res) {
    this.requestCount++;
    const parsedUrl = import_url10.default.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const corsHeaders = this.corsManager.getHeaders(req);
    const origin = req.headers.origin;
    if (origin && !this.corsManager.isOriginAllowed(origin)) {
      this.errorCount++;
      logger_default.warn(`[CORS] Rejected request from disallowed origin: ${origin}`);
      this.sendCorsError(res);
      return;
    }
    if (req.method === "OPTIONS") {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }
    if (pathname !== WEB2.ENDPOINTS.HEALTH) {
      const rateLimitResult = this.rateLimiter.check(req);
      if (!rateLimitResult.allowed) {
        this.errorCount++;
        this.sendRateLimitResponse(res, rateLimitResult);
        return;
      }
      this.rateLimiter.record(req);
      const rateLimitStatus = this.rateLimiter.getStatus(req);
      this.addRateLimitHeaders(res, rateLimitStatus);
    }
    if (pathname !== WEB2.ENDPOINTS.HEALTH) {
      const clientIp = this.rateLimiter.getClientIp(req);
      const authResult = this.apiKeyAuth.authenticate(req.headers, clientIp);
      if (!authResult.authenticated) {
        this.errorCount++;
        logger_default.warn(`[AUTH] Failed authentication from ${clientIp}: ${authResult.error}`);
        this.sendAuthError(res, authResult, corsHeaders);
        return;
      }
      if (authResult.keyId) {
        res.setHeader("X-Auth-Key-Id", authResult.keyId);
      }
    }
    try {
      switch (pathname) {
        case WEB2.ENDPOINTS.HEALTH:
          this.handleHealth(req, res, corsHeaders);
          break;
        case WEB2.ENDPOINTS.METRICS:
          await this.handleMetrics(req, res, corsHeaders);
          break;
        case WEB2.ENDPOINTS.SESSIONS:
          await this.handleSessions(req, res, corsHeaders);
          break;
        case WEB2.ENDPOINTS.AGENTS:
          await this.handleAgents(req, res, corsHeaders);
          break;
        case WEB2.ENDPOINTS.LOGS:
          await this.handleLogs(req, res, corsHeaders);
          break;
        case WEB2.ENDPOINTS.STATUS:
          await this.handleStatus(req, res, corsHeaders);
          break;
        default:
          sendError(res, 404, "Not found", corsHeaders);
      }
    } catch (err) {
      this.errorCount++;
      logger_default.error(`Web server error: ${err.message}`);
      sendError(res, 500, "Internal server error", corsHeaders);
    }
  }
  /**
   * Handle health check endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  handleHealth(req, res, corsHeaders) {
    const health = this.getHealth();
    const rateLimitStatus = this.rateLimiter.getStatus(req);
    sendJson(res, 200, {
      ...health,
      rateLimit: {
        enabled: rateLimitStatus.enabled,
        limit: rateLimitStatus.limit
      },
      auth: {
        enabled: this.apiKeyAuth.isEnabled(),
        scheme: this.apiKeyAuth.scheme,
        keyCount: this.apiKeyAuth.getKeyCount()
      }
    }, corsHeaders);
  }
  /**
   * Handle metrics endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleMetrics(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available", corsHeaders);
      return;
    }
    try {
      const data = await this.dataProvider("metrics");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metrics: data || {}
      }, corsHeaders);
    } catch (err) {
      logger_default.error(`Metrics error: ${err.message}`);
      sendError(res, 500, "Failed to fetch metrics", corsHeaders);
    }
  }
  /**
   * Handle sessions endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleSessions(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available", corsHeaders);
      return;
    }
    try {
      const data = await this.dataProvider("sessions");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        sessions: data || [],
        count: data?.length || 0
      }, corsHeaders);
    } catch (err) {
      logger_default.error(`Sessions error: ${err.message}`);
      sendError(res, 500, "Failed to fetch sessions", corsHeaders);
    }
  }
  /**
   * Handle agents endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleAgents(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available", corsHeaders);
      return;
    }
    try {
      const data = await this.dataProvider("agents");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        agents: data || [],
        count: data?.length || 0
      }, corsHeaders);
    } catch (err) {
      logger_default.error(`Agents error: ${err.message}`);
      sendError(res, 500, "Failed to fetch agents", corsHeaders);
    }
  }
  /**
   * Handle logs endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleLogs(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available", corsHeaders);
      return;
    }
    try {
      const data = await this.dataProvider("logs");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        logs: data || [],
        count: data?.length || 0
      }, corsHeaders);
    } catch (err) {
      logger_default.error(`Logs error: ${err.message}`);
      sendError(res, 500, "Failed to fetch logs", corsHeaders);
    }
  }
  /**
   * Handle full status endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleStatus(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available", corsHeaders);
      return;
    }
    try {
      const [metrics, sessions, agents, logs] = await Promise.all([
        this.dataProvider("metrics"),
        this.dataProvider("sessions"),
        this.dataProvider("agents"),
        this.dataProvider("logs")
      ]);
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        health: this.getHealth(),
        metrics: metrics || {},
        sessions: sessions || [],
        agents: agents || [],
        logs: logs || [],
        summary: {
          sessionCount: sessions?.length || 0,
          agentCount: agents?.length || 0,
          logCount: logs?.length || 0
        }
      }, corsHeaders);
    } catch (err) {
      logger_default.error(`Status error: ${err.message}`);
      sendError(res, 500, "Failed to fetch status", corsHeaders);
    }
  }
  /**
   * Start the web server
   * @returns {Promise<WebServer>} This instance for chaining
   */
  async start() {
    return new Promise((resolve9, reject) => {
      this.server = import_http2.default.createServer((req, res) => this.handleRequest(req, res));
      this.server.on("error", (err) => {
        logger_default.error(`Web server error: ${err.message}`);
        reject(err);
      });
      this.server.listen(this.port, this.host, () => {
        const rateLimitStatus = this.rateLimiter.enabled ? "enabled" : "disabled";
        const corsStatus = this.corsManager.allowedOrigins === "*" ? "allow-all" : "restricted";
        const authStatus = this.apiKeyAuth.isEnabled() ? "enabled" : "disabled";
        logger_default.info(`Web server listening on http://${this.host}:${this.port} (rate-limit: ${rateLimitStatus}, cors: ${corsStatus}, auth: ${authStatus})`);
        resolve9(this);
      });
    });
  }
  /**
   * Stop the web server
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.server) {
      return;
    }
    this.rateLimiter.stop();
    return new Promise((resolve9) => {
      this.server.close(() => {
        logger_default.info("Web server stopped");
        resolve9();
      });
    });
  }
  /**
   * Get server info
   * @returns {Object} Server information
   */
  getInfo() {
    const rateLimitStatus = this.rateLimiter.getStatus({ headers: {}, socket: {} });
    return {
      host: this.host,
      port: this.port,
      url: `http://${this.host}:${this.port}`,
      endpoints: {
        health: `${WEB2.ENDPOINTS.HEALTH}`,
        metrics: `${WEB2.ENDPOINTS.METRICS}`,
        sessions: `${WEB2.ENDPOINTS.SESSIONS}`,
        agents: `${WEB2.ENDPOINTS.AGENTS}`,
        logs: `${WEB2.ENDPOINTS.LOGS}`,
        status: `${WEB2.ENDPOINTS.STATUS}`
      },
      uptime: this.formatUptime(Date.now() - this.startTime),
      requests: this.requestCount,
      errors: this.errorCount,
      security: {
        rateLimit: {
          enabled: this.rateLimiter.enabled,
          windowMs: this.rateLimiter.windowMs,
          maxRequests: this.rateLimiter.maxRequests
        },
        cors: {
          mode: this.corsManager.allowedOrigins === "*" ? "allow-all" : "restricted",
          credentials: this.corsManager.credentials
        },
        auth: {
          enabled: this.apiKeyAuth.isEnabled(),
          scheme: this.apiKeyAuth.scheme,
          headerName: this.apiKeyAuth.headerName,
          activeKeys: this.apiKeyAuth.getKeyCount()
        }
      }
    };
  }
};
var web_server_default = WebServer;

// src/loading-states.js
init_logger();
var SPINNER_FRAMES2 = {
  dots: {
    frames: ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"],
    interval: 80
  },
  line: {
    frames: ["-", "\\", "|", "/"],
    interval: 100
  },
  pulse: {
    frames: ["\u25CB", "\u25D4", "\u25D1", "\u25D5", "\u25CF", "\u25D5", "\u25D1", "\u25D4"],
    interval: 100
  },
  blocks: {
    frames: ["\u2581", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588", "\u2587", "\u2586", "\u2585", "\u2584", "\u2583"],
    interval: 80
  },
  arrows: {
    frames: ["\u2190", "\u2196", "\u2191", "\u2197", "\u2192", "\u2198", "\u2193", "\u2199"],
    interval: 100
  },
  bouncing: {
    frames: ["( \u25CF    )", "(  \u25CF   )", "(   \u25CF  )", "(    \u25CF )", "(     \u25CF)", "(    \u25CF )", "(   \u25CF  )", "(  \u25CF   )", "( \u25CF    )", "(\u25CF     )"],
    interval: 80
  }
};
var PROGRESS_STYLES = {
  blocks: ["\u2591", "\u2592", "\u2593", "\u2588"],
  bars: [" ", "\u258F", "\u258E", "\u258D", "\u258C", "\u258B", "\u258A", "\u2589", "\u2588"],
  ascii: [" ", "=", "=", "=", "=", "=", "=", "=", "#"],
  dots: [" ", "\xB7", "\u2219", "\u25CF"],
  minimal: ["\u25CB", "\u25D0", "\u25D1", "\u25CF"]
};
var LoadingStateManager = class {
  constructor() {
    this.activeStates = /* @__PURE__ */ new Map();
    this.globalSpinner = null;
    this.animationFrameId = null;
  }
  /**
   * Create a new loading state
   * @param {string} id - Unique identifier for this loading state
   * @param {Object} options - Loading state options
   * @param {string} options.type - Type: 'spinner', 'progress', 'pulse', 'custom'
   * @param {string} options.message - Loading message to display
   * @param {string} options.style - Spinner/progress style name
   * @param {number} options.total - Total for progress bars
   * @returns {Object} Loading state controller
   */
  create(id, options = {}) {
    const {
      type = "spinner",
      message = "Loading...",
      style = "dots",
      total = 100
    } = options;
    const state = {
      id,
      type,
      message,
      style,
      total,
      current: 0,
      frames: SPINNER_FRAMES2[style]?.frames || SPINNER_FRAMES2.dots.frames,
      frameIndex: 0,
      interval: SPINNER_FRAMES2[style]?.interval || 80,
      startTime: Date.now(),
      timerId: null,
      listeners: /* @__PURE__ */ new Set(),
      isComplete: false
    };
    this.activeStates.set(id, state);
    if (type === "spinner") {
      this._startSpinnerAnimation(state);
    }
    logger_default.debug(`Loading state created: ${id} (${type})`);
    return {
      id,
      update: (newMessage) => this.updateMessage(id, newMessage),
      progress: (current, newTotal) => this.updateProgress(id, current, newTotal),
      complete: (finalMessage) => this.complete(id, finalMessage),
      onUpdate: (callback) => this._addListener(id, callback),
      getFrame: () => this._getCurrentFrame(state),
      elapsed: () => Date.now() - state.startTime
    };
  }
  /**
   * Start spinner animation timer
   * @private
   */
  _startSpinnerAnimation(state) {
    state.timerId = setInterval(() => {
      state.frameIndex = (state.frameIndex + 1) % state.frames.length;
      this._notifyListeners(state);
    }, state.interval);
  }
  /**
   * Get current spinner frame
   * @private
   */
  _getCurrentFrame(state) {
    const theme = getCurrentTheme();
    const colors = theme.colors;
    const frame = state.frames[state.frameIndex];
    if (state.type === "progress") {
      return this._renderProgressBar(state, colors);
    }
    return {
      frame,
      message: state.message,
      elapsed: this._formatElapsed(Date.now() - state.startTime),
      color: colors.branding.logo
    };
  }
  /**
   * Render progress bar
   * @private
   */
  _renderProgressBar(state, colors) {
    const { bars } = PROGRESS_STYLES;
    const percentage = Math.min(100, Math.max(0, state.current / state.total * 100));
    const filledLength = Math.floor(percentage / 100 * bars.length);
    const filled = bars[bars.length - 1].repeat(filledLength);
    const empty = bars[0].repeat(bars.length - filledLength);
    return {
      bar: `[${filled}${empty}]`,
      percentage: percentage.toFixed(1),
      current: state.current,
      total: state.total,
      message: state.message,
      color: percentage < 30 ? colors.gauge.low : percentage < 70 ? colors.gauge.medium : percentage < 90 ? colors.gauge.high : colors.gauge.critical
    };
  }
  /**
   * Format elapsed time
   * @private
   */
  _formatElapsed(ms) {
    if (ms < 1e3) return `${ms}ms`;
    if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
    const mins = Math.floor(ms / 6e4);
    const secs = (ms % 6e4 / 1e3).toFixed(0);
    return `${mins}m ${secs}s`;
  }
  /**
   * Add update listener
   * @private
   */
  _addListener(id, callback) {
    const state = this.activeStates.get(id);
    if (state) {
      state.listeners.add(callback);
      return () => state.listeners.delete(callback);
    }
    return () => {
    };
  }
  /**
   * Notify all listeners of state update
   * @private
   */
  _notifyListeners(state) {
    const frame = this._getCurrentFrame(state);
    state.listeners.forEach((callback) => {
      try {
        callback(frame, state);
      } catch (err) {
        logger_default.debug(`Loading state listener error: ${err.message}`);
      }
    });
  }
  /**
   * Update loading message
   * @param {string} id - Loading state ID
   * @param {string} newMessage - New message to display
   */
  updateMessage(id, newMessage) {
    const state = this.activeStates.get(id);
    if (state) {
      state.message = newMessage;
      this._notifyListeners(state);
    }
  }
  /**
   * Update progress bar
   * @param {string} id - Loading state ID
   * @param {number} current - Current progress value
   * @param {number} newTotal - Optional new total
   */
  updateProgress(id, current, newTotal) {
    const state = this.activeStates.get(id);
    if (state) {
      state.current = current;
      if (newTotal !== void 0) state.total = newTotal;
      this._notifyListeners(state);
    }
  }
  /**
   * Mark loading state as complete
   * @param {string} id - Loading state ID
   * @param {string} finalMessage - Optional final message
   */
  complete(id, finalMessage) {
    const state = this.activeStates.get(id);
    if (state) {
      state.isComplete = true;
      if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
      if (finalMessage) {
        state.message = finalMessage;
      }
      this._notifyListeners(state);
      logger_default.debug(`Loading state completed: ${id} (${this._formatElapsed(Date.now() - state.startTime)})`);
    }
  }
  /**
   * Remove a loading state
   * @param {string} id - Loading state ID
   */
  remove(id) {
    const state = this.activeStates.get(id);
    if (state) {
      if (state.timerId) {
        clearInterval(state.timerId);
      }
      this.activeStates.delete(id);
      logger_default.debug(`Loading state removed: ${id}`);
    }
  }
  /**
   * Get all active loading states
   * @returns {Array} Array of active state IDs
   */
  getActive() {
    return Array.from(this.activeStates.keys());
  }
  /**
   * Clear all loading states
   */
  clearAll() {
    for (const [id, state] of this.activeStates) {
      if (state.timerId) {
        clearInterval(state.timerId);
      }
    }
    this.activeStates.clear();
    logger_default.debug("All loading states cleared");
  }
};
var loadingStates = new LoadingStateManager();

// src/theme-selector.js
init_logger();
var PREVIEW_CARD = {
  width: 28,
  height: 14,
  margin: 2
};
var PREVIEW_SAMPLES = {
  header: "Theme Preview",
  border: "\u2500".repeat(24),
  textSample: "Aa Bb Cc 123",
  statusActive: "\u25CF Active",
  statusIdle: "\u25CB Idle",
  gauge: "\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591 40%",
  chart: "\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588"
};
function createThemeSelector(screen, blessed8, onClose) {
  const themeNames = getThemeNames();
  const currentThemeName2 = getThemeName();
  let selectedIndex = themeNames.indexOf(currentThemeName2);
  if (selectedIndex === -1) selectedIndex = 0;
  let modalBox = null;
  let previewBoxes = [];
  let infoText = null;
  let helpText = null;
  let unsubscribeThemeChange = null;
  function applyThemeColor(element, color, isBg = false) {
    if (isBg) {
      element.style.bg = color;
    } else {
      element.style.fg = color;
    }
  }
  function renderPreviewContent(theme, blessed9) {
    const colors = theme.colors;
    return [
      `{${colors.branding.title}-fg}{bold}${PREVIEW_SAMPLES.header}{/bold}{/${colors.branding.title}-fg}`,
      `{${colors.border.cpu}-fg}${PREVIEW_SAMPLES.border}{/${colors.border.cpu}-fg}`,
      "",
      ` {${colors.text.primary}-fg}${PREVIEW_SAMPLES.textSample}{/${colors.text.primary}-fg}`,
      "",
      ` {${colors.status.active}-fg}${PREVIEW_SAMPLES.statusActive}{/${colors.status.active}-fg}`,
      ` {${colors.status.idle}-fg}${PREVIEW_SAMPLES.statusIdle}{/${colors.status.idle}-fg}`,
      "",
      ` {${colors.gauge.medium}-fg}${PREVIEW_SAMPLES.gauge}{/${colors.gauge.medium}-fg}`,
      "",
      ` {${colors.chart.line}-fg}${PREVIEW_SAMPLES.chart}{/${colors.chart.line}-fg}`,
      "",
      `{center}{${colors.text.secondary}-fg}${theme.name}{/${colors.text.secondary}-fg}{/center}`
    ].join("\n");
  }
  function createModal() {
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const cardsPerRow = Math.min(3, themeNames.length);
    const modalWidth = (PREVIEW_CARD.width + PREVIEW_CARD.margin) * cardsPerRow + 4;
    const rows = Math.ceil(themeNames.length / cardsPerRow);
    const modalHeight = PREVIEW_CARD.height * rows + 8;
    modalBox = blessed8.box({
      parent: screen,
      top: "center",
      left: "center",
      width: Math.min(modalWidth, screenWidth - 4),
      height: Math.min(modalHeight, screenHeight - 4),
      border: { type: "line" },
      style: {
        border: { fg: "cyan" },
        bg: "black"
      },
      tags: true,
      label: " {bold}Theme Selector{/bold} ",
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: " ",
        style: { bg: "cyan" }
      }
    });
    blessed8.text({
      parent: modalBox,
      top: 1,
      left: "center",
      width: modalWidth - 4,
      content: "{center}Select a theme with arrow keys, press Enter to apply{/center}",
      style: { fg: "white" },
      tags: true
    });
    themeNames.forEach((themeName, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const theme = themeName === "auto" ? getCurrentTheme() : getTheme(themeName);
      const isSelected = index === selectedIndex;
      const isCurrent = themeName === currentThemeName2;
      const left = 2 + col * (PREVIEW_CARD.width + PREVIEW_CARD.margin);
      const top = 3 + row * PREVIEW_CARD.height;
      const card = blessed8.box({
        parent: modalBox,
        top,
        left,
        width: PREVIEW_CARD.width,
        height: PREVIEW_CARD.height,
        border: {
          type: "line",
          fg: isSelected ? "brightCyan" : "gray"
        },
        style: {
          bg: isSelected ? "brightBlack" : "black",
          border: {
            fg: isSelected ? "brightCyan" : "gray"
          }
        },
        tags: true,
        content: renderPreviewContent(theme, blessed8)
      });
      if (isCurrent) {
        blessed8.text({
          parent: card,
          top: 0,
          right: 0,
          content: "\u25CF",
          style: { fg: "green" }
        });
      }
      previewBoxes.push({ box: card, themeName, index });
    });
    infoText = blessed8.text({
      parent: modalBox,
      bottom: 2,
      left: "center",
      width: modalWidth - 4,
      content: getInfoText(),
      style: { fg: "gray" },
      tags: true
    });
    helpText = blessed8.text({
      parent: modalBox,
      bottom: 1,
      left: "center",
      width: modalWidth - 4,
      content: "{center}\u2191/\u2193/\u2190/\u2192: Navigate  Enter: Apply  t: Cycle themes  q/Esc: Close{/center}",
      style: { fg: "gray" },
      tags: true
    });
    screen.render();
  }
  function getInfoText() {
    const themeName = themeNames[selectedIndex];
    const theme = getTheme(themeName);
    if (themeName === "auto") {
      const detected = getCurrentTheme();
      return `{center}Auto-detect \u2192 ${detected.name} (currently selected: ${currentThemeName2}){/center}`;
    }
    return `{center}${theme.name}${themeName === currentThemeName2 ? " (current)" : ""}{/center}`;
  }
  function updateSelection() {
    previewBoxes.forEach(({ box, index }) => {
      const isSelected = index === selectedIndex;
      const isCurrent = themeNames[index] === currentThemeName2;
      box.style.bg = isSelected ? "brightBlack" : "black";
      box.style.border.fg = isSelected ? "brightCyan" : "gray";
    });
    if (infoText) {
      infoText.setContent(getInfoText());
    }
    screen.render();
  }
  function navigate(delta) {
    const cardsPerRow = Math.min(3, themeNames.length);
    const rows = Math.ceil(themeNames.length / cardsPerRow);
    if (delta === -cardsPerRow && selectedIndex - cardsPerRow >= 0) {
      selectedIndex -= cardsPerRow;
    } else if (delta === cardsPerRow && selectedIndex + cardsPerRow < themeNames.length) {
      selectedIndex += cardsPerRow;
    } else if (delta === -1 && selectedIndex % cardsPerRow > 0) {
      selectedIndex--;
    } else if (delta === 1 && (selectedIndex + 1) % cardsPerRow !== 0 && selectedIndex + 1 < themeNames.length) {
      selectedIndex++;
    }
    updateSelection();
  }
  function applySelectedTheme() {
    const themeName = themeNames[selectedIndex];
    if (themeName !== currentThemeName2) {
      setTheme(themeName);
      saveTheme();
      logger_default.info(`Theme changed to: ${themeName}`);
    }
    close();
  }
  function cycleThemeQuick() {
    selectedIndex = (selectedIndex + 1) % themeNames.length;
    const themeName = themeNames[selectedIndex];
    setTheme(themeName);
    saveTheme();
    updateSelection();
    previewBoxes.forEach(({ box, index }) => {
      const isCurrent = themeNames[index] === themeName;
      const theme = themeNames[index] === "auto" ? getCurrentTheme() : getTheme(themeNames[index]);
      box.setContent(renderPreviewContent(theme, blessed8));
    });
    screen.render();
  }
  function close() {
    if (unsubscribeThemeChange) {
      unsubscribeThemeChange();
    }
    if (modalBox) {
      modalBox.destroy();
      modalBox = null;
    }
    previewBoxes = [];
    if (onClose) {
      onClose();
    }
    screen.render();
  }
  function handleKey(ch, key) {
    if (key.name === "up") navigate(-3);
    else if (key.name === "down") navigate(3);
    else if (key.name === "left") navigate(-1);
    else if (key.name === "right") navigate(1);
    else if (key.name === "return") applySelectedTheme();
    else if (ch === "t") cycleThemeQuick();
    else if (ch === "q" || key.name === "escape") close();
  }
  createModal();
  unsubscribeThemeChange = onThemeChange(() => {
    previewBoxes.forEach(({ box, index }) => {
      const theme = themeNames[index] === "auto" ? getCurrentTheme() : getTheme(themeNames[index]);
      box.setContent(renderPreviewContent(theme, blessed8));
    });
    screen.render();
  });
  return {
    handleKey,
    close,
    isActive: () => modalBox !== null
  };
}
async function showThemeSelector(screen, blessed8, onThemeApplied) {
  return new Promise((resolve9) => {
    const selector = createThemeSelector(screen, blessed8, () => {
      screen.removeListener("keypress", keyHandler);
      if (onThemeApplied) {
        onThemeApplied();
      }
      resolve9();
    });
    function keyHandler(ch, key) {
      selector.handleKey(ch, key);
    }
    screen.on("keypress", keyHandler);
  });
}

// src/auto-save.js
var import_fs21 = __toESM(require("fs"), 1);
var import_path19 = __toESM(require("path"), 1);
var import_os12 = __toESM(require("os"), 1);
init_logger();
init_security();
init_config();
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return { valid: false, error: "Path must be a non-empty string" };
  }
  const resolvedPath = filePath.startsWith("~") ? import_path19.default.join(import_os12.default.homedir(), filePath.slice(1)) : import_path19.default.resolve(filePath);
  const homeDir = import_os12.default.homedir();
  const tempDirs = ["/tmp", import_os12.default.tmpdir()];
  const isInAllowedDir = resolvedPath.startsWith(homeDir) || tempDirs.some((tmpDir) => resolvedPath.startsWith(tmpDir));
  if (!isInAllowedDir) {
    return { valid: false, error: "Path must be within home or temp directory" };
  }
  if (!isValidPath(resolvedPath)) {
    return { valid: false, error: "Invalid path characters" };
  }
  return { valid: true, resolvedPath };
}
var AutoSaveManager = class {
  /**
   * Create an AutoSaveManager instance
   * @param {Object} options - Configuration options
   * @param {number} options.intervalMs - Auto-save interval in milliseconds (default: 30000)
   * @param {boolean} options.enabled - Whether auto-save is enabled (default: true)
   * @param {string} options.statePath - Path to save state file (default: ~/.openclaw/dashboard-state.json)
   * @param {Function} options.getState - Callback to get current state object
   * @param {Function} options.getSettings - Callback to get current settings
   * @param {Function} options.saveSettings - Callback to save settings
   */
  constructor(options = {}) {
    this.intervalMs = options.intervalMs || 3e4;
    this.enabled = options.enabled !== false;
    this.statePath = options.statePath || PATHS.STATE;
    this.getState = options.getState;
    this.getSettings = options.getSettings;
    this.saveSettings = options.saveSettings;
    this.timer = null;
    this.isDirty = false;
    this.lastSaveTime = 0;
    this.saveCount = 0;
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 3;
    this.lastStateChecksum = null;
    this.backupEnabled = options.backupEnabled !== false;
    this.backupCount = options.backupCount || 5;
    this.lastStatsLogTime = 0;
    this.statsLogIntervalMs = options.statsLogIntervalMs || 3e5;
    this.stats = {
      totalBytesWritten: 0,
      totalBackupsCreated: 0,
      totalBackupsCleaned: 0,
      lastBackupPath: null,
      averageSaveTimeMs: 0,
      totalSaveTimeMs: 0
    };
  }
  /**
   * Create a backup of the current state file before overwriting
   * @param {string} statePath - Path to the state file
   * @returns {string|null} Path to backup file or null if no backup created
   */
  createBackup(statePath) {
    if (!this.backupEnabled) {
      return null;
    }
    try {
      if (!import_fs21.default.existsSync(statePath)) {
        return null;
      }
      const stats = import_fs21.default.statSync(statePath);
      if (stats.size === 0) {
        return null;
      }
      const now = /* @__PURE__ */ new Date();
      let timestamp = now.toISOString().replace(/[:.]/g, "-");
      const backupBase = `${statePath}.${timestamp}.backup`;
      let backupPath = backupBase;
      let counter = 1;
      while (import_fs21.default.existsSync(backupPath)) {
        backupPath = `${statePath}.${timestamp}-${counter}.backup`;
        counter++;
      }
      import_fs21.default.copyFileSync(statePath, backupPath);
      setSecurePermissionsSync(backupPath);
      this.stats.totalBackupsCreated++;
      this.stats.lastBackupPath = backupPath;
      logger_default.debug(`Created state backup: ${import_path19.default.basename(backupPath)}`);
      return backupPath;
    } catch (err) {
      logger_default.debug(`Failed to create backup: ${err.message}`);
      return null;
    }
  }
  /**
   * Clean up old backup files, keeping only the most recent N
   * @param {string} statePath - Path to the state file (backups are named statePath.*.backup)
   */
  cleanupBackups(statePath) {
    if (!this.backupEnabled || this.backupCount <= 0) {
      return;
    }
    try {
      const dir = import_path19.default.dirname(statePath);
      const baseName = import_path19.default.basename(statePath);
      const backups = import_fs21.default.readdirSync(dir).filter((f) => f.startsWith(baseName) && f.endsWith(".backup")).map((f) => ({
        name: f,
        path: import_path19.default.join(dir, f),
        mtime: import_fs21.default.statSync(import_path19.default.join(dir, f)).mtime
      })).sort((a, b) => b.mtime - a.mtime);
      let cleaned = 0;
      for (let i = this.backupCount; i < backups.length; i++) {
        try {
          import_fs21.default.unlinkSync(backups[i].path);
          cleaned++;
          logger_default.debug(`Cleaned up old backup: ${backups[i].name}`);
        } catch {
        }
      }
      if (cleaned > 0) {
        this.stats.totalBackupsCleaned += cleaned;
        logger_default.debug(`Backup cleanup complete: removed ${cleaned} old backups`);
      }
    } catch (err) {
      logger_default.debug(`Backup cleanup failed: ${err.message}`);
    }
  }
  /**
   * Log auto-save statistics to debug output for troubleshooting
   */
  logStats() {
    const now = Date.now();
    if (now - this.lastStatsLogTime < this.statsLogIntervalMs) {
      return;
    }
    this.lastStatsLogTime = now;
    const uptimeMs = now - (this.lastSaveTime > 0 ? this.lastSaveTime - this.saveCount * this.intervalMs : now);
    const avgSaveTime = this.saveCount > 0 ? (this.stats.totalSaveTimeMs / this.saveCount).toFixed(2) : 0;
    const lastSaveAgo = this.lastSaveTime > 0 ? ((now - this.lastSaveTime) / 1e3).toFixed(0) : "never";
    const statsLines = [
      "=== Auto-Save Statistics ===",
      `  Enabled: ${this.enabled}`,
      `  Interval: ${this.intervalMs}ms`,
      `  Backup rotation: ${this.backupEnabled ? "on" : "off"} (keep ${this.backupCount})`,
      `  Saves performed: ${this.saveCount}`,
      `  Consecutive failures: ${this.consecutiveFailures}`,
      `  Total bytes written: ${this.stats.totalBytesWritten.toLocaleString()}`,
      `  Total backups created: ${this.stats.totalBackupsCreated}`,
      `  Total backups cleaned: ${this.stats.totalBackupsCleaned}`,
      `  Average save time: ${avgSaveTime}ms`,
      `  Last save: ${lastSaveAgo}s ago`,
      `  State file: ${this.statePath}`,
      `  Last backup: ${this.stats.lastBackupPath ? import_path19.default.basename(this.stats.lastBackupPath) : "none"}`,
      "==========================="
    ];
    statsLines.forEach((line) => logger_default.debug(line));
  }
  /**
   * Start auto-save timer
   */
  start() {
    if (!this.enabled) {
      logger_default.debug("Auto-save is disabled");
      return;
    }
    if (this.timer) {
      this.stop();
    }
    this.timer = setInterval(() => {
      this.performAutoSave();
    }, this.intervalMs);
    if (this.timer.unref) {
      this.timer.unref();
    }
    logger_default.info(`Auto-save started (interval: ${this.intervalMs}ms)`);
  }
  /**
   * Stop auto-save timer
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger_default.debug("Auto-save stopped");
    }
  }
  /**
   * Mark state as dirty - triggers save on next interval or immediate save
   * @param {boolean} immediate - Whether to save immediately (default: false)
   */
  markDirty(immediate = false) {
    this.isDirty = true;
    if (immediate) {
      this.performAutoSave();
    }
  }
  /**
   * Calculate a simple checksum for state comparison
   * @param {Object} state - State object
   * @returns {string} Checksum string
   */
  calculateChecksum(state) {
    try {
      const { timestamp, ...stateWithoutTimestamp } = state;
      return JSON.stringify(stateWithoutTimestamp);
    } catch {
      return null;
    }
  }
  /**
   * Get current state snapshot
   * @returns {Object} State snapshot
   */
  getStateSnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      settings: null,
      ui: {}
    };
    if (this.getSettings) {
      snapshot.settings = this.getSettings();
    }
    if (this.getState) {
      const state = this.getState();
      if (state) {
        snapshot.ui = {
          selectedSessionIndex: state.selectedSessionIndex || 0,
          paginationOffset: state.paginationOffset || 0,
          sessionSearchQuery: state.sessionSearchQuery || "",
          isSearchMode: state.isSearchMode || false,
          showFavoritesOnly: state.showFavoritesOnly || false,
          focusedWidgetIndex: state.focusedWidgetIndex || -1,
          currentRefreshInterval: state.currentRefreshInterval || 2e3
        };
      }
    }
    return snapshot;
  }
  /**
   * Perform the actual auto-save
   * @returns {boolean} Whether save was successful
   */
  performAutoSave() {
    if (!this.enabled) {
      return false;
    }
    const startTime = Date.now();
    try {
      const snapshot = this.getStateSnapshot();
      const checksum = this.calculateChecksum(snapshot);
      if (checksum === this.lastStateChecksum && !this.isDirty) {
        return true;
      }
      const pathValidation = validateFilePath(this.statePath);
      if (!pathValidation.valid) {
        logger_default.warn(`Auto-save path validation failed: ${pathValidation.error}`);
        return false;
      }
      const dir = pathValidation.resolvedPath.substring(0, pathValidation.resolvedPath.lastIndexOf("/"));
      if (!import_fs21.default.existsSync(dir)) {
        import_fs21.default.mkdirSync(dir, { recursive: true });
      }
      this.createBackup(pathValidation.resolvedPath);
      const jsonData = JSON.stringify(snapshot, null, 2);
      import_fs21.default.writeFileSync(pathValidation.resolvedPath, jsonData);
      setSecurePermissionsSync(pathValidation.resolvedPath);
      this.cleanupBackups(pathValidation.resolvedPath);
      this.lastStateChecksum = checksum;
      this.isDirty = false;
      this.lastSaveTime = Date.now();
      this.saveCount++;
      this.consecutiveFailures = 0;
      this.stats.totalBytesWritten += Buffer.byteLength(jsonData, "utf8");
      const saveTime = Date.now() - startTime;
      this.stats.totalSaveTimeMs += saveTime;
      this.stats.averageSaveTimeMs = this.stats.totalSaveTimeMs / this.saveCount;
      this.logStats();
      logger_default.debug(`Auto-save completed successfully (${saveTime}ms)`);
      return true;
    } catch (err) {
      this.consecutiveFailures++;
      logger_default.error(`Auto-save failed (${this.consecutiveFailures}/${this.maxConsecutiveFailures}): ${err.message}`);
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        logger_default.error("Auto-save disabled due to repeated failures");
        this.enabled = false;
        this.stop();
      }
      return false;
    }
  }
  /**
   * Perform immediate save (e.g., on shutdown)
   * @returns {boolean} Whether save was successful
   */
  saveNow() {
    return this.performAutoSave();
  }
  /**
   * Get auto-save statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      enabled: this.enabled,
      intervalMs: this.intervalMs,
      lastSaveTime: this.lastSaveTime,
      saveCount: this.saveCount,
      consecutiveFailures: this.consecutiveFailures,
      isDirty: this.isDirty,
      statePath: this.statePath,
      // Extended statistics for troubleshooting
      backupEnabled: this.backupEnabled,
      backupCount: this.backupCount,
      totalBytesWritten: this.stats.totalBytesWritten,
      totalBackupsCreated: this.stats.totalBackupsCreated,
      totalBackupsCleaned: this.stats.totalBackupsCleaned,
      lastBackupPath: this.stats.lastBackupPath,
      averageSaveTimeMs: this.stats.averageSaveTimeMs,
      totalSaveTimeMs: this.stats.totalSaveTimeMs
    };
  }
  /**
   * Update configuration
   * @param {Object} options - New configuration options
   */
  updateConfig(options = {}) {
    if (options.intervalMs !== void 0) {
      this.intervalMs = options.intervalMs;
    }
    if (options.enabled !== void 0) {
      this.enabled = options.enabled;
    }
    if (this.timer) {
      this.stop();
      this.start();
    }
  }
};
function loadDashboardState(statePath) {
  try {
    const pathValidation = validateFilePath(statePath);
    if (!pathValidation.valid) {
      logger_default.warn(`State path validation failed: ${pathValidation.error}`);
      return null;
    }
    if (!import_fs21.default.existsSync(pathValidation.resolvedPath)) {
      return null;
    }
    const data = import_fs21.default.readFileSync(pathValidation.resolvedPath, "utf8");
    const state = JSON.parse(data);
    logger_default.info("Loaded dashboard state from " + pathValidation.resolvedPath);
    return state;
  } catch (err) {
    logger_default.warn("Failed to load dashboard state: " + err.message);
    return null;
  }
}
function restoreDashboardState(savedState, dashboard) {
  if (!savedState || !savedState.ui) {
    return false;
  }
  try {
    const ui = savedState.ui;
    if (ui.selectedSessionIndex !== void 0) {
      dashboard.selectedSessionIndex = ui.selectedSessionIndex;
    }
    if (ui.paginationOffset !== void 0) {
      dashboard.paginationOffset = ui.paginationOffset;
    }
    if (ui.sessionSearchQuery !== void 0) {
      dashboard.sessionSearchQuery = ui.sessionSearchQuery;
      if (dashboard.sessionSearchQuery) {
        dashboard.isSearchMode = true;
      }
    }
    if (ui.isSearchMode !== void 0) {
      dashboard.isSearchMode = ui.isSearchMode;
    }
    if (ui.showFavoritesOnly !== void 0) {
      dashboard.showFavoritesOnly = ui.showFavoritesOnly;
    }
    if (ui.focusedWidgetIndex !== void 0) {
      dashboard.focusedWidgetIndex = ui.focusedWidgetIndex;
    }
    if (ui.currentRefreshInterval !== void 0) {
      dashboard.currentRefreshInterval = ui.currentRefreshInterval;
    }
    logger_default.info("Dashboard state restored");
    return true;
  } catch (err) {
    logger_default.error("Failed to restore dashboard state: " + err.message);
    return false;
  }
}

// src/widgets/widget-error-boundary.js
var import_blessed6 = __toESM(require("blessed"), 1);
init_logger();

// src/widgets/widget-error-isolation.js
init_logger();
init_errors();
var safeLogger = logger_default || {
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  },
  debug: () => {
  }
};
var WidgetHealthStatus = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  // Partially working with errors
  FAILED: "failed",
  // Completely failed, not rendering
  RECOVERING: "recovering"
  // Attempting recovery
};
var WidgetErrorType = {
  INIT_ERROR: "init_error",
  CREATE_ERROR: "create_error",
  DATA_ERROR: "data_error",
  RENDER_ERROR: "render_error",
  DESTROY_ERROR: "destroy_error",
  TIMEOUT_ERROR: "timeout_error",
  UNKNOWN_ERROR: "unknown_error"
};
var DEFAULT_ISOLATION_CONFIG = {
  // Error thresholds
  maxConsecutiveErrors: 3,
  errorWindowMs: 6e4,
  // 1 minute window for error counting
  // Recovery settings
  autoRecover: true,
  recoveryDelayMs: 5e3,
  maxRecoveryAttempts: 3,
  // Timeout settings
  initTimeoutMs: 5e3,
  createTimeoutMs: 5e3,
  dataTimeoutMs: 1e4,
  renderTimeoutMs: 1e3,
  destroyTimeoutMs: 3e3,
  // Behavior settings
  failSilently: true,
  // Don't throw on widget errors
  logErrors: true,
  // Log widget errors
  degradeOnError: true
  // Mark as degraded instead of failed on first errors
};
var WidgetIsolatedError = class extends DashboardError {
  constructor(widgetId, operation, originalError, type = WidgetErrorType.UNKNOWN_ERROR) {
    super(
      `Widget '${widgetId}' ${operation} failed: ${originalError?.message || "Unknown error"}`,
      "WIDGET_ISOLATED_ERROR",
      500,
      { widgetId, operation, type, originalError: originalError?.message }
    );
    this.widgetId = widgetId;
    this.operation = operation;
    this.errorType = type;
    this.originalError = originalError;
  }
};
var WidgetHealthTracker = class {
  constructor(config = {}) {
    this.config = { ...DEFAULT_ISOLATION_CONFIG, ...config };
    this.healthStatus = /* @__PURE__ */ new Map();
    this.errorHistory = /* @__PURE__ */ new Map();
  }
  /**
   * Get or create health record for a widget
   * @private
   */
  _getHealthRecord(widgetId) {
    if (!this.healthStatus.has(widgetId)) {
      this.healthStatus.set(widgetId, {
        status: WidgetHealthStatus.HEALTHY,
        consecutiveErrors: 0,
        totalErrors: 0,
        recoveryAttempts: 0,
        lastError: null,
        lastSuccess: Date.now(),
        firstFailure: null,
        degradedSince: null,
        failedSince: null
      });
    }
    return this.healthStatus.get(widgetId);
  }
  /**
   * Record a successful widget operation
   * @param {string} widgetId - Widget identifier
   */
  recordSuccess(widgetId) {
    const record = this._getHealthRecord(widgetId);
    record.status = WidgetHealthStatus.HEALTHY;
    record.consecutiveErrors = 0;
    record.lastSuccess = Date.now();
    record.recoveryAttempts = 0;
    this.errorHistory.delete(widgetId);
  }
  /**
   * Record a widget error and update health status
   * @param {string} widgetId - Widget identifier
   * @param {Error} error - The error that occurred
   * @param {string} errorType - Type of error
   * @returns {Object} Updated health status
   */
  recordError(widgetId, error, errorType = WidgetErrorType.UNKNOWN_ERROR) {
    const record = this._getHealthRecord(widgetId);
    const now = Date.now();
    record.consecutiveErrors++;
    record.totalErrors++;
    record.lastError = {
      message: error?.message,
      type: errorType,
      timestamp: now,
      stack: error?.stack
    };
    if (!this.errorHistory.has(widgetId)) {
      this.errorHistory.set(widgetId, []);
    }
    const errors = this.errorHistory.get(widgetId);
    errors.push(now);
    const cutoff = now - this.config.errorWindowMs;
    while (errors.length > 0 && errors[0] < cutoff) {
      errors.shift();
    }
    if (record.firstFailure === null) {
      record.firstFailure = now;
    }
    const recentErrorCount = errors.length;
    if (recentErrorCount >= this.config.maxConsecutiveErrors) {
      record.status = WidgetHealthStatus.FAILED;
      record.failedSince = now;
    } else if (this.config.degradeOnError && record.status === WidgetHealthStatus.HEALTHY) {
      record.status = WidgetHealthStatus.DEGRADED;
      record.degradedSince = now;
    }
    return { ...record };
  }
  /**
   * Mark widget as recovering
   * @param {string} widgetId - Widget identifier
   */
  markRecovering(widgetId) {
    const record = this._getHealthRecord(widgetId);
    record.status = WidgetHealthStatus.RECOVERING;
    record.recoveryAttempts++;
  }
  /**
   * Get health status for a widget
   * @param {string} widgetId - Widget identifier
   * @returns {Object|null} Health status or null if not tracked
   */
  getHealth(widgetId) {
    const record = this.healthStatus.get(widgetId);
    if (!record) return null;
    const errors = this.errorHistory.get(widgetId) || [];
    return {
      ...record,
      recentErrorCount: errors.length,
      isHealthy: record.status === WidgetHealthStatus.HEALTHY,
      isOperational: record.status !== WidgetHealthStatus.FAILED
    };
  }
  /**
   * Get health status for all tracked widgets
   * @returns {Object} Map of widgetId to health status
   */
  getAllHealth() {
    const result = {};
    for (const [widgetId, record] of this.healthStatus) {
      result[widgetId] = this.getHealth(widgetId);
    }
    return result;
  }
  /**
   * Check if a widget should be allowed to recover
   * @param {string} widgetId - Widget identifier
   * @returns {boolean} True if recovery should be attempted
   */
  canRecover(widgetId) {
    const record = this._getHealthRecord(widgetId);
    if (!this.config.autoRecover) return false;
    if (record.recoveryAttempts >= this.config.maxRecoveryAttempts) return false;
    if (record.status === WidgetHealthStatus.FAILED) {
      const timeSinceFailure = Date.now() - (record.failedSince || 0);
      return timeSinceFailure >= this.config.recoveryDelayMs;
    }
    return record.status !== WidgetHealthStatus.HEALTHY;
  }
  /**
   * Reset health status for a widget
   * @param {string} widgetId - Widget identifier
   */
  resetHealth(widgetId) {
    this.healthStatus.delete(widgetId);
    this.errorHistory.delete(widgetId);
  }
  /**
   * Get summary statistics
   * @returns {Object} Health statistics
   */
  getStats() {
    const allHealth = Array.from(this.healthStatus.values());
    return {
      total: allHealth.length,
      healthy: allHealth.filter((h) => h.status === WidgetHealthStatus.HEALTHY).length,
      degraded: allHealth.filter((h) => h.status === WidgetHealthStatus.DEGRADED).length,
      failed: allHealth.filter((h) => h.status === WidgetHealthStatus.FAILED).length,
      recovering: allHealth.filter((h) => h.status === WidgetHealthStatus.RECOVERING).length,
      totalErrors: allHealth.reduce((sum, h) => sum + h.totalErrors, 0)
    };
  }
};
var WidgetErrorIsolator = class {
  constructor(config = {}) {
    this.config = { ...DEFAULT_ISOLATION_CONFIG, ...config };
    this.healthTracker = new WidgetHealthTracker(this.config);
    this.failedWidgets = /* @__PURE__ */ new Set();
    this.recoveryTimers = /* @__PURE__ */ new Map();
  }
  /**
   * Create a timeout promise
   * @private
   */
  _createTimeout(ms, message) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }
  /**
   * Wrap a widget operation with timeout and error handling
   * @private
   */
  async _wrapOperation(widgetId, operation, fn, timeoutMs, errorType) {
    const health = this.healthTracker.getHealth(widgetId);
    if (health?.status === WidgetHealthStatus.FAILED) {
      if (this.config.failSilently) {
        return null;
      }
      throw new WidgetIsolatedError(widgetId, operation, new Error("Widget is in failed state"), errorType);
    }
    try {
      const result = await Promise.race([
        fn(),
        this._createTimeout(timeoutMs, `Operation timed out after ${timeoutMs}ms`)
      ]);
      this.healthTracker.recordSuccess(widgetId);
      this.failedWidgets.delete(widgetId);
      return result;
    } catch (error) {
      this.healthTracker.recordError(widgetId, error, errorType);
      if (this.config.logErrors) {
        safeLogger.warn(`Widget '${widgetId}' ${operation} failed: ${error.message}`);
      }
      this._scheduleRecovery(widgetId);
      if (this.config.failSilently) {
        return null;
      }
      throw new WidgetIsolatedError(widgetId, operation, error, errorType);
    }
  }
  /**
   * Schedule a recovery attempt
   * @private
   */
  _scheduleRecovery(widgetId) {
    if (this.recoveryTimers.has(widgetId)) return;
    if (!this.healthTracker.canRecover(widgetId)) return;
    const timer = setTimeout(() => {
      this.recoveryTimers.delete(widgetId);
      this.healthTracker.markRecovering(widgetId);
      if (this.config.logErrors) {
        safeLogger.info(`Attempting recovery for widget '${widgetId}'`);
      }
    }, this.config.recoveryDelayMs);
    this.recoveryTimers.set(widgetId, timer);
  }
  /**
   * Wrap widget initialization
   * @param {string} widgetId - Widget identifier
   * @param {Function} initFn - Initialization function
   * @returns {Promise<any>} Init result or null on failure
   */
  async wrapInit(widgetId, initFn) {
    return this._wrapOperation(
      widgetId,
      "init",
      initFn,
      this.config.initTimeoutMs,
      WidgetErrorType.INIT_ERROR
    );
  }
  /**
   * Wrap widget creation
   * @param {string} widgetId - Widget identifier
   * @param {Function} createFn - Creation function
   * @returns {Promise<any>} Create result or null on failure
   */
  async wrapCreate(widgetId, createFn) {
    return this._wrapOperation(
      widgetId,
      "create",
      createFn,
      this.config.createTimeoutMs,
      WidgetErrorType.CREATE_ERROR
    );
  }
  /**
   * Wrap widget data fetching
   * @param {string} widgetId - Widget identifier
   * @param {Function} dataFn - Data fetching function
   * @returns {Promise<any>} Data or null on failure
   */
  async wrapGetData(widgetId, dataFn) {
    return this._wrapOperation(
      widgetId,
      "getData",
      dataFn,
      this.config.dataTimeoutMs,
      WidgetErrorType.DATA_ERROR
    );
  }
  /**
   * Wrap widget render
   * @param {string} widgetId - Widget identifier
   * @param {Function} renderFn - Render function
   * @returns {Promise<any>} Render result or null on failure
   */
  async wrapRender(widgetId, renderFn) {
    return this._wrapOperation(
      widgetId,
      "render",
      renderFn,
      this.config.renderTimeoutMs,
      WidgetErrorType.RENDER_ERROR
    );
  }
  /**
   * Wrap widget destruction
   * @param {string} widgetId - Widget identifier
   * @param {Function} destroyFn - Destroy function
   * @returns {Promise<any>} Destroy result or null on failure
   */
  async wrapDestroy(widgetId, destroyFn) {
    return this._wrapOperation(
      widgetId,
      "destroy",
      destroyFn,
      this.config.destroyTimeoutMs,
      WidgetErrorType.DESTROY_ERROR
    );
  }
  /**
   * Get health status for a widget
   * @param {string} widgetId - Widget identifier
   * @returns {Object|null} Health status
   */
  getHealth(widgetId) {
    return this.healthTracker.getHealth(widgetId);
  }
  /**
   * Get all health statuses
   * @returns {Object} All health statuses
   */
  getAllHealth() {
    return this.healthTracker.getAllHealth();
  }
  /**
   * Check if a widget is operational (not failed)
   * @param {string} widgetId - Widget identifier
   * @returns {boolean} True if operational
   */
  isOperational(widgetId) {
    const health = this.getHealth(widgetId);
    return !health || health.status !== WidgetHealthStatus.FAILED;
  }
  /**
   * Force reset a widget's health status
   * @param {string} widgetId - Widget identifier
   */
  resetWidget(widgetId) {
    this.healthTracker.resetHealth(widgetId);
    this.failedWidgets.delete(widgetId);
    const timer = this.recoveryTimers.get(widgetId);
    if (timer) {
      clearTimeout(timer);
      this.recoveryTimers.delete(widgetId);
    }
  }
  /**
   * Get isolator statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.healthTracker.getStats(),
      failedWidgetCount: this.failedWidgets.size,
      pendingRecoveries: this.recoveryTimers.size
    };
  }
  /**
   * Shutdown the isolator and clear all timers
   */
  shutdown() {
    for (const [widgetId, timer] of this.recoveryTimers) {
      clearTimeout(timer);
    }
    this.recoveryTimers.clear();
    this.failedWidgets.clear();
  }
};

// src/widgets/widget-error-boundary.js
var ErrorStyles = {
  CONTAINER: {
    border: { type: "line" },
    style: {
      border: { fg: "red" },
      bg: "black"
    }
  },
  TITLE: {
    fg: "red",
    bold: true
  },
  MESSAGE: {
    fg: "white",
    bg: "black"
  },
  ERROR_DETAIL: {
    fg: "gray",
    bg: "black"
  },
  RETRY_BUTTON: {
    fg: "black",
    bg: "green",
    bold: true
  },
  RETRY_BUTTON_FOCUSED: {
    fg: "black",
    bg: "bright-green",
    bold: true
  },
  DISMISS_BUTTON: {
    fg: "white",
    bg: "gray"
  },
  ICON: {
    fg: "red",
    bg: "black"
  }
};
var WidgetErrorBoundary = class {
  constructor(widget, options = {}) {
    this.widget = widget;
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 5e3,
      showErrorDetails: options.showErrorDetails ?? true,
      allowDismiss: options.allowDismiss ?? true,
      errorTitle: options.errorTitle ?? "Widget Error",
      onRetry: options.onRetry ?? null,
      onDismiss: options.onDismiss ?? null,
      onError: options.onError ?? null,
      theme: options.theme ?? {}
    };
    this.errorState = {
      hasError: false,
      error: null,
      retryCount: 0,
      lastError: null,
      isRecovering: false
    };
    this.isolator = new WidgetErrorIsolator({
      maxConsecutiveErrors: this.options.maxRetries,
      recoveryDelayMs: this.options.retryDelay,
      autoRecover: true
    });
    this.errorContainer = null;
    this.retryButton = null;
    this.dismissButton = null;
    this.errorText = null;
    this.originalBox = null;
    this.parentScreen = null;
    this.handleRetry = this.handleRetry.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
  }
  /**
   * Wrap the widget's create method with error boundary
   * @param {Object} screen - Blessed screen
   * @param {Object} theme - Theme configuration
   */
  async create(screen, theme = {}) {
    this.parentScreen = screen;
    this.options.theme = { ...this.options.theme, ...theme };
    try {
      const result = await this.isolator.wrapCreate(
        this.widget.id || "widget",
        () => this.widget.create(screen, theme)
      );
      if (result === null) {
        this.showErrorBoundary(this.isolator.getHealth(this.widget.id)?.lastError?.message || "Widget creation failed");
        return this;
      }
      this.originalBox = this.widget.box;
      return this;
    } catch (error) {
      this.handleError(error, WidgetErrorType.CREATE_ERROR);
      return this;
    }
  }
  /**
   * Show the error boundary UI
   * @param {string} message - Error message to display
   * @param {Error} originalError - Original error object
   * @private
   */
  showErrorBoundary(message, originalError = null) {
    if (!this.parentScreen) {
      logger_default.error("Cannot show error boundary without parent screen");
      return;
    }
    const C2 = this.options.theme.colors || {};
    const styles = this.getErrorStyles(C2);
    if (this.originalBox && !this.originalBox.destroyed) {
      this.originalBox.hide();
    }
    this.errorContainer = import_blessed6.default.box({
      parent: this.parentScreen,
      ...styles.container,
      label: ` ${this.options.errorTitle} `,
      tags: true
    });
    if (this.originalBox) {
      this.errorContainer.top = this.originalBox.top;
      this.errorContainer.left = this.originalBox.left;
      this.errorContainer.width = this.originalBox.width;
      this.errorContainer.height = this.originalBox.height;
    }
    import_blessed6.default.text({
      parent: this.errorContainer,
      top: 1,
      left: "center",
      content: "{red-fg}\u2716{/red-fg}",
      tags: true,
      style: styles.icon
    });
    import_blessed6.default.text({
      parent: this.errorContainer,
      top: 2,
      left: "center",
      content: "{bold}Widget Failed{/bold}",
      tags: true,
      style: styles.title
    });
    const shortMessage = message.length > 40 ? message.substring(0, 37) + "..." : message;
    this.errorText = import_blessed6.default.text({
      parent: this.errorContainer,
      top: 3,
      left: "center",
      content: shortMessage,
      tags: true,
      style: styles.message
    });
    let currentTop = 4;
    if (this.options.showErrorDetails && originalError?.stack) {
      const stackLines = originalError.stack.split("\n").slice(0, 3);
      import_blessed6.default.text({
        parent: this.errorContainer,
        top: currentTop++,
        left: "center",
        content: stackLines[0] || "",
        tags: true,
        style: styles.errorDetail
      });
    }
    if (this.errorState.retryCount > 0) {
      import_blessed6.default.text({
        parent: this.errorContainer,
        top: currentTop++,
        left: "center",
        content: `Retry ${this.errorState.retryCount}/${this.options.maxRetries}`,
        tags: true,
        style: styles.errorDetail
      });
    }
    currentTop++;
    this.retryButton = import_blessed6.default.button({
      parent: this.errorContainer,
      top: currentTop,
      left: "center",
      width: 12,
      height: 1,
      content: "  Retry  ",
      align: "center",
      valign: "middle",
      tags: true,
      style: {
        fg: styles.retryButton.fg,
        bg: styles.retryButton.bg,
        bold: styles.retryButton.bold,
        focus: {
          fg: styles.retryButtonFocused.fg,
          bg: styles.retryButtonFocused.bg,
          bold: styles.retryButtonFocused.bold
        },
        hover: {
          fg: styles.retryButtonFocused.fg,
          bg: styles.retryButtonFocused.bg
        }
      }
    });
    this.retryButton.on("press", this.handleRetry);
    if (this.options.allowDismiss) {
      this.dismissButton = import_blessed6.default.button({
        parent: this.errorContainer,
        top: currentTop + 2,
        left: "center",
        width: 12,
        height: 1,
        content: " Dismiss ",
        align: "center",
        valign: "middle",
        tags: true,
        style: {
          fg: styles.dismissButton.fg,
          bg: styles.dismissButton.bg,
          focus: {
            fg: "black",
            bg: "white"
          },
          hover: {
            fg: "black",
            bg: "white"
          }
        }
      });
      this.dismissButton.on("press", this.handleDismiss);
    }
    this.retryButton.focus();
    this.parentScreen.on("keypress", this.handleKeypress);
    this.errorState.hasError = true;
    this.errorState.lastError = originalError;
    if (this.options.onError) {
      this.options.onError(originalError || new Error(message), this.errorState.retryCount);
    }
    logger_default.warn(`Error boundary shown for widget '${this.widget.id}': ${message}`);
  }
  /**
   * Get error styles merged with theme
   * @private
   */
  getErrorStyles(themeColors) {
    return {
      container: {
        border: { type: "line" },
        style: {
          border: { fg: themeColors.error || "red" },
          bg: "black"
        }
      },
      title: {
        fg: themeColors.error || "red",
        bold: true
      },
      message: {
        fg: "white",
        bg: "black"
      },
      errorDetail: {
        fg: themeColors.gray || "gray",
        bg: "black"
      },
      retryButton: ErrorStyles.RETRY_BUTTON,
      retryButtonFocused: ErrorStyles.RETRY_BUTTON_FOCUSED,
      dismissButton: ErrorStyles.DISMISS_BUTTON,
      icon: {
        fg: themeColors.error || "red",
        bg: "black"
      }
    };
  }
  /**
   * Handle keypress for keyboard navigation
   * @private
   */
  handleKeypress(ch, key) {
    if (!this.errorState.hasError) return;
    if (key.name === "r" || key.name === "return") {
      this.handleRetry();
    } else if (key.name === "d" || key.name === "escape") {
      this.handleDismiss();
    } else if (key.name === "tab") {
      if (this.dismissButton) {
        const focused = this.retryButton.focused;
        if (focused) {
          this.dismissButton.focus();
        } else {
          this.retryButton.focus();
        }
      }
    }
  }
  /**
   * Handle retry action
   * @private
   */
  async handleRetry() {
    if (this.errorState.isRecovering) return;
    this.errorState.isRecovering = true;
    this.errorState.retryCount++;
    logger_default.info(`Retrying widget '${this.widget.id}' (attempt ${this.errorState.retryCount})`);
    if (this.retryButton) {
      this.retryButton.setContent("Retrying...");
      this.retryButton.style.bg = "yellow";
    }
    try {
      this.clearErrorBoundary();
      this.isolator.resetWidget(this.widget.id);
      let initResult = null;
      let createResult = null;
      if (this.widget.init) {
        initResult = await this.isolator.wrapInit(
          this.widget.id,
          () => this.widget.init()
        );
      }
      if (this.widget.create && initResult !== null) {
        createResult = await this.isolator.wrapCreate(
          this.widget.id,
          () => this.widget.create(this.parentScreen, this.options.theme)
        );
      }
      if (initResult === null && this.widget.init) {
        throw new Error("Widget initialization failed");
      }
      if (createResult === null && this.widget.create) {
        throw new Error("Widget creation failed");
      }
      this.errorState.hasError = false;
      this.errorState.error = null;
      this.originalBox = this.widget.box;
      if (this.options.onRetry) {
        this.options.onRetry(true, this.errorState.retryCount);
      }
      logger_default.info(`Widget '${this.widget.id}' recovered successfully`);
    } catch (error) {
      this.errorState.hasError = true;
      this.errorState.error = error;
      if (this.errorState.retryCount >= this.options.maxRetries) {
        this.showErrorBoundary(`Widget failed after ${this.options.maxRetries} retries`, error);
        import_blessed6.default.text({
          parent: this.errorContainer,
          top: this.errorContainer.children.length - 2,
          left: "center",
          content: "{red-fg}Max retries reached{/red-fg}",
          tags: true,
          style: { fg: "red" }
        });
      } else {
        this.showErrorBoundary(error.message || "Widget failed to recover", error);
      }
      if (this.options.onRetry) {
        this.options.onRetry(false, this.errorState.retryCount, error);
      }
      logger_default.error(`Widget '${this.widget.id}' retry failed: ${error.message}`);
    } finally {
      this.errorState.isRecovering = false;
    }
  }
  /**
   * Handle dismiss action
   * @private
   */
  handleDismiss() {
    logger_default.info(`Widget '${this.widget.id}' error boundary dismissed`);
    this.clearErrorBoundary();
    if (this.options.onDismiss) {
      this.options.onDismiss();
    }
  }
  /**
   * Clear the error boundary UI
   * @private
   */
  clearErrorBoundary() {
    if (this.parentScreen) {
      this.parentScreen.removeListener("keypress", this.handleKeypress);
    }
    if (this.errorContainer && !this.errorContainer.destroyed) {
      this.errorContainer.destroy();
      this.errorContainer = null;
    }
    if (this.originalBox && !this.originalBox.destroyed) {
      this.originalBox.show();
    }
    this.retryButton = null;
    this.dismissButton = null;
    this.errorText = null;
  }
  /**
   * Handle error and show boundary
   * @param {Error} error - The error that occurred
   * @param {string} type - Error type
   * @private
   */
  handleError(error, type = WidgetErrorType.UNKNOWN_ERROR) {
    this.errorState.error = error;
    this.errorState.hasError = true;
    this.isolator.healthTracker.recordError(this.widget.id, error, type);
    this.showErrorBoundary(error.message, error);
  }
  /**
   * Get data with error handling
   */
  async getData(dataProvider) {
    if (this.errorState.hasError) {
      return null;
    }
    const result = await this.isolator.wrapGetData(
      this.widget.id,
      () => this.widget.getData(dataProvider)
    );
    if (result === null) {
      const health = this.isolator.getHealth(this.widget.id);
      if (health?.lastError && !this.errorState.hasError) {
        const error = new Error(health.lastError.message || "Data fetch failed");
        error.stack = health.lastError.stack;
        this.handleError(error, WidgetErrorType.DATA_ERROR);
      }
    }
    return result;
  }
  /**
   * Render with error handling
   */
  async render(data) {
    if (this.errorState.hasError) {
      return;
    }
    const result = await this.isolator.wrapRender(
      this.widget.id,
      () => this.widget.render(data)
    );
    if (result === null) {
      const health = this.isolator.getHealth(this.widget.id);
      if (health?.lastError && !this.errorState.hasError) {
        const error = new Error(health.lastError.message || "Render failed");
        error.stack = health.lastError.stack;
        this.handleError(error, WidgetErrorType.RENDER_ERROR);
      }
    }
  }
  /**
   * Update with error handling
   */
  update(data) {
    if (this.errorState.hasError || !this.widget.update) {
      return;
    }
    try {
      this.widget.update(data);
    } catch (error) {
      this.handleError(error, WidgetErrorType.RENDER_ERROR);
    }
  }
  /**
   * Destroy the error boundary and widget
   */
  async destroy() {
    this.clearErrorBoundary();
    try {
      await this.isolator.wrapDestroy(
        this.widget.id,
        () => this.widget.destroy()
      );
    } catch (error) {
      logger_default.error(`Error destroying widget '${this.widget.id}': ${error.message}`);
    }
    this.isolator.shutdown();
  }
  /**
   * Get current error state
   */
  getErrorState() {
    return {
      ...this.errorState,
      health: this.isolator.getHealth(this.widget.id)
    };
  }
  /**
   * Check if widget is in error state
   */
  hasError() {
    return this.errorState.hasError;
  }
  /**
   * Force show error boundary with custom message
   * @param {string} message - Error message
   * @param {Error} error - Optional error object
   */
  showError(message, error = null) {
    this.errorState.hasError = true;
    this.errorState.error = error || new Error(message);
    this.errorState.lastError = error || new Error(message);
    if (this.parentScreen) {
      this.showErrorBoundary(message, error);
    } else {
      this._pendingErrorMessage = message;
    }
  }
  /**
   * Reset error state
   */
  async reset() {
    this.clearErrorBoundary();
    this.errorState.hasError = false;
    this.errorState.error = null;
    this.errorState.retryCount = 0;
    this.isolator.resetWidget(this.widget.id);
  }
};
var ErrorBoundaryManager = class {
  constructor() {
    this.boundaries = /* @__PURE__ */ new Map();
    this.globalOptions = {};
  }
  /**
   * Set global options for all error boundaries
   * @param {Object} options - Global options
   */
  setGlobalOptions(options) {
    this.globalOptions = { ...this.globalOptions, ...options };
  }
  /**
   * Wrap a widget with error boundary
   * @param {Object} widget - Widget to wrap
   * @param {Object} options - Options (merged with global options)
   * @returns {WidgetErrorBoundary} Error boundary instance
   */
  wrap(widget, options = {}) {
    const mergedOptions = { ...this.globalOptions, ...options };
    const boundary = new WidgetErrorBoundary(widget, mergedOptions);
    this.boundaries.set(widget.id, boundary);
    return boundary;
  }
  /**
   * Get error boundary for a widget
   * @param {string} widgetId - Widget ID
   * @returns {WidgetErrorBoundary|null} Error boundary or null
   */
  get(widgetId) {
    return this.boundaries.get(widgetId) || null;
  }
  /**
   * Remove an error boundary
   * @param {string} widgetId - Widget ID
   */
  remove(widgetId) {
    const boundary = this.boundaries.get(widgetId);
    if (boundary) {
      boundary.destroy();
      this.boundaries.delete(widgetId);
    }
  }
  /**
   * Get all error states
   * @returns {Object} Map of widget ID to error state
   */
  getAllErrorStates() {
    const states = {};
    for (const [id, boundary] of this.boundaries) {
      states[id] = boundary.getErrorState();
    }
    return states;
  }
  /**
   * Retry all failed widgets
   * @returns {Promise<Object>} Results of retry attempts
   */
  async retryAll() {
    const results = {};
    for (const [id, boundary] of this.boundaries) {
      if (boundary.hasError()) {
        try {
          await boundary.handleRetry();
          results[id] = { success: true };
        } catch (error) {
          results[id] = { success: false, error: error.message };
        }
      }
    }
    return results;
  }
  /**
   * Clear all error boundaries
   */
  clearAll() {
    for (const boundary of this.boundaries.values()) {
      boundary.destroy();
    }
    this.boundaries.clear();
  }
  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const all = Array.from(this.boundaries.values());
    return {
      total: all.length,
      inError: all.filter((b) => b.hasError()).length,
      healthy: all.filter((b) => !b.hasError()).length
    };
  }
};

// index.js
var { debounce: cacheDebounce, throttle: throttle2 } = cache_default;
var __filename9 = (0, import_url11.fileURLToPath)("file://" + (typeof __dirname9 !== "undefined" ? require("path").join(__dirname9, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname9 = (0, import_path20.dirname)(__filename9);
var execAsync3 = (0, import_util3.promisify)(import_child_process4.exec);
function validateFilePath2(filePath, allowedDirs = []) {
  try {
    if (!filePath || typeof filePath !== "string") {
      return { valid: false, resolvedPath: filePath, error: "Invalid file path" };
    }
    const normalizedPath = filePath.startsWith("~") ? (0, import_path20.join)(import_os13.default.homedir(), filePath.slice(1)) : filePath;
    const resolvedPath = (0, import_path20.resolve)(normalizedPath);
    const homeDir = import_os13.default.homedir();
    const defaultAllowedDirs = [
      homeDir,
      homeDir + "/.openclaw",
      homeDir + "/.openclaw/agents",
      "/tmp"
    ];
    const allAllowedDirs = [...defaultAllowedDirs, ...allowedDirs];
    const isAllowed = allAllowedDirs.some((allowedDir) => {
      const resolvedAllowed = (0, import_path20.resolve)(allowedDir);
      return resolvedPath.startsWith(resolvedAllowed + "/") || resolvedPath === resolvedAllowed;
    });
    if (!isAllowed) {
      return { valid: false, resolvedPath, error: "Path not in allowed directories" };
    }
    return { valid: true, resolvedPath };
  } catch (err) {
    return { valid: false, resolvedPath: filePath, error: err.message };
  }
}
var DEFAULT_REFRESH_INTERVAL = config_default.REFRESH_INTERVALS.DEFAULT;
var HISTORY_LENGTH = config_default.HISTORY.LENGTH;
var NETWORK_HISTORY_LENGTH = config_default.HISTORY.NETWORK_LENGTH;
var SETTINGS_PATH3 = config_default.PATHS.SETTINGS;
var DEFAULT_SETTINGS2 = config_default.DEFAULT_SETTINGS;
var ACTIVE_REFRESH_INTERVAL = config_default.REFRESH_INTERVALS.ACTIVE;
var IDLE_REFRESH_INTERVAL = config_default.REFRESH_INTERVALS.IDLE;
var IDLE_THRESHOLD_MS2 = config_default.IDLE_THRESHOLD_MS;
var cliOptions = parseCliArgs();
if (cliOptions.help) {
  showHelp();
  process.exit(0);
} else if (cliOptions.version) {
  showVersion();
  process.exit(0);
}
function loadSettings2() {
  try {
    const pathValidation = validateFilePath2(SETTINGS_PATH3);
    if (!pathValidation.valid) {
      logger_default.warn(`Settings path validation failed: ${pathValidation.error}`);
      return validation_default.getDefaultSettings();
    }
    const data = import_fs22.default.readFileSync(pathValidation.resolvedPath, "utf8");
    const loaded = JSON.parse(data);
    const validationResult = validation_default.validateSettings(loaded);
    return validationResult.valid ? validationResult.value : validation_default.getDefaultSettings();
  } catch {
    return validation_default.getDefaultSettings();
  }
}
function saveSettings3(settings) {
  try {
    const pathValidation = validateFilePath2(SETTINGS_PATH3);
    if (!pathValidation.valid) {
      logger_default.warn(`Settings path validation failed: ${pathValidation.error}`);
      return;
    }
    const dir = config_default.PATHS.OPENCLAW_DIR;
    if (!import_fs22.default.existsSync(dir)) import_fs22.default.mkdirSync(dir, { recursive: true });
    import_fs22.default.writeFileSync(pathValidation.resolvedPath, JSON.stringify(settings, null, 2));
    setSecurePermissionsSync(pathValidation.resolvedPath);
  } catch (err) {
    logger_default.error(`Failed to save settings: ${err.message}`);
  }
}
var C = {
  green: "green",
  brightGreen: "bright-green",
  yellow: "yellow",
  brightYellow: "bright-yellow",
  red: "red",
  brightRed: "bright-red",
  cyan: "cyan",
  brightCyan: "bright-cyan",
  magenta: "magenta",
  brightMagenta: "bright-magenta",
  blue: "blue",
  brightBlue: "bright-blue",
  white: "white",
  brightWhite: "bright-white",
  gray: "gray",
  black: "black"
};
var LOG_COLORS = {
  error: C.brightRed,
  fatal: C.brightRed,
  critical: C.brightRed,
  warn: C.brightYellow,
  warning: C.brightYellow,
  info: C.cyan,
  debug: C.gray,
  trace: C.gray,
  verbose: C.gray
};
function toTagColor(color) {
  return color.replace(/([A-Z])/g, "-$1").toLowerCase();
}
function colorizeLogLine(line) {
  if (!line || typeof line !== "string") return line;
  let matchedLevel = null;
  let levelStart = -1;
  let levelEnd = -1;
  for (const level of ["error", "warn", "info", "debug"]) {
    const escapedLevel = level.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\[${escapedLevel.toUpperCase()}\\]`, "i");
    const match = line.match(pattern);
    if (match) {
      matchedLevel = level;
      levelStart = match.index;
      levelEnd = levelStart + match[0].length;
      break;
    }
  }
  if (!matchedLevel) {
    const isoPattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)\s+(\w+)/i;
    const match = line.match(isoPattern);
    if (match) {
      const levelFromTimestamp = match[2].toLowerCase();
      if (["error", "warn", "info", "debug"].includes(levelFromTimestamp)) {
        matchedLevel = levelFromTimestamp;
        levelStart = match[1].length + 1;
        levelEnd = levelStart + matchedLevel.length;
      }
    }
  }
  if (!matchedLevel) {
    return "{gray-fg}" + line + "{/gray-fg}";
  }
  const color = LOG_COLORS[matchedLevel] || "gray";
  const tagColor = toTagColor(color);
  const before = line.substring(0, levelStart);
  const levelStr = line.substring(levelStart, levelEnd);
  const after = line.substring(levelEnd);
  return "{" + tagColor + "-fg}" + before + "{/" + tagColor + "-fg}{white-fg}" + levelStr + "{/white-fg}{" + tagColor + "-fg}" + after + "{/" + tagColor + "-fg}";
}
function getLogFilterFn2(filter) {
  if (filter === "all") return () => true;
  const levelPriorities = { error: 4, warn: 3, info: 2, debug: 1 };
  const filterPriority = levelPriorities[filter] || 0;
  const exactMatchOnly = filter === "debug";
  return (line) => {
    if (!line) return false;
    const upper = line.toUpperCase();
    let linePriority = 0;
    for (const [level, priority] of Object.entries(levelPriorities)) {
      if (upper.includes("[" + level.toUpperCase() + "]") || upper.includes(level.toUpperCase() + ":") || upper.includes("-" + level.toUpperCase() + "-")) {
        linePriority = Math.max(linePriority, priority);
      }
    }
    if (linePriority === 0) return filterPriority <= 1;
    if (exactMatchOnly) {
      return linePriority === filterPriority;
    }
    return linePriority >= filterPriority;
  };
}
function calculateWrappedLines(text, width) {
  if (!text || width <= 0) return 1;
  const words = text.split(" ");
  let lines = 1;
  let currentLineLength = 0;
  for (const word of words) {
    if (currentLineLength + word.length + 1 > width) {
      lines++;
      currentLineLength = word.length;
    } else {
      currentLineLength += word.length + 1;
    }
  }
  return lines;
}
var ASCII_LOGO = [
  "   \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557      \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557    \u2588\u2588\u2557   ",
  "  \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551    \u2588\u2588\u2551   ",
  "  \u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2551 \u2588\u2557 \u2588\u2588\u2551   ",
  "  \u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551\u2588\u2588\u2588\u2557\u2588\u2588\u2551   ",
  "  \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2554\u2588\u2588\u2588\u2554\u255D   ",
  "   \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u255D\u255A\u2550\u2550\u255D    "
];
function getColor(percent) {
  if (percent >= 80) return C.red;
  if (percent >= 60) return C.yellow;
  return C.green;
}
function formatBitsPerSecond(bytesPerSec) {
  const bitsPerSec = bytesPerSec * 8;
  if (bitsPerSec === 0) return "0";
  if (bitsPerSec < 1e3) return Math.round(bitsPerSec) + "b";
  if (bitsPerSec < 1e6) return (bitsPerSec / 1e3).toFixed(0) + "K";
  return (bitsPerSec / 1e6).toFixed(1) + "M";
}
async function getLatestVersion() {
  try {
    return await new Promise((resolve9) => {
      import_https2.default.get("https://api.github.com/repos/openclaw/openclaw/releases/latest", {
        headers: { "User-Agent": "claw-dashboard" }
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
          try {
            resolve9(JSON.parse(data).tag_name?.replace(/^v/, ""));
          } catch {
            resolve9(null);
          }
        });
      }).on("error", () => resolve9(null)).setTimeout(3e3);
    });
  } catch {
    return null;
  }
}
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "--";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const mins = Math.floor(seconds % 3600 / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
async function getGatewayUptime() {
  try {
    const { stdout: launchctlOut } = await execAsync3("launchctl list | grep gateway 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.LAUNCHCTL });
    const pidMatch = launchctlOut.trim().match(/^(\d+)\s/);
    if (!pidMatch) return null;
    const pid = pidMatch[1];
    const { stdout: psOut } = await execAsync3(`ps -o lstart= -p ${pid} 2>/dev/null`, { timeout: config_default.COMMAND_TIMEOUTS.LAUNCHCTL });
    const startTime = new Date(psOut.trim());
    if (isNaN(startTime.getTime())) return null;
    return Math.floor((Date.now() - startTime.getTime()) / 1e3);
  } catch {
    return null;
  }
}
async function getMacGPU() {
  let model = null, utilization = null, frequency = null;
  try {
    const { stdout } = await execAsync3("system_profiler SPDisplaysDataType -json 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.SYSTEM_PROFILER });
    const data = JSON.parse(stdout);
    const displays = data?.SPDisplaysDataType;
    if (displays?.length > 0) {
      model = displays[0].sppci_model || displays[0]._name;
      if (displays[0].spdisplays_utilization) utilization = parseFloat(displays[0].spdisplays_utilization);
    }
  } catch {
  }
  try {
    const { stdout } = await execAsync3('ioreg -l -w 0 2>/dev/null | grep -E "(AGX|G14G|G13G|G15G)" | head -5', { timeout: config_default.COMMAND_TIMEOUTS.IOREG });
    if (stdout.includes("AGX") && !model) {
      if (stdout.includes("G15G") || stdout.includes("G16G")) model = "Apple M3 GPU";
      else if (stdout.includes("G14G")) model = "Apple M2 GPU";
      else if (stdout.includes("G13G")) model = "Apple M1 GPU";
      else model = "Apple Silicon GPU";
    }
  } catch {
  }
  try {
    const { stdout } = await execAsync3('powermetrics --samplers gpu_power -n 1 -i 50 2>&1 | grep -E "(GPU active|GPU frequency)" | head -5', { timeout: config_default.COMMAND_TIMEOUTS.POWERMETRICS });
    const utilMatch = stdout.match(/GPU active residency:\s+(\d+\.?\d*)%/);
    const freqMatch = stdout.match(/GPU frequency:\s+(\d+)\s*MHz/);
    if (utilMatch) utilization = parseFloat(utilMatch[1]);
    if (freqMatch) frequency = parseInt(freqMatch[1]);
  } catch {
  }
  if (!model) {
    try {
      const graphics = await cache_default.getGpuData();
      if (graphics.controllers?.[0]) model = graphics.controllers[0].model;
    } catch {
    }
  }
  if (model) {
    return {
      model: model.trim(),
      short: model.replace(/Apple /, "").substring(0, 16),
      utilization,
      frequency
    };
  }
  return null;
}
function getPlatform() {
  return import_os13.default.platform();
}
async function getLinuxGPU() {
  const containerEnv = await container_detector_default.detectContainerEnv();
  if (containerEnv.isWSL && containerEnv.wslVersion === 2) {
    const wsl2Gpu = await getWSL2GPU();
    if (wsl2Gpu) {
      return wsl2Gpu;
    }
  }
  let model = null, utilization = null, memoryUsed = null, memoryTotal = null, temperature = null;
  try {
    const { stdout: nvidiaOut } = await execAsync3("nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.NVIDIA_SMI });
    if (nvidiaOut && nvidiaOut.trim()) {
      const parts = nvidiaOut.trim().split(",").map((s) => s.trim());
      model = parts[0] || null;
      utilization = parts[1] ? parseFloat(parts[1]) : null;
      memoryUsed = parts[2] ? parseFloat(parts[2]) : null;
      memoryTotal = parts[3] ? parseFloat(parts[3]) : null;
      temperature = parts[4] ? parseFloat(parts[4]) : null;
    }
  } catch {
  }
  if (!model) {
    try {
      const { stdout: lspciOut } = await execAsync3('lspci -vmm 2>/dev/null | grep -E "VGA|Display" | head -10', { timeout: config_default.COMMAND_TIMEOUTS.LSPCI });
      if (lspciOut) {
        const modelMatch = lspciOut.match(/Device:\s+(.+)/i) || lspciOut.match(/VGA.*?:\s*(.+)/i);
        if (modelMatch) model = modelMatch[1].trim();
      }
    } catch {
    }
    if (model && (model.toLowerCase().includes("amd") || model.toLowerCase().includes("radeon"))) {
      try {
        const { stdout: radeonOut } = await execAsync3("radeontop -d - -l 1 2>/dev/null | head -5", { timeout: config_default.COMMAND_TIMEOUTS.RADEONTOP });
        if (radeonOut) {
          const gpuMatch = radeonOut.match(/gpu\s+(\d+\.?\d*)/i);
          if (gpuMatch) utilization = parseFloat(gpuMatch[1]);
        }
      } catch {
      }
    }
  }
  if (!model) {
    try {
      const graphics = await cache_default.getGpuData();
      if (graphics?.controllers?.[0]) {
        model = graphics.controllers[0].model;
        utilization = graphics.controllers[0].utilization || null;
      }
    } catch {
    }
  }
  if (model) {
    return {
      model: model.trim(),
      short: model.replace(/NVIDIA|AMD|Radeon/gi, "").trim().substring(0, 16),
      utilization,
      memoryUsed,
      memoryTotal,
      temperature
    };
  }
  return null;
}
async function getWSL2GPU() {
  let model = null, utilization = null, memoryUsed = null, memoryTotal = null, temperature = null;
  try {
    const { stdout: nvidiaOut } = await execAsync3(
      "/mnt/c/Windows/System32/nvidia-smi.exe --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null || nvidia-smi.exe --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null || /c/Windows/System32/nvidia-smi.exe --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null",
      { timeout: config_default.COMMAND_TIMEOUTS.WSL_SMI }
    );
    if (nvidiaOut && nvidiaOut.trim()) {
      const parts = nvidiaOut.trim().split(",").map((s) => s.trim());
      model = parts[0] || null;
      utilization = parts[1] ? parseFloat(parts[1]) : null;
      memoryUsed = parts[2] ? parseFloat(parts[2]) : null;
      memoryTotal = parts[3] ? parseFloat(parts[3]) : null;
      temperature = parts[4] ? parseFloat(parts[4]) : null;
    }
  } catch {
  }
  if (!model) {
    try {
      const { stdout: psOut } = await execAsync3(
        '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -Command "Get-CimInstance Win32_VideoController | Select-Object -First 1 Name, AdapterRAM | ConvertTo-Json" 2>/dev/null || powershell.exe -Command "Get-CimInstance Win32_VideoController | Select-Object -First 1 Name, AdapterRAM | ConvertTo-Json" 2>/dev/null',
        { timeout: config_default.COMMAND_TIMEOUTS.POWERSHELL }
      );
      if (psOut && psOut.trim()) {
        const data = JSON.parse(psOut);
        if (data.Name) {
          model = data.Name;
        }
        if (data.AdapterRAM) {
          memoryTotal = Math.round(data.AdapterRAM / 1024 ** 3);
        }
      }
    } catch {
    }
  }
  if (!model) {
    try {
      const { stdout: wslOut } = await execAsync3(
        "wsl.exe -e nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null",
        { timeout: config_default.COMMAND_TIMEOUTS.WSL_SMI }
      );
      if (wslOut && wslOut.trim()) {
        const parts = wslOut.trim().split(",").map((s) => s.trim());
        model = parts[0] || null;
        utilization = parts[1] ? parseFloat(parts[1]) : null;
        memoryUsed = parts[2] ? parseFloat(parts[2]) : null;
        memoryTotal = parts[3] ? parseFloat(parts[3]) : null;
        temperature = parts[4] ? parseFloat(parts[4]) : null;
      }
    } catch {
    }
  }
  if (!model) {
    try {
      const { stdout: linuxOut } = await execAsync3(
        "nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null",
        { timeout: config_default.COMMAND_TIMEOUTS.NVIDIA_SMI }
      );
      if (linuxOut && linuxOut.trim()) {
        const parts = linuxOut.trim().split(",").map((s) => s.trim());
        model = parts[0] || null;
        utilization = parts[1] ? parseFloat(parts[1]) : null;
        memoryUsed = parts[2] ? parseFloat(parts[2]) : null;
        memoryTotal = parts[3] ? parseFloat(parts[3]) : null;
        temperature = parts[4] ? parseFloat(parts[4]) : null;
      }
    } catch {
    }
  }
  if (!model) {
    try {
      const graphics = await cache_default.getGpuData();
      if (graphics?.controllers?.[0]) {
        model = graphics.controllers[0].model;
        utilization = graphics.controllers[0].utilization || null;
        memoryTotal = graphics.controllers[0].memoryTotal || null;
        memoryUsed = graphics.controllers[0].memoryUsed || null;
        temperature = graphics.controllers[0].temperature || null;
      }
    } catch {
    }
  }
  if (model) {
    return {
      model: model.trim(),
      short: model.replace(/NVIDIA|AMD|Radeon/gi, "").trim().substring(0, 16),
      utilization,
      memoryUsed,
      memoryTotal,
      temperature,
      source: "wsl2"
    };
  }
  return null;
}
async function getWindowsGPU() {
  let model = null, utilization = null, memoryUsed = null, memoryTotal = null, temperature = null;
  try {
    const { stdout: wmiOut } = await execAsync3(
      'powershell -Command "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, VideoProcessor | ConvertTo-Json"',
      { timeout: config_default.COMMAND_TIMEOUTS.POWERSHELL }
    );
    if (wmiOut && wmiOut.trim()) {
      const data = JSON.parse(wmiOut);
      const gpu = Array.isArray(data) ? data[0] : data;
      if (gpu) {
        model = gpu.Name || null;
        if (gpu.AdapterRAM) {
          memoryTotal = Math.round(gpu.AdapterRAM / 1024 ** 3);
        }
      }
    }
  } catch {
  }
  try {
    const { stdout: perfOut } = await execAsync3(
      `powershell -Command "Get-Counter '\\GPU Engine(*)\\Utilization Percentage' -ErrorAction SilentlyContinue | Select-Object -First 1 | ConvertTo-Json"`,
      { timeout: config_default.COMMAND_TIMEOUTS.POWERSHELL }
    );
    if (perfOut && perfOut.trim()) {
      const perfData = JSON.parse(perfOut);
      if (perfData?.CounterSamples?.[0]?.CookedValue) {
        utilization = Math.round(parseFloat(perfData.CounterSamples[0].CookedValue));
      }
    }
  } catch {
  }
  if (!utilization && model?.toLowerCase().includes("nvidia")) {
    try {
      const { stdout: nvidiaWmi } = await execAsync3(
        'powershell -Command "Get-CimInstance -Namespace root\\CIMV2\\NV\\ -ClassName gpu | Select-Object name, gpuUtilization, memoryTotal, memoryFree, temperature | ConvertTo-Json" 2>$null',
        { timeout: config_default.COMMAND_TIMEOUTS.NVIDIA_SMI }
      );
      if (nvidiaWmi && nvidiaWmi.trim()) {
        const nvData = JSON.parse(nvidiaWmi);
        const gpu = Array.isArray(nvData) ? nvData[0] : nvData;
        if (gpu) {
          if (gpu.gpuUtilization !== void 0) utilization = parseInt(gpu.gpuUtilization);
          if (gpu.temperature !== void 0) temperature = parseInt(gpu.temperature);
          if (gpu.memoryTotal && gpu.memoryFree) {
            const totalMB = parseInt(gpu.memoryTotal);
            const freeMB = parseInt(gpu.memoryFree);
            memoryTotal = Math.round(totalMB / 1024);
            memoryUsed = Math.round((totalMB - freeMB) / 1024);
          }
        }
      }
    } catch {
    }
  }
  if (!utilization && model?.toLowerCase().includes("nvidia")) {
    try {
      const { stdout: nvidiaOut } = await execAsync3(
        "nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>nul",
        { timeout: config_default.COMMAND_TIMEOUTS.NVIDIA_SMI }
      );
      if (nvidiaOut && nvidiaOut.trim()) {
        const parts = nvidiaOut.trim().split(",").map((s) => s.trim());
        model = parts[0] || model;
        utilization = parts[1] ? parseFloat(parts[1]) : null;
        memoryUsed = parts[2] ? parseFloat(parts[2]) : null;
        memoryTotal = parts[3] ? parseFloat(parts[3]) : null;
        temperature = parts[4] ? parseFloat(parts[4]) : null;
      }
    } catch {
    }
  }
  if (!model) {
    try {
      const graphics = await cache_default.getGpuData();
      if (graphics?.controllers?.[0]) {
        model = graphics.controllers[0].model;
        utilization = graphics.controllers[0].utilization || null;
      }
    } catch {
    }
  }
  if (model) {
    return {
      model: model.trim(),
      short: model.replace(/NVIDIA|AMD|Radeon|Intel/gi, "").trim().substring(0, 16),
      utilization,
      memoryUsed,
      memoryTotal,
      temperature
    };
  }
  return null;
}
function calcTPS(session, prevSession, elapsedMs) {
  if (!session || !prevSession || elapsedMs < 100) return null;
  const currTokens = session.totalTokens || 0;
  const prevTokens = prevSession.totalTokens || 0;
  const diff = currTokens - prevTokens;
  if (diff <= 0) return null;
  const tps = diff / (elapsedMs / 1e3);
  return tps > 0 ? parseFloat(tps.toFixed(1)) : null;
}
var Dashboard = class {
  constructor() {
    this.settings = loadSettings2();
    loadTheme();
    this.themeWatcher = startAutoThemeDetection();
    this.autoSaveManager = new AutoSaveManager({
      enabled: this.settings.autoSave?.enabled ?? true,
      intervalMs: this.settings.autoSave?.intervalMs ?? 3e4,
      statePath: config_default.PATHS.STATE,
      getState: () => this.getDashboardState(),
      getSettings: () => this.settings,
      saveSettings: (settings) => saveSettings3(settings)
    });
    this.exportScheduler = new ExportScheduler({
      enabled: this.settings.exportSchedule?.enabled ?? false,
      format: this.settings.exportSchedule?.format ?? "json",
      schedule: this.settings.exportSchedule?.schedule ?? "0 * * * *",
      retentionDays: this.settings.exportSchedule?.retentionDays ?? 30,
      directory: this.settings.exportSchedule?.directory,
      includeMetrics: this.settings.exportSchedule?.includeMetrics ?? true
    });
    this.exportScheduler.setMetricsCallback(() => this.getCurrentMetrics());
    this.errorBoundaryManager = new ErrorBoundaryManager();
    this.widgetErrorState = /* @__PURE__ */ new Map();
    const savedState = loadDashboardState(config_default.PATHS.STATE);
    if (savedState) {
      restoreDashboardState(savedState, this);
    }
    this.unsubscribeThemeChange = onThemeChange(() => {
      this.render();
    });
    this.screen = import_blessed7.default.screen({ smartCSR: true, title: "Claw Dashboard", mouse: true });
    this.diffRenderer = new DifferentialRenderer(this.screen);
    this.selectedSessionIndex = 0;
    this.paginationOffset = 0;
    this.sessionSearchQuery = this.settings.sessionSearchQuery || "";
    this.isSearchMode = false;
    this.filteredSessions = [];
    this.focusedWidgetIndex = 0;
    this.focusableWidgets = [];
    if (this.sessionSearchQuery) {
      this.isSearchMode = true;
      this.filterSessions();
    }
    this.showFavoritesOnly = this.settings.showFavoritesOnly || false;
    this.history = { cpu: new Array(HISTORY_LENGTH).fill(0), memory: new Array(HISTORY_LENGTH).fill(0), netRx: new Array(NETWORK_HISTORY_LENGTH).fill(0), netTx: new Array(NETWORK_HISTORY_LENGTH).fill(0) };
    this.data = { cpu: [], memory: {}, openclaw: null, gpu: null, network: null, sessions: [], agents: [], version: null, latest: null, sessionTPS: {}, sessionLastTPS: {} };
    this.dataTimestamps = { cpu: null, memory: null, gpu: null, network: null, disk: null, system: null, sessions: null };
    this.prev = null;
    this.lastTime = Date.now();
    this.logLines = [];
    this.isPaused = false;
    this.corruptedSessionsCount = 0;
    this.corruptedSessionsWarningShown = false;
    this.focusableWidgets = [];
    this.focusedWidgetIndex = -1;
    this.isWidgetArrangeMode = false;
    this.arrangeWidgetIndex = -1;
    this.init();
    this.currentRefreshInterval = this.settings.refreshInterval;
    this.lastActivityTime = Date.now();
    this.activeAgentCount = 0;
    if (this.settings.theme === "auto") {
      this.startThemeWatcher();
    }
    process.stdout.on("error", (err) => {
      if (err.code === "EPIPE") {
        return;
      }
    });
    process.on("uncaughtException", (err) => {
      if (err.code === "EPIPE" || err.message?.includes("EPIPE") || err.message?.includes("write")) {
        process.exit(0);
      }
      throw err;
    });
    this.lastTerminalWidth = process.stdout.columns || 80;
    this.lastTerminalHeight = process.stdout.rows || 24;
    this.resizeTimeout = null;
    this.isModalActive = false;
    this.terminalTooSmall = false;
    this._settingsClosing = false;
    this._commandPaletteClosing = false;
    const originalToggleSettings = this.toggleSettings.bind(this);
    this.toggleSettings = (...args) => {
      const wasModal = this.w.settingsBox || this.w.detailBox || this.w.searchBox || this.w.helpBox;
      originalToggleSettings(...args);
      const isModal = this.w.settingsBox || this.w.detailBox || this.w.searchBox || this.w.helpBox;
      this.isModalActive = !!isModal;
    };
    const originalToggleHelp = this.toggleHelp.bind(this);
    this.toggleHelp = (...args) => {
      originalToggleHelp(...args);
      this.isModalActive = !!this.w.helpBox;
    };
    if (this.toggleSearch) {
      const originalToggleSearch = this.toggleSearch.bind(this);
      this.toggleSearch = (...args) => {
        originalToggleSearch(...args);
        this.isModalActive = !!this.w.searchBox;
      };
    }
    if (this.showDetail) {
      const originalShowDetail = this.showDetail.bind(this);
      this.showDetail = (...args) => {
        originalShowDetail(...args);
        this.isModalActive = !!this.w.detailBox;
      };
    }
    this.debouncedResize = cacheDebounce(() => {
      this.handleResize();
    }, 100);
    this.screen.on("resize", this.debouncedResize);
    process.stdout.on("resize", this.debouncedResize);
    this.configWatcher = null;
    this.pluginReloadManager = null;
  }
  handleResize() {
    const newWidth = this.screen.width || process.stdout.columns || 80;
    const newHeight = this.screen.height || process.stdout.rows || 24;
    if (newWidth === this.lastTerminalWidth && newHeight === this.lastTerminalHeight) {
      return;
    }
    this.lastTerminalWidth = newWidth;
    this.lastTerminalHeight = newHeight;
    const MIN_COLS = 80;
    const MIN_ROWS = 24;
    if (newWidth < MIN_COLS || newHeight < MIN_ROWS) {
      this.terminalTooSmall = true;
      this.showTerminalSizeWarning(newWidth, newHeight);
    } else {
      this.terminalTooSmall = false;
      this.hideTerminalSizeWarning();
    }
    if (this.isModalActive) {
      return;
    }
    try {
      this.screen.render();
    } catch (err) {
      if (err.code === "EPIPE" || err.message?.includes("write")) {
        return;
      }
      throw err;
    }
  }
  showTerminalSizeWarning(width, height) {
    if (this.w.terminalSizeWarning) {
      this.w.terminalSizeWarning.destroy();
      delete this.w.terminalSizeWarning;
    }
    const MIN_COLS = 80;
    const MIN_ROWS = 24;
    this.w.terminalSizeWarning = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 50,
      height: 7,
      border: { type: "line" },
      label: " Terminal Too Small ",
      style: {
        border: { fg: "red" },
        bg: "black"
      }
    });
    const warningText = import_blessed7.default.text({
      parent: this.w.terminalSizeWarning,
      top: 1,
      left: "center",
      width: "90%",
      content: `Terminal is ${width}x${height}.
Minimum required: ${MIN_COLS}x${MIN_ROWS}.
Please resize your terminal.`,
      style: { fg: "yellow", bold: true },
      align: "center"
    });
    try {
      this.screen.render();
    } catch (err) {
    }
  }
  hideTerminalSizeWarning() {
    if (this.w.terminalSizeWarning) {
      this.w.terminalSizeWarning.destroy();
      delete this.w.terminalSizeWarning;
      try {
        this.screen.render();
      } catch (err) {
      }
    }
  }
  // Get currently visible widget status for lazy loading
  getVisibleWidgets() {
    return {
      cpu: this.settings.showWidget1 !== false,
      // default true if undefined
      memory: this.settings.showWidget2 !== false,
      gpu: this.settings.showWidget3 !== false,
      network: this.settings.showWidget4 !== false,
      disk: this.settings.showWidget5 !== false,
      system: this.settings.showWidget6 !== false,
      uptime: this.settings.showWidget7 !== false,
      health: this.settings.showWidget8 !== false,
      gateway: this.settings.showWidget9 !== false
    };
  }
  // Track which widgets need a data refresh (newly visible)
  getNewlyVisibleWidgets() {
    const currentlyVisible = this.getVisibleWidgets();
    const previouslyVisible = this._previousVisibleState || currentlyVisible;
    this._previousVisibleState = { ...currentlyVisible };
    const newlyVisible = {};
    for (const [widget, isVisible] of Object.entries(currentlyVisible)) {
      newlyVisible[widget] = isVisible && !previouslyVisible[widget];
    }
    return newlyVisible;
  }
  /**
   * Check if a widget should update based on its refresh interval and worker pool degradation
   * @param {string} widgetName - Widget name (cpu, memory, gpu, network, disk, system, uptime)
   * @param {number} currentTime - Current timestamp (optional, defaults to Date.now())
   * @returns {Object} Result with { shouldUpdate: boolean, reason: string }
   */
  shouldWidgetUpdate(widgetName, currentTime = Date.now()) {
    const state = this.widgetRefreshState[widgetName];
    if (!state) {
      return { shouldUpdate: true, reason: "no_state" };
    }
    const workerStatus = worker_pool_default.getStatus();
    const degradationLevel = workerStatus.degradation?.level || "none";
    const criticalWidgets = config_default.WIDGET_DEGRADATION?.CRITICAL_WIDGETS || ["cpu", "memory"];
    if (criticalWidgets.includes(widgetName)) {
      const interval = state.customInterval || state.defaultInterval || this.settings.refreshInterval;
      const timeSinceLastUpdate2 = currentTime - state.lastUpdate;
      if (timeSinceLastUpdate2 >= interval) {
        return { shouldUpdate: true, reason: "critical_widget" };
      }
      return { shouldUpdate: false, reason: "interval_not_elapsed" };
    }
    if (degradationLevel === "critical") {
      state.skipCount++;
      return { shouldUpdate: false, reason: "degradation_critical_skip" };
    }
    const baseInterval = state.customInterval || state.defaultInterval || this.settings.refreshInterval;
    let effectiveInterval = baseInterval;
    if (degradationLevel === "warning") {
      const multiplier = config_default.WIDGET_DEGRADATION?.WARNING?.EXTEND_INTERVAL_MULTIPLIER || 1.5;
      effectiveInterval = baseInterval * multiplier;
    }
    const timeSinceLastUpdate = currentTime - state.lastUpdate;
    if (timeSinceLastUpdate < effectiveInterval) {
      return { shouldUpdate: false, reason: "interval_not_elapsed" };
    }
    return { shouldUpdate: true, reason: "ok" };
  }
  /**
   * Record that a widget was updated
   * @param {string} widgetName - Widget name
   * @param {number} timestamp - Update timestamp (optional, defaults to Date.now())
   */
  recordWidgetUpdate(widgetName, timestamp = Date.now()) {
    const state = this.widgetRefreshState[widgetName];
    if (state) {
      state.lastUpdate = timestamp;
      state.updateCount++;
    }
  }
  /**
   * Set custom refresh interval for a widget
   * @param {string} widgetName - Widget name
   * @param {number|null} interval - Custom interval in ms, or null to use default
   */
  setWidgetRefreshInterval(widgetName, interval) {
    const state = this.widgetRefreshState[widgetName];
    if (state) {
      const minInterval = config_default.WIDGET_REFRESH_VALIDATION?.MIN_INTERVAL || 500;
      const maxInterval = config_default.WIDGET_REFRESH_VALIDATION?.MAX_INTERVAL || 6e4;
      if (interval !== null && (interval < minInterval || interval > maxInterval)) {
        throw new Error(`Invalid refresh interval: ${interval}. Must be between ${minInterval} and ${maxInterval}ms`);
      }
      state.customInterval = interval;
      logger_default.info(`Widget '${widgetName}' refresh interval set to ${interval}ms`);
    }
  }
  /**
   * Get widget refresh statistics
   * @param {string} widgetName - Widget name (optional, if omitted returns all widgets)
   * @returns {Object} Widget refresh statistics
   */
  getWidgetRefreshStats(widgetName) {
    if (widgetName) {
      const state = this.widgetRefreshState[widgetName];
      if (!state) return null;
      const workerStatus2 = worker_pool_default.getStatus();
      return {
        ...state,
        degradationLevel: workerStatus2.degradation?.level || "none"
      };
    }
    const stats = {};
    const workerStatus = worker_pool_default.getStatus();
    for (const [name, state] of Object.entries(this.widgetRefreshState)) {
      stats[name] = {
        ...state,
        degradationLevel: workerStatus.degradation?.level || "none"
      };
    }
    return stats;
  }
  /**
   * Get current dashboard state for auto-save
   * @returns {Object} Dashboard state snapshot
   */
  getDashboardState() {
    return {
      selectedSessionIndex: this.selectedSessionIndex,
      paginationOffset: this.paginationOffset,
      sessionSearchQuery: this.sessionSearchQuery,
      isSearchMode: this.isSearchMode,
      showFavoritesOnly: this.showFavoritesOnly,
      focusedWidgetIndex: this.focusedWidgetIndex,
      currentRefreshInterval: this.currentRefreshInterval
    };
  }
  /**
   * Save settings and mark auto-save as dirty
   * @param {Object} settings - Settings to save
   */
  saveSettingsAndMarkDirty(settings) {
    saveSettings3(settings);
    if (this.autoSaveManager) {
      this.autoSaveManager.markDirty();
    }
  }
  async init() {
    this.createWidgets();
    await showSplashScreen(this.screen);
    await showFirstRunHints(this.screen, this.settings, saveSettings3);
    this.setupKeys();
    this.setupMouse();
    this.focusableWidgets = this.buildFocusableWidgets();
    this.focusedWidgetIndex = 0;
    this.applyFocusIndicator();
    this.fetchVersion();
    const theme = getCurrentTheme();
    this.settings.theme = theme.name.toLowerCase().replace(" ", "-").replace("high-contrast", "high-contrast");
    this.applyTheme();
    setTimeout(() => this.start(), 500);
  }
  async fetchVersion() {
    try {
      const { stdout } = await execAsync3('openclaw --version 2>/dev/null || echo "unknown"', { timeout: config_default.COMMAND_TIMEOUTS.OPENCLAW_VERSION });
      this.data.version = stdout.trim();
      this.data.latest = await getLatestVersion();
    } catch {
      this.data.version = "unknown";
    }
  }
  createWidgets() {
    this.w = {};
    this.widgetRefreshState = {
      cpu: { lastUpdate: 0, updateCount: 0, skipCount: 0, defaultInterval: config_default.WIDGET_REFRESH_INTERVALS.CPU },
      memory: { lastUpdate: 0, updateCount: 0, skipCount: 0, defaultInterval: config_default.WIDGET_REFRESH_INTERVALS.MEMORY },
      gpu: { lastUpdate: 0, updateCount: 0, skipCount: 0, defaultInterval: config_default.WIDGET_REFRESH_INTERVALS.GPU },
      network: { lastUpdate: 0, updateCount: 0, skipCount: 0, defaultInterval: config_default.WIDGET_REFRESH_INTERVALS.NETWORK },
      disk: { lastUpdate: 0, updateCount: 0, skipCount: 0, defaultInterval: config_default.WIDGET_REFRESH_INTERVALS.DISK },
      system: { lastUpdate: 0, updateCount: 0, skipCount: 0, defaultInterval: config_default.WIDGET_REFRESH_INTERVALS.SYSTEM },
      uptime: { lastUpdate: 0, updateCount: 0, skipCount: 0, defaultInterval: config_default.WIDGET_REFRESH_INTERVALS.UPTIME }
    };
    const LOGO_WIDTH = 40;
    this.w.logo = import_blessed7.default.text({ parent: this.screen, top: 2, left: 1, width: LOGO_WIDTH, content: ASCII_LOGO.join("\n"), style: { fg: C.brightCyan, bold: true } });
    this.w.title = import_blessed7.default.text({ parent: this.screen, top: 8, left: 3, content: `Dashboard ${DASHBOARD_VERSION}, openclaw checking...`, style: { fg: C.brightWhite, bold: true } });
    this.w.clock = import_blessed7.default.text({ parent: this.screen, top: 0, left: 0, width: 26, content: "--:--", style: { fg: C.brightCyan, bold: true }, align: "left", tags: true });
    this.createWidgetBoxes();
    this.w.sessBox = import_blessed7.default.box({ parent: this.screen, left: 0, width: "100%", height: 9, border: { type: "line" }, label: " SESSIONS ", style: { border: { fg: C.blue } }, tags: true, overflow: "hidden", scrollable: false });
    this.w.sessHeader = import_blessed7.default.text({ parent: this.w.sessBox, top: 0, left: 1, width: "98%", content: "  STATUS AGENT                                          MODEL           CONTEXT      IDLE    CHAN", style: { fg: C.brightWhite, bold: true }, overflow: "hidden" });
    this.w.sessList = import_blessed7.default.text({ parent: this.w.sessBox, top: 1, left: 1, width: "98%", height: 6, content: "", style: { fg: C.white }, tags: true, overflow: "hidden", scrollable: false });
    this.w.sessCount = import_blessed7.default.text({ parent: this.w.sessBox, top: 0, right: 2, content: "", style: { fg: C.gray } });
    this.w.sessTruncated = import_blessed7.default.text({ parent: this.w.sessBox, top: 7, left: 2, content: "", style: { fg: C.yellow } });
    this.w.logBox = import_blessed7.default.box({ parent: this.screen, left: 0, width: "100%", height: 19, border: { type: "line" }, label: " OPENCLAW LOGS ", style: { border: { fg: C.cyan } }, scrollable: true, alwaysScroll: true });
    this.w.logContent = import_blessed7.default.text({ parent: this.w.logBox, top: 0, left: 1, width: "95%-2", content: "Loading logs...", style: { fg: C.gray }, tags: true });
    this.w.footer = import_blessed7.default.box({ parent: this.screen, bottom: 0, left: 0, width: "100%", height: 1, style: { bg: C.black, fg: C.gray } });
    this.w.footerText = import_blessed7.default.text({ parent: this.w.footer, top: 0, left: "center", content: "", style: { fg: C.gray } });
    this.recalculateLayout();
  }
  // Create the 7 widget boxes (always created, visibility toggled)
  createWidgetBoxes() {
    const boxHeight = 5;
    this.w.cpuBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " CPU ", style: { border: { fg: C.cyan } } });
    this.w.cpuValue = import_blessed7.default.text({ parent: this.w.cpuBox, top: 0, left: "center", content: "0%", style: { fg: C.brightGreen, bold: true } });
    this.w.cpuDetail = import_blessed7.default.text({ parent: this.w.cpuBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.memBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " MEMORY ", style: { border: { fg: C.magenta } } });
    this.w.memValue = import_blessed7.default.text({ parent: this.w.memBox, top: 0, left: "center", content: "0%", style: { fg: C.brightMagenta, bold: true } });
    this.w.memDetail = import_blessed7.default.text({ parent: this.w.memBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.gpuBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " GPU ", style: { border: { fg: C.yellow } } });
    this.w.gpuValue = import_blessed7.default.text({ parent: this.w.gpuBox, top: 0, left: "center", content: "Detecting...", style: { fg: C.brightYellow, bold: true } });
    this.w.gpuDetail = import_blessed7.default.text({ parent: this.w.gpuBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.netBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " NETWORK ", style: { border: { fg: C.brightCyan } } });
    this.w.netValue = import_blessed7.default.text({ parent: this.w.netBox, top: 0, left: "center", content: "Loading...", style: { fg: C.brightCyan, bold: true } });
    this.w.netDetail = import_blessed7.default.text({ parent: this.w.netBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.diskBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " DISK ", style: { border: { fg: C.green } } });
    this.w.diskValue = import_blessed7.default.text({ parent: this.w.diskBox, top: 0, left: "center", content: "0%", style: { fg: C.brightGreen, bold: true } });
    this.w.diskDetail = import_blessed7.default.text({ parent: this.w.diskBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.sysBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " SYSTEM ", style: { border: { fg: C.gray } } });
    this.w.sysInfoLine1 = import_blessed7.default.text({ parent: this.w.sysBox, top: 0, left: "center", content: "...", style: { fg: C.gray } });
    this.w.sysInfoLine2 = import_blessed7.default.text({ parent: this.w.sysBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.uptimeBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " UPTIME ", style: { border: { fg: C.brightMagenta } } });
    this.w.uptimeSys = import_blessed7.default.text({ parent: this.w.uptimeBox, top: 0, left: "center", content: "Sys: --", style: { fg: C.brightMagenta, bold: true } });
    this.w.uptimeClaw = import_blessed7.default.text({ parent: this.w.uptimeBox, top: 1, left: "center", content: "Claw: --", style: { fg: C.brightMagenta, bold: true } });
    this.w.healthBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " DATA HEALTH ", style: { border: { fg: C.green } } });
    this.w.healthStatus = import_blessed7.default.text({ parent: this.w.healthBox, top: 0, left: "center", content: "All Fresh", style: { fg: C.brightGreen, bold: true } });
    this.w.healthDetail = import_blessed7.default.text({ parent: this.w.healthBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.gatewayBox = import_blessed7.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " GATEWAY ", style: { border: { fg: C.cyan } } });
    this.w.gatewayStatus = import_blessed7.default.text({ parent: this.w.gatewayBox, top: 0, left: "center", content: "Checking...", style: { fg: C.brightCyan, bold: true } });
    this.w.gatewayDetail = import_blessed7.default.text({ parent: this.w.gatewayBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
  }
  // Recalculate layout positions - COMPACT DESIGN
  // Widgets flow to the right of logo in header area (rows 0-5)
  // Sessions below at row 7, logs below sessions
  recalculateLayout() {
    const getWidgetHeight = (widgetName) => {
      const sizePreset = this.settings.widgetSizes?.[widgetName] || "medium";
      return WIDGET_SIZES[sizePreset] || WIDGET_SIZES.medium;
    };
    const LOGO_COLS = 42;
    const LOGO_WIDTH_PERCENT = 35;
    const HEADER_ROWS = 10;
    const SESSIONS_HEIGHT = 9;
    const availablePercent = 100 - LOGO_WIDTH_PERCENT;
    const widgets = [
      { name: "cpu", box: this.w.cpuBox, visible: this.settings.showWidget1 },
      { name: "mem", box: this.w.memBox, visible: this.settings.showWidget2 },
      { name: "gpu", box: this.w.gpuBox, visible: this.settings.showWidget3 },
      { name: "net", box: this.w.netBox, visible: this.settings.showWidget4 },
      { name: "disk", box: this.w.diskBox, visible: this.settings.showWidget5 },
      { name: "sys", box: this.w.sysBox, visible: this.settings.showWidget6 },
      { name: "uptime", box: this.w.uptimeBox, visible: this.settings.showWidget7 },
      { name: "health", box: this.w.healthBox, visible: this.settings.showWidget8 },
      { name: "gateway", box: this.w.gatewayBox, visible: this.settings.showWidget9 }
    ];
    widgets.forEach((w) => {
      w.height = getWidgetHeight(w.name);
    });
    const widgetOrder = this.settings.widgetOrder || [];
    if (widgetOrder.length > 0) {
      const orderMap = new Map(widgetOrder.map((id, idx) => [id, idx]));
      widgets.sort((a, b) => {
        const aOrder = orderMap.has(a.name) ? orderMap.get(a.name) : Infinity;
        const bOrder = orderMap.has(b.name) ? orderMap.get(b.name) : Infinity;
        return aOrder - bOrder;
      });
    }
    const pinnedWidgets = this.settings.pinnedWidgets || [];
    const pinned = widgets.filter((w) => w.visible && pinnedWidgets.includes(w.name));
    const unpinned = widgets.filter((w) => w.visible && !pinnedWidgets.includes(w.name));
    const numPinned = pinned.length;
    const numUnpinned = unpinned.length;
    const numVisible = numPinned + numUnpinned;
    if (numVisible === 0) {
      this.w.sessBox.position = { top: HEADER_ROWS };
      this.w.sessBox.height = SESSIONS_HEIGHT;
      const logTop = Math.max(19, HEADER_ROWS + SESSIONS_HEIGHT);
      this.w.logBox.position = { top: logTop };
      this.w.logBox.height = "100%-" + (logTop + 1);
    } else {
      const logoWidthPercent = 35;
      const availablePercent2 = 100 - logoWidthPercent;
      if (numPinned > 0) {
        const pinnedWidthPercent = Math.floor(availablePercent2 / numPinned);
        pinned.forEach((widget, index) => {
          const leftPercent = logoWidthPercent + index * pinnedWidthPercent;
          widget.box.top = 0;
          widget.box.left = leftPercent + "%";
          widget.box.width = pinnedWidthPercent + "%";
          widget.box.height = widget.height;
          widget.box.show();
        });
      }
      if (numUnpinned > 0) {
        const startRow = numPinned > 0 ? 1 : 0;
        let row1Count, row2Count;
        if (startRow === 0) {
          row1Count = Math.ceil(numUnpinned / 2);
          row2Count = numUnpinned - row1Count;
        } else {
          row1Count = numUnpinned;
          row2Count = 0;
        }
        unpinned.forEach((widget, index) => {
          const rowOffset = index < row1Count ? 0 : 1;
          const row = startRow + rowOffset;
          const colInRow = rowOffset === 0 ? index : index - row1Count;
          const widgetsInThisRow = rowOffset === 0 ? row1Count : row2Count;
          const widthPercent = Math.floor(availablePercent2 / widgetsInThisRow);
          const leftPercent = logoWidthPercent + colInRow * widthPercent;
          widget.box.top = row * widget.height;
          widget.box.left = leftPercent + "%";
          widget.box.width = widthPercent + "%";
          widget.box.height = widget.height;
          widget.box.show();
        });
      }
      widgets.filter((w) => !w.visible).forEach((widget) => {
        widget.box.hide();
      });
      const pinnedRowHeight = pinned.length > 0 ? Math.max(...pinned.map((w) => w.height)) : 0;
      const actualHeaderRows = numPinned > 0 ? HEADER_ROWS + pinnedRowHeight : HEADER_ROWS;
      this.w.sessBox.position = { top: actualHeaderRows };
      this.w.sessBox.height = SESSIONS_HEIGHT;
      const logTop = Math.max(19, actualHeaderRows + SESSIONS_HEIGHT);
      this.w.logBox.position = { top: logTop };
      this.w.logBox.height = "100%-" + (logTop + 1);
    }
  }
  setupKeys() {
    this.screen.key(["q", "C-c"], () => {
      if (this.isModalActive) return;
      clearInterval(this.timer);
      this.stopConfigWatcher();
      this.stopPluginWatcher();
      performance_monitor_default.stop();
      if (this.themeWatcher) {
        this.themeWatcher.stop();
      }
      if (this.unsubscribeThemeChange) {
        this.unsubscribeThemeChange();
      }
      if (this.exportScheduler) {
        this.exportScheduler.stop();
      }
      this.screen.destroy();
      process.exit(0);
    });
    this.screen.key("r", () => this.refresh());
    this.screen.key(["?"], () => this.toggleHelp());
    this.screen.key(["s", "S"], () => this.toggleSettings());
    this.screen.key(["P"], () => this.togglePause());
    this.screen.key(["p"], () => this.togglePerformanceOverlay());
    this.screen.key([" "], () => this.togglePause());
    this.screen.key("o", () => this.cycleSessionSort());
    this.screen.key("e", () => this.exportDashboard());
    this.screen.key("E", () => this.cycleExportFormat());
    this.screen.key("C-s", () => this.exportSnapshot());
    this.screen.key("C-o", () => this.importSnapshot());
    this.screen.key("t", () => this.cycleTheme());
    this.screen.key("T", () => this.showThemeSelector());
    this.screen.key("v", () => this.showVersionInfo());
    this.screen.key("G", () => this.retryGatewayConnection());
    this.screen.key("w", () => this.toggleWidgetArrangeMode());
    this.screen.key("X", () => this.retryFailedWidgets());
    this.screen.key("C-k", () => {
      if (this.isModalActive && !this.w.commandPaletteBox) return;
      this.toggleCommandPalette();
    });
    this.screen.key("m", () => {
      if (this.isModalActive) return;
      this.toggleWidgetArrangeMode();
    });
    this.screen.key("escape", () => {
      if (this.isWidgetArrangeMode) {
        this.toggleWidgetArrangeMode();
        return;
      }
      if (this.w.commandPaletteBox) {
        this.closeCommandPalette();
      } else if (this.w.snapshotConfirmBox) {
        this.closeSnapshotConfirmation();
      } else if (this.w.snapshotPickerBox) {
        this.closeSnapshotPicker();
      } else if (this.w.detailBox) {
        this.closeSessionDetail();
      } else if (this.w.settingsBox) {
        this.closeSettings();
      } else if (this.w.helpBox) {
        this.toggleHelp();
      } else if (this.w.searchBox) {
        this.closeSearch();
      }
    });
    this.screen.key("return", () => {
      if (this.isModalActive) return;
      this.showSessionDetail();
    });
    this.screen.key("/", () => {
      if (this.isModalActive) return;
      this.showSearch();
    });
    this.screen.key(["up", "\x1B[A"], () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.isWidgetArrangeMode) {
        this.moveWidget(-1);
        return;
      }
      if (this.selectedSessionIndex > 0) {
        this.selectedSessionIndex--;
        this.render();
      }
    });
    this.screen.key("k", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.selectedSessionIndex > 0) {
        this.selectedSessionIndex--;
        this.render();
      }
    });
    this.screen.key(["down", "\x1B[B"], () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.isWidgetArrangeMode) {
        this.moveWidget(1);
        return;
      }
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const maxDisplay = Math.min(6, allSessions?.length || 0);
      if (this.selectedSessionIndex < maxDisplay - 1) {
        this.selectedSessionIndex++;
        this.render();
      }
    });
    this.screen.key("j", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.isWidgetArrangeMode) {
        this.moveWidget(1);
        return;
      }
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const maxDisplay = Math.min(6, allSessions?.length || 0);
      if (this.selectedSessionIndex < maxDisplay - 1) {
        this.selectedSessionIndex++;
        this.render();
      }
    });
    this.screen.key(["pageup", "["], () => {
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset > 0) {
        this.paginationOffset--;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key("C-b", () => {
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset > 0) {
        this.paginationOffset--;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key(["left", "\x1B[D"], () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset > 0) {
        this.paginationOffset--;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key("h", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset > 0) {
        this.paginationOffset--;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key(["pagedown", "]"], () => {
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset < totalPages - 1) {
        this.paginationOffset++;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key("C-f", () => {
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset < totalPages - 1) {
        this.paginationOffset++;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key("l", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset < totalPages - 1) {
        this.paginationOffset++;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key(["right", "\x1B[C"], () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset < totalPages - 1) {
        this.paginationOffset++;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key("g", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      this.paginationOffset = 0;
      this.selectedSessionIndex = 0;
      this.render();
    });
    this.screen.key("f", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.w.detailBox) return;
      this.toggleFavorite();
    });
    this.screen.key("F", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.w.detailBox) return;
      this.toggleFavoritesFilter();
    });
    this.screen.key("1", () => this.toggleWidget("showWidget1"));
    this.screen.key("2", () => this.toggleWidget("showWidget2"));
    this.screen.key("3", () => this.toggleWidget("showWidget3"));
    this.screen.key("4", () => this.toggleWidget("showWidget4"));
    this.screen.key("5", () => this.toggleWidget("showWidget5"));
    this.screen.key("6", () => this.toggleWidget("showWidget6"));
    this.screen.key("7", () => this.toggleWidget("showWidget7"));
    this.screen.key("8", () => this.toggleWidget("showWidget8"));
    this.screen.key("9", () => this.toggleWidget("showWidget9"));
    this.screen.key("0", () => this.cycleLogLevel());
    this.screen.key("M-1", () => this.togglePinWidget("cpu"));
    this.screen.key("M-2", () => this.togglePinWidget("mem"));
    this.screen.key("M-3", () => this.togglePinWidget("gpu"));
    this.screen.key("M-4", () => this.togglePinWidget("net"));
    this.screen.key("M-5", () => this.togglePinWidget("disk"));
    this.screen.key("M-6", () => this.togglePinWidget("sys"));
    this.screen.key("M-7", () => this.togglePinWidget("uptime"));
    this.screen.key("M-8", () => this.togglePinWidget("health"));
    this.screen.key("M-9", () => this.togglePinWidget("gateway"));
    this.screen.key("!", () => this.togglePinWidget("cpu"));
    this.screen.key("@", () => this.togglePinWidget("mem"));
    this.screen.key("#", () => this.togglePinWidget("gpu"));
    this.screen.key("$", () => this.togglePinWidget("net"));
    this.screen.key("%", () => this.togglePinWidget("disk"));
    this.screen.key("^", () => this.togglePinWidget("sys"));
    this.screen.key("&", () => this.togglePinWidget("uptime"));
    this.screen.key("*", () => this.togglePinWidget("health"));
    this.screen.key("(", () => this.togglePinWidget("gateway"));
    this.screen.key("tab", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.w.detailBox) return;
      this.cycleFocus(1);
    });
    this.screen.key("S-tab", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this._settingsClosing || this.w.settingsList && this.w.settingsList.focused || this._commandPaletteClosing || this.w.commandPaletteBox && this.w.commandPaletteInput && this.w.commandPaletteInput.focused) return;
      if (this.w.detailBox) return;
      this.cycleFocus(-1);
    });
  }
  setupMouse() {
    this.w.sessBox.on("click", (data) => {
      if (this.w.detailBox || this.w.settingsBox) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      if (!allSessions || allSessions.length === 0) return;
      const clickY = data.y - this.w.sessBox.position.top - 1;
      const maxDisplay = Math.min(6, allSessions.length);
      if (clickY >= 0 && clickY < maxDisplay) {
        this.selectedSessionIndex = clickY;
        this.showSessionDetail();
      }
    });
    const widgetBoxes = [
      { box: this.w.cpuBox, key: "showWidget1" },
      { box: this.w.memBox, key: "showWidget2" },
      { box: this.w.gpuBox, key: "showWidget3" },
      { box: this.w.netBox, key: "showWidget4" },
      { box: this.w.diskBox, key: "showWidget5" },
      { box: this.w.sysBox, key: "showWidget6" },
      { box: this.w.uptimeBox, key: "showWidget7" }
    ];
    widgetBoxes.forEach(({ box, key }) => {
      if (box) {
        box.on("click", () => {
          if (this.w.settingsBox) {
            this.toggleWidget(key);
          }
        });
      }
    });
  }
  toggleWidget(settingKey) {
    const wasVisible = this.settings[settingKey];
    this.settings[settingKey] = !wasVisible;
    const isNowVisible = this.settings[settingKey];
    saveSettings3(this.settings);
    if (this.autoSaveManager) {
      this.autoSaveManager.markDirty();
    }
    this.recalculateLayout();
    this.clearFocusIndicator();
    this.focusableWidgets = this.buildFocusableWidgets();
    if (this.focusedWidgetIndex >= this.focusableWidgets.length) {
      this.focusedWidgetIndex = Math.max(0, this.focusableWidgets.length - 1);
    }
    this.applyFocusIndicator();
    if (!wasVisible && isNowVisible) {
      const widgetMap = {
        showWidget1: "cpu",
        showWidget2: "memory",
        showWidget3: "gpu",
        showWidget4: "network",
        showWidget5: "disk",
        showWidget6: "system",
        showWidget7: "uptime",
        showWidget8: "health",
        showWidget9: "gateway"
      };
      const widgetType = widgetMap[settingKey];
      if (widgetType) {
        if (this._previousVisibleState) {
          this._previousVisibleState[widgetType] = false;
        }
        this.refresh();
        return;
      }
    }
    this.screen.render();
  }
  /**
   * Toggle pin status of a widget to the favorites row
   * @param {string} widgetName - Widget name (cpu, mem, gpu, net, disk, sys, uptime, health, gateway)
   */
  togglePinWidget(widgetName) {
    const pinnedWidgets = this.settings.pinnedWidgets || [];
    const isPinned = pinnedWidgets.includes(widgetName);
    if (isPinned) {
      this.settings.pinnedWidgets = pinnedWidgets.filter((w) => w !== widgetName);
      this.showToast(`Unpinned ${widgetName.toUpperCase()} widget`);
    } else {
      if (pinnedWidgets.length >= 4) {
        this.showToast("Maximum 4 widgets can be pinned (use Alt+1-9 to unpin)");
        return;
      }
      this.settings.pinnedWidgets = [...pinnedWidgets, widgetName];
      this.showToast(`Pinned ${widgetName.toUpperCase()} widget to favorites row`);
    }
    saveSettings3(this.settings);
    if (this.autoSaveManager) {
      this.autoSaveManager.markDirty();
    }
    this.recalculateLayout();
    this.screen.render();
  }
  /**
   * Show a temporary toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms (default: 2000)
   */
  showToast(message, duration = 2e3) {
    if (!this.w.footerText) return;
    const originalContent = this.w.footerText.content;
    this.w.footerText.setContent(` {green-fg}${message}{/green-fg}`);
    this.screen.render();
    setTimeout(() => {
      this.w.footerText.setContent(originalContent);
      this.screen.render();
    }, duration);
  }
  /**
   * Build list of focusable widgets based on current visibility
   * Returns array of widget objects with box reference and name
   */
  buildFocusableWidgets() {
    const widgets = [];
    if (this.w.sessBox) {
      widgets.push({ box: this.w.sessBox, name: "sessions", type: "list" });
    }
    const widgetDefs = [
      { box: this.w.cpuBox, name: "cpu", setting: "showWidget1" },
      { box: this.w.memBox, name: "memory", setting: "showWidget2" },
      { box: this.w.gpuBox, name: "gpu", setting: "showWidget3" },
      { box: this.w.netBox, name: "network", setting: "showWidget4" },
      { box: this.w.diskBox, name: "disk", setting: "showWidget5" },
      { box: this.w.sysBox, name: "system", setting: "showWidget6" },
      { box: this.w.uptimeBox, name: "uptime", setting: "showWidget7" },
      { box: this.w.healthBox, name: "health", setting: "showWidget8" },
      { box: this.w.gatewayBox, name: "gateway", setting: "showWidget9" }
    ];
    for (const def of widgetDefs) {
      if (def.box && this.settings[def.setting] !== false) {
        widgets.push({ box: def.box, name: def.name, type: "metric" });
      }
    }
    if (this.w.logBox) {
      widgets.push({ box: this.w.logBox, name: "logs", type: "panel" });
    }
    return widgets;
  }
  /**
   * Get the ordered list of widget IDs for arrangement
   * Uses widgetOrder from settings if available, otherwise uses default order
   */
  getOrderedWidgets() {
    const allWidgets = ["cpu", "mem", "gpu", "net", "disk", "sys", "uptime", "health", "gateway"];
    const widgetOrder = this.settings.widgetOrder || [];
    const visibleWidgets = allWidgets.filter((w) => {
      const settingKey = this.getWidgetSettingKey(w);
      return this.settings[settingKey] !== false;
    });
    const ordered = [];
    const seen = /* @__PURE__ */ new Set();
    for (const widgetId of widgetOrder) {
      if (visibleWidgets.includes(widgetId) && !seen.has(widgetId)) {
        ordered.push(widgetId);
        seen.add(widgetId);
      }
    }
    for (const widgetId of visibleWidgets) {
      if (!seen.has(widgetId)) {
        ordered.push(widgetId);
        seen.add(widgetId);
      }
    }
    return ordered;
  }
  /**
   * Get the setting key for a widget's visibility
   */
  getWidgetSettingKey(widgetId) {
    const mapping = {
      cpu: "showWidget1",
      mem: "showWidget2",
      gpu: "showWidget3",
      net: "showWidget4",
      disk: "showWidget5",
      sys: "showWidget6",
      uptime: "showWidget7",
      health: "showWidget8",
      gateway: "showWidget9"
    };
    return mapping[widgetId] || "";
  }
  /**
   * Toggle widget arrangement mode
   */
  toggleWidgetArrangeMode() {
    this.isWidgetArrangeMode = !this.isWidgetArrangeMode;
    if (this.isWidgetArrangeMode) {
      this.arrangeWidgetIndex = 0;
      this.showToast("Widget Arrangement Mode - Use arrow keys to reorder, ESC to exit", 3e3);
      this.updateArrangeIndicator();
    } else {
      this.clearArrangeIndicator();
      this.saveWidgetOrder();
      this.showToast("Widget order saved", 1500);
    }
    this.screen.render();
  }
  /**
   * Update the visual indicator for widget arrangement mode
   */
  updateArrangeIndicator() {
    const orderedWidgets = this.getOrderedWidgets();
    if (this.arrangeWidgetIndex < 0 || this.arrangeWidgetIndex >= orderedWidgets.length) return;
    const widgetId = orderedWidgets[this.arrangeWidgetIndex];
    const box = this.getWidgetBox(widgetId);
    if (box) {
      if (!box._originalBorderStyle) {
        box._originalBorderStyle = { ...box.style.border };
      }
      box.style.border = { fg: "bright-yellow", bold: true };
    }
  }
  /**
   * Clear the visual indicator for widget arrangement mode
   */
  clearArrangeIndicator() {
    const orderedWidgets = this.getOrderedWidgets();
    for (const widgetId of orderedWidgets) {
      const box = this.getWidgetBox(widgetId);
      if (box && box._originalBorderStyle) {
        box.style.border = box._originalBorderStyle;
        delete box._originalBorderStyle;
      }
    }
  }
  /**
   * Get the box element for a widget by ID
   */
  getWidgetBox(widgetId) {
    const mapping = {
      cpu: this.w.cpuBox,
      mem: this.w.memBox,
      gpu: this.w.gpuBox,
      net: this.w.netBox,
      disk: this.w.diskBox,
      sys: this.w.sysBox,
      uptime: this.w.uptimeBox,
      health: this.w.healthBox,
      gateway: this.w.gatewayBox
    };
    return mapping[widgetId];
  }
  /**
   * Move widget in the order
   * @param {number} direction - -1 for left/up, 1 for right/down
   */
  moveWidget(direction) {
    const orderedWidgets = this.getOrderedWidgets();
    if (orderedWidgets.length <= 1) return;
    this.clearArrangeIndicator();
    const widgetId = orderedWidgets[this.arrangeWidgetIndex];
    const oldIndex = this.arrangeWidgetIndex;
    let targetIndex = oldIndex + direction;
    if (targetIndex < 0) targetIndex = orderedWidgets.length - 1;
    if (targetIndex >= orderedWidgets.length) targetIndex = 0;
    const newOrder = [...orderedWidgets];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(targetIndex, 0, widgetId);
    this.settings.widgetOrder = newOrder;
    this.arrangeWidgetIndex = targetIndex;
    this.updateArrangeIndicator();
    this.recalculateLayout();
    this.screen.render();
  }
  /**
   * Save widget order to settings
   */
  saveWidgetOrder() {
    saveSettings3(this.settings);
  }
  /**
   * Cycle focus between widgets
   * @param {number} direction - 1 for next, -1 for previous
   */
  cycleFocus(direction) {
    this.focusableWidgets = this.buildFocusableWidgets();
    if (this.focusableWidgets.length === 0) return;
    this.clearFocusIndicator();
    this.focusedWidgetIndex = (this.focusedWidgetIndex + direction + this.focusableWidgets.length) % this.focusableWidgets.length;
    this.applyFocusIndicator();
    this.screen.render();
  }
  /**
   * Clear focus indicator from currently focused widget
   */
  clearFocusIndicator() {
    if (this.focusableWidgets.length === 0) return;
    const currentWidget = this.focusableWidgets[this.focusedWidgetIndex];
    if (!currentWidget || !currentWidget.box) return;
    const themeColors = {
      sessions: "magenta",
      cpu: "cyan",
      memory: "green",
      gpu: "yellow",
      network: "cyan",
      disk: "yellow",
      system: "blue",
      uptime: "magenta",
      health: "green",
      gateway: "cyan",
      logs: "gray"
    };
    const originalColor = themeColors[currentWidget.name] || "white";
    currentWidget.box.style.border = { fg: originalColor };
    currentWidget.box.style.border.bold = false;
  }
  /**
   * Apply focus indicator to currently focused widget
   */
  applyFocusIndicator() {
    if (this.focusableWidgets.length === 0) return;
    const currentWidget = this.focusableWidgets[this.focusedWidgetIndex];
    if (!currentWidget || !currentWidget.box) return;
    currentWidget.box.style.border = { fg: "bright-white", bold: true };
  }
  cycleSessionSort() {
    const modes = ["time", "tokens", "idle", "name"];
    const currentIdx = modes.indexOf(this.settings.sessionSortMode);
    this.settings.sessionSortMode = modes[(currentIdx + 1) % modes.length];
    saveSettings3(this.settings);
    this.render();
  }
  cycleLogLevel() {
    const levels = ["all", "debug", "info", "warn", "error"];
    const currentLevel = levels.indexOf(this.settings.logLevelFilter);
    this.settings.logLevelFilter = levels[(currentLevel + 1) % levels.length];
    saveSettings3(this.settings);
    this.screen.render();
  }
  cycleTheme() {
    const newTheme = cycleTheme();
    saveTheme();
    this.settings.theme = newTheme;
    saveSettings3(this.settings);
    if (newTheme === "auto") {
      this.themeWatcher = startAutoThemeDetection();
    } else if (this.themeWatcher) {
      stopAutoThemeDetection();
      this.themeWatcher = null;
    }
    this.applyTheme();
    this.screen.render();
  }
  async showThemeSelector() {
    this.isModalActive = true;
    await showThemeSelector(this.screen, import_blessed7.default, () => {
      this.applyTheme();
      this.screen.render();
    });
    this.isModalActive = false;
  }
  cycleExportFormat() {
    const formats = ["json", "csv"];
    const currentIdx = formats.indexOf(this.settings.exportFormat);
    this.settings.exportFormat = formats[(currentIdx + 1) % formats.length];
    saveSettings3(this.settings);
    this.w.footerText.setContent(`{green-fg}Export format set to ${this.settings.exportFormat.toUpperCase()}{/green-fg}`);
    this.screen.render();
    setTimeout(() => this.render(), 3e3);
  }
  showVersionInfo() {
    const openclawVersion = this.data.version || "unknown";
    this.w.footerText.setContent(`{cyan-fg}clawdash ${DASHBOARD_VERSION} | openclaw ${openclawVersion}{/cyan-fg}`);
    this.screen.render();
    setTimeout(() => this.render(), 5e3);
  }
  /**
   * Retry gateway connections that are currently offline
   * Triggered by 'G' key press when gateways are unreachable
   */
  async retryGatewayConnection() {
    const gatewayHealth = gateway_manager_default.getEndpointHealth();
    const unreachableCount = gatewayHealth.filter((ep) => ep.enabled && !ep.reachable).length;
    if (unreachableCount === 0) {
      this.w.footerText.setContent("{green-fg}\u2713 All gateways reachable{/green-fg}");
      this.screen.render();
      setTimeout(() => this.render(), 2e3);
      return;
    }
    this.w.footerText.setContent(`{yellow-fg}\u27F3 Retrying ${unreachableCount} unreachable gateway(s)...{/yellow-fg}`);
    this.screen.render();
    try {
      const result = await gateway_manager_default.forceRetry();
      if (result.successful > 0) {
        this.w.footerText.setContent(`{green-fg}\u2713 ${result.successful}/${result.attempted} gateway(s) reconnected{/green-fg}`);
        this.screen.render();
        setTimeout(() => this.refresh(), 500);
      } else {
        const errors = result.results.filter((r) => !r.success && r.error).map((r) => `${r.name}: ${r.error}`).join(", ");
        this.w.footerText.setContent(`{red-fg}\u2717 Retry failed - ${errors.substring(0, 50)}...{/red-fg}`);
        this.screen.render();
      }
      setTimeout(() => this.render(), 3e3);
    } catch (err) {
      this.w.footerText.setContent(`{red-fg}\u2717 Retry error: ${err.message.substring(0, 40)}{/red-fg}`);
      this.screen.render();
      setTimeout(() => this.render(), 3e3);
    }
  }
  /**
   * Retry all failed widgets
   * Triggered by 'X' key press when widgets are in error state
   */
  async retryFailedWidgets() {
    const errorStates = this.errorBoundaryManager.getAllErrorStates();
    const failedWidgets = Object.entries(errorStates).filter(([_, state]) => state?.hasError);
    if (failedWidgets.length === 0) {
      this.w.footerText.setContent("{green-fg}\u2713 No widgets to retry{/green-fg}");
      this.screen.render();
      setTimeout(() => this.render(), 2e3);
      return;
    }
    const failedCount = failedWidgets.length;
    const widgetNames = failedWidgets.map(([name]) => name).join(", ");
    this.w.footerText.setContent(`{yellow-fg}\u27F3 Retrying ${failedCount} failed widget(s): ${widgetNames}{/yellow-fg}`);
    this.screen.render();
    try {
      this.errorBoundaryManager.clearAll();
      this.widgetErrorState.clear();
      await this.refresh();
      this.w.footerText.setContent(`{green-fg}\u2713 Widget data refreshed{/green-fg}`);
      this.screen.render();
    } catch (err) {
      this.w.footerText.setContent(`{red-fg}\u2717 Retry error: ${err.message.substring(0, 40)}{/red-fg}`);
      this.screen.render();
    }
    setTimeout(() => this.render(), 3e3);
  }
  /**
   * Record a widget error for tracking and recovery
   * @param {string} widgetName - Widget identifier
   * @param {Error} error - The error that occurred
   */
  recordWidgetError(widgetName, error) {
    logger_default.warn(`Widget '${widgetName}' error: ${error.message}`);
    const boundary = this.errorBoundaryManager.get(widgetName);
    if (!boundary) {
      const mockWidget = { id: widgetName, box: this.w[`${widgetName}Box`] };
      this.errorBoundaryManager.wrap(mockWidget, {
        maxRetries: 3,
        retryDelay: 5e3
      });
    }
    const widgetBoundary = this.errorBoundaryManager.get(widgetName);
    if (widgetBoundary) {
      widgetBoundary.showError(error.message, error);
    }
    this.widgetErrorState.set(widgetName, {
      hasError: true,
      error: error.message,
      timestamp: Date.now(),
      retryCount: (this.widgetErrorState.get(widgetName)?.retryCount || 0) + 1
    });
  }
  /**
   * Clear error state for a widget
   * @param {string} widgetName - Widget identifier
   */
  clearWidgetError(widgetName) {
    this.widgetErrorState.delete(widgetName);
    const boundary = this.errorBoundaryManager.get(widgetName);
    if (boundary) {
      boundary.reset();
    }
  }
  applyTheme() {
    const theme = getCurrentTheme();
    const colors = theme.colors;
    if (this.w.sessBox) this.w.sessBox.style.border.fg = colors.border.sessions;
    if (this.w.logBox) this.w.logBox.style.border.fg = colors.border.logs;
    if (this.w.cpuBox) this.w.cpuBox.style.border.fg = colors.border.cpu;
    if (this.w.memBox) this.w.memBox.style.border.fg = colors.border.memory;
    if (this.w.gpuBox) this.w.gpuBox.style.border.fg = colors.border.gpu;
    if (this.w.netBox) this.w.netBox.style.border.fg = colors.border.network;
    if (this.w.diskBox) this.w.diskBox.style.border.fg = colors.border.disk;
    if (this.w.sysBox) this.w.sysBox.style.border.fg = colors.border.system;
    if (this.w.uptimeBox) this.w.uptimeBox.style.border.fg = colors.border.uptime;
    if (this.w.gatewayBox) this.w.gatewayBox.style.border.fg = colors.border.gateway;
    if (this.w.sessHeader) this.w.sessHeader.style.fg = colors.text.header;
    if (this.w.sessList) this.w.sessList.style.fg = colors.text.primary;
    if (this.w.sessCount) this.w.sessCount.style.fg = colors.text.secondary;
    if (this.w.logContent) this.w.logContent.style.fg = colors.text.secondary;
    if (this.w.logo) this.w.logo.style.fg = colors.branding.logo;
    if (this.w.title) this.w.title.style.fg = colors.branding.title;
    if (this.w.clock) this.w.clock.style.fg = colors.branding.clock;
    if (this.w.footer) this.w.footer.style.bg = colors.footer.bg;
    if (this.w.footer) this.w.footer.style.fg = colors.footer.fg;
    if (this.w.footerText) this.w.footerText.style.fg = colors.footer.fg;
  }
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      clearInterval(this.timer);
    } else {
      this.refresh();
      this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
    }
    this.render();
  }
  async togglePerformanceOverlay() {
    if (this.w.perfOverlayBox) {
      await transitions_default.transitionOut(this.screen, this.w.perfOverlayBox, {
        duration: 150,
        fade: true,
        scale: true
      });
      this.w.perfOverlayBox.destroy();
      delete this.w.perfOverlayBox;
      this.w.perfContent.destroy();
      delete this.w.perfContent;
      this.isModalActive = false;
      this.screen.render();
    } else {
      await this.showPerformanceOverlay();
    }
  }
  showPerformanceOverlay() {
    const metrics = performance_monitor_default.getMetrics();
    const C2 = getCurrentTheme().colors;
    const current = metrics.current;
    const aggregates = metrics.aggregates;
    const health = performance_monitor_default.checkHealth();
    let content2 = "{center}{bold}PERFORMANCE METRICS{/bold}{/center}\n\n";
    if (!current) {
      content2 += "{red-fg}Performance monitoring is not active{/red-fg}\n";
      content2 += "Start monitoring to see metrics.\n";
    } else {
      content2 += "{bold}Current Metrics{/bold}\n";
      const memColor = current.memoryPercent >= 80 ? "red-fg" : current.memoryPercent >= 60 ? "yellow-fg" : "green-fg";
      const cpuColor = current.cpuPercent >= 80 ? "red-fg" : current.cpuPercent >= 50 ? "yellow-fg" : "green-fg";
      content2 += `  Memory: {${memColor}}${current.memoryUsed}MB / ${current.memoryTotal}MB (${current.memoryPercent}%){/${memColor}}
`;
      content2 += `  CPU: {${cpuColor}}${current.cpuPercent}%{/${cpuColor}}
`;
      content2 += `  Refresh Rate: ${current.refreshRate}ms
`;
      content2 += `  Uptime: ${Math.floor(current.uptime / 60)}m ${current.uptime % 60}s
`;
      if (aggregates.avgEventLoopLag > 0) {
        const lagColor = aggregates.avgEventLoopLag > 100 ? "red-fg" : aggregates.avgEventLoopLag > 50 ? "yellow-fg" : "gray-fg";
        content2 += `  Event Loop Lag: {${lagColor}}${aggregates.avgEventLoopLag}ms{/${lagColor}}
`;
      }
      content2 += "\n{bold}Averages (last ${metrics.history.length} samples){/bold}\n";
      content2 += `  Memory: ${aggregates.avgMemoryUsed}MB (peak: ${aggregates.peakMemoryUsed}MB)
`;
      content2 += `  CPU: ${aggregates.avgCpuPercent}%
`;
      const workerStatus = worker_pool_default.getStatus();
      content2 += "\n{bold}Worker Pool{/bold}\n";
      if (workerStatus.enabled && workerStatus.supported) {
        const busyColor = workerStatus.busyWorkers === workerStatus.totalWorkers ? "yellow-fg" : "green-fg";
        content2 += `  Status: {green-fg}enabled{/green-fg}
`;
        content2 += `  Workers: {${busyColor}}${workerStatus.busyWorkers}/${workerStatus.totalWorkers} busy{/${busyColor}}
`;
        content2 += `  Ready: ${workerStatus.readyWorkers}/${workerStatus.totalWorkers}
`;
        if (workerStatus.pendingTasks > 0 || workerStatus.queuedTasks > 0) {
          const pendingColor = workerStatus.pendingTasks + workerStatus.queuedTasks > 5 ? "yellow-fg" : "gray-fg";
          content2 += `  Tasks: {${pendingColor}}${workerStatus.pendingTasks} pending, ${workerStatus.queuedTasks} queued{/${pendingColor}}
`;
        }
      } else {
        content2 += `  Status: {gray-fg}${workerStatus.enabled ? "unsupported" : "disabled"}{/gray-fg}
`;
      }
      if (health.degraded) {
        content2 += "\n{yellow-fg}{bold}\u26A0 Performance Issues{/bold}{/yellow-fg}\n";
        health.reasons.forEach((reason) => {
          content2 += `  \u2022 {red-fg}${reason}{/red-fg}
`;
        });
      }
    }
    content2 += "\n{center}{gray-fg}Press p to close{/gray-fg}{/center}";
    this.w.perfOverlayBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 50,
      height: 26,
      border: { type: "line" },
      style: {
        border: { fg: C2.brightMagenta },
        bg: C2.black
      },
      label: " PERF "
    });
    this.w.perfContent = import_blessed7.default.text({
      parent: this.w.perfOverlayBox,
      top: 1,
      left: 1,
      width: "95%",
      height: "90%",
      content: content2,
      style: { fg: C2.white },
      tags: true
    });
    transitions_default.transitionIn(this.screen, this.w.perfOverlayBox, {
      duration: 150,
      fade: true,
      scale: true
    });
    this.isModalActive = true;
  }
  exportDashboard() {
    const exportDir = this.settings.exportDirectory || import_os13.default.homedir() + "/.openclaw/exports";
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const format = this.settings.exportFormat || "json";
    const filename = `dashboard-${timestamp}.${format}`;
    const pathValidation = validateFilePath2(exportDir);
    if (!pathValidation.valid) {
      logger_default.warn("Export directory validation failed: " + pathValidation.error);
      this.w.footerText.setContent("Export failed: Invalid directory");
      this.screen.render();
      return;
    }
    const validatedExportDir = pathValidation.resolvedPath;
    const filepath = validatedExportDir + "/" + filename;
    try {
      if (!import_fs22.default.existsSync(validatedExportDir)) {
        import_fs22.default.mkdirSync(validatedExportDir, { recursive: true });
      }
      if (format === "csv") {
        let csv = "exportTime,dashboardVersion,sessionId,sessionType,model,status,runtime,tokens,cost\n";
        const exportTime = (/* @__PURE__ */ new Date()).toISOString();
        const version = DASHBOARD_VERSION;
        if (this.data.sessions && this.data.sessions.length > 0) {
          for (const s of this.data.sessions) {
            const row = [
              exportTime,
              version,
              s.id || "",
              s.type || "",
              s.model || "",
              s.status || "",
              s.runtime || "",
              s.tokens || 0,
              s.cost || 0
            ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
            csv += row + "\n";
          }
        } else {
          const row = [
            exportTime,
            version,
            "system",
            "system",
            "N/A",
            "active",
            this.data.systemUptime || "",
            0,
            0
          ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
          csv += row + "\n";
        }
        import_fs22.default.writeFileSync(filepath, csv);
      } else {
        const exportData = {
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          dashboardVersion: DASHBOARD_VERSION,
          settings: this.settings,
          system: this.data.system,
          systemUptime: this.data.systemUptime,
          gatewayUptime: this.data.gatewayUptime,
          cpu: this.data.cpu,
          memory: this.data.memory,
          gpu: this.data.gpu,
          disk: this.data.disk,
          network: this.data.network,
          openclaw: this.data.openclaw,
          sessions: this.data.sessions,
          logLines: this.logLines
        };
        import_fs22.default.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
      }
      this.w.footerText.setContent(`{green-fg}Exported to ${filename} (${format.toUpperCase()}){/green-fg}`);
      this.screen.render();
      setTimeout(() => this.render(), 3e3);
    } catch (err) {
      this.w.footerText.setContent(`{red-fg}Export failed: ${err.message}{/red-fg}`);
      this.screen.render();
      setTimeout(() => this.render(), 5e3);
    }
  }
  /**
   * Export dashboard configuration snapshot
   * Creates a shareable JSON file with current settings and layout
   */
  exportSnapshot() {
    try {
      const snapshot = createSnapshot(this.settings, {
        name: "Dashboard Configuration",
        description: `Claw Dashboard v${DASHBOARD_VERSION}`
      });
      const snapshotDir = getSnapshotsDirectory();
      const filename = generateSnapshotFilename("dashboard");
      const filepath = `${snapshotDir}/${filename}`;
      const result = exportSnapshotToFile(snapshot, filepath);
      if (result.success) {
        this.w.footerText.setContent(`{green-fg}\u2713 Snapshot exported: ${filename}{/green-fg}`);
        logger_default.info(`Dashboard snapshot exported to: ${result.path}`);
      } else {
        this.w.footerText.setContent(`{red-fg}\u2717 Snapshot failed: ${result.error}{/red-fg}`);
        logger_default.warn(`Snapshot export failed: ${result.error}`);
      }
    } catch (err) {
      this.w.footerText.setContent(`{red-fg}\u2717 Snapshot error: ${err.message}{/red-fg}`);
      logger_default.error(`Snapshot export error: ${err.message}`);
    }
    this.screen.render();
    setTimeout(() => this.render(), 3e3);
  }
  /**
   * Import dashboard configuration from snapshot
   * Shows file picker or prompts for path
   */
  async importSnapshot() {
    const snapshotsDir = getSnapshotsDirectory();
    const snapshots = listSnapshots();
    if (snapshots.length === 0) {
      await this.promptForSnapshotImport();
      return;
    }
    await this.showSnapshotPicker(snapshots);
  }
  /**
   * Prompt user for snapshot file path
   */
  async promptForSnapshotImport() {
    this.w.snapshotPrompt = import_blessed7.default.prompt({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 60,
      height: "shrink",
      border: { type: "line" },
      style: { border: { fg: C.cyan }, bg: C.black },
      label: " Import Snapshot "
    });
    this.w.snapshotPrompt.input("Enter snapshot file path:", "", (err, value) => {
      if (!err && value && value.trim()) {
        let filePath = value.trim();
        if (filePath.startsWith("~")) {
          filePath = import_os13.default.homedir() + filePath.substring(1);
        }
        this.loadAndApplySnapshot(filePath);
      }
      this.w.snapshotPrompt.destroy();
      delete this.w.snapshotPrompt;
      this.screen.render();
    });
    this.screen.render();
  }
  /**
   * Show snapshot picker UI
   */
  async showSnapshotPicker(snapshots) {
    const C2 = getCurrentTheme().colors;
    this.w.snapshotPickerBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 70,
      height: 18,
      border: { type: "line" },
      style: { border: { fg: C2.brightCyan }, bg: C2.black },
      label: " IMPORT SNAPSHOT "
    });
    import_blessed7.default.text({
      parent: this.w.snapshotPickerBox,
      top: 1,
      left: "center",
      content: "{bold}Select a snapshot to import{/bold}",
      style: { fg: C2.brightWhite },
      tags: true
    });
    const snapshotItems = snapshots.slice(0, 8).map((s) => {
      const date = new Date(s.createdAt).toLocaleDateString();
      const widgets = s.metadata?.widgetCount || 0;
      return `${s.name} (${date}) - ${widgets} widgets`;
    });
    snapshotItems.push("{cyan-fg}Browse for file...{/cyan-fg}");
    this.w.snapshotList = import_blessed7.default.list({
      parent: this.w.snapshotPickerBox,
      top: 3,
      left: 2,
      width: 66,
      height: 10,
      items: snapshotItems,
      style: {
        fg: C2.white,
        bg: C2.black,
        selected: { fg: C2.black, bg: C2.cyan, bold: true },
        item: { fg: C2.white }
      },
      keys: true,
      vi: true
    });
    import_blessed7.default.text({
      parent: this.w.snapshotPickerBox,
      bottom: 1,
      left: "center",
      content: "{gray}Enter: Import  j/k: Navigate  Esc: Cancel{/gray}",
      style: { fg: C2.gray },
      tags: true
    });
    this.w.snapshotList.focus();
    this.w.snapshotList.on("select", async (item, index) => {
      if (index === snapshotItems.length - 1) {
        this.closeSnapshotPicker();
        await this.promptForSnapshotImport();
      } else {
        const snapshot = snapshots[index];
        this.closeSnapshotPicker();
        this.loadAndApplySnapshot(snapshot.path);
      }
    });
    this.w.snapshotList.key(["escape", "q"], () => {
      this.closeSnapshotPicker();
    });
    this.screen.render();
  }
  /**
   * Close snapshot picker
   */
  closeSnapshotPicker() {
    if (this.w.snapshotPickerBox) {
      this.w.snapshotPickerBox.destroy();
      delete this.w.snapshotPickerBox;
      delete this.w.snapshotList;
      this.screen.render();
    }
  }
  /**
   * Load and apply snapshot from file
   */
  loadAndApplySnapshot(filePath) {
    const result = importSnapshotFromFile(filePath);
    if (!result.success) {
      this.w.footerText.setContent(`{red-fg}\u2717 Import failed: ${result.error}{/red-fg}`);
      this.screen.render();
      setTimeout(() => this.render(), 5e3);
      return;
    }
    const summary = getSnapshotSummary(result.snapshot);
    this.showSnapshotConfirmation(result.snapshot, summary);
  }
  /**
   * Show snapshot import confirmation dialog
   */
  showSnapshotConfirmation(snapshot, summary) {
    const C2 = getCurrentTheme().colors;
    this.w.snapshotConfirmBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 60,
      height: 14,
      border: { type: "line" },
      style: { border: { fg: C2.yellow }, bg: C2.black },
      label: " CONFIRM IMPORT "
    });
    import_blessed7.default.text({
      parent: this.w.snapshotConfirmBox,
      top: 1,
      left: "center",
      content: "{bold}Import this snapshot?{/bold}",
      style: { fg: C2.brightYellow },
      tags: true
    });
    import_blessed7.default.text({
      parent: this.w.snapshotConfirmBox,
      top: 3,
      left: 2,
      right: 2,
      content: summary,
      style: { fg: C2.white },
      tags: true
    });
    import_blessed7.default.text({
      parent: this.w.snapshotConfirmBox,
      bottom: 2,
      left: "center",
      content: "{green-fg}y{/green-fg}: Import  {red-fg}n{/red-fg}: Cancel",
      style: { fg: C2.gray },
      tags: true
    });
    this.w.snapshotConfirmBox.key(["y", "Y"], () => {
      this.applySnapshot(snapshot);
      this.closeSnapshotConfirmation();
    });
    this.w.snapshotConfirmBox.key(["n", "N", "escape", "q"], () => {
      this.w.footerText.setContent("{gray-fg}Import cancelled{/gray-fg}");
      this.closeSnapshotConfirmation();
      setTimeout(() => this.render(), 2e3);
    });
    this.screen.render();
  }
  /**
   * Close snapshot confirmation dialog
   */
  closeSnapshotConfirmation() {
    if (this.w.snapshotConfirmBox) {
      this.w.snapshotConfirmBox.destroy();
      delete this.w.snapshotConfirmBox;
      this.screen.render();
    }
  }
  /**
   * Apply snapshot settings
   */
  applySnapshot(snapshot) {
    try {
      const mergedSettings = mergeSnapshotSettings(this.settings, snapshot.settings);
      this.settings = mergedSettings;
      saveSettings3(this.settings);
      if (snapshot.settings.theme && snapshot.settings.theme !== getThemeName()) {
        setTheme(snapshot.settings.theme);
        saveTheme();
      }
      this.recalculateLayout();
      this.applyTheme();
      this.w.footerText.setContent(`{green-fg}\u2713 Snapshot imported: ${snapshot.name}{/green-fg}`);
      logger_default.info(`Dashboard snapshot imported: ${snapshot.name}`);
    } catch (err) {
      this.w.footerText.setContent(`{red-fg}\u2717 Apply failed: ${err.message}{/red-fg}`);
      logger_default.error(`Failed to apply snapshot: ${err.message}`);
    }
    this.screen.render();
    setTimeout(() => this.render(), 3e3);
  }
  async toggleHelp() {
    if (this.w.helpBox) {
      await transitions_default.transitionOut(this.screen, this.w.helpBox, {
        duration: 150,
        fade: true,
        scale: true
      });
      this.w.helpBox.destroy();
      delete this.w.helpBox;
      this.w.helpContent.destroy();
      delete this.w.helpContent;
      this.screen.render();
    } else {
      await this.showHelp();
    }
  }
  showHelp() {
    const helpText = [
      "{center}{bold}CLAW DASHBOARD - KEYBOARD SHORTCUTS{/bold}{/center}",
      "",
      "  {cyan-fg}q{/cyan-fg} or {cyan-fg}Ctrl+C{/cyan-fg}  Quit the dashboard",
      "  {cyan-fg}r{/cyan-fg}              Force refresh all data",
      "  {cyan-fg}p{/cyan-fg}              Toggle performance metrics overlay",
      "  {cyan-fg}P{/cyan-fg} or {cyan-fg}Space{/cyan-fg}    Pause/resume auto-refresh",
      "  {cyan-fg}o{/cyan-fg}              Cycle session sort (time/tokens/idle/name)",
      "  {cyan-fg}e{/cyan-fg}              Export dashboard data (JSON/CSV)",
      "  {cyan-fg}E{/cyan-fg}              Cycle export format (JSON/CSV)",
      "  {cyan-fg}Ctrl+S{/cyan-fg}         Export config snapshot (shareable)",
      "  {cyan-fg}Ctrl+O{/cyan-fg}         Import config snapshot",
      "  {cyan-fg}t{/cyan-fg}              Cycle theme (default/dark/high-contrast/ocean)",
      "  {cyan-fg}v{/cyan-fg}              Show version info",
      "  {cyan-fg}G{/cyan-fg}              Retry gateway connection (when offline)",
      "  {cyan-fg}X{/cyan-fg}              Retry failed widgets (error recovery)",
      "  {cyan-fg}[{/cyan-fg} or {cyan-fg}]{/cyan-fg}        Previous/next page (when >6 sessions)",
      "  {cyan-fg}?{/cyan-fg}              Toggle this help panel",
      "  {cyan-fg}s{/cyan-fg} or {cyan-fg}S{/cyan-fg}        Open settings panel",
      "",
      "  {cyan-fg}1-9{/cyan-fg}            Toggle widgets (1:CPU 2:MEM 3:GPU 4:NET 5:DISK 6:SYS 7:UP 8:HLTH 9:GATEWAY)",
      "  {cyan-fg}Alt+1-9{/cyan-fg}        Pin/unpin widget to favorites row (max 4)",
      "  {cyan-fg}0{/cyan-fg}              Cycle log level filter",
      "",
      "  {bold}Vi-mode Navigation:{/bold}",
      "  {cyan-fg}h{/cyan-fg}/{cyan-fg}l{/cyan-fg}            Previous/next page",
      "  {cyan-fg}j{/cyan-fg}/{cyan-fg}k{/cyan-fg}            Select next/previous session",
      "  {cyan-fg}g{/cyan-fg}              Go to first page ({cyan-fg}G{/cyan-fg} retries gateway)",
      "  {cyan-fg}Ctrl+B{/cyan-fg}/{cyan-fg}Ctrl+F{/cyan-fg}  Page up/down",
      "",
      "  {bold}Widget Navigation:{/bold}",
      "  {cyan-fg}Tab{/cyan-fg}            Focus next widget",
      "  {cyan-fg}Shift+Tab{/cyan-fg}      Focus previous widget",
      "",
      "  {bold}Favorites:{/bold}",
      "  {cyan-fg}f{/cyan-fg}               Toggle favorite on current session",
      "  {cyan-fg}F{/cyan-fg}               Show favorites only (filter)",
      "",
      `  {gray-fg}Export Dir: ${this.settings.exportDirectory}{/gray-fg}`,
      `  {gray-fg}Export Format: ${this.settings.exportFormat.toUpperCase()}{/gray-fg}`,
      `  {gray-fg}Theme: ${this.settings.theme}{/gray-fg}`,
      "",
      "{center}{gray-fg}Press ? to close this help{/gray-fg}{/center}"
    ].join("\n");
    this.w.helpBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 50,
      height: 21,
      border: { type: "line" },
      style: {
        border: { fg: C.brightCyan },
        bg: C.black
      },
      label: " HELP "
    });
    this.w.helpContent = import_blessed7.default.text({
      parent: this.w.helpBox,
      top: 1,
      left: 1,
      width: "95%",
      height: "90%",
      content: helpText,
      style: { fg: C.white },
      tags: true
    });
    transitions_default.transitionIn(this.screen, this.w.helpBox, {
      duration: 150,
      fade: true,
      scale: true
    });
    this.isModalActive = true;
  }
  /**
   * Toggle command palette modal
   */
  async toggleCommandPalette() {
    if (this.w.commandPaletteBox) {
      await this.closeCommandPalette();
    } else {
      await this.showCommandPalette();
    }
  }
  /**
   * Get list of all available commands for the command palette
   * @returns {Array<{name: string, shortcut: string, action: Function, category: string}>}
   */
  getCommandPaletteCommands() {
    const commands = [
      // Navigation
      { name: "Toggle Help", shortcut: "?", action: () => this.toggleHelp(), category: "Navigation" },
      { name: "Open Settings", shortcut: "s", action: () => this.toggleSettings(), category: "Navigation" },
      { name: "Search Sessions", shortcut: "/", action: () => this.showSearch(), category: "Navigation" },
      { name: "Open Command Palette", shortcut: "Ctrl+K", action: () => this.closeCommandPalette(), category: "Navigation" },
      // Display
      { name: "Force Refresh", shortcut: "r", action: () => this.refresh(), category: "Display" },
      { name: "Toggle Pause", shortcut: "P / Space", action: () => this.togglePause(), category: "Display" },
      { name: "Cycle Theme", shortcut: "t", action: () => this.cycleTheme(), category: "Display" },
      { name: "Show Theme Selector", shortcut: "T", action: () => this.showThemeSelector(), category: "Display" },
      { name: "Show Version", shortcut: "v", action: () => this.showVersionInfo(), category: "Display" },
      { name: "Toggle Performance Metrics", shortcut: "p", action: () => this.togglePerformanceOverlay(), category: "Display" },
      // Widgets
      { name: "Toggle CPU Widget", shortcut: "1", action: () => this.toggleWidgetByIndex(0), category: "Widgets" },
      { name: "Toggle Memory Widget", shortcut: "2", action: () => this.toggleWidgetByIndex(1), category: "Widgets" },
      { name: "Toggle GPU Widget", shortcut: "3", action: () => this.toggleWidgetByIndex(2), category: "Widgets" },
      { name: "Toggle Network Widget", shortcut: "4", action: () => this.toggleWidgetByIndex(3), category: "Widgets" },
      { name: "Toggle Disk Widget", shortcut: "5", action: () => this.toggleWidgetByIndex(4), category: "Widgets" },
      { name: "Toggle System Widget", shortcut: "6", action: () => this.toggleWidgetByIndex(5), category: "Widgets" },
      { name: "Toggle Uptime Widget", shortcut: "7", action: () => this.toggleWidgetByIndex(6), category: "Widgets" },
      { name: "Toggle Health Widget", shortcut: "8", action: () => this.toggleWidgetByIndex(7), category: "Widgets" },
      { name: "Toggle Gateway Widget", shortcut: "9", action: () => this.toggleWidgetByIndex(8), category: "Widgets" },
      { name: "Toggle Widget Arrange Mode", shortcut: "w", action: () => this.toggleWidgetArrangeMode(), category: "Widgets" },
      // Sessions
      { name: "Cycle Session Sort", shortcut: "o", action: () => this.cycleSessionSort(), category: "Sessions" },
      { name: "Toggle Favorite", shortcut: "f", action: () => this.toggleFavorite(), category: "Sessions" },
      { name: "Show Favorites Only", shortcut: "F", action: () => this.toggleFavoritesFilter(), category: "Sessions" },
      { name: "Cycle Log Level Filter", shortcut: "0", action: () => this.cycleLogLevel(), category: "Sessions" },
      // Export
      { name: "Export Dashboard Data", shortcut: "e", action: () => this.exportDashboard(), category: "Export" },
      { name: "Cycle Export Format", shortcut: "E", action: () => this.cycleExportFormat(), category: "Export" },
      { name: "Export Config Snapshot", shortcut: "Ctrl+S", action: () => this.exportSnapshot(), category: "Export" },
      { name: "Import Config Snapshot", shortcut: "Ctrl+O", action: () => this.importSnapshot(), category: "Export" },
      // System
      { name: "Retry Gateway Connection", shortcut: "G", action: () => this.retryGatewayConnection(), category: "System" },
      { name: "Retry Failed Widgets", shortcut: "X", action: () => this.retryFailedWidgets(), category: "System" },
      { name: "Quit Dashboard", shortcut: "q / Ctrl+C", action: () => {
        clearInterval(this.timer);
        this.screen.destroy();
        process.exit(0);
      }, category: "System" }
    ];
    return commands;
  }
  /**
   * Toggle widget visibility by index (for command palette)
   * @param {number} index - Widget index (0-based)
   */
  toggleWidgetByIndex(index) {
    const widgetKeys = ["showWidget1", "showWidget2", "showWidget3", "showWidget4", "showWidget5", "showWidget6", "showWidget7", "showWidget8", "showWidget9"];
    if (index >= 0 && index < widgetKeys.length) {
      this.settings[widgetKeys[index]] = !this.settings[widgetKeys[index]];
      saveSettings3(this.settings);
      this.recalculateLayout();
      this.refresh();
    }
  }
  /**
   * Show the command palette modal
   */
  async showCommandPalette() {
    this.w.commandPaletteBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 60,
      height: 18,
      border: { type: "line" },
      style: {
        border: { fg: C.brightMagenta },
        bg: C.black
      },
      label: " COMMAND PALETTE (Ctrl+K) "
    });
    this.w.commandPaletteInput = import_blessed7.default.textbox({
      parent: this.w.commandPaletteBox,
      top: 1,
      left: 1,
      width: 56,
      height: 1,
      inputOnFocus: true,
      style: {
        fg: C.brightWhite,
        bg: C.black,
        focus: { bg: "blue" }
      },
      placeholder: "Type to search commands..."
    });
    this.w.commandPaletteList = import_blessed7.default.list({
      parent: this.w.commandPaletteBox,
      top: 3,
      left: 1,
      width: 56,
      height: 12,
      style: {
        fg: C.white,
        bg: C.black,
        selected: { fg: C.black, bg: C.brightMagenta, bold: true },
        item: { fg: C.white }
      },
      keys: true,
      vi: false,
      mouse: true,
      scrollable: true,
      scrollbar: {
        ch: "\u2502",
        style: { fg: C.brightMagenta }
      }
    });
    import_blessed7.default.text({
      parent: this.w.commandPaletteBox,
      bottom: 0,
      left: "center",
      width: 40,
      content: "{gray-fg}\u2191\u2193 Navigate \xB7 Enter Execute \xB7 Esc Close{/}",
      tags: true,
      style: { fg: C.gray }
    });
    this._allCommands = this.getCommandPaletteCommands();
    this._filteredCommands = [...this._allCommands];
    this._commandPaletteQuery = "";
    this._renderCommandPaletteList();
    this.w.commandPaletteInput.on("keypress", (ch, key) => {
      if (key.name === "escape") {
        this.closeCommandPalette();
        return;
      }
      if (key.name === "up" || key.name === "down" || key.name === "return") {
        return;
      }
      setTimeout(() => {
        this._commandPaletteQuery = this.w.commandPaletteInput.getValue().toLowerCase();
        this._filterCommandPalette();
        this._renderCommandPaletteList();
        this.screen.render();
      }, 10);
    });
    this.w.commandPaletteList.on("select", (item, index) => {
      if (this._filteredCommands[index]) {
        this.executeCommand(this._filteredCommands[index]);
      }
    });
    this.w.commandPaletteInput.key("return", () => {
      if (this._filteredCommands.length > 0) {
        this.executeCommand(this._filteredCommands[0]);
      }
    });
    this.w.commandPaletteList.key("k", () => {
      if (this.w.commandPaletteList.selected > 0) {
        this.w.commandPaletteList.up();
        this.screen.render();
      }
    });
    this.w.commandPaletteList.key("j", () => {
      if (this.w.commandPaletteList.selected < this.w.commandPaletteList.items.length - 1) {
        this.w.commandPaletteList.down();
        this.screen.render();
      }
    });
    this.w.commandPaletteList.key("g", () => {
      this.w.commandPaletteList.select(0);
      this.screen.render();
    });
    this.w.commandPaletteList.key("G", () => {
      this.w.commandPaletteList.select(this.w.commandPaletteList.items.length - 1);
      this.screen.render();
    });
    this.w.commandPaletteList.key("escape", () => {
      this.closeCommandPalette();
    });
    await transitions_default.transitionIn(this.screen, this.w.commandPaletteBox, {
      duration: 150,
      fade: true,
      scale: true
    });
    this.isModalActive = true;
    this.w.commandPaletteInput.focus();
    this.screen.render();
  }
  /**
   * Filter commands based on search query
   */
  _filterCommandPalette() {
    const query = this._commandPaletteQuery;
    if (!query) {
      this._filteredCommands = [...this._allCommands];
      return;
    }
    this._filteredCommands = this._allCommands.filter((cmd) => {
      const nameMatch = cmd.name.toLowerCase().includes(query);
      const shortcutMatch = cmd.shortcut.toLowerCase().includes(query);
      const categoryMatch = cmd.category.toLowerCase().includes(query);
      return nameMatch || shortcutMatch || categoryMatch;
    });
  }
  /**
   * Render the filtered command list
   */
  _renderCommandPaletteList() {
    const items = this._filteredCommands.map((cmd) => {
      const shortcut = cmd.shortcut.padEnd(12);
      return `{cyan-fg}${shortcut}{/cyan-fg} ${cmd.name}`;
    });
    if (items.length === 0) {
      items.push("{gray-fg}No commands found{/gray-fg}");
    }
    this.w.commandPaletteList.setItems(items);
    if (this._filteredCommands.length > 0) {
      this.w.commandPaletteList.select(0);
    }
  }
  /**
   * Execute a command from the command palette
   * @param {Object} cmd - Command object with name, shortcut, and action
   */
  async executeCommand(cmd) {
    await this.closeCommandPalette();
    setTimeout(() => {
      if (cmd.action && typeof cmd.action === "function") {
        cmd.action();
      }
    }, 200);
  }
  /**
   * Close the command palette modal
   */
  async closeCommandPalette() {
    if (this.w.commandPaletteBox) {
      this._commandPaletteClosing = true;
      this.isModalActive = false;
      try {
        await transitions_default.transitionOut(this.screen, this.w.commandPaletteBox, {
          duration: 150,
          fade: true,
          scale: true
        });
        this.w.commandPaletteBox.destroy();
        delete this.w.commandPaletteBox;
        delete this.w.commandPaletteInput;
        delete this.w.commandPaletteList;
        this.screen.render();
      } finally {
        this._commandPaletteClosing = false;
      }
    }
  }
  async toggleSettings() {
    if (this.w.settingsBox) {
      await this.closeSettings();
    } else {
      await this.showSettings();
    }
  }
  async closeSettings() {
    if (this.w.settingsBox) {
      this._settingsClosing = true;
      this.isModalActive = false;
      try {
        await transitions_default.transitionOut(this.screen, this.w.settingsBox, {
          duration: 150,
          fade: true,
          scale: true
        });
        this.w.settingsBox.destroy();
        delete this.w.settingsBox;
        delete this.w.settingsList;
        this.screen.render();
      } finally {
        this._settingsClosing = false;
      }
    }
  }
  async showSettings() {
    const refreshMs = this.settings.refreshInterval;
    const refreshSec = refreshMs / 1e3;
    this.w.settingsBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 56,
      height: 19,
      border: { type: "line" },
      style: {
        border: { fg: C.brightGreen },
        bg: C.black
      },
      label: " SETTINGS "
    });
    import_blessed7.default.text({
      parent: this.w.settingsBox,
      top: 1,
      left: "center",
      content: "{bold}SETTINGS{/bold}",
      style: { fg: C.brightWhite },
      tags: true
    });
    import_blessed7.default.text({
      parent: this.w.settingsBox,
      top: 3,
      left: 2,
      content: "\u2191/\u2193 Navigate    Enter Toggle    s/Esc Close",
      style: { fg: C.cyan },
      tags: true
    });
    const getSettingsItems2 = () => [
      `Theme:            ${this.settings.theme || "auto"}`,
      `Refresh Interval: ${refreshSec}s (1s/2s/5s/10s)`,
      `1 CPU:            ${this.settings.showWidget1 ? "ON" : "OFF"}`,
      `2 Memory:         ${this.settings.showWidget2 ? "ON" : "OFF"}`,
      `3 GPU:            ${this.settings.showWidget3 ? "ON" : "OFF"}`,
      `4 Network:        ${this.settings.showWidget4 ? "ON" : "OFF"}`,
      `5 Disk:           ${this.settings.showWidget5 ? "ON" : "OFF"}`,
      `6 System:         ${this.settings.showWidget6 ? "ON" : "OFF"}`,
      `7 Uptime:         ${this.settings.showWidget7 ? "ON" : "OFF"}`,
      `8 Data Health:    ${this.settings.showWidget8 ? "ON" : "OFF"}`,
      `Log Level Filter: ${this.settings.logLevelFilter.toUpperCase()}`,
      `9 Export Dir:       ${(this.settings.exportDirectory || "").replace(import_os13.default.homedir() + "/", "~/")}`,
      `Widget Sizes:    ${Object.values(this.settings.widgetSizes || {}).every((s) => s === "small") ? "ALL SMALL" : Object.values(this.settings.widgetSizes || {}).every((s) => s === "large") ? "ALL LARGE" : Object.values(this.settings.widgetSizes || {}).every((s) => s === "wide") ? "ALL WIDE" : "MEDIUM/ MIXED"}`,
      `Perf Metrics:     ${this.settings.showPerformanceMetrics ? "ON" : "OFF"}`,
      `Plugin Config:    ${Object.keys(this.settings.plugins || {}).length} plugins`
    ];
    this.w.settingsList = import_blessed7.default.list({
      parent: this.w.settingsBox,
      top: 5,
      left: 2,
      width: 52,
      height: 10,
      items: getSettingsItems2(),
      style: {
        fg: C.white,
        bg: C.black,
        selected: { fg: C.black, bg: C.yellow, bold: true },
        item: { fg: C.white }
      },
      keys: true,
      vi: false,
      mouse: false,
      scrollable: false
    });
    import_blessed7.default.text({
      parent: this.w.settingsBox,
      bottom: 1,
      left: "center",
      content: "Changes auto-saved",
      style: { fg: C.gray },
      tags: true
    });
    this.w.settingsList.on("select", (item, index) => {
      this.toggleSettingOption(index);
      this.w.settingsList.setItems(getSettingsItems2());
      this.w.settingsList.select(index);
      this.screen.render();
    });
    this.w.settingsList.key(["return", "enter", " "], () => {
      const index = this.w.settingsList.selected;
      this.toggleSettingOption(index);
      this.w.settingsList.setItems(getSettingsItems2());
      this.w.settingsList.select(index);
      this.screen.render();
    });
    this.w.settingsList.key(["escape"], () => {
      this.closeSettings();
    });
    this.w.settingsList.key("k", () => {
      if (this.w.settingsList.selected > 0) {
        this.w.settingsList.up();
        this.screen.render();
      }
    });
    this.w.settingsList.key("j", () => {
      if (this.w.settingsList.selected < this.w.settingsList.items.length - 1) {
        this.w.settingsList.down();
        this.screen.render();
      }
    });
    this.w.settingsList.key("g", () => {
      this.w.settingsList.select(0);
      this.screen.render();
    });
    this.w.settingsList.key("G", () => {
      this.w.settingsList.select(this.w.settingsList.items.length - 1);
      this.screen.render();
    });
    this.w.settingsList.key("C-b", () => {
      const itemsPerPage = 5;
      const newIndex = Math.max(0, this.w.settingsList.selected - itemsPerPage);
      this.w.settingsList.select(newIndex);
      this.screen.render();
    });
    this.w.settingsList.key("C-f", () => {
      const itemsPerPage = 5;
      const newIndex = Math.min(this.w.settingsList.items.length - 1, this.w.settingsList.selected + itemsPerPage);
      this.w.settingsList.select(newIndex);
      this.screen.render();
    });
    this.w.settingsList.focus();
    await transitions_default.transitionIn(this.screen, this.w.settingsBox, {
      duration: 150,
      fade: true,
      scale: true
    });
    this.isModalActive = true;
  }
  // Update the alert display widget based on active alerts
  updateAlertDisplay() {
    const activeAlerts = alerts_default.getActiveAlerts();
    const counts = alerts_default.getAlertCounts();
    if (counts.total === 0) {
      if (this.w.alertBox) {
        this.w.alertBox.hide();
      }
    } else {
      if (this.w.alertBox) {
        this.w.alertBox.show();
        const criticalAlerts = activeAlerts.filter((a) => a.level === alerts_default.AlertLevel.CRITICAL);
        const warningAlerts = activeAlerts.filter((a) => a.level === alerts_default.AlertLevel.WARNING);
        let content2 = "";
        if (criticalAlerts.length > 0) {
          content2 += `{red-fg}{bold}CRITICAL:{/} `;
          content2 += criticalAlerts.map((a) => `${a.type.toUpperCase()} ${a.value}%`).join(" | ");
        }
        if (warningAlerts.length > 0) {
          if (content2) content2 += "\n";
          content2 += `{yellow-fg}WARNING:{/} `;
          content2 += warningAlerts.map((a) => `${a.type.toUpperCase()} ${a.value}%`).join(" | ");
        }
        this.w.alertContent.setContent(content2);
        if (criticalAlerts.length > 0) {
          this.w.alertBox.style.border.fg = C.red;
        } else if (warningAlerts.length > 0) {
          this.w.alertBox.style.border.fg = C.yellow;
        }
      }
    }
    if (this.w.alertBox) {
      if (counts.total > 0 && !this.w.alertBox._isVisible) {
        this.recalculateLayout();
      } else if (counts.total === 0 && this.w.alertBox._isVisible) {
        this.recalculateLayout();
      }
    }
  }
  toggleSettingOption(index) {
    let asyncPending = false;
    switch (index) {
      case 0:
        const themes2 = ["auto", "default", "dark", "high-contrast", "ocean"];
        const currentTheme = this.settings.theme || "auto";
        const themeIdx = themes2.indexOf(currentTheme);
        this.settings.theme = themes2[(themeIdx + 1) % themes2.length];
        setTheme(this.settings.theme);
        saveTheme();
        break;
      case 1:
        const intervals = config_default.REFRESH_INTERVALS.OPTIONS;
        const currentVal = Number(this.settings.refreshInterval) || 2e3;
        let currentIdx = intervals.indexOf(currentVal);
        if (currentIdx === -1) {
          currentIdx = intervals.findIndex((v) => v > currentVal) - 1;
          if (currentIdx < 0) currentIdx = intervals.length - 1;
        }
        this.settings.refreshInterval = intervals[(currentIdx + 1) % intervals.length];
        clearInterval(this.timer);
        this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
        break;
      case 2:
        this.settings.showWidget1 = !this.settings.showWidget1;
        this.recalculateLayout();
        break;
      case 3:
        this.settings.showWidget2 = !this.settings.showWidget2;
        this.recalculateLayout();
        break;
      case 4:
        this.settings.showWidget3 = !this.settings.showWidget3;
        this.recalculateLayout();
        break;
      case 5:
        this.settings.showWidget4 = !this.settings.showWidget4;
        this.recalculateLayout();
        break;
      case 6:
        this.settings.showWidget5 = !this.settings.showWidget5;
        this.recalculateLayout();
        break;
      case 7:
        this.settings.showWidget6 = !this.settings.showWidget6;
        this.recalculateLayout();
        break;
      case 8:
        this.settings.showWidget7 = !this.settings.showWidget7;
        this.recalculateLayout();
        break;
      case 10:
        this.settings.showWidget8 = !this.settings.showWidget8;
        this.recalculateLayout();
        break;
      case 9:
        const levels = ["all", "debug", "info", "warn", "error"];
        const currentLevel = levels.indexOf(this.settings.logLevelFilter);
        this.settings.logLevelFilter = levels[(currentLevel + 1) % levels.length];
        break;
      case 11:
        const exportDirs = [
          import_os13.default.homedir() + "/.openclaw/exports",
          import_os13.default.homedir() + "/Downloads",
          import_os13.default.homedir() + "/Desktop",
          "custom"
        ];
        const currentExportDir = this.settings.exportDirectory || import_os13.default.homedir() + "/.openclaw/exports";
        let currentDirIdx = exportDirs.indexOf(currentExportDir);
        if (currentDirIdx === -1) {
          currentDirIdx = 0;
        }
        const nextDirIdx = (currentDirIdx + 1) % exportDirs.length;
        if (nextDirIdx === 3) {
          this.w.customPathPrompt = import_blessed7.default.prompt({
            parent: this.screen,
            top: "center",
            left: "center",
            width: 50,
            height: "shrink",
            border: { type: "line" },
            style: { border: { fg: C.cyan }, bg: C.black },
            label: " Custom Export Path "
          });
          this.w.customPathPrompt.input("Enter custom export path (~ for home):", currentExportDir, (err, value) => {
            if (!err && value && value.trim()) {
              let customPath = value.trim();
              if (customPath.startsWith("~")) {
                customPath = import_os13.default.homedir() + customPath.substring(1);
              }
              const pathValidation = validateFilePath2(customPath);
              if (pathValidation.valid) {
                this.settings.exportDirectory = pathValidation.resolvedPath;
                saveSettings3(this.settings);
              } else {
                logger_default.warn("Invalid custom export path: " + pathValidation.error);
              }
            }
            this.w.customPathPrompt.destroy();
            this.w.settingsList.setItems(getSettingsItems());
            this.screen.render();
          });
          asyncPending = true;
          break;
        } else {
          this.settings.exportDirectory = exportDirs[nextDirIdx];
        }
        break;
      case 12:
        const sizes = ["small", "medium", "large", "wide"];
        const currentSize = this.settings.widgetSizes?.cpu || "medium";
        const currentSizeIdx = sizes.indexOf(currentSize);
        const nextSize = sizes[(currentSizeIdx + 1) % sizes.length];
        this.settings.widgetSizes = {
          cpu: nextSize,
          mem: nextSize,
          gpu: nextSize,
          net: nextSize,
          disk: nextSize,
          sys: nextSize,
          uptime: nextSize,
          health: nextSize,
          gateway: nextSize
        };
        this.recalculateLayout();
        break;
      case 13:
        this.settings.showPerformanceMetrics = !this.settings.showPerformanceMetrics;
        break;
      case 14:
        this.showPluginConfigEditor();
        asyncPending = true;
        break;
    }
    if (!asyncPending) {
      saveSettings3(this.settings);
    }
    this.screen.render();
  }
  // PLUGIN CONFIGURATION EDITOR
  async showPluginConfigEditor() {
    if (!this.settings.plugins) {
      this.settings.plugins = {};
    }
    const pluginIds = Object.keys(this.settings.plugins);
    const hasPlugins = pluginIds.length > 0;
    this.w.pluginConfigBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 70,
      height: 20,
      border: { type: "line" },
      style: {
        border: { fg: C.brightMagenta },
        bg: C.black
      },
      label: " PLUGIN CONFIGURATION "
    });
    import_blessed7.default.text({
      parent: this.w.pluginConfigBox,
      top: 1,
      left: "center",
      content: "{bold}CONFIGURE PLUGINS{/bold}",
      style: { fg: C.brightWhite },
      tags: true
    });
    if (!hasPlugins) {
      import_blessed7.default.text({
        parent: this.w.pluginConfigBox,
        top: 5,
        left: "center",
        content: "No plugins configured yet.\n\nPlugins will appear here when configured.",
        style: { fg: C.gray },
        tags: true
      });
      import_blessed7.default.text({
        parent: this.w.pluginConfigBox,
        bottom: 2,
        left: "center",
        content: "{gray}Press Esc or q to close{/gray}",
        style: { fg: C.gray },
        tags: true
      });
      this.w.pluginConfigBox.key(["escape", "q", "Q"], () => {
        this.closePluginConfigEditor();
      });
    } else {
      const pluginItems = pluginIds.map((id) => {
        const config = this.settings.plugins[id];
        const configKeys = Object.keys(config || {}).length;
        return `${id} (${configKeys} settings)`;
      });
      pluginItems.push("{cyan-fg}+ Add new plugin config{/cyan-fg}");
      this.w.pluginConfigList = import_blessed7.default.list({
        parent: this.w.pluginConfigBox,
        top: 3,
        left: 2,
        width: 66,
        height: 12,
        items: pluginItems,
        style: {
          fg: C.white,
          bg: C.black,
          selected: { fg: C.black, bg: C.cyan, bold: true },
          item: { fg: C.white }
        },
        keys: true,
        vi: false,
        mouse: false,
        scrollable: true
      });
      import_blessed7.default.text({
        parent: this.w.pluginConfigBox,
        bottom: 2,
        left: "center",
        content: "{gray}Enter to edit, d to delete, Esc to close{/gray}",
        style: { fg: C.gray },
        tags: true
      });
      this.w.pluginConfigList.on("select", (item, index) => {
        if (index === pluginIds.length) {
          this.showAddPluginDialog();
        } else {
          const pluginId = pluginIds[index];
          this.editPluginConfig(pluginId);
        }
      });
      this.w.pluginConfigList.key(["d", "D"], () => {
        const selected = this.w.pluginConfigList.selected;
        if (selected < pluginIds.length) {
          const pluginId = pluginIds[selected];
          this.deletePluginConfig(pluginId);
        }
      });
      this.w.pluginConfigList.key(["escape", "q", "Q"], () => {
        this.closePluginConfigEditor();
      });
      this.w.pluginConfigList.focus();
    }
    await transitions_default.transitionIn(this.screen, this.w.pluginConfigBox, {
      duration: 150,
      fade: true,
      scale: true
    });
    this.isModalActive = true;
  }
  async closePluginConfigEditor() {
    if (this.w.pluginConfigBox) {
      await transitions_default.transitionOut(this.screen, this.w.pluginConfigBox, {
        duration: 150,
        fade: true,
        scale: true
      });
      this.w.pluginConfigBox.destroy();
      delete this.w.pluginConfigBox;
      delete this.w.pluginConfigList;
      this.isModalActive = false;
      this.screen.render();
    }
  }
  async showAddPluginDialog() {
    this.w.pluginIdInput = import_blessed7.default.prompt({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 50,
      height: "shrink",
      border: { type: "line" },
      style: { border: { fg: C.cyan }, bg: C.black },
      label: " New Plugin ID "
    });
    this.w.pluginIdInput.input("Enter plugin ID (e.g., my-widget):", "", (err, value) => {
      if (!err && value && value.trim()) {
        const pluginId = value.trim();
        if (!this.settings.plugins) {
          this.settings.plugins = {};
        }
        this.settings.plugins[pluginId] = {};
        saveSettings3(this.settings);
        this.closePluginConfigEditor();
        setImmediate(() => {
          this.showPluginConfigEditor();
          setImmediate(() => this.editPluginConfig(pluginId));
        });
      } else {
        this.w.pluginIdInput.destroy();
        delete this.w.pluginIdInput;
        this.screen.render();
      }
    });
  }
  async editPluginConfig(pluginId) {
    const currentConfig = this.settings.plugins[pluginId] || {};
    const configJson = JSON.stringify(currentConfig, null, 2);
    this.w.pluginEditBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 70,
      height: 18,
      border: { type: "line" },
      style: {
        border: { fg: C.brightCyan },
        bg: C.black
      },
      label: ` EDIT: ${pluginId} `
    });
    import_blessed7.default.text({
      parent: this.w.pluginEditBox,
      top: 1,
      left: "center",
      content: "{bold}EDIT PLUGIN CONFIGURATION{/bold}",
      style: { fg: C.brightWhite },
      tags: true
    });
    this.w.pluginTextarea = import_blessed7.default.textarea({
      parent: this.w.pluginEditBox,
      top: 3,
      left: 2,
      width: 66,
      height: 11,
      content: configJson,
      style: {
        fg: C.white,
        bg: C.black,
        focus: { fg: C.white, bg: C.black }
      },
      border: { type: "line", fg: C.gray },
      keys: true,
      vi: true,
      mouse: true,
      scrollable: true,
      inputOnFocus: true
    });
    import_blessed7.default.text({
      parent: this.w.pluginEditBox,
      bottom: 1,
      left: "center",
      content: "{gray}Ctrl+S to save, Esc to cancel{/gray}",
      style: { fg: C.gray },
      tags: true
    });
    this.w.pluginTextarea.key(["C-s"], () => {
      try {
        const content2 = this.w.pluginTextarea.getValue();
        const parsed = JSON.parse(content2);
        this.settings.plugins[pluginId] = parsed;
        saveSettings3(this.settings);
        this.closePluginEditBox();
        this.closePluginConfigEditor();
        setImmediate(() => this.showPluginConfigEditor());
      } catch (err) {
        this.w.pluginTextarea.setValue(content + "\n\n/* ERROR: Invalid JSON - " + err.message + " */");
        this.screen.render();
      }
    });
    this.w.pluginTextarea.key(["escape"], () => {
      this.closePluginEditBox();
    });
    this.w.pluginTextarea.focus();
    this.screen.render();
    await transitions_default.transitionIn(this.screen, this.w.pluginEditBox, {
      duration: 150,
      fade: true,
      scale: true
    });
  }
  async closePluginEditBox() {
    if (this.w.pluginEditBox) {
      await transitions_default.transitionOut(this.screen, this.w.pluginEditBox, {
        duration: 150,
        fade: true,
        scale: true
      });
      this.w.pluginEditBox.destroy();
      delete this.w.pluginEditBox;
      delete this.w.pluginTextarea;
      this.screen.render();
    }
  }
  async deletePluginConfig(pluginId) {
    this.w.deleteConfirm = import_blessed7.default.question({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 50,
      height: "shrink",
      border: { type: "line" },
      style: { border: { fg: C.red }, bg: C.black },
      label: " Confirm Delete "
    });
    this.w.deleteConfirm.ask(`Delete config for "${pluginId}"?`, (err, value) => {
      if (value) {
        delete this.settings.plugins[pluginId];
        saveSettings3(this.settings);
      }
      this.w.deleteConfirm.destroy();
      delete this.w.deleteConfirm;
      this.closePluginConfigEditor();
      setImmediate(() => this.showPluginConfigEditor());
    });
  }
  // SESSION DETAIL VIEW
  showSessionDetail() {
    const sessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
    const maxDisplay = Math.min(6, sessions?.length || 0);
    if (!sessions || sessions.length === 0 || this.selectedSessionIndex < 0 || this.selectedSessionIndex >= maxDisplay) return;
    const actualIndex = this.paginationOffset * 6 + this.selectedSessionIndex;
    const session = sessions[actualIndex];
    this.w.detailBox = import_blessed7.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 70,
      height: 14,
      border: { type: "line" },
      style: {
        border: { fg: C.brightCyan },
        bg: C.black
      },
      label: " SESSION DETAIL "
    });
    const idleTime = session.updatedAt ? Math.floor((Date.now() - session.updatedAt) / 1e3 / 60) : 0;
    const idleStr = idleTime > 0 ? `${idleTime}m` : "<1m";
    const sessionId = session.sessionId || session.key;
    const isFavorite = this.settings.favorites && this.settings.favorites[sessionId];
    const favStatus = isFavorite ? "{yellow-fg}\u2605 Favorite{/yellow-fg}" : "{gray-fg}\u2606 Not favorite{/gray-fg}";
    const content2 = [
      `{bold}Session ID:{/bold} ${session.sessionId || session.key}`,
      `{bold}Agent:{/bold}     ${session.displayName || "unknown"}`,
      `{bold}Channel:{/bold}   ${session.channel || "unknown"}`,
      `{bold}Model:{/bold}     ${session.model || "unknown"}`,
      `{bold}Kind:{/bold}      ${session.kind || "other"}`,
      `{bold}Tokens:{/bold}    ${session.totalTokens || 0} total, ${session.contextTokens || 0} context`,
      `{bold}Idle:{/bold}      ${idleStr}`,
      `{bold}Favorite:{/bold}  ${favStatus}`,
      `{bold}Status:{/bold}   ${session.abortedLastRun ? "{red-fg}Aborted{/red-fg}" : "{green-fg}Active{/green-fg}"}`,
      ``,
      `{center}{gray}Press 'q' or 'Esc' to close{/gray}{/center}`
    ].join("\n");
    import_blessed7.default.text({
      parent: this.w.detailBox,
      top: 1,
      left: 1,
      width: "95%",
      height: "90%",
      content: content2,
      style: { fg: C.white },
      tags: true
    });
    this.w.detailBox.key(["escape", "q", "Q"], () => {
      this.closeSessionDetail();
    });
    transitions_default.transitionIn(this.screen, this.w.detailBox, {
      duration: 150,
      fade: true,
      scale: true
    });
    this.isModalActive = true;
  }
  async closeSessionDetail() {
    if (this.w.detailBox) {
      await transitions_default.transitionOut(this.screen, this.w.detailBox, {
        duration: 150,
        fade: true,
        scale: true
      });
      this.w.detailBox.destroy();
      delete this.w.detailBox;
      this.isModalActive = false;
      this.screen.render();
    }
  }
  // Toggle favorite status for current session
  toggleFavorite() {
    const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
    const maxDisplay = Math.min(6, allSessions?.length || 0);
    if (!allSessions || allSessions.length === 0 || this.selectedSessionIndex < 0 || this.selectedSessionIndex >= maxDisplay) return;
    const actualIndex = this.paginationOffset * 6 + this.selectedSessionIndex;
    const session = allSessions[actualIndex];
    const sessionId = session.sessionId || session.key;
    if (!this.settings.favorites) {
      this.settings.favorites = {};
    }
    if (this.settings.favorites[sessionId]) {
      delete this.settings.favorites[sessionId];
    } else {
      this.settings.favorites[sessionId] = true;
    }
    saveSettings3(this.settings);
    this.render();
  }
  // Toggle filter to show only favorites
  toggleFavoritesFilter() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.settings.showFavoritesOnly = this.showFavoritesOnly;
    saveSettings3(this.settings);
    if (this.showFavoritesOnly) {
      this.filteredSessions = this.data.sessions.filter((s) => {
        const sessionId = s.sessionId || s.key;
        return this.settings.favorites && this.settings.favorites[sessionId];
      });
    } else {
      if (this.sessionSearchQuery) {
        this.filterSessions();
      } else {
        this.filteredSessions = [];
      }
    }
    this.selectedSessionIndex = 0;
    this.paginationOffset = 0;
    this.render();
  }
  // SESSION SEARCH/FILTER
  showSearch() {
    if (this.isSearchMode) return;
    this.isSearchMode = true;
    this.w.searchBox = import_blessed7.default.box({
      parent: this.screen,
      bottom: 1,
      left: 0,
      width: "100%",
      height: 3,
      border: { type: "line" },
      style: {
        border: { fg: C.brightYellow },
        bg: C.black
      },
      label: " SEARCH "
    });
    this.w.searchInput = import_blessed7.default.textbox({
      parent: this.w.searchBox,
      top: 1,
      left: 1,
      width: "95%",
      height: 1,
      inputOnFocus: true,
      style: {
        fg: C.brightWhite,
        bg: C.black
      }
    });
    this.w.searchInput.on("keypress", (ch, key) => {
      if (key.name === "escape") {
        this.closeSearch();
        return;
      }
      if (key.name === "return") {
        this.closeSearch();
        return;
      }
      setTimeout(() => {
        this.sessionSearchQuery = this.w.searchInput.getValue().toLowerCase();
        this.settings.sessionSearchQuery = this.sessionSearchQuery;
        saveSettings3(this.settings);
        this.filterSessions();
        this.screen.render();
      }, 10);
    });
    if (this.sessionSearchQuery) {
      this.w.searchInput.setValue(this.sessionSearchQuery);
    }
    this.w.searchInput.focus();
    transitions_default.transitionIn(this.screen, this.w.searchBox, {
      duration: 150,
      fade: true,
      slide: true,
      slideDirection: "up"
    });
    this.isModalActive = true;
  }
  async closeSearch() {
    if (this.w.searchBox) {
      await transitions_default.transitionOut(this.screen, this.w.searchBox, {
        duration: 150,
        fade: true,
        slide: true,
        slideDirection: "down"
      });
      this.w.searchBox.destroy();
      delete this.w.searchBox;
      delete this.w.searchInput;
      this.isSearchMode = false;
      this.sessionSearchQuery = "";
      this.settings.sessionSearchQuery = "";
      saveSettings3(this.settings);
      this.filteredSessions = [];
      this.selectedSessionIndex = 0;
      this.paginationOffset = 0;
      this.isModalActive = false;
      this.refresh();
      this.screen.render();
    }
  }
  filterSessions() {
    if (!this.data.sessions || this.data.sessions.length === 0) {
      this.filteredSessions = [];
      this.selectedSessionIndex = 0;
      this.paginationOffset = 0;
      return;
    }
    if (!this.sessionSearchQuery) {
      this.filteredSessions = [];
      this.selectedSessionIndex = 0;
      this.paginationOffset = 0;
      return;
    }
    this.filteredSessions = this.data.sessions.filter((s) => {
      const searchStr = `${s.sessionId || s.key} ${s.displayName || ""} ${s.channel || ""} ${s.model || ""} ${s.kind || ""}`.toLowerCase();
      return searchStr.includes(this.sessionSearchQuery);
    });
  }
  // Fetch sessions from all configured gateway endpoints using gateway manager
  async fetchSessions() {
    try {
      const { sessions, stats } = await gateway_manager_default.fetchAllSessions();
      this.data.gatewayStats = stats;
      this.corruptedSessionsCount = 0;
      if (stats.totalEndpoints > 0 && stats.reachableEndpoints === 0) {
        const shouldAutoRetry = this.shouldAutoRetryGateway();
        if (shouldAutoRetry) {
          logger_default.info("All gateways unreachable - triggering auto-retry");
          this.triggerAutoRetry();
        }
      }
      return sessions;
    } catch (err) {
      logger_default.warn("Failed to fetch sessions from gateways: " + err.message);
      this.data.gatewayStats = { totalEndpoints: 0, reachableEndpoints: 0, error: err.message };
      const shouldAutoRetry = this.shouldAutoRetryGateway();
      if (shouldAutoRetry) {
        logger_default.info("Gateway fetch failed - triggering auto-retry");
        this.triggerAutoRetry();
      }
      return [];
    }
  }
  // Track auto-retry timing to prevent spam
  shouldAutoRetryGateway() {
    const autoRetry = this.settings?.autoRetry || {};
    if (autoRetry.enabled === false) {
      return false;
    }
    const now = Date.now();
    const lastRetry = this._lastGatewayAutoRetry || 0;
    const baseInterval = autoRetry.intervalMs || 3e4;
    let effectiveInterval = baseInterval;
    if (autoRetry.exponentialBackoff !== false) {
      const failCount = gateway_manager_default.getTotalFailCount();
      const threshold = autoRetry.consecutiveFailureThreshold || 3;
      if (failCount >= threshold) {
        const multiplier = autoRetry.backoffMultiplier || 2;
        const maxBackoff = autoRetry.maxBackoffIntervalMs || 3e5;
        const backoffSteps = Math.max(0, failCount - threshold + 1);
        effectiveInterval = Math.min(
          baseInterval * Math.pow(multiplier, backoffSteps),
          maxBackoff
        );
      }
    }
    if (now - lastRetry >= effectiveInterval) {
      this._lastGatewayAutoRetry = now;
      this._lastAutoRetryInterval = effectiveInterval;
      return true;
    }
    return false;
  }
  // Trigger automatic gateway retry in background
  async triggerAutoRetry() {
    try {
      if (this.w.footerText) {
        const interval = this._lastAutoRetryInterval;
        const intervalText = interval ? ` (${Math.round(interval / 1e3)}s)` : "";
        this.w.footerText.setContent(`{yellow-fg}\u27F3 Auto-retrying gateways...${intervalText}{/yellow-fg}`);
        this.screen.render();
      }
      const result = await gateway_manager_default.forceRetry();
      if (result.successful > 0) {
        logger_default.info(`Auto-retry successful: ${result.successful}/${result.attempted} gateways reconnected`);
        const autoRetry = this.settings?.autoRetry || {};
        if (autoRetry.resetAfterSuccess !== false && autoRetry.exponentialBackoff !== false) {
          gateway_manager_default.clearAllFailCounts();
          logger_default.debug("Reset gateway failure counts after successful auto-retry");
        }
        setTimeout(() => this.refresh(), 500);
      } else {
        logger_default.debug(`Auto-retry completed but no gateways reconnected`);
      }
    } catch (err) {
      logger_default.warn("Auto-retry failed: " + err.message);
    }
  }
  async start() {
    await database_default.initDatabase();
    database_default.cleanupOldData(30);
    gateway_manager_default.init(this.settings);
    performance_monitor_default.start();
    setWorkerPool(worker_pool_default);
    this.startConfigWatcher();
    if (cliOptions.watch) {
      this.startPluginWatcher();
    }
    this.refresh();
    this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
    this.autoSaveManager.start();
  }
  /**
   * Start watching settings file for hot-reload
   */
  startConfigWatcher() {
    try {
      this.configWatcher = watchSettingsFile(
        SETTINGS_PATH3,
        (newSettings) => this.handleSettingsHotReload(newSettings),
        { debounceMs: 500 }
      );
      if (this.configWatcher) {
        logger_default.info("ConfigWatcher: Hot-reload enabled for settings");
      }
    } catch (err) {
      logger_default.warn(`ConfigWatcher: Failed to start watching settings: ${err.message}`);
    }
  }
  /**
   * Stop watching settings file
   */
  stopConfigWatcher() {
    if (this.configWatcher) {
      this.configWatcher.unwatchAll();
      this.configWatcher = null;
      logger_default.info("ConfigWatcher: Hot-reload disabled");
    }
  }
  /**
   * Handle settings hot-reload when file changes
   * @param {Object} newSettings - New settings from file
   */
  handleSettingsHotReload(newSettings) {
    try {
      logger_default.info("ConfigWatcher: Processing settings hot-reload");
      const validationResult = validation_default.validateSettings(newSettings);
      if (!validationResult.valid) {
        logger_default.warn(`ConfigWatcher: Invalid settings detected, ignoring reload: ${validationResult.errors?.join(", ")}`);
        return;
      }
      const oldSettings = { ...this.settings };
      this.settings = validationResult.value;
      if (oldSettings.refreshInterval !== this.settings.refreshInterval) {
        clearInterval(this.timer);
        this.currentRefreshInterval = this.settings.refreshInterval;
        this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
        logger_default.info(`ConfigWatcher: Refresh interval updated to ${this.settings.refreshInterval}ms`);
      }
      if (oldSettings.theme !== this.settings.theme) {
        loadTheme(this.settings.theme);
        this.applyTheme();
        logger_default.info(`ConfigWatcher: Theme changed to ${this.settings.theme}`);
      }
      const widgetVisibilityChanged = oldSettings.showWidget1 !== this.settings.showWidget1 || oldSettings.showWidget2 !== this.settings.showWidget2 || oldSettings.showWidget3 !== this.settings.showWidget3 || oldSettings.showWidget4 !== this.settings.showWidget4 || oldSettings.showWidget5 !== this.settings.showWidget5 || oldSettings.showWidget6 !== this.settings.showWidget6 || oldSettings.showWidget7 !== this.settings.showWidget7 || oldSettings.showWidget8 !== this.settings.showWidget8;
      if (widgetVisibilityChanged) {
        this._previousVisibleState = null;
        this.recalculateLayout();
        logger_default.info("ConfigWatcher: Widget visibility updated, layout recalculated");
      }
      if (oldSettings.logLevelFilter !== this.settings.logLevelFilter) {
        logger_default.info(`ConfigWatcher: Log level filter changed to ${this.settings.logLevelFilter}`);
      }
      if (JSON.stringify(oldSettings.gatewayEndpoints) !== JSON.stringify(this.settings.gatewayEndpoints)) {
        gateway_manager_default.init(this.settings);
        logger_default.info("ConfigWatcher: Gateway endpoints updated");
      }
      try {
        this.screen.render();
      } catch (err) {
        logger_default.warn(`ConfigWatcher: Render error after reload: ${err.message}`);
      }
      logger_default.info("ConfigWatcher: Settings hot-reload complete");
    } catch (err) {
      logger_default.error(`ConfigWatcher: Error handling settings reload: ${err.message}`);
    }
  }
  /**
   * Start watching plugins directory for hot-reload
   */
  startPluginWatcher() {
    try {
      const widgetLoader = new WidgetLoader();
      this.pluginReloadManager = new PluginReloadManager({
        widgetLoader,
        pluginsDir: config_default.PATHS.PLUGINS_DIR,
        debounceMs: 300,
        autoReload: true,
        showNotifications: true
      });
      this.pluginReloadManager.addHook("afterReload", ({ id, loadTime, isNew }) => {
        const action = isNew ? "loaded" : "reloaded";
        logger_default.info(`Plugin '${id}' ${action} successfully in ${loadTime}ms`);
        if (this.showNotification) {
          this.showNotification(`Plugin '${id}' ${action}`, "info");
        }
      });
      this.pluginReloadManager.addHook("onError", ({ id, error, type }) => {
        logger_default.error(`Plugin '${id}' hot-reload error (${type}): ${error.message}`);
        if (this.showNotification) {
          this.showNotification(`Plugin '${id}' reload failed: ${error.message}`, "error");
        }
      });
      const result = this.pluginReloadManager.start();
      if (result) {
        logger_default.info("PluginWatcher: Hot-reload enabled for plugins");
      } else {
        logger_default.warn("PluginWatcher: Failed to start watching plugins");
      }
    } catch (err) {
      logger_default.warn(`PluginWatcher: Failed to start plugin watcher: ${err.message}`);
    }
  }
  /**
   * Stop watching plugins directory
   */
  stopPluginWatcher() {
    if (this.pluginReloadManager) {
      this.pluginReloadManager.stop();
      this.pluginReloadManager = null;
      logger_default.info("PluginWatcher: Hot-reload disabled");
    }
  }
  updateHistory(cpu, mem) {
    this.history.cpu.push(cpu);
    this.history.cpu.shift();
    this.history.memory.push(mem);
    this.history.memory.shift();
  }
  // Adaptive refresh: slow down when no active agents
  updateAdaptiveRefresh() {
    const now = Date.now();
    let activeCount = 0;
    if (this.data.sessions && this.data.sessions.length > 0) {
      for (const session of this.data.sessions) {
        const sessionIdleTime = session.updatedAt ? now - session.updatedAt : IDLE_THRESHOLD_MS2 + 1;
        if (sessionIdleTime < IDLE_THRESHOLD_MS2) {
          activeCount++;
        }
      }
    }
    const wasActive = this.activeAgentCount > 0;
    this.activeAgentCount = activeCount;
    const targetInterval = activeCount > 0 ? ACTIVE_REFRESH_INTERVAL : IDLE_REFRESH_INTERVAL;
    if (this.currentRefreshInterval !== targetInterval) {
      this.currentRefreshInterval = targetInterval;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = setInterval(() => this.refresh(), this.currentRefreshInterval);
      }
      this.lastActivityTime = now;
    }
  }
  async refresh() {
    const now = Date.now();
    const elapsed = now - this.lastTime;
    const visible = this.getVisibleWidgets();
    const workerStatus = worker_pool_default.getStatus();
    const degradationLevel = workerStatus.degradation?.level || "none";
    try {
      const cpuUpdate = visible.cpu && this.shouldWidgetUpdate("cpu", now);
      const memoryUpdate = visible.memory && this.shouldWidgetUpdate("memory", now);
      if (cpuUpdate?.shouldUpdate || memoryUpdate?.shouldUpdate) {
        try {
          const [cpu, mem] = await Promise.all([cache_default.getCpuData(), cache_default.getMemoryData()]);
          this.data.cpu = cpu.cpus.map((c) => c.load);
          this.data.cpuAvg = cpu.currentLoad;
          const actualUsed = mem.available ? mem.total - mem.available : mem.used;
          this.data.memory = {
            usedGB: (actualUsed / 1024 ** 3).toFixed(1),
            totalGB: (mem.total / 1024 ** 3).toFixed(1),
            percent: Math.round(actualUsed / mem.total * 100),
            cachedGB: ((mem.used - actualUsed) / 1024 ** 3).toFixed(1)
            // Track cache separately
          };
          this.updateHistory(this.data.cpuAvg, this.data.memory.percent);
          this.dataTimestamps.cpu = now;
          this.dataTimestamps.memory = now;
          this.recordWidgetUpdate("cpu", now);
          this.recordWidgetUpdate("memory", now);
        } catch (e) {
          logger_default.warn(`CPU/Memory fetch failed: ${e.message}`);
          this.data.cpu = this.data.cpu || [];
          this.data.cpuAvg = this.data.cpuAvg || 0;
          this.data.memory = this.data.memory || { usedGB: "0", totalGB: "0", percent: 0 };
        }
      }
      if (visible.system || visible.uptime) {
        try {
          const systemData = await cache_default.getSystemData();
          const os13 = systemData.os;
          const ver = systemData.ver;
          const time = systemData.time;
          this.data.system = `${os13.distro || "macOS"} ${os13.release} (${os13.arch})  Node v${ver.node}`;
          this.data.systemUptime = time.uptime;
          this.dataTimestamps.system = now;
          this.recordWidgetUpdate("system", now);
          this.recordWidgetUpdate("uptime", now);
        } catch (e) {
          logger_default.warn(`System data fetch failed: ${e.message}`);
          this.data.system = this.data.system || "System unavailable";
          this.data.systemUptime = this.data.systemUptime || 0;
        }
      }
      if (visible.disk) {
        try {
          const fsSize = await cache_default.getDiskData();
          const rootFs = fsSize.find((f) => f.mount === "/") || fsSize[0];
          if (rootFs) {
            this.data.disk = {
              usedGB: (rootFs.used / 1024 ** 3).toFixed(1),
              availableGB: (rootFs.available / 1024 ** 3).toFixed(1),
              totalGB: (rootFs.size / 1024 ** 3).toFixed(1),
              percent: Math.round(rootFs.use),
              mount: rootFs.mount,
              fs: rootFs.fs
            };
            this.dataTimestamps.disk = now;
            this.recordWidgetUpdate("disk", now);
          }
        } catch (e) {
          logger_default.warn(`Disk fetch failed: ${e.message}`);
          this.data.disk = this.data.disk || null;
        }
      }
      if (visible.cpu || visible.memory || visible.disk) {
        try {
          const cpuPercent = Math.round(this.data.cpuAvg || 0);
          const memPercent = this.data.memory?.percent || 0;
          const diskPercent = this.data.disk?.percent || 0;
          const newAlerts = alerts_default.checkAllMetrics({
            cpu: cpuPercent,
            memory: memPercent,
            disk: diskPercent
          });
          if (newAlerts.length > 0) {
            this.updateAlertDisplay();
          }
        } catch (e) {
        }
      }
      try {
        this.data.containerEnv = await container_detector_default.detectContainerEnv();
      } catch (e) {
        logger_default.warn(`Container detection failed: ${e.message}`);
        this.data.containerEnv = this.data.containerEnv || null;
      }
      if (visible.gpu) {
        try {
          const platform = getPlatform();
          if (platform === "linux") {
            this.data.gpu = await getLinuxGPU();
          } else if (platform === "win32") {
            this.data.gpu = await getWindowsGPU();
          } else {
            this.data.gpu = await getMacGPU();
          }
          this.dataTimestamps.gpu = now;
          this.recordWidgetUpdate("gpu", now);
        } catch (e) {
          logger_default.warn(`GPU fetch failed: ${e.message}`);
          this.data.gpu = this.data.gpu || null;
        }
      }
      if (visible.network) {
        try {
          const netStats = await cache_default.getNetworkData();
          const primaryInterface = netStats.find((n) => n.operstate === "up" && !n.internal) || netStats[0];
          if (primaryInterface) {
            const now2 = Date.now();
            const interfaceChanged = this.lastNetStats && this.data.network && this.data.network.interface !== primaryInterface.iface;
            const suspiciousDiff = this.lastNetTime && this.lastNetStats && (primaryInterface.rx_bytes < this.lastNetStats.rx_bytes || primaryInterface.tx_bytes < this.lastNetStats.tx_bytes);
            const shouldReset = interfaceChanged || suspiciousDiff;
            if (shouldReset) {
              if (interfaceChanged) {
                logger_default.info(`Network interface changed: ${this.data.network.interface} -> ${primaryInterface.iface}`);
              } else if (suspiciousDiff) {
                logger_default.info("Network counters reset or overflow detected");
              }
              this.history.netRx = new Array(config_default.HISTORY.NETWORK_LENGTH).fill(0);
              this.history.netTx = new Array(config_default.HISTORY.NETWORK_LENGTH).fill(0);
            }
            if (this.lastNetTime && this.lastNetStats && !shouldReset) {
              const elapsedSec = (now2 - this.lastNetTime) / 1e3;
              const rxDiff = Math.max(0, primaryInterface.rx_bytes - this.lastNetStats.rx_bytes);
              const txDiff = Math.max(0, primaryInterface.tx_bytes - this.lastNetStats.tx_bytes);
              this.data.network = {
                rxSec: rxDiff / elapsedSec,
                txSec: txDiff / elapsedSec,
                rxTotal: primaryInterface.rx_bytes,
                txTotal: primaryInterface.tx_bytes,
                interface: primaryInterface.iface
              };
              this.history.netRx.push(this.data.network.rxSec);
              this.history.netRx.shift();
              this.history.netTx.push(this.data.network.txSec);
              this.history.netTx.shift();
            } else {
              this.data.network = {
                rxSec: 0,
                txSec: 0,
                rxTotal: primaryInterface.rx_bytes,
                txTotal: primaryInterface.tx_bytes,
                interface: primaryInterface.iface
              };
            }
            this.lastNetStats = { rx_bytes: primaryInterface.rx_bytes, tx_bytes: primaryInterface.tx_bytes };
            this.lastNetTime = now2;
            this.dataTimestamps.network = now2;
            this.recordWidgetUpdate("network", now2);
          }
        } catch (e) {
          logger_default.warn(`Network fetch failed: ${e.message}`);
          this.data.network = this.data.network || null;
        }
      }
      try {
        const sessions = await this.fetchSessions();
        this.data.sessions = sessions || [];
        this.data.openclaw = { gateway: { reachable: true } };
        this.dataTimestamps.sessions = now;
        const activeSessionKeys = new Set(this.data.sessions.map((s) => s.key));
        for (const key of Object.keys(this.data.sessionTPS)) {
          if (!activeSessionKeys.has(key)) {
            delete this.data.sessionTPS[key];
          }
        }
        for (const key of Object.keys(this.data.sessionLastTPS)) {
          if (!activeSessionKeys.has(key)) {
            delete this.data.sessionLastTPS[key];
          }
        }
      } catch (err) {
        logger_default.error("Session fetch error:", err.message);
        this.data.sessions = this.data.sessions || [];
        this.data.openclaw = { gateway: { reachable: false } };
      }
      this.updateAdaptiveRefresh();
      if (this.data.openclaw?.sessions?.recent && this.prev?.openclaw?.sessions?.recent) {
        for (const session of this.data.openclaw.sessions.recent) {
          const prevSession = this.prev.openclaw.sessions.recent.find((s) => s.key === session.key);
          const tps = calcTPS(session, prevSession, elapsed);
          if (tps !== null) {
            this.data.sessionTPS[session.key] = { value: tps, active: true };
            this.data.sessionLastTPS[session.key] = tps;
          } else {
            const lastTPS = this.data.sessionLastTPS?.[session.key];
            this.data.sessionTPS[session.key] = { value: lastTPS || null, active: false };
          }
        }
        const activeSessionKeys = new Set(this.data.openclaw.sessions.recent.map((s) => s.key));
        for (const key of Object.keys(this.data.sessionTPS)) {
          if (!activeSessionKeys.has(key)) {
            delete this.data.sessionTPS[key];
          }
        }
        for (const key of Object.keys(this.data.sessionLastTPS)) {
          if (!activeSessionKeys.has(key)) {
            delete this.data.sessionLastTPS[key];
          }
        }
      }
      this.data.gatewayUptime = await getGatewayUptime();
      try {
        const { stdout } = await execAsync3("openclaw logs --limit 200 --plain 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.OPENCLAW_LOGS });
        const filterFn = getLogFilterFn2(this.settings.logLevelFilter || "all");
        const lines = stdout.trim().split("\n").filter((line) => !line.includes("plugin CLI register skipped")).filter((line) => filterFn(line));
        const MAX_LOG_LINES = 500;
        if (lines.length > 0) {
          this.logLines = lines.slice(-MAX_LOG_LINES);
        }
      } catch (e) {
      }
      this.prev = JSON.parse(JSON.stringify(this.data));
      this.lastTime = now;
      performance_monitor_default.record(this.settings.refreshInterval);
      this.render();
      database_default.storeMetricsSnapshot(this.data);
    } catch (e) {
    }
  }
  render() {
    this.diffRenderer.beginBatch();
    const visible = this.getVisibleWidgets();
    if (visible.cpu) {
      const cpuPercent = Math.round(this.data.cpuAvg || 0);
      this.diffRenderer.setContent("cpuValue", this.w.cpuValue, `${cpuPercent}%`);
      this.diffRenderer.setFg("cpuValue", this.w.cpuValue, getColor(cpuPercent));
      this.diffRenderer.setContent("cpuDetail", this.w.cpuDetail, `${this.data.cpu?.length || 0} cores`);
    }
    if (visible.memory) {
      const memPercent = this.data.memory.percent || 0;
      this.diffRenderer.setContent("memValue", this.w.memValue, `${memPercent}%`);
      this.diffRenderer.setFg("memValue", this.w.memValue, getColor(memPercent));
      this.diffRenderer.setContent("memDetail", this.w.memDetail, `${this.data.memory.usedGB}/${this.data.memory.totalGB}`);
    }
    if (visible.gpu) {
      if (this.data.gpu) {
        this.diffRenderer.setContent("gpuValue", this.w.gpuValue, this.data.gpu.short);
        this.diffRenderer.setFg("gpuValue", this.w.gpuValue, C.brightYellow);
        let details = [];
        if (this.data.gpu.utilization != null) details.push(`${Math.round(this.data.gpu.utilization)}% util`);
        if (this.data.gpu.frequency) details.push(`${this.data.gpu.frequency}MHz`);
        this.diffRenderer.setContent("gpuDetail", this.w.gpuDetail, details.join("  ") || "Apple Silicon");
        this.diffRenderer.setFg("gpuDetail", this.w.gpuDetail, C.gray);
      } else {
        this.diffRenderer.setContent("gpuValue", this.w.gpuValue, "Not Detected");
        this.diffRenderer.setFg("gpuValue", this.w.gpuValue, C.gray);
        this.diffRenderer.setContent("gpuDetail", this.w.gpuDetail, "");
      }
    }
    if (visible.network) {
      if (this.data.network) {
        const rxStr = formatBitsPerSecond(this.data.network.rxSec);
        const txStr = formatBitsPerSecond(this.data.network.txSec);
        const netText = `\u25BC${rxStr} \u25B2${txStr}`;
        this.diffRenderer.setContent("netValue", this.w.netValue, netText);
        this.diffRenderer.setFg("netValue", this.w.netValue, C.brightCyan);
        this.diffRenderer.setContent("netDetail", this.w.netDetail, this.data.network.interface || "eth0");
      } else {
        this.diffRenderer.setContent("netValue", this.w.netValue, "No network");
        this.diffRenderer.setFg("netValue", this.w.netValue, C.gray);
        this.diffRenderer.setContent("netDetail", this.w.netDetail, "");
      }
    }
    const isOnline = this.data.openclaw?.gateway?.reachable;
    if (isOnline) {
      this.diffRenderer.setFg("logo", this.w.logo, C.brightCyan);
    } else {
      this.diffRenderer.setFg("logo", this.w.logo, C.red);
    }
    if (this.data.sessions.length) {
      const sessionsToRender = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const sortMode2 = this.settings.sessionSortMode || "time";
      const sortedSessions = [...sessionsToRender].sort((a, b) => {
        switch (sortMode2) {
          case "time":
            return (b.updatedAt || 0) - (a.updatedAt || 0);
          // Most recent first
          case "tokens":
            return (b.totalTokens || 0) - (a.totalTokens || 0);
          // Most tokens first
          case "idle":
            const idleA = a.updatedAt ? Date.now() - a.updatedAt : 0;
            const idleB = b.updatedAt ? Date.now() - b.updatedAt : 0;
            return idleB - idleA;
          // Longest idle first
          case "name":
            return (a.displayName || "").localeCompare(b.displayName || "");
          // A-Z
          default:
            return (b.updatedAt || 0) - (a.updatedAt || 0);
        }
      });
      const pageSize = 6;
      const startIdx = this.paginationOffset * pageSize;
      const endIdx = startIdx + pageSize;
      const displaySessions = sortedSessions.slice(startIdx, endIdx);
      if (this.selectedSessionIndex >= displaySessions.length) {
        this.selectedSessionIndex = Math.max(0, displaySessions.length - 1);
      }
      if (this.selectedSessionIndex < 0) {
        this.selectedSessionIndex = 0;
      }
      const lines = displaySessions.map((s, idx) => {
        const isSelected = idx === this.selectedSessionIndex;
        const selectedPrefix = isSelected ? "{inverse}" : "";
        const selectedSuffix = isSelected ? "{/inverse}" : "";
        const idleMs = s.updatedAt ? Date.now() - s.updatedAt : 0;
        let statusStr;
        if (idleMs < 5 * 60 * 1e3) {
          statusStr = `{green-fg}active{/green-fg}`;
        } else if (idleMs < 30 * 60 * 1e3) {
          statusStr = `{yellow-fg}idle  {/yellow-fg}`;
        } else {
          statusStr = `{gray-fg}stale {/gray-fg}`;
        }
        const sessionId = s.sessionId || s.key;
        const isFavorite = this.settings.favorites && this.settings.favorites[sessionId];
        const favIndicator = isFavorite ? "{yellow-fg}\u2605{/yellow-fg}" : " ";
        let agentName = s.displayName || "unknown";
        agentName = agentName.replace(/^Cron: /, "").substring(0, 45).padEnd(45);
        const model = (s.model?.replace("moonshot/", "").replace("openrouter/", "or/")?.substring(0, 15) || "-").padEnd(15);
        const currentTokens = s.totalTokens || 0;
        const maxTokens = s.contextWindow || s.contextTokens || 0;
        const formatToks = (n) => {
          if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
          if (n >= 1e3) return Math.round(n / 1e3) + "K";
          return n.toString();
        };
        const context = `${formatToks(currentTokens)}/${formatToks(maxTokens)}`.padEnd(12);
        let idle;
        if (idleMs < 6e4) idle = `${Math.round(idleMs / 1e3)}s`;
        else if (idleMs < 36e5) idle = `${Math.round(idleMs / 6e4)}m`;
        else idle = `${Math.round(idleMs / 36e5)}h`;
        idle = idle.padEnd(7);
        const channel = (s.channel || "-").substring(0, 10).padEnd(10);
        return `${selectedPrefix}${favIndicator}${statusStr} ${agentName} ${model} ${context} ${idle} ${channel}${selectedSuffix}`;
      });
      this.diffRenderer.setContent("sessList", this.w.sessList, lines.join("\n").replace(/\n$/, ""));
      const totalCount = sortedSessions.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const currentPage = this.paginationOffset + 1;
      let countText = "";
      if (totalCount > pageSize) {
        countText = `Page ${currentPage}/${totalPages}`;
        const remaining = totalCount - (this.paginationOffset + 1) * pageSize;
        if (remaining > 0) {
          this.diffRenderer.setContent("sessTruncated", this.w.sessTruncated, `... and ${remaining} more`);
        } else {
          this.diffRenderer.setContent("sessTruncated", this.w.sessTruncated, "");
        }
      } else {
        countText = `${totalCount}`;
        this.diffRenderer.setContent("sessTruncated", this.w.sessTruncated, "");
      }
      this.diffRenderer.setContent("sessCount", this.w.sessCount, countText);
    } else {
      this.diffRenderer.setContent("sessList", this.w.sessList, "No active sessions");
      this.diffRenderer.setContent("sessCount", this.w.sessCount, "0 sessions");
      this.diffRenderer.setContent("sessTruncated", this.w.sessTruncated, "");
    }
    if (this.logLines.length) {
      const filter = this.settings.logLevelFilter || "all";
      const filterFn = getLogFilterFn2(filter);
      const filteredLogs = this.logLines.filter((line) => filterFn(line));
      const logHeight = this.w.logBox.height || 15;
      const logWidth = (this.w.logBox.width || 80) - 4;
      const availableLines = Math.max(1, logHeight - 2);
      let usedLines = 0;
      const logsToShow = [];
      for (let i = filteredLogs.length - 1; i >= 0; i--) {
        const log = filteredLogs[i];
        const lineCount = calculateWrappedLines(log, logWidth);
        if (usedLines + lineCount <= availableLines) {
          logsToShow.unshift(log);
          usedLines += lineCount;
        } else {
          break;
        }
      }
      const coloredLines = logsToShow.map((line) => colorizeLogLine(line));
      this.diffRenderer.setContent("logContent", this.w.logContent, coloredLines.join("\n"));
    } else {
      this.diffRenderer.setContent("logContent", this.w.logContent, "No log output");
    }
    if (this.data.system) {
      const parts = this.data.system.split("  ");
      this.diffRenderer.setContent("sysInfoLine1", this.w.sysInfoLine1, parts[0] || "macOS");
      if (this.data.containerEnv?.isContainer) {
        const containerInfo = container_detector_default.getContainerIndicator(this.data.containerEnv);
        this.diffRenderer.setContent("sysInfoLine2", this.w.sysInfoLine2, containerInfo);
      } else {
        this.diffRenderer.setContent("sysInfoLine2", this.w.sysInfoLine2, parts[1] || "");
      }
    } else {
      this.diffRenderer.setContent("sysInfoLine1", this.w.sysInfoLine1, "Unknown System");
      this.diffRenderer.setContent("sysInfoLine2", this.w.sysInfoLine2, "");
    }
    let openclawText = "openclaw unknown";
    if (this.data.version) {
      const current = this.data.version.replace(/-\d+$/, "");
      const latest = this.data.latest;
      if (latest && current !== "unknown") {
        if (current === latest) {
          openclawText = `openclaw ${current} \u2713`;
        } else {
          openclawText = `openclaw ${current} \u2192 ${latest}`;
        }
      } else {
        openclawText = `openclaw ${current}`;
      }
    }
    this.diffRenderer.setContent("title", this.w.title, `Dashboard ${DASHBOARD_VERSION}, ${openclawText}`);
    const now = /* @__PURE__ */ new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    if (this.isPaused) {
      this.diffRenderer.setContent("clock", this.w.clock, `${timeStr} ${dateStr}  {yellow-fg}[PAUSED]{/yellow-fg}`);
    } else {
      this.diffRenderer.setContent("clock", this.w.clock, `${timeStr} ${dateStr}`);
    }
    if (visible.disk) {
      if (this.data.disk) {
        const diskPercent = this.data.disk.percent || 0;
        this.diffRenderer.setContent("diskValue", this.w.diskValue, `${diskPercent}%`);
        this.diffRenderer.setFg("diskValue", this.w.diskValue, getColor(diskPercent));
        this.diffRenderer.setContent("diskDetail", this.w.diskDetail, `${this.data.disk.usedGB}/${this.data.disk.totalGB}`);
        this.diffRenderer.setBorderFg("diskBox", this.w.diskBox, getColor(diskPercent));
      } else {
        this.diffRenderer.setContent("diskValue", this.w.diskValue, "No disk info");
        this.diffRenderer.setFg("diskValue", this.w.diskValue, C.gray);
        this.diffRenderer.setContent("diskDetail", this.w.diskDetail, "");
      }
    }
    if (visible.uptime) {
      const sysUptime = formatDuration(this.data.systemUptime);
      const gwUptime = formatDuration(this.data.gatewayUptime);
      this.diffRenderer.setContent("uptimeSys", this.w.uptimeSys, `Sys: ${sysUptime}`);
      this.diffRenderer.setContent("uptimeClaw", this.w.uptimeClaw, `Claw: ${gwUptime}`);
      if (this.data.openclaw?.gateway?.reachable) {
        this.diffRenderer.setFg("uptimeSys", this.w.uptimeSys, C.brightMagenta);
        this.diffRenderer.setFg("uptimeClaw", this.w.uptimeClaw, C.brightMagenta);
        this.diffRenderer.setBorderFg("uptimeBox", this.w.uptimeBox, C.brightMagenta);
      } else if (this.data.systemUptime) {
        this.diffRenderer.setFg("uptimeSys", this.w.uptimeSys, C.yellow);
        this.diffRenderer.setFg("uptimeClaw", this.w.uptimeClaw, C.yellow);
        this.diffRenderer.setBorderFg("uptimeBox", this.w.uptimeBox, C.yellow);
      } else {
        this.diffRenderer.setFg("uptimeSys", this.w.uptimeSys, C.gray);
        this.diffRenderer.setFg("uptimeClaw", this.w.uptimeClaw, C.gray);
        this.diffRenderer.setBorderFg("uptimeBox", this.w.uptimeBox, C.gray);
      }
    }
    if (visible.health) {
      const nowRender = Date.now();
      const staleThresholdMs = 5e3;
      const veryStaleThresholdMs = 15e3;
      const timestamps = Object.values(this.dataTimestamps).filter((t) => t !== null);
      const oldestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : null;
      const dataAge = oldestTimestamp ? nowRender - oldestTimestamp : null;
      let healthStatus = "Initializing";
      let healthColor = C.gray;
      let healthBorder = C.gray;
      let healthDetail = "";
      if (dataAge !== null) {
        const ageSec = Math.round(dataAge / 1e3);
        if (dataAge < staleThresholdMs) {
          healthStatus = "All Fresh";
          healthColor = C.brightGreen;
          healthBorder = C.green;
          healthDetail = `Last update: ${ageSec}s ago`;
        } else if (dataAge < veryStaleThresholdMs) {
          healthStatus = "Stale Data";
          healthColor = C.yellow;
          healthBorder = C.yellow;
          healthDetail = `${ageSec}s since last refresh`;
        } else {
          healthStatus = "Data Delayed";
          healthColor = C.red;
          healthBorder = C.red;
          healthDetail = `${ageSec}s - check system`;
        }
      }
      this.diffRenderer.setContent("healthStatus", this.w.healthStatus, healthStatus);
      this.diffRenderer.setFg("healthStatus", this.w.healthStatus, healthColor);
      this.diffRenderer.setContent("healthDetail", this.w.healthDetail, healthDetail);
      this.diffRenderer.setBorderFg("healthBox", this.w.healthBox, healthBorder);
    }
    if (visible.gateway) {
      const gatewayHealth2 = gateway_manager_default.getEndpointHealth();
      const total = gatewayHealth2.length;
      const reachable = gatewayHealth2.filter((ep) => ep.enabled && ep.reachable).length;
      const unreachable = gatewayHealth2.filter((ep) => ep.enabled && !ep.reachable).length;
      let gatewayStatus = "Checking...";
      let gatewayColor = C.gray;
      let gatewayBorder = C.gray;
      let gatewayDetail = "";
      if (total === 0) {
        gatewayStatus = "No Endpoints";
        gatewayColor = C.yellow;
        gatewayBorder = C.yellow;
      } else if (unreachable === 0) {
        gatewayStatus = `{green-fg}\u2713{/green-fg} All Online (${reachable}/${total})`;
        gatewayColor = C.brightGreen;
        gatewayBorder = C.green;
      } else if (reachable === 0) {
        gatewayStatus = `{red-fg}\u2717{/red-fg} All Offline (${unreachable}/${total})`;
        gatewayColor = C.brightRed;
        gatewayBorder = C.red;
        gatewayDetail = "Press [G] to retry";
      } else {
        gatewayStatus = `{yellow-fg}\u26A0{/yellow-fg} Partial (${reachable}/${total})`;
        gatewayColor = C.brightYellow;
        gatewayBorder = C.yellow;
        gatewayDetail = `${unreachable} offline - [G] retry`;
      }
      this.diffRenderer.setContent("gatewayStatus", this.w.gatewayStatus, gatewayStatus);
      this.diffRenderer.setFg("gatewayStatus", this.w.gatewayStatus, gatewayColor);
      this.diffRenderer.setContent("gatewayDetail", this.w.gatewayDetail, gatewayDetail);
      this.diffRenderer.setBorderFg("gatewayBox", this.w.gatewayBox, gatewayBorder);
    }
    const refreshSec = Math.round(this.settings.refreshInterval / 1e3);
    const pauseIndicator = this.isPaused ? "\u25B6 running" : "p pause";
    const sortMode = this.settings.sessionSortMode;
    let footerContent;
    const versionInfo = `v${DASHBOARD_VERSION}`;
    const gatewayHealth = gateway_manager_default.getEndpointHealth();
    const unreachableCount = gatewayHealth.filter((ep) => ep.enabled && !ep.reachable).length;
    const enabledCount = gatewayHealth.filter((ep) => ep.enabled).length;
    let gatewayIndicator = "";
    if (enabledCount > 0) {
      if (unreachableCount === 0) {
        gatewayIndicator = "{green-fg}\u25CF gateway{/green-fg}  ";
      } else if (unreachableCount === enabledCount) {
        gatewayIndicator = "{red-fg}\u2717 gateway offline{/red-fg}  [G] retry  ";
      } else {
        gatewayIndicator = `{yellow-fg}\u26A0 ${unreachableCount}/${enabledCount} gateways{/yellow-fg}  [G] retry  `;
      }
    }
    const errorStates = this.errorBoundaryManager.getAllErrorStates();
    const failedWidgets = Object.entries(errorStates).filter(([_, state]) => state?.hasError);
    const failedWidgetCount = failedWidgets.length;
    let widgetErrorIndicator = "";
    if (failedWidgetCount > 0) {
      widgetErrorIndicator = `{red-fg}\u2717 ${failedWidgetCount} widget(s) failed{/red-fg}  [X] retry  `;
    }
    if (this.settings.showPerformanceMetrics) {
      const perfStatus = performance_monitor_default.getStatusString();
      footerContent = `q quit  r refresh  ${pauseIndicator}  o sort:${sortMode}  1-8 toggle  0 log  ? help  s settings  \u2022  ${gatewayIndicator}${widgetErrorIndicator}${perfStatus}  \u2022  ${versionInfo}`;
    } else {
      footerContent = `q quit  r refresh  ${pauseIndicator}  o sort:${sortMode}  1-8 toggle  0 log  ? help  s settings  \u2022  ${gatewayIndicator}${widgetErrorIndicator}${refreshSec}s refresh  \u2022  ${versionInfo}`;
    }
    this.diffRenderer.setContent("footerText", this.w.footerText, footerContent);
    const sortLabel = sortMode === "time" ? "TIME" : sortMode === "tokens" ? "TOKENS" : sortMode === "idle" ? "IDLE" : "NAME";
    const favLabel = this.showFavoritesOnly ? "\u2605 FAVES" : "";
    const labelSuffix = favLabel ? ` ${favLabel}` : "";
    this.diffRenderer.setLabel("sessions", this.w.sessBox, ` SESSIONS (${sortLabel})${labelSuffix} `);
    try {
      this.diffRenderer.endBatch();
    } catch (err) {
      if (err.code === "EPIPE" || err.message?.includes("write")) {
        return;
      }
      throw err;
    }
  }
};
var WebDashboard = class extends Dashboard {
  constructor(options = {}) {
    super();
    this.webPort = options.webPort || config_default.WEB.DEFAULT_PORT;
    this.webHost = options.webHost || config_default.WEB.HOST;
    this.webServer = null;
    this.dataCache = {
      metrics: null,
      sessions: null,
      agents: null,
      logs: null,
      lastUpdate: 0
    };
  }
  /**
   * Initialize web server mode
   * Overrides parent's init() to skip TUI setup
   */
  async init() {
    this.webServer = new web_server_default({
      port: this.webPort,
      host: this.webHost
    });
    this.webServer.setDataProvider((type) => this.getWebData(type));
    try {
      await this.webServer.start();
      logger_default.info(`Web dashboard available at http://${this.webHost}:${this.webPort}`);
      console.log(`Claw Dashboard Web Server`);
      console.log(`Version: ${DASHBOARD_VERSION}`);
      console.log(`Listening on: http://${this.webHost}:${this.webPort}`);
      console.log(`
Available endpoints:`);
      const endpoints = this.webServer.getInfo().endpoints;
      for (const [name, path6] of Object.entries(endpoints)) {
        console.log(`  GET ${path6} - ${name.charAt(0).toUpperCase() + name.slice(1)}`);
      }
      console.log(`
Press Ctrl+C to stop
`);
    } catch (err) {
      logger_default.error(`Failed to start web server: ${err.message}`);
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    await database_default.initDatabase();
    database_default.cleanupOldData(30);
    gateway_manager_default.init(this.settings);
    performance_monitor_default.start();
    this.startWebRefresh();
    process.on("SIGINT", () => this.shutdown());
    process.on("SIGTERM", () => this.shutdown());
  }
  /**
   * Start periodic data refresh for web mode
   */
  startWebRefresh() {
    this.refreshWebData();
    this.webTimer = setInterval(() => this.refreshWebData(), this.settings.refreshInterval);
  }
  /**
   * Refresh data for web mode
   * Similar to refresh() but without UI rendering
   */
  async refreshWebData() {
    try {
      await Promise.all([
        this.fetchMetrics(),
        this.fetchSessions(),
        this.fetchAgents(),
        this.fetchLogs()
      ]);
      this.dataCache.lastUpdate = Date.now();
    } catch (err) {
      logger_default.error(`Web data refresh error: ${err.message}`);
    }
  }
  /**
   * Fetch metrics data
   */
  async fetchMetrics() {
    try {
      const [cpu, mem, gpu, disk, network, system] = await Promise.all([
        cache_default.getCpuData().catch(() => null),
        cache_default.getMemoryData().catch(() => null),
        cache_default.getGpuData().catch(() => null),
        cache_default.getDiskData().catch(() => null),
        cache_default.getNetworkData().catch(() => null),
        cache_default.getSystemData().catch(() => null)
      ]);
      const actualUsed = mem?.available ? mem.total - mem.available : mem?.used || 0;
      this.dataCache.metrics = {
        cpu: cpu ? {
          load: cpu.currentLoad,
          cores: cpu.cpus?.map((c) => c.load) || []
        } : null,
        memory: mem ? {
          usedGB: (actualUsed / 1024 ** 3).toFixed(1),
          totalGB: (mem.total / 1024 ** 3).toFixed(1),
          percent: Math.round(actualUsed / mem.total * 100),
          availableGB: (mem.available / 1024 ** 3).toFixed(1)
        } : null,
        gpu: gpu ? {
          name: gpu.name,
          utilization: gpu.utilization,
          memoryUsed: gpu.memoryUsed,
          memoryTotal: gpu.memoryTotal
        } : null,
        disk: disk ? {
          used: disk.used,
          size: disk.size,
          percent: disk.percent,
          fs: disk.fs
        } : null,
        network: network ? {
          interface: network.interface,
          rx: network.rx,
          tx: network.tx
        } : null,
        system: system ? {
          platform: system.os?.platform,
          distro: system.os?.distro,
          arch: system.ver?.arch
        } : null,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger_default.warn(`Metrics fetch failed: ${err.message}`);
    }
  }
  /**
   * Fetch sessions data
   */
  async fetchSessions() {
    try {
      this.dataCache.sessions = await gateway_manager_default.getSessions();
    } catch (err) {
      logger_default.warn(`Sessions fetch failed: ${err.message}`);
      this.dataCache.sessions = [];
    }
  }
  /**
   * Fetch agents data
   */
  async fetchAgents() {
    try {
      this.dataCache.agents = await gateway_manager_default.getAgents();
    } catch (err) {
      logger_default.warn(`Agents fetch failed: ${err.message}`);
      this.dataCache.agents = [];
    }
  }
  /**
   * Fetch logs data
   */
  async fetchLogs() {
    try {
      const result = await getOpenClawLogs();
      this.dataCache.logs = result.logs || [];
    } catch (err) {
      logger_default.warn(`Logs fetch failed: ${err.message}`);
      this.dataCache.logs = [];
    }
  }
  /**
   * Get data for web server
   * @param {string} type - Data type to fetch
   * @returns {Object|Array} The requested data
   */
  getWebData(type) {
    if (Date.now() - this.dataCache.lastUpdate > config_default.WEB.REFRESH_CACHE_MS) {
      this.refreshWebData();
    }
    switch (type) {
      case "metrics":
        return this.dataCache.metrics;
      case "sessions":
        return this.dataCache.sessions;
      case "agents":
        return this.dataCache.agents;
      case "logs":
        return this.dataCache.logs;
      default:
        return null;
    }
  }
  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log("\nShutting down web server...");
    if (this.settings.autoSave?.saveOnExit !== false && this.autoSaveManager) {
      console.log("Saving dashboard state...");
      this.autoSaveManager.saveNow();
    }
    if (this.exportScheduler) {
      this.exportScheduler.stop();
    }
    if (this.webTimer) {
      clearInterval(this.webTimer);
    }
    if (this.webServer) {
      await this.webServer.stop();
    }
    performance_monitor_default.stop();
    process.exit(0);
  }
};
async function main() {
  if (cliOptions.command === "create-plugin") {
    const exitCode = await runScaffoldCli(cliOptions.commandArgs);
    process.exit(exitCode);
  } else if (cliOptions.command === "validate-plugin") {
    const exitCode = await runValidatePluginCli(cliOptions.commandArgs);
    process.exit(exitCode);
  } else if (cliOptions.command === "validate-config") {
    const exitCode = await runValidateConfigCli(cliOptions.commandArgs);
    process.exit(exitCode);
  } else if (cliOptions.command === "export-snapshot") {
    const exitCode = await runExportSnapshotCli(cliOptions.commandArgs);
    process.exit(exitCode);
  } else if (cliOptions.command === "import-snapshot") {
    const exitCode = await runImportSnapshotCli(cliOptions.commandArgs);
    process.exit(exitCode);
  } else if (cliOptions.command === "list-templates") {
    const exitCode = await runListTemplatesCli(cliOptions.commandArgs);
    process.exit(exitCode);
  } else if (cliOptions.command === "export-schedule") {
    const exitCode = await runExportScheduleCli(cliOptions.commandArgs);
    process.exit(exitCode);
  }
  if (cliOptions.web) {
    const webDashboard = new WebDashboard({
      webPort: cliOptions.webPort,
      webHost: cliOptions.webHost
    });
    webDashboard.init();
  } else {
    new Dashboard();
  }
}
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
