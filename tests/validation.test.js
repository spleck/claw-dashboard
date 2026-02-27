import {
  validateSettings,
  validateRefreshInterval,
  validateLogLevelFilter,
  validateSessionSortMode,
  validateTheme,
  validateExportFormat,
  validateExportDirectory,
  validateWidgetVisibility,
  validateAlertThresholds,
  validatePath,
  validateType,
  validateGatewayEndpoint,
  getDefaultSettings,
  VALID_THEMES,
  VALID_SORT_MODES,
  VALID_LOG_LEVELS,
  VALID_EXPORT_FORMATS
} from '../src/validation.js';
import config from '../src/config.js';
import os from 'os';
import { mkdtempSync, writeFileSync, mkdirSync, rmdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('Validation Module', () => {
  describe('validatePath', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = mkdtempSync(join(os.tmpdir(), 'validation-test-'));
    });

    afterEach(() => {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    });

    test('returns error for non-string path', () => {
      const result = validatePath(123);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path must be a non-empty string');
    });

    test('returns error for empty path', () => {
      const result = validatePath('');
      expect(result.valid).toBe(false);
    });

    test('returns error for null path', () => {
      const result = validatePath(null);
      expect(result.valid).toBe(false);
    });

    test('rejects paths with traversal', () => {
      const result = validatePath('/etc/../passwd');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path traversal not allowed');
    });

    test('expands tilde to home directory', () => {
      const result = validatePath('~/test');
      expect(result.valid).toBe(true);
      // The implementation uses resolve() which may produce different path formats
      expect(result.resolvedPath).toContain('test');
      expect(result.resolvedPath).not.toContain('~');
    });

    test('validates existing path when mustExist is true', () => {
      const result = validatePath(tempDir, true);
      expect(result.valid).toBe(true);
      expect(result.resolvedPath).toBe(tempDir);
    });

    test('returns error for non-existent path when mustExist is true', () => {
      const result = validatePath('/nonexistent/path/12345', true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    test('returns warning for non-existent parent directory', () => {
      const result = validatePath('/tmp/nonexistent/deep/path');
      expect(result.valid).toBe(true);
      expect(result.warning).toContain('Parent directory will be created');
    });
  });

  describe('validateRefreshInterval', () => {
    test('returns default for undefined', () => {
      const result = validateRefreshInterval(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(config.REFRESH_INTERVALS.DEFAULT);
    });

    test('returns default for null', () => {
      const result = validateRefreshInterval(null);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(config.REFRESH_INTERVALS.DEFAULT);
    });

    test('accepts valid number within range', () => {
      const result = validateRefreshInterval(2000);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(2000);
    });

    test('converts string numbers', () => {
      const result = validateRefreshInterval('3000');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(3000);
    });

    test('rejects NaN values', () => {
      const result = validateRefreshInterval('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a number');
    });

    test('rejects values below minimum', () => {
      const result = validateRefreshInterval(100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('between');
      expect(result.error).toContain(String(config.VALIDATION.REFRESH_INTERVAL.MIN));
    });

    test('rejects values above maximum', () => {
      const result = validateRefreshInterval(100000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('between');
      expect(result.error).toContain(String(config.VALIDATION.REFRESH_INTERVAL.MAX));
    });

    test('accepts minimum boundary value', () => {
      const result = validateRefreshInterval(config.VALIDATION.REFRESH_INTERVAL.MIN);
      expect(result.valid).toBe(true);
    });

    test('accepts maximum boundary value', () => {
      const result = validateRefreshInterval(config.VALIDATION.REFRESH_INTERVAL.MAX);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateLogLevelFilter', () => {
    test('returns default for undefined', () => {
      const result = validateLogLevelFilter(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('all');
    });

    test('returns default for empty string', () => {
      const result = validateLogLevelFilter('');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('all');
    });

    test('returns default for null', () => {
      const result = validateLogLevelFilter(null);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('all');
    });

    test('accepts valid log levels', () => {
      for (const level of VALID_LOG_LEVELS) {
        const result = validateLogLevelFilter(level);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(level);
      }
    });

    test('normalizes to lowercase', () => {
      const result = validateLogLevelFilter('ERROR');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('error');
    });

    test('rejects non-string values', () => {
      const result = validateLogLevelFilter(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    test('rejects invalid log levels', () => {
      const result = validateLogLevelFilter('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid log level');
    });
  });

  describe('validateSessionSortMode', () => {
    test('returns default for undefined', () => {
      const result = validateSessionSortMode(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('time');
    });

    test('returns default for null', () => {
      const result = validateSessionSortMode(null);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('time');
    });

    test('accepts valid sort modes', () => {
      for (const mode of VALID_SORT_MODES) {
        const result = validateSessionSortMode(mode);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(mode);
      }
    });

    test('normalizes to lowercase', () => {
      const result = validateSessionSortMode('TOKENS');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('tokens');
    });

    test('rejects non-string values', () => {
      const result = validateSessionSortMode(true);
      expect(result.valid).toBe(false);
    });

    test('rejects invalid sort modes', () => {
      const result = validateSessionSortMode('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid sort mode');
    });
  });

  describe('validateTheme', () => {
    test('returns default for undefined', () => {
      const result = validateTheme(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('default');
    });

    test('returns default for null', () => {
      const result = validateTheme(null);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('default');
    });

    test('accepts valid themes', () => {
      for (const theme of VALID_THEMES) {
        const result = validateTheme(theme);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(theme);
      }
    });

    test('normalizes to lowercase', () => {
      const result = validateTheme('DARK');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('dark');
    });

    test('rejects non-string values', () => {
      const result = validateTheme({});
      expect(result.valid).toBe(false);
    });

    test('rejects invalid themes', () => {
      const result = validateTheme('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid theme');
    });
  });

  describe('validateExportFormat', () => {
    test('returns default for undefined', () => {
      const result = validateExportFormat(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('json');
    });

    test('returns default for null', () => {
      const result = validateExportFormat(null);
      expect(result.valid).toBe(true);
      expect(result.value).toBe('json');
    });

    test('accepts valid export formats', () => {
      for (const format of VALID_EXPORT_FORMATS) {
        const result = validateExportFormat(format);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(format);
      }
    });

    test('normalizes to lowercase', () => {
      const result = validateExportFormat('CSV');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('csv');
    });

    test('rejects non-string values', () => {
      const result = validateExportFormat([]);
      expect(result.valid).toBe(false);
    });

    test('rejects invalid export formats', () => {
      const result = validateExportFormat('xml');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid export format');
    });
  });

  describe('validateExportDirectory', () => {
    test('returns default for undefined', () => {
      const result = validateExportDirectory(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(config.PATHS.EXPORTS);
    });

    test('returns default for null', () => {
      const result = validateExportDirectory(null);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(config.PATHS.EXPORTS);
    });

    test('rejects non-string values', () => {
      const result = validateExportDirectory(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    test('expands tilde in path', () => {
      const result = validateExportDirectory('~/exports');
      expect(result.valid).toBe(true);
      // The implementation uses resolve() which may produce different path formats
      expect(result.resolvedPath).toContain('exports');
      expect(result.resolvedPath).not.toContain('~');
    });
  });

  describe('validateWidgetVisibility', () => {
    test('returns default true for undefined', () => {
      const result = validateWidgetVisibility(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    test('returns default true for null', () => {
      const result = validateWidgetVisibility(null);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    test('accepts boolean true', () => {
      const result = validateWidgetVisibility(true);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    test('accepts boolean false', () => {
      const result = validateWidgetVisibility(false);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(false);
    });

    test('parses string "true"', () => {
      const result = validateWidgetVisibility('true');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    test('parses string "1"', () => {
      const result = validateWidgetVisibility('1');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    test('parses string "yes"', () => {
      const result = validateWidgetVisibility('yes');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    test('parses string "false"', () => {
      const result = validateWidgetVisibility('false');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(false);
    });

    test('parses string "0"', () => {
      const result = validateWidgetVisibility('0');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(false);
    });

    test('parses string "no"', () => {
      const result = validateWidgetVisibility('no');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(false);
    });

    test('rejects invalid string values', () => {
      const result = validateWidgetVisibility('maybe');
      expect(result.valid).toBe(false);
    });

    test('coerces truthy values to boolean', () => {
      const result = validateWidgetVisibility(1);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAlertThresholds', () => {
    test('rejects non-object values', () => {
      const result = validateAlertThresholds('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an object');
    });

    test('rejects null', () => {
      const result = validateAlertThresholds(null);
      expect(result.valid).toBe(false);
    });

    test('accepts empty object', () => {
      const result = validateAlertThresholds({});
      expect(result.valid).toBe(true);
      expect(result.value).toEqual({});
    });

    test('validates CPU thresholds', () => {
      const result = validateAlertThresholds({
        cpu: { warning: 70, critical: 90 }
      });
      expect(result.valid).toBe(true);
      expect(result.value.cpu).toEqual({ warning: 70, critical: 90 });
    });

    test('validates memory thresholds', () => {
      const result = validateAlertThresholds({
        memory: { warning: 75, critical: 90 }
      });
      expect(result.valid).toBe(true);
      expect(result.value.memory).toEqual({ warning: 75, critical: 90 });
    });

    test('validates disk thresholds with different defaults', () => {
      const result = validateAlertThresholds({
        disk: { warning: 80, critical: 95 }
      });
      expect(result.valid).toBe(true);
      expect(result.value.disk).toEqual({ warning: 80, critical: 95 });
    });

    test('applies default thresholds when not specified', () => {
      const result = validateAlertThresholds({ cpu: {} });
      expect(result.valid).toBe(true);
      expect(result.value.cpu.warning).toBe(70);
      expect(result.value.cpu.critical).toBe(90);
    });

    test('rejects non-numeric warning values', () => {
      const result = validateAlertThresholds({
        cpu: { warning: 'high' }
      });
      expect(result.valid).toBe(false);
    });

    test('rejects warning values below 0', () => {
      const result = validateAlertThresholds({
        cpu: { warning: -1 }
      });
      expect(result.valid).toBe(false);
    });

    test('rejects warning values above 100', () => {
      const result = validateAlertThresholds({
        cpu: { warning: 101 }
      });
      expect(result.valid).toBe(false);
    });

    test('rejects critical values below warning', () => {
      const result = validateAlertThresholds({
        cpu: { warning: 90, critical: 80 }
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('critical threshold must be >= warning');
    });

    test('accepts critical equal to warning', () => {
      const result = validateAlertThresholds({
        cpu: { warning: 80, critical: 80 }
      });
      expect(result.valid).toBe(true);
    });

    test('rejects non-object threshold type', () => {
      const result = validateAlertThresholds({
        cpu: 'invalid'
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateType', () => {
    test('validates number type', () => {
      expect(validateType(42, 'number')).toBe(true);
      expect(validateType(NaN, 'number')).toBe(false);
      expect(validateType('42', 'number')).toBe(false);
    });

    test('validates string type', () => {
      expect(validateType('hello', 'string')).toBe(true);
      expect(validateType(123, 'string')).toBe(false);
    });

    test('validates boolean type', () => {
      expect(validateType(true, 'boolean')).toBe(true);
      expect(validateType(false, 'boolean')).toBe(true);
      expect(validateType('true', 'boolean')).toBe(false);
    });

    test('validates object type', () => {
      expect(validateType({}, 'object')).toBe(true);
      expect(validateType({ key: 'value' }, 'object')).toBe(true);
      expect(validateType(null, 'object')).toBe(false);
      expect(validateType([], 'object')).toBe(true);
    });

    test('returns false for unknown type', () => {
      expect(validateType('test', 'unknown')).toBe(false);
    });
  });

  describe('validateGatewayEndpoint', () => {
    test('rejects non-object values', () => {
      const result = validateGatewayEndpoint('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an object');
    });

    test('rejects null', () => {
      const result = validateGatewayEndpoint(null);
      expect(result.valid).toBe(false);
    });

    test('rejects missing name', () => {
      const result = validateGatewayEndpoint({
        host: 'localhost',
        port: 18789
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('name is required');
    });

    test('rejects empty name', () => {
      const result = validateGatewayEndpoint({
        name: '',
        host: 'localhost',
        port: 18789
      });
      expect(result.valid).toBe(false);
    });

    test('rejects name exceeding max length', () => {
      const result = validateGatewayEndpoint({
        name: 'a'.repeat(50),
        host: 'localhost',
        port: 18789
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at most');
    });

    test('rejects name with invalid characters', () => {
      const result = validateGatewayEndpoint({
        name: 'my endpoint!',
        host: 'localhost',
        port: 18789
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('alphanumeric');
    });

    test('rejects missing host', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        port: 18789
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('host is required');
    });

    test('rejects empty host', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: '',
        port: 18789
      });
      expect(result.valid).toBe(false);
    });

    test('rejects invalid port (0)', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 0
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid port number');
    });

    test('rejects invalid port (negative)', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: -1
      });
      expect(result.valid).toBe(false);
    });

    test('rejects invalid port (above 65535)', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 70000
      });
      expect(result.valid).toBe(false);
    });

    test('rejects invalid port type', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 'invalid'
      });
      expect(result.valid).toBe(false);
    });

    test('accepts valid endpoint configuration', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 18789
      });
      expect(result.valid).toBe(true);
      expect(result.value).toEqual({
        name: 'local',
        host: 'localhost',
        port: 18789,
        token: null,
        enabled: true,
        type: 'local'
      });
    });

    test('accepts endpoint with valid type', () => {
      const result = validateGatewayEndpoint({
        name: 'remote',
        host: '192.168.1.1',
        port: 18789,
        type: 'remote'
      });
      expect(result.valid).toBe(true);
      expect(result.value.type).toBe('remote');
    });

    test('rejects invalid endpoint type', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 18789,
        type: 'invalid'
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('type must be one of');
    });

    test('rejects non-boolean enabled', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 18789,
        enabled: 'yes'
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('enabled must be a boolean');
    });

    test('rejects non-string/null token', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 18789,
        token: 123
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('token must be a string or null');
    });

    test('accepts endpoint with token', () => {
      const result = validateGatewayEndpoint({
        name: 'remote',
        host: 'remote.example.com',
        port: 18789,
        token: 'secret-token-123'
      });
      expect(result.valid).toBe(true);
      expect(result.value.token).toBe('secret-token-123');
    });

    test('preserves explicit enabled=false', () => {
      const result = validateGatewayEndpoint({
        name: 'local',
        host: 'localhost',
        port: 18789,
        enabled: false
      });
      expect(result.valid).toBe(true);
      expect(result.value.enabled).toBe(false);
    });
  });

  describe('validateSettings', () => {
    test('returns defaults for null', () => {
      const result = validateSettings(null);
      // When input is null, getDefaultSettings() is returned directly
      expect(result.refreshInterval).toBe(config.REFRESH_INTERVALS.DEFAULT);
    });

    test('returns defaults for non-object', () => {
      const result = validateSettings('invalid');
      // When input is not an object, getDefaultSettings() is returned directly
      expect(result).toBeDefined();
      expect(result.refreshInterval).toBe(config.REFRESH_INTERVALS.DEFAULT);
    });

    test('validates complete settings object', () => {
      const settings = {
        refreshInterval: 5000,
        logLevelFilter: 'error',
        sessionSortMode: 'tokens',
        theme: 'dark',
        exportFormat: 'csv',
        showWidget1: false,
        showWidget2: true
      };
      const result = validateSettings(settings);
      expect(result.valid).toBe(true);
      expect(result.value.refreshInterval).toBe(5000);
      expect(result.value.logLevelFilter).toBe('error');
      expect(result.value.theme).toBe('dark');
    });

    test('uses default for invalid refreshInterval', () => {
      const settings = { refreshInterval: 999999 };
      const result = validateSettings(settings);
      expect(result.valid).toBe(true);
      expect(result.value.refreshInterval).toBe(config.REFRESH_INTERVALS.DEFAULT);
    });

    test('uses default for invalid theme', () => {
      const settings = { theme: 'neon' };
      const result = validateSettings(settings);
      expect(result.valid).toBe(true);
      expect(result.value.theme).toBe('default');
    });
  });

  describe('getDefaultSettings', () => {
    test('returns complete default settings object', () => {
      const defaults = getDefaultSettings();
      expect(defaults.refreshInterval).toBe(config.REFRESH_INTERVALS.DEFAULT);
      expect(defaults.logLevelFilter).toBe('all');
      expect(defaults.sessionSortMode).toBe('time');
      expect(defaults.theme).toBe('default');
      expect(defaults.exportFormat).toBe('json');
      expect(defaults.exportDirectory).toBe(config.PATHS.EXPORTS);
    });

    test('includes all widget visibility settings', () => {
      const defaults = getDefaultSettings();
      for (let i = 1; i <= 8; i++) {
        expect(defaults[`showWidget${i}`]).toBe(true);
      }
    });

    test('includes performance metrics flag', () => {
      const defaults = getDefaultSettings();
      expect(defaults.showPerformanceMetrics).toBe(false);
    });

    test('includes favorites settings', () => {
      const defaults = getDefaultSettings();
      expect(defaults.favorites).toEqual({});
      expect(defaults.showFavoritesOnly).toBe(false);
    });

    test('includes firstRun flag', () => {
      const defaults = getDefaultSettings();
      expect(defaults.firstRun).toBe(true);
    });

    test('includes gateway endpoints array', () => {
      const defaults = getDefaultSettings();
      expect(Array.isArray(defaults.gatewayEndpoints)).toBe(true);
      expect(defaults.gatewayEndpoints[0]).toMatchObject({
        name: 'local',
        host: 'localhost',
        enabled: true
      });
    });

    test('includes web interface config', () => {
      const defaults = getDefaultSettings();
      expect(defaults.webInterface).toMatchObject({
        enabled: false,
        port: config.WEB.DEFAULT_PORT,
        host: config.WEB.HOST,
        cors: true
      });
    });
  });

  describe('exported constants', () => {
    test('VALID_THEMES matches config', () => {
      expect(VALID_THEMES).toEqual(config.VALIDATION.VALID_THEMES);
    });

    test('VALID_SORT_MODES matches config', () => {
      expect(VALID_SORT_MODES).toEqual(config.VALIDATION.VALID_SORT_MODES);
    });

    test('VALID_LOG_LEVELS matches config', () => {
      expect(VALID_LOG_LEVELS).toEqual(config.VALIDATION.VALID_LOG_LEVELS);
    });

    test('VALID_EXPORT_FORMATS matches config', () => {
      expect(VALID_EXPORT_FORMATS).toEqual(config.VALIDATION.VALID_EXPORT_FORMATS);
    });
  });
});
