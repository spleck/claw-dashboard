/**
 * Widget Configuration Processor
 * Handles environment variable interpolation, config versioning, and migration
 */

import logger from '../logger.js';

/**
 * Default configuration processing options
 */
export const DEFAULT_PROCESSING_OPTIONS = {
  interpolateEnv: true,
  supportLegacy: true,
  validateVersion: true,
  throwOnError: false,
};

/**
 * Interpolate environment variables in config values
 * Supports ${ENV_VAR} and ${ENV_VAR:-default} syntax
 *
 * @param {string} value - String value to interpolate
 * @param {Object} env - Environment variables object (defaults to process.env)
 * @returns {string} Interpolated value
 */
export function interpolateEnvVars(value, env = process.env) {
  if (typeof value !== 'string') {
    return value;
  }

  // Match ${VAR} or ${VAR:-default} patterns
  const pattern = /\$\{([^}]+)\}/g;

  return value.replace(pattern, (match, content) => {
    // Check for default value syntax: VAR:-default
    const colonIndex = content.indexOf(':-');

    if (colonIndex !== -1) {
      const varName = content.substring(0, colonIndex);
      const defaultValue = content.substring(colonIndex + 2);
      return env[varName] !== undefined ? env[varName] : defaultValue;
    }

    // Simple variable substitution
    return env[content] !== undefined ? env[content] : match;
  });
}

/**
 * Deep process config object, interpolating env vars in all string values
 *
 * @param {*} config - Config value (any type)
 * @param {Object} env - Environment variables
 * @param {Set} visited - Track visited objects to prevent circular reference issues
 * @returns {*} Processed config
 */
export function processConfigValues(config, env = process.env, visited = new Set()) {
  // Handle null/undefined
  if (config === null || config === undefined) {
    return config;
  }

  // Handle strings - interpolate env vars
  if (typeof config === 'string') {
    return interpolateEnvVars(config, env);
  }

  // Handle arrays
  if (Array.isArray(config)) {
    return config.map(item => processConfigValues(item, env, visited));
  }

  // Handle objects (but not dates, regexps, etc)
  if (typeof config === 'object' && config.constructor === Object) {
    // Prevent circular references
    if (visited.has(config)) {
      logger.warn('Circular reference detected in config, skipping');
      return config;
    }
    visited.add(config);

    const result = {};
    for (const [key, value] of Object.entries(config)) {
      result[key] = processConfigValues(value, env, visited);
    }
    visited.delete(config);
    return result;
  }

  // Return primitives as-is
  return config;
}

/**
 * Config version information
 */
export const CONFIG_VERSION = {
  CURRENT: '1.0.0',
  MIN_SUPPORTED: '1.0.0',
};

/**
 * Parse version string to comparable array
 * @param {string} version - Semver version string
 * @returns {number[]} [major, minor, patch]
 */
function parseVersion(version) {
  const parts = version.split('.').map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Compare two versions
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1, v2) {
  const a = parseVersion(v1);
  const b = parseVersion(v2);

  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

/**
 * Config migration registry
 * Maps version ranges to migration functions
 */
const migrations = new Map();

/**
 * Register a config migration
 * @param {string} fromVersion - Source version (exact match or 'x.x.x' for any)
 * @param {string} toVersion - Target version
 * @param {Function} migrateFn - Migration function: (config) => migratedConfig
 */
export function registerMigration(fromVersion, toVersion, migrateFn) {
  const key = `${fromVersion}→${toVersion}`;
  migrations.set(key, {
    fromVersion,
    toVersion,
    migrate: migrateFn,
  });
  logger.debug(`Registered config migration: ${key}`);
}

/**
 * Find migration path from source to target version
 * Uses simple greedy algorithm - for complex cases, explicit migration chains should be registered
 *
 * @param {string} fromVersion - Starting version
 * @param {string} toVersion - Target version
 * @returns {Array} Array of migration steps
 */
function findMigrationPath(fromVersion, toVersion) {
  // Same version - no migration needed
  if (fromVersion === toVersion) {
    return [];
  }

  // Look for direct migration
  const directKey = `${fromVersion}→${toVersion}`;
  if (migrations.has(directKey)) {
    return [migrations.get(directKey)];
  }

  // Look for wildcard migration from this version
  for (const [key, migration] of migrations) {
    if (migration.fromVersion === fromVersion) {
      // Found a step, recursively find rest of path
      const remainingPath = findMigrationPath(migration.toVersion, toVersion);
      if (remainingPath !== null) {
        return [migration, ...remainingPath];
      }
    }
  }

  // No migration path found
  return null;
}

/**
 * Validate config version against supported range
 * @param {Object} config - Widget configuration
 * @returns {Object} Validation result { valid: boolean, error?: string, migrated?: boolean }
 */
export function validateConfigVersion(config) {
  const configVersion = config?.__version || '1.0.0';

  // Check minimum supported version
  if (compareVersions(configVersion, CONFIG_VERSION.MIN_SUPPORTED) < 0) {
    return {
      valid: false,
      error: `Config version ${configVersion} is below minimum supported ${CONFIG_VERSION.MIN_SUPPORTED}`,
    };
  }

  // Check maximum (future) version
  if (compareVersions(configVersion, CONFIG_VERSION.CURRENT) > 0) {
    return {
      valid: false,
      error: `Config version ${configVersion} is newer than current ${CONFIG_VERSION.CURRENT}. Please upgrade the dashboard.`,
    };
  }

  return { valid: true, version: configVersion };
}

/**
 * Migrate config to current version
 * @param {Object} config - Widget configuration
 * @param {string} targetVersion - Target version (defaults to CURRENT)
 * @returns {Object} Migration result { success: boolean, config?: Object, error?: string, path?: string[] }
 */
export function migrateConfig(config, targetVersion = CONFIG_VERSION.CURRENT) {
  if (!config || typeof config !== 'object') {
    return { success: false, error: 'Invalid config object' };
  }

  const sourceVersion = config.__version || '1.0.0';

  // No migration needed
  if (sourceVersion === targetVersion) {
    return { success: true, config, path: [] };
  }

  // Find migration path
  const migrationPath = findMigrationPath(sourceVersion, targetVersion);

  if (migrationPath === null) {
    return {
      success: false,
      error: `No migration path from ${sourceVersion} to ${targetVersion}`,
    };
  }

  // Apply migrations
  let migratedConfig = { ...config };
  const path = [];

  try {
    for (const migration of migrationPath) {
      migratedConfig = migration.migrate(migratedConfig);
      migratedConfig.__version = migration.toVersion;
      path.push(`${migration.fromVersion}→${migration.toVersion}`);
    }

    return {
      success: true,
      config: migratedConfig,
      path,
    };
  } catch (err) {
    return {
      success: false,
      error: `Migration failed: ${err.message}`,
      path,
    };
  }
}

/**
 * Process widget configuration
 * Applies env interpolation, version validation, and migration
 *
 * @param {Object} config - Raw widget configuration
 * @param {Object} options - Processing options
 * @returns {Object} Processing result { success: boolean, config?: Object, error?: string, warnings?: string[] }
 */
export function processWidgetConfig(config, options = {}) {
  const opts = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
  const warnings = [];

  try {
    let processedConfig = config;

    // Validate and migrate version
    if (opts.validateVersion) {
      const validation = validateConfigVersion(processedConfig);
      if (!validation.valid) {
        // Try to migrate if version is old
        if (validation.error?.includes('below minimum')) {
          if (opts.throwOnError) {
            throw new Error(validation.error);
          }
          return { success: false, error: validation.error };
        }

        // Version is newer than current - can't migrate forward
        if (opts.throwOnError) {
          throw new Error(validation.error);
        }
        return { success: false, error: validation.error };
      }

      // Migrate if needed
      if (validation.version !== CONFIG_VERSION.CURRENT) {
        const migration = migrateConfig(processedConfig);
        if (!migration.success) {
          if (opts.throwOnError) {
            throw new Error(migration.error);
          }
          warnings.push(`Config migration failed: ${migration.error}`);
        } else {
          processedConfig = migration.config;
          if (migration.path?.length > 0) {
            warnings.push(`Migrated config: ${migration.path.join(', ')}`);
          }
        }
      }
    }

    // Interpolate environment variables
    if (opts.interpolateEnv) {
      processedConfig = processConfigValues(processedConfig);
    }

    return {
      success: true,
      config: processedConfig,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (err) {
    const error = `Config processing failed: ${err.message}`;
    if (opts.throwOnError) {
      throw err;
    }
    return { success: false, error };
  }
}

/**
 * Extract environment variable requirements from config
 * Useful for documentation and validation
 *
 * @param {*} config - Config value
 * @param {Set} found - Set to collect found variables
 * @returns {Array} Array of { name, hasDefault, defaultValue } objects
 */
export function extractEnvRequirements(config, found = new Set()) {
  const requirements = [];

  function extract(value) {
    if (typeof value === 'string') {
      const pattern = /\$\{([^}]+)\}/g;
      let match;
      while ((match = pattern.exec(value)) !== null) {
        const content = match[1];
        const colonIndex = content.indexOf(':-');

        if (colonIndex !== -1) {
          const varName = content.substring(0, colonIndex);
          const defaultValue = content.substring(colonIndex + 2);
          if (!found.has(varName)) {
            found.add(varName);
            requirements.push({ name: varName, hasDefault: true, defaultValue });
          }
        } else {
          if (!found.has(content)) {
            found.add(content);
            requirements.push({ name: content, hasDefault: false });
          }
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(extract);
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      Object.values(value).forEach(extract);
    }
  }

  extract(config);
  return requirements;
}

/**
 * Create a config preprocessor for widget loader integration
 * @param {Object} options - Processing options
 * @returns {Function} Preprocessor function
 */
export function createConfigPreprocessor(options = {}) {
  return (config) => processWidgetConfig(config, options);
}

export default {
  interpolateEnvVars,
  processConfigValues,
  processWidgetConfig,
  validateConfigVersion,
  migrateConfig,
  registerMigration,
  compareVersions,
  extractEnvRequirements,
  createConfigPreprocessor,
  CONFIG_VERSION,
  DEFAULT_PROCESSING_OPTIONS,
};
