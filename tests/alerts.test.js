/**
 * Unit tests for alert threshold logic in alerts.js
 */

import alerts from '../src/alerts.js';

describe('Alert Threshold Logic', () => {
  beforeEach(() => {
    // Reset thresholds and clear alerts before each test
    alerts.resetThresholds();
    alerts.clearAllAlerts();
    alerts.resetRateLimit();
  });

  describe('checkThreshold', () => {
    test('should return null when value is below warning threshold', () => {
      const result = alerts.checkThreshold('cpu', 50);
      expect(result).toBeNull();
    });

    test('should create warning alert when value reaches warning threshold', () => {
      const result = alerts.checkThreshold('cpu', 70);
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('cpu');
      expect(result.level).toBe(alerts.AlertLevel.WARNING);
      expect(result.value).toBe(70);
      expect(result.threshold).toBe(70);
      expect(result.message).toContain('Warning');
    });

    test('should create critical alert when value reaches critical threshold', () => {
      const result = alerts.checkThreshold('cpu', 90);
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('cpu');
      expect(result.level).toBe(alerts.AlertLevel.CRITICAL);
      expect(result.value).toBe(90);
      expect(result.threshold).toBe(90);
      expect(result.message).toContain('Critical');
    });

    test('should upgrade warning to critical when value crosses threshold', () => {
      // First create a warning
      alerts.checkThreshold('cpu', 70);
      const criticalAlert = alerts.checkThreshold('cpu', 90);
      
      expect(criticalAlert).not.toBeNull();
      expect(criticalAlert.level).toBe(alerts.AlertLevel.CRITICAL);
      
      // Should have critical alert in active alerts
      const activeAlerts = alerts.getActiveAlerts();
      const cpuAlert = activeAlerts.find(a => a.type === 'cpu');
      expect(cpuAlert.level).toBe(alerts.AlertLevel.CRITICAL);
    });

    test('should not create duplicate alerts for same level', () => {
      alerts.checkThreshold('cpu', 75);
      const activeBefore = alerts.getActiveAlerts().length;
      
      alerts.checkThreshold('cpu', 78);
      const activeAfter = alerts.getActiveAlerts().length;
      
      // Should not add duplicate - just update existing
      expect(activeBefore).toBe(activeAfter);
    });

    test('should create cleared alert when value drops below threshold', () => {
      // Create a warning alert first
      alerts.checkThreshold('cpu', 75);
      
      // Clear the alert by dropping below threshold
      const clearedAlert = alerts.checkThreshold('cpu', 50);
      
      expect(clearedAlert).not.toBeNull();
      expect(clearedAlert.level).toBe(alerts.AlertLevel.CLEARED);
      expect(clearedAlert.message).toContain('normalized');
    });

    test('should return null when updating existing alert with same level', () => {
      alerts.checkThreshold('cpu', 75);
      const result = alerts.checkThreshold('cpu', 80);
      
      // Should update but return null (no new alert)
      expect(result).toBeNull();
    });

    test('should handle memory metric type', () => {
      const result = alerts.checkThreshold('memory', 80);
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('memory');
      expect(result.level).toBe(alerts.AlertLevel.WARNING);
    });

    test('should handle disk metric type', () => {
      const result = alerts.checkThreshold('disk', 85);
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('disk');
      expect(result.level).toBe(alerts.AlertLevel.WARNING);
    });

    test('should return null for unknown metric type', () => {
      const result = alerts.checkThreshold('unknown', 50);
      expect(result).toBeNull();
    });

    test('should use custom thresholds when set', () => {
      alerts.setThresholds({
        cpu: { warning: 50, critical: 80 }
      });
      
      // Should trigger warning at 50
      const warningResult = alerts.checkThreshold('cpu', 50);
      expect(warningResult.level).toBe(alerts.AlertLevel.WARNING);
      
      // Should trigger critical at 80
      const criticalResult = alerts.checkThreshold('cpu', 80);
      expect(criticalResult.level).toBe(alerts.AlertLevel.CRITICAL);
    });

    test('should handle edge case at exact threshold values', () => {
      // Reset to ensure clean state
      alerts.clearAllAlerts();
      
      // Exact warning threshold
      const warningResult = alerts.checkThreshold('cpu', 70);
      expect(warningResult.level).toBe(alerts.AlertLevel.WARNING);
      
      // Exact critical threshold
      const criticalResult = alerts.checkThreshold('cpu', 90);
      expect(criticalResult.level).toBe(alerts.AlertLevel.CRITICAL);
      
      // Clear the alert - value below warning but existing critical alert exists
      const clearedResult = alerts.checkThreshold('cpu', 69);
      // Should create a cleared alert since there was an active critical alert
      expect(clearedResult).not.toBeNull();
      expect(clearedResult.level).toBe(alerts.AlertLevel.CLEARED);
    });
  });

  describe('checkAllMetrics', () => {
    test('should check all provided metrics', () => {
      const metrics = {
        cpu: 85,
        memory: 80,
        disk: 90
      };
      
      const results = alerts.checkAllMetrics(metrics);
      
      expect(results.length).toBe(3);
      expect(results.map(r => r.type)).toContain('cpu');
      expect(results.map(r => r.type)).toContain('memory');
      expect(results.map(r => r.type)).toContain('disk');
    });

    test('should only check metrics that are defined', () => {
      const metrics = {
        cpu: 85
        // memory and disk not provided
      };
      
      const results = alerts.checkAllMetrics(metrics);
      
      expect(results.length).toBe(1);
      expect(results[0].type).toBe('cpu');
    });

    test('should return empty array when no metrics exceed thresholds', () => {
      const metrics = {
        cpu: 50,
        memory: 50,
        disk: 50
      };
      
      const results = alerts.checkAllMetrics(metrics);
      
      expect(results.length).toBe(0);
    });

    test('should handle undefined metrics object', () => {
      const results = alerts.checkAllMetrics(undefined);
      expect(results).toEqual([]);
    });

    test('should handle empty metrics object', () => {
      const results = alerts.checkAllMetrics({});
      expect(results).toEqual([]);
    });

    test('should return only new alerts, not updates', () => {
      const metrics1 = { cpu: 75 };
      const results1 = alerts.checkAllMetrics(metrics1);
      expect(results1.length).toBe(1);
      
      // Update same metric
      const metrics2 = { cpu: 80 };
      const results2 = alerts.checkAllMetrics(metrics2);
      // This returns null for updates, so should be 0
      expect(results2.length).toBe(0);
    });
  });

  describe('Alert Level Constants', () => {
    test('should have correct alert level values', () => {
      expect(alerts.AlertLevel.INFO).toBe('info');
      expect(alerts.AlertLevel.WARNING).toBe('warning');
      expect(alerts.AlertLevel.CRITICAL).toBe('critical');
      expect(alerts.AlertLevel.CLEARED).toBe('cleared');
    });
  });

  describe('Threshold Management', () => {
    test('getThresholds should return current thresholds', () => {
      const thresholds = alerts.getThresholds();
      
      expect(thresholds.cpu.warning).toBe(70);
      expect(thresholds.cpu.critical).toBe(90);
      expect(thresholds.memory.warning).toBe(75);
      expect(thresholds.memory.critical).toBe(90);
      expect(thresholds.disk.warning).toBe(80);
      expect(thresholds.disk.critical).toBe(95);
    });

    test('resetThresholds should restore defaults', () => {
      alerts.setThresholds({ cpu: { warning: 10, critical: 20 } });
      alerts.resetThresholds();
      
      const thresholds = alerts.getThresholds();
      expect(thresholds.cpu.warning).toBe(70);
      expect(thresholds.cpu.critical).toBe(90);
    });
  });

  describe('Alert Management', () => {
    test('getActiveAlerts should return non-dismissed alerts', () => {
      alerts.checkThreshold('cpu', 85);
      alerts.checkThreshold('memory', 85);
      
      const active = alerts.getActiveAlerts();
      expect(active.length).toBe(2);
    });

    test('dismissAlert should mark alert as dismissed', () => {
      const alert = alerts.checkThreshold('cpu', 85);
      alerts.dismissAlert(alert.id);
      
      const active = alerts.getActiveAlerts();
      expect(active.find(a => a.id === alert.id)).toBeUndefined();
    });

    test('getAlertsByLevel should filter by level', () => {
      alerts.checkThreshold('cpu', 95);  // critical (above 90%)
      alerts.checkThreshold('memory', 75);  // warning
      
      const critical = alerts.getAlertsByLevel(alerts.AlertLevel.CRITICAL);
      expect(critical.length).toBe(1);
      expect(critical[0].type).toBe('cpu');
      
      const warning = alerts.getAlertsByLevel(alerts.AlertLevel.WARNING);
      expect(warning.length).toBe(1);
      expect(warning[0].type).toBe('memory');
    });

    test('clearAllAlerts should dismiss all active alerts', () => {
      alerts.checkThreshold('cpu', 85);
      alerts.checkThreshold('memory', 85);
      
      alerts.clearAllAlerts();
      
      const active = alerts.getActiveAlerts();
      expect(active.length).toBe(0);
    });

    test('getAlertHistory should return all alerts including dismissed', () => {
      const alert = alerts.checkThreshold('cpu', 85);
      alerts.dismissAlert(alert.id);
      
      const history = alerts.getAlertHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    alerts.resetThresholds();
    alerts.clearAllAlerts();
    alerts.resetRateLimit();
  });

  describe('shouldRateLimitAlert', () => {
    test('should allow alerts when rate limiting is disabled', () => {
      alerts.setRateLimit({ enabled: false });
      
      // Should never rate limit when disabled
      for (let i = 0; i < 10; i++) {
        expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
      }
    });

    test('should allow first few alerts within limit', () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 3, windowMs: 60000 });
      
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
    });

    test('should rate limit alerts exceeding maxAlerts', () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 2, windowMs: 60000 });
      
      // First two should pass
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
      
      // Third should be rate limited
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(true);
    });

    test('should track rate limits separately per alert type', () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 1, windowMs: 60000 });
      
      // cpu should be limited after one
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(true);
      
      // memory should still be allowed
      expect(alerts.shouldRateLimitAlert('memory')).toBe(false);
    });

    test('should respect custom windowMs', async () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 1, windowMs: 50 });
      
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(true);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Should be allowed again after window expires
      expect(alerts.shouldRateLimitAlert('cpu')).toBe(false);
    });
  });

  describe('checkThreshold with rate limiting', () => {
    test('should suppress warning alerts when rate limited', () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 1, windowMs: 60000 });
      
      // First alert goes through
      const alert1 = alerts.checkThreshold('cpu', 75);
      expect(alert1).not.toBeNull();
      
      // Second warning should be suppressed
      const alert2 = alerts.checkThreshold('cpu', 80);
      expect(alert2).toBeNull();
    });

    test('should always allow critical alerts even when rate limited', () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 1, windowMs: 60000 });
      
      // First alert (warning) goes through
      const alert1 = alerts.checkThreshold('cpu', 75);
      expect(alert1).not.toBeNull();
      
      // Critical should always go through
      const alert2 = alerts.checkThreshold('cpu', 95);
      expect(alert2).not.toBeNull();
      expect(alert2.level).toBe(alerts.AlertLevel.CRITICAL);
    });

    test('should always allow cleared alerts', () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 1, windowMs: 60000 });
      
      // Create an alert
      alerts.checkThreshold('cpu', 85);
      
      // Clear the alert - should always go through
      const cleared = alerts.checkThreshold('cpu', 50);
      expect(cleared).not.toBeNull();
      expect(cleared.level).toBe(alerts.AlertLevel.CLEARED);
    });
  });

  describe('getRateLimit and setRateLimit', () => {
    test('should return current rate limit config', () => {
      const config = alerts.getRateLimit();
      
      expect(config.enabled).toBe(true);
      expect(config.windowMs).toBe(60000);
      expect(config.maxAlerts).toBe(5);
    });

    test('should update rate limit config', () => {
      alerts.setRateLimit({ enabled: false, maxAlerts: 10 });
      
      const config = alerts.getRateLimit();
      expect(config.enabled).toBe(false);
      expect(config.maxAlerts).toBe(10);
    });

    test('should preserve unspecified values when setting config', () => {
      alerts.setRateLimit({ maxAlerts: 3 });
      
      const config = alerts.getRateLimit();
      expect(config.maxAlerts).toBe(3);
      expect(config.enabled).toBe(true);  // preserved
      expect(config.windowMs).toBe(60000);  // preserved
    });
  });

  describe('resetRateLimit', () => {
    test('should reset rate limit state', () => {
      alerts.setRateLimit({ enabled: true, maxAlerts: 1, windowMs: 60000 });
      
      // Trigger rate limit
      alerts.shouldRateLimitAlert('cpu');
      alerts.shouldRateLimitAlert('cpu');
      
      // Reset
      alerts.resetRateLimit();
      
      const config = alerts.getRateLimit();
      expect(config.enabled).toBe(true);
      expect(config.maxAlerts).toBe(5);  // back to default
    });
  });
});
