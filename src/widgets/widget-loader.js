/**
 * Widget Loader Module
 * Provides lazy loading for widget modules to improve startup performance
 */

import { existsSync, readdirSync } from 'fs';
import { join, resolve, extname, basename } from 'path';
import { pathToFileURL } from 'url';
import logger from '../logger.js';
import config from '../config.js';

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
    if (!existsSync(this.pluginsDir)) {
      return [];
    }

    const discovered = [];
    const entries = readdirSync(this.pluginsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const pluginPath = join(this.pluginsDir, entry.name);
      const manifestPath = join(pluginPath, 'plugin.json');
      const indexPath = join(pluginPath, 'index.js');

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
   */
  async loadPlugin(pluginPath) {
    const manifestPath = join(pluginPath, 'plugin.json');
    const indexPath = join(pluginPath, 'index.js');

    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found at ${pluginPath}`);
    }

    const manifest = JSON.parse(await import('fs').then(m => m.readFileSync(manifestPath, 'utf8')));
    const id = manifest.id || basename(pluginPath);

    // Create loader function
    const loader = async () => {
      const module = await import(pathToFileURL(indexPath).href);

      // Support both default export and named exports
      const WidgetClass = module.default || module.Widget || module;

      if (typeof WidgetClass === 'function') {
        return new WidgetClass(manifest.config || {});
      }

      return WidgetClass;
    };

    this.register(id, manifest, loader);

    // Auto-load if not lazy
    if (manifest.lazyLoad === false) {
      await this.load(id);
    }

    return id;
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
