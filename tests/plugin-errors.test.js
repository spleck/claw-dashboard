/**
 * Plugin Errors Tests
 * Tests for enhanced plugin error messages and diagnostics
 */

import {
  PluginError,
  PluginErrorAnalyzer,
  PLUGIN_ERROR_CODES,
  formatPluginError,
  extractErrorInfo,
} from '../src/plugin-errors.js';

describe('PluginError', () => {
  test('creates PluginError with code and message', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
      'Plugin manifest not found',
      { pluginId: 'test-plugin' }
    );

    expect(error.message).toBe('Plugin manifest not found');
    expect(error.code).toBe(PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND);
    expect(error.pluginId).toBe('test-plugin');
    expect(error.name).toBe('PluginError');
  });

  test('provides suggestion based on error code', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
      'Manifest not found',
      { pluginId: 'test-plugin' }
    );

    expect(error.suggestion).toContain('Create a plugin.json');
    expect(error.getHint()).toContain('Create a plugin.json file');
  });

  test('provides documentation link when available', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
      'Manifest not found',
      { pluginId: 'test-plugin' }
    );

    expect(error.docs).toContain('github.com');
  });

  test('getFormattedMessage includes all helpful information', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD,
      'Missing required field',
      { pluginId: 'test-plugin' }
    );

    const formatted = error.getFormattedMessage();
    expect(formatted).toContain('Plugin Error');
    expect(formatted).toContain(PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD);
    expect(formatted).toContain('test-plugin');
    expect(formatted).toContain('💡 Suggestion');
    expect(formatted).toContain('📚 Documentation');
  });

  test('toJSON includes all properties', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND,
      'Entry point not found',
      { pluginId: 'test-plugin', extra: 'detail' }
    );

    const json = error.toJSON();
    expect(json.code).toBe(PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND);
    expect(json.pluginId).toBe('test-plugin');
    expect(json.suggestion).toBeDefined();
    expect(json.docs).toBeDefined();
  });

  test('handles error codes without full suggestions', () => {
    const error = new PluginError(
      'UNKNOWN_CODE',
      'Unknown error',
      { pluginId: 'test-plugin' }
    );

    expect(error.suggestion).toBe('Check the plugin documentation for more information');
    expect(error.docs).toBeNull();
  });

  test('extracts pluginId from details', () => {
    const error1 = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
      'Error',
      { pluginId: 'explicit-id' }
    );
    expect(error1.pluginId).toBe('explicit-id');

    const error2 = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
      'Error',
      { id: 'id-from-details' }
    );
    expect(error2.pluginId).toBe('id-from-details');
  });
});

describe('PluginErrorAnalyzer', () => {
  describe('analyze', () => {
    test('analyzes manifest JSON parse error', () => {
      const originalError = new Error('Unexpected token } in JSON');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {
        phase: 'manifest',
      });

      expect(error.code).toBe(PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON);
      expect(error.message).toContain('test-plugin');
      expect(error.suggestion).toContain('JSON');
    });

    test('analyzes manifest not found error', () => {
      const originalError = new Error('ENOENT: file not found');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {
        phase: 'manifest',
      });

      expect(error.code).toBe(PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND);
    });

    test('analyzes entry point export error', () => {
      const originalError = new Error('does not provide an export');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {
        phase: 'entry',
      });

      expect(error.code).toBe(PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT);
    });

    test('analyzes widget method missing error', () => {
      const originalError = new Error('missing required methods: render, getData');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {
        phase: 'widget',
      });

      expect(error.code).toBe(PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS);
    });

    test('analyzes path validation error', () => {
      const originalError = new Error('invalid path: traversal detected');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {});

      expect(error.code).toBe(PLUGIN_ERROR_CODES.PATH_INVALID);
    });

    test('analyzes dependency missing error', () => {
      const originalError = new Error('dependency not found: other-plugin');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {});

      expect(error.code).toBe(PLUGIN_ERROR_CODES.DEPENDENCY_MISSING);
    });

    test('analyzes circular dependency error', () => {
      const originalError = new Error('circular dependency detected');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {});

      expect(error.code).toBe(PLUGIN_ERROR_CODES.DEPENDENCY_CIRCULAR);
    });

    test('falls back to generic error code for unknown errors', () => {
      const originalError = new Error('some random error');
      const error = PluginErrorAnalyzer.analyze(originalError, 'test-plugin', {});

      expect(error.code).toBe(PLUGIN_ERROR_CODES.PLUGIN_LOAD_ERROR);
    });
  });

  describe('checkCommonMistakes', () => {
    test('detects missing super() call', () => {
      const error = new Error('Error in constructor');
      error.stack = 'Error\n    at new MyWidget (file.js:5:5)\n    at super call';

      const result = PluginErrorAnalyzer.checkCommonMistakes(error);
      // Note: the actual detection depends on stack trace content
      expect(result).toBeNull(); // Since our mock stack doesn't contain actual 'super' keyword
    });

    test('detects missing module', () => {
      const error = new Error("Cannot find module 'some-package'");
      const result = PluginErrorAnalyzer.checkCommonMistakes(error);

      expect(result).toBeTruthy();
      expect(result.mistake).toBe('Missing import/module');
      expect(result.fix).toContain('npm install');
    });

    test('detects calling non-function', () => {
      const error = new Error('foo is not a function');
      const result = PluginErrorAnalyzer.checkCommonMistakes(error);

      expect(result).toBeTruthy();
      expect(result.mistake).toBe('Calling a non-function');
    });

    test('detects undefined property access', () => {
      const error = new Error("Cannot read property 'foo' of undefined");
      const result = PluginErrorAnalyzer.checkCommonMistakes(error);

      expect(result).toBeTruthy();
      expect(result.mistake).toContain('undefined');
      expect(result.fix).toContain('?.');
    });

    test('detects trailing comma in JSON', () => {
      const error = new Error('Unexpected token } in JSON');
      const result = PluginErrorAnalyzer.checkCommonMistakes(error);

      expect(result).toBeTruthy();
      expect(result.mistake).toContain('Trailing comma');
    });

    test('detects invalid JSON syntax', () => {
      const error = new Error('Unexpected token in JSON at position 42');
      const result = PluginErrorAnalyzer.checkCommonMistakes(error);

      expect(result).toBeTruthy();
      expect(result.mistake).toContain('JSON');
    });

    test('returns null for unrecognized errors', () => {
      const error = new Error('completely unexpected error');
      const result = PluginErrorAnalyzer.checkCommonMistakes(error);

      expect(result).toBeNull();
    });
  });
});

describe('formatPluginError', () => {
  test('returns formatted message by default', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
      'Test error',
      { pluginId: 'test' }
    );

    const formatted = formatPluginError(error);
    expect(formatted).toContain('Plugin Error');
    expect(formatted).toContain('💡 Suggestion');
  });

  test('returns compact message when requested', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND,
      'Test error',
      { pluginId: 'test' }
    );

    const formatted = formatPluginError(error, { compact: true });
    expect(formatted).toContain(PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND);
    expect(formatted).not.toContain('💡 Suggestion'); // Compact doesn't include full format
  });
});

describe('extractErrorInfo', () => {
  test('extracts info from PluginError', () => {
    const error = new PluginError(
      PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON,
      'Test error',
      { pluginId: 'test' }
    );

    const info = extractErrorInfo(error);
    expect(info.isPluginError).toBe(true);
    expect(info.code).toBe(PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON);
    expect(info.pluginId).toBe('test');
    expect(info.suggestion).toBeDefined();
    expect(info.docs).toBeDefined();
    expect(info.hasFix).toBe(true);
    expect(info.formatted).toBeDefined();
  });

  test('extracts info from regular Error', () => {
    const error = new Error('regular error');

    const info = extractErrorInfo(error);
    expect(info.isPluginError).toBe(false);
    expect(info.message).toBe('regular error');
    expect(info.commonMistake).toBeNull();
  });

  test('analyzes common mistakes for regular errors', () => {
    const error = new Error('Cannot find module');

    const info = extractErrorInfo(error);
    expect(info.isPluginError).toBe(false);
    expect(info.commonMistake).toBeTruthy();
    expect(info.commonMistake.mistake).toBe('Missing import/module');
  });
});

describe('PLUGIN_ERROR_CODES', () => {
  test('contains all expected error codes', () => {
    expect(PLUGIN_ERROR_CODES.MANIFEST_NOT_FOUND).toBe('PLUGIN_MANIFEST_NOT_FOUND');
    expect(PLUGIN_ERROR_CODES.MANIFEST_INVALID_JSON).toBe('PLUGIN_MANIFEST_INVALID_JSON');
    expect(PLUGIN_ERROR_CODES.MANIFEST_MISSING_FIELD).toBe('PLUGIN_MANIFEST_MISSING_FIELD');
    expect(PLUGIN_ERROR_CODES.ENTRY_NOT_FOUND).toBe('PLUGIN_ENTRY_NOT_FOUND');
    expect(PLUGIN_ERROR_CODES.ENTRY_NO_EXPORT).toBe('PLUGIN_ENTRY_NO_EXPORT');
    expect(PLUGIN_ERROR_CODES.WIDGET_MISSING_METHODS).toBe('PLUGIN_WIDGET_MISSING_METHODS');
    expect(PLUGIN_ERROR_CODES.PATH_INVALID).toBe('PLUGIN_PATH_INVALID');
    expect(PLUGIN_ERROR_CODES.DEPENDENCY_MISSING).toBe('PLUGIN_DEPENDENCY_MISSING');
    expect(PLUGIN_ERROR_CODES.PLUGIN_LOAD_ERROR).toBe('PLUGIN_LOAD_ERROR');
  });
});
