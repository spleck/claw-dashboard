/**
 * Plugin API for Claw Dashboard
 * Provides a stable API for third-party widget development
 */

import EventEmitter from 'events';
import blessed from 'blessed';
import logger from '../logger.js';
import { getWidgetLoader } from './widget-loader.js';
import { RateLimiter } from '../alerts.js';

/**
 * Plugin API version - follows semver
 */
export const PLUGIN_API_VERSION = '1.0.0';

/**
 * Plugin API class - provides stable interface for widgets
 */
export class PluginAPI extends EventEmitter {
  constructor(options = {}) {
    super();
    this.version = PLUGIN_API_VERSION;
    this.dashboardVersion = options.dashboardVersion || 'unknown';
    this.screen = options.screen || null;
    this.dataProvider = options.dataProvider || null;
    this.settings = options.settings || {};

    // Extension points
    this.extensions = new Map();
    this.hooks = new Map();
    this.providers = new Map();
  }

  /**
   * Register an extension point that plugins can hook into
   * @param {string} name - Extension point name
   * @param {Object} options - Extension options
   */
  registerExtensionPoint(name, options = {}) {
    if (this.extensions.has(name)) {
      logger.warn(`Extension point '${name}' already registered`);
      return this;
    }

    this.extensions.set(name, {
      name,
      description: options.description || '',
      handlers: [],
      multiple: options.multiple !== false, // default true
      required: options.required || [],
      validator: options.validator || null,
    });

    logger.debug(`Extension point '${name}' registered`);
    return this;
  }

  /**
   * Add a handler to an extension point
   * @param {string} extensionName - Extension point name
   * @param {Function} handler - Handler function
   * @param {Object} metadata - Handler metadata
   */
  extend(extensionName, handler, metadata = {}) {
    const extension = this.extensions.get(extensionName);
    if (!extension) {
      throw new Error(`Extension point '${extensionName}' not found`);
    }

    if (!extension.multiple && extension.handlers.length > 0) {
      throw new Error(`Extension point '${extensionName}' only allows one handler`);
    }

    const wrappedHandler = {
      id: metadata.id || `handler-${Date.now()}`,
      handler,
      metadata: {
        priority: metadata.priority || 100,
        ...metadata,
      },
    };

    extension.handlers.push(wrappedHandler);

    // Sort by priority
    extension.handlers.sort((a, b) => a.metadata.priority - b.metadata.priority);

    logger.debug(`Handler registered for extension point '${extensionName}'`);
    this.emit('extension:added', { extension: extensionName, handler: wrappedHandler });

    return () => this.removeExtension(extensionName, wrappedHandler.id);
  }

  /**
   * Remove an extension handler
   * @param {string} extensionName - Extension point name
   * @param {string} handlerId - Handler ID
   */
  removeExtension(extensionName, handlerId) {
    const extension = this.extensions.get(extensionName);
    if (!extension) return false;

    const index = extension.handlers.findIndex(h => h.id === handlerId);
    if (index === -1) return false;

    extension.handlers.splice(index, 1);
    this.emit('extension:removed', { extension: extensionName, handlerId });

    return true;
  }

  /**
   * Execute all handlers for an extension point
   * @param {string} extensionName - Extension point name
   * @param {...any} args - Arguments to pass to handlers
   * @returns {Promise<Array>} Results from all handlers
   */
  async executeExtension(extensionName, ...args) {
    const extension = this.extensions.get(extensionName);
    if (!extension) {
      logger.warn(`Extension point '${extensionName}' not found`);
      return [];
    }

    const results = [];

    for (const { handler, metadata } of extension.handlers) {
      try {
        const result = await handler(...args);
        results.push({ success: true, result, metadata });
      } catch (err) {
        logger.error(`Extension handler error in '${extensionName}': ${err.message}`);
        results.push({ success: false, error: err.message, metadata });
      }
    }

    return results;
  }

  /**
   * Register a data provider
   * @param {string} name - Provider name
   * @param {Function} provider - Provider function
   */
  registerDataProvider(name, provider) {
    if (typeof provider !== 'function') {
      throw new Error('Provider must be a function');
    }

    this.providers.set(name, provider);
    logger.debug(`Data provider '${name}' registered`);
    this.emit('provider:registered', { name });

    return this;
  }

  /**
   * Get data from a provider
   * @param {string} name - Provider name
   * @param {...any} args - Arguments to pass to provider
   */
  async getData(name, ...args) {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Data provider '${name}' not found`);
    }

    try {
      return await provider(...args);
    } catch (err) {
      logger.error(`Data provider '${name}' error: ${err.message}`);
      throw err;
    }
  }

  /**
   * Check if a data provider exists
   * @param {string} name - Provider name
   */
  hasDataProvider(name) {
    return this.providers.has(name);
  }

  /**
   * Register a hook
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   * @param {Object} options - Hook options
   */
  addHook(event, handler, options = {}) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }

    const hooks = this.hooks.get(event);
    const wrapped = {
      id: options.id || `hook-${Date.now()}`,
      handler,
      priority: options.priority || 100,
      once: options.once || false,
    };

    hooks.push(wrapped);
    hooks.sort((a, b) => a.priority - b.priority);

    logger.debug(`Hook registered for event '${event}'`);

    return () => this.removeHook(event, wrapped.id);
  }

  /**
   * Remove a hook
   * @param {string} event - Event name
   * @param {string} hookId - Hook ID
   */
  removeHook(event, hookId) {
    const hooks = this.hooks.get(event);
    if (!hooks) return false;

    const index = hooks.findIndex(h => h.id === hookId);
    if (index === -1) return false;

    hooks.splice(index, 1);
    return true;
  }

  /**
   * Execute hooks for an event
   * @param {string} event - Event name
   * @param {Object} context - Context object that hooks can modify
   * @param {...any} args - Additional arguments
   */
  async executeHooks(event, context = {}, ...args) {
    const hooks = this.hooks.get(event) || [];
    const toRemove = [];

    for (const hook of hooks) {
      try {
        await hook.handler(context, ...args);

        if (hook.once) {
          toRemove.push(hook.id);
        }
      } catch (err) {
        logger.error(`Hook error for event '${event}': ${err.message}`);
      }
    }

    // Remove one-time hooks
    for (const id of toRemove) {
      this.removeHook(event, id);
    }

    return context;
  }

  /**
   * Create a UI component helper
   * @param {string} type - Component type
   * @param {Object} options - Component options
   */
  createComponent(type, options = {}) {
    if (!this.screen) {
      throw new Error('Screen not available - cannot create components');
    }

    const componentConfig = {
      ...options,
      parent: options.parent || this.screen,
    };

    switch (type) {
      case 'box':
        return blessed.box(componentConfig);
      case 'text':
        return blessed.text(componentConfig);
      case 'list':
        return blessed.list(componentConfig);
      case 'table':
        return blessed.table(componentConfig);
      case 'line':
        return blessed.line(componentConfig);
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  }

  /**
   * Get system metrics
   * @param {string} type - Metric type
   */
  async getMetrics(type) {
    if (this.dataProvider) {
      return this.dataProvider(type);
    }
    return null;
  }

  /**
   * Subscribe to dashboard events
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    super.on(event, handler);
    return () => this.off(event, handler);
  }

  /**
   * Log a message from a plugin
   * @param {string} pluginId - Plugin identifier
   * @param {string} level - Log level
   * @param {string} message - Message
   */
  log(pluginId, level, message) {
    const levels = ['debug', 'info', 'warn', 'error'];
    if (!levels.includes(level)) {
      level = 'info';
    }

    logger[level](`[Plugin:${pluginId}] ${message}`);
    this.emit('plugin:log', { pluginId, level, message });
  }

  /**
   * Get plugin configuration
   * @param {string} pluginId - Plugin identifier
   * @param {Object} defaults - Default configuration
   */
  getConfig(pluginId, defaults = {}) {
    const plugins = this.settings.plugins || {};
    return { ...defaults, ...plugins[pluginId] };
  }

  /**
   * Save plugin configuration
   * @param {string} pluginId - Plugin identifier
   * @param {Object} config - Configuration to save
   */
  async saveConfig(pluginId, config) {
    this.emit('plugin:config', { pluginId, config });
    return true;
  }

  /**
   * Get API information
   */
  getInfo() {
    return {
      version: this.version,
      dashboardVersion: this.dashboardVersion,
      extensionPoints: Array.from(this.extensions.keys()),
      dataProviders: Array.from(this.providers.keys()),
      hooks: Array.from(this.hooks.keys()),
    };
  }
}

/**
 * Base Widget class for plugin developers
 */
export class BaseWidget {
  constructor(options = {}) {
    this.id = options.id || `widget-${Date.now()}`;
    this.name = options.name || 'Unnamed Widget';
    this.description = options.description || '';
    this.config = options.config || {};
    this.api = options.api || null;
    this.screen = options.screen || null;

    this.box = null;
    this.data = null;
    this.visible = false;
    this.loaded = false;
  }

  /**
   * Initialize the widget
   * Called when widget is first loaded
   */
  async init() {
    this.loaded = true;
    return true;
  }

  /**
   * Create the widget UI
   * Override this method to create your widget's blessed elements
   */
  async create() {
    // Override in subclass
    throw new Error('create() must be implemented');
  }

  /**
   * Get data for the widget
   * Override this method to fetch widget data
   */
  async getData() {
    // Override in subclass
    return {};
  }

  /**
   * Render the widget
   * Override this method to update the widget display
   */
  async render() {
    // Override in subclass
  }

  /**
   * Show the widget
   */
  show() {
    if (this.box) {
      this.box.show();
      this.visible = true;
    }
  }

  /**
   * Hide the widget
   */
  hide() {
    if (this.box) {
      this.box.hide();
      this.visible = false;
    }
  }

  /**
   * Destroy the widget
   * Clean up any resources
   */
  async destroy() {
    if (this.box) {
      this.box.destroy();
      this.box = null;
    }
    this.loaded = false;
  }

  /**
   * Log a message
   * @param {string} level - Log level
   * @param {string} message - Message
   */
  log(level, message) {
    if (this.api) {
      this.api.log(this.id, level, message);
    }
  }

  /**
   * Get widget metadata
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      loaded: this.loaded,
      visible: this.visible,
    };
  }
}

/**
 * Plugin Manifest validation
 * @param {Object} manifest - Plugin manifest
 */
export function validateManifest(manifest) {
  const required = ['name', 'version', 'entryPoint'];
  const missing = required.filter(key => !manifest[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields in plugin manifest: ${missing.join(', ')}`);
  }

  // Validate version format (semver)
  const semver = /^\d+\.\d+\.\d+/;
  if (!semver.test(manifest.version)) {
    throw new Error('Plugin version must follow semver format (e.g., 1.0.0)');
  }

  return true;
}

/**
 * Create a widget plugin
 * @param {Object} definition - Widget definition
 */
export function createWidgetPlugin(definition) {
  const {
    id,
    name,
    description,
    version = '1.0.0',
    author,
    category = 'custom',
    WidgetClass,
    config = {},
  } = definition;

  if (!WidgetClass) {
    throw new Error('WidgetClass is required');
  }

  return {
    id,
    name,
    description,
    version,
    author,
    category,
    type: 'widget',
    config,

    // Factory function
    createWidget(options = {}) {
      return new WidgetClass({
        id,
        name,
        description,
        config: { ...config, ...options.config },
        ...options,
      });
    },

    // Manifest for plugin system
    toManifest() {
      return {
        id,
        name,
        description,
        version,
        author,
        category,
        type: 'widget',
        lazyLoad: true,
      };
    },
  };
}

// Export singleton
let defaultAPI = null;

export function getPluginAPI(options) {
  if (!defaultAPI) {
    defaultAPI = new PluginAPI(options);
  }
  return defaultAPI;
}

// Export RateLimiter for plugin use
export { RateLimiter };

export default {
  PluginAPI,
  BaseWidget,
  validateManifest,
  createWidgetPlugin,
  PLUGIN_API_VERSION,
  RateLimiter,
};
