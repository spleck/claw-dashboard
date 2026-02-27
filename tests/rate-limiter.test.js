/**
 * Unit tests for RateLimiter class
 */

import alerts from '../src/alerts.js';

const { RateLimiter } = alerts;

describe('RateLimiter', () => {
  beforeEach(() => {
    alerts.resetRateLimit();
  });

  afterEach(() => {
    alerts.resetRateLimit();
  });

  describe('constructor', () => {
    test('should create RateLimiter with default options', () => {
      const limiter = new RateLimiter();

      expect(limiter.enabled).toBe(true);
      expect(limiter.windowMs).toBe(60000);
      expect(limiter.maxAlerts).toBe(5);
      expect(limiter.alwaysAllowCritical).toBe(true);
      expect(limiter.timestamps).toEqual({});
    });

    test('should create RateLimiter with custom options', () => {
      const limiter = new RateLimiter({
        enabled: false,
        windowMs: 30000,
        maxAlerts: 3,
        alwaysAllowCritical: false
      });

      expect(limiter.enabled).toBe(false);
      expect(limiter.windowMs).toBe(30000);
      expect(limiter.maxAlerts).toBe(3);
      expect(limiter.alwaysAllowCritical).toBe(false);
    });

    test('should partially apply custom options with defaults for others', () => {
      const limiter = new RateLimiter({
        maxAlerts: 10
      });

      expect(limiter.enabled).toBe(true);  // default
      expect(limiter.windowMs).toBe(60000);  // default
      expect(limiter.maxAlerts).toBe(10);  // custom
      expect(limiter.alwaysAllowCritical).toBe(true);  // default
    });
  });

  describe('check', () => {
    test('should allow all alerts when disabled', () => {
      const limiter = new RateLimiter({ enabled: false });

      for (let i = 0; i < 10; i++) {
        const result = limiter.check('cpu', 'warning');
        expect(result.allowed).toBe(true);
        expect(result.reason).toBe('rate_limiting_disabled');
      }
    });

    test('should allow alert when under limit', () => {
      const limiter = new RateLimiter({ maxAlerts: 3 });

      const result = limiter.check('cpu', 'warning');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('ok');
    });

    test('should block alert when over limit', () => {
      const limiter = new RateLimiter({ maxAlerts: 2 });

      // Record two alerts to reach limit
      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');

      const result = limiter.check('cpu', 'warning');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('rate_limit_exceeded');
    });

    test('should always allow critical when alwaysAllowCritical is true', () => {
      const limiter = new RateLimiter({
        maxAlerts: 1,
        alwaysAllowCritical: true
      });

      // Record one alert to reach limit
      limiter.record('cpu', 'warning');

      // Warning should be blocked
      const warningResult = limiter.check('cpu', 'warning');
      expect(warningResult.allowed).toBe(false);

      // Critical should be allowed
      const criticalResult = limiter.check('cpu', 'critical');
      expect(criticalResult.allowed).toBe(true);
      expect(criticalResult.reason).toBe('critical_always_allowed');
    });

    test('should block critical when alwaysAllowCritical is false', () => {
      const limiter = new RateLimiter({
        maxAlerts: 1,
        alwaysAllowCritical: false
      });

      // Record one alert to reach limit
      limiter.record('cpu', 'critical');

      // Another critical should be blocked
      const result = limiter.check('cpu', 'critical');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('rate_limit_exceeded');
    });

    test('should track different alert types separately', () => {
      const limiter = new RateLimiter({ maxAlerts: 1 });

      // Fill up cpu
      limiter.record('cpu', 'warning');
      expect(limiter.check('cpu', 'warning').allowed).toBe(false);

      // Memory should still be allowed
      expect(limiter.check('memory', 'warning').allowed).toBe(true);
    });

    test('should default to warning level when not specified', () => {
      const limiter = new RateLimiter({ maxAlerts: 1 });

      limiter.record('cpu', 'warning');

      // Check without level should use warning
      const result = limiter.check('cpu');
      expect(result.allowed).toBe(false);
    });
  });

  describe('checkAndRecord', () => {
    test('should check and record when allowed', () => {
      const limiter = new RateLimiter({ maxAlerts: 2 });

      const result = limiter.checkAndRecord('cpu', 'warning');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('ok');

      // Verify it was recorded
      expect(limiter.getCount('cpu')).toBe(1);
    });

    test('should check but not record when blocked', () => {
      const limiter = new RateLimiter({ maxAlerts: 1 });

      // First alert
      limiter.checkAndRecord('cpu', 'warning');
      expect(limiter.getCount('cpu')).toBe(1);

      // Second should be blocked and NOT recorded
      const result = limiter.checkAndRecord('cpu', 'warning');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('rate_limit_exceeded');
      expect(limiter.getCount('cpu')).toBe(1);  // Still 1, not incremented
    });

    test('should allow critical even when rate limited and record it', () => {
      const limiter = new RateLimiter({ maxAlerts: 1 });

      // Fill up with warning
      limiter.checkAndRecord('cpu', 'warning');

      // Critical should pass and be recorded
      const result = limiter.checkAndRecord('cpu', 'critical');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('critical_always_allowed');
      expect(limiter.getCount('cpu')).toBe(2);  // Both recorded
    });

    test('should not record when rate limiting disabled', () => {
      const limiter = new RateLimiter({ enabled: false });

      limiter.checkAndRecord('cpu', 'warning');
      limiter.checkAndRecord('cpu', 'warning');

      // Should not have recorded anything
      expect(limiter.getCount('cpu')).toBe(0);
    });
  });

  describe('record', () => {
    test('should record alert timestamp', () => {
      const limiter = new RateLimiter();

      limiter.record('cpu', 'warning');
      expect(limiter.getCount('cpu')).toBe(1);

      limiter.record('cpu', 'warning');
      expect(limiter.getCount('cpu')).toBe(2);
    });

    test('should not record when disabled', () => {
      const limiter = new RateLimiter({ enabled: false });

      limiter.record('cpu', 'warning');
      expect(limiter.getCount('cpu')).toBe(0);
    });

    test('should record multiple types independently', () => {
      const limiter = new RateLimiter();

      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');
      limiter.record('memory', 'warning');

      expect(limiter.getCount('cpu')).toBe(2);
      expect(limiter.getCount('memory')).toBe(1);
      expect(limiter.getCount('disk')).toBe(0);
    });
  });

  describe('getCount', () => {
    test('should return 0 when no alerts recorded', () => {
      const limiter = new RateLimiter();
      expect(limiter.getCount('cpu')).toBe(0);
    });

    test('should return count of alerts in current window', () => {
      const limiter = new RateLimiter({ windowMs: 60000 });

      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');

      expect(limiter.getCount('cpu')).toBe(3);
    });

    test('should exclude expired timestamps', async () => {
      const limiter = new RateLimiter({ windowMs: 50 });

      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');
      expect(limiter.getCount('cpu')).toBe(2);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 60));

      // Old timestamps should be expired
      expect(limiter.getCount('cpu')).toBe(0);
    });
  });

  describe('getRetryAfter', () => {
    test('should return 0 when no alerts recorded', () => {
      const limiter = new RateLimiter();
      expect(limiter.getRetryAfter('cpu')).toBe(0);
    });

    test('should return 0 when under limit', () => {
      const limiter = new RateLimiter({ maxAlerts: 3 });

      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');

      expect(limiter.getRetryAfter('cpu')).toBe(0);
    });

    test('should return time until oldest expires when at limit', async () => {
      const windowMs = 100;
      const limiter = new RateLimiter({ maxAlerts: 2, windowMs });

      // Record two alerts at limit
      limiter.record('cpu', 'warning');
      await new Promise(resolve => setTimeout(resolve, 20));
      limiter.record('cpu', 'warning');

      // At limit, should return time until first expires
      const retryAfter = limiter.getRetryAfter('cpu');
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(windowMs);
    });

    test('should return 0 after window expires', async () => {
      const limiter = new RateLimiter({ maxAlerts: 1, windowMs: 50 });

      limiter.record('cpu', 'warning');
      expect(limiter.getRetryAfter('cpu')).toBeGreaterThan(0);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(limiter.getRetryAfter('cpu')).toBe(0);
    });

    test('should handle different types independently', () => {
      const limiter = new RateLimiter({ maxAlerts: 1 });

      limiter.record('cpu', 'warning');

      expect(limiter.getRetryAfter('cpu')).toBeGreaterThan(0);
      expect(limiter.getRetryAfter('memory')).toBe(0);
    });
  });

  describe('getStatus', () => {
    test('should return full status object', () => {
      const limiter = new RateLimiter({
        enabled: true,
        windowMs: 30000,
        maxAlerts: 3,
        alwaysAllowCritical: false
      });

      const status = limiter.getStatus();

      expect(status.enabled).toBe(true);
      expect(status.windowMs).toBe(30000);
      expect(status.maxAlerts).toBe(3);
      expect(status.alwaysAllowCritical).toBe(false);
      expect(status.types).toEqual({});
    });

    test('should include type status for recorded alerts', () => {
      const limiter = new RateLimiter({ maxAlerts: 5 });

      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');
      limiter.record('memory', 'warning');

      const status = limiter.getStatus();

      expect(status.types.cpu).toEqual({
        current: 2,
        max: 5,
        retryAfter: 0
      });

      expect(status.types.memory).toEqual({
        current: 1,
        max: 5,
        retryAfter: 0
      });

      expect(status.types.disk).toBeUndefined();
    });

    test('should include retryAfter when at limit', () => {
      const limiter = new RateLimiter({ maxAlerts: 2 });

      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');

      const status = limiter.getStatus();

      expect(status.types.cpu.current).toBe(2);
      expect(status.types.cpu.retryAfter).toBeGreaterThan(0);
    });

    test('should exclude expired timestamps from status', async () => {
      const limiter = new RateLimiter({ maxAlerts: 2, windowMs: 50 });

      limiter.record('cpu', 'warning');
      limiter.record('cpu', 'warning');

      await new Promise(resolve => setTimeout(resolve, 60));

      const status = limiter.getStatus();
      expect(status.types.cpu.current).toBe(0);
      expect(status.types.cpu.retryAfter).toBe(0);
    });
  });

  describe('configure', () => {
    test('should update configuration', () => {
      const limiter = new RateLimiter();

      limiter.configure({
        enabled: false,
        windowMs: 30000,
        maxAlerts: 10,
        alwaysAllowCritical: false
      });

      expect(limiter.enabled).toBe(false);
      expect(limiter.windowMs).toBe(30000);
      expect(limiter.maxAlerts).toBe(10);
      expect(limiter.alwaysAllowCritical).toBe(false);
    });

    test('should partially update configuration', () => {
      const limiter = new RateLimiter();

      limiter.configure({ maxAlerts: 20 });

      expect(limiter.enabled).toBe(true);  // unchanged
      expect(limiter.windowMs).toBe(60000);  // unchanged
      expect(limiter.maxAlerts).toBe(20);  // updated
    });

    test('should affect subsequent checks', () => {
      const limiter = new RateLimiter({ maxAlerts: 1 });

      limiter.record('cpu', 'warning');
      expect(limiter.check('cpu', 'warning').allowed).toBe(false);

      // Increase limit
      limiter.configure({ maxAlerts: 3 });

      // Should now be allowed
      expect(limiter.check('cpu', 'warning').allowed).toBe(true);
    });
  });

  describe('reset', () => {
    test('should clear all timestamps', () => {
      const limiter = new RateLimiter();

      limiter.record('cpu', 'warning');
      limiter.record('memory', 'warning');

      expect(limiter.getCount('cpu')).toBe(1);
      expect(limiter.getCount('memory')).toBe(1);

      limiter.reset();

      expect(limiter.getCount('cpu')).toBe(0);
      expect(limiter.getCount('memory')).toBe(0);
      expect(limiter.timestamps).toEqual({});
    });

    test('should allow alerts after reset', () => {
      const limiter = new RateLimiter({ maxAlerts: 1 });

      limiter.record('cpu', 'warning');
      expect(limiter.check('cpu', 'warning').allowed).toBe(false);

      limiter.reset();

      expect(limiter.check('cpu', 'warning').allowed).toBe(true);
    });

    test('should preserve configuration after reset', () => {
      const limiter = new RateLimiter({ maxAlerts: 10, windowMs: 30000 });

      limiter.reset();

      expect(limiter.maxAlerts).toBe(10);
      expect(limiter.windowMs).toBe(30000);
    });
  });

  describe('alwaysAllowCritical behavior', () => {
    test('should allow critical alerts past limit when true', () => {
      const limiter = new RateLimiter({
        maxAlerts: 1,
        alwaysAllowCritical: true
      });

      limiter.record('cpu', 'warning');

      expect(limiter.check('cpu', 'critical').allowed).toBe(true);
      expect(limiter.check('cpu', 'warning').allowed).toBe(false);
    });

    test('should block critical alerts past limit when false', () => {
      const limiter = new RateLimiter({
        maxAlerts: 1,
        alwaysAllowCritical: false
      });

      limiter.record('cpu', 'critical');

      expect(limiter.check('cpu', 'critical').allowed).toBe(false);
    });

    test('should respect level parameter variations', () => {
      const limiter = new RateLimiter({
        maxAlerts: 1,
        alwaysAllowCritical: true
      });

      limiter.record('cpu', 'warning');

      // Various non-critical levels should be blocked
      expect(limiter.check('cpu', 'warning').allowed).toBe(false);
      expect(limiter.check('cpu', 'info').allowed).toBe(false);

      // Critical should pass
      expect(limiter.check('cpu', 'critical').allowed).toBe(true);
    });

    test('should be configurable at runtime', () => {
      const limiter = new RateLimiter({
        maxAlerts: 1,
        alwaysAllowCritical: true
      });

      limiter.record('cpu', 'warning');

      // Initially allowed
      expect(limiter.check('cpu', 'critical').allowed).toBe(true);

      // Disable critical bypass
      limiter.configure({ alwaysAllowCritical: false });

      // Fill up again
      limiter.record('cpu', 'critical');

      // Should now be blocked
      expect(limiter.check('cpu', 'critical').allowed).toBe(false);
    });
  });

  describe('integration with global rate limiting', () => {
    test('should sync with global config on creation', () => {
      // Create limiter should sync its config to global
      new RateLimiter({ maxAlerts: 7 });

      const globalConfig = alerts.getRateLimit();
      expect(globalConfig.maxAlerts).toBe(7);
    });

    test('should sync with global config on configure', () => {
      const limiter = new RateLimiter();

      limiter.configure({ maxAlerts: 15 });

      const globalConfig = alerts.getRateLimit();
      expect(globalConfig.maxAlerts).toBe(15);
    });

    test('defaultRateLimiter instance should exist', () => {
      // Verify the exported defaultRateLimiter exists
      expect(alerts.defaultRateLimiter).toBeDefined();
      expect(alerts.defaultRateLimiter).toBeInstanceOf(RateLimiter);
    });
  });
});
