/**
 * Tests for security module
 * Path validation, sanitization, and widget config security
 */

import {
  isValidPath,
  isSafeToChmod,
  isSafeToChmodSync,
  setSecurePermissions,
  setSecurePermissionsSync,
  sanitizeWidgetConfig,
  validateWidgetConfig,
  WidgetConfigValidator,
  validatePluginPath,
  validatePluginName,
  ApiKeyAuth,
} from '../src/security.js';

import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, chmodSync, symlinkSync } from 'fs';
import { join } from 'path';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import crypto from 'crypto';

describe('security', () => {
  describe('isValidPath', () => {
    test('should return false for null/undefined', () => {
      expect(isValidPath(null)).toBe(false);
      expect(isValidPath(undefined)).toBe(false);
    });

    test('should return false for non-string types', () => {
      expect(isValidPath(123)).toBe(false);
      expect(isValidPath({})).toBe(false);
      expect(isValidPath([])).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(isValidPath('')).toBe(false);
    });

    test('should return false for paths with null bytes', () => {
      expect(isValidPath('/path/to/file\0')).toBe(false);
    });

    test('should return false for paths over 4096 chars', () => {
      const longPath = '/' + 'a'.repeat(4096);
      expect(isValidPath(longPath)).toBe(false);
    });

    test('should return true for valid paths', () => {
      expect(isValidPath('/path/to/file')).toBe(true);
      expect(isValidPath('./relative/path')).toBe(true);
      expect(isValidPath('simple.txt')).toBe(true);
    });
  });

  describe('isSafeToChmodSync', () => {
    let testDir;

    beforeEach(() => {
      testDir = mkdtempSync(join(tmpdir(), 'security-test-'));
    });

    afterEach(() => {
      try {
        if (existsSync(testDir)) {
          rmdirSync(testDir, { recursive: true });
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    test('should return false for non-existent path', () => {
      expect(isSafeToChmodSync('/nonexistent/path')).toBe(false);
    });

    test('should return true for regular files', () => {
      const testFile = join(testDir, 'test.txt');
      writeFileSync(testFile, 'content');
      expect(isSafeToChmodSync(testFile)).toBe(true);
    });

    test('should return false for directories', () => {
      expect(isSafeToChmodSync(testDir)).toBe(false);
    });

    test('should return false for symlinks', () => {
      const testFile = join(testDir, 'test.txt');
      const symlinkFile = join(testDir, 'link.txt');
      writeFileSync(testFile, 'content');
      symlinkSync(testFile, symlinkFile);
      expect(isSafeToChmodSync(symlinkFile)).toBe(false);
    });
  });

  describe('setSecurePermissionsSync', () => {
    let testDir;

    beforeEach(() => {
      testDir = mkdtempSync(join(tmpdir(), 'security-test-'));
    });

    afterEach(() => {
      try {
        if (existsSync(testDir)) {
          rmdirSync(testDir, { recursive: true });
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    test('should return false for invalid path', () => {
      expect(setSecurePermissionsSync(null)).toBe(false);
      expect(setSecurePermissionsSync('')).toBe(false);
    });

    test('should return false for non-existent file', () => {
      expect(setSecurePermissionsSync('/nonexistent/file')).toBe(false);
    });

    test('should set permissions on valid file', () => {
      const testFile = join(testDir, 'test.txt');
      writeFileSync(testFile, 'content');
      expect(setSecurePermissionsSync(testFile)).toBe(true);
    });

    test('should return false for directory', () => {
      expect(setSecurePermissionsSync(testDir)).toBe(false);
    });
  });

  describe('WidgetConfigValidator', () => {
    test('should create with default options', () => {
      const validator = new WidgetConfigValidator();
      expect(validator.maxStringLength).toBe(1000);
      expect(validator.maxDepth).toBe(10);
      expect(validator.maxArrayLength).toBe(100);
    });

    test('should create with custom options', () => {
      const validator = new WidgetConfigValidator({
        maxStringLength: 500,
        maxDepth: 5,
      });
      expect(validator.maxStringLength).toBe(500);
      expect(validator.maxDepth).toBe(5);
    });

    test('should handle null/undefined config', () => {
      const validator = new WidgetConfigValidator();
      expect(validator.validate(null)).toEqual({});
      expect(validator.validate(undefined)).toEqual({});
    });

    test('should throw for non-object config', () => {
      const validator = new WidgetConfigValidator();
      expect(() => validator.validate('string')).toThrow('must be an object');
      expect(() => validator.validate(123)).toThrow('must be an object');
    });

    test('should sanitize strings', () => {
      const validator = new WidgetConfigValidator({ maxStringLength: 10 });
      const result = validator.validate({ key: 'longer than 10 chars' });
      expect(result.key).toBe('longer tha');
    });

    test('should strip null bytes from strings', () => {
      const validator = new WidgetConfigValidator();
      const result = validator.validate({ key: 'hello\0world' });
      expect(result.key).toBe('helloworld');
    });

    test('should sanitize numbers', () => {
      const validator = new WidgetConfigValidator();
      const result = validator.validate({
        normal: 42,
        nan: NaN,
        infinite: Infinity,
        negInfinite: -Infinity,
      });
      expect(result.normal).toBe(42);
      expect(result.nan).toBe(0);
      expect(result.infinite).toBe(0);
      expect(result.negInfinite).toBe(0);
    });

    test('should limit depth in nested objects', () => {
      const validator = new WidgetConfigValidator({ maxDepth: 2 });
      const deepObj = { a: { b: { c: { d: 'deep' } } } };
      const result = validator.validate(deepObj);
      // Depth is limited - nested objects beyond maxDepth get null values
      expect(result.a).toBeDefined();
      expect(result.a.b).toBeDefined();
      // Objects beyond depth are null (not undefined)
      expect(result.a.b.c).toBeNull();
    });

    test('should sanitize arrays', () => {
      const validator = new WidgetConfigValidator({ maxArrayLength: 2 });
      const result = validator.validate({ arr: [1, 2, 3, 4, 5] });
      expect(result.arr).toEqual([1, 2]);
    });

    test('should validate with schema', () => {
      const validator = new WidgetConfigValidator();
      const config = {
        name: 'test',
        count: 5,
        unknown: 'should be removed',
      };
      const schema = {
        properties: {
          name: { type: 'string' },
          count: { type: 'number', default: 0 },
        },
      };
      const result = validator.validate(config, schema);
      expect(result.name).toBe('test');
      expect(result.count).toBe(5);
      expect(result.unknown).toBeUndefined();
    });
  });

  describe('sanitizeWidgetConfig', () => {
    test('should sanitize basic config', () => {
      const config = { name: 'test', count: 5 };
      const result = sanitizeWidgetConfig(config);
      expect(result).toEqual(config);
    });

    test('should handle null config', () => {
      expect(sanitizeWidgetConfig(null)).toEqual({});
    });

    test('should strip null bytes', () => {
      const config = { key: 'value\0' };
      const result = sanitizeWidgetConfig(config);
      expect(result.key).toBe('value');
    });
  });

  describe('validateWidgetConfig', () => {
    test('should return valid for correct config', () => {
      const config = { name: 'test' };
      const schema = {
        properties: {
          name: { type: 'string' },
        },
      };
      const result = validateWidgetConfig(config, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should handle null config gracefully', () => {
      const result = validateWidgetConfig(null, {});
      // Implementation gracefully handles null by returning empty object
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePluginPath', () => {
    let testDir;

    beforeEach(() => {
      testDir = mkdtempSync(join(tmpdir(), 'plugin-test-'));
    });

    afterEach(() => {
      try {
        if (existsSync(testDir)) {
          rmdirSync(testDir, { recursive: true });
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    test('should reject null/undefined paths', () => {
      expect(validatePluginPath(null).valid).toBe(false);
      expect(validatePluginPath(undefined).valid).toBe(false);
    });

    test('should reject empty strings', () => {
      expect(validatePluginPath('').valid).toBe(false);
    });

    test('should reject paths with null bytes', () => {
      expect(validatePluginPath('path\0').valid).toBe(false);
    });

    test('should reject absolute paths by default', () => {
      expect(validatePluginPath('/absolute/path').valid).toBe(false);
    });

    test('should allow absolute paths when option set', () => {
      const result = validatePluginPath('/tmp/test', { allowAbsolute: true });
      expect(result.valid).toBe(true);
    });

    test('should reject path traversal attempts', () => {
      expect(validatePluginPath('../etc/passwd').valid).toBe(false);
      expect(validatePluginPath('foo/../bar').valid).toBe(false);
      expect(validatePluginPath('foo/../../bar').valid).toBe(false);
    });

    test('should validate path stays within allowed directories', () => {
      const result = validatePluginPath('subdir/file', {
        allowedDirs: [testDir],
      });
      expect(result.valid).toBe(true);
    });

    test('should reject paths outside allowed directories', () => {
      const result = validatePluginPath('../other', {
        allowedDirs: [testDir],
      });
      expect(result.valid).toBe(false);
    });

    test('should check path exists when required', () => {
      const testFile = join(testDir, 'exists.txt');
      writeFileSync(testFile, 'content');

      expect(validatePluginPath('exists.txt', {
        allowedDirs: [testDir],
        mustExist: true,
        expectedType: 'file',
      }).valid).toBe(true);

      expect(validatePluginPath('nonexistent.txt', {
        allowedDirs: [testDir],
        mustExist: true,
      }).valid).toBe(false);
    });

    test('should reject invalid characters in path', () => {
      expect(validatePluginPath('path with spaces/file').valid).toBe(false);
      expect(validatePluginPath('path$with$special/file').valid).toBe(false);
    });

    test('should allow valid plugin names', () => {
      expect(validatePluginPath('my-plugin').valid).toBe(true);
      expect(validatePluginPath('my_plugin').valid).toBe(true);
      expect(validatePluginPath('Plugin123').valid).toBe(true);
    });

    test('should reject hidden files', () => {
      expect(validatePluginPath('.hidden/file').valid).toBe(false);
      expect(validatePluginPath('dir/.secret').valid).toBe(false);
    });

    test('should allow specific hidden files', () => {
      expect(validatePluginPath('.gitkeep').valid).toBe(true);
      expect(validatePluginPath('.gitignore').valid).toBe(true);
    });
  });

  describe('validatePluginName', () => {
    test('should reject null/undefined', () => {
      expect(validatePluginName(null).valid).toBe(false);
      expect(validatePluginName(undefined).valid).toBe(false);
    });

    test('should reject non-strings', () => {
      expect(validatePluginName(123).valid).toBe(false);
      expect(validatePluginName({}).valid).toBe(false);
    });

    test('should reject empty strings', () => {
      expect(validatePluginName('').valid).toBe(false);
      expect(validatePluginName('   ').valid).toBe(false);
    });

    test('should reject names over 100 chars', () => {
      const longName = 'a'.repeat(101);
      expect(validatePluginName(longName).valid).toBe(false);
    });

    test('should reject reserved names', () => {
      expect(validatePluginName('node_modules').valid).toBe(false);
      expect(validatePluginName('.git').valid).toBe(false);
      expect(validatePluginName('package.json').valid).toBe(false);
    });

    test('should reject names not starting with alphanumeric', () => {
      expect(validatePluginName('-plugin').valid).toBe(false);
      expect(validatePluginName('_plugin').valid).toBe(false);
      expect(validatePluginName('.plugin').valid).toBe(false);
    });

    test('should reject names with invalid characters', () => {
      expect(validatePluginName('my plugin').valid).toBe(false);
      expect(validatePluginName('my/plugin').valid).toBe(false);
      expect(validatePluginName('my:plugin').valid).toBe(false);
    });

    test('should allow valid plugin names', () => {
      expect(validatePluginName('my-plugin').valid).toBe(true);
      expect(validatePluginName('my_plugin').valid).toBe(true);
      expect(validatePluginName('Plugin123').valid).toBe(true);
      expect(validatePluginName('a').valid).toBe(true);
    });

    test('should trim whitespace', () => {
      expect(validatePluginName('  my-plugin  ').valid).toBe(true);
    });
  });

  describe('ApiKeyAuth', () => {
    const makeAuth = () => new ApiKeyAuth({ enabled: true });
    const authHeader = (key) => ({ Authorization: `Bearer ${key}` });

    test('authenticates a freshly generated key', () => {
      const auth = makeAuth();
      const { key } = auth.generateKey('test-key');

      const result = auth.authenticate(authHeader(key), '127.0.0.1');
      expect(result.authenticated).toBe(true);
      expect(result.keyName).toBe('test-key');
    });

    test('stores keys only as scrypt hashes, never in plain text', () => {
      const auth = makeAuth();
      const { key } = auth.generateKey('hashed');

      const [storedId, data] = [...auth.keys.entries()][0];
      expect(storedId).not.toBe(key);
      expect(data.keyHash).not.toBe(key);
      expect(data.keyHash.startsWith('scrypt$')).toBe(true);
      expect(storedId).toBe(data.keyHash);
      expect(JSON.stringify([...auth.keys.keys()])).not.toContain(key);
    });

    test('uses a unique salt per key so identical keys hash differently', () => {
      const auth = makeAuth();
      const hashA = auth._hashKey('cd_same-key-value');
      const hashB = auth._hashKey('cd_same-key-value');
      expect(hashA).not.toBe(hashB);
      expect(hashA.split('$')[1]).not.toBe(hashB.split('$')[1]);
    });

    test('still verifies legacy SHA-256 records and upgrades them', () => {
      const auth = makeAuth();
      const key = `cd_${'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'}`;
      const legacyHash = crypto.createHash('sha256').update(key).digest('hex');

      // Simulate a record persisted before the scrypt upgrade
      auth.keys.set(key, {
        id: crypto.randomUUID(),
        name: 'legacy',
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        keyHash: legacyHash,
      });

      const result = auth.authenticate(authHeader(key), '127.0.0.1');
      expect(result.authenticated).toBe(true);

      // The legacy entry is re-indexed under a scrypt hash
      const entries = [...auth.keys.entries()];
      expect(entries).toHaveLength(1);
      const [storedId, data] = entries[0];
      expect(storedId.startsWith('scrypt$')).toBe(true);
      expect(data.keyHash).toBe(storedId);

      // And the key keeps working after the upgrade
      expect(auth.authenticate(authHeader(key), '127.0.0.1').authenticated).toBe(true);
    });

    test('rejects a wrong key even when a legacy record exists', () => {
      const auth = makeAuth();
      const key = `cd_${'f'.repeat(32)}`;
      auth.keys.set(key, {
        id: crypto.randomUUID(),
        name: 'legacy',
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        keyHash: crypto.createHash('sha256').update(key).digest('hex'),
      });

      const wrong = `cd_${'0'.repeat(32)}`;
      expect(auth.authenticate(authHeader(wrong), '10.0.0.1').authenticated).toBe(false);
    });

    test('rejects a revoked key', () => {
      const auth = makeAuth();
      const { key, id } = auth.generateKey('to-revoke');

      expect(auth.authenticate(authHeader(key), '127.0.0.1').authenticated).toBe(true);
      expect(auth.revokeKey(id)).toBe(true);

      const result = auth.authenticate(authHeader(key), '127.0.0.1');
      expect(result.authenticated).toBe(false);
      expect(result.code).toBe('AUTH_INVALID_KEY');
    });

    test('rejects a malformed key', () => {
      const auth = makeAuth();
      const result = auth.authenticate(authHeader('not-a-valid-key'), '127.0.0.1');
      expect(result.authenticated).toBe(false);
      expect(result.code).toBe('AUTH_INVALID_FORMAT');
    });

    test('authenticateKey validates keys presented out of band', () => {
      const auth = makeAuth();
      const { key, id } = auth.generateKey('out-of-band');

      const result = auth.authenticateKey(key, '127.0.0.1');
      expect(result.authenticated).toBe(true);
      expect(result.keyId).toBe(id);
    });
  });
});
