/**
 * Dashboard Configuration Validator
 * Validates dashboard-settings.json files
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import {
  VALIDATION,
  GATEWAY,
  WEB,
  DEFAULT_SETTINGS,
  PATHS
} from './config.js';

/**
 * Validation result type
 * @typedef {Object} ConfigValidationResult
 * @property {boolean} valid - Whether the config is valid
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 * @property {string[]} info - Array of info messages
 * @property {Object} stats - Validation statistics
 */

/**
 * Validate a config value type
 * @private
 * @param {*} value - The value to check
 * @param {string} expectedType - Expected type
 * @param {string} path - Path in config
 * @returns {string|null} Error message or null
 */
function validateType(value, expectedType, path) {
  if (value === undefined || value === null) {
    return null; // Null/undefined handled separately
  }

  const actualType = Array.isArray(value) ? 'array' : typeof value;

  if (expectedType === 'integer') {
    if (!Number.isInteger(value)) {
      return `'${path}' must be an integer, got ${actualType}`;
    }
    return null;
  }

  if (expectedType === 'port') {
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      return `'${path}' must be a valid port number (1-65535), got ${value}`;
    }
    return null;
  }

  if (actualType !== expectedType) {
    return `'${path}' must be of type ${expectedType}, got ${actualType}`;
  }

  return null;
}

/**
 * Validate gateway endpoint configuration
 * @private
 * @param {Object} endpoint - Endpoint config
 * @param {number} index - Index in array
 * @returns {Object} { errors: string[], warnings: string[] }
 */
function validateGatewayEndpoint(endpoint, index) {
  const errors = [];
  const warnings = [];
  const path = `gatewayEndpoints[${index}]`;

  if (!endpoint || typeof endpoint !== 'object') {
    errors.push(`'${path}' must be an object`);
    return { errors, warnings };
  }

  // Required fields
  if (!('name' in endpoint)) {
    errors.push(`'${path}.name' is required`);
  } else if (typeof endpoint.name === 'string') {
    const nameLen = endpoint.name.length;
    if (nameLen < VALIDATION.ENDPOINT_NAME.MIN_LENGTH) {
      errors.push(`'${path}.name' must be at least ${VALIDATION.ENDPOINT_NAME.MIN_LENGTH} character(s)`);
    }
    if (nameLen > VALIDATION.ENDPOINT_NAME.MAX_LENGTH) {
      errors.push(`'${path}.name' must be at most ${VALIDATION.ENDPOINT_NAME.MAX_LENGTH} characters`);
    }
    if (!VALIDATION.ENDPOINT_NAME.PATTERN.test(endpoint.name)) {
      errors.push(`'${path}.name' must match pattern: ${VALIDATION.ENDPOINT_NAME.PATTERN.source}`);
    }
  }

  if (!('host' in endpoint)) {
    errors.push(`'${path}.host' is required`);
  } else {
    const hostError = validateType(endpoint.host, 'string', `${path}.host`);
    if (hostError) errors.push(hostError);
  }

  if (!('port' in endpoint)) {
    errors.push(`'${path}.port' is required`);
  } else {
    const portError = validateType(endpoint.port, 'port', `${path}.port`);
    if (portError) errors.push(portError);
  }

  // Optional fields
  if ('enabled' in endpoint) {
    const enabledError = validateType(endpoint.enabled, 'boolean', `${path}.enabled`);
    if (enabledError) errors.push(enabledError);
  }

  if ('type' in endpoint) {
    if (!VALIDATION.VALID_ENDPOINT_TYPES.includes(endpoint.type)) {
      errors.push(`'${path}.type' must be one of: ${VALIDATION.VALID_ENDPOINT_TYPES.join(', ')}`);
    }
  }

  if ('token' in endpoint && endpoint.token !== null) {
    const tokenError = validateType(endpoint.token, 'string', `${path}.token`);
    if (tokenError) errors.push(tokenError);
  }

  // Warn about extra fields
  const knownFields = ['name', 'host', 'port', 'enabled', 'type', 'token'];
  const extraFields = Object.keys(endpoint).filter(k => !knownFields.includes(k));
  for (const field of extraFields) {
    warnings.push(`'${path}.${field}' is not a standard endpoint field`);
  }

  return { errors, warnings };
}

/**
 * Validate web interface configuration
 * @private
 * @param {Object} webConfig - Web interface config
 * @returns {Object} { errors: string[], warnings: string[] }
 */
function validateWebInterfaceConfig(webConfig) {
  const errors = [];
  const warnings = [];
  const path = 'webInterface';

  if (!webConfig || typeof webConfig !== 'object') {
    errors.push(`'${path}' must be an object`);
    return { errors, warnings };
  }

  // enabled
  if ('enabled' in webConfig) {
    const err = validateType(webConfig.enabled, 'boolean', `${path}.enabled`);
    if (err) errors.push(err);
  }

  // port
  if ('port' in webConfig) {
    const err = validateType(webConfig.port, 'port', `${path}.port`);
    if (err) errors.push(err);
  }

  // host
  if ('host' in webConfig) {
    const err = validateType(webConfig.host, 'string', `${path}.host`);
    if (err) errors.push(err);
  }

  // cors
  if ('cors' in webConfig) {
    const err = validateType(webConfig.cors, 'boolean', `${path}.cors`);
    if (err) errors.push(err);
  }

  // corsOrigins - can be string or array
  if ('corsOrigins' in webConfig) {
    const origins = webConfig.corsOrigins;
    if (typeof origins !== 'string' && !Array.isArray(origins)) {
      errors.push(`'${path}.corsOrigins' must be a string or array`);
    } else if (Array.isArray(origins)) {
      for (let i = 0; i < origins.length; i++) {
        if (typeof origins[i] !== 'string') {
          errors.push(`'${path}.corsOrigins[${i}]' must be a string`);
        }
      }
    }
  }

  // rateLimit
  if ('rateLimit' in webConfig) {
    const rl = webConfig.rateLimit;
    if (!rl || typeof rl !== 'object') {
      errors.push(`'${path}.rateLimit' must be an object`);
    } else {
      if ('enabled' in rl) {
        const err = validateType(rl.enabled, 'boolean', `${path}.rateLimit.enabled`);
        if (err) errors.push(err);
      }
      if ('windowMs' in rl) {
        const err = validateType(rl.windowMs, 'integer', `${path}.rateLimit.windowMs`);
        if (err) errors.push(err);
        else if (rl.windowMs < 1000) {
          warnings.push(`'${path}.rateLimit.windowMs' is less than 1 second (${rl.windowMs}ms)`);
        }
      }
      if ('maxRequests' in rl) {
        const err = validateType(rl.maxRequests, 'integer', `${path}.rateLimit.maxRequests`);
        if (err) errors.push(err);
        else if (rl.maxRequests < 1) {
          errors.push(`'${path}.rateLimit.maxRequests' must be at least 1`);
        }
      }
    }
  }

  // auth
  if ('auth' in webConfig) {
    const auth = webConfig.auth;
    if (!auth || typeof auth !== 'object') {
      errors.push(`'${path}.auth' must be an object`);
    } else {
      if ('enabled' in auth) {
        const err = validateType(auth.enabled, 'boolean', `${path}.auth.enabled`);
        if (err) errors.push(err);
      }
      if ('keys' in auth) {
        if (!Array.isArray(auth.keys)) {
          errors.push(`'${path}.auth.keys' must be an array`);
        } else {
          for (let i = 0; i < auth.keys.length; i++) {
            const key = auth.keys[i];
            if (!key || typeof key !== 'object') {
              errors.push(`'${path}.auth.keys[${i}]' must be an object`);
            }
          }
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate widget loading configuration
 * @private
 * @param {Object} widgetConfig - Widget loading config
 * @returns {Object} { errors: string[], warnings: string[] }
 */
function validateWidgetLoadingConfig(widgetConfig) {
  const errors = [];
  const warnings = [];
  const path = 'widgetLoading';

  if (!widgetConfig || typeof widgetConfig !== 'object') {
    errors.push(`'${path}' must be an object`);
    return { errors, warnings };
  }

  // enabled
  if ('enabled' in widgetConfig) {
    const err = validateType(widgetConfig.enabled, 'boolean', `${path}.enabled`);
    if (err) errors.push(err);
  }

  // preloadPriority
  if ('preloadPriority' in widgetConfig) {
    if (!Array.isArray(widgetConfig.preloadPriority)) {
      errors.push(`'${path}.preloadPriority' must be an array`);
    } else {
      for (let i = 0; i < widgetConfig.preloadPriority.length; i++) {
        if (typeof widgetConfig.preloadPriority[i] !== 'string') {
          errors.push(`'${path}.preloadPriority[${i}]' must be a string`);
        }
      }
    }
  }

  // lazyLoadDelay
  if ('lazyLoadDelay' in widgetConfig) {
    const err = validateType(widgetConfig.lazyLoadDelay, 'integer', `${path}.lazyLoadDelay`);
    if (err) errors.push(err);
    else if (widgetConfig.lazyLoadDelay < 0) {
      errors.push(`'${path}.lazyLoadDelay' must be non-negative`);
    }
  }

  // maxConcurrent
  if ('maxConcurrent' in widgetConfig) {
    const err = validateType(widgetConfig.maxConcurrent, 'integer', `${path}.maxConcurrent`);
    if (err) errors.push(err);
    else if (widgetConfig.maxConcurrent < 1) {
      errors.push(`'${path}.maxConcurrent' must be at least 1`);
    }
  }

  // autoDiscover
  if ('autoDiscover' in widgetConfig) {
    const err = validateType(widgetConfig.autoDiscover, 'boolean', `${path}.autoDiscover`);
    if (err) errors.push(err);
  }

  return { errors, warnings };
}

/**
 * Validate a dashboard configuration object
 * @param {Object} config - The parsed configuration object
 * @param {Object} options - Validation options
 * @param {boolean} options.strict - Whether to fail on unknown properties
 * @returns {ConfigValidationResult} Validation result
 */
export function validateConfig(config, options = {}) {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];
  const info = [];

  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: ['Config must be a valid JSON object'],
      warnings: [],
      info: [],
      stats: { fieldCount: 0 }
    };
  }

  const fieldCount = Object.keys(config).length;

  // Validate refreshInterval
  if ('refreshInterval' in config) {
    const err = validateType(config.refreshInterval, 'integer', 'refreshInterval');
    if (err) errors.push(err);
    else if (config.refreshInterval < VALIDATION.REFRESH_INTERVAL.MIN) {
      errors.push(`'refreshInterval' must be at least ${VALIDATION.REFRESH_INTERVAL.MIN}ms`);
    } else if (config.refreshInterval > VALIDATION.REFRESH_INTERVAL.MAX) {
      errors.push(`'refreshInterval' must be at most ${VALIDATION.REFRESH_INTERVAL.MAX}ms`);
    }

    // Check if value is in recommended options (1000, 2000, 5000, 10000ms)
    const standardOptions = [1000, 2000, 5000, 10000];
    if (!standardOptions.includes(config.refreshInterval)) {
      const closest = standardOptions.reduce((prev, curr) =>
        Math.abs(curr - config.refreshInterval) < Math.abs(prev - config.refreshInterval) ? curr : prev
      );
      info.push(`'refreshInterval' value ${config.refreshInterval}ms is not standard. Closest: ${closest}ms`);
    }
  }

  // Validate logLevelFilter
  if ('logLevelFilter' in config) {
    if (!VALIDATION.VALID_LOG_LEVELS.includes(config.logLevelFilter)) {
      errors.push(`'logLevelFilter' must be one of: ${VALIDATION.VALID_LOG_LEVELS.join(', ')}`);
    }
  }

  // Validate sessionSortMode
  if ('sessionSortMode' in config) {
    if (!VALIDATION.VALID_SORT_MODES.includes(config.sessionSortMode)) {
      errors.push(`'sessionSortMode' must be one of: ${VALIDATION.VALID_SORT_MODES.join(', ')}`);
    }
  }

  // Validate theme
  if ('theme' in config) {
    if (!VALIDATION.VALID_THEMES.includes(config.theme)) {
      errors.push(`'theme' must be one of: ${VALIDATION.VALID_THEMES.join(', ')}`);
    }
  }

  // Validate exportFormat
  if ('exportFormat' in config) {
    if (!VALIDATION.VALID_EXPORT_FORMATS.includes(config.exportFormat)) {
      errors.push(`'exportFormat' must be one of: ${VALIDATION.VALID_EXPORT_FORMATS.join(', ')}`);
    }
  }

  // Validate boolean showWidget fields
  for (let i = 1; i <= 8; i++) {
    const field = `showWidget${i}`;
    if (field in config) {
      const err = validateType(config[field], 'boolean', field);
      if (err) errors.push(err);
    }
  }

  // Validate showPerformanceMetrics
  if ('showPerformanceMetrics' in config) {
    const err = validateType(config.showPerformanceMetrics, 'boolean', 'showPerformanceMetrics');
    if (err) errors.push(err);
  }

  // Validate firstRun
  if ('firstRun' in config) {
    const err = validateType(config.firstRun, 'boolean', 'firstRun');
    if (err) errors.push(err);
  }

  // Validate showFavoritesOnly
  if ('showFavoritesOnly' in config) {
    const err = validateType(config.showFavoritesOnly, 'boolean', 'showFavoritesOnly');
    if (err) errors.push(err);
  }

  // Validate favorites
  if ('favorites' in config) {
    if (!config.favorites || typeof config.favorites !== 'object') {
      errors.push('\'favorites\' must be an object');
    }
  }

  // Validate gatewayEndpoints
  if ('gatewayEndpoints' in config) {
    if (!Array.isArray(config.gatewayEndpoints)) {
      errors.push('\'gatewayEndpoints\' must be an array');
    } else {
      if (config.gatewayEndpoints.length === 0) {
        warnings.push('\'gatewayEndpoints\' is empty - no endpoints configured');
      }
      if (config.gatewayEndpoints.length > GATEWAY.MAX_ENDPOINTS) {
        errors.push(`'gatewayEndpoints' exceeds maximum of ${GATEWAY.MAX_ENDPOINTS} endpoints`);
      }
      for (let i = 0; i < config.gatewayEndpoints.length; i++) {
        const result = validateGatewayEndpoint(config.gatewayEndpoints[i], i);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }
  }

  // Validate activeGatewayEndpoint
  if ('activeGatewayEndpoint' in config) {
    const err = validateType(config.activeGatewayEndpoint, 'string', 'activeGatewayEndpoint');
    if (err) errors.push(err);
  }

  // Validate webInterface
  if ('webInterface' in config) {
    const result = validateWebInterfaceConfig(config.webInterface);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  // Validate widgetLoading
  if ('widgetLoading' in config) {
    const result = validateWidgetLoadingConfig(config.widgetLoading);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  // Validate plugins
  if ('plugins' in config) {
    if (!config.plugins || typeof config.plugins !== 'object') {
      errors.push('\'plugins\' must be an object');
    } else {
      const pluginCount = Object.keys(config.plugins).length;
      if (pluginCount > 0) {
        info.push(`Found configuration for ${pluginCount} plugin(s)`);
      }
    }
  }

  // Validate exportDirectory
  if ('exportDirectory' in config) {
    const err = validateType(config.exportDirectory, 'string', 'exportDirectory');
    if (err) errors.push(err);
  }

  // Validate sessionSearchQuery
  if ('sessionSearchQuery' in config) {
    const err = validateType(config.sessionSearchQuery, 'string', 'sessionSearchQuery');
    if (err) errors.push(err);
  }

  // Check for unknown properties in strict mode
  if (strict) {
    const knownProps = Object.keys(DEFAULT_SETTINGS);
    for (const key of Object.keys(config)) {
      if (!knownProps.includes(key)) {
        errors.push(`Unknown property: '${key}'`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    stats: { fieldCount }
  };
}

/**
 * Validate a configuration file
 * @param {string} filePath - Path to the configuration file
 * @param {Object} options - Validation options
 * @returns {ConfigValidationResult} Validation result
 */
export function validateConfigFile(filePath, options = {}) {
  const resolvedPath = resolve(filePath);

  if (!existsSync(resolvedPath)) {
    return {
      valid: false,
      errors: [`File not found: ${resolvedPath}`],
      warnings: [],
      info: [],
      stats: { fieldCount: 0 }
    };
  }

  let config;
  try {
    const content = readFileSync(resolvedPath, 'utf8');
    config = JSON.parse(content);
  } catch (err) {
    return {
      valid: false,
      errors: [`Failed to parse JSON: ${err.message}`],
      warnings: [],
      info: [],
      stats: { fieldCount: 0 }
    };
  }

  return validateConfig(config, options);
}

/**
 * Format validation results for display
 * @param {ConfigValidationResult} result - The validation result
 * @param {string} configPath - Optional config file path for context
 * @returns {string} Formatted output
 */
export function formatConfigValidationResult(result, configPath = '') {
  const lines = [];
  const name = configPath ? ` ${configPath} ` : ' ';

  if (result.valid) {
    lines.push(`✓ Configuration${name}is valid`);
  } else {
    lines.push(`✗ Configuration${name}validation failed`);
  }

  if (result.stats?.fieldCount !== undefined) {
    lines.push(`  ${result.stats.fieldCount} field(s) checked`);
  }

  if (result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    result.errors.forEach(err => lines.push(`  ✗ ${err}`));
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    result.warnings.forEach(warn => lines.push(`  ⚠ ${warn}`));
  }

  if (result.info.length > 0) {
    lines.push('');
    lines.push('Info:');
    result.info.forEach(i => lines.push(`  ℹ ${i}`));
  }

  return lines.join('\n');
}

/**
 * Get default config path
 * @returns {string} Default configuration file path
 */
export function getDefaultConfigPath() {
  return PATHS.SETTINGS;
}

export default {
  validateConfig,
  validateConfigFile,
  formatConfigValidationResult,
  getDefaultConfigPath
};
