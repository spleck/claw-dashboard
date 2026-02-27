/**
 * SQLite database module for historical data persistence
 * Uses sql.js (WebAssembly-based SQLite) for cross-platform compatibility
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = config.DATABASE.PATH;

// Database instance
let db = null;
let SQL = null;
let saveInterval = null;
let cleanupInterval = null;

/**
 * Initialize the database and create tables if needed
 */
export async function initDatabase() {
  try {
    // Initialize SQL.js
    SQL = await initSqlJs();
    
    // Load existing database or create new one
    let data = null;
    try {
      if (fs.existsSync(DB_PATH)) {
        data = fs.readFileSync(DB_PATH);
        logger.info('Loaded existing database from ' + DB_PATH);
      }
    } catch (err) {
      logger.warn('Could not load existing database: ' + err.message);
    }
    
    db = new SQL.Database(data);
    
    // Create tables
    createTables();
    
    // Set up periodic save
    saveInterval = setInterval(saveDatabase, config.DATABASE.SAVE_INTERVAL_MS);
    cleanupInterval = setInterval(cleanupOldData, config.DATABASE.CLEANUP_INTERVAL_MS);
    
    logger.info('Database initialized successfully');
    return true;
  } catch (err) {
    logger.error('Failed to initialize database: ' + err.message);
    return false;
  }
}

/**
 * Create all required tables
 */
function createTables() {
  // Session snapshots table
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
  
  // Create index for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_session_snapshots_created 
    ON session_snapshots(created_at)
  `);
  
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_session_snapshots_session_id 
    ON session_snapshots(session_id)
  `);
  
  // CPU metrics history table
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
  
  // Memory metrics history table
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
  
  // Network metrics history table
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
  
  logger.debug('Database tables created');
}

/**
 * Save database to disk
 */
function saveDatabase() {
  if (!db) return;
  
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    
    // Ensure directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(DB_PATH, buffer);
    logger.debug('Database saved to disk');
  } catch (err) {
    logger.error('Failed to save database: ' + err.message);
  }
}

/**
 * Store a session snapshot
 * @param {Object} session - Session object from openclaw
 */
export function storeSessionSnapshot(session) {
  if (!db || !session) return;
  
  try {
    const now = Date.now();
    
    // Extract relevant fields from session
    const sessionId = session.sessionId || session.key || null;
    const agent = session.agent || extractAgent(session.key) || 'unknown';
    const channel = session.deliveryContext?.channel || 
                   session.origin?.channel || 
                   session.origin?.surface || 'unknown';
    const model = session.model || session.llmModel || 'unknown';
    const tokens = session.totalTokens || session.tokens || 0;
    const status = session.status || (session.systemRunning ? 'running' : 'idle');
    
    // Check if session already exists, update or insert
    const existing = db.exec(
      'SELECT id FROM session_snapshots WHERE session_id = ? ORDER BY created_at DESC LIMIT 1',
      [sessionId]
    );
    
    if (existing.length > 0 && existing[0].values.length > 0) {
      // Update existing
      db.run(
        `UPDATE session_snapshots 
         SET agent = ?, channel = ?, model = ?, tokens = ?, status = ?, updated_at = ?
         WHERE session_id = ?`,
        [agent, channel, model, tokens, status, now, sessionId]
      );
    } else {
      // Insert new
      db.run(
        `INSERT INTO session_snapshots (session_id, agent, channel, model, tokens, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, agent, channel, model, tokens, status, now, now]
      );
    }
    
    logger.debug('Stored session snapshot: ' + sessionId);
  } catch (err) {
    logger.error('Failed to store session snapshot: ' + err.message);
  }
}

/**
 * Store CPU metrics
 * @param {Object} cpuData - CPU metrics data
 */
function storeCpuMetrics(cpuData) {
  if (!db || !cpuData) return;
  
  try {
    const now = Date.now();
    
    // Handle both array of CPUs and single CPU object
    const cpus = cpuData.cpus || [cpuData] || [];
    
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
    
    logger.debug('Stored CPU metrics');
  } catch (err) {
    logger.error('Failed to store CPU metrics: ' + err.message);
  }
}

/**
 * Store memory metrics
 * @param {Object} memoryData - Memory metrics data
 */
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
    
    logger.debug('Stored memory metrics');
  } catch (err) {
    logger.error('Failed to store memory metrics: ' + err.message);
  }
}

/**
 * Store network metrics
 * @param {Object} networkData - Network metrics data
 */
function storeNetworkMetrics(networkData) {
  if (!db || !networkData) return;
  
  try {
    const now = Date.now();
    
    // Handle both array and single interface
    const interfaces = Array.isArray(networkData) ? networkData : [networkData];
    
    for (const iface of interfaces) {
      db.run(
        `INSERT INTO network_metrics (
          timestamp, interface_name, rx_bytes, tx_bytes, rx_sec, tx_sec, ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          now,
          iface.interfaceName || iface.interface_name || 'unknown',
          iface.rxBytes || iface.rx_bytes || 0,
          iface.txBytes || iface.tx_bytes || 0,
          iface.rxSec || iface.rx_sec || 0,
          iface.txSec || iface.tx_sec || 0,
          iface.ms || 0
        ]
      );
    }
    
    logger.debug('Stored network metrics');
  } catch (err) {
    logger.error('Failed to store network metrics: ' + err.message);
  }
}

/**
 * Get sessions from the last 24 hours
 * @returns {Array} Session snapshots
 */
export function getSessionsLast24Hours() {
  return getSessionsByHours(24);
}

/**
 * Get sessions from the last 7 days
 * @returns {Array} Session snapshots
 */
export function getSessionsLast7Days() {
  return getSessionsByDays(7);
}

/**
 * Get sessions by number of hours
 * @param {number} hours - Hours to look back
 * @returns {Array} Session snapshots
 */
export function getSessionsByHours(hours = 24) {
  if (!db) return [];
  
  try {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const result = db.exec(
      `SELECT session_id, agent, channel, model, tokens, status, created_at, updated_at
       FROM session_snapshots
       WHERE created_at >= ?
       ORDER BY created_at DESC`,
      [cutoff]
    );
    
    if (result.length === 0) return [];
    
    return result[0].values.map(row => ({
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
    logger.error('Failed to get sessions by hours: ' + err.message);
    return [];
  }
}

/**
 * Get sessions by number of days
 * @param {number} days - Days to look back
 * @returns {Array} Session snapshots
 */
export function getSessionsByDays(days = 7) {
  if (!db) return [];
  
  try {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const result = db.exec(
      `SELECT session_id, agent, channel, model, tokens, status, created_at, updated_at
       FROM session_snapshots
       WHERE created_at >= ?
       ORDER BY created_at DESC`,
      [cutoff]
    );
    
    if (result.length === 0) return [];
    
    return result[0].values.map(row => ({
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
    logger.error('Failed to get sessions by days: ' + err.message);
    return [];
  }
}

/**
 * Get CPU metrics history for the last N hours
 * @param {number} hours - Hours to look back
 * @returns {Array} CPU metrics
 */
export function getCpuMetricsHistory(hours = 24) {
  if (!db) return [];
  
  try {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const result = db.exec(
      `SELECT timestamp, cpu_count, load_avg_1, load_avg_5, load_avg_15,
              cpu_usage_user, cpu_usage_system, cpu_usage_idle
       FROM cpu_metrics
       WHERE timestamp >= ?
       ORDER BY timestamp ASC`,
      [cutoff]
    );
    
    if (result.length === 0) return [];
    
    return result[0].values.map(row => ({
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
    logger.error('Failed to get CPU metrics history: ' + err.message);
    return [];
  }
}

/**
 * Get memory metrics history for the last N hours
 * @param {number} hours - Hours to look back
 * @returns {Array} Memory metrics
 */
export function getMemoryMetricsHistory(hours = 24) {
  if (!db) return [];
  
  try {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const result = db.exec(
      `SELECT timestamp, total_bytes, used_bytes, free_bytes, available_bytes, used_percent
       FROM memory_metrics
       WHERE timestamp >= ?
       ORDER BY timestamp ASC`,
      [cutoff]
    );
    
    if (result.length === 0) return [];
    
    return result[0].values.map(row => ({
      timestamp: row[0],
      totalBytes: row[1],
      usedBytes: row[2],
      freeBytes: row[3],
      availableBytes: row[4],
      usedPercent: row[5]
    }));
  } catch (err) {
    logger.error('Failed to get memory metrics history: ' + err.message);
    return [];
  }
}

/**
 * Get network metrics history for the last N hours
 * @param {number} hours - Hours to look back
 * @returns {Array} Network metrics
 */
export function getNetworkMetricsHistory(hours = 24) {
  if (!db) return [];
  
  try {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const result = db.exec(
      `SELECT timestamp, interface_name, rx_bytes, tx_bytes, rx_sec, tx_sec
       FROM network_metrics
       WHERE timestamp >= ?
       ORDER BY timestamp ASC`,
      [cutoff]
    );
    
    if (result.length === 0) return [];
    
    return result[0].values.map(row => ({
      timestamp: row[0],
      interfaceName: row[1],
      rxBytes: row[2],
      txBytes: row[3],
      rxSec: row[4],
      txSec: row[5]
    }));
  } catch (err) {
    logger.error('Failed to get network metrics history: ' + err.message);
    return [];
  }
}

/**
 * Get aggregated metrics summary
 * @param {number} hours - Hours to look back
 * @returns {Object} Aggregated metrics
 */
export function getMetricsSummary(hours = 24) {
  if (!db) return null;
  
  try {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    // Get CPU summary
    const cpuResult = db.exec(
      `SELECT 
        AVG(cpu_usage_user) as avg_user,
        MAX(cpu_usage_user) as max_user,
        AVG(load_avg_1) as avg_load
       FROM cpu_metrics
       WHERE timestamp >= ?`,
      [cutoff]
    );
    
    // Get Memory summary
    const memResult = db.exec(
      `SELECT 
        AVG(used_percent) as avg_used,
        MAX(used_percent) as max_used,
        AVG(available_bytes) as avg_available
       FROM memory_metrics
       WHERE timestamp >= ?`,
      [cutoff]
    );
    
    // Get session count
    const sessionResult = db.exec(
      `SELECT COUNT(DISTINCT session_id) as session_count
       FROM session_snapshots
       WHERE created_at >= ?`,
      [cutoff]
    );
    
    // Get total tokens
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
    logger.error('Failed to get metrics summary: ' + err.message);
    return null;
  }
}

/**
 * Clean up old data beyond retention period
 * @param {number} days - Number of days to retain
 */
export function cleanupOldData(days = 30) {
  if (!db) return;
  
  try {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    db.run('DELETE FROM session_snapshots WHERE created_at < ?', [cutoff]);
    db.run('DELETE FROM cpu_metrics WHERE timestamp < ?', [cutoff]);
    db.run('DELETE FROM memory_metrics WHERE timestamp < ?', [cutoff]);
    db.run('DELETE FROM network_metrics WHERE timestamp < ?', [cutoff]);
    
    logger.info('Cleaned up data older than ' + days + ' days');
  } catch (err) {
    logger.error('Failed to cleanup old data: ' + err.message);
  }
  
  // Save after cleanup, with its own try-catch
  try {
    saveDatabase();
  } catch (err) {
    logger.error('Failed to save database after cleanup: ' + err.message);
  }
}

/**
 * Store all metrics at once (called from refresh cycle)
 * @param {Object} data - Dashboard data object
 */
export function storeMetricsSnapshot(data) {
  // Store CPU metrics
  if (data.cpu) {
    // Handle both array format and object format
    const cpuData = Array.isArray(data.cpu) ? { cpus: data.cpu } : data.cpu;
    storeCpuMetrics(cpuData);
  }
  
  // Store memory metrics
  if (data.memory) {
    storeMemoryMetrics(data.memory);
  }
  
  // Store network metrics
  if (data.network) {
    storeNetworkMetrics(data.network);
  }
  
  // Store session snapshots
  if (data.sessions && data.sessions.length > 0) {
    for (const session of data.sessions) {
      storeSessionSnapshot(session);
    }
  }
}

/**
 * Extract agent name from session key
 * @param {string} key - Session key (e.g., "agent:main:main")
 * @returns {string} Agent name
 */
function extractAgent(key) {
  if (!key) return 'unknown';
  const parts = key.split(':');
  return parts[1] || parts[0] || 'unknown';
}

/**
 * Close and save the database
 */
export function closeDatabase() {
  // Clear intervals first
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
      logger.error('Failed to save database during close: ' + err.message);
    }
    try {
      db.close();
    } catch (err) {
      logger.error('Failed to close database: ' + err.message);
    }
    db = null;
    logger.info('Database closed');
  }
}

// Export default object
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
