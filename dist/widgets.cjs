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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/widgets/index.js
var index_exports = {};
__export(index_exports, {
  BaseWidget: () => BaseWidget,
  CONFIG_VERSION: () => CONFIG_VERSION,
  CpuWidget: () => CpuWidget,
  DEFAULT_PROCESSING_OPTIONS: () => DEFAULT_PROCESSING_OPTIONS,
  DataHealthWidget: () => DataHealthWidget,
  DiskWidget: () => DiskWidget,
  ErrorBoundaryManager: () => ErrorBoundaryManager,
  ErrorStyles: () => ErrorStyles,
  GatewayStatusWidget: () => GatewayStatusWidget,
  GpuWidget: () => GpuWidget,
  MemoryWidget: () => MemoryWidget,
  NetworkWidget: () => NetworkWidget,
  PLUGIN_API_VERSION: () => PLUGIN_API_VERSION,
  PLUGIN_ERROR_CODES: () => PLUGIN_ERROR_CODES,
  PluginAPI: () => PluginAPI,
  PluginError: () => PluginError,
  PluginErrorAnalyzer: () => PluginErrorAnalyzer,
  RateLimiter: () => RateLimiter,
  SettingsWidget: () => SettingsWidget,
  SystemWidget: () => SystemWidget,
  UptimeWidget: () => UptimeWidget,
  WIDGET_REGISTRY: () => WIDGET_REGISTRY,
  WidgetErrorBoundary: () => WidgetErrorBoundary,
  WidgetLoader: () => WidgetLoader,
  buildDependencyGraph: () => buildDependencyGraph,
  checkVersionConstraints: () => checkVersionConstraints,
  compareVersions: () => compareVersions,
  createConfigPreprocessor: () => createConfigPreprocessor,
  createWidget: () => createWidget,
  createWidgetPlugin: () => createWidgetPlugin,
  detectCircularDependency: () => detectCircularDependency,
  extractEnvRequirements: () => extractEnvRequirements,
  extractErrorInfo: () => extractErrorInfo,
  findMissingDependencies: () => findMissingDependencies,
  formatPluginError: () => formatPluginError,
  getAllDependencies: () => getAllDependencies,
  getAllDependents: () => getAllDependents,
  getErrorBoundaryManager: () => getErrorBoundaryManager,
  getPluginAPI: () => getPluginAPI,
  getWidgetLoader: () => getWidgetLoader,
  getWidgetTypes: () => getWidgetTypes,
  interpolateEnvVars: () => interpolateEnvVars,
  migrateConfig: () => migrateConfig,
  parseDependencies: () => parseDependencies,
  parseDependency: () => parseDependency,
  processConfigValues: () => processConfigValues,
  processWidgetConfig: () => processWidgetConfig,
  registerMigration: () => registerMigration,
  resolveDependencies: () => resolveDependencies,
  satisfiesVersion: () => satisfiesVersion,
  topologicalSort: () => topologicalSort,
  validateConfigVersion: () => validateConfigVersion,
  validateManifest: () => validateManifest2,
  validateWidgetDependencies: () => validateWidgetDependencies,
  withErrorBoundary: () => withErrorBoundary
});
module.exports = __toCommonJS(index_exports);

// src/widgets/widget-loader.js
var import_fs6 = require("fs");
var import_path5 = require("path");
var import_url4 = require("url");

// src/logger.js
var import_fs3 = __toESM(require("fs"), 1);

// src/security.js
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);

// src/config.js
var import_os = __toESM(require("os"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_url = require("url");
var import_path = require("path");
var __filename = (0, import_url.fileURLToPath)("file://" + (typeof __dirname !== "undefined" ? require("path").join(__dirname, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname = (0, import_path.dirname)(__filename);
var DASHBOARD_VERSION = "unknown";
try {
  const pkg = JSON.parse(import_fs.default.readFileSync((0, import_path.join)(__dirname, "../package.json"), "utf8"));
  DASHBOARD_VERSION = pkg.version || "unknown";
} catch {
}
var REFRESH_INTERVALS = {
  DEFAULT: 2e3,
  ACTIVE: 2e3,
  // 2 seconds when agents active
  IDLE: 1e4,
  // 10 seconds when idle (no active agents)
  OPTIONS: [1e3, 2e3, 5e3, 1e4]
  // Available refresh interval options
};
var IDLE_THRESHOLD_MS = 5 * 60 * 1e3;
var HISTORY = {
  LENGTH: 60,
  // Default history length for charts
  NETWORK_LENGTH: 30
  // Network history length
};
var GATEWAY = {
  DEFAULT_PORT: 18789,
  TIMEOUT_MS: 3e3,
  MAX_ENDPOINTS: 10,
  // Maximum number of gateway endpoints
  DEFAULT_ENDPOINT_NAME: "local"
  // Default name for local gateway
};
var DEFAULT_GATEWAY_ENDPOINT = {
  name: "local",
  host: "localhost",
  port: 18789,
  token: null,
  enabled: true,
  type: "local"
  // 'local', 'remote', 'cloud'
};
var UI = {
  GAUGE_WIDTH: 15,
  SPARKLINE_WIDTH: 15,
  LOG_BOX_MIN_HEIGHT: 10,
  DEFAULT_WIDTH: 80,
  DEFAULT_HEIGHT: 24
};
var CACHE_TTL = {
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
var CACHE_CONFIG = {
  cpu: { ttl: CACHE_TTL.CPU },
  memory: { ttl: CACHE_TTL.MEMORY },
  gpu: { ttl: CACHE_TTL.GPU },
  network: { ttl: CACHE_TTL.NETWORK },
  disk: { ttl: CACHE_TTL.DISK },
  system: { ttl: CACHE_TTL.SYSTEM },
  container: { ttl: CACHE_TTL.CONTAINER }
};
var DATABASE = {
  PATH: import_os.default.homedir() + "/.openclaw/dashboard-history.db",
  SAVE_INTERVAL_MS: 3e4,
  // Save every 30 seconds
  CLEANUP_INTERVAL_MS: 60 * 60 * 1e3,
  // Cleanup every hour
  DEFAULT_RETENTION_DAYS: 30
};
var CHECKSUM = {
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
var RETRY = {
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
var DEFAULT_RETRY_OPTIONS = {
  maxRetries: RETRY.DEFAULT_MAX_RETRIES,
  initialDelay: RETRY.DEFAULT_INITIAL_DELAY,
  maxDelay: RETRY.DEFAULT_MAX_DELAY,
  backoffMultiplier: RETRY.DEFAULT_BACKOFF_MULTIPLIER,
  retryableStatuses: RETRY.RETRYABLE_STATUSES,
  retryableErrors: RETRY.RETRYABLE_ERRORS
};
var AUTO_RETRY = {
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
var ALERT_THRESHOLDS = {
  CPU: { warning: 70, critical: 90 },
  MEMORY: { warning: 75, critical: 90 },
  DISK: { warning: 80, critical: 95 }
};
var ALERT_RATE_LIMIT = {
  ENABLED: true,
  WINDOW_MS: 6e4,
  // 1 minute window
  MAX_ALERTS: 5
  // Max alerts per window per type
};
var MAX_ALERT_HISTORY = 100;
var MEMORY_PRESSURE = {
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
var VALIDATION = {
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
var COMMAND_TIMEOUTS = {
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
var WORKERS = {
  ENABLED: true,
  // Enable worker threads for heavy operations
  MAX_WORKERS: 2,
  // Number of worker threads to spawn
  TASK_TIMEOUT: 1e4,
  // Task timeout in milliseconds (10 seconds)
  FALLBACK_ON_ERROR: true
  // Fall back to direct execution if workers fail
};
var WORKER_DEGRADATION = {
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
var WEB = {
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
var WIDGETS = {
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
var WIDGET_REFRESH_INTERVALS = {
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
var WIDGET_SIZE_PRESETS = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  WIDE: "wide"
};
var WIDGET_SIZES = {
  [WIDGET_SIZE_PRESETS.SMALL]: 3,
  [WIDGET_SIZE_PRESETS.MEDIUM]: 5,
  [WIDGET_SIZE_PRESETS.LARGE]: 8,
  [WIDGET_SIZE_PRESETS.WIDE]: 5
  // Wide uses medium height by default
};
var WIDGET_DEFAULT_SIZES = {
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
var WIDGET_REFRESH_VALIDATION = {
  MIN_INTERVAL: 500,
  // Minimum 500ms between refreshes
  MAX_INTERVAL: 6e4,
  // Maximum 60 seconds between refreshes
  ALLOWED_CUSTOM_INTERVALS: [500, 1e3, 2e3, 5e3, 1e4, 3e4, 6e4]
};
var WIDGET_DEGRADATION = {
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
var PATHS = {
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
var AUTO_SAVE = {
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
var EXPORT_SCHEDULE = {
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
var DEFAULT_SETTINGS = {
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
var config_default = {
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
var WidgetConfigValidator = class {
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

// src/logger.js
var import_os2 = __toESM(require("os"), 1);
var import_url2 = require("url");
var import_path3 = require("path");
var __filename2 = (0, import_url2.fileURLToPath)("file://" + (typeof __dirname2 !== "undefined" ? require("path").join(__dirname2, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname2 = (0, import_path3.dirname)(__filename2);
var LOG_FILE_PATH = import_os2.default.homedir() + "/.openclaw/claw-dashboard.log";
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
var logger = {
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
var logger_default = logger;

// src/widgets/config-processor.js
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
  return value.replace(pattern, (match, content) => {
    const colonIndex = content.indexOf(":-");
    if (colonIndex !== -1) {
      const varName = content.substring(0, colonIndex);
      const defaultValue = content.substring(colonIndex + 2);
      return env[varName] !== void 0 ? env[varName] : defaultValue;
    }
    return env[content] !== void 0 ? env[content] : match;
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
function registerMigration(fromVersion, toVersion, migrateFn) {
  const key = `${fromVersion}\u2192${toVersion}`;
  migrations.set(key, {
    fromVersion,
    toVersion,
    migrate: migrateFn
  });
  logger_default.debug(`Registered config migration: ${key}`);
}
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
  const path2 = [];
  try {
    for (const migration of migrationPath) {
      migratedConfig = migration.migrate(migratedConfig);
      migratedConfig.__version = migration.toVersion;
      path2.push(`${migration.fromVersion}\u2192${migration.toVersion}`);
    }
    return {
      success: true,
      config: migratedConfig,
      path: path2
    };
  } catch (err) {
    return {
      success: false,
      error: `Migration failed: ${err.message}`,
      path: path2
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
function extractEnvRequirements(config, found = /* @__PURE__ */ new Set()) {
  const requirements = [];
  function extract(value) {
    if (typeof value === "string") {
      const pattern = /\$\{([^}]+)\}/g;
      let match;
      while ((match = pattern.exec(value)) !== null) {
        const content = match[1];
        const colonIndex = content.indexOf(":-");
        if (colonIndex !== -1) {
          const varName = content.substring(0, colonIndex);
          const defaultValue = content.substring(colonIndex + 2);
          if (!found.has(varName)) {
            found.add(varName);
            requirements.push({ name: varName, hasDefault: true, defaultValue });
          }
        } else {
          if (!found.has(content)) {
            found.add(content);
            requirements.push({ name: content, hasDefault: false });
          }
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(extract);
    } else if (value && typeof value === "object" && value.constructor === Object) {
      Object.values(value).forEach(extract);
    }
  }
  extract(config);
  return requirements;
}
function createConfigPreprocessor(options = {}) {
  return (config) => processWidgetConfig(config, options);
}

// src/plugin-manifest-validator.js
var import_fs4 = require("fs");
var import_url3 = require("url");
var import_path4 = require("path");
var __filename3 = (0, import_url3.fileURLToPath)("file://" + (typeof __dirname3 !== "undefined" ? require("path").join(__dirname3, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname3 = (0, import_path4.dirname)(__filename3);
var schemaPath = (0, import_path4.join)(__dirname3, "..", "schemas", "plugin-manifest.json");
var schema;
try {
  schema = JSON.parse((0, import_fs4.readFileSync)(schemaPath, "utf8"));
} catch (err) {
  throw new Error(`Failed to load plugin manifest schema: ${err.message}`);
}
function validateType(value, type) {
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
    if (propSchema.type && !validateType(value, propSchema.type)) {
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
          if (propSchema.items.type && !validateType(item, propSchema.items.type)) {
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
  const path2 = [];
  function dfs(nodeId) {
    visited.add(nodeId);
    recStack.add(nodeId);
    path2.push(nodeId);
    const node = graph.get(nodeId);
    if (node) {
      for (const dep of node.dependencies) {
        const depId = dep.id;
        if (!visited.has(depId)) {
          const cycle = dfs(depId);
          if (cycle) return cycle;
        } else if (recStack.has(depId)) {
          const cycleStart = path2.indexOf(depId);
          return [...path2.slice(cycleStart), depId];
        }
      }
    }
    path2.pop();
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

// src/errors.js
var DashboardError = class extends Error {
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

// src/plugin-errors.js
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
function formatPluginError(error, options = {}) {
  const { compact = false, colors = true } = options;
  if (compact) {
    return `[${error.code}] ${error.message} - ${error.getHint()}`;
  }
  return error.getFormattedMessage();
}
function extractErrorInfo(error) {
  if (error instanceof PluginError) {
    return {
      isPluginError: true,
      code: error.code,
      pluginId: error.pluginId,
      suggestion: error.suggestion,
      docs: error.docs,
      hasFix: !!error.fix,
      formatted: error.getFormattedMessage()
    };
  }
  const analysis = PluginErrorAnalyzer.checkCommonMistakes(error);
  return {
    isPluginError: false,
    message: error?.message,
    commonMistake: analysis,
    stack: error?.stack
  };
}

// src/config-watcher.js
var import_fs5 = require("fs");
var import_events = require("events");
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
    if (!(0, import_fs5.existsSync)(filePath)) {
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
      (0, import_fs5.unwatchFile)(filePath);
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
    const watcher = (0, import_fs5.watch)(filePath, { persistent: opts.persistent, encoding: opts.encoding });
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
    (0, import_fs5.watchFile)(filePath, { persistent: opts.persistent, interval: opts.pollInterval }, (curr, prev) => {
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

// src/widgets/widget-loader.js
var import_events2 = require("events");
var { PATHS: PATHS2, WIDGETS: WIDGETS2 } = config_default;
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
    this.widgetsDir = options.widgetsDir || PATHS2.WIDGETS_DIR;
    this.pluginsDir = options.pluginsDir || PATHS2.PLUGINS_DIR;
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
    if (!(0, import_fs6.existsSync)(validatedPluginsDir)) {
      return [];
    }
    const discovered = [];
    const entries = (0, import_fs6.readdirSync)(validatedPluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const nameValidation = validatePluginName(entry.name);
      if (!nameValidation.valid) {
        logger_default.warn(`Skipping plugin directory with invalid name '${entry.name}': ${nameValidation.error}`);
        continue;
      }
      const pluginPath = (0, import_path5.join)(validatedPluginsDir, entry.name);
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
      const manifestPath = (0, import_path5.join)(pluginPath, "plugin.json");
      const indexPath = (0, import_path5.join)(pluginPath, "index.js");
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
      if (!(0, import_fs6.existsSync)(manifestPath) || !(0, import_fs6.existsSync)(indexPath)) {
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
    const manifestPath = (0, import_path5.join)(validatedPluginPath, "plugin.json");
    const indexPath = (0, import_path5.join)(validatedPluginPath, "index.js");
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
    if (!(0, import_fs6.existsSync)(manifestPath)) {
      const pluginError = new PluginError(
        PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
        `Plugin manifest not found at ${validatedPluginPath}`,
        { pluginId: (0, import_path5.basename)(validatedPluginPath) }
      );
      throw pluginError;
    }
    let manifest;
    try {
      const manifestContent = await import("fs").then((m) => m.readFileSync(manifestPath, "utf8"));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      const pluginError = PluginErrorAnalyzer.analyze(err, (0, import_path5.basename)(validatedPluginPath), {
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
        manifest.id || (0, import_path5.basename)(validatedPluginPath),
        { phase: "manifest", manifest }
      );
      if (fallbackOnError) {
        logger_default.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }
    if (!manifest.id && !manifest.name) {
      manifest.id = (0, import_path5.basename)(validatedPluginPath);
    }
    const id = manifest.id || (0, import_path5.basename)(validatedPluginPath);
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
        const module2 = await import((0, import_url4.pathToFileURL)(indexPath).href);
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
    const manifestPath = (0, import_path5.join)(validatedPluginPath, "plugin.json");
    const indexPath = (0, import_path5.join)(validatedPluginPath, "index.js");
    if (!(0, import_fs6.existsSync)(manifestPath)) {
      return null;
    }
    let manifest;
    try {
      const manifestContent = await import("fs").then((m) => m.readFileSync(manifestPath, "utf8"));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      const pluginError = PluginErrorAnalyzer.analyze(err, (0, import_path5.basename)(validatedPluginPath), {
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
        manifest.id || (0, import_path5.basename)(validatedPluginPath),
        { phase: "manifest", manifest }
      );
      if (fallbackOnError) {
        logger_default.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }
    const id = manifest.id || (0, import_path5.basename)(validatedPluginPath);
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
        const module2 = await import((0, import_url4.pathToFileURL)(indexPath).href);
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
        const expectedPath = (0, import_path5.join)(widget.metadata._pluginPath, "plugin.json");
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
      const fs4 = await import("fs");
      const manifestContent = fs4.readFileSync(filePath, "utf8");
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
        const configPath = (0, import_path5.join)(widget.metadata._pluginPath, "plugin.json");
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
    const configPath = (0, import_path5.join)(widget.metadata._pluginPath, "plugin.json");
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
    const configPath = (0, import_path5.join)(widget.metadata._pluginPath, "plugin.json");
    this.configWatcher.unwatchFile(configPath);
  }
};
var defaultLoader = null;
function getWidgetLoader(options) {
  if (!defaultLoader) {
    defaultLoader = new WidgetLoader(options);
  }
  return defaultLoader;
}

// src/widgets/plugin-api.js
var import_events3 = __toESM(require("events"), 1);
var import_blessed = __toESM(require("blessed"), 1);

// src/themes.js
var SETTINGS_PATH = process.env.HOME + "/.openclaw/dashboard-settings.json";

// src/alerts.js
var DEFAULT_THRESHOLDS = {
  cpu: { warning: config_default.ALERT_THRESHOLDS.CPU.warning, critical: config_default.ALERT_THRESHOLDS.CPU.critical },
  memory: { warning: config_default.ALERT_THRESHOLDS.MEMORY.warning, critical: config_default.ALERT_THRESHOLDS.MEMORY.critical },
  disk: { warning: config_default.ALERT_THRESHOLDS.DISK.warning, critical: config_default.ALERT_THRESHOLDS.DISK.critical }
};
var thresholds = { ...DEFAULT_THRESHOLDS };
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
function resetRateLimit() {
  alertTimestamps = {};
  rateLimit = {
    enabled: config_default.ALERT_RATE_LIMIT.ENABLED,
    windowMs: config_default.ALERT_RATE_LIMIT.WINDOW_MS,
    maxAlerts: config_default.ALERT_RATE_LIMIT.MAX_ALERTS
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

// src/widgets/plugin-api.js
var PLUGIN_API_VERSION = "1.0.0";
var DEFAULT_API_RATE_LIMIT = {
  enabled: true,
  windowMs: 6e4,
  // 1 minute window
  maxCalls: 100,
  // Max 100 calls per minute per category
  alwaysAllowCritical: false
};
var PluginAPI = class extends import_events3.default {
  constructor(options = {}) {
    super();
    this.version = PLUGIN_API_VERSION;
    this.dashboardVersion = options.dashboardVersion || "unknown";
    this.screen = options.screen || null;
    this.dataProvider = options.dataProvider || null;
    this.settings = options.settings || {};
    this.extensions = /* @__PURE__ */ new Map();
    this.hooks = /* @__PURE__ */ new Map();
    this.providers = /* @__PURE__ */ new Map();
    this.rateLimiter = new RateLimiter({
      enabled: options.rateLimit?.enabled ?? DEFAULT_API_RATE_LIMIT.enabled,
      windowMs: options.rateLimit?.windowMs ?? DEFAULT_API_RATE_LIMIT.windowMs,
      maxAlerts: options.rateLimit?.maxCalls ?? DEFAULT_API_RATE_LIMIT.maxCalls,
      alwaysAllowCritical: options.rateLimit?.alwaysAllowCritical ?? DEFAULT_API_RATE_LIMIT.alwaysAllowCritical
    });
  }
  /**
   * Check if an API call should be rate-limited
   * @param {string} category - API call category (getData, executeExtension, getMetrics)
   * @param {string} [level] - Call level for rate limiting
   * @returns {object} Rate limit result with allowed boolean and reason
   * @private
   */
  _checkRateLimit(category, level = "warning") {
    const result = this.rateLimiter.checkAndRecord(category, level);
    if (!result.allowed) {
      logger_default.debug(`[PluginAPI] Rate limited: ${category} - ${result.reason}`);
    }
    return result;
  }
  /**
   * Get the rate limiter instance for custom rate limiting
   * @returns {RateLimiter} The rate limiter instance
   */
  getRateLimiter() {
    return this.rateLimiter;
  }
  /**
   * Configure the API rate limiter
   * @param {object} options - Rate limit options
   * @param {boolean} [options.enabled] - Enable/disable rate limiting
   * @param {number} [options.windowMs] - Time window in milliseconds
   * @param {number} [options.maxCalls] - Maximum calls per window
   * @param {boolean} [options.alwaysAllowCritical] - Allow critical calls through
   */
  configureRateLimit(options) {
    const mappedOptions = { ...options };
    if (options.maxCalls !== void 0) {
      mappedOptions.maxAlerts = options.maxCalls;
      delete mappedOptions.maxCalls;
    }
    this.rateLimiter.configure(mappedOptions);
    logger_default.info(`[PluginAPI] Rate limiter configured: ${JSON.stringify(options)}`);
  }
  /**
   * Get current rate limit status
   * @returns {object} Rate limit status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }
  /**
   * Register an extension point that plugins can hook into
   * @param {string} name - Extension point name
   * @param {Object} options - Extension options
   */
  registerExtensionPoint(name, options = {}) {
    if (this.extensions.has(name)) {
      logger_default.warn(`Extension point '${name}' already registered`);
      return this;
    }
    this.extensions.set(name, {
      name,
      description: options.description || "",
      handlers: [],
      multiple: options.multiple !== false,
      // default true
      required: options.required || [],
      validator: options.validator || null
    });
    logger_default.debug(`Extension point '${name}' registered`);
    return this;
  }
  /**
   * Add a handler to an extension point
   * @param {string} extensionName - Extension point name
   * @param {Function} handler - Handler function
   * @param {Object} metadata - Handler metadata
   */
  extend(extensionName, handler, metadata = {}) {
    const extension = this.extensions.get(extensionName);
    if (!extension) {
      throw new Error(`Extension point '${extensionName}' not found`);
    }
    if (!extension.multiple && extension.handlers.length > 0) {
      throw new Error(`Extension point '${extensionName}' only allows one handler`);
    }
    const wrappedHandler = {
      id: metadata.id || `handler-${Date.now()}`,
      handler,
      metadata: {
        priority: metadata.priority || 100,
        ...metadata
      }
    };
    extension.handlers.push(wrappedHandler);
    extension.handlers.sort((a, b) => a.metadata.priority - b.metadata.priority);
    logger_default.debug(`Handler registered for extension point '${extensionName}'`);
    this.emit("extension:added", { extension: extensionName, handler: wrappedHandler });
    return () => this.removeExtension(extensionName, wrappedHandler.id);
  }
  /**
   * Remove an extension handler
   * @param {string} extensionName - Extension point name
   * @param {string} handlerId - Handler ID
   */
  removeExtension(extensionName, handlerId) {
    const extension = this.extensions.get(extensionName);
    if (!extension) return false;
    const index = extension.handlers.findIndex((h) => h.id === handlerId);
    if (index === -1) return false;
    extension.handlers.splice(index, 1);
    this.emit("extension:removed", { extension: extensionName, handlerId });
    return true;
  }
  /**
   * Execute all handlers for an extension point
   * @param {string} extensionName - Extension point name
   * @param {...any} args - Arguments to pass to handlers
   * @returns {Promise<Array>} Results from all handlers
   */
  async executeExtension(extensionName, ...args) {
    const rateResult = this._checkRateLimit("executeExtension");
    if (!rateResult.allowed) {
      const retryAfter = this.rateLimiter.getRetryAfter("executeExtension");
      const error = new Error(`Rate limit exceeded for executeExtension. Retry after ${retryAfter}ms`);
      error.code = "RATE_LIMIT_EXCEEDED";
      error.retryAfter = retryAfter;
      throw error;
    }
    const extension = this.extensions.get(extensionName);
    if (!extension) {
      logger_default.warn(`Extension point '${extensionName}' not found`);
      return [];
    }
    const results = [];
    for (const { handler, metadata } of extension.handlers) {
      try {
        const result = await handler(...args);
        results.push({ success: true, result, metadata });
      } catch (err) {
        logger_default.error(`Extension handler error in '${extensionName}': ${err.message}`);
        results.push({ success: false, error: err.message, metadata });
      }
    }
    return results;
  }
  /**
   * Register a data provider
   * @param {string} name - Provider name
   * @param {Function} provider - Provider function
   */
  registerDataProvider(name, provider) {
    if (typeof provider !== "function") {
      throw new Error("Provider must be a function");
    }
    this.providers.set(name, provider);
    logger_default.debug(`Data provider '${name}' registered`);
    this.emit("provider:registered", { name });
    return this;
  }
  /**
   * Get data from a provider
   * Rate-limited to prevent excessive provider calls.
   * @param {string} name - Provider name
   * @param {...any} args - Arguments to pass to provider
   * @throws {Error} If rate limit exceeded or provider not found
   */
  async getData(name, ...args) {
    const rateResult = this._checkRateLimit("getData");
    if (!rateResult.allowed) {
      const retryAfter = this.rateLimiter.getRetryAfter("getData");
      const error = new Error(`Rate limit exceeded for getData. Retry after ${retryAfter}ms`);
      error.code = "RATE_LIMIT_EXCEEDED";
      error.retryAfter = retryAfter;
      throw error;
    }
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Data provider '${name}' not found`);
    }
    try {
      return await provider(...args);
    } catch (err) {
      logger_default.error(`Data provider '${name}' error: ${err.message}`);
      throw err;
    }
  }
  /**
   * Check if a data provider exists
   * @param {string} name - Provider name
   */
  hasDataProvider(name) {
    return this.providers.has(name);
  }
  /**
   * Register a hook
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   * @param {Object} options - Hook options
   */
  addHook(event, handler, options = {}) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    const hooks = this.hooks.get(event);
    const wrapped = {
      id: options.id || `hook-${Date.now()}`,
      handler,
      priority: options.priority || 100,
      once: options.once || false
    };
    hooks.push(wrapped);
    hooks.sort((a, b) => a.priority - b.priority);
    logger_default.debug(`Hook registered for event '${event}'`);
    return () => this.removeHook(event, wrapped.id);
  }
  /**
   * Remove a hook
   * @param {string} event - Event name
   * @param {string} hookId - Hook ID
   */
  removeHook(event, hookId) {
    const hooks = this.hooks.get(event);
    if (!hooks) return false;
    const index = hooks.findIndex((h) => h.id === hookId);
    if (index === -1) return false;
    hooks.splice(index, 1);
    return true;
  }
  /**
   * Execute hooks for an event
   * @param {string} event - Event name
   * @param {Object} context - Context object that hooks can modify
   * @param {...any} args - Additional arguments
   */
  async executeHooks(event, context = {}, ...args) {
    const hooks = this.hooks.get(event) || [];
    const toRemove = [];
    for (const hook of hooks) {
      try {
        await hook.handler(context, ...args);
        if (hook.once) {
          toRemove.push(hook.id);
        }
      } catch (err) {
        logger_default.error(`Hook error for event '${event}': ${err.message}`);
      }
    }
    for (const id of toRemove) {
      this.removeHook(event, id);
    }
    return context;
  }
  /**
   * Create a UI component helper
   * @param {string} type - Component type
   * @param {Object} options - Component options
   */
  createComponent(type, options = {}) {
    if (!this.screen) {
      throw new Error("Screen not available - cannot create components");
    }
    const componentConfig = {
      ...options,
      parent: options.parent || this.screen
    };
    switch (type) {
      case "box":
        return import_blessed.default.box(componentConfig);
      case "text":
        return import_blessed.default.text(componentConfig);
      case "list":
        return import_blessed.default.list(componentConfig);
      case "table":
        return import_blessed.default.table(componentConfig);
      case "line":
        return import_blessed.default.line(componentConfig);
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  }
  /**
   * Get system metrics
   * @param {string} type - Metric type
   */
  async getMetrics(type) {
    const rateResult = this._checkRateLimit("getMetrics");
    if (!rateResult.allowed) {
      const retryAfter = this.rateLimiter.getRetryAfter("getMetrics");
      const error = new Error(`Rate limit exceeded for getMetrics. Retry after ${retryAfter}ms`);
      error.code = "RATE_LIMIT_EXCEEDED";
      error.retryAfter = retryAfter;
      throw error;
    }
    if (this.dataProvider) {
      return this.dataProvider(type);
    }
    return null;
  }
  /**
   * Subscribe to dashboard events
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    super.on(event, handler);
    return () => this.off(event, handler);
  }
  /**
   * Log a message from a plugin
   * @param {string} pluginId - Plugin identifier
   * @param {string} level - Log level
   * @param {string} message - Message
   */
  log(pluginId, level, message) {
    const levels = ["debug", "info", "warn", "error"];
    if (!levels.includes(level)) {
      level = "info";
    }
    logger_default[level](`[Plugin:${pluginId}] ${message}`);
    this.emit("plugin:log", { pluginId, level, message });
  }
  /**
   * Get plugin configuration
   * @param {string} pluginId - Plugin identifier
   * @param {Object} defaults - Default configuration
   */
  getConfig(pluginId, defaults = {}) {
    const plugins = this.settings.plugins || {};
    return { ...defaults, ...plugins[pluginId] };
  }
  /**
   * Save plugin configuration
   * @param {string} pluginId - Plugin identifier
   * @param {Object} config - Configuration to save
   */
  async saveConfig(pluginId, config) {
    this.emit("plugin:config", { pluginId, config });
    return true;
  }
  /**
   * Get API information
   */
  getInfo() {
    return {
      version: this.version,
      dashboardVersion: this.dashboardVersion,
      extensionPoints: Array.from(this.extensions.keys()),
      dataProviders: Array.from(this.providers.keys()),
      hooks: Array.from(this.hooks.keys())
    };
  }
};
var BaseWidget = class {
  constructor(options = {}) {
    this.id = options.id || `widget-${Date.now()}`;
    this.name = options.name || "Unnamed Widget";
    this.description = options.description || "";
    this.config = options.config || {};
    this.api = options.api || null;
    this.screen = options.screen || null;
    this.box = null;
    this.data = null;
    this.visible = false;
    this.loaded = false;
    this.priority = options.priority || this.getDefaultPriority();
    this.refreshInterval = this.config.refreshInterval || this.getDefaultRefreshInterval();
    this.lastUpdateTime = 0;
    this.updateCount = 0;
    this.skipCount = 0;
    this.isDegraded = false;
    this.degradationLevel = "none";
    this.currentRefreshInterval = this.refreshInterval;
  }
  /**
   * Get the default priority for this widget type
   * @returns {number} Priority value (lower = more critical)
   */
  getDefaultPriority() {
    const widgetId = this.id.replace(/Widget$/, "").toLowerCase();
    const builtinConfig = config_default.WIDGETS?.BUILTIN?.[widgetId];
    return builtinConfig?.priority || 100;
  }
  /**
   * Initialize the widget
   * Called when widget is first loaded
   */
  async init() {
    this.loaded = true;
    return true;
  }
  /**
   * Create the widget UI
   * Override this method to create your widget's blessed elements
   */
  async create() {
    throw new Error("create() must be implemented");
  }
  /**
   * Get data for the widget
   * Override this method to fetch widget data
   */
  async getData() {
    return {};
  }
  /**
   * Render the widget
   * Override this method to update the widget display
   */
  async render() {
  }
  /**
   * Show the widget
   */
  show() {
    if (this.box) {
      this.box.show();
      this.visible = true;
    }
  }
  /**
   * Hide the widget
   */
  hide() {
    if (this.box) {
      this.box.hide();
      this.visible = false;
    }
  }
  /**
   * Destroy the widget
   * Clean up any resources
   */
  async destroy() {
    if (this.box) {
      this.box.destroy();
      this.box = null;
    }
    this.loaded = false;
  }
  /**
   * Log a message
   * @param {string} level - Log level
   * @param {string} message - Message
   */
  log(level, message) {
    if (this.api) {
      this.api.log(this.id, level, message);
    }
  }
  /**
   * Get widget metadata
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      loaded: this.loaded,
      visible: this.visible
    };
  }
  /**
   * Get the default refresh interval for this widget type from config
   * @returns {number|null} Refresh interval in milliseconds, or null to use global
   */
  getDefaultRefreshInterval() {
    const intervalMap = {
      "cpu": config_default.WIDGET_REFRESH_INTERVALS?.CPU,
      "memory": config_default.WIDGET_REFRESH_INTERVALS?.MEMORY,
      "gpu": config_default.WIDGET_REFRESH_INTERVALS?.GPU,
      "network": config_default.WIDGET_REFRESH_INTERVALS?.NETWORK,
      "disk": config_default.WIDGET_REFRESH_INTERVALS?.DISK,
      "system": config_default.WIDGET_REFRESH_INTERVALS?.SYSTEM,
      "uptime": config_default.WIDGET_REFRESH_INTERVALS?.UPTIME,
      "dataHealth": config_default.WIDGET_REFRESH_INTERVALS?.DATA_HEALTH
    };
    const widgetId = this.id.replace(/Widget$/, "").toLowerCase();
    return intervalMap[widgetId] || intervalMap[this.id] || config_default.WIDGET_REFRESH_INTERVALS?.DEFAULT || null;
  }
  /**
   * Check if the widget should update based on refresh interval
   * @param {number} currentTime - Current timestamp (optional, defaults to Date.now())
   * @returns {boolean} True if widget should update
   */
  shouldUpdate(currentTime = Date.now()) {
    if (!this.refreshInterval) {
      return true;
    }
    const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
    return timeSinceLastUpdate >= this.refreshInterval;
  }
  /**
   * Check if widget should update under current degradation level
   * @param {string} degradationLevel - Current degradation level ('none', 'warning', 'critical')
   * @param {number} currentTime - Current timestamp
   * @returns {object} Result with { shouldUpdate: boolean, reason: string }
   */
  shouldUpdateUnderDegradation(degradationLevel, currentTime = Date.now()) {
    if (config_default.WIDGET_DEGRADATION?.CRITICAL_WIDGETS?.includes(this.id)) {
      return { shouldUpdate: true, reason: "critical_widget" };
    }
    if (degradationLevel === "critical") {
      const criticalThreshold = config_default.WIDGET_DEGRADATION?.CRITICAL?.PRIORITY_THRESHOLD || 30;
      if (this.priority > criticalThreshold) {
        this.skipCount++;
        return { shouldUpdate: false, reason: "degradation_critical_skip" };
      }
      const multiplier = config_default.WIDGET_DEGRADATION?.CRITICAL?.EXTEND_INTERVAL_MULTIPLIER || 2;
      const adjustedInterval = (this.refreshInterval || 2e3) * multiplier;
      const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
      if (timeSinceLastUpdate < adjustedInterval) {
        return { shouldUpdate: false, reason: "degradation_extended_interval" };
      }
    }
    if (degradationLevel === "warning") {
      const multiplier = config_default.WIDGET_DEGRADATION?.WARNING?.EXTEND_INTERVAL_MULTIPLIER || 1.5;
      const adjustedInterval = (this.refreshInterval || 2e3) * multiplier;
      const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
      if (timeSinceLastUpdate < adjustedInterval) {
        return { shouldUpdate: false, reason: "degradation_extended_interval" };
      }
    }
    if (!this.shouldUpdate(currentTime)) {
      return { shouldUpdate: false, reason: "interval_not_elapsed" };
    }
    return { shouldUpdate: true, reason: "ok" };
  }
  /**
   * Update the refresh interval
   * @param {number} interval - New interval in milliseconds
   */
  updateRefreshInterval(interval) {
    const minInterval = config_default.WIDGET_REFRESH_VALIDATION?.MIN_INTERVAL || 500;
    const maxInterval = config_default.WIDGET_REFRESH_VALIDATION?.MAX_INTERVAL || 6e4;
    if (interval !== null && (interval < minInterval || interval > maxInterval)) {
      throw new Error(`Invalid refresh interval: ${interval}. Must be between ${minInterval} and ${maxInterval}ms`);
    }
    this.refreshInterval = interval;
    this.currentRefreshInterval = interval;
    this.log("debug", `Refresh interval updated to ${interval}ms`);
  }
  /**
   * Record that an update occurred
   * @param {number} timestamp - Update timestamp (optional, defaults to Date.now())
   */
  recordUpdate(timestamp = Date.now()) {
    this.lastUpdateTime = timestamp;
    this.updateCount++;
  }
  /**
   * Set the degradation level for this widget
   * @param {string} level - Degradation level ('none', 'warning', 'critical')
   */
  setDegradationLevel(level) {
    this.degradationLevel = level;
    this.isDegraded = level !== "none";
    if (level === "critical") {
      const multiplier = config_default.WIDGET_DEGRADATION?.CRITICAL?.EXTEND_INTERVAL_MULTIPLIER || 2;
      this.currentRefreshInterval = (this.refreshInterval || 2e3) * multiplier;
    } else if (level === "warning") {
      const multiplier = config_default.WIDGET_DEGRADATION?.WARNING?.EXTEND_INTERVAL_MULTIPLIER || 1.5;
      this.currentRefreshInterval = (this.refreshInterval || 2e3) * multiplier;
    } else {
      this.currentRefreshInterval = this.refreshInterval;
    }
  }
  /**
   * Get widget refresh statistics
   * @returns {object} Refresh statistics
   */
  getRefreshStats() {
    return {
      refreshInterval: this.refreshInterval,
      currentRefreshInterval: this.currentRefreshInterval,
      lastUpdateTime: this.lastUpdateTime,
      updateCount: this.updateCount,
      skippedUpdates: this.skipCount,
      degradationLevel: this.degradationLevel,
      priority: this.priority
    };
  }
};
function validateManifest2(manifest) {
  const required = ["name", "version", "entryPoint"];
  const missing = required.filter((key) => !manifest[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields in plugin manifest: ${missing.join(", ")}`);
  }
  const semver = /^\d+\.\d+\.\d+/;
  if (!semver.test(manifest.version)) {
    throw new Error("Plugin version must follow semver format (e.g., 1.0.0)");
  }
  return true;
}
function createWidgetPlugin(definition) {
  const {
    id,
    name,
    description,
    version = "1.0.0",
    author,
    category = "custom",
    WidgetClass,
    config = {}
  } = definition;
  if (!WidgetClass) {
    throw new Error("WidgetClass is required");
  }
  return {
    id,
    name,
    description,
    version,
    author,
    category,
    type: "widget",
    config,
    // Factory function
    createWidget(options = {}) {
      return new WidgetClass({
        id,
        name,
        description,
        config: { ...config, ...options.config },
        ...options
      });
    },
    // Manifest for plugin system
    toManifest() {
      return {
        id,
        name,
        description,
        version,
        author,
        category,
        type: "widget",
        lazyLoad: true
      };
    }
  };
}
var defaultAPI = null;
function getPluginAPI(options) {
  if (!defaultAPI) {
    defaultAPI = new PluginAPI(options);
  }
  return defaultAPI;
}

// src/widgets/builtin-widgets.js
var import_blessed2 = __toESM(require("blessed"), 1);
var import_blessed_contrib = __toESM(require("blessed-contrib"), 1);
var CpuWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "CPU";
    this.description = "CPU usage and history";
    this.history = [];
    this.maxHistory = 60;
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " CPU ",
      style: { border: { fg: C.cyan || "cyan" } }
    });
    this.valueText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "0%",
      style: { fg: C.brightGreen || "bright-green", bold: true }
    });
    this.detailText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    return this;
  }
  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider("cpu");
    }
    return null;
  }
  update(data) {
    if (!data || !this.box) return;
    const percent = data.avg || 0;
    const cores = data.cores || 1;
    this.history.push(percent);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    const color = percent > 90 ? "red" : percent > 70 ? "yellow" : "green";
    const gaugeWidth = 15;
    const filled = Math.round(percent / 100 * gaugeWidth);
    const gauge = "\u2588".repeat(filled) + "\u2591".repeat(gaugeWidth - filled);
    this.valueText.setContent(`{${color}-fg}${percent}%{/${color}-fg} ${gauge}`);
    this.detailText.setContent(`${cores} cores`);
  }
  render(data) {
    this.update(data);
  }
};
var MemoryWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "Memory";
    this.description = "Memory usage and history";
    this.history = [];
    this.maxHistory = 60;
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " MEMORY ",
      style: { border: { fg: C.magenta || "magenta" } }
    });
    this.valueText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "0%",
      style: { fg: C.brightMagenta || "bright-magenta", bold: true }
    });
    this.detailText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    return this;
  }
  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider("memory");
    }
    return null;
  }
  update(data) {
    if (!data || !this.box) return;
    const percent = data.percent || 0;
    const used = data.used || 0;
    const total = data.total || 0;
    this.history.push(percent);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    const color = percent > 90 ? "red" : percent > 75 ? "yellow" : "green";
    const gaugeWidth = 15;
    const filled = Math.round(percent / 100 * gaugeWidth);
    const gauge = "\u2588".repeat(filled) + "\u2591".repeat(gaugeWidth - filled);
    this.valueText.setContent(`{${color}-fg}${percent}%{/${color}-fg} ${gauge}`);
    this.detailText.setContent(`${used}/${total} GB`);
  }
  render(data) {
    this.update(data);
  }
};
var GpuWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "GPU";
    this.description = "GPU usage and temperature";
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " GPU ",
      style: { border: { fg: C.yellow || "yellow" } }
    });
    this.valueText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "Detecting...",
      style: { fg: C.brightYellow || "bright-yellow", bold: true }
    });
    this.detailText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    return this;
  }
  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider("gpu");
    }
    return null;
  }
  update(data) {
    if (!this.box) return;
    if (!data) {
      this.valueText.setContent("Not detected");
      this.detailText.setContent("");
      return;
    }
    const utilization = data.utilization;
    const temp = data.temperature;
    const short = data.short || "GPU";
    let value = short;
    if (utilization !== null) {
      value += ` ${utilization}%`;
    }
    if (temp !== null) {
      value += ` ${temp}\xB0C`;
    }
    this.valueText.setContent(value);
    this.detailText.setContent(data.memoryUsed && data.memoryTotal ? `${data.memoryUsed}/${data.memoryTotal} GB` : "");
  }
  render(data) {
    this.update(data);
  }
};
var NetworkWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "Network";
    this.description = "Network activity";
    this.history = [];
    this.maxHistory = 30;
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " NETWORK ",
      style: { border: { fg: C.brightCyan || "bright-cyan" } }
    });
    this.valueText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "Loading...",
      style: { fg: C.brightCyan || "bright-cyan", bold: true }
    });
    this.detailText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    this.sparkline = import_blessed_contrib.default.sparkline({
      parent: this.box,
      top: 2,
      left: "center",
      width: 20,
      height: 1,
      style: { fg: C.cyan || "cyan" }
    });
    return this;
  }
  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider("network");
    }
    return null;
  }
  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
  update(data) {
    if (!data || !this.box) return;
    const iface = data.interface || "unknown";
    const rx = data.rxSec || 0;
    const tx = data.txSec || 0;
    const total = rx + tx;
    this.history.push(total);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.valueText.setContent(iface);
    this.detailText.setContent(`\u2193${this.formatBytes(rx)} \u2191${this.formatBytes(tx)}`);
    if (this.sparkline && this.history.length > 1) {
      this.sparkline.setData([this.history]);
    }
  }
  render(data) {
    this.update(data);
  }
};
var DiskWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "Disk";
    this.description = "Disk usage";
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " DISK ",
      style: { border: { fg: C.green || "green" } }
    });
    this.valueText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "0%",
      style: { fg: C.brightGreen || "bright-green", bold: true }
    });
    this.detailText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    return this;
  }
  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider("disk");
    }
    return null;
  }
  update(data) {
    if (!data || !this.box) return;
    const percent = data.percent || 0;
    const used = data.used || 0;
    const size = data.size || 0;
    const color = percent > 90 ? "red" : percent > 80 ? "yellow" : "green";
    const gaugeWidth = 15;
    const filled = Math.round(percent / 100 * gaugeWidth);
    const gauge = "\u2588".repeat(filled) + "\u2591".repeat(gaugeWidth - filled);
    this.valueText.setContent(`{${color}-fg}${percent}%{/${color}-fg} ${gauge}`);
    this.detailText.setContent(`${used}/${size} GB`);
  }
  render(data) {
    this.update(data);
  }
};
var SystemWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "System";
    this.description = "System information";
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " SYSTEM ",
      style: { border: { fg: C.gray || "gray" } }
    });
    this.line1 = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "...",
      style: { fg: C.gray || "gray" }
    });
    this.line2 = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    return this;
  }
  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider("system");
    }
    return null;
  }
  update(data) {
    if (!data || !this.box) return;
    const platform = data.platform || "";
    const release = data.release || "";
    const arch = data.arch || "";
    const container = data.isContainer ? " [container]" : "";
    this.line1.setContent(`${platform} ${release}`);
    this.line2.setContent(`${arch}${container}`);
  }
  render(data) {
    this.update(data);
  }
};
var UptimeWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "Uptime";
    this.description = "System and OpenClaw uptime";
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " UPTIME ",
      style: { border: { fg: C.brightMagenta || "bright-magenta" } }
    });
    this.sysText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "Sys: --",
      style: { fg: C.brightMagenta || "bright-magenta", bold: true }
    });
    this.clawText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "Claw: --",
      style: { fg: C.brightMagenta || "bright-magenta", bold: true }
    });
    return this;
  }
  async getData(dataProvider) {
    if (dataProvider) {
      const [sysUptime, clawUptime] = await Promise.all([
        dataProvider("uptime"),
        dataProvider("clawUptime")
      ]);
      return { sysUptime, clawUptime };
    }
    return null;
  }
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }
  update(data) {
    if (!data || !this.box) return;
    const sysUptime = data.sysUptime || 0;
    const clawUptime = data.clawUptime || 0;
    this.sysText.setContent(`Sys: ${this.formatUptime(sysUptime)}`);
    this.clawText.setContent(`Claw: ${this.formatUptime(clawUptime)}`);
  }
  render(data) {
    this.update(data);
  }
};
var DataHealthWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "Data Health";
    this.description = "Data freshness indicators";
    this.lastUpdate = null;
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 5,
      border: { type: "line" },
      label: " DATA HEALTH ",
      style: { border: { fg: C.green || "green" } }
    });
    this.statusText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "All Fresh",
      style: { fg: C.brightGreen || "bright-green", bold: true }
    });
    this.detailText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    return this;
  }
  async getData(dataProvider) {
    return { timestamp: Date.now() };
  }
  update(data) {
    if (!this.box) return;
    const now = Date.now();
    if (data?.timestamp) {
      this.lastUpdate = data.timestamp;
    }
    if (!this.lastUpdate) {
      this.statusText.setContent("Waiting...");
      return;
    }
    const age = now - this.lastUpdate;
    const ageSec = Math.floor(age / 1e3);
    let status = "All Fresh";
    let color = "green";
    let detail = `${ageSec}s ago`;
    if (age > 3e4) {
      status = "Stale";
      color = "red";
      detail = `Last update: ${ageSec}s ago`;
    } else if (age > 1e4) {
      status = "Aging";
      color = "yellow";
      detail = `${ageSec}s since last refresh`;
    }
    this.statusText.setContent(`{${color}-fg}${status}{/${color}-fg}`);
    this.detailText.setContent(detail);
  }
  render(data) {
    this.update(data);
  }
};
var SettingsWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "Settings";
    this.description = "User preferences configuration";
    this.settings = options.settings || {};
    this.onSettingsChange = options.onSettingsChange || null;
    this.onSave = options.onSave || null;
    this.currentIndex = 0;
    this.isEditing = false;
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 12,
      border: { type: "line" },
      label: " SETTINGS ",
      style: { border: { fg: C.cyan || "cyan" } }
    });
    this.instructionsText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: 0,
      right: 0,
      content: " {cyan-fg}j/k{/cyan-fg} navigate  {cyan-fg}enter{/cyan-fg} edit  {cyan-fg}s{/cyan-fg} save  {cyan-fg}q{/cyan-fg} close",
      style: { fg: C.gray || "gray" }
    });
    this.settingsList = import_blessed2.default.list({
      parent: this.box,
      top: 1,
      left: 0,
      right: 0,
      bottom: 0,
      keys: true,
      interactive: false,
      style: {
        item: { fg: C.white || "white" },
        selected: { fg: C.black || "black", bg: C.cyan || "cyan", bold: true },
        focus: { fg: C.black || "black", bg: C.cyan || "cyan" }
      }
    });
    this.setupKeys();
    return this;
  }
  setupKeys() {
    this.settingsList.key(["j", "down"], () => {
      if (!this.isEditing) {
        this.currentIndex = Math.min(this.currentIndex + 1, this.getSettingsCount() - 1);
        this.updateSelection();
      }
    });
    this.settingsList.key(["k", "up"], () => {
      if (!this.isEditing) {
        this.currentIndex = Math.max(this.currentIndex - 1, 0);
        this.updateSelection();
      }
    });
    this.settingsList.key(["g", "home"], () => {
      if (!this.isEditing) {
        this.currentIndex = 0;
        this.updateSelection();
      }
    });
    this.settingsList.key(["G", "end"], () => {
      if (!this.isEditing) {
        this.currentIndex = this.getSettingsCount() - 1;
        this.updateSelection();
      }
    });
    this.settingsList.key(["enter", "space"], () => {
      this.editCurrentSetting();
    });
    this.settingsList.key("s", () => {
      this.saveSettings();
    });
    this.settingsList.key(["q", "escape"], () => {
      if (this.onClose) this.onClose();
    });
    this.settingsList.focus();
  }
  getSettingsCount() {
    return 13;
  }
  getSettingsOptions() {
    return [
      { key: "theme", label: "Theme", options: ["auto", "default", "dark", "high-contrast", "ocean"] },
      { key: "refreshInterval", label: "Refresh Rate", options: ["1000ms", "2000ms", "5000ms", "10000ms"] },
      { key: "logLevelFilter", label: "Log Level", options: ["all", "error", "warn", "info", "debug"] },
      { key: "showWidget1", label: "Show CPU Widget", options: ["ON", "OFF"] },
      { key: "showWidget2", label: "Show Memory Widget", options: ["ON", "OFF"] },
      { key: "showWidget3", label: "Show GPU Widget", options: ["ON", "OFF"] },
      { key: "showWidget4", label: "Show Network Widget", options: ["ON", "OFF"] },
      { key: "showWidget5", label: "Show Disk Widget", options: ["ON", "OFF"] },
      { key: "showWidget6", label: "Show System Widget", options: ["ON", "OFF"] },
      { key: "showWidget7", label: "Show Uptime Widget", options: ["ON", "OFF"] },
      { key: "showWidget8", label: "Show Data Health Widget", options: ["ON", "OFF"] },
      { key: "showWidget9", label: "Show Gateway Widget", options: ["ON", "OFF"] },
      { key: "exportFormat", label: "Export Format", options: ["json", "csv"] }
    ];
  }
  formatSettingRow(option, index) {
    const currentValue = this.settings[option.key];
    let displayValue;
    if (option.key === "refreshInterval") {
      displayValue = `${currentValue}ms`;
    } else if (option.key.startsWith("showWidget")) {
      displayValue = currentValue !== false ? "ON" : "OFF";
    } else {
      displayValue = currentValue || "auto";
    }
    const label = option.label.padEnd(25, " ");
    const isSelected = index === this.currentIndex;
    const prefix = isSelected ? "> " : "  ";
    return `${prefix}${label} ${displayValue}`;
  }
  updateDisplay() {
    if (!this.settingsList) return;
    const options = this.getSettingsOptions();
    const items = options.map((opt, idx) => this.formatSettingRow(opt, idx));
    this.settingsList.setItems(items);
    this.updateSelection();
  }
  updateSelection() {
    if (this.settingsList) {
      this.settingsList.select(this.currentIndex);
      this.box.screen.render();
    }
  }
  editCurrentSetting() {
    const options = this.getSettingsOptions();
    const option = options[this.currentIndex];
    if (!option) return;
    const currentValue = this.settings[option.key];
    if (option.key === "refreshInterval") {
      const intervals = [1e3, 2e3, 5e3, 1e4];
      const currentIdx = intervals.indexOf(currentValue);
      const nextIdx = (currentIdx + 1) % intervals.length;
      this.settings[option.key] = intervals[nextIdx];
    } else if (option.key.startsWith("showWidget")) {
      this.settings[option.key] = currentValue === false;
    } else if (option.options) {
      const currentIdx = option.options.indexOf(currentValue);
      const nextIdx = (currentIdx + 1) % option.options.length;
      this.settings[option.key] = option.options[nextIdx];
    }
    this.updateDisplay();
    if (this.onSettingsChange) {
      this.onSettingsChange({ [option.key]: this.settings[option.key] });
    }
  }
  saveSettings() {
    if (this.onSave) {
      this.onSave(this.settings);
    }
    this.instructionsText.setContent(" {green-fg}Settings saved!{/green-fg}");
    setTimeout(() => {
      this.instructionsText.setContent(" {cyan-fg}j/k{/cyan-fg} navigate  {cyan-fg}enter{/cyan-fg} edit  {cyan-fg}s{/cyan-fg} save  {cyan-fg}q{/cyan-fg} close");
      this.box.screen.render();
    }, 1e3);
  }
  async getData(dataProvider) {
    return { settings: this.settings };
  }
  update(data) {
    if (data?.settings) {
      this.settings = data.settings;
    }
    this.updateDisplay();
  }
  render(data) {
    this.update(data);
  }
  focus() {
    if (this.settingsList) {
      this.settingsList.focus();
    }
  }
};
var GatewayStatusWidget = class extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = "Gateway Status";
    this.description = "Gateway connection status and health";
    this.onRetry = options.onRetry || null;
    this.selectedEndpoint = 0;
  }
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    this.box = import_blessed2.default.box({
      parent: screen,
      height: 6,
      border: { type: "line" },
      label: " GATEWAY STATUS ",
      style: { border: { fg: C.cyan || "cyan" } }
    });
    this.statusText = import_blessed2.default.text({
      parent: this.box,
      top: 0,
      left: "center",
      content: "Checking...",
      style: { fg: C.brightCyan || "bright-cyan", bold: true }
    });
    this.endpointsText = import_blessed2.default.text({
      parent: this.box,
      top: 1,
      left: 1,
      right: 1,
      content: "",
      style: { fg: C.white || "white" }
    });
    this.detailText = import_blessed2.default.text({
      parent: this.box,
      top: 4,
      left: "center",
      content: "",
      style: { fg: C.gray || "gray" }
    });
    this.setupKeys();
    return this;
  }
  setupKeys() {
    this.box.key(["r"], () => {
      this.triggerRetry();
    });
    this.box.key(["j", "down"], () => {
      const endpointHealth = this.lastHealthData || [];
      if (endpointHealth.length > 0) {
        this.selectedEndpoint = Math.min(this.selectedEndpoint + 1, endpointHealth.length - 1);
        this.updateDisplay();
      }
    });
    this.box.key(["k", "up"], () => {
      this.selectedEndpoint = Math.max(this.selectedEndpoint - 1, 0);
      this.updateDisplay();
    });
  }
  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider("gatewayHealth");
    }
    return null;
  }
  triggerRetry() {
    if (this.onRetry) {
      const endpointHealth = this.lastHealthData || [];
      const selected = endpointHealth[this.selectedEndpoint];
      this.onRetry(selected?.name || null);
      this.detailText.setContent("{yellow-fg}\u27F3 Retrying...{/yellow-fg}");
      this.box.screen.render();
    }
  }
  update(data) {
    if (!this.box) return;
    this.lastHealthData = data?.endpoints || [];
    this.updateDisplay();
  }
  updateDisplay() {
    const endpointHealth = this.lastHealthData || [];
    if (endpointHealth.length === 0) {
      this.statusText.setContent("{red-fg}No Endpoints{/red-fg}");
      this.endpointsText.setContent("No gateway endpoints configured");
      this.detailText.setContent("");
      return;
    }
    const total = endpointHealth.length;
    const reachable = endpointHealth.filter((ep) => ep.reachable).length;
    const unreachable = total - reachable;
    if (unreachable === 0) {
      this.statusText.setContent(`{green-fg}\u2713 All Connected (${reachable}/${total}){/green-fg}`);
    } else if (reachable === 0) {
      this.statusText.setContent(`{red-fg}\u2717 All Offline (${unreachable}/${total}){/red-fg}`);
    } else {
      this.statusText.setContent(`{yellow-fg}\u26A0 Partial (${reachable}/${total}){/yellow-fg}`);
    }
    const lines = [];
    endpointHealth.forEach((ep, idx) => {
      const isSelected = idx === this.selectedEndpoint;
      const prefix = isSelected ? "> " : "  ";
      const statusIcon = ep.reachable ? "{green-fg}\u25CF{/green-fg}" : "{red-fg}\u25CF{/red-fg}";
      const latency = ep.latency ? ` ${ep.latency}ms` : "";
      const failInfo = ep.failCount > 0 ? ` (${ep.failCount} fails)` : "";
      const line = `${prefix}${statusIcon} ${ep.name}${latency}${failInfo}`;
      lines.push(line);
    });
    this.endpointsText.setContent(lines.slice(0, 3).join("\n"));
    const selected = endpointHealth[this.selectedEndpoint];
    if (selected && !selected.reachable) {
      this.detailText.setContent("{yellow-fg}Press [r] to retry{/yellow-fg}");
    } else {
      this.detailText.setContent("{gray-fg}j/k navigate, [r] retry{/gray-fg}");
    }
  }
  render(data) {
    this.update(data);
  }
};
var WIDGET_REGISTRY = {
  cpu: CpuWidget,
  memory: MemoryWidget,
  gpu: GpuWidget,
  network: NetworkWidget,
  disk: DiskWidget,
  system: SystemWidget,
  uptime: UptimeWidget,
  dataHealth: DataHealthWidget,
  settings: SettingsWidget,
  gatewayStatus: GatewayStatusWidget
};
function createWidget(type, options = {}) {
  const WidgetClass = WIDGET_REGISTRY[type];
  if (!WidgetClass) {
    throw new Error(`Unknown widget type: ${type}`);
  }
  return new WidgetClass({ ...options, id: options.id || type });
}
function getWidgetTypes() {
  return Object.keys(WIDGET_REGISTRY);
}

// src/widgets/widget-error-boundary.js
var import_blessed3 = __toESM(require("blessed"), 1);

// src/widgets/widget-error-isolation.js
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
    const C = this.options.theme.colors || {};
    const styles = this.getErrorStyles(C);
    if (this.originalBox && !this.originalBox.destroyed) {
      this.originalBox.hide();
    }
    this.errorContainer = import_blessed3.default.box({
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
    import_blessed3.default.text({
      parent: this.errorContainer,
      top: 1,
      left: "center",
      content: "{red-fg}\u2716{/red-fg}",
      tags: true,
      style: styles.icon
    });
    import_blessed3.default.text({
      parent: this.errorContainer,
      top: 2,
      left: "center",
      content: "{bold}Widget Failed{/bold}",
      tags: true,
      style: styles.title
    });
    const shortMessage = message.length > 40 ? message.substring(0, 37) + "..." : message;
    this.errorText = import_blessed3.default.text({
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
      import_blessed3.default.text({
        parent: this.errorContainer,
        top: currentTop++,
        left: "center",
        content: stackLines[0] || "",
        tags: true,
        style: styles.errorDetail
      });
    }
    if (this.errorState.retryCount > 0) {
      import_blessed3.default.text({
        parent: this.errorContainer,
        top: currentTop++,
        left: "center",
        content: `Retry ${this.errorState.retryCount}/${this.options.maxRetries}`,
        tags: true,
        style: styles.errorDetail
      });
    }
    currentTop++;
    this.retryButton = import_blessed3.default.button({
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
      this.dismissButton = import_blessed3.default.button({
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
        import_blessed3.default.text({
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
function withErrorBoundary(widget, options = {}) {
  return new WidgetErrorBoundary(widget, options);
}
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
var defaultManager = null;
function getErrorBoundaryManager() {
  if (!defaultManager) {
    defaultManager = new ErrorBoundaryManager();
  }
  return defaultManager;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseWidget,
  CONFIG_VERSION,
  CpuWidget,
  DEFAULT_PROCESSING_OPTIONS,
  DataHealthWidget,
  DiskWidget,
  ErrorBoundaryManager,
  ErrorStyles,
  GatewayStatusWidget,
  GpuWidget,
  MemoryWidget,
  NetworkWidget,
  PLUGIN_API_VERSION,
  PLUGIN_ERROR_CODES,
  PluginAPI,
  PluginError,
  PluginErrorAnalyzer,
  RateLimiter,
  SettingsWidget,
  SystemWidget,
  UptimeWidget,
  WIDGET_REGISTRY,
  WidgetErrorBoundary,
  WidgetLoader,
  buildDependencyGraph,
  checkVersionConstraints,
  compareVersions,
  createConfigPreprocessor,
  createWidget,
  createWidgetPlugin,
  detectCircularDependency,
  extractEnvRequirements,
  extractErrorInfo,
  findMissingDependencies,
  formatPluginError,
  getAllDependencies,
  getAllDependents,
  getErrorBoundaryManager,
  getPluginAPI,
  getWidgetLoader,
  getWidgetTypes,
  interpolateEnvVars,
  migrateConfig,
  parseDependencies,
  parseDependency,
  processConfigValues,
  processWidgetConfig,
  registerMigration,
  resolveDependencies,
  satisfiesVersion,
  topologicalSort,
  validateConfigVersion,
  validateManifest,
  validateWidgetDependencies,
  withErrorBoundary
});
