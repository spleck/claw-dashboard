/**
 * Export Scheduler Module
 * Provides cron-style scheduled auto-export of metrics to CSV/JSON
 * Allows users to configure recurring exports for historical tracking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import { PATHS, DASHBOARD_VERSION } from './config.js';
import { createSnapshot, exportSnapshotToFile, getSnapshotsDirectory } from './snapshot.js';
import { validateType } from './validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default export schedule configuration
 */
export const DEFAULT_SCHEDULE_CONFIG = {
  enabled: false,
  format: 'json',           // 'json' or 'csv'
  directory: null,          // null = use default snapshots directory
  filename: null,           // null = auto-generated with timestamp
  schedule: '0 * * * *',    // cron expression: every hour at minute 0
  includeMetrics: true,     // include current metrics in export
  compressOlder: false,     // compress exports older than 24h
  retentionDays: 30,        // keep exports for 30 days (0 = forever)
};

/**
 * Cron expression parser - supports basic 5-field expressions
 * Fields: minute hour dayOfMonth month dayOfWeek
 */
class CronParser {
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
      dayOfWeek: this._parseField(dayOfWeek, 0, 6),
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
    const values = new Set();

    // Handle comma-separated parts
    const parts = field.split(',');

    for (const part of parts) {
      // Handle step values (e.g., every N or range/N)
      const [range, stepStr] = part.split('/');
      const step = stepStr ? parseInt(stepStr, 10) : 1;

      if (range === '*') {
        // All values with step
        for (let i = min; i <= max; i += step) {
          values.add(i);
        }
      } else if (range.includes('-')) {
        // Range (e.g., 1-5)
        const [startStr, endStr] = range.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
          throw new Error(`Invalid range: ${range}`);
        }

        for (let i = start; i <= end; i += step) {
          values.add(i);
        }
      } else {
        // Single value
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
    const month = date.getMonth() + 1; // JS months are 0-indexed
    const dayOfWeek = date.getDay();

    return (
      parsed.minute.has(minute) &&
      parsed.hour.has(hour) &&
      parsed.dayOfMonth.has(day) &&
      parsed.month.has(month) &&
      parsed.dayOfWeek.has(dayOfWeek)
    );
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

    // Start from next minute
    date.setSeconds(0, 0);
    date.setMinutes(date.getMinutes() + 1);

    // Search for next matching time (max 1 year ahead)
    const maxIterations = 366 * 24 * 60;
    for (let i = 0; i < maxIterations; i++) {
      if (this.matches(date, parsed)) {
        return date;
      }
      date.setMinutes(date.getMinutes() + 1);
    }

    throw new Error('Could not find next execution time within 1 year');
  }
}

/**
 * Export Scheduler - manages scheduled metric exports
 */
export class ExportScheduler {
  constructor(options = {}) {
    this.config = { ...DEFAULT_SCHEDULE_CONFIG, ...options };
    this.enabled = this.config.enabled;
    this.timer = null;
    this.lastExport = null;
    this.nextExport = null;
    this.exportCount = 0;
    this.failedCount = 0;

    // Metrics data callback (set by dashboard)
    this.getMetricsCallback = null;

    // Export directory
    this.exportDir = this.config.directory || getSnapshotsDirectory();
  }

  /**
   * Set the metrics callback function
   * @param {Function} callback - Function that returns current metrics
   */
  setMetricsCallback(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Metrics callback must be a function');
    }
    this.getMetricsCallback = callback;
  }

  /**
   * Update scheduler configuration
   * @param {Object} newConfig - New configuration values
   */
  configure(newConfig) {
    const validatedConfig = ExportScheduler.validateConfig(newConfig);

    this.config = { ...this.config, ...validatedConfig };
    this.enabled = this.config.enabled;
    this.exportDir = this.config.directory || getSnapshotsDirectory();

    // Restart timer if enabled
    if (this.enabled && this.timer) {
      this.stop();
      this.start();
    }

    logger.info(`Export scheduler configured: ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Start the scheduler
   */
  start() {
    if (!this.enabled) {
      logger.debug('Export scheduler not enabled, skipping start');
      return;
    }

    try {
      // Calculate next export time
      this.nextExport = CronParser.nextExecution(new Date(), this.config.schedule);

      const delay = this.nextExport.getTime() - Date.now();
      logger.info(`Export scheduler started, next export in ${this._formatDelay(delay)}`);

      // Set timer for next export
      this.timer = setTimeout(() => this._onExportTime(), delay);
    } catch (err) {
      logger.error(`Failed to start export scheduler: ${err.message}`);
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
      logger.debug('Export scheduler stopped');
    }
  }

  /**
   * Trigger an immediate export (manual)
   * @returns {Promise<Object>} Export result
   */
  async triggerExport() {
    return this._performExport('manual');
  }

  /**
   * Handle scheduled export time
   * @private
   */
  async _onExportTime() {
    try {
      const result = await this._performExport('scheduled');

      if (result.success) {
        this.lastExport = new Date();
        this.exportCount++;
        logger.info(`Scheduled export completed: ${result.path}`);
      } else {
        this.failedCount++;
        logger.error(`Scheduled export failed: ${result.error}`);
      }
    } catch (err) {
      this.failedCount++;
      logger.error(`Export scheduler error: ${err.message}`);
    }

    // Schedule next export
    if (this.enabled) {
      this.nextExport = CronParser.nextExecution(new Date(), this.config.schedule);
      const delay = this.nextExport.getTime() - Date.now();
      this.timer = setTimeout(() => this._onExportTime(), delay);
      logger.debug(`Next export scheduled for ${this.nextExport.toISOString()}`);
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
      // Ensure export directory exists
      if (!fs.existsSync(this.exportDir)) {
        fs.mkdirSync(this.exportDir, { recursive: true });
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = this.config.filename
        ? `${this.config.filename}-${timestamp}.${this.config.format}`
        : `claw-export-${timestamp}.${this.config.format}`;

      const filePath = path.join(this.exportDir, filename);

      // Get data to export
      const exportData = await this._getExportData(trigger);

      // Write to file
      const content = this.config.format === 'csv'
        ? this._convertToCSV(exportData)
        : JSON.stringify(exportData, null, 2);

      fs.writeFileSync(filePath, content);

      // Set secure permissions
      try {
        fs.chmodSync(filePath, 0o600);
      } catch (permErr) {
        logger.warn(`Could not set permissions on export: ${permErr.message}`);
      }

      // Cleanup old exports if retention is configured
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
      schemaVersion: '1.0.0',
      dashboardVersion: DASHBOARD_VERSION,
      exportedAt: new Date().toISOString(),
      trigger,
      format: this.config.format,
      schedule: this.config.schedule,
      metrics: null,
    };

    // Include current metrics if callback is set
    if (this.config.includeMetrics && typeof this.getMetricsCallback === 'function') {
      try {
        data.metrics = await this.getMetricsCallback();
      } catch (err) {
        logger.warn(`Failed to collect metrics for export: ${err.message}`);
        data.metrics = { error: 'Failed to collect metrics' };
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

    // Header comment
    lines.push(`# Claw Dashboard Export - ${data.exportedAt}`);
    lines.push(`# Format: ${data.format}`);
    lines.push(`# Schedule: ${data.schedule}`);
    lines.push('');

    if (data.metrics) {
      // Flatten metrics into CSV rows
      const metrics = data.metrics;
      const timestamp = data.exportedAt;

      // Create header row
      const headers = ['timestamp'];
      const values = [timestamp];

      // Extract key metrics
      if (metrics.cpu !== undefined) {
        headers.push('cpu_percent');
        values.push(metrics.cpu);
      }
      if (metrics.memory !== undefined) {
        headers.push('memory_percent');
        values.push(metrics.memory);
      }
      if (metrics.disk !== undefined) {
        headers.push('disk_percent');
        values.push(metrics.disk);
      }
      if (metrics.network !== undefined) {
        if (metrics.network.rx !== undefined) {
          headers.push('network_rx_bytes');
          values.push(metrics.network.rx);
        }
        if (metrics.network.tx !== undefined) {
          headers.push('network_tx_bytes');
          values.push(metrics.network.tx);
        }
      }

      lines.push(headers.join(','));
      lines.push(values.join(','));
    }

    return lines.join('\n');
  }

  /**
   * Cleanup old exports based on retention policy
   * @private
   */
  _cleanupOldExports() {
    try {
      const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
      const files = fs.readdirSync(this.exportDir)
        .filter(f => f.startsWith('claw-export-'))
        .map(f => ({
          name: f,
          path: path.join(this.exportDir, f),
          mtime: fs.statSync(path.join(this.exportDir, f)).mtimeMs
        }));

      for (const file of files) {
        if (file.mtime < cutoff) {
          fs.unlinkSync(file.path);
          logger.debug(`Cleaned up old export: ${file.name}`);
        }
      }
    } catch (err) {
      logger.warn(`Failed to cleanup old exports: ${err.message}`);
    }
  }

  /**
   * Format delay in human-readable form
   * @private
   * @param {number} ms - Delay in milliseconds
   * @returns {string} Formatted delay
   */
  _formatDelay(ms) {
    const minutes = Math.floor(ms / 60000);
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
      retentionDays: this.config.retentionDays,
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

    // Validate enabled
    if (config.enabled !== undefined) {
      validated.enabled = Boolean(config.enabled);
    }

    // Validate format
    if (config.format !== undefined) {
      if (['json', 'csv'].includes(config.format)) {
        validated.format = config.format;
      } else {
        errors.push(`Invalid format: ${config.format}`);
      }
    }

    // Validate schedule (cron expression)
    if (config.schedule !== undefined) {
      try {
        CronParser.parse(config.schedule);
        validated.schedule = config.schedule;
      } catch (err) {
        errors.push(`Invalid cron expression: ${config.schedule}`);
      }
    }

    // Validate directory
    if (config.directory !== undefined) {
      if (config.directory === null || typeof config.directory === 'string') {
        validated.directory = config.directory;
      } else {
        errors.push('Directory must be a string or null');
      }
    }

    // Validate retention days
    if (config.retentionDays !== undefined) {
      const days = Number(config.retentionDays);
      if (!isNaN(days) && days >= 0 && days <= 365) {
        validated.retentionDays = days;
      } else {
        errors.push('retentionDays must be 0-365');
      }
    }

    // Validate includeMetrics
    if (config.includeMetrics !== undefined) {
      validated.includeMetrics = Boolean(config.includeMetrics);
    }

    if (errors.length > 0) {
      logger.warn(`Export scheduler config validation warnings: ${errors.join('; ')}`);
    }

    return validated;
  }
}

/**
 * Common cron expressions for convenience
 */
export const CRON_PRESETS = {
  everyMinute: '* * * * *',
  every5Minutes: '*/5 * * * *',
  every10Minutes: '*/10 * * * *',
  every15Minutes: '*/15 * * * *',
  every30Minutes: '*/30 * * * *',
  hourly: '0 * * * *',
  every6Hours: '0 */6 * * *',
  every12Hours: '0 */12 * * *',
  daily: '0 0 * * *',
  weekly: '0 0 * * 0',
  monthly: '0 0 1 * *',
};

/**
 * Create a scheduler instance with default settings
 * @param {Object} options - Scheduler options
 * @returns {ExportScheduler} Scheduler instance
 */
export function createScheduler(options = {}) {
  return new ExportScheduler(options);
}

export { CronParser };

export default {
  ExportScheduler,
  CronParser,
  createScheduler,
  DEFAULT_SCHEDULE_CONFIG,
  CRON_PRESETS,
};
