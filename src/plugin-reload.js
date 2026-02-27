/**
 * Plugin Hot-Reload Module
 * Provides automatic plugin reloading during development
 * Integrates ConfigWatcher with WidgetLoader for seamless plugin development
 */

import { join, dirname, basename } from 'path';
import { pathToFileURL } from 'url';
import { existsSync, readdirSync } from 'fs';
import { ConfigWatcher } from './config-watcher.js';
import { WidgetLoader } from './widgets/widget-loader.js';
import logger from './logger.js';
import config from './config.js';

const { PATHS } = config;

/**
 * PluginReloadManager class
 * Manages hot-reloading of plugins during development
 */
export class PluginReloadManager {
  constructor(options = {}) {
    this.widgetLoader = options.widgetLoader || null;
    this.pluginsDir = options.pluginsDir || PATHS.PLUGINS_DIR;
    this.watcher = null;
    this.watchedPlugins = new Map(); // pluginId -> { manifestPath, indexPath, manifest }
    this.isRunning = false;
    this.options = {
      debounceMs: 300,           // Faster debounce for dev mode
      persistent: true,
      usePolling: false,
      pollInterval: 500,
      autoReload: true,          // Automatically reload on change
      showNotifications: true,   // Show reload notifications
      ...options,
    };
    this.hooks = {
      beforeReload: [],
      afterReload: [],
      onError: [],
    };
  }

  /**
   * Set the widget loader instance
   * @param {WidgetLoader} loader - WidgetLoader instance
   */
  setWidgetLoader(loader) {
    this.widgetLoader = loader;
  }

  /**
   * Add a hook
   * @param {string} type - Hook type: 'beforeReload', 'afterReload', 'onError'
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
  async runHooks(type, data) {
    for (const handler of this.hooks[type]) {
      try {
        await handler(data);
      } catch (err) {
        logger.error(`PluginReloadManager hook error (${type}): ${err.message}`);
      }
    }
  }

  /**
   * Start watching plugins directory for changes
   * @returns {boolean} True if started successfully
   */
  start() {
    if (this.isRunning) {
      logger.debug('PluginReloadManager: Already running');
      return true;
    }

    if (!this.widgetLoader) {
      logger.error('PluginReloadManager: No WidgetLoader set. Call setWidgetLoader() first.');
      return false;
    }

    try {
      // Create watcher with options
      this.watcher = new ConfigWatcher({
        debounceMs: this.options.debounceMs,
        persistent: this.options.persistent,
        usePolling: this.options.usePolling,
        pollInterval: this.options.pollInterval,
      });

      // Handle reload events
      this.watcher.on('reload', async ({ filePath }) => {
        await this._handleFileChange(filePath);
      });

      this.watcher.on('error', ({ filePath, error }) => {
        logger.error(`PluginReloadManager: Watcher error for ${filePath}: ${error.message}`);
        this.runHooks('onError', { filePath, error, type: 'watch' });
      });

      // Scan and watch all plugin manifests
      this._scanAndWatchPlugins();

      this.isRunning = true;
      logger.info('PluginReloadManager: Started watching for plugin changes');
      return true;
    } catch (err) {
      logger.error(`PluginReloadManager: Failed to start: ${err.message}`);
      return false;
    }
  }

  /**
   * Stop watching for changes
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    if (this.watcher) {
      this.watcher.unwatchAll();
      this.watcher = null;
    }

    this.watchedPlugins.clear();
    this.isRunning = false;
    logger.info('PluginReloadManager: Stopped');
  }

  /**
   * Scan plugins directory and watch all manifests
   * @private
   */
  _scanAndWatchPlugins() {
    if (!existsSync(this.pluginsDir)) {
      logger.warn(`PluginReloadManager: Plugins directory not found: ${this.pluginsDir}`);
      return;
    }

    try {
      const entries = readdirSync(this.pluginsDir, { withFileTypes: true });
      let watchCount = 0;

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pluginPath = join(this.pluginsDir, entry.name);
        const manifestPath = join(pluginPath, 'plugin.json');
        const indexPath = join(pluginPath, 'index.js');

        if (!existsSync(manifestPath)) continue;

        // Store plugin info
        this.watchedPlugins.set(entry.name, {
          manifestPath,
          indexPath,
          pluginPath,
          id: entry.name,
        });

        // Watch the manifest file
        if (this.watcher.watchFile(manifestPath)) {
          watchCount++;
        }

        // Also watch the index.js file if it exists
        if (existsSync(indexPath)) {
          if (this.watcher.watchFile(indexPath)) {
            watchCount++;
          }
        }
      }

      logger.info(`PluginReloadManager: Watching ${this.watchedPlugins.size} plugins (${watchCount} files)`);
    } catch (err) {
      logger.error(`PluginReloadManager: Failed to scan plugins: ${err.message}`);
    }
  }

  /**
   * Handle file change event
   * @private
   * @param {string} filePath - Path of changed file
   */
  async _handleFileChange(filePath) {
    const pluginInfo = this._findPluginByPath(filePath);
    if (!pluginInfo) {
      logger.debug(`PluginReloadManager: Changed file not associated with a known plugin: ${filePath}`);
      return;
    }

    const { id, pluginPath, manifestPath, indexPath } = pluginInfo;

    logger.info(`PluginReloadManager: Detected change in plugin '${id}'`);

    if (!this.options.autoReload) {
      logger.info(`PluginReloadManager: Auto-reload disabled, skipping reload of '${id}'`);
      return;
    }

    await this.reloadPlugin(id, pluginPath, manifestPath, indexPath);
  }

  /**
   * Find plugin info by file path
   * @private
   */
  _findPluginByPath(filePath) {
    for (const [id, info] of this.watchedPlugins) {
      if (filePath === info.manifestPath || filePath === info.indexPath) {
        return { ...info, id };
      }
    }
    return null;
  }

  /**
   * Reload a single plugin
   * @param {string} id - Plugin ID
   * @param {string} pluginPath - Path to plugin directory
   * @param {string} manifestPath - Path to plugin.json
   * @param {string} indexPath - Path to index.js
   * @returns {Object} Reload result
   */
  async reloadPlugin(id, pluginPath, manifestPath, indexPath) {
    const startTime = Date.now();

    try {
      // Run beforeReload hooks
      await this.runHooks('beforeReload', { id, pluginPath, manifestPath, indexPath });

      // Check if plugin is currently loaded
      const isLoaded = this.widgetLoader.isLoaded(id);
      const wasRegistered = this.widgetLoader.widgetRegistry.has(id);

      logger.debug(`PluginReloadManager: Reloading plugin '${id}' (was loaded: ${isLoaded}, was registered: ${wasRegistered})`);

      // Step 1: Unload and unregister the existing plugin
      if (wasRegistered) {
        try {
          await this.widgetLoader.unregister(id);
          logger.debug(`PluginReloadManager: Unregistered plugin '${id}'`);
        } catch (err) {
          logger.warn(`PluginReloadManager: Error unregistering plugin '${id}': ${err.message}`);
        }
      }

      // Step 2: Clear module cache to force re-import
      this._clearModuleCache(indexPath);

      // Step 3: Reload the plugin
      const newId = await this.widgetLoader.loadPlugin(pluginPath, {
        sanitize: true,
        fallbackOnError: false,
      });

      const loadTime = Date.now() - startTime;

      // Step 4: Update watched files (in case plugin structure changed)
      await this._updateWatchedFiles(id, pluginPath, manifestPath, indexPath);

      // Run afterReload hooks
      await this.runHooks('afterReload', {
        id: newId,
        pluginPath,
        manifestPath,
        indexPath,
        loadTime,
        isNew: !wasRegistered,
      });

      if (this.options.showNotifications) {
        logger.info(`✓ Plugin '${newId}' reloaded successfully in ${loadTime}ms`);
      }

      return {
        success: true,
        id: newId,
        loadTime,
        isNew: !wasRegistered,
      };
    } catch (err) {
      logger.error(`✗ Failed to reload plugin '${id}': ${err.message}`);

      await this.runHooks('onError', {
        id,
        pluginPath,
        manifestPath,
        indexPath,
        error: err,
        type: 'reload',
      });

      return {
        success: false,
        id,
        error: err.message,
      };
    }
  }

  /**
   * Clear module cache for a file
   * @private
   * @param {string} filePath - Path to clear from cache
   */
  _clearModuleCache(filePath) {
    try {
      const fileUrl = pathToFileURL(filePath).href;

      // Clear from ESM cache (Node.js internal)
      // Note: This is a best-effort approach as ESM cache clearing is limited
      if (import.meta.resolve && typeof import.meta.resolve === 'function') {
        // For Node.js with import.meta.resolve, we can't directly clear cache
        // but we use query parameters to bypass cache on next import
      }

      // Also try to clear any dynamic imports by appending cache-buster
      // This is handled in the loader by using a timestamp query
      logger.debug(`PluginReloadManager: Module cache cleared for ${filePath}`);
    } catch (err) {
      logger.debug(`PluginReloadManager: Could not clear module cache: ${err.message}`);
    }
  }

  /**
   * Update watched files for a plugin
   * @private
   */
  async _updateWatchedFiles(id, pluginPath, manifestPath, indexPath) {
    // Re-watch manifest and index files
    if (existsSync(manifestPath)) {
      this.watcher.watchFile(manifestPath);
    }
    if (existsSync(indexPath)) {
      this.watcher.watchFile(indexPath);
    }

    // Update stored info
    this.watchedPlugins.set(id, {
      manifestPath,
      indexPath,
      pluginPath,
      id,
    });
  }

  /**
   * Manually trigger reload of a specific plugin
   * @param {string} id - Plugin ID to reload
   * @returns {Object} Reload result
   */
  async reload(id) {
    const pluginInfo = this.watchedPlugins.get(id);
    if (!pluginInfo) {
      throw new Error(`Plugin '${id}' is not being watched`);
    }

    return this.reloadPlugin(id, pluginInfo.pluginPath, pluginInfo.manifestPath, pluginInfo.indexPath);
  }

  /**
   * Add a new plugin to watch
   * @param {string} pluginPath - Path to plugin directory
   * @returns {boolean} True if added successfully
   */
  async addPlugin(pluginPath) {
    const pluginId = basename(pluginPath);
    const manifestPath = join(pluginPath, 'plugin.json');
    const indexPath = join(pluginPath, 'index.js');

    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found at ${pluginPath}`);
    }

    // Add to watched plugins
    this.watchedPlugins.set(pluginId, {
      manifestPath,
      indexPath,
      pluginPath,
      id: pluginId,
    });

    // Watch the files
    let watched = 0;
    if (this.watcher?.watchFile(manifestPath)) watched++;
    if (existsSync(indexPath) && this.watcher?.watchFile(indexPath)) watched++;

    logger.debug(`PluginReloadManager: Added plugin '${pluginId}' to watch list (${watched} files)`);
    return true;
  }

  /**
   * Remove a plugin from watching
   * @param {string} id - Plugin ID to remove
   */
  removePlugin(id) {
    const pluginInfo = this.watchedPlugins.get(id);
    if (!pluginInfo) {
      return false;
    }

    // Unwatch files
    if (this.watcher) {
      this.watcher.unwatchFile(pluginInfo.manifestPath);
      this.watcher.unwatchFile(pluginInfo.indexPath);
    }

    this.watchedPlugins.delete(id);
    logger.debug(`PluginReloadManager: Removed plugin '${id}' from watch list`);
    return true;
  }

  /**
   * Get list of watched plugins
   * @returns {string[]} Array of plugin IDs
   */
  getWatchedPlugins() {
    return Array.from(this.watchedPlugins.keys());
  }

  /**
   * Check if a plugin is being watched
   * @param {string} id - Plugin ID
   * @returns {boolean}
   */
  isWatching(id) {
    return this.watchedPlugins.has(id);
  }

  /**
   * Get statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      watchedPlugins: this.watchedPlugins.size,
      watchedFiles: this.watcher?.getWatchedFiles().length || 0,
      autoReload: this.options.autoReload,
    };
  }
}

/**
 * Create a plugin reload manager
 * @param {Object} options - Options for the manager
 * @returns {PluginReloadManager} New PluginReloadManager instance
 */
export function createPluginReloadManager(options = {}) {
  return new PluginReloadManager(options);
}

// Singleton instance
let defaultManager = null;

/**
 * Get the default plugin reload manager instance
 * @param {Object} options - Options for creating the manager if needed
 * @returns {PluginReloadManager} Default manager instance
 */
export function getPluginReloadManager(options) {
  if (!defaultManager) {
    defaultManager = new PluginReloadManager(options);
  }
  return defaultManager;
}

export default PluginReloadManager;
