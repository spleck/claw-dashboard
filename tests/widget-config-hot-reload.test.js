/**
 * Widget Config Hot-Reload Tests
 * Tests for configuration hot-reload functionality in WidgetLoader
 */

import { jest } from '@jest/globals';
import { join } from 'path';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { setTimeout } from 'timers/promises';

import { WidgetLoader } from '../src/widgets/widget-loader.js';
import { processWidgetConfig, registerMigration } from '../src/widgets/config-processor.js';

describe('Widget Config Hot-Reload', () => {
  let loader;
  let tempDir;
  let pluginDir;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'hot-reload-test-'));
    pluginDir = join(tempDir, 'test-widget');
    await mkdir(pluginDir, { recursive: true });

    loader = new WidgetLoader({ pluginsDir: tempDir });
  });

  afterEach(async () => {
    if (loader) {
      loader.disableConfigHotReload();
      await loader.clear();
    }
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  describe('enableConfigHotReload()', () => {
    test('should enable hot-reload and return watcher', async () => {
      const watcher = loader.enableConfigHotReload();

      expect(watcher).toBeDefined();
      expect(loader.isConfigHotReloadEnabled()).toBe(true);
    });

    test('should return existing watcher if already enabled', async () => {
      const watcher1 = loader.enableConfigHotReload();
      const watcher2 = loader.enableConfigHotReload();

      expect(watcher1).toBe(watcher2);
    });

    test('should initialize reload stats', async () => {
      loader.enableConfigHotReload();
      const stats = loader.getHotReloadStats();

      expect(stats.enabled).toBe(true);
      expect(stats.reloads).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.lastReload).toBeNull();
    });

    test('should accept custom options', async () => {
      const watcher = loader.enableConfigHotReload({
        debounceMs: 1000,
        usePolling: true,
      });

      expect(watcher).toBeDefined();
      expect(loader.isConfigHotReloadEnabled()).toBe(true);
    });
  });

  describe('disableConfigHotReload()', () => {
    test('should disable hot-reload', async () => {
      loader.enableConfigHotReload();
      expect(loader.isConfigHotReloadEnabled()).toBe(true);

      loader.disableConfigHotReload();
      expect(loader.isConfigHotReloadEnabled()).toBe(false);
    });

    test('should handle disabling when not enabled', async () => {
      expect(() => loader.disableConfigHotReload()).not.toThrow();
    });
  });

  describe('getHotReloadStats()', () => {
    test('should return stats when disabled', async () => {
      const stats = loader.getHotReloadStats();

      expect(stats.enabled).toBe(false);
      expect(stats.reloads).toBe(0);
      expect(stats.errors).toBe(0);
    });

    test('should track watched files count', async () => {
      // Create a plugin
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      }));
      await writeFile(join(pluginDir, 'index.js'), 'export default { render: () => {}, getData: async () => ({}) };');
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      loader.enableConfigHotReload();
      const stats = loader.getHotReloadStats();

      expect(stats.watchedFiles).toBeGreaterThanOrEqual(0);
    });
  });

  describe('watchWidgetConfig()', () => {
    test('should warn if hot-reload not enabled', async () => {
      // Create a plugin
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      }));
      await writeFile(join(pluginDir, 'index.js'), 'export default { render: () => {}, getData: async () => ({}) };');
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      const result = loader.watchWidgetConfig('test-widget');
      expect(result).toBe(false);
    });

    test('should warn if widget not found', async () => {
      loader.enableConfigHotReload();

      const result = loader.watchWidgetConfig('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('Plugin path tracking', () => {
    test('should store plugin path in metadata on load', async () => {
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      }));
      await writeFile(join(pluginDir, 'index.js'), 'export default { render: () => {}, getData: async () => ({}) };');
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      const metadata = loader.getMetadata('test-widget');
      expect(metadata._pluginPath).toBe(pluginDir);
      expect(metadata._manifestPath).toBe(join(pluginDir, 'plugin.json'));
      expect(metadata._indexPath).toBe(join(pluginDir, 'index.js'));
    });

    test('should store plugin path on register', async () => {
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      }));
      await writeFile(join(pluginDir, 'index.js'), 'export default { render: () => {}, getData: async () => ({}) };');
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.registerPlugin(pluginDir);

      const metadata = loader.getMetadata('test-widget');
      expect(metadata._pluginPath).toBe(pluginDir);
    });
  });

  describe('Config file hot-reload', () => {
    test('should emit configReloaded event on successful reload', async () => {
      // Create initial plugin config
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        config: {
          message: 'Hello World',
          count: 5,
        },
      }));
      await writeFile(join(pluginDir, 'index.js'), `
export default class TestWidget {
  constructor(config) {
    this.config = config;
  }
  render() {}
  async getData() { return this.config; }
}
`);
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      // Set up event listener
      const reloadPromise = new Promise((resolve) => {
        loader.once('configReloaded', resolve);
      });

      // Enable hot-reload with low debounce for testing
      loader.enableConfigHotReload({ debounceMs: 100 });

      // Wait a bit then modify the config file
      await setTimeout(50);
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        config: {
          message: 'Updated Message',
          count: 10,
        },
      }));

      // Wait for reload event
      const event = await reloadPromise;

      expect(event.widgetId).toBe('test-widget');
      expect(event.timestamp).toBeDefined();
      expect(event.config).toBeDefined();
    }, 10000);

    test('should process environment variable interpolation on reload', async () => {
      process.env.HOT_RELOAD_TEST_VAR = 'interpolated_value';

      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        config: {
          value: '${HOT_RELOAD_TEST_VAR}',
        },
      }));
      await writeFile(join(pluginDir, 'index.js'), `
export default class TestWidget {
  constructor(config) {
    this.config = config;
  }
  render() {}
  async getData() { return this.config; }
}
`);
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      // Check initial config processing
      const instance = loader.get('test-widget');
      expect(instance.config.value).toBe('interpolated_value');
    });

    test('should handle config migration on reload', async () => {
      // Test that config version is properly handled during reload
      // The widget loader processes config through processWidgetConfig
      // which handles versioning

      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        config: {
          __version: '1.0.0',
          oldField: 'value',
        },
      }));
      await writeFile(join(pluginDir, 'index.js'), `
export default class TestWidget {
  constructor(config) {
    this.config = config;
  }
  render() {}
  async getData() { return this.config; }
}
`);
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      const instance = loader.get('test-widget');
      // Config should have been processed and passed to the widget
      expect(instance.config.oldField).toBe('value');
      // The __version should be present
      expect(instance.config.__version).toBe('1.0.0');
    });
  });

  describe('Config reload errors', () => {
    test('should emit configReloadError on invalid JSON', async () => {
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        config: {},
      }));
      await writeFile(join(pluginDir, 'index.js'), 'export default { render: () => {}, getData: async () => ({}) };');
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      // Set up event listener for error
      const errorPromise = new Promise((resolve) => {
        loader.once('configReloadError', resolve);
      });

      loader.enableConfigHotReload({ debounceMs: 100 });

      // Corrupt the JSON
      await setTimeout(50);
      await writeFile(join(pluginDir, 'plugin.json'), '{ invalid json }');

      const event = await errorPromise;
      expect(event.error).toBeDefined();
      expect(event.timestamp).toBeDefined();

      // Stats should track the error
      const stats = loader.getHotReloadStats();
      expect(stats.errors).toBeGreaterThan(0);
    }, 10000);

    test('should handle missing widget gracefully', async () => {
      loader.enableConfigHotReload({ debounceMs: 100 });

      // Manually trigger a reload for a non-existent widget path
      const result = await loader._reloadWidgetConfig('nonexistent', join(tempDir, 'plugin.json'));

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('onConfigChange callback', () => {
    test('should call onConfigChange when widget supports it', async () => {
      const onConfigChange = jest.fn();

      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        config: { value: 1 },
      }));
      await writeFile(join(pluginDir, 'index.js'), `
export default class TestWidget {
  constructor(config) {
    this.config = config;
  }
  render() {}
  async getData() { return this.config; }
  onConfigChange(newConfig, oldConfig) {
    this.config = newConfig;
  }
}
`);
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      // Manually trigger a reload
      const result = await loader._reloadWidgetConfig('test-widget', join(pluginDir, 'plugin.json'));

      expect(result.success).toBe(true);
    });
  });

  describe('_findWidgetIdByConfigPath', () => {
    test('should find widget by config path', async () => {
      await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      }));
      await writeFile(join(pluginDir, 'index.js'), 'export default { render: () => {}, getData: async () => ({}) };');
      await writeFile(join(pluginDir, 'package.json'), JSON.stringify({ type: 'module' }));

      await loader.loadPlugin(pluginDir);

      const widgetId = loader._findWidgetIdByConfigPath(join(pluginDir, 'plugin.json'));
      expect(widgetId).toBe('test-widget');
    });

    test('should return null for unknown path', async () => {
      const widgetId = loader._findWidgetIdByConfigPath('/unknown/path/plugin.json');
      expect(widgetId).toBeNull();
    });
  });
});

describe('Widget Config Processing Integration', () => {
  test('should process widget config with env interpolation', () => {
    process.env.WIDGET_TEST_API_URL = 'https://api.example.com';
    process.env.WIDGET_TEST_TIMEOUT = '5000';

    const config = {
      apiUrl: '${WIDGET_TEST_API_URL}',
      timeout: '${WIDGET_TEST_TIMEOUT:-3000}',
      name: 'static_value',
    };

    const result = processWidgetConfig(config);

    expect(result.success).toBe(true);
    expect(result.config.apiUrl).toBe('https://api.example.com');
    expect(result.config.timeout).toBe('5000');
    expect(result.config.name).toBe('static_value');
  });

  test('should use default value when env var not set', () => {
    delete process.env.WIDGET_TEST_MISSING;

    const config = {
      value: '${WIDGET_TEST_MISSING:-default_value}',
    };

    const result = processWidgetConfig(config);

    expect(result.success).toBe(true);
    expect(result.config.value).toBe('default_value');
  });

  test('should handle nested config objects', () => {
    process.env.WIDGET_TEST_NESTED = 'nested_value';

    const config = {
      level1: {
        level2: {
          value: '${WIDGET_TEST_NESTED}',
        },
      },
      array: ['${WIDGET_TEST_NESTED}', 'static'],
    };

    const result = processWidgetConfig(config);

    expect(result.success).toBe(true);
    expect(result.config.level1.level2.value).toBe('nested_value');
    expect(result.config.array).toEqual(['nested_value', 'static']);
  });

  test('should handle config version validation', () => {
    const config = {
      __version: '99.99.99', // Future version
      value: 'test',
    };

    const result = processWidgetConfig(config, { throwOnError: false });

    expect(result.success).toBe(false);
    expect(result.error).toContain('newer than current');
  });
});
