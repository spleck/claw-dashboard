/**
 * Dashboard auto-save module for periodic state persistence
 * Automatically saves dashboard state at configurable intervals
 * and on important state changes
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from './logger.js';
import { setSecurePermissionsSync, isValidPath } from './security.js';
import { PATHS } from './config.js';

/**
 * Validate a file path for writing
 * @param {string} filePath - Path to validate
 * @returns {Object} Validation result with valid, resolvedPath, error
 */
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return { valid: false, error: 'Path must be a non-empty string' };
  }

  // Expand tilde to home directory
  const resolvedPath = filePath.startsWith('~/')
    ? path.join(os.homedir(), filePath.slice(2))
    : filePath.startsWith('~')
    ? path.join(os.homedir(), filePath.slice(1))
    : path.resolve(filePath);

  // Check for path traversal - allow home directory and temp directories (sep + === to prevent prefix collisions e.g. /home/userfoo; matches index/snapshot/security style)
  const homeDir = os.homedir();
  const tempDirs = ['/tmp', os.tmpdir()];
  const resolvedHome = path.resolve(homeDir);
  const isInAllowedDir = resolvedPath.startsWith(resolvedHome + path.sep) || resolvedPath === resolvedHome ||
    tempDirs.some(tmpDir => {
      const rtmp = path.resolve(tmpDir);
      return resolvedPath.startsWith(rtmp + path.sep) || resolvedPath === rtmp;
    });
  if (!isInAllowedDir) {
    return { valid: false, error: 'Path must be within home or temp directory' };
  }

  if (!isValidPath(resolvedPath)) {
    return { valid: false, error: 'Invalid path characters' };
  }

  return { valid: true, resolvedPath };
}

/**
 * AutoSaveManager class - handles automatic state persistence
 */
export class AutoSaveManager {
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
    this.intervalMs = options.intervalMs || 30000; // Default 30 seconds
    this.enabled = options.enabled !== false; // Default true
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

    // Track state checksum to avoid unnecessary writes
    this.lastStateChecksum = null;

    // Backup rotation settings
    this.backupEnabled = options.backupEnabled !== false; // Default true
    this.backupCount = options.backupCount || 5;
    this.lastStatsLogTime = 0;
    this.statsLogIntervalMs = options.statsLogIntervalMs || 300000; // 5 minutes

    // Statistics tracking for debug output
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
      // Only backup if file exists and has content
      if (!fs.existsSync(statePath)) {
        return null;
      }

      const stats = fs.statSync(statePath);
      if (stats.size === 0) {
        return null;
      }

      // Create backup with timestamp suffix (including milliseconds for uniqueness)
      const now = new Date();
      let timestamp = now.toISOString().replace(/[:.]/g, '-');

      // Handle rapid saves within same millisecond by adding counter suffix
      const backupBase = `${statePath}.${timestamp}.backup`;
      let backupPath = backupBase;
      let counter = 1;
      while (fs.existsSync(backupPath)) {
        backupPath = `${statePath}.${timestamp}-${counter}.backup`;
        counter++;
      }

      // Copy current state to backup
      fs.copyFileSync(statePath, backupPath);
      setSecurePermissionsSync(backupPath);

      this.stats.totalBackupsCreated++;
      this.stats.lastBackupPath = backupPath;

      logger.debug(`Created state backup: ${path.basename(backupPath)}`);
      return backupPath;
    } catch (err) {
      logger.debug(`Failed to create backup: ${err.message}`);
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
      const dir = path.dirname(statePath);
      const baseName = path.basename(statePath);

      // Find all backup files for this state file
      const backups = fs.readdirSync(dir)
        .filter(f => f.startsWith(baseName) && f.endsWith('.backup'))
        .map(f => ({
          name: f,
          path: path.join(dir, f),
          mtime: fs.statSync(path.join(dir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime); // Newest first

      // Remove old backups beyond the keep count
      let cleaned = 0;
      for (let i = this.backupCount; i < backups.length; i++) {
        try {
          fs.unlinkSync(backups[i].path);
          cleaned++;
          logger.debug(`Cleaned up old backup: ${backups[i].name}`);
        } catch {
          // Ignore individual cleanup errors
        }
      }

      if (cleaned > 0) {
        this.stats.totalBackupsCleaned += cleaned;
        logger.debug(`Backup cleanup complete: removed ${cleaned} old backups`);
      }
    } catch (err) {
      logger.debug(`Backup cleanup failed: ${err.message}`);
    }
  }

  /**
   * Log auto-save statistics to debug output for troubleshooting
   */
  logStats() {
    const now = Date.now();

    // Only log if interval has passed
    if (now - this.lastStatsLogTime < this.statsLogIntervalMs) {
      return;
    }

    this.lastStatsLogTime = now;

    // Calculate derived statistics
    const uptimeMs = now - (this.lastSaveTime > 0 ? this.lastSaveTime - (this.saveCount * this.intervalMs) : now);
    const avgSaveTime = this.saveCount > 0 ? (this.stats.totalSaveTimeMs / this.saveCount).toFixed(2) : 0;
    const lastSaveAgo = this.lastSaveTime > 0 ? ((now - this.lastSaveTime) / 1000).toFixed(0) : 'never';

    // Build stats message
    const statsLines = [
      '=== Auto-Save Statistics ===',
      `  Enabled: ${this.enabled}`,
      `  Interval: ${this.intervalMs}ms`,
      `  Backup rotation: ${this.backupEnabled ? 'on' : 'off'} (keep ${this.backupCount})`,
      `  Saves performed: ${this.saveCount}`,
      `  Consecutive failures: ${this.consecutiveFailures}`,
      `  Total bytes written: ${this.stats.totalBytesWritten.toLocaleString()}`,
      `  Total backups created: ${this.stats.totalBackupsCreated}`,
      `  Total backups cleaned: ${this.stats.totalBackupsCleaned}`,
      `  Average save time: ${avgSaveTime}ms`,
      `  Last save: ${lastSaveAgo}s ago`,
      `  State file: ${this.statePath}`,
      `  Last backup: ${this.stats.lastBackupPath ? path.basename(this.stats.lastBackupPath) : 'none'}`,
      '==========================='
    ];

    // Log each line
    statsLines.forEach(line => logger.debug(line));
  }

  /**
   * Start auto-save timer
   */
  start() {
    if (!this.enabled) {
      logger.debug('Auto-save is disabled');
      return;
    }

    if (this.timer) {
      this.stop();
    }

    this.timer = setInterval(() => {
      this.performAutoSave();
    }, this.intervalMs);

    // Unref timer so it doesn't prevent process exit
    if (this.timer.unref) {
      this.timer.unref();
    }

    logger.info(`Auto-save started (interval: ${this.intervalMs}ms)`);
  }

  /**
   * Stop auto-save timer
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.debug('Auto-save stopped');
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
      // Create a copy without the timestamp for comparison
      // Timestamp changes every call but doesn't represent actual state change
      const { timestamp, ...stateWithoutTimestamp } = state;
      // Simple JSON stringification for comparison
      // In production, could use crypto.createHash for more robust checksum
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

    // Get settings if callback provided
    if (this.getSettings) {
      snapshot.settings = this.getSettings();
    }

    // Get additional state if callback provided
    if (this.getState) {
      const state = this.getState();
      if (state) {
        // Include UI state that should persist
        snapshot.ui = {
          selectedSessionIndex: state.selectedSessionIndex || 0,
          paginationOffset: state.paginationOffset || 0,
          sessionSearchQuery: state.sessionSearchQuery || '',
          isSearchMode: state.isSearchMode || false,
          showFavoritesOnly: state.showFavoritesOnly || false,
          focusedWidgetIndex: state.focusedWidgetIndex || -1,
          currentRefreshInterval: state.currentRefreshInterval || 2000,
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

      // Skip if state hasn't changed
      if (checksum === this.lastStateChecksum && !this.isDirty) {
        return true;
      }

      // Validate the state path
      const pathValidation = validateFilePath(this.statePath);
      if (!pathValidation.valid) {
        logger.warn(`Auto-save path validation failed: ${pathValidation.error}`);
        return false;
      }

      // Ensure directory exists
      const dir = path.dirname(pathValidation.resolvedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create backup before overwriting (only if file exists)
      this.createBackup(pathValidation.resolvedPath);

      // Write state file
      const jsonData = JSON.stringify(snapshot, null, 2);
      fs.writeFileSync(pathValidation.resolvedPath, jsonData);

      // Set secure permissions (owner read/write only)
      setSecurePermissionsSync(pathValidation.resolvedPath);

      // Clean up old backups
      this.cleanupBackups(pathValidation.resolvedPath);

      // Update tracking
      this.lastStateChecksum = checksum;
      this.isDirty = false;
      this.lastSaveTime = Date.now();
      this.saveCount++;
      this.consecutiveFailures = 0;

      // Update statistics
      this.stats.totalBytesWritten += Buffer.byteLength(jsonData, 'utf8');
      const saveTime = Date.now() - startTime;
      this.stats.totalSaveTimeMs += saveTime;
      this.stats.averageSaveTimeMs = this.stats.totalSaveTimeMs / this.saveCount;

      // Log stats periodically for troubleshooting
      this.logStats();

      logger.debug(`Auto-save completed successfully (${saveTime}ms)`);
      return true;
    } catch (err) {
      this.consecutiveFailures++;
      logger.error(`Auto-save failed (${this.consecutiveFailures}/${this.maxConsecutiveFailures}): ${err.message}`);

      // Disable auto-save if too many consecutive failures
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        logger.error('Auto-save disabled due to repeated failures');
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
    if (options.intervalMs !== undefined) {
      this.intervalMs = options.intervalMs;
    }
    if (options.enabled !== undefined) {
      this.enabled = options.enabled;
    }

    // Restart if running and config changed
    if (this.timer) {
      this.stop();
      this.start();
    }
  }
}

/**
 * Load saved dashboard state
 * @param {string} statePath - Path to state file
 * @returns {Object|null} Loaded state or null if not found/invalid
 */
export function loadDashboardState(statePath) {
  try {
    const pathValidation = validateFilePath(statePath);
    if (!pathValidation.valid) {
      logger.warn(`State path validation failed: ${pathValidation.error}`);
      return null;
    }

    if (!fs.existsSync(pathValidation.resolvedPath)) {
      return null;
    }

    const data = fs.readFileSync(pathValidation.resolvedPath, 'utf8');
    const state = JSON.parse(data);

    logger.info('Loaded dashboard state from ' + pathValidation.resolvedPath);
    return state;
  } catch (err) {
    logger.warn('Failed to load dashboard state: ' + err.message);
    return null;
  }
}

/**
 * Restore UI state from saved state
 * @param {Object} savedState - Saved state object
 * @param {Object} dashboard - Dashboard instance to restore state to
 */
export function restoreDashboardState(savedState, dashboard) {
  if (!savedState || !savedState.ui) {
    return false;
  }

  try {
    const ui = savedState.ui;

    // Restore session selection
    if (ui.selectedSessionIndex !== undefined) {
      dashboard.selectedSessionIndex = ui.selectedSessionIndex;
    }
    if (ui.paginationOffset !== undefined) {
      dashboard.paginationOffset = ui.paginationOffset;
    }

    // Restore search state
    if (ui.sessionSearchQuery !== undefined) {
      dashboard.sessionSearchQuery = ui.sessionSearchQuery;
      if (dashboard.sessionSearchQuery) {
        dashboard.isSearchMode = true;
      }
    }
    if (ui.isSearchMode !== undefined) {
      dashboard.isSearchMode = ui.isSearchMode;
    }

    // Restore favorites filter
    if (ui.showFavoritesOnly !== undefined) {
      dashboard.showFavoritesOnly = ui.showFavoritesOnly;
    }

    // Restore widget focus
    if (ui.focusedWidgetIndex !== undefined) {
      dashboard.focusedWidgetIndex = ui.focusedWidgetIndex;
    }

    // Restore refresh interval
    if (ui.currentRefreshInterval !== undefined) {
      dashboard.currentRefreshInterval = ui.currentRefreshInterval;
    }

    logger.info('Dashboard state restored');
    return true;
  } catch (err) {
    logger.error('Failed to restore dashboard state: ' + err.message);
    return false;
  }
}

/**
 * Clean up old state files (keep last N)
 * @param {string} stateDir - Directory containing state files
 * @param {number} keepCount - Number of state files to keep (default: 5)
 */
export function cleanupOldStateFiles(stateDir, keepCount = 5) {
  try {
    if (!fs.existsSync(stateDir)) {
      return;
    }

    const files = fs.readdirSync(stateDir)
      .filter(f => f.startsWith('dashboard-state') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: `${stateDir}/${f}`,
        mtime: fs.statSync(`${stateDir}/${f}`).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Remove old files
    for (let i = keepCount; i < files.length; i++) {
      try {
        fs.unlinkSync(files[i].path);
        logger.debug(`Cleaned up old state file: ${files[i].name}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

// Default export
export default {
  AutoSaveManager,
  loadDashboardState,
  restoreDashboardState,
  cleanupOldStateFiles
};
