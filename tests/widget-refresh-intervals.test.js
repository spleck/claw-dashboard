/**
 * Tests for Widget Configurable Refresh Intervals and Graceful Degradation
 */

import { jest } from '@jest/globals';
import { BaseWidget } from '../src/widgets/plugin-api.js';
import config from '../src/config.js';

// Mock logger
jest.unstable_mockModule('../src/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Widget Refresh Intervals', () => {
  describe('BaseWidget', () => {
    test('should initialize with null refresh interval by default', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      expect(widget.refreshInterval).toBeNull();
    });

    test('should use refresh interval from config', () => {
      const widget = new BaseWidget({ id: 'cpu' });
      // CPU should use WIDGET_REFRESH_INTERVALS.CPU from config
      expect(widget.refreshInterval).toBe(config.WIDGET_REFRESH_INTERVALS.CPU);
    });

    test('should allow custom refresh interval in constructor', () => {
      const widget = new BaseWidget({
        id: 'custom-widget',
        config: { refreshInterval: 5000 }
      });
      expect(widget.refreshInterval).toBe(5000);
    });

    test('should validate refresh interval range', () => {
      const widget = new BaseWidget({ id: 'test-widget' });

      // Valid intervals should work
      widget.updateRefreshInterval(1000);
      expect(widget.refreshInterval).toBe(1000);

      widget.updateRefreshInterval(30000);
      expect(widget.refreshInterval).toBe(30000);

      widget.updateRefreshInterval(null);
      expect(widget.refreshInterval).toBeNull();
    });

    test('should throw on invalid refresh interval', () => {
      const widget = new BaseWidget({ id: 'test-widget' });

      // Too low
      expect(() => widget.updateRefreshInterval(100)).toThrow(/Invalid refresh interval/);

      // Too high
      expect(() => widget.updateRefreshInterval(100000)).toThrow(/Invalid refresh interval/);
    });
  });

  describe('shouldUpdate', () => {
    test('should always return true when no refresh interval is set', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      widget.refreshInterval = null;

      expect(widget.shouldUpdate(1000)).toBe(true);
      expect(widget.shouldUpdate(0)).toBe(true);
      expect(widget.shouldUpdate(999999)).toBe(true);
    });

    test('should return true when interval has elapsed', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      widget.refreshInterval = 1000;
      widget.lastUpdateTime = 0;

      expect(widget.shouldUpdate(1000)).toBe(true);
      expect(widget.shouldUpdate(1500)).toBe(true);
      expect(widget.shouldUpdate(2000)).toBe(true);
    });

    test('should return false when interval has not elapsed', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      widget.refreshInterval = 1000;
      widget.lastUpdateTime = 1000;

      expect(widget.shouldUpdate(1000)).toBe(false);
      expect(widget.shouldUpdate(1500)).toBe(false);
      expect(widget.shouldUpdate(1999)).toBe(false);
    });

    test('should use current time when not provided', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      widget.refreshInterval = 50000; // Very long interval
      widget.lastUpdateTime = Date.now();

      expect(widget.shouldUpdate()).toBe(false);
    });
  });

  describe('recordUpdate', () => {
    test('should update lastUpdateTime and increment count', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      widget.recordUpdate(1000);

      expect(widget.lastUpdateTime).toBe(1000);
      expect(widget.updateCount).toBe(1);

      widget.recordUpdate(2000);
      expect(widget.lastUpdateTime).toBe(2000);
      expect(widget.updateCount).toBe(2);
    });

    test('should use current time by default', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      const before = Date.now();
      widget.recordUpdate();
      const after = Date.now();

      expect(widget.lastUpdateTime).toBeGreaterThanOrEqual(before);
      expect(widget.lastUpdateTime).toBeLessThanOrEqual(after);
    });
  });

  describe('getRefreshStats', () => {
    test('should return refresh statistics', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      widget.refreshInterval = 5000;
      widget.lastUpdateTime = 1000;
      widget.updateCount = 5;
      widget.skipCount = 2;

      const stats = widget.getRefreshStats();

      expect(stats.refreshInterval).toBe(5000);
      expect(stats.lastUpdateTime).toBe(1000);
      expect(stats.updateCount).toBe(5);
      expect(stats.skippedUpdates).toBe(2);
    });
  });
});

describe('Widget Graceful Degradation', () => {
  describe('shouldUpdateUnderDegradation', () => {
    test('should always allow critical widgets to update', () => {
      const widget = new BaseWidget({ id: 'cpu' });
      widget.refreshInterval = 1000;
      widget.lastUpdateTime = 0;

      // Critical widgets should update even in critical degradation
      const result = widget.shouldUpdateUnderDegradation('critical', 1000);
      expect(result.shouldUpdate).toBe(true);
      expect(result.reason).toBe('critical_widget');
    });

    test('should skip non-critical widgets in critical degradation', () => {
      const widget = new BaseWidget({ id: 'disk' });
      widget.priority = 100; // Non-critical priority
      widget.refreshInterval = 30000;
      widget.lastUpdateTime = 0;

      // Disk widget should be skipped in critical degradation
      const result = widget.shouldUpdateUnderDegradation('critical', 1000);
      expect(result.shouldUpdate).toBe(false);
      expect(result.reason).toBe('degradation_critical_skip');
      expect(widget.skipCount).toBe(1);
    });

    test('should extend intervals under warning degradation', () => {
      const widget = new BaseWidget({ id: 'disk' });
      widget.priority = 100;
      widget.refreshInterval = 10000;
      widget.lastUpdateTime = 0;

      // At time 5000, with 1.5x multiplier, need 15000ms - should not update
      const result1 = widget.shouldUpdateUnderDegradation('warning', 5000);
      expect(result1.shouldUpdate).toBe(false);
      expect(result1.reason).toBe('degradation_extended_interval');

      // At time 16000, with 1.5x multiplier on 10000ms = 15000ms - should update
      const result2 = widget.shouldUpdateUnderDegradation('warning', 16000);
      expect(result2.shouldUpdate).toBe(true);
      expect(result2.reason).toBe('ok');
    });

    test('should extend intervals more under critical degradation', () => {
      const widget = new BaseWidget({ id: 'network' });
      widget.priority = 10; // Low enough to not be skipped
      widget.refreshInterval = 10000;
      widget.lastUpdateTime = 0;

      // At time 15000, with 2.0x multiplier, need 20000ms - should not update
      const result1 = widget.shouldUpdateUnderDegradation('critical', 15000);
      expect(result1.shouldUpdate).toBe(false);
      expect(result1.reason).toBe('degradation_extended_interval');

      // At time 25000, with 2.0x multiplier on 10000ms = 20000ms - should update
      const result2 = widget.shouldUpdateUnderDegradation('critical', 25000);
      expect(result2.shouldUpdate).toBe(true);
      expect(result2.reason).toBe('ok');
    });

    test('should use standard intervals when no degradation', () => {
      const widget = new BaseWidget({ id: 'disk' });
      widget.refreshInterval = 30000;
      widget.lastUpdateTime = 0;

      // Should use normal interval when no degradation
      const result1 = widget.shouldUpdateUnderDegradation('none', 1000);
      expect(result1.shouldUpdate).toBe(false);
      expect(result1.reason).toBe('interval_not_elapsed');

      const result2 = widget.shouldUpdateUnderDegradation('none', 30000);
      expect(result2.shouldUpdate).toBe(true);
      expect(result2.reason).toBe('ok');
    });
  });

  describe('setDegradationLevel', () => {
    test('should update degradation state', () => {
      const widget = new BaseWidget({ id: 'test-widget' });

      widget.setDegradationLevel('warning');
      expect(widget.degradationLevel).toBe('warning');
      expect(widget.isDegraded).toBe(true);

      widget.setDegradationLevel('critical');
      expect(widget.degradationLevel).toBe('critical');
      expect(widget.isDegraded).toBe(true);

      widget.setDegradationLevel('none');
      expect(widget.degradationLevel).toBe('none');
      expect(widget.isDegraded).toBe(false);
    });

    test('should adjust currentRefreshInterval based on degradation', () => {
      const widget = new BaseWidget({ id: 'test-widget' });
      widget.refreshInterval = 10000;

      // Normal operation
      widget.setDegradationLevel('none');
      expect(widget.currentRefreshInterval).toBe(10000);

      // Warning - 1.5x multiplier
      widget.setDegradationLevel('warning');
      expect(widget.currentRefreshInterval).toBe(15000);

      // Critical - 2.0x multiplier
      widget.setDegradationLevel('critical');
      expect(widget.currentRefreshInterval).toBe(20000);
    });
  });
});

describe('Widget Config Integration', () => {
  test('WIDGET_REFRESH_INTERVALS should have expected values', () => {
    // Check that config has the expected default values
    expect(config.WIDGET_REFRESH_INTERVALS.CPU).toBe(1000);
    expect(config.WIDGET_REFRESH_INTERVALS.MEMORY).toBe(1000);
    expect(config.WIDGET_REFRESH_INTERVALS.GPU).toBe(5000);
    expect(config.WIDGET_REFRESH_INTERVALS.NETWORK).toBe(1000);
    expect(config.WIDGET_REFRESH_INTERVALS.DISK).toBe(30000);
    expect(config.WIDGET_REFRESH_INTERVALS.SYSTEM).toBe(5000);
    expect(config.WIDGET_REFRESH_INTERVALS.UPTIME).toBe(60000);
  });

  test('WIDGET_REFRESH_VALIDATION should have min/max values', () => {
    expect(config.WIDGET_REFRESH_VALIDATION.MIN_INTERVAL).toBe(500);
    expect(config.WIDGET_REFRESH_VALIDATION.MAX_INTERVAL).toBe(60000);
  });

  test('WIDGET_DEGRADATION should define critical widgets', () => {
    expect(config.WIDGET_DEGRADATION.CRITICAL_WIDGETS).toContain('cpu');
    expect(config.WIDGET_DEGRADATION.CRITICAL_WIDGETS).toContain('memory');
  });

  test('WIDGET_DEGRADATION should have multipliers', () => {
    expect(config.WIDGET_DEGRADATION.WARNING.EXTEND_INTERVAL_MULTIPLIER).toBe(1.5);
    expect(config.WIDGET_DEGRADATION.CRITICAL.EXTEND_INTERVAL_MULTIPLIER).toBe(2.0);
  });
});
