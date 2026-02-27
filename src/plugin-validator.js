/**
 * Plugin Manifest Validator
 * Validates plugin.json files against the JSON Schema
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the schema
const SCHEMA_PATH = resolve(__dirname, '../schemas/plugin-manifest.json');
let schema = null;

try {
  if (existsSync(SCHEMA_PATH)) {
    const schemaContent = readFileSync(SCHEMA_PATH, 'utf8');
    schema = JSON.parse(schemaContent);
  }
} catch (err) {
  console.warn(`Failed to load plugin schema: ${err.message}`);
}

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the manifest is valid
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 * @property {string[]} info - Array of info messages
 */

/**
 * Validate a value against a schema property
 * @private
 * @param {*} value - The value to validate
 * @param {Object} propSchema - The property schema
 * @param {string} path - The current path in the object
 * @returns {string[]} Array of error messages
 */
function validateProperty(value, propSchema, path) {
  const errors = [];

  if (value === undefined) {
    // Check if required (handled at object level)
    return errors;
  }

  // Type validation
  if (propSchema.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== propSchema.type) {
      // Special case for numbers (can be strings that parse as numbers)
      if (propSchema.type === 'number' && !isNaN(Number(value))) {
        // OK
      } else {
        errors.push(`'${path}' must be of type ${propSchema.type}, got ${actualType}`);
        return errors;
      }
    }
  }

  // String validations
  if (propSchema.type === 'string' && typeof value === 'string') {
    if (propSchema.minLength !== undefined && value.length < propSchema.minLength) {
      errors.push(`'${path}' must be at least ${propSchema.minLength} characters`);
    }
    if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength) {
      errors.push(`'${path}' must be at most ${propSchema.maxLength} characters`);
    }
    if (propSchema.pattern) {
      const regex = new RegExp(propSchema.pattern);
      if (!regex.test(value)) {
        errors.push(`'${path}' does not match required pattern: ${propSchema.pattern}`);
      }
    }
    if (propSchema.enum && !propSchema.enum.includes(value)) {
      errors.push(`'${path}' must be one of: ${propSchema.enum.join(', ')}`);
    }
  }

  // Number validations
  if (propSchema.type === 'number' && typeof value === 'number') {
    if (propSchema.minimum !== undefined && value < propSchema.minimum) {
      errors.push(`'${path}' must be at least ${propSchema.minimum}`);
    }
    if (propSchema.maximum !== undefined && value > propSchema.maximum) {
      errors.push(`'${path}' must be at most ${propSchema.maximum}`);
    }
  }

  // Array validations
  if (propSchema.type === 'array' && Array.isArray(value)) {
    if (propSchema.items) {
      value.forEach((item, index) => {
        const itemErrors = validateProperty(item, propSchema.items, `${path}[${index}]`);
        errors.push(...itemErrors);
      });
    }
    if (propSchema.uniqueItems) {
      const uniqueSet = new Set(value.map(JSON.stringify));
      if (uniqueSet.size !== value.length) {
        errors.push(`'${path}' must have unique items`);
      }
    }
  }

  // Object validations
  if (propSchema.type === 'object' && typeof value === 'object' && !Array.isArray(value)) {
    if (propSchema.properties) {
      for (const [key, subSchema] of Object.entries(propSchema.properties)) {
        const subErrors = validateProperty(value[key], subSchema, `${path}.${key}`);
        errors.push(...subErrors);
      }
    }
  }

  return errors;
}

/**
 * Validate a plugin manifest against the schema
 * @param {Object} manifest - The parsed plugin.json object
 * @param {Object} options - Validation options
 * @param {boolean} options.strict - Whether to fail on unknown properties
 * @returns {ValidationResult} Validation result
 */
export function validateManifest(manifest, options = {}) {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];
  const info = [];

  if (!manifest || typeof manifest !== 'object') {
    return {
      valid: false,
      errors: ['Manifest must be a valid JSON object'],
      warnings,
      info
    };
  }

  if (!schema) {
    return {
      valid: true,
      errors: [],
      warnings: ['Schema not loaded, skipping validation'],
      info: ['Manifest structure was not validated']
    };
  }

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in manifest)) {
        errors.push(`Missing required field: '${field}'`);
      }
    }
  }

  // Validate properties
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in manifest) {
        const propErrors = validateProperty(manifest[key], propSchema, key);
        errors.push(...propErrors);
      }
    }
  }

  // Check for unknown properties in strict mode
  if (strict && schema.additionalProperties === false) {
    const knownProps = Object.keys(schema.properties || {});
    for (const key of Object.keys(manifest)) {
      if (!knownProps.includes(key)) {
        errors.push(`Unknown property: '${key}'`);
      }
    }
  }

  // Add warnings for deprecated fields
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (propSchema.deprecated && key in manifest) {
        warnings.push(`Field '${key}' is deprecated: ${propSchema.description}`);
      }
    }
  }

  // Add info messages for optional fields with defaults
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (!(key in manifest) && 'default' in propSchema) {
        info.push(`Using default value for '${key}': ${JSON.stringify(propSchema.default)}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

/**
 * Validate a plugin manifest from a file path
 * @param {string} filePath - Path to the plugin.json file
 * @param {Object} options - Validation options
 * @returns {ValidationResult} Validation result
 */
export function validateManifestFile(filePath, options = {}) {
  const resolvedPath = resolve(filePath);

  if (!existsSync(resolvedPath)) {
    return {
      valid: false,
      errors: [`File not found: ${resolvedPath}`],
      warnings: [],
      info: []
    };
  }

  let manifest;
  try {
    const content = readFileSync(resolvedPath, 'utf8');
    manifest = JSON.parse(content);
  } catch (err) {
    return {
      valid: false,
      errors: [`Failed to parse JSON: ${err.message}`],
      warnings: [],
      info: []
    };
  }

  return validateManifest(manifest, options);
}

/**
 * Format validation results for display
 * @param {ValidationResult} result - The validation result
 * @param {string} pluginName - Optional plugin name for context
 * @returns {string} Formatted output
 */
export function formatValidationResult(result, pluginName = '') {
  const lines = [];
  const name = pluginName ? ` ${pluginName} ` : '';

  if (result.valid) {
    lines.push(`✓ Plugin${name}is valid`);
  } else {
    lines.push(`✗ Plugin${name}validation failed`);
  }

  if (result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    result.errors.forEach(err => lines.push(`  • ${err}`));
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    result.warnings.forEach(warn => lines.push(`  • ${warn}`));
  }

  if (result.info.length > 0) {
    lines.push('');
    lines.push('Info:');
    result.info.forEach(i => lines.push(`  • ${i}`));
  }

  return lines.join('\n');
}

export default {
  validateManifest,
  validateManifestFile,
  formatValidationResult
};
