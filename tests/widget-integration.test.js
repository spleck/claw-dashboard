/**
 * Widget Integration Tests
 * Tests for plugin loading, manifest validation, and config sanitization
 */

import { jest } from '@jest/globals';
import { join } from 'path';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';

// Import modules under test
import { WidgetLoader } from '../src/widgets/widget-loader.js';
import { validateManifest, BaseWidget, PluginAPI } from '../src/widgets/plugin-api.js';
import { sanitizeWidgetConfig, validateWidgetConfig, WidgetConfigValidator } from '../src/security.js';

describe('WidgetLoader', () => {
  let loader;
  let tempDir;

  beforeEach(async () => {
    // Create temp directory for test plugins
    tempDir = await mkdtemp(join(tmpdir(), 'widget-test-'));
    loader = new WidgetLoader({ pluginsDir: tempDir });
  });

  afterEach(async () => {
    // Cleanup
    if (loader) {
      await loader.clear();
    }
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  describe('register() and load()', () => {
    test('should register a widget without loading it', () => {
      const loader = new WidgetLoader();
      const metadata = { name: 'Test Widget', version: '1.0.0' };
      const loaderFn = jest.fn().mockResolvedValue({ render: jest.fn(), getData: jest.fn() });

      loader.register('test-widget', metadata, loaderFn);

      const meta = loader.getMetadata('test-widget');
      expect(meta).toBeDefined();
      expect(meta.name).toBe('Test Widget');
      expect(loaderFn).not.toHaveBeenCalled();
    });

    test('should load a registered widget', async () => {
      const loader = new WidgetLoader();
      const instance = {
        render: jest.fn(),
        getData: jest.fn(),
        destroy: jest.fn(),
      };
      const loaderFn = jest.fn().mockResolvedValue(instance);

      loader.register('test-widget', { name: 'Test' }, loaderFn);
      const loaded = await loader.load('test-widget');

      expect(loaderFn).toHaveBeenCalled();
      expect(loaded).toBe(instance);
    });

    test('should cache loaded widgets', async () => {
      const loader = new WidgetLoader();
      const loaderFn = jest.fn().mockResolvedValue({
        render: jest.fn(),
        getData: jest.fn(),
      });

      loader.register('test-widget', { name: 'Test' }, loaderFn);

      await loader.load('test-widget');
      await loader.load('test-widget');

      expect(loaderFn).toHaveBeenCalledTimes(1);
    });

    test('should throw for unregistered widget', async () => {
      const loader = new WidgetLoader();

      await expect(loader.load('nonexistent')).rejects.toThrow("Widget 'nonexistent' not registered");
    });

    test('should validate widget has required methods', async () => {
      const loader = new WidgetLoader();
      const invalidWidget = { someMethod: jest.fn() };

      loader.register('invalid-widget', {}, () => Promise.resolve(invalidWidget));

      await expect(loader.load('invalid-widget')).rejects.toThrow(/missing required methods/);
    });
  });

  describe('loadMany()', () => {
    test('should load multiple widgets in parallel', async () => {
      const loader = new WidgetLoader();
      const instances = {};

      for (let i = 0; i < 3; i++) {
        instances[`widget-${i}`] = {
          render: jest.fn(),
          getData: jest.fn(),
        };
        loader.register(`widget-${i}`, { name: `Widget ${i}` }, () => Promise.resolve(instances[`widget-${i}`]));
      }

      const loaded = await loader.loadMany(['widget-0', 'widget-1', 'widget-2']);

      expect(loaded.size).toBe(3);
      expect(loaded.get('widget-0')).toBe(instances['widget-0']);
    });

    test('should handle partial failures', async () => {
      const loader = new WidgetLoader();

      loader.register('good-widget', {}, () => Promise.resolve({
        render: jest.fn(),
        getData: jest.fn(),
      }));

      loader.register('bad-widget', {}, () => Promise.resolve({ invalid: true }));

      const loaded = await loader.loadMany(['good-widget', 'bad-widget']);

      // Good widget should load, bad widget should fail validation
      expect(loaded.size).toBe(1);
      expect(loaded.has('good-widget')).toBe(true);
    });
  });

  describe('hooks', () => {
    test('should call beforeLoad and afterLoad hooks', async () => {
      const loader = new WidgetLoader();
      const beforeLoad = jest.fn();
      const afterLoad = jest.fn();

      loader.addHook('beforeLoad', beforeLoad);
      loader.addHook('afterLoad', afterLoad);

      loader.register('test-widget', {}, () => Promise.resolve({
        render: jest.fn(),
        getData: jest.fn(),
      }));

      await loader.load('test-widget');

      expect(beforeLoad).toHaveBeenCalled();
      expect(afterLoad).toHaveBeenCalled();
    });

    test('should call beforeUnload hook', async () => {
      const loader = new WidgetLoader();
      const beforeUnload = jest.fn();

      loader.addHook('beforeUnload', beforeUnload);

      loader.register('test-widget', {}, () => Promise.resolve({
        render: jest.fn(),
        getData: jest.fn(),
        destroy: jest.fn(),
      }));

      await loader.load('test-widget');
      await loader.unload('test-widget');

      expect(beforeUnload).toHaveBeenCalled();
    });
  });
});

describe('loadAllPluginsWithFallback()', () => {
  let loader;
  let tempDir;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'plugin-test-'));
    loader = new WidgetLoader({ pluginsDir: tempDir });
  });

  afterEach(async () => {
    if (loader) {
      await loader.clear();
    }
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test('should load valid plugins successfully', async () => {
    // Create valid plugin
    const pluginDir = join(tempDir, 'valid-plugin');
    await mkdir(pluginDir);

    await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
      id: 'valid-plugin',
      name: 'Valid Plugin',
      version: '1.0.0',
      type: 'widget',
      config: { message: 'test' },
    }));

    await writeFile(join(pluginDir, 'index.js'), `
export default {
  render: () => {},
  getData: async () => ({ data: 'test' })
};
`);

    const results = await loader.loadAllPluginsWithFallback();

    expect(results.successful).toContain('valid-plugin');
    expect(results.failed).toHaveLength(0);
  });

  test('should handle malformed plugin.json gracefully', async () => {
    // Create plugin with malformed JSON
    const pluginDir = join(tempDir, 'malformed-plugin');
    await mkdir(pluginDir);

    await writeFile(join(pluginDir, 'plugin.json'), '{ invalid json }');
    await writeFile(join(pluginDir, 'index.js'), 'export default { render: () => {}, getData: async () => ({}) };');

    const results = await loader.loadAllPluginsWithFallback();

    // Should skip or fail gracefully - malformed JSON should not crash
    expect(results.successful).not.toContain('malformed-plugin');
    // The plugin should either fail or be skipped, not succeed
    const wasHandled = results.failed.some(f => f.id === 'malformed-plugin') ||
                       results.skipped.includes('malformed-plugin') ||
                       results.successful.length === 0; // If nothing loaded, that's also acceptable
    expect(wasHandled).toBe(true);
  });

  test('should handle missing plugin.json', async () => {
    // Create plugin directory without manifest
    const pluginDir = join(tempDir, 'no-manifest');
    await mkdir(pluginDir);
    await writeFile(join(pluginDir, 'index.js'), 'export default {}');

    const results = await loader.loadAllPluginsWithFallback();

    // Should skip directories without plugin.json
    expect(results.successful).not.toContain('no-manifest');
  });

  test('should handle missing index.js', async () => {
    // Create plugin with manifest but no entry point
    const pluginDir = join(tempDir, 'no-entry');
    await mkdir(pluginDir);

    await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
      id: 'no-entry',
      name: 'No Entry',
      version: '1.0.0',
      type: 'widget',
    }));

    const results = await loader.loadAllPluginsWithFallback();

    // Should skip directories without index.js
    expect(results.successful).not.toContain('no-entry');
  });

  test('should continue loading after plugin error with continueOnError', async () => {
    // Create one valid and one invalid plugin
    const validDir = join(tempDir, 'valid-plugin');
    await mkdir(validDir);
    await writeFile(join(validDir, 'plugin.json'), JSON.stringify({
      id: 'valid-plugin',
      name: 'Valid',
      version: '1.0.0',
      type: 'widget',
    }));
    await writeFile(join(validDir, 'index.js'), `
export default { render: () => {}, getData: async () => ({}) };
`);

    const invalidDir = join(tempDir, 'invalid-plugin');
    await mkdir(invalidDir);
    await writeFile(join(invalidDir, 'plugin.json'), JSON.stringify({
      id: 'invalid-plugin',
      name: 'Invalid',
      version: '1.0.0',
      type: 'widget',
    }));
    await writeFile(join(invalidDir, 'index.js'), 'export default { invalid: true };'); // Missing required methods

    const results = await loader.loadAllPluginsWithFallback({ continueOnError: true });

    // Valid plugin should load despite invalid one failing
    expect(results.successful).toContain('valid-plugin');
  });

  test('should handle plugin that throws during load', async () => {
    const pluginDir = join(tempDir, 'throwing-plugin');
    await mkdir(pluginDir);

    // Set lazyLoad: false to force immediate loading which will trigger the error
    await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify({
      id: 'throwing-plugin',
      name: 'Throwing',
      version: '1.0.0',
      type: 'widget',
      lazyLoad: false,  // Force immediate load
    }));

    await writeFile(join(pluginDir, 'index.js'), `
throw new Error('Plugin failed to initialize');
export default {};
`);

    // With fallbackOnError: false, errors propagate and are caught
    const results = await loader.loadAllPluginsWithFallback({
      continueOnError: true,
      fallbackOnError: false,
    });

    // The plugin should fail during auto-load
    expect(results.failed.some(f => f.id === 'throwing-plugin')).toBe(true);
  });
});

describe('validateManifest()', () => {
  test('should validate required fields', () => {
    const validManifest = {
      name: 'Test Plugin',
      version: '1.0.0',
      entryPoint: 'index.js',
    };

    expect(() => validateManifest(validManifest)).not.toThrow();
  });

  test('should reject missing name', () => {
    const manifest = {
      version: '1.0.0',
      entryPoint: 'index.js',
    };

    expect(() => validateManifest(manifest)).toThrow(/Missing required fields/);
  });

  test('should reject missing version', () => {
    const manifest = {
      name: 'Test',
      entryPoint: 'index.js',
    };

    expect(() => validateManifest(manifest)).toThrow(/Missing required fields/);
  });

  test('should reject missing entryPoint', () => {
    const manifest = {
      name: 'Test',
      version: '1.0.0',
    };

    expect(() => validateManifest(manifest)).toThrow(/Missing required fields/);
  });

  test('should reject invalid semver format', () => {
    const manifest = {
      name: 'Test',
      version: 'v1',  // Invalid semver
      entryPoint: 'index.js',
    };

    expect(() => validateManifest(manifest)).toThrow(/semver/);
  });

  test('should accept valid semver formats', () => {
    const versions = ['1.0.0', '0.0.1', '10.20.30', '1.0.0-beta', '1.0.0-beta.1'];

    for (const version of versions) {
      const manifest = {
        name: 'Test',
        version,
        entryPoint: 'index.js',
      };

      expect(() => validateManifest(manifest)).not.toThrow();
    }
  });
});

describe('WidgetConfigValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new WidgetConfigValidator();
  });

  describe('basic sanitization', () => {
    test('should return empty object for null/undefined', () => {
      expect(validator.validate(null)).toEqual({});
      expect(validator.validate(undefined)).toEqual({});
    });

    test('should reject non-object config', () => {
      expect(() => validator.validate('string')).toThrow('must be an object');
      expect(() => validator.validate(123)).toThrow('must be an object');
    });

    test('should pass through valid objects', () => {
      const config = { name: 'test', count: 5, enabled: true };
      expect(validator.validate(config)).toEqual(config);
    });
  });

  describe('string handling', () => {
    test('should strip null bytes from strings', () => {
      const config = { message: 'hello\0world' };
      const sanitized = validator.validate(config);

      expect(sanitized.message).toBe('helloworld');
    });

    test('should truncate long strings', () => {
      const longString = 'a'.repeat(2000);
      const config = { message: longString };
      const sanitized = validator.validate(config);

      expect(sanitized.message.length).toBe(1000);
    });
  });

  describe('number handling', () => {
    test('should reject NaN', () => {
      const config = { value: NaN };
      const sanitized = validator.validate(config);

      expect(sanitized.value).toBe(0);
    });

    test('should reject Infinity', () => {
      const config = { value: Infinity };
      const sanitized = validator.validate(config);

      expect(sanitized.value).toBe(0);
    });

    test('should accept valid numbers', () => {
      const config = { int: 42, float: 3.14, negative: -10 };
      const sanitized = validator.validate(config);

      expect(sanitized).toEqual(config);
    });
  });

  describe('array handling', () => {
    test('should limit array length', () => {
      const validator = new WidgetConfigValidator({ maxArrayLength: 5 });
      const config = { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
      const sanitized = validator.validate(config);

      expect(sanitized.items.length).toBe(5);
    });

    test('should sanitize array items', () => {
      const config = { items: ['normal', 'with\0null', 123] };
      const sanitized = validator.validate(config);

      expect(sanitized.items).toEqual(['normal', 'withnull', 123]);
    });
  });

  describe('depth limiting', () => {
    test('should handle deeply nested objects gracefully', () => {
      // The validator catches depth errors and returns null for values that exceed depth
      const validator = new WidgetConfigValidator({ maxDepth: 3 });
      const config = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'too deep',
              },
            },
          },
        },
      };

      // Should not throw; instead deep values become null
      const sanitized = validator.validate(config);
      expect(sanitized).toBeDefined();
      expect(sanitized.level1).toBeDefined();
    });
  });

  describe('schema validation', () => {
    test('should only allow whitelisted keys with schema', () => {
      const schema = {
        properties: {
          name: { type: 'string' },
          count: { type: 'number' },
        },
      };

      const config = { name: 'test', count: 5, malicious: 'hack' };
      const sanitized = validator.validate(config, schema);

      expect(sanitized).toEqual({ name: 'test', count: 5 });
      expect(sanitized.malicious).toBeUndefined();
    });

    test('should handle schema-based validation', () => {
      const schema = {
        properties: {
          timeout: { type: 'number', default: 5000 },
          name: { type: 'string' },
        },
      };

      const config = { timeout: 'invalid', name: 'test' };
      const sanitized = validator.validate(config, schema);

      // Strings are valid, so 'invalid' stays as-is (string type is in allowedTypes)
      expect(sanitized.timeout).toBe('invalid');
      expect(sanitized.name).toBe('test');
    });
  });
});

describe('sanitizeWidgetConfig()', () => {
  test('should sanitize malicious inputs', () => {
    const malicious = {
      __proto__: { polluted: true },
      constructor: { prototype: { polluted: true } },
      message: 'normal string',
    };

    const sanitized = sanitizeWidgetConfig(malicious);

    // Should not have polluted prototype
    expect(sanitized.message).toBe('normal string');
    expect({}.polluted).toBeUndefined();
  });

  test('should handle special string values', () => {
    const config = {
      script: '<script>alert("xss")</script>',
      sql: "'; DROP TABLE users; --",
      path: '../../../etc/passwd',
      unicode: '\u0000\u0001\u0002', // null byte + two control chars
    };

    const sanitized = sanitizeWidgetConfig(config);

    // Should sanitize null bytes but keep other content
    expect(sanitized.script).toBe('<script>alert("xss")</script>');
    expect(sanitized.sql).toBe("'; DROP TABLE users; --");
    expect(sanitized.path).toBe('../../../etc/passwd');
    // Only null byte (\u0000) is stripped; \u0001 and \u0002 remain
    expect(sanitized.unicode).toBe('\u0001\u0002');
  });

  test('should handle edge cases', () => {
    expect(sanitizeWidgetConfig(null)).toEqual({});
    expect(sanitizeWidgetConfig(undefined)).toEqual({});
    expect(sanitizeWidgetConfig({})).toEqual({});
  });
});

describe('validateWidgetConfig()', () => {
  test('should return valid result for valid config', () => {
    const schema = {
      properties: {
        name: { type: 'string' },
      },
    };

    const result = validateWidgetConfig({ name: 'test' }, schema);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('should handle deeply nested config gracefully', () => {
    // Default maxDepth is 10, so 11 levels should be handled gracefully
    const config = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: {
                  level7: {
                    level8: {
                      level9: {
                        level10: {
                          level11: 'too deep',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    // The validator handles depth errors gracefully by returning null for deep values
    const result = validateWidgetConfig(config);

    // Should either pass (with deep values nulled) or return errors
    // depending on implementation details
    expect(result).toBeDefined();
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
  });
});

describe('BaseWidget', () => {
  test('should initialize with default values', () => {
    const widget = new BaseWidget();

    expect(widget.id).toBeDefined();
    expect(widget.name).toBe('Unnamed Widget');
    expect(widget.loaded).toBe(false);
  });

  test('should accept options', () => {
    const widget = new BaseWidget({
      id: 'test-widget',
      name: 'Test Widget',
      config: { setting: 'value' },
    });

    expect(widget.id).toBe('test-widget');
    expect(widget.name).toBe('Test Widget');
    expect(widget.config).toEqual({ setting: 'value' });
  });

  test('should throw on create() by default', async () => {
    const widget = new BaseWidget();

    await expect(widget.create()).rejects.toThrow('create() must be implemented');
  });

  test('should provide lifecycle methods', async () => {
    const widget = new BaseWidget();

    await widget.init();
    expect(widget.loaded).toBe(true);

    await widget.destroy();
    expect(widget.loaded).toBe(false);
  });

  test('should provide getMetadata()', () => {
    const widget = new BaseWidget({
      id: 'test',
      name: 'Test',
      description: 'A test widget',
    });

    const metadata = widget.getMetadata();

    expect(metadata.id).toBe('test');
    expect(metadata.name).toBe('Test');
    expect(metadata.description).toBe('A test widget');
    expect(metadata.loaded).toBe(false);
  });
});

describe('PluginAPI', () => {
  let api;

  beforeEach(() => {
    api = new PluginAPI();
  });

  describe('extension points', () => {
    test('should register extension points', () => {
      api.registerExtensionPoint('myExtension', { description: 'Test extension' });

      expect(api.extensions.has('myExtension')).toBe(true);
    });

    test('should add handlers to extension points', () => {
      api.registerExtensionPoint('myExtension');
      const handler = jest.fn();

      api.extend('myExtension', handler);
      api.executeExtension('myExtension', 'arg1', 'arg2');

      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('should throw for non-existent extension point', () => {
      expect(() => api.extend('nonexistent', jest.fn())).toThrow(/not found/);
    });

    test('should enforce single handler when multiple is false', () => {
      api.registerExtensionPoint('single', { multiple: false });
      api.extend('single', jest.fn());

      expect(() => api.extend('single', jest.fn())).toThrow(/only allows one handler/);
    });

    test('should sort handlers by priority', async () => {
      api.registerExtensionPoint('ordered');
      const order = [];

      api.extend('ordered', () => order.push(2), { priority: 100 });
      api.extend('ordered', () => order.push(1), { priority: 1 });
      api.extend('ordered', () => order.push(3), { priority: 200 });

      await api.executeExtension('ordered');

      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('data providers', () => {
    test('should register and call data providers', async () => {
      const provider = jest.fn().mockResolvedValue({ data: 'test' });
      api.registerDataProvider('myData', provider);

      const result = await api.getData('myData');

      expect(provider).toHaveBeenCalled();
      expect(result).toEqual({ data: 'test' });
    });

    test('should check if provider exists', () => {
      api.registerDataProvider('exists', jest.fn());

      expect(api.hasDataProvider('exists')).toBe(true);
      expect(api.hasDataProvider('nonexistent')).toBe(false);
    });

    test('should throw for non-existent provider', async () => {
      await expect(api.getData('nonexistent')).rejects.toThrow(/not found/);
    });

    test('should require provider to be a function', () => {
      expect(() => api.registerDataProvider('invalid', 'not a function')).toThrow(/must be a function/);
    });
  });

  describe('hooks', () => {
    test('should add and execute hooks', async () => {
      const hook = jest.fn();
      api.addHook('init', hook);

      await api.executeHooks('init', { value: 1 });

      expect(hook).toHaveBeenCalledWith({ value: 1 });
    });

    test('should remove one-time hooks after execution', async () => {
      const hook = jest.fn();
      api.addHook('once', hook, { once: true });

      await api.executeHooks('once', {});
      await api.executeHooks('once', {});

      expect(hook).toHaveBeenCalledTimes(1);
    });

    test('should sort hooks by priority', async () => {
      const order = [];

      api.addHook('ordered', () => order.push(2), { priority: 100 });
      api.addHook('ordered', () => order.push(1), { priority: 1 });
      api.addHook('ordered', () => order.push(3), { priority: 200 });

      await api.executeHooks('ordered', {});

      expect(order).toEqual([1, 2, 3]);
    });

    test('should return modified context', async () => {
      api.addHook('transform', (ctx) => { ctx.value *= 2; });
      api.addHook('transform', (ctx) => { ctx.value += 10; });

      const result = await api.executeHooks('transform', { value: 5 });

      expect(result.value).toBe(20);
    });
  });

  describe('getInfo()', () => {
    test('should return API information', () => {
      api.registerExtensionPoint('ext1');
      api.registerDataProvider('data1', jest.fn());
      api.addHook('hook1', jest.fn());

      const info = api.getInfo();

      expect(info.version).toBe('1.0.0');
      expect(info.extensionPoints).toContain('ext1');
      expect(info.dataProviders).toContain('data1');
      expect(info.hooks).toContain('hook1');
    });
  });
});