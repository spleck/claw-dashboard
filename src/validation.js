/**
 * Input validation module for settings and configuration values
 * Validates all user inputs for settings like exportDirectory, theme, etc.
 */

import logger from './logger.js';
import os from 'os';
import config, { EXPORT_SCHEDULE } from './config.js';
import fs from 'fs';
import { resolve, dirname } from 'path';
import { CronParser } from './export-scheduler.js';

// Valid option values
const VALID_THEMES = config.VALIDATION.VALID_THEMES;
const VALID_SORT_MODES = config.VALIDATION.VALID_SORT_MODES;
const VALID_LOG_LEVELS = config.VALIDATION.VALID_LOG_LEVELS;
const VALID_EXPORT_FORMATS = config.VALIDATION.VALID_EXPORT_FORMATS;

// Validation constraints
const CONSTRAINTS = {
  refreshInterval: {
    min: config.VALIDATION.REFRESH_INTERVAL.MIN,
    max: config.VALIDATION.REFRESH_INTERVAL.MAX,
    type: 'number'
  },
  logLevelFilter: {
    type: 'string',
    values: VALID_LOG_LEVELS
  },
  sessionSortMode: {
    type: 'string',
    values: VALID_SORT_MODES
  },
  theme: {
    type: 'string',
    values: VALID_THEMES
  },
  exportFormat: {
    type: 'string',
    values: VALID_EXPORT_FORMATS
  },
  exportDirectory: {
    type: 'string',
    required: false
  }
};

/**
 * Validate a file path
 * @param {string} filePath - Path to validate
 * @param {boolean} mustExist - Whether the path must exist
 * @returns {object} Validation result
 */
function validatePath(filePath, mustExist = false) {
  if (!filePath || typeof filePath !== 'string') {
    return { valid: false, error: 'Path must be a non-empty string' };
  }

  // Check for path traversal
  if (filePath.includes('..')) {
    return { valid: false, error: 'Path traversal not allowed' };
  }

  // Expand tilde
  const expandedPath = filePath.startsWith('~')
    ? resolve(os.homedir(), filePath.slice(1))
    : resolve(filePath);

  // Check if exists if required
  if (mustExist && !fs.existsSync(expandedPath)) {
    return { valid: false, error: `Path does not exist: ${expandedPath}` };
  }

  // Check if path is writable (directory exists or parent exists)
  const parentDir = dirname(expandedPath);
  if (!fs.existsSync(parentDir) && !fs.existsSync(expandedPath)) {
    // Allow if parent can be created
    try {
      const parentExists = fs.existsSync(parentDir);
      if (!parentExists) {
        return { valid: true, resolvedPath: expandedPath, warning: 'Parent directory will be created' };
      }
    } catch {
      return { valid: false, error: 'Cannot determine if path is writable' };
    }
  }

  return { valid: true, resolvedPath: expandedPath };
}

/**
 * Validate refresh interval
 * @param {any} value - Value to validate
 * @returns {object} Validation result
 */
function validateRefreshInterval(value) {
  if (value === undefined || value === null) {
    return { valid: true, value: config.REFRESH_INTERVALS.DEFAULT }; // Default
  }

  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Refresh interval must be a number' };
  }

  if (num < CONSTRAINTS.refreshInterval.min || num > CONSTRAINTS.refreshInterval.max) {
    return { 
      valid: false, 
      error: `Refresh interval must be between ${CONSTRAINTS.refreshInterval.min}ms and ${CONSTRAINTS.refreshInterval.max}ms` 
    };
  }

  return { valid: true, value: num };
}

/**
 * Validate log level filter
 * @param {any} value - Value to validate
 * @returns {object} Validation result
 */
function validateLogLevelFilter(value) {
  if (!value) {
    return { valid: true, value: 'all' }; // Default
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Log level must be a string' };
  }

  const normalized = value.toLowerCase();
  
  if (!CONSTRAINTS.logLevelFilter.values.includes(normalized)) {
    return { 
      valid: false, 
      error: `Invalid log level. Must be one of: ${CONSTRAINTS.logLevelFilter.values.join(', ')}` 
    };
  }

  return { valid: true, value: normalized };
}

/**
 * Validate session sort mode
 * @param {any} value - Value to validate
 * @returns {object} Validation result
 */
function validateSessionSortMode(value) {
  if (!value) {
    return { valid: true, value: 'time' }; // Default
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Sort mode must be a string' };
  }

  const normalized = value.toLowerCase();
  
  if (!CONSTRAINTS.sessionSortMode.values.includes(normalized)) {
    return { 
      valid: false, 
      error: `Invalid sort mode. Must be one of: ${CONSTRAINTS.sessionSortMode.values.join(', ')}` 
    };
  }

  return { valid: true, value: normalized };
}

/**
 * Validate theme
 * @param {any} value - Value to validate
 * @returns {object} Validation result
 */
function validateTheme(value) {
  if (!value) {
    return { valid: true, value: 'default' }; // Default
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Theme must be a string' };
  }

  const normalized = value.toLowerCase();
  
  if (!CONSTRAINTS.theme.values.includes(normalized)) {
    return { 
      valid: false, 
      error: `Invalid theme. Must be one of: ${CONSTRAINTS.theme.values.join(', ')}` 
    };
  }

  return { valid: true, value: normalized };
}

/**
 * Validate export format
 * @param {any} value - Value to validate
 * @returns {object} Validation result
 */
function validateExportFormat(value) {
  if (!value) {
    return { valid: true, value: 'json' }; // Default
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Export format must be a string' };
  }

  const normalized = value.toLowerCase();
  
  if (!CONSTRAINTS.exportFormat.values.includes(normalized)) {
    return { 
      valid: false, 
      error: `Invalid export format. Must be one of: ${CONSTRAINTS.exportFormat.values.join(', ')}` 
    };
  }

  return { valid: true, value: normalized };
}

/**
 * Validate export directory
 * @param {any} value - Value to validate
 * @returns {object} Validation result
 */
function validateExportDirectory(value) {
  if (!value) {
    // Default directory
    return { valid: true, value: config.PATHS.EXPORTS };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Export directory must be a string' };
  }

  return validatePath(value, false);
}

/**
 * Validate a boolean setting
 * @param {any} value - Value to validate
 * @param {string} name - Name of the setting for error messages
 * @returns {object} Validation result
 */
function validateBoolean(value, name = 'setting') {
  if (value === undefined || value === null) {
    return { valid: true, value: true }; // Default
  }

  if (typeof value !== 'boolean') {
    // Try to parse string booleans
    if (value === 'true' || value === '1' || value === 'yes') {
      return { valid: true, value: true };
    }
    if (value === 'false' || value === '0' || value === 'no') {
      return { valid: true, value: false };
    }
    return { valid: false, error: `${name} must be a boolean` };
  }

  return { valid: true, value: Boolean(value) };
}

/**
 * Validate widget visibility (showWidget1-7)
 * @param {any} value - Value to validate
 * @returns {object} Validation result
 */
function validateWidgetVisibility(value) {
  return validateBoolean(value, 'Widget visibility');
}

/**
 * Validate pinned widgets array
 * @param {any} value - Value to validate (array of widget IDs)
 * @returns {object} Validation result
 */
function validatePinnedWidgets(value) {
  if (!value) {
    return { valid: true, value: [] };
  }

  if (!Array.isArray(value)) {
    return { valid: false, error: 'pinnedWidgets must be an array' };
  }

  // Valid widget IDs that can be pinned
  const validWidgetIds = ['cpu', 'mem', 'gpu', 'net', 'disk', 'sys', 'uptime', 'health', 'gateway'];

  // Validate each widget ID
  const validated = [];
  for (const widgetId of value) {
    if (typeof widgetId === 'string' && validWidgetIds.includes(widgetId)) {
      validated.push(widgetId);
    }
  }

  // Limit to max 4 pinned widgets
  if (validated.length > 4) {
    return { valid: true, value: validated.slice(0, 4), warning: 'Maximum 4 widgets can be pinned, truncating to first 4' };
  }

  return { valid: true, value: validated };
}

/**
 * Validate widget order for drag-and-drop arrangement
 * @param {any} value - Widget order array to validate
 * @returns {object} Validation result
 */
function validateWidgetOrder(value) {
  if (!value) {
    return { valid: true, value: [] };
  }

  if (!Array.isArray(value)) {
    return { valid: false, error: 'widgetOrder must be an array' };
  }

  // Valid widget IDs
  const validWidgetIds = ['cpu', 'mem', 'gpu', 'net', 'disk', 'sys', 'uptime', 'health', 'gateway'];

  // Validate each widget ID and remove duplicates (keep first occurrence)
  const validated = [];
  const seen = new Set();
  for (const widgetId of value) {
    if (typeof widgetId === 'string' && validWidgetIds.includes(widgetId) && !seen.has(widgetId)) {
      validated.push(widgetId);
      seen.add(widgetId);
    }
  }

  return { valid: true, value: validated };
}

/**
 * Validate widget sizes configuration
 * @param {any} widgetSizes - Widget sizes object to validate
 * @returns {object} Validation result
 */
function validateWidgetSizes(widgetSizes) {
  if (!widgetSizes || typeof widgetSizes !== 'object') {
    return { valid: true, value: {} };
  }

  const validSizes = ['small', 'medium', 'large', 'wide'];
  const validWidgetIds = ['cpu', 'mem', 'gpu', 'net', 'disk', 'sys', 'uptime', 'health', 'gateway'];
  const result = { valid: true, value: {} };

  for (const [widgetId, size] of Object.entries(widgetSizes)) {
    if (validWidgetIds.includes(widgetId)) {
      if (validSizes.includes(size)) {
        result.value[widgetId] = size;
      }
      // Invalid size is ignored (will use default)
    }
  }

  return result;
}

/**
 * Validate alert thresholds
 * @param {any} thresholds - Thresholds object to validate
 * @returns {object} Validation result
 */
function validateAlertThresholds(thresholds) {
  if (!thresholds || typeof thresholds !== 'object') {
    return { valid: false, error: 'Alert thresholds must be an object' };
  }

  const result = { valid: true, value: {} };
  const allowedTypes = ['cpu', 'memory', 'disk'];

  for (const type of allowedTypes) {
    if (thresholds[type]) {
      const t = thresholds[type];
      
      if (typeof t !== 'object') {
        return { valid: false, error: `Alert threshold for ${type} must be an object` };
      }

      result.value[type] = {};

      // Validate warning threshold
      if (t.warning !== undefined) {
        const warning = Number(t.warning);
        if (isNaN(warning) || warning < 0 || warning > 100) {
          return { valid: false, error: `${type} warning threshold must be 0-100` };
        }
        result.value[type].warning = warning;
      } else {
        result.value[type].warning = type === 'disk' ? 80 : 70; // Defaults
      }

      // Validate critical threshold
      if (t.critical !== undefined) {
        const critical = Number(t.critical);
        if (isNaN(critical) || critical < 0 || critical > 100) {
          return { valid: false, error: `${type} critical threshold must be 0-100` };
        }
        result.value[type].critical = critical;
      } else {
        result.value[type].critical = type === 'disk' ? 95 : 90; // Defaults
      }

      // Ensure critical >= warning
      if (result.value[type].critical < result.value[type].warning) {
        return { valid: false, error: `${type} critical threshold must be >= warning threshold` };
      }
    }
  }

  return result;
}

/**
 * Validate auto-retry configuration
 * @param {object} autoRetry - Auto-retry configuration to validate
 * @returns {object} Validation result
 */
function validateAutoRetry(autoRetry) {
  if (!autoRetry || typeof autoRetry !== 'object') {
    // Return defaults if not provided
    return {
      valid: true,
      value: {
        enabled: config.AUTO_RETRY.ENABLED,
        intervalMs: config.AUTO_RETRY.DEFAULT_INTERVAL_MS,
        exponentialBackoff: config.AUTO_RETRY.EXPONENTIAL_BACKOFF,
        backoffMultiplier: config.AUTO_RETRY.BACKOFF_MULTIPLIER,
        maxBackoffIntervalMs: config.AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS,
        resetAfterSuccess: config.AUTO_RETRY.RESET_AFTER_SUCCESS,
        consecutiveFailureThreshold: config.AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD,
      }
    };
  }

  const validated = {};
  const constraints = config.VALIDATION.AUTO_RETRY;

  // Validate enabled (default: true)
  validated.enabled = autoRetry.enabled !== false;

  // Validate intervalMs
  const interval = Number(autoRetry.intervalMs);
  if (autoRetry.intervalMs !== undefined && (!isNaN(interval) && interval >= constraints.INTERVAL_MS.MIN && interval <= constraints.INTERVAL_MS.MAX)) {
    validated.intervalMs = interval;
  } else {
    validated.intervalMs = config.AUTO_RETRY.DEFAULT_INTERVAL_MS;
  }

  // Validate exponentialBackoff (default: true)
  validated.exponentialBackoff = autoRetry.exponentialBackoff !== false;

  // Validate backoffMultiplier
  const multiplier = Number(autoRetry.backoffMultiplier);
  if (autoRetry.backoffMultiplier !== undefined && (!isNaN(multiplier) && multiplier >= constraints.BACKOFF_MULTIPLIER.MIN && multiplier <= constraints.BACKOFF_MULTIPLIER.MAX)) {
    validated.backoffMultiplier = multiplier;
  } else {
    validated.backoffMultiplier = config.AUTO_RETRY.BACKOFF_MULTIPLIER;
  }

  // Validate maxBackoffIntervalMs
  const maxBackoff = Number(autoRetry.maxBackoffIntervalMs);
  if (autoRetry.maxBackoffIntervalMs !== undefined && (!isNaN(maxBackoff) && maxBackoff >= constraints.MAX_BACKOFF_INTERVAL_MS.MIN && maxBackoff <= constraints.MAX_BACKOFF_INTERVAL_MS.MAX)) {
    validated.maxBackoffIntervalMs = maxBackoff;
  } else {
    validated.maxBackoffIntervalMs = config.AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS;
  }

  // Validate resetAfterSuccess (default: true)
  validated.resetAfterSuccess = autoRetry.resetAfterSuccess !== false;

  // Validate consecutiveFailureThreshold
  const threshold = Number(autoRetry.consecutiveFailureThreshold);
  if (autoRetry.consecutiveFailureThreshold !== undefined && (!isNaN(threshold) && threshold >= constraints.CONSECUTIVE_FAILURE_THRESHOLD.MIN && threshold <= constraints.CONSECUTIVE_FAILURE_THRESHOLD.MAX)) {
    validated.consecutiveFailureThreshold = threshold;
  } else {
    validated.consecutiveFailureThreshold = config.AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD;
  }

  return { valid: true, value: validated };
}

/**
 * Validate auto-save configuration
 * @param {object} autoSave - Auto-save configuration to validate
 * @returns {object} Validation result
 */
function validateAutoSave(autoSave) {
  if (!autoSave || typeof autoSave !== 'object') {
    // Return defaults if not provided
    return {
      valid: true,
      value: {
        enabled: config.AUTO_SAVE.ENABLED,
        intervalMs: config.AUTO_SAVE.INTERVAL_MS,
        saveOnExit: config.AUTO_SAVE.SAVE_ON_EXIT,
      }
    };
  }

  const validated = {};

  // Validate enabled (default: true)
  validated.enabled = autoSave.enabled !== false;

  // Validate intervalMs (must be between 5s and 5min)
  const interval = Number(autoSave.intervalMs);
  if (!isNaN(interval) && interval >= 5000 && interval <= 300000) {
    validated.intervalMs = interval;
  } else {
    validated.intervalMs = config.AUTO_SAVE.INTERVAL_MS;
  }

  // Validate saveOnExit (default: true)
  validated.saveOnExit = autoSave.saveOnExit !== false;

  return { valid: true, value: validated };
}

/**
 * Validate export schedule configuration
 * @param {object} exportSchedule - Export schedule configuration to validate
 * @returns {object} Validation result
 */
function validateExportSchedule(exportSchedule) {
  if (!exportSchedule || typeof exportSchedule !== 'object') {
    // Return defaults if not provided
    return {
      valid: true,
      value: {
        enabled: EXPORT_SCHEDULE.ENABLED,
        format: EXPORT_SCHEDULE.DEFAULT_FORMAT,
        schedule: EXPORT_SCHEDULE.DEFAULT_SCHEDULE,
        retentionDays: EXPORT_SCHEDULE.DEFAULT_RETENTION_DAYS,
        directory: null,
        includeMetrics: true,
      }
    };
  }

  const validated = {};
  const errors = [];

  // Validate enabled (default: false)
  validated.enabled = Boolean(exportSchedule.enabled);

  // Validate format
  if (exportSchedule.format !== undefined) {
    if (['json', 'csv'].includes(exportSchedule.format)) {
      validated.format = exportSchedule.format;
    } else {
      errors.push(`Invalid format: ${exportSchedule.format}`);
      validated.format = EXPORT_SCHEDULE.DEFAULT_FORMAT;
    }
  } else {
    validated.format = EXPORT_SCHEDULE.DEFAULT_FORMAT;
  }

  // Validate schedule (cron expression)
  if (exportSchedule.schedule !== undefined) {
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

  // Validate retention days
  if (exportSchedule.retentionDays !== undefined) {
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

  // Validate directory
  if (exportSchedule.directory !== undefined && exportSchedule.directory !== null) {
    if (typeof exportSchedule.directory === 'string') {
      const pathResult = validatePath(exportSchedule.directory, false);
      if (pathResult.valid) {
        validated.directory = pathResult.resolvedPath;
      } else {
        errors.push(`Invalid directory: ${pathResult.error}`);
        validated.directory = null;
      }
    } else {
      errors.push('directory must be a string or null');
      validated.directory = null;
    }
  } else {
    validated.directory = null;
  }

  // Validate includeMetrics
  validated.includeMetrics = exportSchedule.includeMetrics !== false;

  if (errors.length > 0) {
    logger.warn(`Export schedule validation warnings: ${errors.join('; ')}`);
  }

  return { valid: true, value: validated };
}

/**
 * Validate all settings at once
 * @param {object} settings - Settings object to validate
 * @returns {object} Validation result with validated settings
 */
function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    logger.warn('Settings must be an object, using defaults');
    return getDefaultSettings();
  }

  const validated = {};
  const errors = [];

  // Validate each setting
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
    exportSchedule: validateExportSchedule,
  };

  for (const [key, validator] of Object.entries(validators)) {
    const result = validator(settings[key]);
    if (result.valid) {
      validated[key] = result.value;
    } else {
      errors.push(`${key}: ${result.error}`);
      // Use default value
      validated[key] = getDefaultValue(key);
    }
  }

  // Validate autoRetry configuration separately
  const autoRetryResult = validateAutoRetry(settings.autoRetry);
  if (autoRetryResult.valid) {
    validated.autoRetry = autoRetryResult.value;
  } else {
    errors.push(`autoRetry: ${autoRetryResult.error}`);
    validated.autoRetry = autoRetryResult.value; // Uses defaults
  }

  // Validate autoSave configuration separately
  const autoSaveResult = validateAutoSave(settings.autoSave);
  if (autoSaveResult.valid) {
    validated.autoSave = autoSaveResult.value;
  } else {
    errors.push(`autoSave: ${autoSaveResult.error}`);
    validated.autoSave = autoSaveResult.value; // Uses defaults
  }

  // Validate exportSchedule configuration separately
  const exportScheduleResult = validateExportSchedule(settings.exportSchedule);
  if (exportScheduleResult.valid) {
    validated.exportSchedule = exportScheduleResult.value;
  } else {
    errors.push(`exportSchedule: ${exportScheduleResult.error}`);
    validated.exportSchedule = exportScheduleResult.value; // Uses defaults
  }

  if (errors.length > 0) {
    logger.warn(`Settings validation errors: ${errors.join('; ')}`);
  }

  return { valid: true, value: validated };
}

/**
 * Get default value for a setting
 * @param {string} key - Setting key
 * @returns {any} Default value
 */
function getDefaultValue(key) {
  const defaults = {
    refreshInterval: config.REFRESH_INTERVALS.DEFAULT,
    logLevelFilter: 'all',
    sessionSortMode: 'time',
    theme: 'default',
    exportFormat: 'json',
    exportDirectory: config.PATHS.EXPORTS,
    autoRetry: {
      enabled: config.AUTO_RETRY.ENABLED,
      intervalMs: config.AUTO_RETRY.DEFAULT_INTERVAL_MS,
      exponentialBackoff: config.AUTO_RETRY.EXPONENTIAL_BACKOFF,
      backoffMultiplier: config.AUTO_RETRY.BACKOFF_MULTIPLIER,
      maxBackoffIntervalMs: config.AUTO_RETRY.MAX_BACKOFF_INTERVAL_MS,
      resetAfterSuccess: config.AUTO_RETRY.RESET_AFTER_SUCCESS,
      consecutiveFailureThreshold: config.AUTO_RETRY.CONSECUTIVE_FAILURE_THRESHOLD,
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
      includeMetrics: true,
    },
  };
  return defaults[key];
}

/**
 * Get all default settings
 * @returns {object} Default settings object
 */
function getDefaultSettings() {
  return {
    refreshInterval: config.REFRESH_INTERVALS.DEFAULT,
    versionCheckInterval: 43200000, // 12 hours in milliseconds
    lastVersionCheck: 0,
    logLevelFilter: 'all',
    sessionSortMode: 'time',
    theme: 'default',
    exportFormat: 'json',
    exportDirectory: config.PATHS.EXPORTS,
    showWidget1: true,
    showWidget2: true,
    showWidget3: true,
    showWidget4: true,
    showWidget5: true,
    showWidget6: true,
    showWidget7: true,
    showWidget8: true,
    showPerformanceMetrics: false,
    sessionSearchQuery: '',
    favorites: {},
    showFavoritesOnly: false,
    pinnedWidgets: [],
    widgetOrder: [],
    widgetSizes: {
      cpu: 'medium',
      mem: 'medium',
      gpu: 'medium',
      net: 'medium',
      disk: 'medium',
      sys: 'medium',
      uptime: 'medium',
      health: 'medium',
      gateway: 'medium',
    },
    firstRun: true,
    gatewayEndpoints: [{
      name: 'local',
      host: 'localhost',
      port: 18789,
      token: null,
      enabled: true,
      type: 'local'
    }],
    activeGatewayEndpoint: 'local',
    webInterface: {
      enabled: false,
      port: config.WEB.DEFAULT_PORT,
      host: config.WEB.HOST,
      cors: true
    }
  };
}

/**
 * Validate gateway endpoint configuration
 * @param {object} endpoint - Endpoint configuration to validate
 * @returns {object} Validation result
 */
function validateGatewayEndpoint(endpoint) {
  if (!endpoint || typeof endpoint !== 'object') {
    return { valid: false, error: 'Endpoint must be an object' };
  }

  // Validate name
  if (!endpoint.name || typeof endpoint.name !== 'string' || endpoint.name.length === 0) {
    return { valid: false, error: 'Endpoint name is required and must be a non-empty string' };
  }

  if (endpoint.name.length > config.VALIDATION.ENDPOINT_NAME.MAX_LENGTH) {
    return { valid: false, error: `Endpoint name must be at most ${config.VALIDATION.ENDPOINT_NAME.MAX_LENGTH} characters` };
  }

  if (!config.VALIDATION.ENDPOINT_NAME.PATTERN.test(endpoint.name)) {
    return { valid: false, error: 'Endpoint name must contain only alphanumeric characters, underscores, and hyphens' };
  }

  // Validate host
  if (!endpoint.host || typeof endpoint.host !== 'string' || endpoint.host.length === 0) {
    return { valid: false, error: 'Endpoint host is required and must be a non-empty string' };
  }

  // Validate port
  const port = Number(endpoint.port);
  if (isNaN(port) || port < 1 || port > 65535) {
    return { valid: false, error: 'Endpoint port must be a valid port number (1-65535)' };
  }

  // Validate type if provided
  if (endpoint.type !== undefined) {
    if (!config.VALIDATION.VALID_ENDPOINT_TYPES.includes(endpoint.type)) {
      return { valid: false, error: `Endpoint type must be one of: ${config.VALIDATION.VALID_ENDPOINT_TYPES.join(', ')}` };
    }
  }

  // Validate enabled if provided (should be boolean)
  if (endpoint.enabled !== undefined && typeof endpoint.enabled !== 'boolean') {
    return { valid: false, error: 'Endpoint enabled must be a boolean' };
  }

  // Validate token if provided (should be string or null)
  if (endpoint.token !== undefined && endpoint.token !== null && typeof endpoint.token !== 'string') {
    return { valid: false, error: 'Endpoint token must be a string or null' };
  }

  return {
    valid: true,
    value: {
      name: endpoint.name,
      host: endpoint.host,
      port: port,
      token: endpoint.token || null,
      enabled: endpoint.enabled !== false, // default true
      type: endpoint.type || 'local'
    }
  };
}

/**
 * Validate a single value against a type
 * @param {any} value - Value to validate
 * @param {string} type - Expected type
 * @returns {boolean} Whether valid
 */
function validateType(value, type) {
  switch (type) {
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'string':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null;
    default:
      return false;
  }
}

export {
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

export default {
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
