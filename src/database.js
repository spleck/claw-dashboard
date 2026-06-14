/**
 * SQLite database module for historical data persistence
 * Uses sql.js (WebAssembly-based SQLite) for cross-platform compatibility
 *
 * DEAD CODE - TRIMMED in v2.1.1 lean/clean trim (effort 5):
 * - Historical data was backlog/pending (TODO), never core to real-time TUI dashboard.
 * - All stores excised from index.js refresh/start/WebDashboard.
 * - sql.js dep dropped; no DB writes.
 * - This module is intentionally not loaded at runtime (excluded from "files" + .npmignore).
 *
 * Import succeeds for test isolation / load-compat only.
 * All functions are no-op stubs (init returns false; stores are silent; getters return []/null).
 * Do not import or depend on this in new code.
 * Function bodies trimmed to minimal stubs (signatures/export surface preserved) to reduce repo bloat.
 */

// No imports needed for no-op stubs (fs/os/path/url/logger were unused post-trim).
// Exports surface preserved for any dynamic import "shape" compat.

// Stub config + sql stub (for module load compat only; never used).
const config = {
  DATABASE: {
    PATH: '/tmp/dead-trim.db',
    SAVE_INTERVAL_MS: 30000,
    CLEANUP_INTERVAL_MS: 60 * 60 * 1000,
    DEFAULT_RETENTION_DAYS: 30,
  },
};
const initSqlJs = null;

// (locals retained only for historical "shape" comment; not used by stubs or needed)
let db = null;
let SQL = null;
let saveInterval = null;
let cleanupInterval = null;

/**
 * Initialize the database (stub)
 */
export async function initDatabase() {
  return false;
}

/**
 * Store a session snapshot (no-op stub)
 */
export function storeSessionSnapshot(session) {
  // no-op (DB removed)
}

/**
 * Store CPU metrics (no-op stub)
 */
export function storeCpuMetrics(cpuData) {
  // no-op (DB removed)
}

/**
 * Store memory metrics (no-op stub)
 */
export function storeMemoryMetrics(memoryData) {
  // no-op (DB removed)
}

/**
 * Store network metrics (no-op stub)
 */
export function storeNetworkMetrics(networkData) {
  // no-op (DB removed)
}

/**
 * Get sessions from the last 24 hours (stub)
 */
export function getSessionsLast24Hours() {
  return [];
}

/**
 * Get sessions from the last 7 days (stub)
 */
export function getSessionsLast7Days() {
  return [];
}

/**
 * Get sessions by number of hours (stub)
 */
export function getSessionsByHours(hours = 24) {
  return [];
}

/**
 * Get sessions by number of days (stub)
 */
export function getSessionsByDays(days = 7) {
  return [];
}

/**
 * Get CPU metrics history for the last N hours (stub)
 */
export function getCpuMetricsHistory(hours = 24) {
  return [];
}

/**
 * Get memory metrics history for the last N hours (stub)
 */
export function getMemoryMetricsHistory(hours = 24) {
  return [];
}

/**
 * Get network metrics history for the last N hours (stub)
 */
export function getNetworkMetricsHistory(hours = 24) {
  return [];
}

/**
 * Get aggregated metrics summary (stub)
 */
export function getMetricsSummary(hours = 24) {
  return null;
}

/**
 * Clean up old data (no-op stub)
 */
export function cleanupOldData(days = 30) {
  // no-op (DB removed)
}

/**
 * Store all metrics at once (no-op stub)
 */
export function storeMetricsSnapshot(data) {
  // no-op (DB removed)
}

/**
 * Close and save the database (no-op stub)
 */
export function closeDatabase() {
  // no-op (DB removed)
}

// Export default object (surface preserved)
export default {
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
