/**
 * Manifest Validation on Load Tests
 * Tests that plugin manifests are validated against the schema when loaded
 */

import { jest } from '@jest/globals';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import modules under test
import { WidgetLoader } from '../src/widgets/widget-loader.js';

describe('Manifest Validation on Load', () => {
  let loader;
  let tempDir;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'manifest-validation-test-'));
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

  const createPlugin = async (pluginId, manifest, indexJs = '') => {
    const pluginDir = join(tempDir, pluginId);
    await mkdir(pluginDir, { recursive: true });
    await writeFile(join(pluginDir, 'plugin.json'), JSON.stringify(manifest, null, 2));
    await writeFile(
      join(pluginDir, 'index.js'),
      indexJs || `
        export default class TestWidget {
          constructor(config) { this.config = config; this.name = '${manifest.name || pluginId}'; }
          async render() {}
          async getData() { return {}; }
        }
      `
    );
    return pluginDir;
  };

  describe('Valid Manifests', () => {
    test('should load plugin with valid manifest', async () => {
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        category: 'custom',
      };

      await createPlugin('test-widget', validManifest);
      const id = await loader.loadPlugin(join(tempDir, 'test-widget'));

      expect(id).toBe('test-widget');
      expect(loader.widgetRegistry.has('test-widget')).toBe(true);
    });

    test('should discover plugin with valid manifest', async () => {
      const validManifest = {
        id: 'discover-test',
        name: 'Discover Test',
        version: '1.0.0',
        type: 'widget',
        category: 'system',
      };

      await createPlugin('discover-test', validManifest);
      const discovered = await loader.discoverPlugins();

      expect(discovered.some(p => p.id === 'discover-test')).toBe(true);
    });

    test('should accept manifest with all optional fields', async () => {
      const fullManifest = {
        id: 'full-widget',
        name: 'Full Widget',
        description: 'A complete widget with all fields',
        version: '2.1.0-beta.1',
        author: 'Test Author <test@example.com>',
        category: 'monitoring',
        type: 'widget',
        lazyLoad: true,
        priority: 50,
        config: {
          refreshInterval: 5000,
          maxDataPoints: 30,
        },
        permissions: ['network', 'system'],
        dependencies: ['base-widget'],
        __version: 1,
      };

      await createPlugin('full-widget', fullManifest);
      const id = await loader.loadPlugin(join(tempDir, 'full-widget'));

      expect(id).toBe('full-widget');
    });

    test('should accept valid categories', async () => {
      const categories = ['system', 'monitoring', 'custom', 'example'];

      for (const category of categories) {
        const loader2 = new WidgetLoader({ pluginsDir: tempDir });
        const manifest = {
          id: `cat-${category}`,
          name: `Category ${category}`,
          version: '1.0.0',
          type: 'widget',
          category,
        };

        await createPlugin(`cat-${category}`, manifest);
        const id = await loader2.loadPlugin(join(tempDir, `cat-${category}`));
        expect(id).toBe(`cat-${category}`);
        await loader2.clear();
      }
    });

    test('should accept valid semantic versions', async () => {
      const versions = ['1.0.0', '0.0.1', '10.20.30', '1.0.0-alpha', '2.0.0-beta.1+build123'];

      for (const version of versions) {
        const loader2 = new WidgetLoader({ pluginsDir: tempDir });
        const manifest = {
          id: `ver-${version.replace(/[^a-zA-Z0-9]/g, '-')}`,
          name: `Version Test`,
          version,
          type: 'widget',
        };

        await createPlugin(`ver-${version.replace(/[^a-zA-Z0-9]/g, '-')}`, manifest);
        const id = await loader2.loadPlugin(join(tempDir, `ver-${version.replace(/[^a-zA-Z0-9]/g, '-')}`));
        expect(id).toBeTruthy();
        await loader2.clear();
      }
    });
  });

  describe('Invalid Manifests - Required Fields', () => {
    test('should reject manifest missing id', async () => {
      const invalidManifest = {
        name: 'Missing ID',
        version: '1.0.0',
        type: 'widget',
        // missing id
      };

      await createPlugin('missing-id', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'missing-id'));

      expect(id).toBeNull();
      expect(loader.widgetRegistry.has('missing-id')).toBe(false);
    });

    test('should reject manifest missing name', async () => {
      const invalidManifest = {
        id: 'missing-name',
        version: '1.0.0',
        type: 'widget',
        // missing name
      };

      await createPlugin('missing-name', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'missing-name'));

      expect(id).toBeNull();
    });

    test('should reject manifest missing version', async () => {
      const invalidManifest = {
        id: 'missing-version',
        name: 'Missing Version',
        type: 'widget',
        // missing version
      };

      await createPlugin('missing-version', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'missing-version'));

      expect(id).toBeNull();
    });

    test('should reject manifest missing type', async () => {
      const invalidManifest = {
        id: 'missing-type',
        name: 'Missing Type',
        version: '1.0.0',
        // missing type
      };

      await createPlugin('missing-type', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'missing-type'));

      expect(id).toBeNull();
    });
  });

  describe('Invalid Manifests - Field Formats', () => {
    test('should reject invalid id format', async () => {
      const invalidManifest = {
        id: '_invalid-start',
        name: 'Invalid ID',
        version: '1.0.0',
        type: 'widget',
      };

      await createPlugin('_invalid-start', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, '_invalid-start'));

      expect(id).toBeNull();
    });

    test('should reject id ending with underscore', async () => {
      const invalidManifest = {
        id: 'invalid-end_',
        name: 'Invalid ID End',
        version: '1.0.0',
        type: 'widget',
      };

      await createPlugin('invalid-end_', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'invalid-end_'));

      expect(id).toBeNull();
    });

    test('should reject invalid semantic version', async () => {
      const invalidManifest = {
        id: 'bad-version',
        name: 'Bad Version',
        version: 'not-a-version',
        type: 'widget',
      };

      await createPlugin('bad-version', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-version'));

      expect(id).toBeNull();
    });

    test('should reject invalid version format (missing patch)', async () => {
      const invalidManifest = {
        id: 'short-version',
        name: 'Short Version',
        version: '1.0', // missing patch
        type: 'widget',
      };

      await createPlugin('short-version', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'short-version'));

      expect(id).toBeNull();
    });

    test('should reject invalid category', async () => {
      const invalidManifest = {
        id: 'bad-category',
        name: 'Bad Category',
        version: '1.0.0',
        type: 'widget',
        category: 'invalid-category',
      };

      await createPlugin('bad-category', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-category'));

      expect(id).toBeNull();
    });

    test('should reject invalid type', async () => {
      const invalidManifest = {
        id: 'bad-type',
        name: 'Bad Type',
        version: '1.0.0',
        type: 'invalid-type',
      };

      await createPlugin('bad-type', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-type'));

      expect(id).toBeNull();
    });
  });

  describe('Invalid Manifests - Type Validation', () => {
    test('should reject non-string id', async () => {
      const invalidManifest = {
        id: 123,
        name: 'Non-string ID',
        version: '1.0.0',
        type: 'widget',
      };

      await createPlugin('123', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, '123'));

      expect(id).toBeNull();
    });

    test('should reject non-string version', async () => {
      const invalidManifest = {
        id: 'num-version',
        name: 'Number Version',
        version: 100, // number instead of string
        type: 'widget',
      };

      await createPlugin('num-version', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'num-version'));

      expect(id).toBeNull();
    });

    test('should reject non-boolean lazyLoad', async () => {
      const invalidManifest = {
        id: 'bad-lazyload',
        name: 'Bad LazyLoad',
        version: '1.0.0',
        type: 'widget',
        lazyLoad: 'true', // string instead of boolean
      };

      await createPlugin('bad-lazyload', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-lazyload'));

      expect(id).toBeNull();
    });

    test('should reject priority out of range (negative)', async () => {
      const invalidManifest = {
        id: 'bad-priority-neg',
        name: 'Bad Priority Negative',
        version: '1.0.0',
        type: 'widget',
        priority: -1,
      };

      await createPlugin('bad-priority-neg', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-priority-neg'));

      expect(id).toBeNull();
    });

    test('should reject priority out of range (too high)', async () => {
      const invalidManifest = {
        id: 'bad-priority-high',
        name: 'Bad Priority High',
        version: '1.0.0',
        type: 'widget',
        priority: 2000,
      };

      await createPlugin('bad-priority-high', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-priority-high'));

      expect(id).toBeNull();
    });
  });

  describe('Invalid Manifests - Array Validation', () => {
    test('should reject duplicate permissions', async () => {
      const invalidManifest = {
        id: 'dup-perms',
        name: 'Duplicate Permissions',
        version: '1.0.0',
        type: 'widget',
        permissions: ['network', 'network', 'system'],
      };

      await createPlugin('dup-perms', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'dup-perms'));

      expect(id).toBeNull();
    });

    test('should reject invalid permission value', async () => {
      const invalidManifest = {
        id: 'bad-perm',
        name: 'Bad Permission',
        version: '1.0.0',
        type: 'widget',
        permissions: ['network', 'invalid-perm'],
      };

      await createPlugin('bad-perm', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-perm'));

      expect(id).toBeNull();
    });

    test('should reject duplicate dependencies', async () => {
      const invalidManifest = {
        id: 'dup-deps',
        name: 'Duplicate Dependencies',
        version: '1.0.0',
        type: 'widget',
        dependencies: ['base-widget', 'base-widget'],
      };

      await createPlugin('dup-deps', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'dup-deps'));

      expect(id).toBeNull();
    });

    test('should reject invalid dependency id format', async () => {
      const invalidManifest = {
        id: 'bad-dep-id',
        name: 'Bad Dependency ID',
        version: '1.0.0',
        type: 'widget',
        dependencies: ['_invalid-dep'],
      };

      await createPlugin('bad-dep-id', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-dep-id'));

      expect(id).toBeNull();
    });
  });

  describe('Validation with fallbackOnError', () => {
    test('should throw on invalid manifest when fallbackOnError is false', async () => {
      const invalidManifest = {
        id: 'no-fallback',
        name: 'No Fallback',
        version: 'invalid',
        type: 'widget',
      };

      await createPlugin('no-fallback', invalidManifest);

      await expect(
        loader.loadPlugin(join(tempDir, 'no-fallback'), { fallbackOnError: false })
      ).rejects.toThrow('Invalid plugin manifest');
    });

    test('should return null on invalid manifest when fallbackOnError is true', async () => {
      const invalidManifest = {
        id: 'with-fallback',
        name: 'With Fallback',
        version: 'invalid',
        type: 'widget',
      };

      await createPlugin('with-fallback', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'with-fallback'), { fallbackOnError: true });

      expect(id).toBeNull();
    });
  });

  describe('Discovery with Invalid Plugins', () => {
    test('should skip invalid plugins during discovery', async () => {
      const validManifest = {
        id: 'valid-plugin',
        name: 'Valid Plugin',
        version: '1.0.0',
        type: 'widget',
      };

      const invalidManifest = {
        id: 'invalid-plugin',
        name: 'Invalid Plugin',
        version: 'bad-version',
        type: 'widget',
      };

      await createPlugin('valid-plugin', validManifest);
      await createPlugin('invalid-plugin', invalidManifest);

      const discovered = await loader.discoverPlugins();

      expect(discovered.some(p => p.id === 'valid-plugin')).toBe(true);
      expect(discovered.some(p => p.id === 'invalid-plugin')).toBe(false);
    });

    test('should discover only valid plugins when mixed with invalid ones', async () => {
      const manifests = [
        { id: 'plugin-1', name: 'Plugin 1', version: '1.0.0', type: 'widget' },
        { id: 'plugin-2', name: 'Plugin 2', version: 'invalid', type: 'widget' },
        { id: 'plugin-3', name: 'Plugin 3', version: '2.0.0', type: 'widget' },
        { id: 'plugin-4', name: 'Plugin 4', type: 'widget' }, // missing version
      ];

      for (const manifest of manifests) {
        await createPlugin(manifest.id || 'unknown', manifest);
      }

      const discovered = await loader.discoverPlugins();
      const ids = discovered.map(p => p.id);

      expect(ids).toContain('plugin-1');
      expect(ids).not.toContain('plugin-2');
      expect(ids).toContain('plugin-3');
      expect(ids).not.toContain('plugin-4');
    });
  });

  describe('Registration with Validation', () => {
    test('should register plugin with valid manifest', async () => {
      const validManifest = {
        id: 'reg-test',
        name: 'Registration Test',
        version: '1.0.0',
        type: 'widget',
      };

      await createPlugin('reg-test', validManifest);
      const id = await loader.registerPlugin(join(tempDir, 'reg-test'));

      expect(id).toBe('reg-test');
      expect(loader.widgetRegistry.has('reg-test')).toBe(true);
    });

    test('should skip registration for invalid manifest', async () => {
      const invalidManifest = {
        id: 'reg-invalid',
        name: 'Registration Invalid',
        version: 'bad',
        type: 'widget',
      };

      await createPlugin('reg-invalid', invalidManifest);
      const id = await loader.registerPlugin(join(tempDir, 'reg-invalid'));

      expect(id).toBeNull();
      expect(loader.widgetRegistry.has('reg-invalid')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty manifest object', async () => {
      await createPlugin('empty-manifest', {});
      const id = await loader.loadPlugin(join(tempDir, 'empty-manifest'));

      expect(id).toBeNull();
    });

    test('should handle null manifest values', async () => {
      const invalidManifest = {
        id: null,
        name: null,
        version: null,
        type: null,
      };

      await createPlugin('null-values', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'null-values'));

      expect(id).toBeNull();
    });

    test('should handle very long id', async () => {
      const invalidManifest = {
        id: 'a'.repeat(100),
        name: 'Long ID',
        version: '1.0.0',
        type: 'widget',
      };

      await createPlugin('long-id', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'long-id'));

      expect(id).toBeNull();
    });

    test('should handle empty string name', async () => {
      const invalidManifest = {
        id: 'empty-name',
        name: '',
        version: '1.0.0',
        type: 'widget',
      };

      await createPlugin('empty-name', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'empty-name'));

      expect(id).toBeNull();
    });

    test('should validate __version field', async () => {
      const invalidManifest = {
        id: 'bad-config-version',
        name: 'Bad Config Version',
        version: '1.0.0',
        type: 'widget',
        __version: 0, // below minimum
      };

      await createPlugin('bad-config-version', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'bad-config-version'));

      expect(id).toBeNull();
    });
  });

  describe('Description and Author Field Validation', () => {
    test('should accept manifest with long description', async () => {
      const manifest = {
        id: 'long-desc',
        name: 'Long Description',
        version: '1.0.0',
        type: 'widget',
        description: 'A'.repeat(500), // at max length
      };

      await createPlugin('long-desc', manifest);
      const id = await loader.loadPlugin(join(tempDir, 'long-desc'));

      expect(id).toBe('long-desc');
    });

    test('should reject description exceeding max length', async () => {
      const invalidManifest = {
        id: 'too-long-desc',
        name: 'Too Long Description',
        version: '1.0.0',
        type: 'widget',
        description: 'A'.repeat(501), // exceeds max
      };

      await createPlugin('too-long-desc', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'too-long-desc'));

      expect(id).toBeNull();
    });

    test('should accept manifest with long author', async () => {
      const manifest = {
        id: 'long-author',
        name: 'Long Author',
        version: '1.0.0',
        type: 'widget',
        author: 'A'.repeat(200), // at max length
      };

      await createPlugin('long-author', manifest);
      const id = await loader.loadPlugin(join(tempDir, 'long-author'));

      expect(id).toBe('long-author');
    });

    test('should reject author exceeding max length', async () => {
      const invalidManifest = {
        id: 'too-long-author',
        name: 'Too Long Author',
        version: '1.0.0',
        type: 'widget',
        author: 'A'.repeat(201), // exceeds max
      };

      await createPlugin('too-long-author', invalidManifest);
      const id = await loader.loadPlugin(join(tempDir, 'too-long-author'));

      expect(id).toBeNull();
    });
  });
});
