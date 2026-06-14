import config, {
  DASHBOARD_VERSION,
  REFRESH_INTERVALS,
  IDLE_THRESHOLD_MS,
  HISTORY,
  GATEWAY,
  DEFAULT_GATEWAY_ENDPOINT,
  CHECKSUM,
  UI,
  CACHE_TTL,
  CACHE_CONFIG,
  RETRY,
  DEFAULT_RETRY_OPTIONS,
  ALERT_THRESHOLDS,
  ALERT_RATE_LIMIT,
  MAX_ALERT_HISTORY,
  VALIDATION,
  COMMAND_TIMEOUTS,
  PATHS,
  DEFAULT_SETTINGS,
  WORKERS,
  WEB,
  WIDGETS
} from '../src/config.js';
import os from 'os';

describe('Config Module', () => {
  describe('DASHBOARD_VERSION', () => {
    test('exports version string', () => {
      expect(typeof DASHBOARD_VERSION).toBe('string');
      expect(DASHBOARD_VERSION.length).toBeGreaterThan(0);
    });

    test('follows semantic versioning format', () => {
      // Should match X.Y.Z pattern
      expect(DASHBOARD_VERSION).toMatch(/^\d+\.\d+\.\d+/);
    });

    test('is accessible from default export', () => {
      expect(config.DASHBOARD_VERSION).toBe(DASHBOARD_VERSION);
    });
  });

  describe('REFRESH_INTERVALS', () => {
    test('has required properties', () => {
      expect(REFRESH_INTERVALS).toHaveProperty('DEFAULT');
      expect(REFRESH_INTERVALS).toHaveProperty('ACTIVE');
      expect(REFRESH_INTERVALS).toHaveProperty('IDLE');
      expect(REFRESH_INTERVALS).toHaveProperty('OPTIONS');
    });

    test('all values are positive numbers', () => {
      expect(REFRESH_INTERVALS.DEFAULT).toBeGreaterThan(0);
      expect(REFRESH_INTERVALS.ACTIVE).toBeGreaterThan(0);
      expect(REFRESH_INTERVALS.IDLE).toBeGreaterThan(0);
    });

    test('DEFAULT equals ACTIVE value', () => {
      expect(REFRESH_INTERVALS.DEFAULT).toBe(REFRESH_INTERVALS.ACTIVE);
    });

    test('IDLE is greater than ACTIVE', () => {
      expect(REFRESH_INTERVALS.IDLE).toBeGreaterThan(REFRESH_INTERVALS.ACTIVE);
    });

    test('OPTIONS is an array of valid intervals', () => {
      expect(Array.isArray(REFRESH_INTERVALS.OPTIONS)).toBe(true);
      expect(REFRESH_INTERVALS.OPTIONS.length).toBeGreaterThan(0);
      expect(REFRESH_INTERVALS.OPTIONS).toContain(REFRESH_INTERVALS.DEFAULT);
    });

    test('all OPTIONS are positive integers', () => {
      for (const option of REFRESH_INTERVALS.OPTIONS) {
        expect(typeof option).toBe('number');
        expect(Number.isInteger(option)).toBe(true);
        expect(option).toBeGreaterThan(0);
      }
    });

    test('is accessible from default export', () => {
      expect(config.REFRESH_INTERVALS).toEqual(REFRESH_INTERVALS);
    });
  });

  describe('IDLE_THRESHOLD_MS', () => {
    test('is a positive number', () => {
      expect(typeof IDLE_THRESHOLD_MS).toBe('number');
      expect(IDLE_THRESHOLD_MS).toBeGreaterThan(0);
    });

    test('is 5 minutes in milliseconds', () => {
      expect(IDLE_THRESHOLD_MS).toBe(5 * 60 * 1000);
    });
  });

  describe('HISTORY', () => {
    test('has required properties', () => {
      expect(HISTORY).toHaveProperty('LENGTH');
      expect(HISTORY).toHaveProperty('NETWORK_LENGTH');
    });

    test('all values are positive integers', () => {
      expect(Number.isInteger(HISTORY.LENGTH)).toBe(true);
      expect(HISTORY.LENGTH).toBeGreaterThan(0);
      expect(Number.isInteger(HISTORY.NETWORK_LENGTH)).toBe(true);
      expect(HISTORY.NETWORK_LENGTH).toBeGreaterThan(0);
    });
  });

  describe('GATEWAY', () => {
    test('has required properties', () => {
      expect(GATEWAY).toHaveProperty('DEFAULT_PORT');
      expect(GATEWAY).toHaveProperty('TIMEOUT_MS');
      expect(GATEWAY).toHaveProperty('MAX_ENDPOINTS');
      expect(GATEWAY).toHaveProperty('DEFAULT_ENDPOINT_NAME');
    });

    test('DEFAULT_PORT is valid port number', () => {
      expect(GATEWAY.DEFAULT_PORT).toBeGreaterThan(0);
      expect(GATEWAY.DEFAULT_PORT).toBeLessThanOrEqual(65535);
    });

    test('TIMEOUT_MS is positive', () => {
      expect(GATEWAY.TIMEOUT_MS).toBeGreaterThan(0);
    });

    test('MAX_ENDPOINTS is positive integer', () => {
      expect(Number.isInteger(GATEWAY.MAX_ENDPOINTS)).toBe(true);
      expect(GATEWAY.MAX_ENDPOINTS).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_GATEWAY_ENDPOINT', () => {
    test('has required properties', () => {
      expect(DEFAULT_GATEWAY_ENDPOINT).toHaveProperty('name');
      expect(DEFAULT_GATEWAY_ENDPOINT).toHaveProperty('host');
      expect(DEFAULT_GATEWAY_ENDPOINT).toHaveProperty('port');
      expect(DEFAULT_GATEWAY_ENDPOINT).toHaveProperty('token');
      expect(DEFAULT_GATEWAY_ENDPOINT).toHaveProperty('enabled');
      expect(DEFAULT_GATEWAY_ENDPOINT).toHaveProperty('type');
    });

    test('name matches GATEWAY.DEFAULT_ENDPOINT_NAME', () => {
      expect(DEFAULT_GATEWAY_ENDPOINT.name).toBe(GATEWAY.DEFAULT_ENDPOINT_NAME);
    });

    test('port matches GATEWAY.DEFAULT_PORT', () => {
      expect(DEFAULT_GATEWAY_ENDPOINT.port).toBe(GATEWAY.DEFAULT_PORT);
    });

    test('enabled is boolean true', () => {
      expect(DEFAULT_GATEWAY_ENDPOINT.enabled).toBe(true);
    });

    test('token is null by default', () => {
      expect(DEFAULT_GATEWAY_ENDPOINT.token).toBeNull();
    });

    test('type is valid endpoint type', () => {
      expect(['local', 'remote', 'cloud']).toContain(DEFAULT_GATEWAY_ENDPOINT.type);
    });
  });

  describe('CHECKSUM', () => {
    test('has required properties', () => {
      expect(CHECKSUM).toHaveProperty('ENABLED');
      expect(CHECKSUM).toHaveProperty('ALGORITHM');
      expect(CHECKSUM).toHaveProperty('HEADER_NAME');
      expect(CHECKSUM).toHaveProperty('STRICT_MODE');
      expect(CHECKSUM).toHaveProperty('MAX_AGE_MS');
    });

    test('ENABLED is boolean', () => {
      expect(typeof CHECKSUM.ENABLED).toBe('boolean');
    });

    test('ALGORITHM is valid hash algorithm', () => {
      expect(['sha256', 'sha512', 'md5']).toContain(CHECKSUM.ALGORITHM);
    });

    test('HEADER_NAME starts with x-', () => {
      expect(CHECKSUM.HEADER_NAME).toMatch(/^x-/i);
    });

    test('STRICT_MODE is boolean', () => {
      expect(typeof CHECKSUM.STRICT_MODE).toBe('boolean');
    });

    test('MAX_AGE_MS is positive', () => {
      expect(CHECKSUM.MAX_AGE_MS).toBeGreaterThan(0);
    });
  });

  describe('UI', () => {
    test('has required properties', () => {
      expect(UI).toHaveProperty('GAUGE_WIDTH');
      expect(UI).toHaveProperty('SPARKLINE_WIDTH');
      expect(UI).toHaveProperty('LOG_BOX_MIN_HEIGHT');
      expect(UI).toHaveProperty('DEFAULT_WIDTH');
      expect(UI).toHaveProperty('DEFAULT_HEIGHT');
    });

    test('all values are positive integers', () => {
      for (const [key, value] of Object.entries(UI)) {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      }
    });

    test('DEFAULT_WIDTH is reasonable terminal width', () => {
      expect(UI.DEFAULT_WIDTH).toBeGreaterThanOrEqual(40);
    });

    test('DEFAULT_HEIGHT is reasonable terminal height', () => {
      expect(UI.DEFAULT_HEIGHT).toBeGreaterThanOrEqual(10);
    });
  });

  describe('CACHE_TTL', () => {
    test('has all required cache types', () => {
      expect(CACHE_TTL).toHaveProperty('CPU');
      expect(CACHE_TTL).toHaveProperty('MEMORY');
      expect(CACHE_TTL).toHaveProperty('GPU');
      expect(CACHE_TTL).toHaveProperty('NETWORK');
      expect(CACHE_TTL).toHaveProperty('DISK');
      expect(CACHE_TTL).toHaveProperty('SYSTEM');
      expect(CACHE_TTL).toHaveProperty('CONTAINER');
      expect(CACHE_TTL).toHaveProperty('DEFAULT');
    });

    test('all values are positive numbers', () => {
      for (const [key, value] of Object.entries(CACHE_TTL)) {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      }
    });

    test('DISK and CONTAINER have longer TTL (rarely change)', () => {
      expect(CACHE_TTL.DISK).toBeGreaterThanOrEqual(CACHE_TTL.CPU);
      expect(CACHE_TTL.CONTAINER).toBeGreaterThanOrEqual(CACHE_TTL.CPU);
    });

    test('GPU has longer TTL (expensive)', () => {
      expect(CACHE_TTL.GPU).toBeGreaterThanOrEqual(CACHE_TTL.CPU);
    });
  });

  describe('CACHE_CONFIG', () => {
    test('has config for all cache types', () => {
      expect(CACHE_CONFIG).toHaveProperty('cpu');
      expect(CACHE_CONFIG).toHaveProperty('memory');
      expect(CACHE_CONFIG).toHaveProperty('gpu');
      expect(CACHE_CONFIG).toHaveProperty('network');
      expect(CACHE_CONFIG).toHaveProperty('disk');
      expect(CACHE_CONFIG).toHaveProperty('system');
      expect(CACHE_CONFIG).toHaveProperty('container');
    });

    test('each config has ttl property', () => {
      for (const [key, value] of Object.entries(CACHE_CONFIG)) {
        expect(value).toHaveProperty('ttl');
        expect(typeof value.ttl).toBe('number');
      }
    });

    test('ttl values match CACHE_TTL', () => {
      expect(CACHE_CONFIG.cpu.ttl).toBe(CACHE_TTL.CPU);
      expect(CACHE_CONFIG.memory.ttl).toBe(CACHE_TTL.MEMORY);
      expect(CACHE_CONFIG.gpu.ttl).toBe(CACHE_TTL.GPU);
    });
  });

  describe('RETRY', () => {
    test('has required properties', () => {
      expect(RETRY).toHaveProperty('DEFAULT_MAX_RETRIES');
      expect(RETRY).toHaveProperty('DEFAULT_INITIAL_DELAY');
      expect(RETRY).toHaveProperty('DEFAULT_MAX_DELAY');
      expect(RETRY).toHaveProperty('DEFAULT_BACKOFF_MULTIPLIER');
      expect(RETRY).toHaveProperty('TIMEOUT');
      expect(RETRY).toHaveProperty('INTERVAL');
      expect(RETRY).toHaveProperty('JITTER_FACTOR');
      expect(RETRY).toHaveProperty('RETRYABLE_STATUSES');
      expect(RETRY).toHaveProperty('RETRYABLE_ERRORS');
    });

    test('retry settings are valid', () => {
      expect(RETRY.DEFAULT_MAX_RETRIES).toBeGreaterThanOrEqual(0);
      expect(RETRY.DEFAULT_INITIAL_DELAY).toBeGreaterThan(0);
      expect(RETRY.DEFAULT_MAX_DELAY).toBeGreaterThan(RETRY.DEFAULT_INITIAL_DELAY);
      expect(RETRY.DEFAULT_BACKOFF_MULTIPLIER).toBeGreaterThan(1);
    });

    test('JITTER_FACTOR is between 0 and 1', () => {
      expect(RETRY.JITTER_FACTOR).toBeGreaterThanOrEqual(0);
      expect(RETRY.JITTER_FACTOR).toBeLessThanOrEqual(1);
    });

    test('RETRYABLE_STATUSES is array of HTTP status codes', () => {
      expect(Array.isArray(RETRY.RETRYABLE_STATUSES)).toBe(true);
      for (const status of RETRY.RETRYABLE_STATUSES) {
        expect(typeof status).toBe('number');
        expect(status).toBeGreaterThanOrEqual(400);
        expect(status).toBeLessThan(600);
      }
    });

    test('RETRYABLE_ERRORS is array of error codes', () => {
      expect(Array.isArray(RETRY.RETRYABLE_ERRORS)).toBe(true);
      for (const error of RETRY.RETRYABLE_ERRORS) {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      }
    });
  });

  describe('DEFAULT_RETRY_OPTIONS', () => {
    test('contains all retry options', () => {
      expect(DEFAULT_RETRY_OPTIONS).toHaveProperty('maxRetries');
      expect(DEFAULT_RETRY_OPTIONS).toHaveProperty('initialDelay');
      expect(DEFAULT_RETRY_OPTIONS).toHaveProperty('maxDelay');
      expect(DEFAULT_RETRY_OPTIONS).toHaveProperty('backoffMultiplier');
      expect(DEFAULT_RETRY_OPTIONS).toHaveProperty('retryableStatuses');
      expect(DEFAULT_RETRY_OPTIONS).toHaveProperty('retryableErrors');
    });

    test('values match RETRY constants', () => {
      expect(DEFAULT_RETRY_OPTIONS.maxRetries).toBe(RETRY.DEFAULT_MAX_RETRIES);
      expect(DEFAULT_RETRY_OPTIONS.initialDelay).toBe(RETRY.DEFAULT_INITIAL_DELAY);
      expect(DEFAULT_RETRY_OPTIONS.maxDelay).toBe(RETRY.DEFAULT_MAX_DELAY);
      expect(DEFAULT_RETRY_OPTIONS.backoffMultiplier).toBe(RETRY.DEFAULT_BACKOFF_MULTIPLIER);
    });
  });

  describe('ALERT_THRESHOLDS', () => {
    test('has thresholds for CPU, MEMORY, DISK', () => {
      expect(ALERT_THRESHOLDS).toHaveProperty('CPU');
      expect(ALERT_THRESHOLDS).toHaveProperty('MEMORY');
      expect(ALERT_THRESHOLDS).toHaveProperty('DISK');
    });

    test('each threshold has warning and critical', () => {
      for (const type of ['CPU', 'MEMORY', 'DISK']) {
        expect(ALERT_THRESHOLDS[type]).toHaveProperty('warning');
        expect(ALERT_THRESHOLDS[type]).toHaveProperty('critical');
      }
    });

    test('all threshold values are 0-100', () => {
      for (const [type, thresholds] of Object.entries(ALERT_THRESHOLDS)) {
        expect(thresholds.warning).toBeGreaterThanOrEqual(0);
        expect(thresholds.warning).toBeLessThanOrEqual(100);
        expect(thresholds.critical).toBeGreaterThanOrEqual(0);
        expect(thresholds.critical).toBeLessThanOrEqual(100);
      }
    });

    test('critical is greater than warning', () => {
      for (const [type, thresholds] of Object.entries(ALERT_THRESHOLDS)) {
        expect(thresholds.critical).toBeGreaterThanOrEqual(thresholds.warning);
      }
    });
  });

  describe('ALERT_RATE_LIMIT', () => {
    test('has required properties', () => {
      expect(ALERT_RATE_LIMIT).toHaveProperty('ENABLED');
      expect(ALERT_RATE_LIMIT).toHaveProperty('WINDOW_MS');
      expect(ALERT_RATE_LIMIT).toHaveProperty('MAX_ALERTS');
    });

    test('ENABLED is boolean', () => {
      expect(typeof ALERT_RATE_LIMIT.ENABLED).toBe('boolean');
    });

    test('WINDOW_MS is positive', () => {
      expect(ALERT_RATE_LIMIT.WINDOW_MS).toBeGreaterThan(0);
    });

    test('MAX_ALERTS is positive integer', () => {
      expect(Number.isInteger(ALERT_RATE_LIMIT.MAX_ALERTS)).toBe(true);
      expect(ALERT_RATE_LIMIT.MAX_ALERTS).toBeGreaterThan(0);
    });
  });

  describe('MAX_ALERT_HISTORY', () => {
    test('is positive integer', () => {
      expect(Number.isInteger(MAX_ALERT_HISTORY)).toBe(true);
      expect(MAX_ALERT_HISTORY).toBeGreaterThan(0);
    });
  });

  describe('VALIDATION', () => {
    test('has REFRESH_INTERVAL constraints', () => {
      expect(VALIDATION).toHaveProperty('REFRESH_INTERVAL');
      expect(VALIDATION.REFRESH_INTERVAL).toHaveProperty('MIN');
      expect(VALIDATION.REFRESH_INTERVAL).toHaveProperty('MAX');
      expect(VALIDATION.REFRESH_INTERVAL.MIN).toBeLessThan(VALIDATION.REFRESH_INTERVAL.MAX);
    });

    test('has VALID_THEMES array', () => {
      expect(Array.isArray(VALIDATION.VALID_THEMES)).toBe(true);
      expect(VALIDATION.VALID_THEMES.length).toBeGreaterThan(0);
      expect(VALIDATION.VALID_THEMES).toContain('default');
    });

    test('has VALID_SORT_MODES array', () => {
      expect(Array.isArray(VALIDATION.VALID_SORT_MODES)).toBe(true);
      expect(VALIDATION.VALID_SORT_MODES.length).toBeGreaterThan(0);
      expect(VALIDATION.VALID_SORT_MODES).toContain('time');
    });

    test('has VALID_LOG_LEVELS array', () => {
      expect(Array.isArray(VALIDATION.VALID_LOG_LEVELS)).toBe(true);
      expect(VALIDATION.VALID_LOG_LEVELS.length).toBeGreaterThan(0);
      expect(VALIDATION.VALID_LOG_LEVELS).toContain('all');
    });

    test('has VALID_EXPORT_FORMATS array', () => {
      expect(Array.isArray(VALIDATION.VALID_EXPORT_FORMATS)).toBe(true);
      expect(VALIDATION.VALID_EXPORT_FORMATS.length).toBeGreaterThan(0);
      expect(VALIDATION.VALID_EXPORT_FORMATS).toContain('json');
    });

    test('has VALID_ENDPOINT_TYPES array', () => {
      expect(Array.isArray(VALIDATION.VALID_ENDPOINT_TYPES)).toBe(true);
      expect(VALIDATION.VALID_ENDPOINT_TYPES).toContain('local');
    });

    test('has ENDPOINT_NAME constraints', () => {
      expect(VALIDATION).toHaveProperty('ENDPOINT_NAME');
      expect(VALIDATION.ENDPOINT_NAME).toHaveProperty('MIN_LENGTH');
      expect(VALIDATION.ENDPOINT_NAME).toHaveProperty('MAX_LENGTH');
      expect(VALIDATION.ENDPOINT_NAME).toHaveProperty('PATTERN');
      expect(VALIDATION.ENDPOINT_NAME.PATTERN instanceof RegExp).toBe(true);
      expect(VALIDATION.ENDPOINT_NAME.MIN_LENGTH).toBeLessThan(VALIDATION.ENDPOINT_NAME.MAX_LENGTH);
    });
  });

  describe('COMMAND_TIMEOUTS', () => {
    test('has timeout for all commands', () => {
      const expectedCommands = [
        'LAUNCHCTL', 'PS', 'SYSTEM_PROFILER', 'IOREG',
        'POWERMETRICS', 'OPENCLAW_VERSION', 'OPENCLAW_LOGS',
        'NVIDIA_SMI', 'LSPCI', 'RADEONTOP', 'POWERSHELL', 'WSL_SMI'
      ];
      for (const cmd of expectedCommands) {
        expect(COMMAND_TIMEOUTS).toHaveProperty(cmd);
        expect(typeof COMMAND_TIMEOUTS[cmd]).toBe('number');
        expect(COMMAND_TIMEOUTS[cmd]).toBeGreaterThan(0);
      }
    });
  });

  describe('PATHS', () => {
    test('has all required paths', () => {
      expect(PATHS).toHaveProperty('SETTINGS');
      expect(PATHS).toHaveProperty('EXPORTS');
      expect(PATHS).toHaveProperty('OPENCLAW_CONFIG');
      expect(PATHS).toHaveProperty('LOG');
      expect(PATHS).toHaveProperty('HOME_DIR');
      expect(PATHS).toHaveProperty('OPENCLAW_DIR');
      expect(PATHS).toHaveProperty('AGENTS_DIR');
      expect(PATHS).toHaveProperty('WIDGETS_DIR');
      expect(PATHS).toHaveProperty('PLUGINS_DIR');
    });

    test('all paths are strings', () => {
      for (const [key, value] of Object.entries(PATHS)) {
        expect(typeof value).toBe('string');
      }
    });

    test('HOME_DIR matches os.homedir()', () => {
      expect(PATHS.HOME_DIR).toBe(os.homedir());
    });

    test('paths include home directory', () => {
      expect(PATHS.SETTINGS).toContain(os.homedir());
      expect(PATHS.EXPORTS).toContain(os.homedir());
      expect(PATHS.LOG).toContain(os.homedir());
    });

    test('paths are in .openclaw directory', () => {
      expect(PATHS.SETTINGS).toContain('.openclaw');
      expect(PATHS.OPENCLAW_CONFIG).toContain('.openclaw');
      expect(PATHS.LOG).toContain('.openclaw');
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    test('has required settings', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('refreshInterval');
      expect(DEFAULT_SETTINGS).toHaveProperty('logLevelFilter');
      expect(DEFAULT_SETTINGS).toHaveProperty('sessionSortMode');
      expect(DEFAULT_SETTINGS).toHaveProperty('theme');
      expect(DEFAULT_SETTINGS).toHaveProperty('exportFormat');
      expect(DEFAULT_SETTINGS).toHaveProperty('exportDirectory');
    });

    test('refreshInterval matches default', () => {
      expect(DEFAULT_SETTINGS.refreshInterval).toBe(REFRESH_INTERVALS.DEFAULT);
    });

    test('logLevelFilter is valid', () => {
      expect(VALIDATION.VALID_LOG_LEVELS).toContain(DEFAULT_SETTINGS.logLevelFilter);
    });

    test('sessionSortMode is valid', () => {
      expect(VALIDATION.VALID_SORT_MODES).toContain(DEFAULT_SETTINGS.sessionSortMode);
    });

    test('theme is valid', () => {
      expect(VALIDATION.VALID_THEMES).toContain(DEFAULT_SETTINGS.theme);
    });

    test('exportFormat is valid', () => {
      expect(VALIDATION.VALID_EXPORT_FORMATS).toContain(DEFAULT_SETTINGS.exportFormat);
    });

    test('exportDirectory matches PATHS.EXPORTS', () => {
      expect(DEFAULT_SETTINGS.exportDirectory).toBe(PATHS.EXPORTS);
    });

    test('has all widget visibility settings', () => {
      for (let i = 1; i <= 8; i++) {
        expect(DEFAULT_SETTINGS).toHaveProperty(`showWidget${i}`);
        expect(typeof DEFAULT_SETTINGS[`showWidget${i}`]).toBe('boolean');
      }
    });

    test('favorites is empty object', () => {
      expect(DEFAULT_SETTINGS.favorites).toEqual({});
    });

    test('showFavoritesOnly is boolean', () => {
      expect(typeof DEFAULT_SETTINGS.showFavoritesOnly).toBe('boolean');
    });

    test('firstRun is boolean', () => {
      expect(typeof DEFAULT_SETTINGS.firstRun).toBe('boolean');
    });

    test('showPerformanceMetrics is boolean', () => {
      expect(typeof DEFAULT_SETTINGS.showPerformanceMetrics).toBe('boolean');
    });

    test('has gatewayEndpoints array', () => {
      expect(Array.isArray(DEFAULT_SETTINGS.gatewayEndpoints)).toBe(true);
      expect(DEFAULT_SETTINGS.gatewayEndpoints.length).toBeGreaterThan(0);
    });

    test('first gateway endpoint is valid', () => {
      const endpoint = DEFAULT_SETTINGS.gatewayEndpoints[0];
      expect(endpoint).toHaveProperty('name');
      expect(endpoint).toHaveProperty('host');
      expect(endpoint).toHaveProperty('port');
      expect(endpoint).toHaveProperty('enabled');
    });

    test('has webInterface config', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('webInterface');
      expect(DEFAULT_SETTINGS.webInterface).toHaveProperty('enabled');
      expect(DEFAULT_SETTINGS.webInterface).toHaveProperty('port');
      expect(DEFAULT_SETTINGS.webInterface).toHaveProperty('host');
      expect(DEFAULT_SETTINGS.webInterface).toHaveProperty('cors');
    });

    test('webInterface port matches WEB.DEFAULT_PORT', () => {
      expect(DEFAULT_SETTINGS.webInterface.port).toBe(WEB.DEFAULT_PORT);
    });

    test('has widgetLoading config', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('widgetLoading');
      expect(DEFAULT_SETTINGS.widgetLoading).toHaveProperty('enabled');
      expect(DEFAULT_SETTINGS.widgetLoading).toHaveProperty('preloadPriority');
      expect(DEFAULT_SETTINGS.widgetLoading).toHaveProperty('lazyLoadDelay');
    });

    test('has plugins config object', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('plugins');
      expect(typeof DEFAULT_SETTINGS.plugins).toBe('object');
    });
  });

  describe('WORKERS', () => {
    test('has required properties', () => {
      expect(WORKERS).toHaveProperty('ENABLED');
      expect(WORKERS).toHaveProperty('MAX_WORKERS');
      expect(WORKERS).toHaveProperty('TASK_TIMEOUT');
      expect(WORKERS).toHaveProperty('FALLBACK_ON_ERROR');
    });

    test('ENABLED is boolean', () => {
      expect(typeof WORKERS.ENABLED).toBe('boolean');
    });

    test('MAX_WORKERS is positive integer', () => {
      expect(Number.isInteger(WORKERS.MAX_WORKERS)).toBe(true);
      expect(WORKERS.MAX_WORKERS).toBeGreaterThan(0);
    });

    test('TASK_TIMEOUT is positive', () => {
      expect(WORKERS.TASK_TIMEOUT).toBeGreaterThan(0);
    });

    test('FALLBACK_ON_ERROR is boolean', () => {
      expect(typeof WORKERS.FALLBACK_ON_ERROR).toBe('boolean');
    });
  });

  describe('WEB', () => {
    test('has required properties', () => {
      expect(WEB).toHaveProperty('DEFAULT_PORT');
      expect(WEB).toHaveProperty('HOST');
      expect(WEB).toHaveProperty('CORS_ORIGIN');
      expect(WEB).toHaveProperty('REQUEST_TIMEOUT');
      expect(WEB).toHaveProperty('REFRESH_CACHE_MS');
      expect(WEB).toHaveProperty('ENDPOINTS');
    });

    test('DEFAULT_PORT is valid port', () => {
      expect(WEB.DEFAULT_PORT).toBeGreaterThan(0);
      expect(WEB.DEFAULT_PORT).toBeLessThanOrEqual(65535);
    });

    test('HOST is valid', () => {
      expect(typeof WEB.HOST).toBe('string');
      expect(WEB.HOST.length).toBeGreaterThan(0);
    });

    test('ENDPOINTS has required routes', () => {
      expect(WEB.ENDPOINTS).toHaveProperty('HEALTH');
      expect(WEB.ENDPOINTS).toHaveProperty('METRICS');
      expect(WEB.ENDPOINTS).toHaveProperty('SESSIONS');
      expect(WEB.ENDPOINTS).toHaveProperty('AGENTS');
      expect(WEB.ENDPOINTS).toHaveProperty('LOGS');
      expect(WEB.ENDPOINTS).toHaveProperty('STATUS');
    });

    test('all endpoints start with /', () => {
      for (const [key, value] of Object.entries(WEB.ENDPOINTS)) {
        expect(value).toMatch(/^\//);
      }
    });
  });

  describe('WIDGETS', () => {
    test('has required properties', () => {
      expect(WIDGETS).toHaveProperty('ENABLED');
      expect(WIDGETS).toHaveProperty('AUTO_DISCOVER');
      expect(WIDGETS).toHaveProperty('PRELOAD_PRIORITY');
      expect(WIDGETS).toHaveProperty('LAZY_LOAD_DELAY');
      expect(WIDGETS).toHaveProperty('MAX_CONCURRENT_LOADS');
      expect(WIDGETS).toHaveProperty('FALLBACK_ON_ERROR');
      expect(WIDGETS).toHaveProperty('CACHE_TTL');
      expect(WIDGETS).toHaveProperty('BUILTIN');
    });

    test('ENABLED and AUTO_DISCOVER are boolean', () => {
      expect(typeof WIDGETS.ENABLED).toBe('boolean');
      expect(typeof WIDGETS.AUTO_DISCOVER).toBe('boolean');
    });

    test('PRELOAD_PRIORITY is array with known widgets', () => {
      expect(Array.isArray(WIDGETS.PRELOAD_PRIORITY)).toBe(true);
      expect(WIDGETS.PRELOAD_PRIORITY).toContain('cpu');
      expect(WIDGETS.PRELOAD_PRIORITY).toContain('memory');
    });

    test('LAZY_LOAD_DELAY is positive', () => {
      expect(WIDGETS.LAZY_LOAD_DELAY).toBeGreaterThan(0);
    });

    test('MAX_CONCURRENT_LOADS is positive integer', () => {
      expect(Number.isInteger(WIDGETS.MAX_CONCURRENT_LOADS)).toBe(true);
      expect(WIDGETS.MAX_CONCURRENT_LOADS).toBeGreaterThan(0);
    });

    test('CACHE_TTL is positive', () => {
      expect(WIDGETS.CACHE_TTL).toBeGreaterThan(0);
    });

    test('BUILTIN has known widgets', () => {
      expect(WIDGETS.BUILTIN).toHaveProperty('cpu');
      expect(WIDGETS.BUILTIN).toHaveProperty('memory');
      expect(WIDGETS.BUILTIN).toHaveProperty('gpu');
      expect(WIDGETS.BUILTIN).toHaveProperty('network');
    });

    test('each builtin widget has priority and lazyLoad', () => {
      for (const [name, config] of Object.entries(WIDGETS.BUILTIN)) {
        expect(config).toHaveProperty('priority');
        expect(config).toHaveProperty('lazyLoad');
        expect(typeof config.priority).toBe('number');
        expect(typeof config.lazyLoad).toBe('boolean');
      }
    });
  });

  describe('Default export', () => {
    test('exports all named exports', () => {
      expect(config).toHaveProperty('REFRESH_INTERVALS');
      expect(config).toHaveProperty('IDLE_THRESHOLD_MS');
      expect(config).toHaveProperty('HISTORY');
      expect(config).toHaveProperty('GATEWAY');
      expect(config).toHaveProperty('DEFAULT_GATEWAY_ENDPOINT');
      expect(config).toHaveProperty('CHECKSUM');
      expect(config).toHaveProperty('UI');
      expect(config).toHaveProperty('CACHE_TTL');
      expect(config).toHaveProperty('CACHE_CONFIG');
      expect(config).toHaveProperty('RETRY');
      expect(config).toHaveProperty('DEFAULT_RETRY_OPTIONS');
      expect(config).toHaveProperty('ALERT_THRESHOLDS');
      expect(config).toHaveProperty('ALERT_RATE_LIMIT');
      expect(config).toHaveProperty('MAX_ALERT_HISTORY');
      expect(config).toHaveProperty('VALIDATION');
      expect(config).toHaveProperty('COMMAND_TIMEOUTS');
      expect(config).toHaveProperty('PATHS');
      expect(config).toHaveProperty('DEFAULT_SETTINGS');
      expect(config).toHaveProperty('WORKERS');
      expect(config).toHaveProperty('WEB');
      expect(config).toHaveProperty('WIDGETS');
      expect(config).toHaveProperty('DASHBOARD_VERSION');
    });
  });
});
