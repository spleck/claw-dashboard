/**
 * Widget Loader Module
 * Provides lazy loading for widget modules to improve startup performance
 */

import { existsSync, readdirSync } from 'fs';
import { join, resolve, extname, basename } from 'path';
import { pathToFileURL } from 'url';
import logger from '../logger.js';
import config from '../config.js';
import { sanitizeWidgetConfig, validateWidgetConfig, validatePluginPath, validatePluginName } from '../security.js';
import { processWidgetConfig } from './config-processor.js';
import {
  resolveDependencies,
  validateWidgetDependencies,
  buildDependencyGraph,
  getAllDependencies,
  getAllDependents,
} from './dependency-resolver.js';

const { PATHS, WIDGETS } = config;

/**
 * Widget Loader class for lazy loading widget modules
 */
export class WidgetLoader {
  constructor(options = {}) {
    this.widgetsDir = options.widgetsDir || PATHS.WIDGETS_DIR;
    this.pluginsDir = options.pluginsDir || PATHS.PLUGINS_DIR;
    this.loadedWidgets = new Map();
    this.widgetRegistry = new Map();
    this.loadPromises = new Map();
    this.hooks = {
      beforeLoad: [],
      afterLoad: [],
      beforeUnload: [],
    };
  }

  /**
   * Register a widget without loading it
   * @param {string} id - Unique widget identifier
   * @param {Object} metadata - Widget metadata
   * @param {Function} loader - Async function that returns the widget module
   */
  register(id, metadata, loader) {
    if (this.widgetRegistry.has(id)) {
      logger.warn(`Widget '${id}' is already registered, overwriting`);
    }

    this.widgetRegistry.set(id, {
      id,
      metadata: {
        name: metadata.name || id,
        description: metadata.description || '',
        version: metadata.version || '1.0.0',
        author: metadata.author || '',
        category: metadata.category || 'system',
        priority: metadata.priority || 100,
        lazyLoad: metadata.lazyLoad !== false, // default true
        dependencies: metadata.dependencies || [],
        permissions: metadata.permissions || [],
        ...metadata,
      },
      loader,
      loaded: false,
      instance: null,
      error: null,
    });

    logger.debug(`Widget '${id}' registered`);
    return this;
  }

  /**
   * Unregister a widget
   * @param {string} id - Widget identifier
   */
  async unregister(id) {
    const widget = this.widgetRegistry.get(id);
    if (!widget) {
      logger.warn(`Widget '${id}' not found in registry`);
      return false;
    }

    // Run beforeUnload hooks
    await this.runHooks('beforeUnload', widget);

    // Unload if loaded
    if (widget.loaded && widget.instance?.destroy) {
      try {
        await widget.instance.destroy();
      } catch (err) {
        logger.error(`Error destroying widget '${id}': ${err.message}`);
      }
    }

    this.loadedWidgets.delete(id);
    this.widgetRegistry.delete(id);
    this.loadPromises.delete(id);

    logger.debug(`Widget '${id}' unregistered`);
    return true;
  }

  /**
   * Load a widget by ID (lazy loading)
   * @param {string} id - Widget identifier
   * @returns {Promise<Object>} Loaded widget instance
   */
  async load(id) {
    // Return cached promise if loading is in progress
    if (this.loadPromises.has(id)) {
      return this.loadPromises.get(id);
    }

    const widget = this.widgetRegistry.get(id);
    if (!widget) {
      throw new Error(`Widget '${id}' not registered`);
    }

    // Return cached instance if already loaded
    if (widget.loaded && widget.instance) {
      return widget.instance;
    }

    // Create load promise
    const loadPromise = this._doLoad(widget);
    this.loadPromises.set(id, loadPromise);

    try {
      const instance = await loadPromise;
      return instance;
    } finally {
      this.loadPromises.delete(id);
    }
  }

  /**
   * Internal method to perform the actual loading
   * @private
   */
  async _doLoad(widget) {
    const startTime = Date.now();

    try {
      // Run beforeLoad hooks
      await this.runHooks('beforeLoad', widget);

      // Check dependencies
      await this._resolveDependencies(widget);

      // Load the widget module
      const instance = await widget.loader();

      if (!instance || typeof instance !== 'object') {
        throw new Error('Widget loader did not return a valid object');
      }

      // Validate required methods
      this._validateWidget(instance, widget.id);

      widget.instance = instance;
      widget.loaded = true;
      widget.loadTime = Date.now() - startTime;
      widget.error = null;

      this.loadedWidgets.set(widget.id, instance);

      // Run afterLoad hooks
      await this.runHooks('afterLoad', widget);

      logger.debug(`Widget '${widget.id}' loaded in ${widget.loadTime}ms`);
      return instance;
    } catch (err) {
      widget.error = err;
      widget.loaded = false;
      logger.error(`Failed to load widget '${widget.id}': ${err.message}`);
      throw err;
    }
  }

  /**
   * Resolve widget dependencies
   * @private
   */
  async _resolveDependencies(widget) {
    const deps = widget.metadata.dependencies || [];

    for (const depId of deps) {
      if (!this.widgetRegistry.has(depId)) {
        throw new Error(`Dependency '${depId}' not found for widget '${widget.id}'`);
      }

      const depWidget = this.widgetRegistry.get(depId);
      if (!depWidget.loaded) {
        await this.load(depId);
      }
    }
  }

  /**
   * Validate widget has required methods
   * @private
   */
  _validateWidget(instance, id) {
    const required = ['render', 'getData'];
    const missing = required.filter(method => typeof instance[method] !== 'function');

    if (missing.length > 0) {
      throw new Error(`Widget '${id}' missing required methods: ${missing.join(', ')}`);
    }
  }

  /**
   * Unload a widget
   * @param {string} id - Widget identifier
   */
  async unload(id) {
    const widget = this.widgetRegistry.get(id);
    if (!widget || !widget.loaded) {
      return false;
    }

    await this.runHooks('beforeUnload', widget);

    if (widget.instance?.destroy) {
      try {
        await widget.instance.destroy();
      } catch (err) {
        logger.error(`Error destroying widget '${id}': ${err.message}`);
      }
    }

    widget.instance = null;
    widget.loaded = false;
    this.loadedWidgets.delete(id);

    logger.debug(`Widget '${id}' unloaded`);
    return true;
  }

  /**
   * Load multiple widgets in parallel
   * @param {string[]} ids - Array of widget IDs
   * @returns {Promise<Map>} Map of id to loaded instance
   */
  async loadMany(ids) {
    const results = await Promise.allSettled(
      ids.map(id => this.load(id).then(instance => ({ id, instance })))
    );

    const loaded = new Map();
    const errors = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        loaded.set(result.value.id, result.value.instance);
      } else {
        errors.push(result.reason);
      }
    }

    if (errors.length > 0) {
      logger.warn(`Failed to load ${errors.length} widget(s): ${errors.map(e => e.message).join(', ')}`);
    }

    return loaded;
  }

  /**
   * Preload widgets that are likely to be needed
   * @param {string[]} priorityIds - Widget IDs to preload
   */
  async preload(priorityIds) {
    const preloadList = priorityIds.filter(id => {
      const widget = this.widgetRegistry.get(id);
      return widget && widget.metadata.lazyLoad && !widget.loaded;
    });

    if (preloadList.length === 0) return;

    logger.debug(`Preloading ${preloadList.length} widget(s)`);

    // Load in order of priority
    const sorted = preloadList
      .map(id => ({ id, priority: this.widgetRegistry.get(id).metadata.priority }))
      .sort((a, b) => a.priority - b.priority);

    // Load high priority widgets first
    for (const { id } of sorted.filter(w => w.priority < 50)) {
      try {
        await this.load(id);
      } catch (err) {
        // Non-critical, continue
      }
    }

    // Load remaining in background
    const remaining = sorted.filter(w => w.priority >= 50).map(w => w.id);
    if (remaining.length > 0) {
      this.loadMany(remaining).catch(() => {});
    }
  }

  /**
   * Get widget metadata without loading
   * @param {string} id - Widget identifier
   */
  getMetadata(id) {
    const widget = this.widgetRegistry.get(id);
    return widget ? { ...widget.metadata } : null;
  }

  /**
   * Get all registered widget metadata
   */
  getAllMetadata() {
    const metadata = [];
    for (const [id, widget] of this.widgetRegistry) {
      metadata.push({
        id,
        ...widget.metadata,
        loaded: widget.loaded,
        hasError: !!widget.error,
      });
    }
    return metadata.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get loaded widget instance
   * @param {string} id - Widget identifier
   */
  get(id) {
    const widget = this.widgetRegistry.get(id);
    return widget?.loaded ? widget.instance : null;
  }

  /**
   * Check if widget is loaded
   * @param {string} id - Widget identifier
   */
  isLoaded(id) {
    const widget = this.widgetRegistry.get(id);
    return widget?.loaded || false;
  }

  /**
   * Add a hook
   * @param {string} type - Hook type: 'beforeLoad', 'afterLoad', 'beforeUnload'
   * @param {Function} handler - Hook handler
   */
  addHook(type, handler) {
    if (!this.hooks[type]) {
      throw new Error(`Unknown hook type: ${type}`);
    }
    this.hooks[type].push(handler);
  }

  /**
   * Run hooks for a type
   * @private
   */
  async runHooks(type, widget) {
    for (const handler of this.hooks[type]) {
      try {
        await handler(widget);
      } catch (err) {
        logger.error(`Hook error (${type}): ${err.message}`);
      }
    }
  }

  /**
   * Discover widgets from plugins directory
   */
  async discoverPlugins() {
    // Validate pluginsDir exists and is safe
    const pluginsDirValidation = validatePluginPath(this.pluginsDir, {
      allowAbsolute: true,
      mustExist: true,
      expectedType: 'directory',
    });

    if (!pluginsDirValidation.valid) {
      logger.warn(`Plugins directory validation failed: ${pluginsDirValidation.error}`);
      return [];
    }

    const validatedPluginsDir = pluginsDirValidation.path;

    if (!existsSync(validatedPluginsDir)) {
      return [];
    }

    const discovered = [];
    const entries = readdirSync(validatedPluginsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Validate plugin directory name
      const nameValidation = validatePluginName(entry.name);
      if (!nameValidation.valid) {
        logger.warn(`Skipping plugin directory with invalid name '${entry.name}': ${nameValidation.error}`);
        continue;
      }

      const pluginPath = join(validatedPluginsDir, entry.name);

      // Validate the plugin path is within allowed directory
      const pathValidation = validatePluginPath(entry.name, {
        allowedDirs: [validatedPluginsDir],
        allowAbsolute: false,
        mustExist: true,
        expectedType: 'directory',
      });

      if (!pathValidation.valid) {
        logger.warn(`Skipping plugin with unsafe path '${entry.name}': ${pathValidation.error}`);
        continue;
      }

      const manifestPath = join(pluginPath, 'plugin.json');
      const indexPath = join(pluginPath, 'index.js');

      // Validate manifest and index paths are within plugin directory
      const manifestValidation = validatePluginPath('plugin.json', {
        allowedDirs: [pluginPath],
        allowAbsolute: false,
        mustExist: true,
        expectedType: 'file',
      });

      if (!manifestValidation.valid) {
        logger.warn(`Plugin '${entry.name}' has invalid manifest path: ${manifestValidation.error}`);
        continue;
      }

      const indexValidation = validatePluginPath('index.js', {
        allowedDirs: [pluginPath],
        allowAbsolute: false,
        mustExist: true,
        expectedType: 'file',
      });

      if (!indexValidation.valid) {
        logger.warn(`Plugin '${entry.name}' has invalid entry point: ${indexValidation.error}`);
        continue;
      }

      if (!existsSync(manifestPath) || !existsSync(indexPath)) {
        continue;
      }

      try {
        const manifest = JSON.parse(await import('fs').then(m => m.readFileSync(manifestPath, 'utf8')));

        if (manifest.type !== 'widget') continue;

        discovered.push({
          id: manifest.id || entry.name,
          manifest,
          path: pluginPath,
          entryPoint: indexPath,
        });
      } catch (err) {
        logger.warn(`Failed to load plugin manifest from ${entry.name}: ${err.message}`);
      }
    }

    return discovered;
  }

  /**
   * Load and register a plugin
   * @param {string} pluginPath - Path to plugin directory
   * @param {Object} options - Load options
   * @param {boolean} options.sanitize - Whether to sanitize config (default: true)
   * @param {boolean} options.fallbackOnError - Fall back to defaults on error (default: true)
   */
  async loadPlugin(pluginPath, options = {}) {
    const { sanitize = true, fallbackOnError = true } = options;

    // Validate plugin path before processing
    const pathValidation = validatePluginPath(pluginPath, {
      allowedDirs: [this.pluginsDir],
      allowAbsolute: true,
      mustExist: true,
      expectedType: 'directory',
    });

    if (!pathValidation.valid) {
      throw new Error(`Invalid plugin path: ${pathValidation.error}`);
    }

    // Use the validated, resolved path
    const validatedPluginPath = pathValidation.path;
    const manifestPath = join(validatedPluginPath, 'plugin.json');
    const indexPath = join(validatedPluginPath, 'index.js');

    // Validate manifest and index paths
    const manifestValidation = validatePluginPath(manifestPath, {
      allowedDirs: [validatedPluginPath],
      allowAbsolute: true,
      mustExist: true,
      expectedType: 'file',
    });

    if (!manifestValidation.valid) {
      throw new Error(`Invalid manifest path: ${manifestValidation.error}`);
    }

    const indexValidation = validatePluginPath(indexPath, {
      allowedDirs: [validatedPluginPath],
      allowAbsolute: true,
      mustExist: true,
      expectedType: 'file',
    });

    if (!indexValidation.valid) {
      throw new Error(`Invalid entry point path: ${indexValidation.error}`);
    }

    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found at ${validatedPluginPath}`);
    }

    let manifest;
    try {
      const manifestContent = await import('fs').then(m => m.readFileSync(manifestPath, 'utf8'));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      if (fallbackOnError) {
        logger.warn(`Failed to parse plugin manifest at ${validatedPluginPath}: ${err.message}`);
        return null;
      }
      throw new Error(`Failed to parse plugin manifest: ${err.message}`);
    }

    // Validate manifest has required fields
    if (!manifest.id && !manifest.name) {
      manifest.id = basename(validatedPluginPath);
    }

    const id = manifest.id || basename(validatedPluginPath);

    // Process and sanitize plugin config
    let processedConfig = {};
    if (manifest.config) {
      // First apply env interpolation and version migration
      const processingResult = processWidgetConfig(manifest.config, {
        interpolateEnv: true,
        validateVersion: true,
        supportLegacy: true,
        throwOnError: false,
      });

      if (!processingResult.success) {
        logger.warn(`Config processing failed for plugin '${id}': ${processingResult.error}`);
        if (!fallbackOnError) {
          throw new Error(`Config processing failed: ${processingResult.error}`);
        }
      } else {
        processedConfig = processingResult.config;
        if (processingResult.warnings) {
          processingResult.warnings.forEach(warning => {
            logger.debug(`[${id}] ${warning}`);
          });
        }
      }

      // Then apply security sanitization
      if (sanitize) {
        try {
          processedConfig = sanitizeWidgetConfig(processedConfig);
        } catch (err) {
          logger.warn(`Failed to sanitize config for plugin '${id}': ${err.message}, using processed config`);
        }
      }
    }

    // Create loader function with error handling
    const loader = async () => {
      try {
        const module = await import(pathToFileURL(indexPath).href);

        // Support both default export and named exports
        const WidgetClass = module.default || module.Widget || module;

        if (typeof WidgetClass === 'function') {
          return new WidgetClass(processedConfig);
        }

        return WidgetClass;
      } catch (err) {
        if (fallbackOnError) {
          logger.error(`Failed to load plugin '${id}': ${err.message}, plugin will be unavailable`);
          throw err; // Re-throw so the plugin is marked as failed
        }
        throw err;
      }
    };

    this.register(id, manifest, loader);

    // Auto-load if not lazy
    if (manifest.lazyLoad === false) {
      try {
        await this.load(id);
      } catch (err) {
        if (fallbackOnError) {
          logger.warn(`Failed to auto-load plugin '${id}': ${err.message}`);
        } else {
          throw err;
        }
      }
    }

    return id;
  }

  /**
   * Load all discovered plugins with error handling and fallback
   * Uses dependency resolution to ensure correct load order
   * @param {Object} options - Load options
   * @param {boolean} [options.resolveDependencies=true] - Whether to resolve and load in dependency order
   * @param {boolean} [options.allowPartial=false] - Allow partial loading when dependencies are missing
   * @returns {Object} Results with successful and failed plugin IDs
   */
  async loadAllPluginsWithFallback(options = {}) {
    const {
      sanitize = true,
      fallbackOnError = true,
      continueOnError = true,
      resolveDependencies: shouldResolveDeps = true,
      allowPartial = false,
    } = options;

    const discovered = await this.discoverPlugins();
    const results = {
      successful: [],
      failed: [],
      skipped: [],
      dependencyErrors: [],
    };

    // First pass: register all discovered plugins without loading
    for (const plugin of discovered) {
      try {
        // Register only - don't load yet so we can resolve dependencies
        const id = await this.registerPlugin(plugin.path, { sanitize, fallbackOnError });
        if (id) {
          // Track as successfully registered (will be loaded in second pass)
          if (!results.successful.includes(id)) {
            results.successful.push(id);
          }
        } else {
          results.skipped.push(plugin.id);
          // Remove from successful if it was added
          const idx = results.successful.indexOf(plugin.id);
          if (idx > -1) results.successful.splice(idx, 1);
        }
      } catch (err) {
        results.failed.push({ id: plugin.id, error: err.message });
        // Remove from successful if it was added
        const idx = results.successful.indexOf(plugin.id);
        if (idx > -1) results.successful.splice(idx, 1);
        logger.warn(`Plugin '${plugin.id}' failed to register: ${err.message}`);
      }
    }

    // Second pass: resolve dependencies and load in order
    if (shouldResolveDeps && this.widgetRegistry.size > 0) {
      const resolution = resolveDependencies(this.widgetRegistry, {
        allowPartial,
      });

      if (!resolution.success) {
        results.dependencyErrors.push({
          error: resolution.error,
          circularPath: resolution.circularPath,
          missingDeps: resolution.missingDeps,
          constraintViolations: resolution.constraintViolations,
        });

        if (!continueOnError) {
          logger.error(`Dependency resolution failed: ${resolution.error}`);
          return results;
        }

        logger.warn(`Dependency resolution issues: ${resolution.error}`);
      }

      // Load in dependency order
      for (const id of resolution.order) {
        const widget = this.widgetRegistry.get(id);
        if (!widget || widget.loaded) continue;

        try {
          await this.load(id);
          results.successful.push(id);
        } catch (err) {
          results.failed.push({ id, error: err.message });
          logger.warn(`Widget '${id}' failed to load: ${err.message}`);

          if (!continueOnError && !fallbackOnError) {
            break;
          }
        }
      }
    } else {
      // Fallback: load without dependency resolution (original behavior)
      for (const plugin of discovered) {
        // Skip already registered ones
        if (this.widgetRegistry.has(plugin.id)) continue;

        try {
          const id = await this.loadPlugin(plugin.path, { sanitize, fallbackOnError });
          if (id) {
            results.successful.push(id);
          } else {
            results.skipped.push(plugin.id);
          }
        } catch (err) {
          results.failed.push({ id: plugin.id, error: err.message });
          logger.warn(`Plugin '${plugin.id}' failed to load: ${err.message}`);

          if (!continueOnError && !fallbackOnError) {
            break;
          }
        }
      }
    }

    logger.debug(`Plugin loading complete: ${results.successful.length} loaded, ${results.failed.length} failed, ${results.skipped.length} skipped`);
    return results;
  }

  /**
   * Register a plugin without loading it (for dependency resolution)
   * @param {string} pluginPath - Path to plugin directory
   * @param {Object} options - Registration options
   * @returns {string|null} Plugin ID or null if skipped
   */
  async registerPlugin(pluginPath, options = {}) {
    const { sanitize = true, fallbackOnError = true } = options;

    // Validate plugin path
    const pathValidation = validatePluginPath(pluginPath, {
      allowedDirs: [this.pluginsDir],
      allowAbsolute: true,
      mustExist: true,
      expectedType: 'directory',
    });

    if (!pathValidation.valid) {
      throw new Error(`Invalid plugin path: ${pathValidation.error}`);
    }

    const validatedPluginPath = pathValidation.path;
    const manifestPath = join(validatedPluginPath, 'plugin.json');
    const indexPath = join(validatedPluginPath, 'index.js');

    if (!existsSync(manifestPath)) {
      return null;
    }

    let manifest;
    try {
      const manifestContent = await import('fs').then(m => m.readFileSync(manifestPath, 'utf8'));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      if (fallbackOnError) {
        logger.warn(`Failed to parse plugin manifest at ${validatedPluginPath}: ${err.message}`);
        return null;
      }
      throw new Error(`Failed to parse plugin manifest: ${err.message}`);
    }

    const id = manifest.id || basename(validatedPluginPath);

    // Process and sanitize plugin config
    let processedConfig = {};
    if (manifest.config) {
      const processingResult = processWidgetConfig(manifest.config, {
        interpolateEnv: true,
        validateVersion: true,
        supportLegacy: true,
        throwOnError: false,
      });

      if (processingResult.success) {
        processedConfig = processingResult.config;
      }

      if (sanitize) {
        try {
          processedConfig = sanitizeWidgetConfig(processedConfig);
        } catch (err) {
          logger.warn(`Failed to sanitize config for plugin '${id}': ${err.message}`);
        }
      }
    }

    // Create loader function
    const loader = async () => {
      try {
        const module = await import(pathToFileURL(indexPath).href);
        const WidgetClass = module.default || module.Widget || module;

        if (typeof WidgetClass === 'function') {
          return new WidgetClass(processedConfig);
        }

        return WidgetClass;
      } catch (err) {
        logger.error(`Failed to load plugin '${id}': ${err.message}`);
        throw err;
      }
    };

    this.register(id, manifest, loader);
    return id;
  }

  /**
   * Load widgets in dependency order
   * @param {string[]} ids - Widget IDs to load (loads all registered if empty)
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Loading results
   */
  async loadInDependencyOrder(ids = null, options = {}) {
    const { allowPartial = false, continueOnError = true } = options;

    const targetIds = ids || Array.from(this.widgetRegistry.keys());

    const resolution = resolveDependencies(this.widgetRegistry, {
      targetIds,
      allowPartial,
    });

    const results = {
      successful: [],
      failed: [],
      skipped: [],
      resolution,
    };

    if (!resolution.success) {
      logger.error(`Dependency resolution failed: ${resolution.error}`);
      return results;
    }

    for (const id of resolution.order) {
      const widget = this.widgetRegistry.get(id);
      if (!widget || widget.loaded) continue;

      try {
        await this.load(id);
        results.successful.push(id);
      } catch (err) {
        results.failed.push({ id, error: err.message });
        if (!continueOnError) break;
      }
    }

    return results;
  }

  /**
   * Get dependency information for a widget
   * @param {string} id - Widget ID
   * @returns {Object|null} Dependency information
   */
  getDependencyInfo(id) {
    const widget = this.widgetRegistry.get(id);
    if (!widget) return null;

    const validation = validateWidgetDependencies(this.widgetRegistry, id);
    const graph = buildDependencyGraph(this.widgetRegistry);

    return {
      id,
      dependencies: widget.metadata.dependencies || [],
      allDependencies: getAllDependencies(graph, id),
      dependents: getAllDependents(graph, id),
      validation,
    };
  }

  /**
   * Get the full dependency graph
   * @returns {Object} Dependency graph representation
   */
  getDependencyGraph() {
    const graph = buildDependencyGraph(this.widgetRegistry);
    const result = {};

    for (const [id, node] of graph) {
      result[id] = {
        id,
        dependencies: node.dependencies.map(d => ({
          id: d.id,
          optional: d.optional,
          version: d.version,
        })),
        dependents: Array.from(node.dependents),
      };
    }

    return result;
  }

  /**
   * Validate dependencies for one or all widgets
   * @param {string} [id] - Specific widget ID (validates all if omitted)
   * @returns {Object} Validation results
   */
  validateDependencies(id = null) {
    if (id) {
      return {
        [id]: validateWidgetDependencies(this.widgetRegistry, id),
      };
    }

    const results = {};
    for (const [widgetId] of this.widgetRegistry) {
      results[widgetId] = validateWidgetDependencies(this.widgetRegistry, widgetId);
    }
    return results;
  }

  /**
   * Get loading statistics
   */
  getStats() {
    const all = Array.from(this.widgetRegistry.values());
    return {
      total: all.length,
      loaded: all.filter(w => w.loaded).length,
      failed: all.filter(w => w.error).length,
      loading: this.loadPromises.size,
      averageLoadTime: all.filter(w => w.loadTime).reduce((sum, w) => sum + w.loadTime, 0) / all.filter(w => w.loadTime).length || 0,
    };
  }

  /**
   * Clear all widgets
   */
  async clear() {
    const ids = Array.from(this.loadedWidgets.keys());
    await Promise.all(ids.map(id => this.unload(id)));
    this.widgetRegistry.clear();
    this.loadedWidgets.clear();
    this.loadPromises.clear();
  }
}

// Singleton instance
let defaultLoader = null;

export function getWidgetLoader(options) {
  if (!defaultLoader) {
    defaultLoader = new WidgetLoader(options);
  }
  return defaultLoader;
}

export default WidgetLoader;
