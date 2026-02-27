
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
  GpuWidget: () => GpuWidget,
  MemoryWidget: () => MemoryWidget,
  NetworkWidget: () => NetworkWidget,
  PLUGIN_API_VERSION: () => PLUGIN_API_VERSION,
  PluginAPI: () => PluginAPI,
  RateLimiter: () => RateLimiter,
  SystemWidget: () => SystemWidget,
  UptimeWidget: () => UptimeWidget,
  WIDGET_REGISTRY: () => WIDGET_REGISTRY,
  WidgetLoader: () => WidgetLoader,
  compareVersions: () => compareVersions,
  createConfigPreprocessor: () => createConfigPreprocessor,
  createWidget: () => createWidget,
  createWidgetPlugin: () => createWidgetPlugin,
  extractEnvRequirements: () => extractEnvRequirements,
  getPluginAPI: () => getPluginAPI,
  getWidgetLoader: () => getWidgetLoader,
  getWidgetTypes: () => getWidgetTypes,
  interpolateEnvVars: () => interpolateEnvVars,
  migrateConfig: () => migrateConfig,
  processConfigValues: () => processConfigValues,
  processWidgetConfig: () => processWidgetConfig,
  registerMigration: () => registerMigration,
  validateConfigVersion: () => validateConfigVersion,
  validateManifest: () => validateManifest
});
module.exports = __toCommonJS(index_exports);

// src/widgets/widget-loader.js
var import_fs4 = require("fs");
var import_path4 = require("path");
var import_url3 = require("url");

// src/logger.js
var import_fs2 = __toESM(require("fs"), 1);

// src/security.js
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function isValidPath(filePath) {
  if (!filePath || typeof filePath !== "string") return false;
  if (filePath.includes("\0")) return false;
  if (filePath.length === 0 || filePath.length > 4096) return false;
  return true;
}
function isSafeToChmodSync(filePath) {
  try {
    const stats = import_fs.default.lstatSync(filePath);
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
    import_fs.default.chmodSync(filePath, 384);
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
  validate(config, schema = null) {
    if (config === null || config === void 0) {
      return {};
    }
    if (typeof config !== "object") {
      throw new Error("Widget config must be an object");
    }
    return this._sanitizeValue(config, 0, schema);
  }
  /**
   * Internal sanitization method with depth tracking
   * @private
   */
  _sanitizeValue(value, depth, schema) {
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
      return this._sanitizeArray(value, depth, schema);
    }
    if (type === "object") {
      return this._sanitizeObject(value, depth, schema);
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
  _sanitizeArray(arr, depth, schema) {
    if (!Array.isArray(arr)) {
      return [];
    }
    if (arr.length > this.maxArrayLength) {
      arr = arr.slice(0, this.maxArrayLength);
    }
    const itemSchema = schema?.items;
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
  _sanitizeObject(obj, depth, schema) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return {};
    }
    const sanitized = {};
    const properties = schema?.properties || {};
    const allowedKeys = schema ? new Set(Object.keys(properties)) : null;
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
function sanitizeWidgetConfig(config, schema = null) {
  const validator = new WidgetConfigValidator();
  return validator.validate(config, schema);
}
function validatePluginPath(inputPath, options = {}) {
  const { allowedDirs = [], allowAbsolute = false, mustExist = false, expectedType = null } = options;
  if (!inputPath || typeof inputPath !== "string") {
    return { valid: false, path: null, error: "Path must be a non-empty string" };
  }
  if (inputPath.includes("\0")) {
    return { valid: false, path: null, error: "Path contains null bytes" };
  }
  if (import_path.default.isAbsolute(inputPath) && !allowAbsolute) {
    return { valid: false, path: null, error: "Absolute paths are not allowed" };
  }
  const normalizedInput = import_path.default.normalize(inputPath);
  if (normalizedInput.startsWith("..")) {
    return { valid: false, path: null, error: "Path traversal detected" };
  }
  if (inputPath.includes("../") || inputPath.includes("..\\")) {
    return { valid: false, path: null, error: "Path traversal detected" };
  }
  const parts = inputPath.split(import_path.default.sep).filter((part) => part.length > 0);
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
      resolvedPath = import_path.default.resolve(baseDir, inputPath);
    } else {
      resolvedPath = import_path.default.resolve(inputPath);
    }
  } catch (err) {
    return { valid: false, path: null, error: `Failed to resolve path: ${err.message}` };
  }
  if (allowedDirs.length > 0) {
    const isWithinAllowed = allowedDirs.some((allowedDir) => {
      const normalizedAllowed = allowedDir.endsWith(import_path.default.sep) ? allowedDir : allowedDir + import_path.default.sep;
      const normalizedResolved = resolvedPath.endsWith(import_path.default.sep) ? resolvedPath : resolvedPath + import_path.default.sep;
      return normalizedResolved.startsWith(normalizedAllowed);
    });
    if (!isWithinAllowed) {
      return { valid: false, path: null, error: "Path is outside allowed directories" };
    }
  }
  if (mustExist) {
    try {
      const stats = import_fs.default.statSync(resolvedPath);
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
    const realPath = import_fs.default.realpathSync(resolvedPath);
    if (allowedDirs.length > 0) {
      const realAllowedDirs = allowedDirs.map((allowedDir) => {
        try {
          return import_fs.default.realpathSync(allowedDir);
        } catch {
          return allowedDir;
        }
      });
      const isRealPathWithinAllowed = realAllowedDirs.some((realAllowedDir) => {
        const normalizedAllowed = realAllowedDir.endsWith(import_path.default.sep) ? realAllowedDir : realAllowedDir + import_path.default.sep;
        const normalizedReal = realPath.endsWith(import_path.default.sep) ? realPath : realPath + import_path.default.sep;
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
var import_os = __toESM(require("os"), 1);
var import_url = require("url");
var import_path2 = require("path");
var __filename = (0, import_url.fileURLToPath)("file://" + (typeof __dirname !== "undefined" ? require("path").join(__dirname, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname = (0, import_path2.dirname)(__filename);
var LOG_FILE_PATH = import_os.default.homedir() + "/.openclaw/claw-dashboard.log";
function ensureLogDir() {
  const logDir = import_os.default.homedir() + "/.openclaw";
  if (!import_fs2.default.existsSync(logDir)) {
    import_fs2.default.mkdirSync(logDir, { recursive: true });
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
      import_fs2.default.accessSync(LOG_FILE_PATH, import_fs2.default.constants.F_OK);
    } catch {
      isNewFile = true;
    }
    import_fs2.default.appendFileSync(LOG_FILE_PATH, logLine);
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

// src/config.js
var import_os2 = __toESM(require("os"), 1);
var import_fs3 = __toESM(require("fs"), 1);
var import_url2 = require("url");
var import_path3 = require("path");
var __filename2 = (0, import_url2.fileURLToPath)("file://" + (typeof __dirname2 !== "undefined" ? require("path").join(__dirname2, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname2 = (0, import_path3.dirname)(__filename2);
var DASHBOARD_VERSION = "unknown";
try {
  const pkg = JSON.parse(import_fs3.default.readFileSync((0, import_path3.join)(__dirname2, "../package.json"), "utf8"));
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
  PATH: import_os2.default.homedir() + "/.openclaw/dashboard-history.db",
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
var PATHS = {
  SETTINGS: import_os2.default.homedir() + "/.openclaw/dashboard-settings.json",
  EXPORTS: import_os2.default.homedir() + "/.openclaw/exports",
  OPENCLAW_CONFIG: import_os2.default.homedir() + "/.openclaw/openclaw.json",
  LOG: import_os2.default.homedir() + "/.openclaw/claw-dashboard.log",
  HOME_DIR: import_os2.default.homedir(),
  OPENCLAW_DIR: import_os2.default.homedir() + "/.openclaw",
  AGENTS_DIR: import_os2.default.homedir() + "/.openclaw/agents",
  WIDGETS_DIR: import_os2.default.homedir() + "/.openclaw/widgets",
  PLUGINS_DIR: import_os2.default.homedir() + "/.openclaw/plugins"
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
  showPerformanceMetrics: false,
  // Show performance metrics in footer
  theme: "auto",
  exportFormat: "json",
  exportDirectory: PATHS.EXPORTS,
  sessionSearchQuery: "",
  favorites: {},
  // Map of sessionId -> true
  showFavoritesOnly: false,
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
    cors: true
    // Enable CORS by default
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
  plugins: {}
  // Plugin-specific configurations
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
  ALERT_THRESHOLDS,
  ALERT_RATE_LIMIT,
  MAX_ALERT_HISTORY,
  VALIDATION,
  COMMAND_TIMEOUTS,
  PATHS,
  DEFAULT_SETTINGS,
  WORKERS,
  WEB,
  WIDGETS,
  DASHBOARD_VERSION
};

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

// src/widgets/widget-loader.js
var { PATHS: PATHS2, WIDGETS: WIDGETS2 } = config_default;
var WidgetLoader = class {
  constructor(options = {}) {
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
      logger_default.error(`Failed to load widget '${widget.id}': ${err.message}`);
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
        throw new Error(`Dependency '${depId}' not found for widget '${widget.id}'`);
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
      throw new Error(`Widget '${id}' missing required methods: ${missing.join(", ")}`);
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
    if (!(0, import_fs4.existsSync)(validatedPluginsDir)) {
      return [];
    }
    const discovered = [];
    const entries = (0, import_fs4.readdirSync)(validatedPluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const nameValidation = validatePluginName(entry.name);
      if (!nameValidation.valid) {
        logger_default.warn(`Skipping plugin directory with invalid name '${entry.name}': ${nameValidation.error}`);
        continue;
      }
      const pluginPath = (0, import_path4.join)(validatedPluginsDir, entry.name);
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
      const manifestPath = (0, import_path4.join)(pluginPath, "plugin.json");
      const indexPath = (0, import_path4.join)(pluginPath, "index.js");
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
      if (!(0, import_fs4.existsSync)(manifestPath) || !(0, import_fs4.existsSync)(indexPath)) {
        continue;
      }
      try {
        const manifest = JSON.parse(await import("fs").then((m) => m.readFileSync(manifestPath, "utf8")));
        if (manifest.type !== "widget") continue;
        discovered.push({
          id: manifest.id || entry.name,
          manifest,
          path: pluginPath,
          entryPoint: indexPath
        });
      } catch (err) {
        logger_default.warn(`Failed to load plugin manifest from ${entry.name}: ${err.message}`);
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
    const manifestPath = (0, import_path4.join)(validatedPluginPath, "plugin.json");
    const indexPath = (0, import_path4.join)(validatedPluginPath, "index.js");
    const manifestValidation = validatePluginPath(manifestPath, {
      allowedDirs: [validatedPluginPath],
      allowAbsolute: true,
      mustExist: true,
      expectedType: "file"
    });
    if (!manifestValidation.valid) {
      throw new Error(`Invalid manifest path: ${manifestValidation.error}`);
    }
    const indexValidation = validatePluginPath(indexPath, {
      allowedDirs: [validatedPluginPath],
      allowAbsolute: true,
      mustExist: true,
      expectedType: "file"
    });
    if (!indexValidation.valid) {
      throw new Error(`Invalid entry point path: ${indexValidation.error}`);
    }
    if (!(0, import_fs4.existsSync)(manifestPath)) {
      throw new Error(`Plugin manifest not found at ${validatedPluginPath}`);
    }
    let manifest;
    try {
      const manifestContent = await import("fs").then((m) => m.readFileSync(manifestPath, "utf8"));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      if (fallbackOnError) {
        logger_default.warn(`Failed to parse plugin manifest at ${validatedPluginPath}: ${err.message}`);
        return null;
      }
      throw new Error(`Failed to parse plugin manifest: ${err.message}`);
    }
    if (!manifest.id && !manifest.name) {
      manifest.id = (0, import_path4.basename)(validatedPluginPath);
    }
    const id = manifest.id || (0, import_path4.basename)(validatedPluginPath);
    let processedConfig = {};
    if (manifest.config) {
      const processingResult = processWidgetConfig(manifest.config, {
        interpolateEnv: true,
        validateVersion: true,
        supportLegacy: true,
        throwOnError: false
      });
      if (!processingResult.success) {
        logger_default.warn(`Config processing failed for plugin '${id}': ${processingResult.error}`);
        if (!fallbackOnError) {
          throw new Error(`Config processing failed: ${processingResult.error}`);
        }
      } else {
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
        const module2 = await import((0, import_url3.pathToFileURL)(indexPath).href);
        const WidgetClass = module2.default || module2.Widget || module2;
        if (typeof WidgetClass === "function") {
          return new WidgetClass(processedConfig);
        }
        return WidgetClass;
      } catch (err) {
        if (fallbackOnError) {
          logger_default.error(`Failed to load plugin '${id}': ${err.message}, plugin will be unavailable`);
          throw err;
        }
        throw err;
      }
    };
    this.register(id, manifest, loader);
    if (manifest.lazyLoad === false) {
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
   * @param {Object} options - Load options
   * @returns {Object} Results with successful and failed plugin IDs
   */
  async loadAllPluginsWithFallback(options = {}) {
    const { sanitize: sanitize2 = true, fallbackOnError = true, continueOnError = true } = options;
    const discovered = await this.discoverPlugins();
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };
    for (const plugin of discovered) {
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
    logger_default.debug(`Plugin loading complete: ${results.successful.length} loaded, ${results.failed.length} failed, ${results.skipped.length} skipped`);
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
};
var defaultLoader = null;
function getWidgetLoader(options) {
  if (!defaultLoader) {
    defaultLoader = new WidgetLoader(options);
  }
  return defaultLoader;
}

// src/widgets/plugin-api.js
var import_events = __toESM(require("events"), 1);
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
var PluginAPI = class extends import_events.default {
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
};
function validateManifest(manifest) {
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
var WIDGET_REGISTRY = {
  cpu: CpuWidget,
  memory: MemoryWidget,
  gpu: GpuWidget,
  network: NetworkWidget,
  disk: DiskWidget,
  system: SystemWidget,
  uptime: UptimeWidget,
  dataHealth: DataHealthWidget
};
function createWidget(type, options = {}) {
  const WidgetClass = WIDGET_REGISTRY[type];
  if (!WidgetClass) {
    throw new Error(`Unknown widget type: ${type}`);
  }
  return new WidgetClass(options);
}
function getWidgetTypes() {
  return Object.keys(WIDGET_REGISTRY);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseWidget,
  CONFIG_VERSION,
  CpuWidget,
  DEFAULT_PROCESSING_OPTIONS,
  DataHealthWidget,
  DiskWidget,
  GpuWidget,
  MemoryWidget,
  NetworkWidget,
  PLUGIN_API_VERSION,
  PluginAPI,
  RateLimiter,
  SystemWidget,
  UptimeWidget,
  WIDGET_REGISTRY,
  WidgetLoader,
  compareVersions,
  createConfigPreprocessor,
  createWidget,
  createWidgetPlugin,
  extractEnvRequirements,
  getPluginAPI,
  getWidgetLoader,
  getWidgetTypes,
  interpolateEnvVars,
  migrateConfig,
  processConfigValues,
  processWidgetConfig,
  registerMigration,
  validateConfigVersion,
  validateManifest
});
