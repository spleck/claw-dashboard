/**
 * Input validation module for settings and configuration values
 * Validates all user inputs for settings like exportDirectory, theme, etc.
 */

import logger from './logger.js';
import os from 'os';
import fs from 'fs';
import { resolve } from 'path';

// Valid option values
const VALID_THEMES = ['default', 'dark', 'high-contrast', 'ocean'];
const VALID_SORT_MODES = ['time', 'tokens', 'idle', 'name'];
const VALID_LOG_LEVELS = ['all', 'error', 'warn', 'info', 'debug'];
const VALID_EXPORT_FORMATS = ['json', 'csv'];

// Validation constraints
const CONSTRAINTS = {
  refreshInterval: {
    min: 500,
    max: 60000,
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
  const parentDir = require('path').dirname(expandedPath);
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
    return { valid: true, value: 2000 }; // Default
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
    return { valid: true, value: os.homedir() + '/.openclaw/exports' };
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
    showWidget7: validateWidgetVisibility
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

  if (errors.length > 0) {
    logger.warn(`Settings validation errors: ${errors.join('; ')}`);
  }

  return validated;
}

/**
 * Get default value for a setting
 * @param {string} key - Setting key
 * @returns {any} Default value
 */
function getDefaultValue(key) {
  const defaults = {
    refreshInterval: 2000,
    logLevelFilter: 'all',
    sessionSortMode: 'time',
    theme: 'default',
    exportFormat: 'json',
    exportDirectory: os.homedir() + '/.openclaw/exports',
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

/**
 * Get all default settings
 * @returns {object} Default settings object
 */
function getDefaultSettings() {
  return {
    refreshInterval: 2000,
    logLevelFilter: 'all',
    sessionSortMode: 'time',
    theme: 'default',
    exportFormat: 'json',
    exportDirectory: os.homedir() + '/.openclaw/exports',
    showWidget1: true,
    showWidget2: true,
    showWidget3: true,
    showWidget4: true,
    showWidget5: true,
    showWidget6: true,
    showWidget7: true
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
  validatePath,
  validateType,
  getDefaultSettings,
  VALID_THEMES,
  VALID_SORT_MODES,
  VALID_LOG_LEVELS,
  VALID_EXPORT_FORMATS
};
