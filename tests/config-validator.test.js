/**
 * Tests for config-validator module
 */

import { validateConfig, validateConfigFile, formatConfigValidationResult, getDefaultConfigPath } from '../src/config-validator.js';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { execSync } from 'child_process';

const CLI_PATH = join(process.cwd(), 'index.js');

describe('config-validator', () => {
  describe('validateConfig', () => {
    describe('valid configurations', () => {
      test('validates minimal valid config', () => {
        const config = {
          refreshInterval: 2000,
          theme: 'auto',
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('validates full default config', () => {
        const config = {
          refreshInterval: 2000,
          logLevelFilter: 'all',
          sessionSortMode: 'time',
          theme: 'dark',
          exportFormat: 'json',
          showWidget1: true,
          showWidget2: true,
          showPerformanceMetrics: false,
          firstRun: false,
          showFavoritesOnly: false,
          favorites: {},
          gatewayEndpoints: [
            { name: 'local', host: 'localhost', port: 18789, enabled: true, type: 'local' }
          ],
          activeGatewayEndpoint: 'local',
          webInterface: {
            enabled: false,
            port: 18790,
            host: '0.0.0.0',
            cors: true,
          },
          widgetLoading: {
            enabled: true,
            preloadPriority: ['cpu', 'memory'],
            lazyLoadDelay: 500,
            maxConcurrent: 3,
            autoDiscover: true,
          },
          plugins: {},
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('validates all valid themes', () => {
        const themes = ['default', 'dark', 'high-contrast', 'ocean', 'auto'];
        for (const theme of themes) {
          const result = validateConfig({ theme });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('validates all valid log levels', () => {
        const levels = ['all', 'error', 'warn', 'info', 'debug'];
        for (const level of levels) {
          const result = validateConfig({ logLevelFilter: level });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('validates all valid sort modes', () => {
        const modes = ['time', 'tokens', 'idle', 'name'];
        for (const mode of modes) {
          const result = validateConfig({ sessionSortMode: mode });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('validates all valid export formats', () => {
        const formats = ['json', 'csv'];
        for (const format of formats) {
          const result = validateConfig({ exportFormat: format });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });
    });

    describe('invalid configurations', () => {
      test('rejects non-object config', () => {
        const result = validateConfig('not an object');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('JSON object');
      });

      test('rejects null config', () => {
        const result = validateConfig(null);
        expect(result.valid).toBe(false);
      });

      test('rejects invalid theme', () => {
        const result = validateConfig({ theme: 'invalid-theme' });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('theme');
      });

      test('rejects invalid log level', () => {
        const result = validateConfig({ logLevelFilter: 'verbose' });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('logLevelFilter');
      });

      test('rejects invalid sort mode', () => {
        const result = validateConfig({ sessionSortMode: 'alphabetical' });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('sessionSortMode');
      });

      test('rejects invalid export format', () => {
        const result = validateConfig({ exportFormat: 'xml' });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('exportFormat');
      });

      test('rejects refresh interval too low', () => {
        const result = validateConfig({ refreshInterval: 100 });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('refreshInterval');
        expect(result.errors[0]).toContain('at least');
      });

      test('rejects refresh interval too high', () => {
        const result = validateConfig({ refreshInterval: 120000 });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('refreshInterval');
        expect(result.errors[0]).toContain('at most');
      });
    });

    describe('gateway endpoints validation', () => {
      test('validates valid endpoint', () => {
        const config = {
          gatewayEndpoints: [
            { name: 'local', host: 'localhost', port: 18789, enabled: true, type: 'local' }
          ]
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      test('rejects missing required endpoint fields', () => {
        const config = {
          gatewayEndpoints: [
            { host: 'localhost', port: 18789 } // missing name
          ]
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('name'))).toBe(true);
      });

      test('rejects invalid endpoint name', () => {
        const config = {
          gatewayEndpoints: [
            { name: 'invalid name!', host: 'localhost', port: 18789 }
          ]
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('name'))).toBe(true);
      });

      test('rejects too long endpoint name', () => {
        const config = {
          gatewayEndpoints: [
            { name: 'a'.repeat(50), host: 'localhost', port: 18789 }
          ]
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
      });

      test('rejects invalid port number', () => {
        const config = {
          gatewayEndpoints: [
            { name: 'local', host: 'localhost', port: 99999 }
          ]
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('port'))).toBe(true);
      });

      test('rejects invalid endpoint type', () => {
        const config = {
          gatewayEndpoints: [
            { name: 'local', host: 'localhost', port: 18789, type: 'invalid' }
          ]
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('type'))).toBe(true);
      });

      test('warns on empty gatewayEndpoints', () => {
        const config = { gatewayEndpoints: [] };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
        expect(result.warnings.some(w => w.includes('empty'))).toBe(true);
      });

      test('rejects too many endpoints', () => {
        const endpoints = Array(15).fill(null).map((_, i) => ({
          name: `endpoint${i}`,
          host: 'localhost',
          port: 18789
        }));
        const config = { gatewayEndpoints: endpoints };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('maximum'))).toBe(true);
      });
    });

    describe('web interface validation', () => {
      test('validates valid web interface config', () => {
        const config = {
          webInterface: {
            enabled: true,
            port: 18790,
            host: '0.0.0.0',
            cors: true,
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      test('rejects invalid port in web interface', () => {
        const config = {
          webInterface: {
            enabled: true,
            port: 70000,
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('port'))).toBe(true);
      });

      test('validates rate limit config', () => {
        const config = {
          webInterface: {
            rateLimit: {
              enabled: true,
              windowMs: 60000,
              maxRequests: 100,
            }
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      test('rejects invalid rate limit windowMs', () => {
        const config = {
          webInterface: {
            rateLimit: {
              enabled: true,
              windowMs: 500,
              maxRequests: 100,
            }
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true); // Still valid, but warns
        expect(result.warnings.some(w => w.includes('windowMs'))).toBe(true);
      });

      test('validates CORS origins as array', () => {
        const config = {
          webInterface: {
            corsOrigins: ['https://example.com', 'https://app.example.com']
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      test('validates CORS origins as string', () => {
        const config = {
          webInterface: {
            corsOrigins: '*'
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      test('rejects invalid CORS origins type', () => {
        const config = {
          webInterface: {
            corsOrigins: 123
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
      });
    });

    describe('widget loading validation', () => {
      test('validates valid widget loading config', () => {
        const config = {
          widgetLoading: {
            enabled: true,
            preloadPriority: ['cpu', 'memory'],
            lazyLoadDelay: 500,
            maxConcurrent: 3,
            autoDiscover: true,
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      test('rejects negative lazyLoadDelay', () => {
        const config = {
          widgetLoading: {
            lazyLoadDelay: -100
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
      });

      test('rejects zero maxConcurrent', () => {
        const config = {
          widgetLoading: {
            maxConcurrent: 0
          }
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
      });
    });

    describe('strict mode', () => {
      test('allows unknown properties when not strict', () => {
        const config = { unknownField: 'value' };
        const result = validateConfig(config, { strict: false });
        expect(result.valid).toBe(true);
      });

      test('rejects unknown properties in strict mode', () => {
        const config = { unknownField: 'value' };
        const result = validateConfig(config, { strict: true });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('unknownField'))).toBe(true);
      });
    });

    describe('stats', () => {
      test('returns field count in stats', () => {
        const config = { refreshInterval: 2000, theme: 'auto' };
        const result = validateConfig(config);
        expect(result.stats.fieldCount).toBe(2);
      });
    });
  });

  describe('validateConfigFile', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = mkdtempSync(join(os.tmpdir(), 'config-validator-test-'));
    });

    afterEach(() => {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    });

    test('validates existing config file', () => {
      const config = { refreshInterval: 2000, theme: 'dark' };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = validateConfigFile(configPath);
      expect(result.valid).toBe(true);
    });

    test('returns error for non-existent file', () => {
      const result = validateConfigFile(join(tempDir, 'nonexistent.json'));
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not found');
    });

    test('returns error for invalid JSON', () => {
      const configPath = join(tempDir, 'invalid.json');
      writeFileSync(configPath, 'not valid json {');

      const result = validateConfigFile(configPath);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('parse');
    });
  });

  describe('formatConfigValidationResult', () => {
    test('formats valid result', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: [],
        info: ['Test info'],
        stats: { fieldCount: 5 }
      };
      const formatted = formatConfigValidationResult(result);
      expect(formatted).toContain('is valid');
      expect(formatted).toContain('5 field(s)');
    });

    test('formats invalid result', () => {
      const result = {
        valid: false,
        errors: ['Error 1', 'Error 2'],
        warnings: ['Warning 1'],
        info: [],
        stats: { fieldCount: 3 }
      };
      const formatted = formatConfigValidationResult(result, '/test/config.json');
      expect(formatted).toContain('validation failed');
      expect(formatted).toContain('/test/config.json');
      expect(formatted).toContain('Error 1');
      expect(formatted).toContain('Warning 1');
    });

    test('includes path in output', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: [],
        info: [],
        stats: { fieldCount: 1 }
      };
      const formatted = formatConfigValidationResult(result, '/path/to/config.json');
      expect(formatted).toContain('/path/to/config.json');
    });
  });

  describe('getDefaultConfigPath', () => {
    test('returns path in home directory', () => {
      const path = getDefaultConfigPath();
      expect(path).toContain('.openclaw');
      expect(path).toContain('dashboard-settings.json');
      expect(path.startsWith(os.homedir())).toBe(true);
    });
  });
});

describe('validate-config CLI', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'validate-config-test-'));
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  const runCli = (args) => {
    try {
      const output = execSync(`node ${CLI_PATH} ${args}`, {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      return { exitCode: 0, output, stderr: '' };
    } catch (error) {
      return {
        exitCode: error.status || 1,
        output: error.stdout || '',
        stderr: error.stderr || error.message,
      };
    }
  };

  describe('help', () => {
    test('shows help with --help', () => {
      const result = runCli('validate-config --help');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Validate Dashboard Configuration');
      expect(result.output).toContain('Usage:');
      expect(result.output).toContain('Options:');
      expect(result.output).toContain('--json');
      expect(result.output).toContain('--strict');
    });

    test('shows help with -h', () => {
      const result = runCli('validate-config -h');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Validate Dashboard Configuration');
    });
  });

  describe('validation', () => {
    test('validates a valid config file', () => {
      const validConfig = {
        refreshInterval: 2000,
        theme: 'dark',
        logLevelFilter: 'info',
        sessionSortMode: 'time',
      };
      const configPath = join(tempDir, 'valid-config.json');
      writeFileSync(configPath, JSON.stringify(validConfig, null, 2));

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('is valid');
    });

    test('returns error for non-existent file', () => {
      const result = runCli('validate-config /nonexistent/path/config.json');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('not found');
    });

    test('returns error for invalid JSON', () => {
      const configPath = join(tempDir, 'invalid.json');
      writeFileSync(configPath, 'not valid json {');

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('parse');
    });

    test('detects invalid theme', () => {
      const config = { theme: 'invalid-theme' };
      const configPath = join(tempDir, 'bad-theme.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('theme');
    });

    test('detects multiple validation errors', () => {
      const config = {
        theme: 'invalid',
        logLevelFilter: 'verbose',
        refreshInterval: 100,
      };
      const configPath = join(tempDir, 'multiple-errors.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(1);
      expect(result.errors?.length > 1 || result.output.split('✗').length > 2).toBeTruthy();
    });
  });

  describe('json output', () => {
    test('outputs valid result as JSON with --json', () => {
      const config = { refreshInterval: 2000, theme: 'auto' };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath} --json`);
      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.output);
      expect(json.valid).toBe(true);
      expect(json.path).toBeDefined();
      expect(json.stats).toBeDefined();
    });

    test('outputs invalid result as JSON with -j', () => {
      const config = { theme: 'invalid' };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath} -j`);
      expect(result.exitCode).toBe(1);
      const json = JSON.parse(result.output);
      expect(json.valid).toBe(false);
      expect(json.errors).toBeDefined();
      expect(json.errors.length).toBeGreaterThan(0);
    });
  });

  describe('strict mode', () => {
    test('accepts unknown properties without --strict', () => {
      const config = { customField: 'value', refreshInterval: 2000 };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(0);
    });

    test('rejects unknown properties with --strict', () => {
      const config = { customField: 'value', refreshInterval: 2000 };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath} --strict`);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Unknown');
    });

    test('rejects unknown properties with -s', () => {
      const config = { customField: 'value' };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath} -s`);
      expect(result.exitCode).toBe(1);
    });
  });

  describe('default config path', () => {
    test('uses default path when no path provided', () => {
      // When no path is provided, uses the default config path
      // Result depends on whether default config exists in environment
      const result = runCli('validate-config');
      // Should either succeed (if file exists) or fail with file not found
      expect(result.exitCode).toBeGreaterThanOrEqual(0);
      expect(result.output).toContain('Configuration');
    });

    test('shows file not found for missing default config', () => {
      // Test with a path that definitely doesn't exist
      const result = runCli('validate-config /nonexistent/path/dashboard-settings.json');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('not found');
    });
  });

  describe('complex configurations', () => {
    test('validates config with gateway endpoints', () => {
      const config = {
        refreshInterval: 2000,
        gatewayEndpoints: [
          { name: 'local', host: 'localhost', port: 18789, enabled: true, type: 'local' },
          { name: 'remote', host: '192.168.1.100', port: 18789, token: 'secret', type: 'remote' }
        ]
      };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(0);
    });

    test('validates config with web interface', () => {
      const config = {
        webInterface: {
          enabled: true,
          port: 18790,
          host: '0.0.0.0',
          cors: true,
          corsOrigins: ['https://example.com'],
          rateLimit: {
            enabled: true,
            windowMs: 60000,
            maxRequests: 100,
          },
          auth: {
            enabled: false,
            keys: []
          }
        }
      };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(0);
    });

    test('validates config with widget loading settings', () => {
      const config = {
        widgetLoading: {
          enabled: true,
          preloadPriority: ['cpu', 'memory', 'gpu'],
          lazyLoadDelay: 1000,
          maxConcurrent: 5,
          autoDiscover: true,
        }
      };
      const configPath = join(tempDir, 'config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = runCli(`validate-config ${configPath}`);
      expect(result.exitCode).toBe(0);
    });
  });
});
