/**
 * Config Watcher Module
 * Watches configuration files for changes and triggers hot-reload
 * Supports debouncing to avoid multiple reloads on rapid file changes
 */

import { watch, watchFile, unwatchFile, existsSync, readdirSync, readFileSync } from 'fs';
import { EventEmitter } from 'events';
import { join } from 'path';
import logger from './logger.js';

/**
 * Default watcher options
 */
export const DEFAULT_WATCHER_OPTIONS = {
  debounceMs: 500,           // Debounce interval for file changes
  persistent: true,          // Keep process running while watching
  encoding: 'utf8',          // File encoding
  usePolling: false,         // Use polling instead of native events (more reliable on some systems)
  pollInterval: 1000,        // Polling interval when usePolling is true
  ignoreInitial: true,       // Ignore the initial 'add' event
};

/**
 * ConfigWatcher class
 * Watches one or more config files for changes and emits reload events
 */
export class ConfigWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = { ...DEFAULT_WATCHER_OPTIONS, ...options };
    this.watchers = new Map();        // filepath -> FSWatcher
    this.pollWatchers = new Map();    // filepath -> poll handle
    this.lastModified = new Map();    // filepath -> timestamp
    this.debounceTimers = new Map();  // filepath -> timer handle
    this.watchedFiles = new Set();    // Set of watched file paths
    this.isRunning = false;
  }

  /**
   * Start watching a config file
   * @param {string} filePath - Path to the file to watch
   * @param {Object} options - Optional override options
   * @returns {boolean} True if successfully started watching
   */
  watchFile(filePath, options = {}) {
    if (!filePath || typeof filePath !== 'string') {
      logger.error('ConfigWatcher: Invalid file path provided');
      return false;
    }

    if (this.watchers.has(filePath)) {
      logger.debug(`ConfigWatcher: Already watching ${filePath}`);
      return true;
    }

    const opts = { ...this.options, ...options };

    // Check if file exists
    if (!existsSync(filePath)) {
      logger.warn(`ConfigWatcher: File not found: ${filePath}`);
      return false;
    }

    try {
      if (opts.usePolling) {
        this._startPolling(filePath, opts);
      } else {
        this._startNativeWatch(filePath, opts);
      }

      this.watchedFiles.add(filePath);
      this.lastModified.set(filePath, Date.now());
      this.isRunning = true;

      logger.info(`ConfigWatcher: Started watching ${filePath}`);
      return true;
    } catch (err) {
      logger.error(`ConfigWatcher: Failed to watch ${filePath}: ${err.message}`);
      return false;
    }
  }

  /**
   * Stop watching a config file
   * @param {string} filePath - Path to stop watching
   */
  unwatchFile(filePath) {
    if (!this.watchers.has(filePath) && !this.pollWatchers.has(filePath)) {
      return;
    }

    // Clear debounce timer if exists
    const timer = this.debounceTimers.get(filePath);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(filePath);
    }

    // Close native watcher
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
    }

    // Stop polling watcher
    if (this.pollWatchers.has(filePath)) {
      unwatchFile(filePath);
      this.pollWatchers.delete(filePath);
    }

    this.watchedFiles.delete(filePath);
    this.lastModified.delete(filePath);

    logger.info(`ConfigWatcher: Stopped watching ${filePath}`);

    if (this.watchers.size === 0 && this.pollWatchers.size === 0) {
      this.isRunning = false;
    }
  }

  /**
   * Start watching multiple files
   * @param {string[]} filePaths - Array of file paths to watch
   * @returns {Object} Results with successful and failed paths
   */
  watchFiles(filePaths) {
    const results = { successful: [], failed: [] };

    for (const filePath of filePaths) {
      if (this.watchFile(filePath)) {
        results.successful.push(filePath);
      } else {
        results.failed.push(filePath);
      }
    }

    return results;
  }

  /**
   * Stop watching all files
   */
  unwatchAll() {
    for (const filePath of this.watchedFiles) {
      this.unwatchFile(filePath);
    }
  }

  /**
   * Get list of watched files
   * @returns {string[]} Array of watched file paths
   */
  getWatchedFiles() {
    return Array.from(this.watchedFiles);
  }

  /**
   * Check if a file is being watched
   * @param {string} filePath - Path to check
   * @returns {boolean} True if being watched
   */
  isWatching(filePath) {
    return this.watchedFiles.has(filePath);
  }

  /**
   * Start native file watcher (fs.watch)
   * @private
   */
  _startNativeWatch(filePath, opts) {
    const watcher = watch(filePath, { persistent: opts.persistent, encoding: opts.encoding });

    watcher.on('change', (eventType) => {
      if (eventType === 'change') {
        this._handleChange(filePath, opts);
      }
    });

    watcher.on('error', (err) => {
      logger.error(`ConfigWatcher: Watcher error for ${filePath}: ${err.message}`);
      this.emit('error', { filePath, error: err });
    });

    watcher.on('close', () => {
      this.watchers.delete(filePath);
      if (this.watchers.size === 0 && this.pollWatchers.size === 0) {
        this.isRunning = false;
      }
    });

    this.watchers.set(filePath, watcher);
  }

  /**
   * Start polling-based watcher (fs.watchFile)
   * @private
   */
  _startPolling(filePath, opts) {
    watchFile(filePath, { persistent: opts.persistent, interval: opts.pollInterval }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        this._handleChange(filePath, opts);
      }
    });

    this.pollWatchers.set(filePath, true);
  }

  /**
   * Handle file change with debouncing
   * @private
   */
  _handleChange(filePath, opts) {
    const now = Date.now();
    const last = this.lastModified.get(filePath) || 0;

    // Update last modified time
    this.lastModified.set(filePath, now);

    // Clear existing debounce timer
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this._emitReload(filePath);
    }, opts.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Emit reload event for a file
   * @private
   */
  _emitReload(filePath) {
    logger.info(`ConfigWatcher: File changed: ${filePath}`);
    this.emit('reload', { filePath, timestamp: Date.now() });
  }

  /**
   * Get watcher statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      watchedFiles: this.watchedFiles.size,
      nativeWatchers: this.watchers.size,
      pollWatchers: this.pollWatchers.size,
      pendingDebounces: this.debounceTimers.size,
    };
  }
}

/**
 * Create a config preprocessor for widget config hot-reload
 * @param {Object} options - Options for the watcher
 * @returns {Object} ConfigWatcher instance
 */
export function createConfigWatcher(options = {}) {
  return new ConfigWatcher(options);
}

/**
 * Watch dashboard settings file and trigger callback on change
 * @param {string} settingsPath - Path to settings file
 * @param {Function} callback - Callback function(settings) to call on change
 * @param {Object} options - Watcher options
 * @returns {ConfigWatcher|null} Watcher instance or null on failure
 */
export function watchSettingsFile(settingsPath, callback, options = {}) {
  if (!existsSync(settingsPath)) {
    logger.warn(`ConfigWatcher: Settings file not found: ${settingsPath}`);
    return null;
  }

  const watcher = createConfigWatcher(options);

  watcher.on('reload', async ({ filePath }) => {
    try {
      const content = readFileSync(filePath, 'utf8');
      const settings = JSON.parse(content);

      logger.info(`ConfigWatcher: Settings reloaded from ${filePath}`);

      // Call the callback with new settings
      if (typeof callback === 'function') {
        await callback(settings, filePath);
      }
    } catch (err) {
      logger.error(`ConfigWatcher: Failed to reload settings: ${err.message}`);
      watcher.emit('error', { filePath, error: err });
    }
  });

  watcher.on('error', ({ filePath, error }) => {
    logger.error(`ConfigWatcher: Error for ${filePath}: ${error.message}`);
  });

  if (!watcher.watchFile(settingsPath)) {
    return null;
  }

  return watcher;
}

/**
 * Watch plugin config directory for changes
 * @param {string} pluginsDir - Path to plugins directory
 * @param {Function} callback - Callback function(pluginId, manifest) to call on change
 * @param {Object} options - Watcher options
 * @returns {ConfigWatcher|null} Watcher instance or null on failure
 */
export function watchPluginsDirectory(pluginsDir, callback, options = {}) {
  if (!existsSync(pluginsDir)) {
    logger.warn(`ConfigWatcher: Plugins directory not found: ${pluginsDir}`);
    return null;
  }

  const watcher = createConfigWatcher(options);

  watcher.on('reload', async ({ filePath }) => {
    try {
      // Determine which plugin was modified
      const relativePath = filePath.replace(pluginsDir, '');
      const pluginId = relativePath.split('/')[1] || relativePath.split('\\')[1];

      if (!pluginId) {
        logger.debug(`ConfigWatcher: Could not determine plugin ID for ${filePath}`);
        return;
      }

      // Read the manifest file
      const manifestPath = join(pluginsDir, pluginId, 'plugin.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

      logger.info(`ConfigWatcher: Plugin ${pluginId} config changed`);

      // Call the callback with plugin ID and manifest
      if (typeof callback === 'function') {
        await callback(pluginId, manifest, filePath);
      }
    } catch (err) {
      logger.error(`ConfigWatcher: Failed to handle plugin change: ${err.message}`);
      watcher.emit('error', { filePath, error: err });
    }
  });

  // Watch all plugin.json files in the plugins directory
  try {
    const entries = readdirSync(pluginsDir, { withFileTypes: true });
    let watchedCount = 0;

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const pluginPath = join(pluginsDir, entry.name);
      const manifestPath = join(pluginPath, 'plugin.json');

      if (existsSync(manifestPath)) {
        if (watcher.watchFile(manifestPath)) {
          watchedCount++;
        }
      }
    }

    if (watchedCount === 0) {
      logger.info(`ConfigWatcher: No plugin configs found in ${pluginsDir}`);
    } else {
      logger.info(`ConfigWatcher: Watching ${watchedCount} plugin configs`);
    }
  } catch (err) {
    logger.error(`ConfigWatcher: Failed to scan plugins directory: ${err.message}`);
    watcher.unwatchAll();
    return null;
  }

  return watcher;
}

// Singleton instance for simple use cases
let defaultWatcher = null;

/**
 * Get the default config watcher instance
 * @param {Object} options - Options for creating the watcher if needed
 * @returns {ConfigWatcher} Default watcher instance
 */
export function getConfigWatcher(options) {
  if (!defaultWatcher) {
    defaultWatcher = new ConfigWatcher(options);
  }
  return defaultWatcher;
}

export default ConfigWatcher;