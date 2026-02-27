/**
 * Security utilities for file permissions and input sanitization
 */

import fs from 'fs';
import path from 'path';

/**
 * Validate that a file path is safe (no null bytes, proper type)
 * @param {string} filePath - Path to validate
 * @returns {boolean} - True if path is valid
 */
function isValidPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  // Check for null bytes which can indicate injection attempts
  if (filePath.includes('\0')) return false;
  // Check for valid length
  if (filePath.length === 0 || filePath.length > 4096) return false;
  return true;
}

/**
 * Check if path is a regular file (not symlink) before chmod
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} - True if safe to chmod
 */
async function isSafeToChmod(filePath) {
  try {
    const stats = await fs.promises.lstat(filePath);
    // Only chmod regular files, not symlinks or directories
    if (!stats.isFile() || stats.isSymbolicLink()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Set secure file permissions (0600 - owner read/write only)
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - True if successful, false on failure
 */
async function setSecurePermissions(filePath) {
  if (!isValidPath(filePath)) {
    console.error('Invalid file path provided for permission setting');
    return false;
  }

  // Check if path is safe (not a symlink)
  if (!await isSafeToChmod(filePath)) {
    console.error(`Cannot set permissions on non-file path: ${filePath}`);
    return false;
  }

  try {
    await fs.promises.chmod(filePath, 0o600);
    return true;
  } catch (err) {
    // Graceful fallback - log but don't crash
    console.error(`Failed to set permissions on ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Check if path is a regular file (synchronous version)
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if safe to chmod
 */
function isSafeToChmodSync(filePath) {
  try {
    const stats = fs.lstatSync(filePath);
    // Only chmod regular files, not symlinks or directories
    if (!stats.isFile() || stats.isSymbolicLink()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Set secure file permissions (synchronous version)
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if successful, false on failure
 */
function setSecurePermissionsSync(filePath) {
  if (!isValidPath(filePath)) {
    console.error('Invalid file path provided for permission setting');
    return false;
  }

  // Check if path is safe (not a symlink)
  if (!isSafeToChmodSync(filePath)) {
    console.error(`Cannot set permissions on non-file path: ${filePath}`);
    return false;
  }

  try {
    fs.chmodSync(filePath, 0o600);
    return true;
  } catch (err) {
    // Graceful fallback - log but don't crash
    console.error(`Failed to set permissions on ${filePath}: ${err.message}`);
    return false;
  }
}

// ============================================================================
// WIDGET CONFIG SANITIZATION
// ============================================================================

/**
 * Widget configuration validator class
 * Provides sanitization and validation for user-provided widget configs
 */
class WidgetConfigValidator {
  constructor(options = {}) {
    this.maxStringLength = options.maxStringLength || 1000;
    this.maxDepth = options.maxDepth || 10;
    this.maxArrayLength = options.maxArrayLength || 100;
    this.allowedTypes = options.allowedTypes || ['string', 'number', 'boolean', 'object', 'array', 'null'];
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
    if (config === null || config === undefined) {
      return {};
    }

    if (typeof config !== 'object') {
      throw new Error('Widget config must be an object');
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

    if (value === undefined) {
      return undefined;
    }

    const type = Array.isArray(value) ? 'array' : typeof value;

    // Type whitelist check
    if (!this.allowedTypes.includes(type)) {
      throw new Error(`Invalid type: ${type}`);
    }

    if (type === 'string') {
      return this._sanitizeString(value);
    }

    if (type === 'number') {
      return this._sanitizeNumber(value);
    }

    if (type === 'boolean') {
      return value;
    }

    if (type === 'array') {
      return this._sanitizeArray(value, depth, schema);
    }

    if (type === 'object') {
      return this._sanitizeObject(value, depth, schema);
    }

    return value;
  }

  /**
   * Sanitize a string value
   * @private
   */
  _sanitizeString(str) {
    if (typeof str !== 'string') {
      return String(str);
    }

    // Null byte stripping
    if (this.stripNullBytes) {
      str = str.replace(/\0/g, '');
    }

    // Length limit
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
    if (typeof num !== 'number') {
      return NaN;
    }

    // Reject NaN and Infinity for safety
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

    // Length limit
    if (arr.length > this.maxArrayLength) {
      arr = arr.slice(0, this.maxArrayLength);
    }

    // Get array item schema if available
    const itemSchema = schema?.items;

    return arr.map((item, index) => {
      try {
        return this._sanitizeValue(item, depth + 1, itemSchema);
      } catch (err) {
        // Skip invalid array items
        return null;
      }
    });
  }

  /**
   * Sanitize an object
   * @private
   */
  _sanitizeObject(obj, depth, schema) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return {};
    }

    const sanitized = {};
    const properties = schema?.properties || {};
    const allowedKeys = schema ? new Set(Object.keys(properties)) : null;

    for (const key of Object.keys(obj)) {
      // Key length limit
      if (key.length > this.maxKeyLength) {
        continue;
      }

      // Skip non-whitelisted keys if schema provided
      if (allowedKeys && !allowedKeys.has(key)) {
        continue;
      }

      try {
        const keySchema = properties?.[key];
        sanitized[key] = this._sanitizeValue(obj[key], depth + 1, keySchema);
      } catch (err) {
        // Use default or skip invalid values
        const defaultValue = properties?.[key]?.default;
        sanitized[key] = defaultValue !== undefined ? defaultValue : null;
      }
    }

    return sanitized;
  }
}

/**
 * Sanitize widget configuration (convenience function)
 * @param {*} config - Raw configuration
 * @param {Object} schema - Optional schema
 * @returns {Object} Sanitized config
 */
function sanitizeWidgetConfig(config, schema = null) {
  const validator = new WidgetConfigValidator();
  return validator.validate(config, schema);
}

/**
 * Validate widget configuration against a schema
 * @param {*} config - Configuration to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
function validateWidgetConfig(config, schema) {
  const errors = [];
  const validator = new WidgetConfigValidator();

  try {
    validator.validate(config, schema);
    return { valid: true, errors: [] };
  } catch (err) {
    errors.push(err.message);
    return { valid: false, errors };
  }
}

export { setSecurePermissions, setSecurePermissionsSync, isValidPath, isSafeToChmod, isSafeToChmodSync, sanitizeWidgetConfig, validateWidgetConfig, WidgetConfigValidator };
export default { setSecurePermissions, setSecurePermissionsSync, isValidPath, isSafeToChmod, isSafeToChmodSync, sanitizeWidgetConfig, validateWidgetConfig, WidgetConfigValidator };
