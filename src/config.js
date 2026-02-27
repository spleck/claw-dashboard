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
  DASHBOARD_VERSION,
};
