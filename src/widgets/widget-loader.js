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
import { validateManifest } from '../plugin-manifest-validator.js';
import {
  resolveDependencies,
  validateWidgetDependencies,
  buildDependencyGraph,
  getAllDependencies,
  getAllDependents,
} from './dependency-resolver.js';
import { PluginError, PluginErrorAnalyzer, PLUGIN_ERROR_CODES } from '../plugin-errors.js';
import { ConfigWatcher } from '../config-watcher.js';
import { EventEmitter } from 'events';

const { PATHS, WIDGETS } = config;

/**
 * Widget Loader class for lazy loading widget modules
 * Extends EventEmitter to support hot-reload events
 */
export class WidgetLoader extends EventEmitter {
  constructor(options = {}) {
    super();
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
    this.configWatcher = null;
    this._reloadStats = {
      reloads: 0,
      errors: 0,
      lastReload: null,
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
   * Convenience method to register and load a widget in one call
   * @param {string} id - Unique widget identifier
   * @param {Object} metadata - Widget metadata
   * @param {Function} loader - Async function that returns the widget module
   * @returns {Promise<Object>} Loaded widget instance
   */
  async loadAndRegister(id, metadata, loader) {
    this.register(id, metadata, loader);
    return this.load(id);
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

      // Enhance error message if not already a PluginError
      if (!(err instanceof PluginError)) {
        const enhanced = PluginErrorAnalyzer.analyze(err, widget.id, { phase: 'widget' });
        logger.error(`Failed to load widget '${widget.id}': ${enhanced.getFormattedMessage()}`);
      } else {
        logger.error(`Failed to load widget '${widget.id}': ${err.getFormattedMessage()}`);
      }

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
        const pluginError = new PluginError(
          PLUGIN_ERROR_CODES.DEPENDENCY_MISSING,
          `Dependency "${depId}" not found for widget "${widget.id}"`,
          {
            pluginId: widget.id,
            dependencyId: depId,
            availableDependencies: Array.from(this.widgetRegistry.keys()),
          }
        );
        throw pluginError;
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
      const pluginError = new PluginError(
        PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS,
        `Widget "${id}" is missing required methods: ${missing.join(', ')}`,
        {
          pluginId: id,
          missingMethods: missing,
          hasRender: typeof instance.render === 'function',
          hasGetData: typeof instance.getData === 'function',
        }
      );
      throw pluginError;
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

        // Validate manifest against schema
        const validation = validateManifest(manifest);
        if (!validation.valid) {
          const pluginError = PluginErrorAnalyzer.analyze(
            new Error(validation.errors.join(', ')),
            manifest.id || entry.name,
            { phase: 'manifest', manifest }
          );
          logger.warn(pluginError.getFormattedMessage());
          continue;
        }

        discovered.push({
          id: manifest.id || entry.name,
          manifest,
          path: pluginPath,
          entryPoint: indexPath,
        });
      } catch (err) {
        if (err instanceof PluginError) {
          logger.warn(err.getFormattedMessage());
        } else {
          const pluginError = PluginErrorAnalyzer.analyze(err, entry.name, { phase: 'manifest' });
          logger.warn(pluginError.getFormattedMessage());
        }
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
      const pluginError = new PluginError(
        PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
        `Plugin manifest not found at ${validatedPluginPath}`,
        { pluginId: basename(validatedPluginPath) }
      );
      throw pluginError;
    }

    let manifest;
    try {
      const manifestContent = await import('fs').then(m => m.readFileSync(manifestPath, 'utf8'));
      manifest = JSON.parse(manifestContent);
    } catch (err) {
      const pluginError = PluginErrorAnalyzer.analyze(err, basename(validatedPluginPath), {
        phase: 'manifest',
        path: validatedPluginPath,
      });
      if (fallbackOnError) {
        logger.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }

    // Validate manifest against schema
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      const pluginError = PluginErrorAnalyzer.analyze(
        new Error(`Validation failed: ${validation.errors.join(', ')}`),
        manifest.id || basename(validatedPluginPath),
        { phase: 'manifest', manifest }
      );
      if (fallbackOnError) {
        logger.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }

    // Validate manifest has required fields
    if (!manifest.id && !manifest.name) {
      manifest.id = basename(validatedPluginPath);
    }

    const id = manifest.id || basename(validatedPluginPath);

    // Store plugin path in metadata for hot-reload support
    manifest._pluginPath = validatedPluginPath;
    manifest._manifestPath = manifestPath;
    manifest._indexPath = indexPath;

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

        // Handle invalid export
        const pluginError = new PluginError(
          PLUGIN_ERROR_CODES.ENTRY_INVALID_EXPORT,
          `Plugin "${id}" does not export a valid widget class`,
          {
            pluginId: id,
            exportType: typeof WidgetClass,
            hasDefault: !!module.default,
            hasNamed: !!module.Widget,
          }
        );
        throw pluginError;
      } catch (err) {
        if (err instanceof PluginError) {
          throw err;
        }
        const pluginError = PluginErrorAnalyzer.analyze(err, id, {
          phase: 'entry',
          path: indexPath,
        });
        throw pluginError;
      }
    };

    this.register(id, manifest, loader);

    // Auto-load if not explicitly marked as lazy
    // Default behavior is eager loading (lazyLoad: false or undefined)
    if (manifest.lazyLoad !== true) {
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

        // Create enhanced error for dependency issues
        // missingDeps is an Object mapping widget ID to missing dependency IDs array
        const missingDepIds = resolution.missingDeps
          ? Object.entries(resolution.missingDeps)
              .map(([id, deps]) => `${id}(${deps.join(', ')})`)
              .join('; ')
          : 'unknown';
        const depError = new PluginError(
          resolution.circularPath ? PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR : PLUGIN_ERROR_CODES.DEPENDENCY_MISSING,
          resolution.error,
          {
            pluginId: missingDepIds,
            circularPath: resolution.circularPath,
            missingDeps: resolution.missingDeps,
          }
        );

        if (!continueOnError) {
          logger.error(depError.getFormattedMessage());
          return results;
        }

        logger.warn(depError.getFormattedMessage());
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
      const pluginError = PluginErrorAnalyzer.analyze(err, basename(validatedPluginPath), {
        phase: 'manifest',
        path: validatedPluginPath,
      });
      if (fallbackOnError) {
        logger.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }

    // Validate manifest against schema
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      const pluginError = PluginErrorAnalyzer.analyze(
        new Error(`Validation failed: ${validation.errors.join(', ')}`),
        manifest.id || basename(validatedPluginPath),
        { phase: 'manifest', manifest }
      );
      if (fallbackOnError) {
        logger.warn(pluginError.getFormattedMessage());
        return null;
      }
      throw pluginError;
    }

    const id = manifest.id || basename(validatedPluginPath);

    // Store plugin path in metadata for hot-reload support
    manifest._pluginPath = validatedPluginPath;
    manifest._manifestPath = manifestPath;
    manifest._indexPath = indexPath;

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

  /**
   * Enable hot-reload for widget configurations
   * Watches plugin.json files and reloads widgets when changed
   * @param {Object} options - Hot-reload options
   * @param {number} options.debounceMs - Debounce interval for changes (default: 500)
   * @param {boolean} options.usePolling - Use polling instead of native events (default: false)
   * @param {boolean} options.reloadWidgets - Automatically reload widgets when config changes (default: true)
   * @returns {ConfigWatcher|null} The config watcher instance or null if disabled
   */
  enableConfigHotReload(options = {}) {
    const {
      debounceMs = 500,
      usePolling = false,
      reloadWidgets = true,
    } = options;

    // Don't enable if already watching
    if (this.configWatcher) {
      logger.debug('Config hot-reload already enabled');
      return this.configWatcher;
    }

    // Create watcher
    this.configWatcher = new ConfigWatcher({
      debounceMs,
      usePolling,
    });

    // Track reload stats
    this._reloadStats = {
      reloads: 0,
      errors: 0,
      lastReload: null,
    };

    // Listen for reload events
    this.configWatcher.on('reload', async ({ filePath, timestamp }) => {
      try {
        // Find which widget this config belongs to
        const widgetId = this._findWidgetIdByConfigPath(filePath);
        if (!widgetId) {
          logger.debug(`Config reload: Could not find widget for ${filePath}`);
          return;
        }

        logger.info(`Config hot-reload triggered for widget: ${widgetId}`);

        // Read and process new config
        const reloadResult = await this._reloadWidgetConfig(widgetId, filePath);

        if (reloadResult.success) {
          this._reloadStats.reloads++;
          this._reloadStats.lastReload = { widgetId, timestamp };
          logger.info(`Config hot-reload successful for ${widgetId}`);

          // Emit event for external listeners
          this.emit?.('configReloaded', { widgetId, timestamp, config: reloadResult.config });
        } else {
          this._reloadStats.errors++;
          logger.error(`Config hot-reload failed for ${widgetId}: ${reloadResult.error}`);

          // Emit error event
          this.emit?.('configReloadError', { widgetId, error: reloadResult.error, timestamp });
        }
      } catch (err) {
        this._reloadStats.errors++;
        logger.error(`Config hot-reload error: ${err.message}`);
        this.emit?.('configReloadError', { filePath, error: err.message, timestamp });
      }
    });

    // Handle watcher errors
    this.configWatcher.on('error', ({ filePath, error }) => {
      this._reloadStats.errors++;
      logger.error(`Config watcher error for ${filePath}: ${error.message}`);
      this.emit?.('configWatcherError', { filePath, error: error.message });
    });

    // Start watching all registered widgets' plugin.json files
    this._startWatchingWidgetConfigs();

    logger.info('Widget config hot-reload enabled');
    return this.configWatcher;
  }

  /**
   * Disable config hot-reload
   */
  disableConfigHotReload() {
    if (this.configWatcher) {
      this.configWatcher.unwatchAll();
      this.configWatcher = null;
      logger.info('Widget config hot-reload disabled');
    }
  }

  /**
   * Check if hot-reload is enabled
   * @returns {boolean}
   */
  isConfigHotReloadEnabled() {
    return !!this.configWatcher;
  }

  /**
   * Get hot-reload statistics
   * @returns {Object} Stats object
   */
  getHotReloadStats() {
    return {
      enabled: this.isConfigHotReloadEnabled(),
      ...this._reloadStats,
      watchedFiles: this.configWatcher?.getWatchedFiles().length || 0,
    };
  }

  /**
   * Find widget ID by its config file path
   * @private
   * @param {string} configPath - Path to config file
   * @returns {string|null} Widget ID or null
   */
  _findWidgetIdByConfigPath(configPath) {
    for (const [id, widget] of this.widgetRegistry) {
      // Check if the widget has a plugin path that matches
      if (widget.metadata?._pluginPath) {
        const expectedPath = join(widget.metadata._pluginPath, 'plugin.json');
        if (configPath === expectedPath || configPath.endsWith(expectedPath)) {
          return id;
        }
      }
    }
    return null;
  }

  /**
   * Reload widget configuration from file
   * @private
   * @param {string} widgetId - Widget ID
   * @param {string} filePath - Path to plugin.json
   * @returns {Object} Reload result { success: boolean, config?: Object, error?: string }
   */
  async _reloadWidgetConfig(widgetId, filePath) {
    const widget = this.widgetRegistry.get(widgetId);
    if (!widget) {
      return { success: false, error: 'Widget not found in registry' };
    }

    try {
      // Read new manifest
      const fs = await import('fs');
      const manifestContent = fs.readFileSync(filePath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Validate manifest
      const validation = validateManifest(manifest);
      if (!validation.valid) {
        return { success: false, error: `Manifest validation failed: ${validation.errors.join(', ')}` };
      }

      // Process new config
      let newConfig = {};
      if (manifest.config) {
        const processingResult = processWidgetConfig(manifest.config, {
          interpolateEnv: true,
          validateVersion: true,
          supportLegacy: true,
          throwOnError: false,
        });

        if (!processingResult.success) {
          return { success: false, error: `Config processing failed: ${processingResult.error}` };
        }

        newConfig = processingResult.config;

        // Sanitize the new config
        try {
          newConfig = sanitizeWidgetConfig(newConfig);
        } catch (err) {
          return { success: false, error: `Config sanitization failed: ${err.message}` };
        }
      }

      // Update widget metadata
      widget.metadata = {
        ...widget.metadata,
        ...manifest,
        config: newConfig,
      };

      // Update widget instance config if loaded
      if (widget.loaded && widget.instance) {
        // Update instance config
        if (widget.instance.config) {
          widget.instance.config = newConfig;
        } else {
          widget.instance.config = newConfig;
        }

        // Call onConfigChange if widget supports it
        if (typeof widget.instance.onConfigChange === 'function') {
          try {
            await widget.instance.onConfigChange(newConfig, widget.instance.config);
          } catch (err) {
            logger.warn(`Widget ${widgetId} onConfigChange failed: ${err.message}`);
          }
        }
      }

      return { success: true, config: newConfig };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Start watching all widget config files
   * @private
   */
  _startWatchingWidgetConfigs() {
    if (!this.configWatcher) return;

    for (const [id, widget] of this.widgetRegistry) {
      if (widget.metadata?._pluginPath) {
        const configPath = join(widget.metadata._pluginPath, 'plugin.json');
        this.configWatcher.watchFile(configPath);
      }
    }
  }

  /**
   * Watch a specific widget's config file
   * @param {string} widgetId - Widget ID to watch
   * @returns {boolean} True if watching started
   */
  watchWidgetConfig(widgetId) {
    if (!this.configWatcher) {
      logger.warn('Config hot-reload not enabled, call enableConfigHotReload() first');
      return false;
    }

    const widget = this.widgetRegistry.get(widgetId);
    if (!widget?.metadata?._pluginPath) {
      logger.warn(`Widget ${widgetId} does not have a plugin path to watch`);
      return false;
    }

    const configPath = join(widget.metadata._pluginPath, 'plugin.json');
    return this.configWatcher.watchFile(configPath);
  }

  /**
   * Stop watching a specific widget's config file
   * @param {string} widgetId - Widget ID to unwatch
   */
  unwatchWidgetConfig(widgetId) {
    if (!this.configWatcher) return;

    const widget = this.widgetRegistry.get(widgetId);
    if (!widget?.metadata?._pluginPath) return;

    const configPath = join(widget.metadata._pluginPath, 'plugin.json');
    this.configWatcher.unwatchFile(configPath);
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
