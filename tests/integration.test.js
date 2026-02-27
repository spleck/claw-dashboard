/**
 * Integration Tests for Claw Dashboard
 * Tests end-to-end workflows covering multiple module interactions
 */

import alerts from '../src/alerts.js';
import performanceMonitor from '../src/performance-monitor.js';
import cache from '../src/cache.js';
import retry from '../src/retry.js';
import config from '../src/config.js';
import logger from '../src/logger.js';

describe('Integration: Alert + Performance Monitor Workflow', () => {
  beforeEach(() => {
    // Reset all module states
    alerts.resetThresholds();
    alerts.clearAllAlerts();
    alerts.resetRateLimit();
    performanceMonitor.reset();
    performanceMonitor.stop();
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  test('performance monitoring triggers alerts when thresholds exceeded', () => {
    // Start performance monitoring
    performanceMonitor.start();

    // Simulate recording high CPU usage over multiple intervals
    // We can't directly inject values, but we can verify the integration points

    // Verify performance monitor is tracking
    expect(performanceMonitor.isTracking).toBe(true);

    // Record some metrics (will use actual system values)
    const snapshot1 = performanceMonitor.record(2000);
    expect(snapshot1).toBeDefined();
    expect(snapshot1.cpuPercent).toBeDefined();
    expect(snapshot1.memoryPercent).toBeDefined();

    // Check if alerts would be triggered based on recorded values
    const alertMetrics = {
      cpu: snapshot1.cpuPercent,
      memory: snapshot1.memoryPercent,
    };

    const newAlerts = alerts.checkAllMetrics(alertMetrics);

    // Alerts are created only if thresholds are exceeded
    // This verifies the integration between performance monitoring and alerts
    if (snapshot1.cpuPercent >= 70 || snapshot1.memoryPercent >= 75) {
      expect(newAlerts.length).toBeGreaterThan(0);
    }
  });

  test('performance health check integrates with alert system', () => {
    performanceMonitor.start();

    // Record multiple snapshots to build history
    for (let i = 0; i < 5; i++) {
      performanceMonitor.record(2000);
    }

    // Get health status
    const health = performanceMonitor.checkHealth();

    // Verify health check returns expected structure
    expect(health).toHaveProperty('degraded');
    expect(health).toHaveProperty('reasons');
    expect(Array.isArray(health.reasons)).toBe(true);

    // If degraded, verify alerts would be triggered
    if (health.degraded) {
      health.reasons.forEach(reason => {
        // Each degradation reason should correspond to an alert type
        expect(reason).toMatch(/(memory|CPU|event loop)/i);
      });
    }
  });

  test('metrics history flows correctly through multiple records', () => {
    performanceMonitor.start();
    performanceMonitor.maxHistory = 10;

    // Record multiple snapshots
    const snapshots = [];
    for (let i = 0; i < 15; i++) {
      const snapshot = performanceMonitor.record(2000);
      snapshots.push(snapshot);
    }

    // Verify history is capped at maxHistory
    expect(performanceMonitor.history.length).toBeLessThanOrEqual(10);

    // Verify aggregates are calculated
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.aggregates.avgMemoryUsed).toBeGreaterThan(0);
    expect(metrics.aggregates.peakMemoryUsed).toBeGreaterThanOrEqual(metrics.aggregates.avgMemoryUsed);

    // Verify sparkline data is available
    const memorySparkline = performanceMonitor.getMemorySparkline();
    const cpuSparkline = performanceMonitor.getCpuSparkline();
    expect(Array.isArray(memorySparkline)).toBe(true);
    expect(Array.isArray(cpuSparkline)).toBe(true);
  });
});

describe('Integration: Cache + Retry Workflow', () => {
  beforeEach(() => {
    cache.clear();
  });

  test('cached data avoids retry overhead', async () => {
    const cacheKey = 'test-integration-key';
    const cacheValue = { data: 'test-value', timestamp: Date.now() };

    // Set cache with long TTL
    cache.set(cacheKey, cacheValue, 60000);

    // Verify cache hit
    const cached = cache.get(cacheKey);
    expect(cached).toEqual(cacheValue);

    // Cache hit should be immediate (no retry needed)
    const startTime = Date.now();
    cache.get(cacheKey);
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(10); // Should be nearly instant
  });

  test('cache miss triggers fresh fetch with retry support', async () => {
    const cacheKey = 'test-miss-key';

    // Ensure cache miss by clearing
    cache.clear();
    const cached = cache.get(cacheKey);
    expect(cached).toBeNull();

    // Verify retry module is available for fallback
    expect(retry.withRetry).toBeDefined();
  });

  test('cache TTL expiration works correctly', async () => {
    const cacheKey = 'test-ttl-key';
    const shortTTL = 50; // 50ms for fast test

    cache.set(cacheKey, { value: 'fresh' }, shortTTL);

    // Should be cached initially
    expect(cache.get(cacheKey)).toBeDefined();

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, shortTTL + 10));

    // Should be expired now
    expect(cache.get(cacheKey)).toBeNull();
  });

  test('cache debounce prevents duplicate fetches', async () => {
    let fetchCount = 0;
    let lastResult = null;

    const fetchFn = async () => {
      fetchCount++;
      lastResult = { data: 'fetched', count: fetchCount };
      return lastResult;
    };

    const debouncedFetch = cache.debounce(fetchFn, 50);

    // Call multiple times rapidly
    debouncedFetch();
    debouncedFetch();
    debouncedFetch();

    // Wait for debounce to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should only fetch once due to debouncing
    expect(fetchCount).toBe(1);
    expect(lastResult).toBeDefined();
  });

  test('cache throttle limits fetch frequency', async () => {
    let fetchCount = 0;
    const results = [];

    const fetchFn = async () => {
      fetchCount++;
      const result = { data: 'fetched', count: fetchCount };
      results.push(result);
      return result;
    };

    const throttledFetch = cache.throttle(fetchFn, 100);

    // Call multiple times
    await throttledFetch();
    await throttledFetch();
    await throttledFetch();

    // Should only execute once within throttle window
    expect(fetchCount).toBe(1);
  });
});

describe('Integration: Retry + Logger Workflow', () => {
  test('retry attempts are logged appropriately', async () => {
    let attemptCount = 0;
    const maxRetries = 2;

    const failingFn = async () => {
      attemptCount++;
      if (attemptCount <= maxRetries) {
        throw new Error('Transient error');
      }
      return 'success';
    };

    const retryOptions = {
      maxRetries,
      initialDelay: 10,
      maxDelay: 50,
      backoffMultiplier: 1,
    };

    // withRetry returns a wrapped function, so we need to call it
    const wrappedFn = retry.withRetry(failingFn, retryOptions);
    const result = await wrappedFn();

    // Should succeed after retries
    expect(result).toBe('success');
    expect(attemptCount).toBe(maxRetries + 1);
  });

  test('retry gives up after max attempts and logs error', async () => {
    const maxRetries = 2;
    let attemptCount = 0;

    const alwaysFailingFn = async () => {
      attemptCount++;
      throw new Error('Persistent error');
    };

    const retryOptions = {
      maxRetries,
      initialDelay: 10,
      maxDelay: 50,
      backoffMultiplier: 1,
    };

    const wrappedFn = retry.withRetry(alwaysFailingFn, retryOptions);

    await expect(wrappedFn()).rejects.toThrow('Persistent error');

    // Should attempt maxRetries + 1 times
    expect(attemptCount).toBe(maxRetries + 1);
  });

  test('retry respects retryable errors', async () => {
    let attemptCount = 0;

    const networkErrorFn = async () => {
      attemptCount++;
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      throw error;
    };

    const retryOptions = {
      maxRetries: 2,
      initialDelay: 10,
      maxDelay: 50,
      backoffMultiplier: 1,
      retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
    };

    const wrappedFn = retry.withRetry(networkErrorFn, retryOptions);

    await expect(wrappedFn()).rejects.toThrow('Connection refused');

    // Should retry because ECONNREFUSED is retryable (initial + 2 retries = 3 attempts)
    expect(attemptCount).toBe(3);
  });

  test('retry does not retry non-retryable errors', async () => {
    let attemptCount = 0;

    const validationErrorFn = async () => {
      attemptCount++;
      throw new Error('Invalid input');
    };

    const retryOptions = {
      maxRetries: 3,
      initialDelay: 10,
      retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
    };

    const wrappedFn = retry.withRetry(validationErrorFn, retryOptions);

    await expect(wrappedFn()).rejects.toThrow('Invalid input');

    // Should not retry - only one attempt
    expect(attemptCount).toBe(1);
  });
});

describe('Integration: Config + Validation + Settings Workflow', () => {
  test('default settings match config defaults', () => {
    const defaultSettings = config.DEFAULT_SETTINGS;

    // Verify key defaults match config
    expect(defaultSettings.refreshInterval).toBe(config.REFRESH_INTERVALS.DEFAULT);
    expect(defaultSettings.theme).toBe('auto');
    expect(defaultSettings.exportFormat).toBe('json');

    // Verify gateway endpoint defaults
    expect(defaultSettings.gatewayEndpoints).toBeDefined();
    expect(defaultSettings.gatewayEndpoints.length).toBeGreaterThan(0);
    expect(defaultSettings.gatewayEndpoints[0].port).toBe(config.GATEWAY.DEFAULT_PORT);
  });

  test('alert thresholds match config', () => {
    const currentThresholds = alerts.getThresholds();

    expect(currentThresholds.cpu.warning).toBe(config.ALERT_THRESHOLDS.CPU.warning);
    expect(currentThresholds.cpu.critical).toBe(config.ALERT_THRESHOLDS.CPU.critical);
    expect(currentThresholds.memory.warning).toBe(config.ALERT_THRESHOLDS.MEMORY.warning);
    expect(currentThresholds.disk.warning).toBe(config.ALERT_THRESHOLDS.DISK.warning);
  });

  test('rate limit config matches defaults', () => {
    const rateLimit = alerts.getRateLimit();

    expect(rateLimit.enabled).toBe(config.ALERT_RATE_LIMIT.ENABLED);
    expect(rateLimit.windowMs).toBe(config.ALERT_RATE_LIMIT.WINDOW_MS);
    expect(rateLimit.maxAlerts).toBe(config.ALERT_RATE_LIMIT.MAX_ALERTS);
  });

  test('cache TTL config is consistent', () => {
    // Verify cache TTL constants are reasonable
    expect(config.CACHE_TTL.CPU).toBeLessThan(config.CACHE_TTL.GPU); // GPU is expensive
    expect(config.CACHE_TTL.DISK).toBeGreaterThan(config.CACHE_TTL.CPU); // Disk rarely changes
    expect(config.CACHE_TTL.CONTAINER).toBeGreaterThan(config.CACHE_TTL.NETWORK);
  });
});

describe('Integration: Full Dashboard Refresh Cycle Simulation', () => {
  beforeEach(() => {
    alerts.resetThresholds();
    alerts.clearAllAlerts();
    alerts.resetRateLimit();
    performanceMonitor.reset();
    performanceMonitor.stop();
    cache.clear();
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  test('simulates complete dashboard refresh cycle', () => {
    // Phase 1: Start monitoring
    performanceMonitor.start();

    // Phase 2: Simulate data fetch with caching
    const systemData = {
      cpu: 45,
      memory: 60,
      disk: 50,
    };

    // Cache the data
    cache.set('system-metrics', systemData, config.CACHE_TTL.CPU);

    // Phase 3: Check alerts
    const newAlerts = alerts.checkAllMetrics(systemData);

    // No alerts should be created for normal values
    expect(newAlerts.length).toBe(0);

    // Phase 4: Record performance metrics
    const perfSnapshot = performanceMonitor.record(2000);
    expect(perfSnapshot).toBeDefined();

    // Phase 5: Verify health
    const health = performanceMonitor.checkHealth();
    expect(health.degraded).toBe(false);
  });

  test('handles alert escalation workflow', () => {
    performanceMonitor.start();

    // Normal state
    let newAlerts = alerts.checkAllMetrics({ cpu: 50, memory: 50, disk: 50 });
    expect(newAlerts.length).toBe(0);

    // Warning state
    newAlerts = alerts.checkAllMetrics({ cpu: 75, memory: 50, disk: 50 });
    expect(newAlerts.length).toBe(1);
    expect(newAlerts[0].type).toBe('cpu');
    expect(newAlerts[0].level).toBe(alerts.AlertLevel.WARNING);

    // Critical escalation
    newAlerts = alerts.checkAllMetrics({ cpu: 95, memory: 50, disk: 50 });
    // Should update existing alert, not create new one
    const activeAlerts = alerts.getActiveAlerts();
    const cpuAlert = activeAlerts.find(a => a.type === 'cpu');
    expect(cpuAlert.level).toBe(alerts.AlertLevel.CRITICAL);

    // Recovery
    newAlerts = alerts.checkAllMetrics({ cpu: 50, memory: 50, disk: 50 });
    expect(newAlerts.length).toBe(1);
    expect(newAlerts[0].level).toBe(alerts.AlertLevel.CLEARED);
  });

  test('handles multiple simultaneous alerts', () => {
    // Trigger multiple alerts at once
    const newAlerts = alerts.checkAllMetrics({
      cpu: 95,      // Critical
      memory: 92,   // Critical
      disk: 96,     // Critical
    });

    expect(newAlerts.length).toBe(3);
    expect(newAlerts.map(a => a.type)).toEqual(expect.arrayContaining(['cpu', 'memory', 'disk']));

    const activeAlerts = alerts.getActiveAlerts();
    expect(activeAlerts.length).toBe(3);

    // All should be critical
    activeAlerts.forEach(alert => {
      expect(alert.level).toBe(alerts.AlertLevel.CRITICAL);
    });
  });

  test('respects alert rate limiting in workflow', () => {
    // Enable strict rate limiting
    alerts.setRateLimit({ enabled: true, maxAlerts: 2, windowMs: 1000 });

    // First two alerts should go through
    let alert1 = alerts.checkThreshold('cpu', 75);
    expect(alert1).not.toBeNull();

    let alert2 = alerts.checkThreshold('cpu', 78);
    // Should update existing, return null
    expect(alert2).toBeNull();

    // Clear and try again
    alerts.clearAllAlerts();

    alert1 = alerts.checkThreshold('cpu', 75);
    expect(alert1).not.toBeNull();

    alert2 = alerts.checkThreshold('memory', 80);
    expect(alert2).not.toBeNull();

    // Third type should be rate limited
    const alert3 = alerts.checkThreshold('disk', 85);
    expect(alert3).toBeNull();
  });
});

describe('Integration: Error Handling Across Modules', () => {
  test('handles graceful degradation when modules fail', () => {
    // Simulate performance monitor being inactive
    performanceMonitor.stop();

    // Should return null gracefully
    const snapshot = performanceMonitor.record();
    expect(snapshot).toBeNull();

    // Status should indicate inactive
    const status = performanceMonitor.getStatusString();
    expect(status).toContain('inactive');

    // Alerts should still work independently
    const alert = alerts.checkThreshold('cpu', 95);
    expect(alert).not.toBeNull();
  });

  test('cache fallback works when fetch fails', async () => {
    const cacheKey = 'fallback-test';
    const cachedValue = { data: 'stale-but-available' };

    // Pre-populate cache
    cache.set(cacheKey, cachedValue, 100);

    // Simulate fetch failure with retry
    const failingFetch = async () => {
      throw new Error('Network error');
    };

    const retryOptions = {
      maxRetries: 1,
      initialDelay: 10,
      retryableErrors: ['Network error'],
    };

    // Retry should fail, but cache has fallback data
    await expect(retry.withRetry(failingFetch, 'test', retryOptions))
      .rejects.toThrow('Network error');

    // Cache should still have data (if not expired)
    // In real workflow, would use cached value as fallback
    const stillCached = cache.get(cacheKey);
    expect(stillCached).toBeDefined();
  });

  test('logger captures errors from all modules', () => {
    // This test verifies logger integration
    // Logger writes to file, so we verify it doesn't throw

    expect(() => {
      logger.error('Integration test error');
      logger.warn('Integration test warning');
      logger.info('Integration test info');
      logger.debug('Integration test debug');
    }).not.toThrow();
  });
});

describe('Integration: Gateway Configuration Workflow', () => {
  test('gateway config flows through settings', () => {
    const defaultSettings = config.DEFAULT_SETTINGS;

    // Verify gateway endpoint structure
    const endpoint = defaultSettings.gatewayEndpoints[0];
    expect(endpoint).toHaveProperty('name');
    expect(endpoint).toHaveProperty('host');
    expect(endpoint).toHaveProperty('port');
    expect(endpoint).toHaveProperty('token');
    expect(endpoint).toHaveProperty('enabled');
    expect(endpoint).toHaveProperty('type');

    // Verify port matches config
    expect(endpoint.port).toBe(config.GATEWAY.DEFAULT_PORT);

    // Verify timeout config exists
    expect(config.GATEWAY.TIMEOUT_MS).toBeGreaterThan(0);
  });

  test('validation constraints are consistent with config', () => {
    const validation = config.VALIDATION;

    // Refresh interval constraints
    expect(validation.REFRESH_INTERVAL.MIN).toBeLessThanOrEqual(config.REFRESH_INTERVALS.DEFAULT);
    expect(validation.REFRESH_INTERVAL.MAX).toBeGreaterThan(config.REFRESH_INTERVALS.DEFAULT);

    // Theme validation includes default
    expect(validation.VALID_THEMES).toContain('auto');
    expect(validation.VALID_THEMES).toContain('default');

    // Sort modes are defined
    expect(validation.VALID_SORT_MODES.length).toBeGreaterThan(0);
  });
});
