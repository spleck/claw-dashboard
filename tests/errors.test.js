import {
  DashboardError,
  ConfigError,
  SettingsError,
  GatewayError,
  SessionError,
  DataFetchError,
  AuthError,
  NetworkError,
  UIError,
  DatabaseError,
  ValidationError,
  TimeoutError,
  ERROR_CODES,
  isDashboardError,
  getErrorCode
} from '../src/errors.js';

describe('Custom Error Classes', () => {
  describe('DashboardError', () => {
    test('creates error with message, code, and details', () => {
      const error = new DashboardError('Test error', 'TEST_CODE', { foo: 'bar' });
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ foo: 'bar' });
      expect(error.name).toBe('DashboardError');
      expect(error.timestamp).toBeDefined();
    });

    test('provides default values for missing params', () => {
      const error = new DashboardError('Test error');
      expect(error.code).toBe('DASHBOARD_ERROR');
      expect(error.details).toEqual({});
    });

    test('toJSON includes all properties', () => {
      const error = new DashboardError('Test error', 'CODE', { key: 'value' });
      const json = error.toJSON();
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('CODE');
      expect(json.details).toEqual({ key: 'value' });
      expect(json.timestamp).toBeDefined();
      expect(json.stack).toBeDefined();
    });
  });

  describe('ConfigError', () => {
    test('creates config error with correct code', () => {
      const error = new ConfigError('Invalid config', { key: 'theme' });
      expect(error.name).toBe('ConfigError');
      expect(error.code).toBe('CONFIG_ERROR');
    });
  });

  describe('SettingsError', () => {
    test('creates settings error with correct code', () => {
      const error = new SettingsError('Settings invalid', { path: '/path' });
      expect(error.name).toBe('SettingsError');
      expect(error.code).toBe('SETTINGS_ERROR');
    });
  });

  describe('GatewayError', () => {
    test('creates gateway error with correct code', () => {
      const error = new GatewayError('Connection failed', { port: 18789 });
      expect(error.name).toBe('GatewayError');
      expect(error.code).toBe('GATEWAY_ERROR');
    });
  });

  describe('SessionError', () => {
    test('creates session error with correct code', () => {
      const error = new SessionError('Session not found', { sessionId: 'abc' });
      expect(error.name).toBe('SessionError');
      expect(error.code).toBe('SESSION_ERROR');
    });
  });

  describe('DataFetchError', () => {
    test('creates data fetch error with correct code', () => {
      const error = new DataFetchError('Failed to fetch CPU', { type: 'cpu' });
      expect(error.name).toBe('DataFetchError');
      expect(error.code).toBe('DATA_FETCH_ERROR');
    });
  });

  describe('AuthError', () => {
    test('creates auth error with correct code', () => {
      const error = new AuthError('Unauthorized');
      expect(error.name).toBe('AuthError');
      expect(error.code).toBe('AUTH_ERROR');
    });
  });

  describe('NetworkError', () => {
    test('creates network error with correct code', () => {
      const error = new NetworkError('Connection refused', { host: 'localhost' });
      expect(error.name).toBe('NetworkError');
      expect(error.code).toBe('NETWORK_ERROR');
    });
  });

  describe('UIError', () => {
    test('creates UI error with correct code', () => {
      const error = new UIError('Render failed', { widget: 'cpu' });
      expect(error.name).toBe('UIError');
      expect(error.code).toBe('UI_ERROR');
    });
  });

  describe('DatabaseError', () => {
    test('creates database error with correct code', () => {
      const error = new DatabaseError('Query failed', { operation: 'SELECT' });
      expect(error.name).toBe('DatabaseError');
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('ValidationError', () => {
    test('creates validation error with correct code', () => {
      const error = new ValidationError('Invalid input', { field: 'refreshInterval' });
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('TimeoutError', () => {
    test('creates timeout error with correct code', () => {
      const error = new TimeoutError('Operation timed out', { timeout: 5000 });
      expect(error.name).toBe('TimeoutError');
      expect(error.code).toBe('TIMEOUT_ERROR');
    });
  });

  describe('ERROR_CODES constant', () => {
    test('exports all expected error codes', () => {
      expect(ERROR_CODES.CONFIG_ERROR).toBe('CONFIG_ERROR');
      expect(ERROR_CODES.SETTINGS_ERROR).toBe('SETTINGS_ERROR');
      expect(ERROR_CODES.GATEWAY_ERROR).toBe('GATEWAY_ERROR');
      expect(ERROR_CODES.SESSION_ERROR).toBe('SESSION_ERROR');
      expect(ERROR_CODES.DATA_FETCH_ERROR).toBe('DATA_FETCH_ERROR');
      expect(ERROR_CODES.AUTH_ERROR).toBe('AUTH_ERROR');
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ERROR_CODES.UI_ERROR).toBe('UI_ERROR');
      expect(ERROR_CODES.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ERROR_CODES.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
    });
  });

  describe('isDashboardError', () => {
    test('returns true for DashboardError instances', () => {
      const error = new DashboardError('test');
      expect(isDashboardError(error)).toBe(true);
    });

    test('returns true for subclass instances', () => {
      const error = new ConfigError('test');
      expect(isDashboardError(error)).toBe(true);
    });

    test('returns false for regular Error', () => {
      const error = new Error('test');
      expect(isDashboardError(error)).toBe(false);
    });

    test('returns false for null/undefined', () => {
      expect(isDashboardError(null)).toBe(false);
      expect(isDashboardError(undefined)).toBe(false);
    });
  });

  describe('getErrorCode', () => {
    test('returns code for DashboardError', () => {
      const error = new GatewayError('test');
      expect(getErrorCode(error)).toBe('GATEWAY_ERROR');
    });

    test('returns UNKNOWN_ERROR for regular Error', () => {
      const error = new Error('test');
      expect(getErrorCode(error)).toBe('UNKNOWN_ERROR');
    });

    test('returns UNKNOWN_ERROR for non-error values', () => {
      expect(getErrorCode('string')).toBe('UNKNOWN_ERROR');
      expect(getErrorCode({})).toBe('UNKNOWN_ERROR');
    });
  });
});
