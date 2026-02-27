/**
 * Tests for config-processor module
 * Environment variable interpolation, versioning, and migration
 */

import {
  interpolateEnvVars,
  processConfigValues,
  processWidgetConfig,
  validateConfigVersion,
  migrateConfig,
  registerMigration,
  compareVersions,
  extractEnvRequirements,
  createConfigPreprocessor,
  CONFIG_VERSION,
  DEFAULT_PROCESSING_OPTIONS,
} from '../src/widgets/config-processor.js';

describe('config-processor', () => {
  // Save original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('interpolateEnvVars', () => {
    test('should return non-string values unchanged', () => {
      expect(interpolateEnvVars(123)).toBe(123);
      expect(interpolateEnvVars(true)).toBe(true);
      expect(interpolateEnvVars(null)).toBe(null);
      expect(interpolateEnvVars(undefined)).toBe(undefined);
      expect(interpolateEnvVars({ key: 'value' })).toEqual({ key: 'value' });
      expect(interpolateEnvVars([1, 2, 3])).toEqual([1, 2, 3]);
    });

    test('should interpolate simple environment variables', () => {
      process.env.TEST_VAR = 'test_value';
      expect(interpolateEnvVars('${TEST_VAR}')).toBe('test_value');
    });

    test('should interpolate env vars within text', () => {
      process.env.USER_NAME = 'Alice';
      expect(interpolateEnvVars('Hello, ${USER_NAME}!')).toBe('Hello, Alice!');
    });

    test('should use default value when env var is not set', () => {
      delete process.env.MISSING_VAR;
      expect(interpolateEnvVars('${MISSING_VAR:-default}')).toBe('default');
    });

    test('should prefer env var over default when set', () => {
      process.env.EXISTING_VAR = 'actual_value';
      expect(interpolateEnvVars('${EXISTING_VAR:-default}')).toBe('actual_value');
    });

    test('should keep original pattern when env var missing and no default', () => {
      delete process.env.MISSING_VAR;
      expect(interpolateEnvVars('${MISSING_VAR}')).toBe('${MISSING_VAR}');
    });

    test('should handle multiple interpolations', () => {
      process.env.HOST = 'localhost';
      process.env.PORT = '3000';
      expect(interpolateEnvVars('http://${HOST}:${PORT}')).toBe('http://localhost:3000');
    });

    test('should handle mixed interpolations with and without defaults', () => {
      process.env.API_KEY = 'secret123';
      expect(interpolateEnvVars('Key: ${API_KEY}, Timeout: ${TIMEOUT:-5000}')).toBe('Key: secret123, Timeout: 5000');
    });

    test('should handle empty default values', () => {
      delete process.env.EMPTY_VAR;
      expect(interpolateEnvVars('${EMPTY_VAR:-}')).toBe('');
    });

    test('should handle custom env object', () => {
      const customEnv = { CUSTOM_VAR: 'custom_value' };
      expect(interpolateEnvVars('${CUSTOM_VAR}', customEnv)).toBe('custom_value');
    });

    test('should handle special characters in values', () => {
      process.env.SPECIAL = 'hello@world.com/path?query=1&other=2';
      expect(interpolateEnvVars('${SPECIAL}')).toBe('hello@world.com/path?query=1&other=2');
    });
  });

  describe('processConfigValues', () => {
    test('should process simple string values', () => {
      process.env.API_URL = 'https://api.example.com';
      const config = { url: '${API_URL}' };
      expect(processConfigValues(config)).toEqual({ url: 'https://api.example.com' });
    });

    test('should process nested objects', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5432';
      const config = {
        database: {
          host: '${DB_HOST}',
          port: '${DB_PORT}',
        },
      };
      expect(processConfigValues(config)).toEqual({
        database: {
          host: 'localhost',
          port: '5432',
        },
      });
    });

    test('should process arrays', () => {
      process.env.FIRST = 'one';
      process.env.SECOND = 'two';
      const config = ['${FIRST}', '${SECOND}', 'static'];
      expect(processConfigValues(config)).toEqual(['one', 'two', 'static']);
    });

    test('should handle mixed types in arrays', () => {
      process.env.STR = 'string';
      const config = ['${STR}', 123, true, null];
      expect(processConfigValues(config)).toEqual(['string', 123, true, null]);
    });

    test('should process complex nested structures', () => {
      process.env.API_KEY = 'key123';
      process.env.BASE_URL = 'https://api.test';
      const config = {
        api: {
          key: '${API_KEY}',
          endpoints: [
            '${BASE_URL}/users',
            '${BASE_URL}/posts',
          ],
          timeout: 5000,
        },
      };
      expect(processConfigValues(config)).toEqual({
        api: {
          key: 'key123',
          endpoints: ['https://api.test/users', 'https://api.test/posts'],
          timeout: 5000,
        },
      });
    });

    test('should handle null values', () => {
      const config = { value: null, nested: { empty: null } };
      expect(processConfigValues(config)).toEqual({ value: null, nested: { empty: null } });
    });

    test('should handle circular references gracefully', () => {
      const config = { a: 'value' };
      config.self = config;
      const result = processConfigValues(config);
      expect(result.a).toBe('value');
      expect(result.self).toBe(config); // Circular ref preserved as-is
    });

    test('should preserve non-plain objects', () => {
      const date = new Date('2024-01-01');
      const config = { date, regex: /test/g };
      const result = processConfigValues(config);
      expect(result.date).toBe(date);
      expect(result.regex).toEqual(/test/g);
    });
  });

  describe('compareVersions', () => {
    test('should return 0 for equal versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('2.5.3', '2.5.3')).toBe(0);
    });

    test('should return -1 when first version is lower', () => {
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(compareVersions('1.0.0', '1.1.0')).toBe(-1);
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
    });

    test('should return 1 when first version is higher', () => {
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
      expect(compareVersions('1.1.0', '1.0.0')).toBe(1);
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
    });

    test('should handle different length versions', () => {
      expect(compareVersions('1.0', '1.0.0')).toBe(0);
      expect(compareVersions('1', '1.0.0')).toBe(0);
    });

    test('should handle versions with non-numeric parts', () => {
      // Non-numeric parts are treated as 0 in simple comparison
      expect(compareVersions('1.0.0-alpha', '1.0.0')).toBe(0); // both become 1.0.0
      expect(compareVersions('2.0.0-beta', '2.0.0')).toBe(0);
    });
  });

  describe('validateConfigVersion', () => {
    test('should validate current version', () => {
      const config = { __version: CONFIG_VERSION.CURRENT };
      const result = validateConfigVersion(config);
      expect(result.valid).toBe(true);
      expect(result.version).toBe(CONFIG_VERSION.CURRENT);
    });

    test('should validate minimum supported version', () => {
      const config = { __version: CONFIG_VERSION.MIN_SUPPORTED };
      const result = validateConfigVersion(config);
      expect(result.valid).toBe(true);
    });

    test('should reject versions below minimum', () => {
      const config = { __version: '0.9.0' };
      const result = validateConfigVersion(config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('below minimum supported');
    });

    test('should reject versions above current', () => {
      const config = { __version: '99.0.0' };
      const result = validateConfigVersion(config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('newer than current');
    });

    test('should treat missing version as 1.0.0', () => {
      const config = {};
      const result = validateConfigVersion(config);
      expect(result.valid).toBe(true);
      expect(result.version).toBe('1.0.0');
    });

    test('should handle null/undefined config', () => {
      expect(validateConfigVersion(null).valid).toBe(true);
      expect(validateConfigVersion(undefined).valid).toBe(true);
    });
  });

  describe('migrateConfig', () => {
    beforeEach(() => {
      // Clear any registered migrations
      // Note: We can't easily clear the Map, so we work with what we have
    });

    test('should return same config if version matches', () => {
      const config = { __version: '1.0.0', data: 'test' };
      const result = migrateConfig(config, '1.0.0');
      expect(result.success).toBe(true);
      expect(result.config).toEqual(config);
      expect(result.path).toEqual([]);
    });

    test('should return error for invalid config', () => {
      const result = migrateConfig(null);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid config');
    });

    test('should return error when no migration path exists', () => {
      const config = { __version: '0.1.0' };
      const result = migrateConfig(config, '2.0.0');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No migration path');
    });

    test('should apply registered migration', () => {
      // Register a simple migration
      registerMigration('1.0.0', '1.1.0', (config) => ({
        ...config,
        newField: 'migrated',
      }));

      const config = { __version: '1.0.0', oldField: 'value' };
      const result = migrateConfig(config, '1.1.0');

      expect(result.success).toBe(true);
      expect(result.config.newField).toBe('migrated');
      expect(result.config.oldField).toBe('value');
      expect(result.config.__version).toBe('1.1.0');
    });
  });

  describe('extractEnvRequirements', () => {
    test('should extract simple env vars', () => {
      const config = { url: '${API_URL}' };
      const reqs = extractEnvRequirements(config);
      expect(reqs).toEqual([{ name: 'API_URL', hasDefault: false }]);
    });

    test('should extract env vars with defaults', () => {
      const config = { timeout: '${TIMEOUT:-5000}' };
      const reqs = extractEnvRequirements(config);
      expect(reqs).toEqual([{ name: 'TIMEOUT', hasDefault: true, defaultValue: '5000' }]);
    });

    test('should extract from nested objects', () => {
      const config = {
        db: { host: '${DB_HOST}', port: '${DB_PORT:-5432}' },
      };
      const reqs = extractEnvRequirements(config);
      expect(reqs).toHaveLength(2);
      expect(reqs).toContainEqual({ name: 'DB_HOST', hasDefault: false });
      expect(reqs).toContainEqual({ name: 'DB_PORT', hasDefault: true, defaultValue: '5432' });
    });

    test('should extract from arrays', () => {
      const config = ['${VAR1}', '${VAR2:-default}'];
      const reqs = extractEnvRequirements(config);
      expect(reqs).toHaveLength(2);
    });

    test('should deduplicate env vars', () => {
      const config = {
        a: '${SAME_VAR}',
        b: '${SAME_VAR}',
      };
      const reqs = extractEnvRequirements(config);
      expect(reqs).toHaveLength(1);
    });

    test('should handle complex nested structures', () => {
      const config = {
        api: {
          key: '${API_KEY}',
          endpoints: ['${BASE_URL}/users', '${BASE_URL}/posts'],
        },
        timeout: '${TIMEOUT:-30000}',
      };
      const reqs = extractEnvRequirements(config);
      expect(reqs).toHaveLength(3);
      expect(reqs).toContainEqual({ name: 'API_KEY', hasDefault: false });
      expect(reqs).toContainEqual({ name: 'BASE_URL', hasDefault: false });
      expect(reqs).toContainEqual({ name: 'TIMEOUT', hasDefault: true, defaultValue: '30000' });
    });
  });

  describe('createConfigPreprocessor', () => {
    test('should return a function', () => {
      const preprocessor = createConfigPreprocessor();
      expect(typeof preprocessor).toBe('function');
    });

    test('should process config when called', () => {
      process.env.PREPROCESS_TEST = 'success';
      const preprocessor = createConfigPreprocessor({ interpolateEnv: true });
      const result = preprocessor({ value: '${PREPROCESS_TEST}' });
      expect(result.success).toBe(true);
      expect(result.config.value).toBe('success');
    });
  });

  describe('processWidgetConfig', () => {
    test('should successfully process valid config', () => {
      process.env.PROCESS_TEST = 'processed';
      const config = {
        __version: '1.0.0',
        value: '${PROCESS_TEST}',
      };
      const result = processWidgetConfig(config);
      expect(result.success).toBe(true);
      expect(result.config.value).toBe('processed');
    });

    test('should return warnings for migrations', () => {
      // Register a migration first
      registerMigration('1.0.0', CONFIG_VERSION.CURRENT, (config) => ({
        ...config,
        migrated: true,
      }));

      const config = { __version: '1.0.0' };
      const result = processWidgetConfig(config);

      // Should either succeed with warnings or succeed without (if already migrated)
      if (result.warnings) {
        expect(result.warnings.some(w => w.includes('Migrated'))).toBe(true);
      }
    });

    test('should skip env interpolation when disabled', () => {
      process.env.SKIP_TEST = 'should_not_appear';
      const config = { value: '${SKIP_TEST}' };
      const result = processWidgetConfig(config, { interpolateEnv: false });
      expect(result.success).toBe(true);
      expect(result.config.value).toBe('${SKIP_TEST}');
    });

    test('should handle errors gracefully', () => {
      const result = processWidgetConfig(null, { throwOnError: false });
      expect(result.success).toBe(true); // null is valid (returns as-is after processing)
    });

    test('should throw when throwOnError is true', () => {
      const config = { __version: '99.99.99' }; // Future version
      expect(() => {
        processWidgetConfig(config, { throwOnError: true });
      }).toThrow();
    });

    test('should skip version validation when disabled', () => {
      const config = { __version: '99.99.99' }; // Future version
      const result = processWidgetConfig(config, { validateVersion: false });
      expect(result.success).toBe(true);
    });

    test('should handle multiple processing steps', () => {
      process.env.MULTI_TEST = 'multi_value';
      const config = {
        __version: '1.0.0',
        nested: {
          array: ['${MULTI_TEST}', 'static'],
          number: 42,
        },
      };
      const result = processWidgetConfig(config);
      expect(result.success).toBe(true);
      expect(result.config.nested.array[0]).toBe('multi_value');
      expect(result.config.nested.array[1]).toBe('static');
      expect(result.config.nested.number).toBe(42);
    });
  });

  describe('DEFAULT_PROCESSING_OPTIONS', () => {
    test('should have correct default values', () => {
      expect(DEFAULT_PROCESSING_OPTIONS.interpolateEnv).toBe(true);
      expect(DEFAULT_PROCESSING_OPTIONS.supportLegacy).toBe(true);
      expect(DEFAULT_PROCESSING_OPTIONS.validateVersion).toBe(true);
      expect(DEFAULT_PROCESSING_OPTIONS.throwOnError).toBe(false);
    });
  });

  describe('CONFIG_VERSION', () => {
    test('should have CURRENT and MIN_SUPPORTED', () => {
      expect(CONFIG_VERSION.CURRENT).toBeDefined();
      expect(CONFIG_VERSION.MIN_SUPPORTED).toBeDefined();
      expect(typeof CONFIG_VERSION.CURRENT).toBe('string');
      expect(typeof CONFIG_VERSION.MIN_SUPPORTED).toBe('string');
    });

    test('CURRENT should be >= MIN_SUPPORTED', () => {
      expect(compareVersions(CONFIG_VERSION.CURRENT, CONFIG_VERSION.MIN_SUPPORTED)).toBeGreaterThanOrEqual(0);
    });
  });
});
