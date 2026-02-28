/**
 * Plugin Error Module
 * Provides enhanced error messages with helpful suggestions for common plugin mistakes
 * @module plugin-errors
 */

import { DashboardError } from './errors.js';

/**
 * Plugin error codes for common mistakes
 */
export const PLUGIN_ERROR_CODES = {
  // Manifest errors
  MANIFEST_NOT_FOUND: 'PLUGIN_MANIFEST_NOT_FOUND',
  MANIFEST_INVALID_JSON: 'PLUGIN_MANIFEST_INVALID_JSON',
  MANIFEST_MISSING_FIELD: 'PLUGIN_MANIFEST_MISSING_FIELD',
  MANIFEST_INVALID_FIELD: 'PLUGIN_MANIFEST_INVALID_FIELD',
  MANIFEST_SCHEMA_ERROR: 'PLUGIN_MANIFEST_SCHEMA_ERROR',

  // Entry point errors
  ENTRY_NOT_FOUND: 'PLUGIN_ENTRY_NOT_FOUND',
  ENTRY_NO_EXPORT: 'PLUGIN_ENTRY_NO_EXPORT',
  ENTRY_INVALID_EXPORT: 'PLUGIN_ENTRY_INVALID_EXPORT',
  ENTRY_RUNTIME_ERROR: 'PLUGIN_ENTRY_RUNTIME_ERROR',

  // Widget class errors
  WIDGET_MISSING_METHODS: 'PLUGIN_WIDGET_MISSING_METHODS',
  WIDGET_NOT_A_CLASS: 'PLUGIN_WIDGET_NOT_A_CLASS',
  WIDGET_CONSTRUCTOR_ERROR: 'PLUGIN_WIDGET_CONSTRUCTOR_ERROR',

  // Security errors
  PATH_INVALID: 'PLUGIN_PATH_INVALID',
  NAME_INVALID: 'PLUGIN_NAME_INVALID',

  // Config errors
  CONFIG_INVALID: 'PLUGIN_CONFIG_INVALID',
  CONFIG_PROCESSING_ERROR: 'PLUGIN_CONFIG_PROCESSING_ERROR',

  // Dependency errors
  DEPENDENCY_MISSING: 'PLUGIN_DEPENDENCY_MISSING',
  DEPENDENCY_VERSION_MISMATCH: 'PLUGIN_DEPENDENCY_VERSION_MISMATCH',
  DEPENDENCY_CIRCULAR: 'PLUGIN_DEPENDENCY_CIRCULAR',

  // General errors
  PLUGIN_LOAD_ERROR: 'PLUGIN_LOAD_ERROR',
  PLUGIN_INIT_ERROR: 'PLUGIN_INIT_ERROR',
};

/**
 * Error suggestions database - maps error patterns to helpful messages
 */
const ERROR_SUGGESTIONS = {
  // Manifest suggestions
  [PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND]: {
    suggestion: 'Create a plugin.json file in your plugin directory',
    docs: 'https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#plugin-structure',
    example: `{
  "id": "my-widget",
  "name": "My Widget",
  "description": "A custom widget",
  "version": "1.0.0",
  "type": "widget",
  "category": "custom"
}`,
  },

  [PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON]: {
    suggestion: 'Fix the JSON syntax in your plugin.json file',
    commonCauses: [
      'Trailing commas after the last property',
      'Missing quotes around property names or string values',
      'Unclosed brackets or braces',
      'Comments (JSON does not support comments)',
    ],
    fix: 'Use a JSON linter or validator to find the syntax error',
  },

  [PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD]: {
    suggestion: 'Add the required field to your plugin.json',
    requiredFields: ['id', 'name', 'version', 'type'],
    docs: 'https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#manifest-schema',
  },

  [PLUGIN_ERROR_CODES.MANIFEST_INVALID_FIELD]: {
    suggestion: 'Correct the invalid field in your plugin.json',
    commonFixes: {
      id: 'Must contain only letters, numbers, hyphens, and underscores (cannot start/end with hyphen/underscore)',
      version: 'Must follow semantic versioning (e.g., "1.0.0", "2.1.0-beta.1")',
      type: 'Must be "widget" (currently the only supported type)',
      category: 'Must be one of: system, monitoring, custom, example',
      priority: 'Must be a number between 0 and 1000',
    },
  },

  // Entry point suggestions
  [PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND]: {
    suggestion: 'Create an index.js file in your plugin directory',
    docs: 'https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#widget-structure',
    example: `import { BaseWidget } from 'claw-dashboard/widgets';

export default class MyWidget extends BaseWidget {
  async init() { return true; }
  async create(screen, theme) { /* create UI */ }
  async getData() { return { value: 42 }; }
  render(data) { /* render data */ }
  async destroy() { /* cleanup */ }
}`,
  },

  [PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT]: {
    suggestion: 'Export your widget class from index.js',
    options: [
      'Use default export: export default class MyWidget extends BaseWidget { ... }',
      'Use named export: export class Widget extends BaseWidget { ... }',
    ],
    docs: 'https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md#export-formats',
  },

  [PLUGIN_ERROR_CODES.ENTRY_INVALID_EXPORT]: {
    suggestion: 'Your index.js must export a valid class or constructor function',
    commonMistakes: [
      'Exporting an object literal instead of a class',
      'Forgetting to import BaseWidget',
      'Exporting a plain function instead of a class',
    ],
    fix: 'Ensure you export a class that extends BaseWidget',
  },

  [PLUGIN_ERROR_CODES.ENTRY_RUNTIME_ERROR]: {
    suggestion: 'Fix the runtime error in your widget code',
    tips: [
      'Check for syntax errors in your JavaScript',
      'Ensure all imported modules are installed: npm install <dependency>',
      'Check for undefined variables or misspelled function names',
      'Make sure you are using ES modules syntax (import/export)',
    ],
  },

  // Widget class suggestions
  [PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS]: {
    suggestion: 'Add the required methods to your widget class',
    requiredMethods: ['render', 'getData'],
    optionalMethods: ['init', 'create', 'destroy'],
    example: `class MyWidget extends BaseWidget {
  // Required
  async getData() {
    return { value: 123 };
  }

  render(data) {
    if (this.box) {
      this.box.setContent(String(data.value));
    }
  }

  // Optional but recommended
  async init() { return true; }
  async create(screen, theme) { /* create blessed elements */ }
  async destroy() { /* cleanup */ }
}`,
  },

  [PLUGIN_ERROR_CODES.WIDGET_NOT_A_CLASS]: {
    suggestion: 'Your widget must be a class that extends BaseWidget',
    example: `import { BaseWidget } from 'claw-dashboard/widgets';

export default class MyWidget extends BaseWidget {
  constructor(options) {
    super(options);
    // your initialization
  }
}`,
  },

  [PLUGIN_ERROR_CODES.WIDGET_CONSTRUCTOR_ERROR]: {
    suggestion: 'Fix the error in your widget constructor',
    tips: [
      'Remember to call super(options) before accessing this',
      'Ensure constructor arguments match the expected signature',
      'Check for null/undefined values in your constructor logic',
    ],
  },

  // Security suggestions
  [PLUGIN_ERROR_CODES.PATH_INVALID]: {
    suggestion: 'Use a valid plugin path within the allowed directory',
    rules: [
      'Plugin paths cannot contain ".." (directory traversal)',
      'Plugin paths must be within ~/.openclaw/plugins/ or the configured plugins directory',
      'Plugin names must be alphanumeric with hyphens/underscores only',
    ],
  },

  [PLUGIN_ERROR_CODES.NAME_INVALID]: {
    suggestion: 'Use a valid plugin name',
    rules: [
      'Must start and end with alphanumeric character',
      'Can contain letters, numbers, hyphens (-), and underscores (_)',
      'Cannot contain spaces or special characters',
      'Examples: "my-widget", "cpu_monitor", "plugin1"',
    ],
  },

  // Config suggestions
  [PLUGIN_ERROR_CODES.CONFIG_INVALID]: {
    suggestion: 'Fix the config in your plugin.json',
    tips: [
      'Config must be a valid JSON object',
      'Property names must be quoted in JSON',
      'Check for proper nesting of objects and arrays',
    ],
  },

  // Dependency suggestions
  [PLUGIN_ERROR_CODES.DEPENDENCY_MISSING]: {
    suggestion: 'Install the missing dependency',
    options: [
      'Install the missing plugin to ~/.openclaw/plugins/',
      'Add the dependency to your plugin\'s dependencies array in plugin.json',
      'Remove the dependency from your plugin if not needed',
    ],
  },

  [PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR]: {
    suggestion: 'Remove circular dependencies between plugins',
    example: 'If Plugin A depends on Plugin B, Plugin B cannot depend on Plugin A',
  },

  // General suggestions
  [PLUGIN_ERROR_CODES.PLUGIN_LOAD_ERROR]: {
    suggestion: 'Check the plugin documentation and examples',
    docs: 'https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md',
    examples: 'See example plugins in examples/plugins/ directory',
  },
};

/**
 * PluginError - Enhanced error class with helpful suggestions
 * @extends DashboardError
 */
export class PluginError extends DashboardError {
  constructor(code, message, details = {}) {
    super(message, code, details);
    this.name = 'PluginError';
    this.code = code;
    this.pluginId = details.pluginId || details.id || 'unknown';
    this.suggestion = this._getSuggestion();
    this.docs = this._getDocs();
    this.fix = this._getFix();
  }

  /**
   * Get the suggestion for this error code
   * @private
   */
  _getSuggestion() {
    const info = ERROR_SUGGESTIONS[this.code];
    return info?.suggestion || 'Check the plugin documentation for more information';
  }

  /**
   * Get documentation URL for this error
   * @private
   */
  _getDocs() {
    const info = ERROR_SUGGESTIONS[this.code];
    return info?.docs || null;
  }

  /**
   * Get fix instructions for this error
   * @private
   */
  _getFix() {
    const info = ERROR_SUGGESTIONS[this.code];
    return info?.fix || info?.tips || info?.commonCauses || info?.rules || info?.options || null;
  }

  /**
   * Get a formatted error message with suggestion
   * @returns {string} Formatted error message
   */
  getFormattedMessage() {
    const lines = [
      `Plugin Error [${this.code}]: ${this.message}`,
      '',
      `Plugin: ${this.pluginId}`,
      '',
      `💡 Suggestion: ${this.suggestion}`,
    ];

    if (this.docs) {
      lines.push('', `📚 Documentation: ${this.docs}`);
    }

    if (this.fix) {
      if (Array.isArray(this.fix)) {
        lines.push('', '🔧 Possible fixes:');
        this.fix.forEach((f, i) => lines.push(`   ${i + 1}. ${f}`));
      } else {
        lines.push('', `🔧 Fix: ${this.fix}`);
      }
    }

    const info = ERROR_SUGGESTIONS[this.code];
    if (info?.example) {
      lines.push('', '💻 Example:', ...info.example.split('\n').map(l => `   ${l}`));
    }

    return lines.join('\n');
  }

  /**
   * Get a short hint for console display
   * @returns {string} Short hint message
   */
  getHint() {
    return `${this.suggestion} (see docs: ${this.docs || 'PLUGINS.md'})`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      pluginId: this.pluginId,
      suggestion: this.suggestion,
      docs: this.docs,
      fix: this.fix,
    };
  }
}

/**
 * PluginErrorAnalyzer - Analyzes errors and creates PluginError instances
 */
export class PluginErrorAnalyzer {
  /**
   * Analyze an error and create a PluginError with helpful suggestions
   * @param {Error} originalError - The original error
   * @param {string} pluginId - Plugin ID or path
   * @param {Object} context - Additional context
   * @returns {PluginError} Enhanced plugin error
   */
  static analyze(originalError, pluginId, context = {}) {
    const { phase = 'unknown', manifest = null } = context;

    // Determine error code based on error message and phase
    const code = this._determineErrorCode(originalError, phase);
    const message = this._createMessage(code, originalError, pluginId, context);

    return new PluginError(code, message, {
      pluginId,
      originalError: originalError?.message || originalError,
      phase,
      manifest,
      stack: originalError?.stack,
    });
  }

  /**
   * Determine the error code from the error and phase
   * @private
   */
  static _determineErrorCode(error, phase) {
    const msg = (error?.message || String(error)).toLowerCase();

    // Manifest phase errors
    if (phase === 'manifest') {
      if (msg.includes('enoent') || msg.includes('not found')) {
        return PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND;
      }
      if (msg.includes('json') && (msg.includes('parse') || msg.includes('syntax') || msg.includes('unexpected'))) {
        return PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON;
      }
      if (msg.includes('missing') || msg.includes('required')) {
        return PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD;
      }
      if (msg.includes('invalid')) {
        return PLUGIN_ERROR_CODES.MANIFEST_INVALID_FIELD;
      }
      return PLUGIN_ERROR_CODES.MANIFEST_SCHEMA_ERROR;
    }

    // Entry point phase errors
    if (phase === 'entry') {
      if (msg.includes('enoent') || msg.includes('not found') || msg.includes('cannot find module')) {
        return PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND;
      }
      if (msg.includes('export') || msg.includes('does not provide')) {
        return PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT;
      }
      return PLUGIN_ERROR_CODES.ENTRY_RUNTIME_ERROR;
    }

    // Widget class errors
    if (phase === 'widget') {
      if (msg.includes('method') || msg.includes('render') || msg.includes('getdata')) {
        return PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS;
      }
      if (msg.includes('class') || msg.includes('constructor')) {
        return PLUGIN_ERROR_CODES.WIDGET_NOT_A_CLASS;
      }
      if (msg.includes('super') || msg.includes('this')) {
        return PLUGIN_ERROR_CODES.WIDGET_CONSTRUCTOR_ERROR;
      }
    }

    // Config errors
    if (phase === 'config') {
      return PLUGIN_ERROR_CODES.CONFIG_INVALID;
    }

    // Path/Security errors
    if (msg.includes('path') || msg.includes('traversal') || msg.includes('unsafe')) {
      return PLUGIN_ERROR_CODES.PATH_INVALID;
    }
    if (msg.includes('name') && (msg.includes('invalid') || msg.includes('format'))) {
      return PLUGIN_ERROR_CODES.NAME_INVALID;
    }

    // Dependency errors
    if (msg.includes('dependency') || msg.includes('depends')) {
      if (msg.includes('circular')) {
        return PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR;
      }
      return PLUGIN_ERROR_CODES.DEPENDENCY_MISSING;
    }

    return PLUGIN_ERROR_CODES.PLUGIN_LOAD_ERROR;
  }

  /**
   * Create a descriptive message for the error
   * @private
   */
  static _createMessage(code, error, pluginId, context) {
    const originalMsg = error?.message || String(error);

    switch (code) {
      case PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND:
        return `Plugin "${pluginId}" is missing a plugin.json manifest file`;
      case PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON:
        return `Plugin "${pluginId}" has invalid JSON in plugin.json: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD:
        return `Plugin "${pluginId}" manifest is missing required fields: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.MANIFEST_INVALID_FIELD:
        return `Invalid plugin manifest for "${pluginId}": ${originalMsg}`;
      case PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND:
        return `Plugin "${pluginId}" is missing its entry point (index.js)`;
      case PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT:
        return `Plugin "${pluginId}" index.js does not export a widget class`;
      case PLUGIN_ERROR_CODES.ENTRY_INVALID_EXPORT:
        return `Plugin "${pluginId}" exports an invalid widget class: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS:
        return `Plugin "${pluginId}" widget is missing required methods: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.WIDGET_NOT_A_CLASS:
        return `Plugin "${pluginId}" must export a class that extends BaseWidget`;
      case PLUGIN_ERROR_CODES.WIDGET_CONSTRUCTOR_ERROR:
        return `Plugin "${pluginId}" widget failed to construct: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.PATH_INVALID:
        return `Plugin "${pluginId}" has an invalid path: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.NAME_INVALID:
        return `Plugin "${pluginId}" has an invalid name format`;
      case PLUGIN_ERROR_CODES.DEPENDENCY_MISSING:
        return `Plugin "${pluginId}" is missing a dependency: ${originalMsg}`;
      case PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR:
        return `Plugin "${pluginId}" has circular dependencies: ${originalMsg}`;
      default:
        return `Failed to load plugin "${pluginId}": ${originalMsg}`;
    }
  }

  /**
   * Check if an error is a common plugin mistake
   * @param {Error} error - The error to check
   * @returns {Object|null} Analysis result or null
   */
  static checkCommonMistakes(error) {
    const msg = (error?.message || '').toLowerCase();
    const stack = (error?.stack || '').toLowerCase();

    // Check for specific common mistakes
    const checks = [
      {
        pattern: /super\s*\(/,
        check: () => stack.includes('super') && stack.includes('constructor'),
        mistake: 'Missing super() call in constructor',
        fix: 'Add super(options) as the first line of your constructor',
      },
      {
        pattern: /cannot find module/,
        check: () => msg.includes('cannot find module'),
        mistake: 'Missing import/module',
        fix: 'Install the missing module with npm install or check the import path',
      },
      {
        pattern: /is not a function/,
        check: () => msg.includes('is not a function'),
        mistake: 'Calling a non-function',
        fix: 'Check that the variable is a function before calling it, or verify the import',
      },
      {
        pattern: /cannot read propert/,
        check: () => msg.includes('cannot read property') || msg.includes('cannot read properties'),
        mistake: 'Accessing property of undefined/null',
        fix: 'Add null checks before accessing properties: obj?.property',
      },
      {
        pattern: /trailing comma/,
        check: () => msg.includes('trailing comma') || msg.includes('unexpected token }'),
        mistake: 'Trailing comma in JSON',
        fix: 'Remove the comma after the last property in your JSON file',
      },
      {
        pattern: /unexpected token/i,
        check: () => msg.includes('unexpected token') && msg.includes('json'),
        mistake: 'Invalid JSON syntax',
        fix: 'Validate your JSON syntax - check for quotes, brackets, and commas',
      },
    ];

    for (const check of checks) {
      if (check.check()) {
        return {
          mistake: check.mistake,
          fix: check.fix,
          pattern: check.pattern,
        };
      }
    }

    return null;
  }
}

/**
 * Create a formatted error message for logging
 * @param {PluginError} error - PluginError instance
 * @param {Object} options - Formatting options
 * @returns {string} Formatted message
 */
export function formatPluginError(error, options = {}) {
  const { compact = false, colors = true } = options;

  if (compact) {
    return `[${error.code}] ${error.message} - ${error.getHint()}`;
  }

  return error.getFormattedMessage();
}

/**
 * Extract helpful information from a plugin error
 * @param {Error} error - Any error
 * @returns {Object} Extracted information
 */
export function extractErrorInfo(error) {
  if (error instanceof PluginError) {
    return {
      isPluginError: true,
      code: error.code,
      pluginId: error.pluginId,
      suggestion: error.suggestion,
      docs: error.docs,
      hasFix: !!error.fix,
      formatted: error.getFormattedMessage(),
    };
  }

  // Try to analyze non-PluginError instances
  const analysis = PluginErrorAnalyzer.checkCommonMistakes(error);
  return {
    isPluginError: false,
    message: error?.message,
    commonMistake: analysis,
    stack: error?.stack,
  };
}

export default {
  PluginError,
  PluginErrorAnalyzer,
  PLUGIN_ERROR_CODES,
  formatPluginError,
  extractErrorInfo,
  ERROR_SUGGESTIONS,
};
