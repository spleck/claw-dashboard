/**
 * Plugin manifest validation module
 * Validates plugin.json files against the JSON Schema
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the schema
const schemaPath = join(__dirname, '..', 'schemas', 'plugin-manifest.json');
let schema;

try {
  schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
} catch (err) {
  throw new Error(`Failed to load plugin manifest schema: ${err.message}`);
}

/**
 * Validates a value against a JSON Schema type
 * @param {*} value - Value to validate
 * @param {string} type - Expected type
 * @returns {boolean}
 */
function validateType(value, type) {
  if (type === 'string') return typeof value === 'string';
  if (type === 'number') return typeof value === 'number' && !isNaN(value);
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
  if (type === 'array') return Array.isArray(value);
  return true;
}

/**
 * Validates a string against a regex pattern
 * @param {string} value - Value to validate
 * @param {string} pattern - Regex pattern
 * @returns {boolean}
 */
function validatePattern(value, pattern) {
  const regex = new RegExp(pattern);
  return regex.test(value);
}

/**
 * Validates semantic version format
 * @param {string} version - Version string
 * @returns {boolean}
 */
function validateSemver(version) {
  const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return semverPattern.test(version);
}

/**
 * Validates a plugin ID format
 * @param {string} id - Plugin ID
 * @returns {boolean}
 */
function validatePluginId(id) {
  const idPattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;
  return idPattern.test(id);
}

/**
 * Validates a plugin manifest against the schema
 * @param {object} manifest - Plugin manifest to validate
 * @returns {object} Validation result with { valid: boolean, errors: string[] }
 */
export function validateManifest(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be a valid object'] };
  }

  // Check required fields
  const required = schema.required || [];
  for (const field of required) {
    if (!(field in manifest)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate each property
  const properties = schema.properties || {};
  for (const [key, value] of Object.entries(manifest)) {
    const propSchema = properties[key];
    if (!propSchema) {
      if (schema.additionalProperties === false) {
        errors.push(`Unknown property: ${key}`);
      }
      continue;
    }

    // Type validation
    if (propSchema.type && !validateType(value, propSchema.type)) {
      errors.push(`Invalid type for ${key}: expected ${propSchema.type}, got ${typeof value}`);
      continue;
    }

    // String validations
    if (propSchema.type === 'string') {
      if (propSchema.minLength !== undefined && value.length < propSchema.minLength) {
        errors.push(`${key} must be at least ${propSchema.minLength} characters`);
      }
      if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength) {
        errors.push(`${key} must be at most ${propSchema.maxLength} characters`);
      }
      if (propSchema.pattern && !validatePattern(value, propSchema.pattern)) {
        errors.push(`${key} format is invalid`);
      }
    }

    // Number validations
    if (propSchema.type === 'number') {
      if (propSchema.minimum !== undefined && value < propSchema.minimum) {
        errors.push(`${key} must be at least ${propSchema.minimum}`);
      }
      if (propSchema.maximum !== undefined && value > propSchema.maximum) {
        errors.push(`${key} must be at most ${propSchema.maximum}`);
      }
    }

    // Array validations
    if (propSchema.type === 'array' && Array.isArray(value)) {
      if (propSchema.uniqueItems) {
        const uniqueValues = new Set(value);
        if (uniqueValues.size !== value.length) {
          errors.push(`${key} contains duplicate values`);
        }
      }
      if (propSchema.items) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (propSchema.items.type && !validateType(item, propSchema.items.type)) {
            errors.push(`${key}[${i}] must be of type ${propSchema.items.type}`);
          }
          if (propSchema.items.pattern && !validatePattern(item, propSchema.items.pattern)) {
            errors.push(`${key}[${i}] format is invalid`);
          }
          if (propSchema.items.enum && !propSchema.items.enum.includes(item)) {
            errors.push(`${key}[${i}] must be one of: ${propSchema.items.enum.join(', ')}`);
          }
        }
      }
    }

    // Enum validation
    if (propSchema.enum && !propSchema.enum.includes(value)) {
      errors.push(`${key} must be one of: ${propSchema.enum.join(', ')}`);
    }
  }

  // Semantic version validation for the version field
  if (manifest.version && typeof manifest.version === 'string') {
    if (!validateSemver(manifest.version)) {
      errors.push('version must be a valid semantic version (e.g., 1.0.0)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a plugin ID
 * @param {string} id - Plugin ID to validate
 * @returns {object} Validation result
 */
export function validatePluginIdFormat(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'Plugin ID must be a non-empty string' };
  }
  if (!validatePluginId(id)) {
    return {
      valid: false,
      error: 'Plugin ID must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with a hyphen/underscore',
    };
  }
  if (id.length > 64) {
    return { valid: false, error: 'Plugin ID must be 64 characters or less' };
  }
  return { valid: true };
}

/**
 * Generates a default manifest with common fields
 * @param {string} id - Plugin ID
 * @param {object} options - Additional options
 * @returns {object} Default manifest
 */
export function generateDefaultManifest(id, options = {}) {
  const { name, description, author } = options;

  return {
    id,
    name: name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: description || 'A custom widget plugin for Claw Dashboard',
    version: '1.0.0',
    author: author || '',
    category: 'custom',
    type: 'widget',
    lazyLoad: true,
    priority: 100,
    config: {
      refreshInterval: 5000,
    },
    __version: 1,
  };
}

export default { validateManifest, validatePluginIdFormat, generateDefaultManifest };
