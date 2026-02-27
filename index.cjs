
// Polyfill for __dirname in CJS bundle
var path = require('path');
var __filename = process.argv[1] || process.cwd() + '/index.js';
var __dirname = path.dirname(__filename);
#!/usr/bin/env node
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

// src/security.js
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
var import_fs;
var init_security = __esm({
  "src/security.js"() {
    import_fs = __toESM(require("fs"), 1);
  }
});

// src/logger.js
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
var import_fs2, import_os, import_url, import_path, __filename2, __dirname2, LOG_FILE_PATH, logger, logger_default;
var init_logger = __esm({
  "src/logger.js"() {
    import_fs2 = __toESM(require("fs"), 1);
    init_security();
    import_os = __toESM(require("os"), 1);
    import_url = require("url");
    import_path = require("path");
    __filename2 = (0, import_url.fileURLToPath)("file://" + (typeof __dirname2 !== "undefined" ? require("path").join(__dirname2, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
    __dirname2 = (0, import_path.dirname)(__filename2);
    LOG_FILE_PATH = import_os.default.homedir() + "/.openclaw/claw-dashboard.log";
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

// src/config.js
var import_os2, import_fs4, import_url2, import_path2, __filename3, __dirname3, DASHBOARD_VERSION, REFRESH_INTERVALS, IDLE_THRESHOLD_MS, HISTORY, GATEWAY, DEFAULT_GATEWAY_ENDPOINT, UI, CACHE_TTL, CACHE_CONFIG, DATABASE, CHECKSUM, RETRY, DEFAULT_RETRY_OPTIONS, ALERT_THRESHOLDS, ALERT_RATE_LIMIT, MAX_ALERT_HISTORY, VALIDATION, COMMAND_TIMEOUTS, WORKERS, WEB, WIDGETS, PATHS, DEFAULT_SETTINGS, config_default;
var init_config = __esm({
  "src/config.js"() {
    import_os2 = __toESM(require("os"), 1);
    import_fs4 = __toESM(require("fs"), 1);
    import_url2 = require("url");
    import_path2 = require("path");
    __filename3 = (0, import_url2.fileURLToPath)("file://" + (typeof __dirname3 !== "undefined" ? require("path").join(__dirname3, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
    __dirname3 = (0, import_path2.dirname)(__filename3);
    DASHBOARD_VERSION = "unknown";
    try {
      const pkg = JSON.parse(import_fs4.default.readFileSync((0, import_path2.join)(__dirname3, "../package.json"), "utf8"));
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
      PATH: import_os2.default.homedir() + "/.openclaw/dashboard-history.db",
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
    PATHS = {
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
  }
});

// src/workers/worker-pool.js
var worker_pool_exports = {};
__export(worker_pool_exports, {
  WorkerPool: () => WorkerPool,
  default: () => worker_pool_default
});
var import_worker_threads, import_url3, import_path4, __filename4, __dirname4, WorkerPool, workerPool, worker_pool_default;
var init_worker_pool = __esm({
  "src/workers/worker-pool.js"() {
    import_worker_threads = require("worker_threads");
    import_url3 = require("url");
    import_path4 = require("path");
    init_logger();
    init_config();
    __filename4 = (0, import_url3.fileURLToPath)("file://" + (typeof __dirname4 !== "undefined" ? require("path").join(__dirname4, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
    __dirname4 = (0, import_path4.dirname)(__filename4);
    WorkerPool = class {
      constructor(options = {}) {
        this.workerPath = options.workerPath || (0, import_path4.join)(__dirname4, "system-worker.js");
        this.maxWorkers = options.maxWorkers || config_default.WORKERS?.MAX_WORKERS || 2;
        this.taskTimeout = options.taskTimeout || config_default.WORKERS?.TASK_TIMEOUT || 1e4;
        this.enableWorkers = options.enableWorkers ?? config_default.WORKERS?.ENABLED ?? true;
        this.workers = [];
        this.taskQueue = [];
        this.taskId = 0;
        this.pendingTasks = /* @__PURE__ */ new Map();
        this.isShutdown = false;
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
              task.resolve(message.data);
            } else {
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
        }, 100);
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
       * Execute a systeminformation command via worker thread
       * @param {string} command - Command to execute
       * @param {Object} options - Command options
       * @returns {Promise<any>} Command result
       */
      async execute(command, options = {}) {
        if (!this.workersSupported || !this.enableWorkers || this.workers.length === 0) {
          return this.fallbackExecute(command, options);
        }
        return new Promise((resolve3, reject) => {
          const id = ++this.taskId;
          const timeout = setTimeout(() => {
            this.pendingTasks.delete(id);
            reject(new Error(`Worker task timeout: ${command}`));
          }, this.taskTimeout);
          this.pendingTasks.set(id, {
            id,
            command,
            options,
            resolve: resolve3,
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
              const [os6, ver, time] = await Promise.all([
                systemInfo.osInfo(),
                systemInfo.versions(),
                systemInfo.time()
              ]);
              return { os: os6, ver, time };
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
        return {
          enabled: this.enableWorkers,
          supported: this.workersSupported,
          totalWorkers: this.workers.length,
          busyWorkers: this.workers.filter((w) => w.isBusy).length,
          readyWorkers: this.workers.filter((w) => w.isReady).length,
          pendingTasks: this.pendingTasks.size,
          queuedTasks: this.taskQueue.length
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
          var fs10 = require("node:fs");
          za = __dirname + "/";
          Ba = (a) => {
            a = Ca(a) ? new URL(a) : a;
            return fs10.readFileSync(a);
          };
          Aa = async (a) => {
            a = Ca(a) ? new URL(a) : a;
            return fs10.readFileSync(a, void 0);
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
                  c = fs10.readSync(d, b, 0, 256);
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

// src/hints.js
var hints_exports = {};
__export(hints_exports, {
  default: () => hints_default,
  dismissActiveHint: () => dismissActiveHint,
  isShowingHints: () => isShowingHints,
  markFirstRunComplete: () => markFirstRunComplete,
  shouldShowHints: () => shouldShowHints,
  showFirstRunHints: () => showFirstRunHints,
  showHintsManual: () => showHintsManual
});
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
  return new Promise((resolve3) => {
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
          resolve3();
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
        resolve3();
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
        resolve3();
      }
    };
    screen.on("keypress", keyHandler);
  });
}
async function showHintsManual(screen) {
  screenRef = screen;
  currentHintIndex = 0;
  dismissedHints.clear();
  return new Promise((resolve3) => {
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
          screen.render();
          resolve3();
        }
      }
      if (ch === "q" || key.name === "escape" || ch === "h") {
        if (hintOverlay) {
          hintOverlay.destroy();
          hintOverlay = null;
        }
        screen.removeListener("keypress", keyHandler);
        screen.render();
        resolve3();
      }
    };
    screen.on("keypress", keyHandler);
  });
}
function dismissActiveHint() {
  if (hintOverlay) {
    hintOverlay.destroy();
    hintOverlay = null;
  }
}
function isShowingHints() {
  return hintOverlay !== null;
}
var import_blessed2, PATHS2, DASHBOARD_VERSION2, HINTS, dismissedHints, currentHintIndex, hintOverlay, screenRef, hints_default;
var init_hints = __esm({
  "src/hints.js"() {
    import_blessed2 = __toESM(require("blessed"), 1);
    init_config();
    init_logger();
    ({ PATHS: PATHS2, DASHBOARD_VERSION: DASHBOARD_VERSION2 } = config_default);
    HINTS = [
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
    dismissedHints = /* @__PURE__ */ new Set();
    currentHintIndex = 0;
    hintOverlay = null;
    screenRef = null;
    hints_default = {
      shouldShowHints,
      showFirstRunHints,
      showHintsManual,
      markFirstRunComplete,
      dismissActiveHint,
      isShowingHints
    };
  }
});

// index.js
var import_blessed4 = __toESM(require("blessed"), 1);
var import_blessed_contrib = __toESM(require("blessed-contrib"), 1);
var import_systeminformation = __toESM(require("systeminformation"), 1);
var import_child_process3 = require("child_process");
var import_util2 = require("util");
var import_https2 = __toESM(require("https"), 1);
var import_os5 = __toESM(require("os"), 1);
var import_fs9 = __toESM(require("fs"), 1);
var import_url6 = require("url");
var import_path6 = require("path");
init_logger();

// src/themes.js
init_logger();
var import_fs3 = __toESM(require("fs"), 1);
var import_child_process = require("child_process");
var SETTINGS_PATH = process.env.HOME + "/.openclaw/dashboard-settings.json";
var THEME_KEY = "theme";
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
    detectedBackground = detectTerminalBackground();
    logger_default.info(`Terminal background detected: ${detectedBackground}`);
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
    const data = import_fs3.default.readFileSync(SETTINGS_PATH, "utf8");
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
      const data = import_fs3.default.readFileSync(SETTINGS_PATH, "utf8");
      settings = JSON.parse(data);
    } catch {
    }
    settings[THEME_KEY] = currentThemeName;
    const dir = process.env.HOME + "/.openclaw";
    if (!import_fs3.default.existsSync(dir)) import_fs3.default.mkdirSync(dir, { recursive: true });
    import_fs3.default.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
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
var import_os3 = __toESM(require("os"), 1);
init_config();
var import_fs5 = __toESM(require("fs"), 1);
var import_path3 = require("path");
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
  const expandedPath = filePath.startsWith("~") ? (0, import_path3.resolve)(import_os3.default.homedir(), filePath.slice(1)) : (0, import_path3.resolve)(filePath);
  if (mustExist && !import_fs5.default.existsSync(expandedPath)) {
    return { valid: false, error: `Path does not exist: ${expandedPath}` };
  }
  const parentDir = (0, import_path3.dirname)(expandedPath);
  if (!import_fs5.default.existsSync(parentDir) && !import_fs5.default.existsSync(expandedPath)) {
    try {
      const parentExists = import_fs5.default.existsSync(parentDir);
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
    showWidget7: validateWidgetVisibility
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
    showWidget1: true,
    showWidget2: true,
    showWidget3: true,
    showWidget4: true,
    showWidget5: true,
    showWidget6: true,
    showWidget7: true
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
        const [os6, ver, time] = await Promise.all([
          si2.osInfo(),
          si2.versions(),
          si2.time()
        ]);
        return { os: os6, ver, time };
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
var import_fs6 = __toESM(require("fs"), 1);
var import_path5 = __toESM(require("path"), 1);
var import_url4 = require("url");
init_logger();
init_config();
var __filename5 = (0, import_url4.fileURLToPath)("file://" + (typeof __dirname5 !== "undefined" ? require("path").join(__dirname5, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname5 = import_path5.default.dirname(__filename5);
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
      if (import_fs6.default.existsSync(DB_PATH)) {
        data = import_fs6.default.readFileSync(DB_PATH);
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
    const dir = import_path5.default.dirname(DB_PATH);
    if (!import_fs6.default.existsSync(dir)) {
      import_fs6.default.mkdirSync(dir, { recursive: true });
    }
    import_fs6.default.writeFileSync(DB_PATH, buffer);
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
  return new Promise((resolve3) => {
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
      resolve3();
    }, 2500);
  });
}

// index.js
init_hints();

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
var GatewayError = class extends DashboardError {
  constructor(message, details = {}) {
    super(message, "GATEWAY_ERROR", details);
    this.name = "GatewayError";
  }
};
var AuthError = class extends DashboardError {
  constructor(message, details = {}) {
    super(message, "AUTH_ERROR", details);
    this.name = "AuthError";
  }
};
var NetworkError = class extends DashboardError {
  constructor(message, details = {}) {
    super(message, "NETWORK_ERROR", details);
    this.name = "NetworkError";
  }
};
var TimeoutError = class extends DashboardError {
  constructor(message, details = {}) {
    super(message, "TIMEOUT_ERROR", details);
    this.name = "TimeoutError";
  }
};
var ChecksumError = class extends DashboardError {
  constructor(message, details = {}) {
    super(message, "CHECKSUM_ERROR", details);
    this.name = "ChecksumError";
  }
};

// src/gateway-manager.js
var import_fs7 = __toESM(require("fs"), 1);
var import_https = __toESM(require("https"), 1);
var import_http = __toESM(require("http"), 1);
init_logger();
init_config();

// src/checksum.js
var import_crypto = __toESM(require("crypto"), 1);
init_config();
init_logger();
var SUPPORTED_ALGORITHMS = ["sha256", "sha512", "md5"];
function computeChecksum(data, algorithm = null) {
  const algo = algorithm || config_default.CHECKSUM.ALGORITHM;
  if (!SUPPORTED_ALGORITHMS.includes(algo)) {
    throw new Error(`Unsupported hash algorithm: ${algo}. Supported: ${SUPPORTED_ALGORITHMS.join(", ")}`);
  }
  const hash = import_crypto.default.createHash(algo);
  hash.update(data);
  return hash.digest("hex");
}
function verifyChecksum(data, expectedChecksum, algorithm = null) {
  if (!expectedChecksum) {
    return false;
  }
  try {
    const computed = computeChecksum(data, algorithm);
    return import_crypto.default.timingSafeEqual(
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
    return new Promise((resolve3, reject) => {
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
              resolve3(Array.isArray(parsed) ? parsed : Object.values(parsed));
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
    if (!import_fs7.default.existsSync(sessionsPath)) {
      return null;
    }
    const data = import_fs7.default.readFileSync(sessionsPath, "utf8");
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

// src/container-detector.js
var import_fs8 = __toESM(require("fs"), 1);
var import_os4 = __toESM(require("os"), 1);
var import_child_process2 = require("child_process");
var import_util = require("util");
init_logger();
var execAsync = (0, import_util.promisify)(import_child_process2.exec);
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
    const cgroupContent = import_fs8.default.readFileSync("/proc/self/cgroup", "utf8");
    return cgroupContent.includes("docker") || cgroupContent.includes("containerd") || cgroupContent.includes("crio") || /[0-9a-f]{64}/.test(cgroupContent);
  } catch {
    return false;
  }
}
function checkDockerEnvFile() {
  try {
    import_fs8.default.accessSync("/.dockerenv", import_fs8.default.constants.F_OK);
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
    if (import_fs8.default.existsSync("/var/run/secrets/kubernetes.io")) {
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
      if (import_fs8.default.existsSync(namespacePath)) {
        result.namespace = import_fs8.default.readFileSync(namespacePath, "utf8").trim();
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
    const version = import_fs8.default.readFileSync("/proc/version", "utf8").toLowerCase();
    if (version.includes("microsoft") || version.includes("wsl")) {
      return true;
    }
  } catch {
  }
  if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) {
    return true;
  }
  try {
    if (import_fs8.default.existsSync("/mnt/c/Windows")) {
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
    const version = import_fs8.default.readFileSync("/proc/version", "utf8").toLowerCase();
    if (version.includes("wsl2") || version.includes("microsoft-standard")) {
      return 2;
    }
  } catch {
  }
  try {
    if (import_fs8.default.existsSync("/run/systemd/system")) {
      return 2;
    }
  } catch {
  }
  try {
    const version = import_fs8.default.readFileSync("/proc/version", "utf8");
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
    const osRelease = import_fs8.default.readFileSync("/etc/os-release", "utf8");
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
    const cgroupContent = import_fs8.default.readFileSync("/proc/self/cgroup", "utf8");
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
    const cgroupContent = import_fs8.default.readFileSync("/proc/self/cgroup", "utf8");
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
    if (import_fs8.default.existsSync("/run/containerd")) {
      return "containerd";
    }
    if (import_fs8.default.existsSync("/run/crio")) {
      return "cri-o";
    }
    if (import_fs8.default.existsSync("/run/docker.sock") || import_fs8.default.existsSync("/var/run/docker.sock")) {
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
  const platform = import_os4.default.platform();
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
var import_blessed3 = __toESM(require("blessed"), 1);
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
  const bg = import_blessed3.default.box({
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
  return new Promise((resolve3) => {
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
      resolve3();
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
  return new Promise((resolve3) => {
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
      resolve3();
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
  return new Promise((resolve3) => {
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
        resolve3();
      }
    });
  });
}
function staggeredFade(screen, items, show, options = {}) {
  const delay = options.staggerDelay || 30;
  const duration = options.duration || 100;
  const promises = items.map((item, index) => {
    return new Promise((resolve3) => {
      setTimeout(() => {
        quickFade(screen, item, show, duration).then(resolve3);
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
  setContent(widgetId, widget, content) {
    if (!widget || widget.destroyed) return false;
    const changed = this.tracker.trackContent(widgetId, content, (newContent) => {
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
var PerformanceMonitor = class {
  constructor() {
    this.history = [];
    this.maxHistory = 60;
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    this.isTracking = false;
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
    logger_default.debug("Performance monitoring started");
  }
  /**
   * Stop performance tracking
   */
  stop() {
    this.isTracking = false;
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
    status += ` | {${cpuColor}}CPU: ${latest.cpuPercent}%{/${cpuColor}}`;
    status += ` | Refresh: ${latest.refreshRate}ms`;
    if (detailed && this.metrics.avgEventLoopLag > 0) {
      const lagColor = this.metrics.avgEventLoopLag > 100 ? "red-fg" : this.metrics.avgEventLoopLag > 50 ? "yellow-fg" : "gray-fg";
      status += ` | {${lagColor}}Lag: ${this.metrics.avgEventLoopLag}ms{/${lagColor}}`;
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
    return {
      degraded: reasons.length > 0,
      reasons
    };
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
    logger_default.debug("Performance metrics reset");
  }
};
var performance_monitor_default = new PerformanceMonitor();

// src/web-server.js
var import_http2 = __toESM(require("http"), 1);
var import_url5 = __toESM(require("url"), 1);
init_logger();
init_config();
var { WEB: WEB2, DASHBOARD_VERSION: DASHBOARD_VERSION3 } = config_default;
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": WEB2.CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, getCorsHeaders());
  res.end(JSON.stringify(data, null, 2));
}
function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message, status: statusCode });
}
var WebServer = class {
  constructor(options = {}) {
    this.port = options.port || WEB2.DEFAULT_PORT;
    this.host = options.host || WEB2.HOST;
    this.server = null;
    this.dataProvider = null;
    this.startTime = Date.now();
    this.requestCount = 0;
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
   * Handle incoming HTTP requests
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   */
  async handleRequest(req, res) {
    this.requestCount++;
    const parsedUrl = import_url5.default.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    if (req.method === "OPTIONS") {
      res.writeHead(200, getCorsHeaders());
      res.end();
      return;
    }
    try {
      switch (pathname) {
        case WEB2.ENDPOINTS.HEALTH:
          this.handleHealth(req, res);
          break;
        case WEB2.ENDPOINTS.METRICS:
          await this.handleMetrics(req, res);
          break;
        case WEB2.ENDPOINTS.SESSIONS:
          await this.handleSessions(req, res);
          break;
        case WEB2.ENDPOINTS.AGENTS:
          await this.handleAgents(req, res);
          break;
        case WEB2.ENDPOINTS.LOGS:
          await this.handleLogs(req, res);
          break;
        case WEB2.ENDPOINTS.STATUS:
          await this.handleStatus(req, res);
          break;
        default:
          sendError(res, 404, "Not found");
      }
    } catch (err) {
      logger_default.error(`Web server error: ${err.message}`);
      sendError(res, 500, "Internal server error");
    }
  }
  /**
   * Handle health check endpoint
   */
  handleHealth(req, res) {
    sendJson(res, 200, this.getHealth());
  }
  /**
   * Handle metrics endpoint
   */
  async handleMetrics(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available");
      return;
    }
    try {
      const data = await this.dataProvider("metrics");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metrics: data || {}
      });
    } catch (err) {
      logger_default.error(`Metrics error: ${err.message}`);
      sendError(res, 500, "Failed to fetch metrics");
    }
  }
  /**
   * Handle sessions endpoint
   */
  async handleSessions(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available");
      return;
    }
    try {
      const data = await this.dataProvider("sessions");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        sessions: data || [],
        count: data?.length || 0
      });
    } catch (err) {
      logger_default.error(`Sessions error: ${err.message}`);
      sendError(res, 500, "Failed to fetch sessions");
    }
  }
  /**
   * Handle agents endpoint
   */
  async handleAgents(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available");
      return;
    }
    try {
      const data = await this.dataProvider("agents");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        agents: data || [],
        count: data?.length || 0
      });
    } catch (err) {
      logger_default.error(`Agents error: ${err.message}`);
      sendError(res, 500, "Failed to fetch agents");
    }
  }
  /**
   * Handle logs endpoint
   */
  async handleLogs(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available");
      return;
    }
    try {
      const data = await this.dataProvider("logs");
      sendJson(res, 200, {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        logs: data || [],
        count: data?.length || 0
      });
    } catch (err) {
      logger_default.error(`Logs error: ${err.message}`);
      sendError(res, 500, "Failed to fetch logs");
    }
  }
  /**
   * Handle full status endpoint
   */
  async handleStatus(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, "Data provider not available");
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
      });
    } catch (err) {
      logger_default.error(`Status error: ${err.message}`);
      sendError(res, 500, "Failed to fetch status");
    }
  }
  /**
   * Start the web server
   * @returns {Promise<WebServer>} This instance for chaining
   */
  async start() {
    return new Promise((resolve3, reject) => {
      this.server = import_http2.default.createServer((req, res) => this.handleRequest(req, res));
      this.server.on("error", (err) => {
        logger_default.error(`Web server error: ${err.message}`);
        reject(err);
      });
      this.server.listen(this.port, this.host, () => {
        logger_default.info(`Web server listening on http://${this.host}:${this.port}`);
        resolve3(this);
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
    return new Promise((resolve3) => {
      this.server.close(() => {
        logger_default.info("Web server stopped");
        resolve3();
      });
    });
  }
  /**
   * Get server info
   * @returns {Object} Server information
   */
  getInfo() {
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
      requests: this.requestCount
    };
  }
};
var web_server_default = WebServer;

// index.js
var { debounce: cacheDebounce, throttle: throttle2 } = cache_default;
var __filename6 = (0, import_url6.fileURLToPath)("file://" + (typeof __dirname6 !== "undefined" ? require("path").join(__dirname6, "index.js").replace(/\\/g, "/") : process.cwd() + "/index.js"));
var __dirname6 = (0, import_path6.dirname)(__filename6);
var execAsync2 = (0, import_util2.promisify)(import_child_process3.exec);
function validateFilePath(filePath, allowedDirs = []) {
  try {
    if (!filePath || typeof filePath !== "string") {
      return { valid: false, resolvedPath: filePath, error: "Invalid file path" };
    }
    const normalizedPath = filePath.startsWith("~") ? (0, import_path6.join)(import_os5.default.homedir(), filePath.slice(1)) : filePath;
    const resolvedPath = (0, import_path6.resolve)(normalizedPath);
    const homeDir = import_os5.default.homedir();
    const defaultAllowedDirs = [
      homeDir,
      homeDir + "/.openclaw",
      homeDir + "/.openclaw/agents",
      "/tmp"
    ];
    const allAllowedDirs = [...defaultAllowedDirs, ...allowedDirs];
    const isAllowed = allAllowedDirs.some((allowedDir) => {
      const resolvedAllowed = (0, import_path6.resolve)(allowedDir);
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
var SETTINGS_PATH2 = config_default.PATHS.SETTINGS;
var DEFAULT_SETTINGS2 = config_default.DEFAULT_SETTINGS;
var ACTIVE_REFRESH_INTERVAL = config_default.REFRESH_INTERVALS.ACTIVE;
var IDLE_REFRESH_INTERVAL = config_default.REFRESH_INTERVALS.IDLE;
var IDLE_THRESHOLD_MS2 = config_default.IDLE_THRESHOLD_MS;
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    version: false,
    debug: false,
    web: false,
    webPort: config_default.WEB.DEFAULT_PORT,
    webHost: config_default.WEB.HOST
  };
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
    }
  }
  return options;
}
function showHelp() {
  console.log(`
Claw Dashboard - A beautiful terminal dashboard for monitoring OpenClaw instances

Usage: clawdash [OPTIONS]

Options:
  -h, --help       Display this help message
  -v, --version    Display version information
  -d, --debug      Run in debug mode with additional logging
  -w, --web        Run web server mode (no TUI, HTTP API only)
  -p, --web-port   Set web server port (default: 18790, requires --web)
  --web-host       Set web server host (default: 0.0.0.0, requires --web)

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
function showVersion() {
  console.log(`clawdash ${DASHBOARD_VERSION}`);
}
var cliOptions = parseCliArgs();
if (cliOptions.help) {
  showHelp();
  process.exit(0);
}
if (cliOptions.version) {
  showVersion();
  process.exit(0);
}
function loadSettings() {
  try {
    const pathValidation = validateFilePath(SETTINGS_PATH2);
    if (!pathValidation.valid) {
      logger_default.warn(`Settings path validation failed: ${pathValidation.error}`);
      return validation_default.getDefaultSettings();
    }
    const data = import_fs9.default.readFileSync(pathValidation.resolvedPath, "utf8");
    const loaded = JSON.parse(data);
    const validationResult = validation_default.validateSettings(loaded);
    return validationResult.valid ? validationResult.value : validation_default.getDefaultSettings();
  } catch {
    return validation_default.getDefaultSettings();
  }
}
function saveSettings(settings) {
  try {
    const pathValidation = validateFilePath(SETTINGS_PATH2);
    if (!pathValidation.valid) {
      logger_default.warn(`Settings path validation failed: ${pathValidation.error}`);
      return;
    }
    const dir = config_default.PATHS.OPENCLAW_DIR;
    if (!import_fs9.default.existsSync(dir)) import_fs9.default.mkdirSync(dir, { recursive: true });
    import_fs9.default.writeFileSync(pathValidation.resolvedPath, JSON.stringify(settings, null, 2));
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
function getLogFilterFn(filter) {
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
    return await new Promise((resolve3) => {
      import_https2.default.get("https://api.github.com/repos/openclaw/openclaw/releases/latest", {
        headers: { "User-Agent": "claw-dashboard" }
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
          try {
            resolve3(JSON.parse(data).tag_name?.replace(/^v/, ""));
          } catch {
            resolve3(null);
          }
        });
      }).on("error", () => resolve3(null)).setTimeout(3e3);
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
    const { stdout: launchctlOut } = await execAsync2("launchctl list | grep gateway 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.LAUNCHCTL });
    const pidMatch = launchctlOut.trim().match(/^(\d+)\s/);
    if (!pidMatch) return null;
    const pid = pidMatch[1];
    const { stdout: psOut } = await execAsync2(`ps -o lstart= -p ${pid} 2>/dev/null`, { timeout: config_default.COMMAND_TIMEOUTS.LAUNCHCTL });
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
    const { stdout } = await execAsync2("system_profiler SPDisplaysDataType -json 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.SYSTEM_PROFILER });
    const data = JSON.parse(stdout);
    const displays = data?.SPDisplaysDataType;
    if (displays?.length > 0) {
      model = displays[0].sppci_model || displays[0]._name;
      if (displays[0].spdisplays_utilization) utilization = parseFloat(displays[0].spdisplays_utilization);
    }
  } catch {
  }
  try {
    const { stdout } = await execAsync2('ioreg -l -w 0 2>/dev/null | grep -E "(AGX|G14G|G13G|G15G)" | head -5', { timeout: config_default.COMMAND_TIMEOUTS.IOREG });
    if (stdout.includes("AGX") && !model) {
      if (stdout.includes("G15G") || stdout.includes("G16G")) model = "Apple M3 GPU";
      else if (stdout.includes("G14G")) model = "Apple M2 GPU";
      else if (stdout.includes("G13G")) model = "Apple M1 GPU";
      else model = "Apple Silicon GPU";
    }
  } catch {
  }
  try {
    const { stdout } = await execAsync2('powermetrics --samplers gpu_power -n 1 -i 50 2>&1 | grep -E "(GPU active|GPU frequency)" | head -5', { timeout: config_default.COMMAND_TIMEOUTS.POWERMETRICS });
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
  return import_os5.default.platform();
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
    const { stdout: nvidiaOut } = await execAsync2("nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.NVIDIA_SMI });
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
      const { stdout: lspciOut } = await execAsync2('lspci -vmm 2>/dev/null | grep -E "VGA|Display" | head -10', { timeout: config_default.COMMAND_TIMEOUTS.LSPCI });
      if (lspciOut) {
        const modelMatch = lspciOut.match(/Device:\s+(.+)/i) || lspciOut.match(/VGA.*?:\s*(.+)/i);
        if (modelMatch) model = modelMatch[1].trim();
      }
    } catch {
    }
    if (model && (model.toLowerCase().includes("amd") || model.toLowerCase().includes("radeon"))) {
      try {
        const { stdout: radeonOut } = await execAsync2("radeontop -d - -l 1 2>/dev/null | head -5", { timeout: config_default.COMMAND_TIMEOUTS.RADEONTOP });
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
    const { stdout: nvidiaOut } = await execAsync2(
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
      const { stdout: psOut } = await execAsync2(
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
      const { stdout: wslOut } = await execAsync2(
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
      const { stdout: linuxOut } = await execAsync2(
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
    const { stdout: wmiOut } = await execAsync2(
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
    const { stdout: perfOut } = await execAsync2(
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
      const { stdout: nvidiaWmi } = await execAsync2(
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
      const { stdout: nvidiaOut } = await execAsync2(
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
    this.settings = loadSettings();
    loadTheme();
    this.screen = import_blessed4.default.screen({ smartCSR: true, title: "Claw Dashboard", mouse: true });
    this.diffRenderer = new DifferentialRenderer(this.screen);
    this.selectedSessionIndex = 0;
    this.paginationOffset = 0;
    this.sessionSearchQuery = this.settings.sessionSearchQuery || "";
    this.isSearchMode = false;
    this.filteredSessions = [];
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
    this.init();
    this.currentRefreshInterval = this.settings.refreshInterval;
    this.lastActivityTime = Date.now();
    this.activeAgentCount = 0;
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
    this.w.terminalSizeWarning = import_blessed4.default.box({
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
    const warningText = import_blessed4.default.text({
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
      health: this.settings.showWidget8 !== false
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
  async init() {
    this.createWidgets();
    await showSplashScreen(this.screen);
    await showFirstRunHints(this.screen, this.settings, saveSettings);
    this.setupKeys();
    this.setupMouse();
    this.fetchVersion();
    const theme = getCurrentTheme();
    this.settings.theme = theme.name.toLowerCase().replace(" ", "-").replace("high-contrast", "high-contrast");
    this.applyTheme();
    setTimeout(() => this.start(), 500);
  }
  async fetchVersion() {
    try {
      const { stdout } = await execAsync2('openclaw --version 2>/dev/null || echo "unknown"', { timeout: config_default.COMMAND_TIMEOUTS.OPENCLAW_VERSION });
      this.data.version = stdout.trim();
      this.data.latest = await getLatestVersion();
    } catch {
      this.data.version = "unknown";
    }
  }
  createWidgets() {
    this.w = {};
    const LOGO_WIDTH = 40;
    this.w.logo = import_blessed4.default.text({ parent: this.screen, top: 2, left: 1, width: LOGO_WIDTH, content: ASCII_LOGO.join("\n"), style: { fg: C.brightCyan, bold: true } });
    this.w.title = import_blessed4.default.text({ parent: this.screen, top: 8, left: 3, content: `Dashboard ${DASHBOARD_VERSION}, openclaw checking...`, style: { fg: C.brightWhite, bold: true } });
    this.w.clock = import_blessed4.default.text({ parent: this.screen, top: 0, left: 0, width: 26, content: "--:--", style: { fg: C.brightCyan, bold: true }, align: "left", tags: true });
    this.createWidgetBoxes();
    this.w.sessBox = import_blessed4.default.box({ parent: this.screen, left: 0, width: "100%", height: 9, border: { type: "line" }, label: " SESSIONS ", style: { border: { fg: C.blue } }, tags: true, overflow: "hidden", scrollable: false });
    this.w.sessHeader = import_blessed4.default.text({ parent: this.w.sessBox, top: 0, left: 1, width: "98%", content: "  STATUS AGENT                                          MODEL           CONTEXT      IDLE    CHAN", style: { fg: C.brightWhite, bold: true }, overflow: "hidden" });
    this.w.sessList = import_blessed4.default.text({ parent: this.w.sessBox, top: 1, left: 1, width: "98%", height: 6, content: "", style: { fg: C.white }, tags: true, overflow: "hidden", scrollable: false });
    this.w.sessCount = import_blessed4.default.text({ parent: this.w.sessBox, top: 0, right: 2, content: "", style: { fg: C.gray } });
    this.w.sessTruncated = import_blessed4.default.text({ parent: this.w.sessBox, top: 7, left: 2, content: "", style: { fg: C.yellow } });
    this.w.logBox = import_blessed4.default.box({ parent: this.screen, left: 0, width: "100%", height: 19, border: { type: "line" }, label: " OPENCLAW LOGS ", style: { border: { fg: C.cyan } }, scrollable: true, alwaysScroll: true });
    this.w.logContent = import_blessed4.default.text({ parent: this.w.logBox, top: 0, left: 1, width: "95%-2", content: "Loading logs...", style: { fg: C.gray }, tags: true });
    this.w.footer = import_blessed4.default.box({ parent: this.screen, bottom: 0, left: 0, width: "100%", height: 1, style: { bg: C.black, fg: C.gray } });
    this.w.footerText = import_blessed4.default.text({ parent: this.w.footer, top: 0, left: "center", content: "", style: { fg: C.gray } });
    this.recalculateLayout();
  }
  // Create the 7 widget boxes (always created, visibility toggled)
  createWidgetBoxes() {
    const boxHeight = 5;
    this.w.cpuBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " CPU ", style: { border: { fg: C.cyan } } });
    this.w.cpuValue = import_blessed4.default.text({ parent: this.w.cpuBox, top: 0, left: "center", content: "0%", style: { fg: C.brightGreen, bold: true } });
    this.w.cpuDetail = import_blessed4.default.text({ parent: this.w.cpuBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.memBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " MEMORY ", style: { border: { fg: C.magenta } } });
    this.w.memValue = import_blessed4.default.text({ parent: this.w.memBox, top: 0, left: "center", content: "0%", style: { fg: C.brightMagenta, bold: true } });
    this.w.memDetail = import_blessed4.default.text({ parent: this.w.memBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.gpuBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " GPU ", style: { border: { fg: C.yellow } } });
    this.w.gpuValue = import_blessed4.default.text({ parent: this.w.gpuBox, top: 0, left: "center", content: "Detecting...", style: { fg: C.brightYellow, bold: true } });
    this.w.gpuDetail = import_blessed4.default.text({ parent: this.w.gpuBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.netBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " NETWORK ", style: { border: { fg: C.brightCyan } } });
    this.w.netValue = import_blessed4.default.text({ parent: this.w.netBox, top: 0, left: "center", content: "Loading...", style: { fg: C.brightCyan, bold: true } });
    this.w.netDetail = import_blessed4.default.text({ parent: this.w.netBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.diskBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " DISK ", style: { border: { fg: C.green } } });
    this.w.diskValue = import_blessed4.default.text({ parent: this.w.diskBox, top: 0, left: "center", content: "0%", style: { fg: C.brightGreen, bold: true } });
    this.w.diskDetail = import_blessed4.default.text({ parent: this.w.diskBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.sysBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " SYSTEM ", style: { border: { fg: C.gray } } });
    this.w.sysInfoLine1 = import_blessed4.default.text({ parent: this.w.sysBox, top: 0, left: "center", content: "...", style: { fg: C.gray } });
    this.w.sysInfoLine2 = import_blessed4.default.text({ parent: this.w.sysBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
    this.w.uptimeBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " UPTIME ", style: { border: { fg: C.brightMagenta } } });
    this.w.uptimeSys = import_blessed4.default.text({ parent: this.w.uptimeBox, top: 0, left: "center", content: "Sys: --", style: { fg: C.brightMagenta, bold: true } });
    this.w.uptimeClaw = import_blessed4.default.text({ parent: this.w.uptimeBox, top: 1, left: "center", content: "Claw: --", style: { fg: C.brightMagenta, bold: true } });
    this.w.healthBox = import_blessed4.default.box({ parent: this.screen, height: boxHeight, border: { type: "line" }, label: " DATA HEALTH ", style: { border: { fg: C.green } } });
    this.w.healthStatus = import_blessed4.default.text({ parent: this.w.healthBox, top: 0, left: "center", content: "All Fresh", style: { fg: C.brightGreen, bold: true } });
    this.w.healthDetail = import_blessed4.default.text({ parent: this.w.healthBox, top: 1, left: "center", content: "", style: { fg: C.gray } });
  }
  // Recalculate layout positions - COMPACT DESIGN
  // Widgets flow to the right of logo in header area (rows 0-5)
  // Sessions below at row 7, logs below sessions
  recalculateLayout() {
    const boxHeight = 5;
    const LOGO_COLS = 42;
    const HEADER_ROWS = 10;
    const SESSIONS_HEIGHT = 9;
    const widgets = [
      { name: "cpu", box: this.w.cpuBox, visible: this.settings.showWidget1 },
      { name: "mem", box: this.w.memBox, visible: this.settings.showWidget2 },
      { name: "gpu", box: this.w.gpuBox, visible: this.settings.showWidget3 },
      { name: "net", box: this.w.netBox, visible: this.settings.showWidget4 },
      { name: "disk", box: this.w.diskBox, visible: this.settings.showWidget5 },
      { name: "sys", box: this.w.sysBox, visible: this.settings.showWidget6 },
      { name: "uptime", box: this.w.uptimeBox, visible: this.settings.showWidget7 },
      { name: "health", box: this.w.healthBox, visible: this.settings.showWidget8 }
    ];
    const visibleWidgets = widgets.filter((w) => w.visible);
    const numVisible = visibleWidgets.length;
    if (numVisible === 0) {
      this.w.sessBox.position = { top: HEADER_ROWS };
      this.w.sessBox.height = SESSIONS_HEIGHT;
      const logTop = Math.max(19, HEADER_ROWS + SESSIONS_HEIGHT);
      this.w.logBox.position = { top: logTop };
      this.w.logBox.height = "100%-" + (logTop + 1);
    } else {
      const row1Count = Math.ceil(numVisible / 2);
      const row2Count = numVisible - row1Count;
      const logoWidthPercent = 35;
      const availablePercent = 100 - logoWidthPercent;
      visibleWidgets.forEach((widget, index) => {
        const row = index < row1Count ? 0 : 1;
        const colInRow = row === 0 ? index : index - row1Count;
        const widgetsInThisRow = row === 0 ? row1Count : row2Count;
        const widthPercent = Math.floor(availablePercent / widgetsInThisRow);
        const leftPercent = logoWidthPercent + colInRow * widthPercent;
        widget.box.top = row * boxHeight;
        widget.box.left = leftPercent + "%";
        widget.box.width = widthPercent + "%";
        widget.box.show();
      });
      widgets.filter((w) => !w.visible).forEach((widget) => {
        widget.box.hide();
      });
      this.w.sessBox.position = { top: HEADER_ROWS };
      this.w.sessBox.height = SESSIONS_HEIGHT;
      const logTop = Math.max(19, HEADER_ROWS + SESSIONS_HEIGHT);
      this.w.logBox.position = { top: logTop };
      this.w.logBox.height = "100%-" + (logTop + 1);
    }
  }
  setupKeys() {
    this.screen.key(["q", "C-c"], () => {
      clearInterval(this.timer);
      this.screen.destroy();
      process.exit(0);
    });
    this.screen.key("r", () => this.refresh());
    this.screen.key(["?"], () => this.toggleHelp());
    this.screen.key(["s", "S"], () => this.toggleSettings());
    this.screen.key(["p", " "], () => this.togglePause());
    this.screen.key("o", () => this.cycleSessionSort());
    this.screen.key("e", () => this.exportDashboard());
    this.screen.key("E", () => this.cycleExportFormat());
    this.screen.key("t", () => this.cycleTheme());
    this.screen.key("return", () => this.showSessionDetail());
    this.screen.key("/", () => this.showSearch());
    this.screen.key("\x1B[A", () => {
      if (this.selectedSessionIndex > 0) {
        this.selectedSessionIndex--;
        this.render();
      }
    });
    this.screen.key("k", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
      if (this.selectedSessionIndex > 0) {
        this.selectedSessionIndex--;
        this.render();
      }
    });
    this.screen.key("\x1B[B", () => {
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const maxDisplay = Math.min(6, allSessions?.length || 0);
      if (this.selectedSessionIndex < maxDisplay - 1) {
        this.selectedSessionIndex++;
        this.render();
      }
    });
    this.screen.key("j", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
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
    this.screen.key("h", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset > 0) {
        this.paginationOffset--;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key("\x1B[D", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
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
      if (this.w.settingsList && this.w.settingsList.focused) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      if (this.paginationOffset < totalPages - 1) {
        this.paginationOffset++;
        this.selectedSessionIndex = 0;
        this.render();
      }
    });
    this.screen.key("\x1B[C", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
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
      if (this.w.settingsList && this.w.settingsList.focused) return;
      this.paginationOffset = 0;
      this.selectedSessionIndex = 0;
      this.render();
    });
    this.screen.key("G", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
      const allSessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
      const totalPages = Math.ceil(allSessions.length / 6);
      this.paginationOffset = Math.max(0, totalPages - 1);
      this.selectedSessionIndex = 0;
      this.render();
    });
    this.screen.key("f", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
      if (this.w.detailBox) return;
      this.toggleFavorite();
    });
    this.screen.key("F", () => {
      if (this.w.searchInput && this.w.searchInput.focused) return;
      if (this.w.settingsList && this.w.settingsList.focused) return;
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
    this.screen.key("0", () => this.cycleLogLevel());
    this.screen.key("?", () => {
      Promise.resolve().then(() => (init_hints(), hints_exports)).then((module2) => {
        module2.showHintsManual(this.screen);
      });
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
    saveSettings(this.settings);
    this.recalculateLayout();
    if (!wasVisible && isNowVisible) {
      const widgetMap = {
        showWidget1: "cpu",
        showWidget2: "memory",
        showWidget3: "gpu",
        showWidget4: "network",
        showWidget5: "disk",
        showWidget6: "system",
        showWidget7: "uptime",
        showWidget8: "health"
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
  cycleSessionSort() {
    const modes = ["time", "tokens", "idle", "name"];
    const currentIdx = modes.indexOf(this.settings.sessionSortMode);
    this.settings.sessionSortMode = modes[(currentIdx + 1) % modes.length];
    saveSettings(this.settings);
    this.render();
  }
  cycleLogLevel() {
    const levels = ["all", "debug", "info", "warn", "error"];
    const currentLevel = levels.indexOf(this.settings.logLevelFilter);
    this.settings.logLevelFilter = levels[(currentLevel + 1) % levels.length];
    saveSettings(this.settings);
    this.screen.render();
  }
  cycleTheme() {
    const newTheme = cycleTheme();
    saveTheme();
    this.settings.theme = newTheme;
    saveSettings(this.settings);
    this.applyTheme();
    this.screen.render();
  }
  cycleExportFormat() {
    const formats = ["json", "csv"];
    const currentIdx = formats.indexOf(this.settings.exportFormat);
    this.settings.exportFormat = formats[(currentIdx + 1) % formats.length];
    saveSettings(this.settings);
    this.w.footerText.setContent(`{green-fg}Export format set to ${this.settings.exportFormat.toUpperCase()}{/green-fg}`);
    this.screen.render();
    setTimeout(() => this.render(), 3e3);
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
  exportDashboard() {
    const exportDir = this.settings.exportDirectory || import_os5.default.homedir() + "/.openclaw/exports";
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const format = this.settings.exportFormat || "json";
    const filename = `dashboard-${timestamp}.${format}`;
    const pathValidation = validateFilePath(exportDir);
    if (!pathValidation.valid) {
      logger_default.warn("Export directory validation failed: " + pathValidation.error);
      this.w.footerText.setContent("Export failed: Invalid directory");
      this.screen.render();
      return;
    }
    const validatedExportDir = pathValidation.resolvedPath;
    const filepath = validatedExportDir + "/" + filename;
    try {
      if (!import_fs9.default.existsSync(validatedExportDir)) {
        import_fs9.default.mkdirSync(validatedExportDir, { recursive: true });
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
        import_fs9.default.writeFileSync(filepath, csv);
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
        import_fs9.default.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
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
      "  {cyan-fg}p{/cyan-fg} or {cyan-fg}Space{/cyan-fg}    Pause/resume auto-refresh",
      "  {cyan-fg}o{/cyan-fg}              Cycle session sort (time/tokens/idle/name)",
      "  {cyan-fg}e{/cyan-fg}              Export dashboard data (JSON/CSV)",
      "  {cyan-fg}E{/cyan-fg}              Cycle export format (JSON/CSV)",
      "  {cyan-fg}t{/cyan-fg}              Cycle theme (default/dark/high-contrast/ocean)",
      "  {cyan-fg}[{/cyan-fg} or {cyan-fg}]{/cyan-fg}        Previous/next page (when >6 sessions)",
      "  {cyan-fg}?{/cyan-fg}              Toggle this help panel",
      "  {cyan-fg}s{/cyan-fg} or {cyan-fg}S{/cyan-fg}        Open settings panel",
      "",
      "  {cyan-fg}1-8{/cyan-fg}            Toggle widgets (1:CPU 2:MEM 3:GPU 4:NET 5:DISK 6:SYS 7:UP 8:HLTH)",
      "  {cyan-fg}0{/cyan-fg}              Cycle log level filter",
      "",
      "  {bold}Vi-mode Navigation:{/bold}",
      "  {cyan-fg}h{/cyan-fg}/{cyan-fg}l{/cyan-fg}            Previous/next page",
      "  {cyan-fg}j{/cyan-fg}/{cyan-fg}k{/cyan-fg}            Select next/previous session",
      "  {cyan-fg}g{/cyan-fg}/{cyan-fg}G{/cyan-fg}            Go to first/last page",
      "  {cyan-fg}Ctrl+B{/cyan-fg}/{cyan-fg}Ctrl+F{/cyan-fg}  Page up/down",
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
    this.w.helpBox = import_blessed4.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 50,
      height: 19,
      border: { type: "line" },
      style: {
        border: { fg: C.brightCyan },
        bg: C.black
      },
      label: " HELP "
    });
    this.w.helpContent = import_blessed4.default.text({
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
  async toggleSettings() {
    if (this.w.settingsBox) {
      await this.closeSettings();
    } else {
      await this.showSettings();
    }
  }
  async closeSettings() {
    if (this.w.settingsBox) {
      await transitions_default.transitionOut(this.screen, this.w.settingsBox, {
        duration: 150,
        fade: true,
        scale: true
      });
      this.w.settingsBox.destroy();
      delete this.w.settingsBox;
      delete this.w.settingsList;
      this.isModalActive = false;
      this.screen.render();
    }
  }
  async showSettings() {
    const refreshMs = this.settings.refreshInterval;
    const refreshSec = refreshMs / 1e3;
    this.w.settingsBox = import_blessed4.default.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 56,
      height: 18,
      border: { type: "line" },
      style: {
        border: { fg: C.brightGreen },
        bg: C.black
      },
      label: " SETTINGS "
    });
    import_blessed4.default.text({
      parent: this.w.settingsBox,
      top: 1,
      left: "center",
      content: "{bold}SETTINGS{/bold}",
      style: { fg: C.brightWhite },
      tags: true
    });
    import_blessed4.default.text({
      parent: this.w.settingsBox,
      top: 3,
      left: 2,
      content: "\u2191/\u2193 Navigate    Enter Toggle    s/Esc Close",
      style: { fg: C.cyan },
      tags: true
    });
    const getSettingsItems2 = () => [
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
      `9 Export Dir:       ${(this.settings.exportDirectory || "").replace(import_os5.default.homedir() + "/", "~/")}`,
      `Perf Metrics:     ${this.settings.showPerformanceMetrics ? "ON" : "OFF"}`
    ];
    this.w.settingsList = import_blessed4.default.list({
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
    import_blessed4.default.text({
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
        let content = "";
        if (criticalAlerts.length > 0) {
          content += `{red-fg}{bold}CRITICAL:{/} `;
          content += criticalAlerts.map((a) => `${a.type.toUpperCase()} ${a.value}%`).join(" | ");
        }
        if (warningAlerts.length > 0) {
          if (content) content += "\n";
          content += `{yellow-fg}WARNING:{/} `;
          content += warningAlerts.map((a) => `${a.type.toUpperCase()} ${a.value}%`).join(" | ");
        }
        this.w.alertContent.setContent(content);
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
      case 1:
        this.settings.showWidget1 = !this.settings.showWidget1;
        this.recalculateLayout();
        break;
      case 2:
        this.settings.showWidget2 = !this.settings.showWidget2;
        this.recalculateLayout();
        break;
      case 3:
        this.settings.showWidget3 = !this.settings.showWidget3;
        this.recalculateLayout();
        break;
      case 4:
        this.settings.showWidget4 = !this.settings.showWidget4;
        this.recalculateLayout();
        break;
      case 5:
        this.settings.showWidget5 = !this.settings.showWidget5;
        this.recalculateLayout();
        break;
      case 6:
        this.settings.showWidget6 = !this.settings.showWidget6;
        this.recalculateLayout();
        break;
      case 7:
        this.settings.showWidget7 = !this.settings.showWidget7;
        this.recalculateLayout();
        break;
      case 9:
        this.settings.showWidget8 = !this.settings.showWidget8;
        this.recalculateLayout();
        break;
      case 8:
        const levels = ["all", "debug", "info", "warn", "error"];
        const currentLevel = levels.indexOf(this.settings.logLevelFilter);
        this.settings.logLevelFilter = levels[(currentLevel + 1) % levels.length];
        break;
      case 10:
        const exportDirs = [
          import_os5.default.homedir() + "/.openclaw/exports",
          import_os5.default.homedir() + "/Downloads",
          import_os5.default.homedir() + "/Desktop",
          "custom"
        ];
        const currentExportDir = this.settings.exportDirectory || import_os5.default.homedir() + "/.openclaw/exports";
        let currentDirIdx = exportDirs.indexOf(currentExportDir);
        if (currentDirIdx === -1) {
          currentDirIdx = 0;
        }
        const nextDirIdx = (currentDirIdx + 1) % exportDirs.length;
        if (nextDirIdx === 3) {
          this.w.customPathPrompt = import_blessed4.default.prompt({
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
                customPath = import_os5.default.homedir() + customPath.substring(1);
              }
              const pathValidation = validateFilePath(customPath);
              if (pathValidation.valid) {
                this.settings.exportDirectory = pathValidation.resolvedPath;
                saveSettings(this.settings);
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
      case 11:
        this.settings.showPerformanceMetrics = !this.settings.showPerformanceMetrics;
        break;
    }
    if (!asyncPending) {
      saveSettings(this.settings);
    }
    this.screen.render();
  }
  // SESSION DETAIL VIEW
  showSessionDetail() {
    const sessions = this.filteredSessions.length > 0 ? this.filteredSessions : this.data.sessions;
    const maxDisplay = Math.min(6, sessions?.length || 0);
    if (!sessions || sessions.length === 0 || this.selectedSessionIndex < 0 || this.selectedSessionIndex >= maxDisplay) return;
    const actualIndex = this.paginationOffset * 6 + this.selectedSessionIndex;
    const session = sessions[actualIndex];
    this.w.detailBox = import_blessed4.default.box({
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
    const content = [
      `{bold}Session ID:{/bold} ${session.sessionId || session.key}`,
      `{bold}Agent:{/bold}     ${session.displayName || "unknown"}`,
      `{bold}Channel:{/bold}   ${session.channel || "unknown"}`,
      `{bold}Model:{/bold}     ${session.model || "unknown"}`,
      `{bold}Kind:{/bold}      ${session.kind || "other"}`,
      `{bold}Tokens:{/bold}    ${session.totalTokens || 0} total, ${session.contextTokens || 0} context`,
      `{bold}Idle:{/bold}      ${idleStr}`,
      `{bold}Favorite:{/bold}  ${favStatus}`,
      `{bold}Status:{/bold}   ${session.abortedLastRun ? "{red}Aborted{/red}" : "{green}Active{/green}"}`,
      ``,
      `{center}{gray}Press 'q' or 'Esc' to close{/gray}{/center}`
    ].join("\n");
    import_blessed4.default.text({
      parent: this.w.detailBox,
      top: 1,
      left: 1,
      width: "95%",
      height: "90%",
      content,
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
    saveSettings(this.settings);
    this.render();
  }
  // Toggle filter to show only favorites
  toggleFavoritesFilter() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.settings.showFavoritesOnly = this.showFavoritesOnly;
    saveSettings(this.settings);
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
    this.w.searchBox = import_blessed4.default.box({
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
    this.w.searchInput = import_blessed4.default.textbox({
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
        saveSettings(this.settings);
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
      saveSettings(this.settings);
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
      return sessions;
    } catch (err) {
      logger_default.warn("Failed to fetch sessions from gateways: " + err.message);
      this.data.gatewayStats = { totalEndpoints: 0, reachableEndpoints: 0, error: err.message };
      return [];
    }
  }
  async start() {
    await database_default.initDatabase();
    database_default.cleanupOldData(30);
    gateway_manager_default.init(this.settings);
    performance_monitor_default.start();
    this.refresh();
    this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
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
    try {
      if (visible.cpu || visible.memory) {
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
          const os6 = systemData.os;
          const ver = systemData.ver;
          const time = systemData.time;
          this.data.system = `${os6.distro || "macOS"} ${os6.release} (${os6.arch})  Node v${ver.node}`;
          this.data.systemUptime = time.uptime;
          this.dataTimestamps.system = now;
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
        const { stdout } = await execAsync2("openclaw logs --limit 200 --plain 2>/dev/null", { timeout: config_default.COMMAND_TIMEOUTS.OPENCLAW_LOGS });
        const filterFn = getLogFilterFn(this.settings.logLevelFilter || "all");
        const lines = stdout.trim().split("\n").filter((line) => !line.includes("plugin CLI register skipped")).filter((line) => filterFn(line));
        const MAX_LOG_LINES = 500;
        if (lines.length > 0 && lines[0]) {
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
      const filterFn = getLogFilterFn(filter);
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
    const refreshSec = Math.round(this.settings.refreshInterval / 1e3);
    const pauseIndicator = this.isPaused ? "\u25B6 running" : "p pause";
    const sortMode = this.settings.sessionSortMode;
    let footerContent;
    if (this.settings.showPerformanceMetrics) {
      const perfStatus = performance_monitor_default.getStatusString();
      footerContent = `q quit  r refresh  ${pauseIndicator}  o sort:${sortMode}  1-8 toggle  0 log  ? help  s settings  \u2022  ${perfStatus}`;
    } else {
      footerContent = `q quit  r refresh  ${pauseIndicator}  o sort:${sortMode}  1-8 toggle  0 log  ? help  s settings  \u2022  ${refreshSec}s refresh`;
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
      for (const [name, path2] of Object.entries(endpoints)) {
        console.log(`  GET ${path2} - ${name.charAt(0).toUpperCase() + name.slice(1)}`);
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
if (cliOptions.web) {
  const webDashboard = new WebDashboard({
    webPort: cliOptions.webPort,
    webHost: cliOptions.webHost
  });
  webDashboard.init();
} else {
  new Dashboard();
}
