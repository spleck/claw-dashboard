/**
 * Tests for plugin-reload module
 * Hot-reload functionality for plugin development
 */

import { jest } from '@jest/globals';
import {
  PluginReloadManager,
  createPluginReloadManager,
  getPluginReloadManager,
} from '../src/plugin-reload.js';

import { WidgetLoader } from '../src/widgets/widget-loader.js';
import { ConfigWatcher } from '../src/config-watcher.js';

import { writeFileSync, mkdirSync, unlinkSync, rmdirSync, existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';

// Mock logger to avoid noise in tests
jest.mock('../src/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Helper to create a test plugin
function createTestPlugin(pluginsDir, id, version = '1.0.0') {
  const pluginDir = join(pluginsDir, id);
  mkdirSync(pluginDir, { recursive: true });

  const manifest = {
    id,
    name: `Test Plugin ${id}`,
    version,
    type: 'widget',
    description: 'Test plugin for hot-reload',
    author: 'Test',
  };

  writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(manifest, null, 2));

  const code = `
export default class TestWidget {
  constructor(config) {
    this.config = config;
    this.version = '${version}';
  }
  render() { return 'render-${version}'; }
  getData() { return { version: '${version}' }; }
  destroy() {}
}
`;

  writeFileSync(join(pluginDir, 'index.js'), code);

  return { pluginDir, manifest };
}

describe('plugin-reload', () => {
  let testDir;
  let pluginsDir;
  let widgetLoader;

  beforeEach(() => {
    // Create temporary directories
    testDir = mkdtempSync(join(tmpdir(), 'plugin-reload-test-'));
    pluginsDir = join(testDir, 'plugins');
    mkdirSync(pluginsDir, { recursive: true });

    // Create widget loader
    widgetLoader = new WidgetLoader({
      pluginsDir,
    });
  });

  afterEach(async () => {
    // Clean up
    try {
      if (existsSync(testDir)) {
        const rmDir = (dir) => {
          const files = readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = join(dir, file.name);
            if (file.isDirectory()) {
              rmDir(fullPath);
            } else {
              try { unlinkSync(fullPath); } catch (e) {}
            }
          }
          try { rmdirSync(dir); } catch (e) {}
        };
        rmDir(testDir);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('PluginReloadManager constructor', () => {
    test('should create instance with default options', () => {
      const manager = new PluginReloadManager();

      expect(manager.options.debounceMs).toBe(300);
      expect(manager.options.autoReload).toBe(true);
      expect(manager.options.showNotifications).toBe(true);
      expect(manager.isRunning).toBe(false);
      expect(manager.watchedPlugins.size).toBe(0);
      expect(manager.widgetLoader).toBeNull();
    });

    test('should merge custom options with defaults', () => {
      const manager = new PluginReloadManager({
        debounceMs: 500,
        autoReload: false,
        customOption: 'test',
      });

      expect(manager.options.debounceMs).toBe(500);
      expect(manager.options.autoReload).toBe(false);
      expect(manager.options.showNotifications).toBe(true); // default preserved
      expect(manager.options.customOption).toBe('test');
    });

    test('should accept widget loader in constructor', () => {
      const manager = new PluginReloadManager({ widgetLoader });
      expect(manager.widgetLoader).toBe(widgetLoader);
    });
  });

  describe('setWidgetLoader', () => {
    test('should set widget loader', () => {
      const manager = new PluginReloadManager();
      expect(manager.widgetLoader).toBeNull();

      manager.setWidgetLoader(widgetLoader);
      expect(manager.widgetLoader).toBe(widgetLoader);
    });
  });

  describe('start', () => {
    test('should fail if no widget loader is set', () => {
      const manager = new PluginReloadManager();
      const result = manager.start();

      expect(result).toBe(false);
      expect(manager.isRunning).toBe(false);
    });

    test('should start watching plugins directory', () => {
      // Create a test plugin
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({
        widgetLoader,
        pluginsDir,
      });

      const result = manager.start();

      expect(result).toBe(true);
      expect(manager.isRunning).toBe(true);
      expect(manager.watcher).toBeInstanceOf(ConfigWatcher);
      expect(manager.watchedPlugins.has('test-plugin')).toBe(true);

      manager.stop();
    });

    test('should return true if already running', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      const result = manager.start();

      expect(result).toBe(true);
      expect(manager.isRunning).toBe(true);

      manager.stop();
    });

    test('should handle missing plugins directory gracefully', () => {
      const nonExistentDir = join(testDir, 'non-existent', 'plugins');

      const manager = new PluginReloadManager({
        widgetLoader,
        pluginsDir: nonExistentDir,
      });

      const result = manager.start();

      expect(result).toBe(true); // Still starts, just logs warning
      expect(manager.isRunning).toBe(true);

      manager.stop();
    });
  });

  describe('stop', () => {
    test('should stop watching and clean up', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      expect(manager.isRunning).toBe(true);
      expect(manager.watchedPlugins.size).toBeGreaterThan(0);

      manager.stop();

      expect(manager.isRunning).toBe(false);
      expect(manager.watchedPlugins.size).toBe(0);
      expect(manager.watcher).toBeNull();
    });

    test('should handle stop when not running', () => {
      const manager = new PluginReloadManager();

      expect(() => manager.stop()).not.toThrow();
      expect(manager.isRunning).toBe(false);
    });
  });

  describe('addHook', () => {
    test('should add hooks for valid types', () => {
      const manager = new PluginReloadManager();
      const handler = jest.fn();

      manager.addHook('beforeReload', handler);
      manager.addHook('afterReload', handler);
      manager.addHook('onError', handler);

      expect(manager.hooks.beforeReload).toContain(handler);
      expect(manager.hooks.afterReload).toContain(handler);
      expect(manager.hooks.onError).toContain(handler);
    });

    test('should throw for unknown hook types', () => {
      const manager = new PluginReloadManager();

      expect(() => manager.addHook('unknownHook', jest.fn())).toThrow('Unknown hook type');
    });
  });

  describe('reloadPlugin', () => {
    test('should call widgetLoader.unregister for existing plugin', async () => {
      createTestPlugin(pluginsDir, 'test-plugin', '1.0.0');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      // Mock the widgetLoader methods
      const unregisterSpy = jest.spyOn(widgetLoader, 'unregister').mockResolvedValue(true);
      const loadPluginSpy = jest.spyOn(widgetLoader, 'loadPlugin').mockResolvedValue('test-plugin');
      jest.spyOn(widgetLoader, 'isLoaded').mockReturnValue(true);
      jest.spyOn(widgetLoader.widgetRegistry, 'has').mockReturnValue(true);

      const { pluginDir } = createTestPlugin(pluginsDir, 'test-plugin');

      const result = await manager.reloadPlugin(
        'test-plugin',
        pluginDir,
        join(pluginDir, 'plugin.json'),
        join(pluginDir, 'index.js')
      );

      expect(result.success).toBe(true);
      expect(unregisterSpy).toHaveBeenCalledWith('test-plugin');
      expect(loadPluginSpy).toHaveBeenCalled();

      manager.stop();
    });

    test('should load new plugin when not previously registered', async () => {
      createTestPlugin(pluginsDir, 'new-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      // Mock widgetLoader to simulate new plugin
      jest.spyOn(widgetLoader, 'isLoaded').mockReturnValue(false);
      jest.spyOn(widgetLoader.widgetRegistry, 'has').mockReturnValue(false);
      const loadPluginSpy = jest.spyOn(widgetLoader, 'loadPlugin').mockResolvedValue('new-plugin');

      const pluginDir = join(pluginsDir, 'new-plugin');

      const result = await manager.reloadPlugin(
        'new-plugin',
        pluginDir,
        join(pluginDir, 'plugin.json'),
        join(pluginDir, 'index.js')
      );

      expect(result.success).toBe(true);
      expect(result.isNew).toBe(true);
      expect(loadPluginSpy).toHaveBeenCalled();

      manager.stop();
    });

    test('should handle errors from widgetLoader.loadPlugin', async () => {
      createTestPlugin(pluginsDir, 'error-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      // Mock widgetLoader to throw error
      jest.spyOn(widgetLoader.widgetRegistry, 'has').mockReturnValue(false);
      jest.spyOn(widgetLoader, 'loadPlugin').mockRejectedValue(new Error('Failed to load plugin'));

      const pluginDir = join(pluginsDir, 'error-plugin');

      const result = await manager.reloadPlugin(
        'error-plugin',
        pluginDir,
        join(pluginDir, 'plugin.json'),
        join(pluginDir, 'index.js')
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load plugin');

      manager.stop();
    });

    test('should call beforeReload and afterReload hooks', async () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      const beforeHook = jest.fn();
      const afterHook = jest.fn();

      manager.addHook('beforeReload', beforeHook);
      manager.addHook('afterReload', afterHook);
      manager.start();

      // Mock widgetLoader
      jest.spyOn(widgetLoader.widgetRegistry, 'has').mockReturnValue(false);
      jest.spyOn(widgetLoader, 'loadPlugin').mockResolvedValue('test-plugin');

      const pluginDir = join(pluginsDir, 'test-plugin');

      await manager.reloadPlugin(
        'test-plugin',
        pluginDir,
        join(pluginDir, 'plugin.json'),
        join(pluginDir, 'index.js')
      );

      expect(beforeHook).toHaveBeenCalled();
      expect(afterHook).toHaveBeenCalled();
      expect(beforeHook.mock.calls[0][0].id).toBe('test-plugin');
      expect(afterHook.mock.calls[0][0].id).toBe('test-plugin');
      expect(afterHook.mock.calls[0][0].loadTime).toBeDefined();

      manager.stop();
    });

    test('should call onError hook when reload fails', async () => {
      createTestPlugin(pluginsDir, 'bad-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      const errorHook = jest.fn();

      manager.addHook('onError', errorHook);
      manager.start();

      // Mock widgetLoader to throw
      jest.spyOn(widgetLoader.widgetRegistry, 'has').mockReturnValue(false);
      jest.spyOn(widgetLoader, 'loadPlugin').mockRejectedValue(new Error('Syntax error'));

      const pluginDir = join(pluginsDir, 'bad-plugin');

      await manager.reloadPlugin(
        'bad-plugin',
        pluginDir,
        join(pluginDir, 'plugin.json'),
        join(pluginDir, 'index.js')
      );

      expect(errorHook).toHaveBeenCalled();
      expect(errorHook.mock.calls[0][0].error).toBeDefined();
      expect(errorHook.mock.calls[0][0].type).toBe('reload');

      manager.stop();
    });
  });

  describe('reload', () => {
    test('should reload a watched plugin by id', async () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      // Mock the reloadPlugin method
      const reloadSpy = jest.spyOn(manager, 'reloadPlugin').mockResolvedValue({
        success: true,
        id: 'test-plugin',
      });

      const result = await manager.reload('test-plugin');

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-plugin');
      expect(reloadSpy).toHaveBeenCalled();

      manager.stop();
    });

    test('should throw if plugin is not being watched', async () => {
      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });

      await expect(manager.reload('non-existent')).rejects.toThrow('not being watched');
    });
  });

  describe('addPlugin', () => {
    test('should add a new plugin to watch list', async () => {
      // Create manager first
      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      // Create plugin after manager started
      const { pluginDir } = createTestPlugin(pluginsDir, 'added-plugin');

      expect(manager.isWatching('added-plugin')).toBe(false);

      await manager.addPlugin(pluginDir);

      expect(manager.isWatching('added-plugin')).toBe(true);

      manager.stop();
    });

    test('should throw if plugin manifest not found', async () => {
      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      const fakeDir = join(pluginsDir, 'fake-plugin');
      mkdirSync(fakeDir);

      await expect(manager.addPlugin(fakeDir)).rejects.toThrow('manifest not found');
    });
  });

  describe('removePlugin', () => {
    test('should remove a plugin from watch list', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      expect(manager.isWatching('test-plugin')).toBe(true);

      const result = manager.removePlugin('test-plugin');

      expect(result).toBe(true);
      expect(manager.isWatching('test-plugin')).toBe(false);

      manager.stop();
    });

    test('should return false if plugin not being watched', () => {
      const manager = new PluginReloadManager();

      const result = manager.removePlugin('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getWatchedPlugins', () => {
    test('should return list of watched plugin IDs', () => {
      createTestPlugin(pluginsDir, 'plugin-a');
      createTestPlugin(pluginsDir, 'plugin-b');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      const plugins = manager.getWatchedPlugins();

      expect(plugins).toContain('plugin-a');
      expect(plugins).toContain('plugin-b');
      expect(plugins).toHaveLength(2);

      manager.stop();
    });

    test('should return empty array when no plugins watched', () => {
      const manager = new PluginReloadManager();

      const plugins = manager.getWatchedPlugins();

      expect(plugins).toEqual([]);
    });
  });

  describe('isWatching', () => {
    test('should return true for watched plugin', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      expect(manager.isWatching('test-plugin')).toBe(true);

      manager.stop();
    });

    test('should return false for unwatched plugin', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      expect(manager.isWatching('non-existent')).toBe(false);

      manager.stop();
    });
  });

  describe('getStats', () => {
    test('should return stats object', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });

      const stats = manager.getStats();

      expect(stats).toEqual({
        isRunning: false,
        watchedPlugins: 0,
        watchedFiles: 0,
        autoReload: true,
      });
    });

    test('should reflect running state', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      const stats = manager.getStats();

      expect(stats.isRunning).toBe(true);
      expect(stats.watchedPlugins).toBe(1);
      expect(stats.watchedFiles).toBeGreaterThan(0);

      manager.stop();
    });
  });

  describe('file change detection', () => {
    test('should detect plugin.json changes and reload', async () => {
      const { pluginDir } = createTestPlugin(pluginsDir, 'test-plugin', '1.0.0');

      const manager = new PluginReloadManager({
        widgetLoader,
        pluginsDir,
        debounceMs: 50,
      });

      const reloadSpy = jest.spyOn(manager, 'reloadPlugin').mockResolvedValue({
        success: true,
        id: 'test-plugin',
      });

      manager.start();

      // Simulate file change by triggering reload handler
      const manifestPath = join(pluginDir, 'plugin.json');
      await manager._handleFileChange(manifestPath);

      expect(reloadSpy).toHaveBeenCalled();

      manager.stop();
    });

    test('should detect index.js changes and reload', async () => {
      const { pluginDir } = createTestPlugin(pluginsDir, 'test-plugin', '1.0.0');

      const manager = new PluginReloadManager({
        widgetLoader,
        pluginsDir,
        debounceMs: 50,
      });

      const reloadSpy = jest.spyOn(manager, 'reloadPlugin').mockResolvedValue({
        success: true,
        id: 'test-plugin',
      });

      manager.start();

      const indexPath = join(pluginDir, 'index.js');
      await manager._handleFileChange(indexPath);

      expect(reloadSpy).toHaveBeenCalled();

      manager.stop();
    });

    test('should ignore changes to non-plugin files', async () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({
        widgetLoader,
        pluginsDir,
        debounceMs: 50,
      });

      const reloadSpy = jest.spyOn(manager, 'reloadPlugin').mockResolvedValue({
        success: true,
        id: 'test-plugin',
      });

      manager.start();

      // Try to handle change for unknown file
      await manager._handleFileChange('/random/path/file.js');

      expect(reloadSpy).not.toHaveBeenCalled();

      manager.stop();
    });

    test('should skip reload when autoReload is disabled', async () => {
      const { pluginDir } = createTestPlugin(pluginsDir, 'test-plugin', '1.0.0');

      const manager = new PluginReloadManager({
        widgetLoader,
        pluginsDir,
        debounceMs: 50,
        autoReload: false,
      });

      const reloadSpy = jest.spyOn(manager, 'reloadPlugin').mockResolvedValue({
        success: true,
        id: 'test-plugin',
      });

      manager.start();

      const indexPath = join(pluginDir, 'index.js');
      await manager._handleFileChange(indexPath);

      expect(reloadSpy).not.toHaveBeenCalled();

      manager.stop();
    });
  });

  describe('createPluginReloadManager', () => {
    test('should create a new manager instance', () => {
      const manager = createPluginReloadManager({ debounceMs: 500 });

      expect(manager).toBeInstanceOf(PluginReloadManager);
      expect(manager.options.debounceMs).toBe(500);
    });
  });

  describe('getPluginReloadManager', () => {
    test('should return singleton instance', () => {
      const manager1 = getPluginReloadManager();
      const manager2 = getPluginReloadManager();

      expect(manager1).toBe(manager2);
    });

    test('should create instance with options if none exists', () => {
      // Note: This may interact with other tests
      const manager = getPluginReloadManager({ debounceMs: 400 });

      expect(manager).toBeInstanceOf(PluginReloadManager);
    });
  });

  describe('_findPluginByPath', () => {
    test('should find plugin by manifest path', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      const pluginDir = join(pluginsDir, 'test-plugin');
      const manifestPath = join(pluginDir, 'plugin.json');

      const result = manager._findPluginByPath(manifestPath);

      expect(result).not.toBeNull();
      expect(result.id).toBe('test-plugin');

      manager.stop();
    });

    test('should find plugin by index.js path', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      const pluginDir = join(pluginsDir, 'test-plugin');
      const indexPath = join(pluginDir, 'index.js');

      const result = manager._findPluginByPath(indexPath);

      expect(result).not.toBeNull();
      expect(result.id).toBe('test-plugin');

      manager.stop();
    });

    test('should return null for unknown path', () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      const result = manager._findPluginByPath('/unknown/path/file.js');

      expect(result).toBeNull();

      manager.stop();
    });
  });

  describe('_clearModuleCache', () => {
    test('should not throw for valid path', () => {
      const manager = new PluginReloadManager();

      expect(() => {
        manager._clearModuleCache('/some/path/file.js');
      }).not.toThrow();
    });
  });

  describe('_updateWatchedFiles', () => {
    test('should update watched plugin info', async () => {
      createTestPlugin(pluginsDir, 'test-plugin');

      const manager = new PluginReloadManager({ widgetLoader, pluginsDir });
      manager.start();

      const pluginDir = join(pluginsDir, 'test-plugin');
      const manifestPath = join(pluginDir, 'plugin.json');
      const indexPath = join(pluginDir, 'index.js');

      // Update with slightly different info
      await manager._updateWatchedFiles('test-plugin', pluginDir, manifestPath, indexPath);

      const info = manager.watchedPlugins.get('test-plugin');
      expect(info).toBeDefined();
      expect(info.pluginPath).toBe(pluginDir);

      manager.stop();
    });
  });
});
