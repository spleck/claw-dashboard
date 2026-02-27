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

// ============================================================================
// PLUGIN PATH VALIDATION
// ============================================================================

/**
 * Validate a plugin path to prevent path traversal attacks
 * Ensures the resolved path stays within allowed base directories
 *
 * @param {string} inputPath - The path to validate (can be relative or absolute)
 * @param {Object} options - Validation options
 * @param {string[]} options.allowedDirs - Array of allowed base directories (resolved paths must be within these)
 * @param {boolean} options.allowAbsolute - Whether to allow absolute paths (default: false)
 * @param {boolean} options.mustExist - Whether the path must exist (default: false)
 * @param {string} options.expectedType - Expected file type: 'file', 'directory', or null for any
 * @returns {Object} Validation result: { valid: boolean, path: string|null, error: string|null }
 */
function validatePluginPath(inputPath, options = {}) {
  const { allowedDirs = [], allowAbsolute = false, mustExist = false, expectedType = null } = options;

  // Basic validation
  if (!inputPath || typeof inputPath !== 'string') {
    return { valid: false, path: null, error: 'Path must be a non-empty string' };
  }

  // Check for null bytes
  if (inputPath.includes('\0')) {
    return { valid: false, path: null, error: 'Path contains null bytes' };
  }

  // Reject absolute paths unless explicitly allowed
  if (path.isAbsolute(inputPath) && !allowAbsolute) {
    return { valid: false, path: null, error: 'Absolute paths are not allowed' };
  }

  // Check for obvious path traversal attempts in the input
  const normalizedInput = path.normalize(inputPath);

  // Reject any path that:
  // 1. Starts with .. (going up from base)
  // 2. Contains ../ anywhere
  // 3. After normalizing, would escape the base directory
  if (normalizedInput.startsWith('..')) {
    return { valid: false, path: null, error: 'Path traversal detected' };
  }

  // Check for ../ in the original input before normalization
  if (inputPath.includes('../') || inputPath.includes('..\\')) {
    return { valid: false, path: null, error: 'Path traversal detected' };
  }

  // Validate directory/file name characters
  // Allow: alphanumeric, hyphens, underscores, dots (for extensions)
  const parts = inputPath.split(path.sep).filter(part => part.length > 0);
  for (const part of parts) {
    // Skip if it's just '.' or '..'
    if (part === '.' || part === '..') {
      continue;
    }

    // Check for invalid characters - allow alphanumerics, hyphens, underscores, dots
    if (!/^[a-zA-Z0-9._-]+$/.test(part)) {
      return { valid: false, path: null, error: `Invalid characters in path component: ${part}` };
    }

    // Check for hidden files/directories (starting with .)
    if (part.startsWith('.') && part !== '.' && part !== '..') {
      // Allow specific hidden files like .gitkeep but not arbitrary ones
      const allowedHidden = ['.gitkeep', '.gitignore', '.npmignore'];
      if (!allowedHidden.includes(part)) {
        return { valid: false, path: null, error: `Hidden files/directories are not allowed: ${part}` };
      }
    }
  }

  // Resolve the full path if allowedDirs provided
  let resolvedPath;
  try {
    // Resolve relative to first allowed dir, or just normalize
    if (allowedDirs.length > 0) {
      // Use first allowed dir as base for relative paths
      const baseDir = allowedDirs[0];
      resolvedPath = path.resolve(baseDir, inputPath);
    } else {
      resolvedPath = path.resolve(inputPath);
    }
  } catch (err) {
    return { valid: false, path: null, error: `Failed to resolve path: ${err.message}` };
  }

  // Verify the resolved path is within allowed directories
  if (allowedDirs.length > 0) {
    const isWithinAllowed = allowedDirs.some(allowedDir => {
      // Ensure allowedDir ends with separator for proper prefix check
      const normalizedAllowed = allowedDir.endsWith(path.sep) ? allowedDir : allowedDir + path.sep;
      const normalizedResolved = resolvedPath.endsWith(path.sep) ? resolvedPath : resolvedPath + path.sep;
      return normalizedResolved.startsWith(normalizedAllowed);
    });

    if (!isWithinAllowed) {
      return { valid: false, path: null, error: 'Path is outside allowed directories' };
    }
  }

  // Check if path must exist
  if (mustExist) {
    try {
      const stats = fs.statSync(resolvedPath);

      if (expectedType === 'file' && !stats.isFile()) {
        return { valid: false, path: null, error: 'Path exists but is not a file' };
      }

      if (expectedType === 'directory' && !stats.isDirectory()) {
        return { valid: false, path: null, error: 'Path exists but is not a directory' };
      }
    } catch (err) {
      return { valid: false, path: null, error: `Path does not exist: ${resolvedPath}` };
    }
  }

  // Verify the resolved path didn't escape via symlinks
  try {
    const realPath = fs.realpathSync(resolvedPath);
    if (allowedDirs.length > 0) {
      // Resolve allowedDirs to their real paths for proper comparison
      // (e.g., on macOS /var is a symlink to /private/var)
      const realAllowedDirs = allowedDirs.map(allowedDir => {
        try {
          return fs.realpathSync(allowedDir);
        } catch {
          return allowedDir; // If realpath fails, use original path
        }
      });

      const isRealPathWithinAllowed = realAllowedDirs.some(realAllowedDir => {
        const normalizedAllowed = realAllowedDir.endsWith(path.sep) ? realAllowedDir : realAllowedDir + path.sep;
        const normalizedReal = realPath.endsWith(path.sep) ? realPath : realPath + path.sep;
        return normalizedReal.startsWith(normalizedAllowed);
      });

      if (!isRealPathWithinAllowed) {
        return { valid: false, path: null, error: 'Path resolves outside allowed directories via symlink' };
      }
    }
  } catch (err) {
    // realpathSync fails if path doesn't exist - that's ok if mustExist is false
    if (mustExist) {
      return { valid: false, path: null, error: `Failed to resolve real path: ${err.message}` };
    }
  }

  return { valid: true, path: resolvedPath, error: null };
}

/**
 * Validate a plugin directory name
 * Ensures the name is safe for use as a directory name
 *
 * @param {string} name - Directory name to validate
 * @returns {Object} Validation result: { valid: boolean, error: string|null }
 */
function validatePluginName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Plugin name must be a non-empty string' };
  }

  // Trim whitespace
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Plugin name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Plugin name too long (max 100 characters)' };
  }

  // Reserved names that could cause issues - check these first
  const reservedNames = ['node_modules', 'package.json', 'package-lock.json', '.git', '.hg', '.svn'];
  if (reservedNames.includes(trimmed.toLowerCase())) {
    return { valid: false, error: `Plugin name '${trimmed}' is reserved` };
  }

  // Allow: alphanumeric, hyphens, underscores
  // Must start with alphanumeric
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(trimmed)) {
    return { valid: false, error: 'Plugin name must contain only alphanumeric characters, hyphens, and underscores, and must start with alphanumeric' };
  }

  return { valid: true, error: null };
}

export { setSecurePermissions, setSecurePermissionsSync, isValidPath, isSafeToChmod, isSafeToChmodSync, sanitizeWidgetConfig, validateWidgetConfig, WidgetConfigValidator, validatePluginPath, validatePluginName };
export default { setSecurePermissions, setSecurePermissionsSync, isValidPath, isSafeToChmod, isSafeToChmodSync, sanitizeWidgetConfig, validateWidgetConfig, WidgetConfigValidator, validatePluginPath, validatePluginName };
