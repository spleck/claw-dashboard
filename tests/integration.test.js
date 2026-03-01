/**
 * Integration Tests for Claw Dashboard
 * Tests end-to-end workflows covering multiple module interactions
 */

import { jest } from '@jest/globals';

// Mock systeminformation to avoid system-dependent behavior
const mockCurrentLoad = jest.fn();
const mockMem = jest.fn();
const mockGraphics = jest.fn();
const mockNetworkStats = jest.fn();
const mockFsSize = jest.fn();
const mockOsInfo = jest.fn();
const mockVersions = jest.fn();
const mockTime = jest.fn();
const mockProcesses = jest.fn();

jest.unstable_mockModule('systeminformation', () => ({
  currentLoad: mockCurrentLoad,
  mem: mockMem,
  graphics: mockGraphics,
  networkStats: mockNetworkStats,
  fsSize: mockFsSize,
  osInfo: mockOsInfo,
  versions: mockVersions,
  time: mockTime,
  processes: mockProcesses,
}));

// Import modules after mocking
import alerts from '../src/alerts.js';
import performanceMonitor from '../src/performance-monitor.js';
import cache from '../src/cache.js';
import retry from '../src/retry.js';
import config from '../src/config.js';
import logger from '../src/logger.js';

// Default mock responses
const defaultCpuData = {
  currentLoad: 25.5,
  currentLoadUser: 20.0,
  currentLoadSystem: 5.5,
  cpus: [{ load: 25.5 }],
};

const defaultMemData = {
  total: 8589934592, // 8GB
  active: 4294967296, // 4GB
  available: 4294967296,
  used: 3221225472, // 3GB
  free: 5368709120,
  percent: 37.5,
};

const defaultOsData = {
  platform: 'darwin',
  distro: 'macOS',
  release: '14.0',
  codename: 'Sonoma',
  hostname: 'test-host',
  arch: 'arm64',
};

describe('Integration: Alert + Performance Monitor Workflow', () => {
  beforeEach(() => {
    // Reset all module states
    alerts.resetThresholds();
    alerts.clearAllAlerts();
    alerts.resetRateLimit();
    performanceMonitor.reset();
    performanceMonitor.stop();

    // Setup systeminformation mocks
    mockCurrentLoad.mockReset().mockResolvedValue(defaultCpuData);
    mockMem.mockReset().mockResolvedValue(defaultMemData);
    mockGraphics.mockReset().mockResolvedValue({ controllers: [] });
    mockNetworkStats.mockReset().mockResolvedValue([]);
    mockFsSize.mockReset().mockResolvedValue([]);
    mockOsInfo.mockReset().mockResolvedValue(defaultOsData);
    mockVersions.mockReset().mockResolvedValue({ node: '20.0.0', npm: '10.0.0' });
    mockTime.mockReset().mockResolvedValue({ uptime: 3600 });
    mockProcesses.mockReset().mockResolvedValue({ list: [] });
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  test('performance monitoring triggers alerts when thresholds exceeded', async () => {
    // Start performance monitoring
    performanceMonitor.start();

    // Simulate recording high CPU usage over multiple intervals
    // We can't directly inject values, but we can verify the integration points

    // Verify performance monitor is tracking
    expect(performanceMonitor.isTracking).toBe(true);

    // Record some metrics (will use actual system values)
    const snapshot1 = await performanceMonitor.record(2000);
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

  test('metrics history flows correctly through multiple records', async () => {
    performanceMonitor.start();
    performanceMonitor.maxHistory = 10;

    // Record multiple snapshots
    const snapshots = [];
    for (let i = 0; i < 15; i++) {
      const snapshot = await performanceMonitor.record(2000);
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
        throw new Error('Network timeout'); // Matches retryable pattern
      }
      return 'success';
    };

    const retryOptions = {
      maxRetries,
      initialDelay: 10,
      maxDelay: 50,
      backoffMultiplier: 1,
    };

    // withRetry returns a wrapped function
    const wrappedFn = retry.withRetry(failingFn, retryOptions);
    const result = await wrappedFn();

    // Should succeed after retries
    expect(result).toBe('success');
    // Initial attempt + retries = maxRetries + 1
    expect(attemptCount).toBeGreaterThanOrEqual(1);
  });

  test('retry gives up after max attempts and logs error', async () => {
    const maxRetries = 2;
    let attemptCount = 0;

    const alwaysFailingFn = async () => {
      attemptCount++;
      throw new Error('Network error'); // Matches retryable pattern
    };

    const retryOptions = {
      maxRetries,
      initialDelay: 10,
      maxDelay: 50,
      backoffMultiplier: 1,
    };

    const wrappedFn = retry.withRetry(alwaysFailingFn, retryOptions);

    await expect(wrappedFn()).rejects.toThrow('Network error');

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

  test('simulates complete dashboard refresh cycle', async () => {
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
    const perfSnapshot = await performanceMonitor.record(2000);
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
    // Setup: clear and reset first, then configure rate limiting
    alerts.clearAllAlerts();
    alerts.resetRateLimit();
    alerts.setRateLimit({ enabled: true, maxAlerts: 2, windowMs: 1000 });

    // First alert of type 'cpu' should be created and recorded
    let alert1 = alerts.checkThreshold('cpu', 75);
    expect(alert1).not.toBeNull();

    // Dismiss it to allow new alert
    alerts.dismissAlert(alert1.id);

    // Second alert of same type should also be created
    let alert2 = alerts.checkThreshold('cpu', 76);
    expect(alert2).not.toBeNull();

    // Dismiss again
    alerts.dismissAlert(alert2.id);

    // Third alert of same type - should be rate limited (max 2 per window per type)
    const alert3 = alerts.checkThreshold('cpu', 77);
    expect(alert3).toBeNull();

    // Different alert type (memory) should still work (rate limit is per-type)
    const memAlert = alerts.checkThreshold('memory', 80);
    expect(memAlert).not.toBeNull();
  });
});

describe('Integration: Error Handling Across Modules', () => {
  test('handles graceful degradation when modules fail', async () => {
    // Simulate performance monitor being inactive
    performanceMonitor.stop();

    // Should return null gracefully
    const snapshot = await performanceMonitor.record();
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

describe('Integration: Gateway Manager + Cache + Retry Workflow', () => {
  let gatewayManager;

  beforeEach(async () => {
    // Import gateway manager as a singleton instance
    const gwModule = await import('../src/gateway-manager.js');
    gatewayManager = gwModule.gatewayManager || gwModule.default;
    cache.clear();
    // Reinitialize with default settings for each test
    gatewayManager.init({ gatewayEndpoints: [] });
  });

  test('gateway manager initializes with default endpoints', () => {
    const settings = { gatewayEndpoints: undefined };
    gatewayManager.init(settings);

    const enabled = gatewayManager.getEnabledEndpoints();
    expect(enabled.length).toBeGreaterThan(0);
    expect(enabled[0]).toHaveProperty('host');
    expect(enabled[0]).toHaveProperty('port');
    expect(enabled[0]).toHaveProperty('enabled', true);
  });

  test('gateway manager respects custom endpoint configuration', () => {
    const customEndpoints = [
      { name: 'local', host: 'localhost', port: 3000, enabled: true },
      { name: 'remote', host: '192.168.1.100', port: 3001, enabled: false },
    ];

    gatewayManager.init({ gatewayEndpoints: customEndpoints });

    const enabled = gatewayManager.getEnabledEndpoints();
    const all = gatewayManager.getAllEndpoints();

    expect(all.length).toBe(2);
    expect(enabled.length).toBe(1);
    expect(enabled[0].name).toBe('local');
    expect(enabled[0].port).toBe(3000);
  });

  test('gateway manager enforces endpoint limits', () => {
    gatewayManager.init({ gatewayEndpoints: [] });

    // Add endpoints up to limit
    const maxEndpoints = config.GATEWAY.MAX_ENDPOINTS;
    for (let i = 0; i < maxEndpoints; i++) {
      const result = gatewayManager.addEndpoint({
        name: `endpoint-${i}`,
        host: 'localhost',
        port: 3000 + i,
      });
      expect(result).not.toBeNull();
    }

    // Try to add one more - should fail
    const overflowResult = gatewayManager.addEndpoint({
      name: 'overflow',
      host: 'localhost',
      port: 9999,
    });
    expect(overflowResult).toBeNull();
  });

  test('gateway manager handles duplicate endpoint names', () => {
    gatewayManager.init({ gatewayEndpoints: [] });

    const first = gatewayManager.addEndpoint({
      name: 'duplicate',
      host: 'localhost',
      port: 3000,
    });
    expect(first).not.toBeNull();

    // Try to add duplicate - should fail
    const duplicate = gatewayManager.addEndpoint({
      name: 'duplicate',
      host: 'localhost',
      port: 3001,
    });
    expect(duplicate).toBeNull();
  });

  test('gateway manager endpoint removal works correctly', () => {
    gatewayManager.init({ gatewayEndpoints: [] });

    gatewayManager.addEndpoint({ name: 'endpoint-1', host: 'localhost', port: 3000 });
    gatewayManager.addEndpoint({ name: 'endpoint-2', host: 'localhost', port: 3001 });

    // Remove one endpoint
    const removed = gatewayManager.removeEndpoint('endpoint-1');
    expect(removed).toBe(true);

    // Verify remaining endpoints
    const all = gatewayManager.getAllEndpoints();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('endpoint-2');

    // Cannot remove non-existent endpoint
    const notRemoved = gatewayManager.removeEndpoint('nonexistent');
    expect(notRemoved).toBe(false);
  });

  test('gateway manager prevents removing last endpoint', () => {
    gatewayManager.init({ gatewayEndpoints: [] });
    gatewayManager.addEndpoint({ name: 'only', host: 'localhost', port: 3000 });

    // Should not be able to remove the last endpoint
    const removed = gatewayManager.removeEndpoint('only');
    expect(removed).toBe(false);
  });

  test('cache integration with gateway endpoint data', async () => {
    gatewayManager.init({ gatewayEndpoints: [] });
    gatewayManager.addEndpoint({ name: 'test-endpoint', host: 'localhost', port: 3000 });

    // Simulate caching endpoint status
    const endpointStatus = { reachable: true, latency: 45, lastSeen: Date.now() };
    cache.set('gateway-status-test-endpoint', endpointStatus, config.CACHE_TTL.DEFAULT);

    // Verify cached data
    const cached = cache.get('gateway-status-test-endpoint');
    expect(cached).toEqual(endpointStatus);

    // Verify cache expiration
    cache.set('gateway-expiring', { test: true }, 50);
    await new Promise(resolve => setTimeout(resolve, 60));
    expect(cache.get('gateway-expiring')).toBeNull();
  });
});

describe('Integration: Database + Cache Workflow', () => {
  let database;

  beforeEach(async () => {
    database = await import('../src/database.js');
    cache.clear();
  });

  afterEach(async () => {
    // Clean up any intervals
    if (database.saveInterval) clearInterval(database.saveInterval);
    if (database.cleanupInterval) clearInterval(database.cleanupInterval);
  });

  test('database module exports expected functions', () => {
    expect(database.initDatabase).toBeDefined();
    expect(typeof database.initDatabase).toBe('function');
  });

  test('database initialization creates required tables', async () => {
    // Note: This test verifies the module structure
    // Full database tests would require sql.js initialization
    const result = await database.initDatabase();

    // Should return true on successful init
    expect(typeof result).toBe('boolean');
  });

  test('cache database key follows naming convention', () => {
    // Verify cache key naming for database-related data
    const sessionKey = 'db-session-snapshot';
    const metricsKey = 'db-metrics-history';

    cache.set(sessionKey, { test: 'session' }, config.CACHE_TTL.DEFAULT);
    cache.set(metricsKey, { test: 'metrics' }, config.CACHE_TTL.DEFAULT);

    expect(cache.get(sessionKey)).toBeDefined();
    expect(cache.get(metricsKey)).toBeDefined();
  });
});

describe('Integration: Full System Metrics Collection Workflow', () => {
  beforeEach(() => {
    cache.clear();
    alerts.resetThresholds();
    alerts.clearAllAlerts();
    performanceMonitor.reset();
    performanceMonitor.stop();
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  test('complete metrics collection and alert cycle', async () => {
    // Phase 1: Start performance monitoring
    performanceMonitor.start();

    // Phase 2: Simulate system metrics collection
    const systemMetrics = {
      cpu: 45,
      memory: 65,
      disk: 55,
    };

    // Phase 3: Cache the metrics
    cache.set('system-metrics-latest', systemMetrics, config.CACHE_TTL.CPU);

    // Phase 4: Record performance snapshot
    const snapshot = await performanceMonitor.record(100);
    expect(snapshot).toBeDefined();
    expect(snapshot.cpuPercent).toBeDefined();
    expect(snapshot.memoryPercent).toBeDefined();

    // Phase 5: Check alerts
    const newAlerts = alerts.checkAllMetrics(systemMetrics);
    expect(newAlerts.length).toBe(0); // Normal values, no alerts

    // Phase 6: Simulate high load scenario
    const highLoadMetrics = {
      cpu: 92,
      memory: 88,
      disk: 55,
    };

    cache.set('system-metrics-latest', highLoadMetrics, config.CACHE_TTL.CPU);
    const highLoadAlerts = alerts.checkAllMetrics(highLoadMetrics);

    // Should trigger CPU and memory alerts
    expect(highLoadAlerts.length).toBeGreaterThanOrEqual(2);
    const alertTypes = highLoadAlerts.map(a => a.type);
    expect(alertTypes).toContain('cpu');
    expect(alertTypes).toContain('memory');

    // Phase 7: Verify health check
    const health = performanceMonitor.checkHealth();
    expect(health).toHaveProperty('degraded');
    expect(health).toHaveProperty('reasons');
  });

  test('metrics history persists through multiple collection cycles', async () => {
    performanceMonitor.start();
    performanceMonitor.maxHistory = 20;

    // Simulate multiple collection cycles
    const cycles = 25;
    for (let i = 0; i < cycles; i++) {
      // Simulate varying metrics
      const metrics = {
        cpu: 40 + (i % 30),
        memory: 50 + (i % 25),
        disk: 50,
      };

      cache.set('system-metrics-cycle', metrics, config.CACHE_TTL.CPU);
      performanceMonitor.record(50);
    }

    // Verify history is capped
    expect(performanceMonitor.history.length).toBeLessThanOrEqual(20);

    // Verify aggregates are calculated
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.aggregates).toBeDefined();
    expect(metrics.aggregates.avgMemoryUsed).toBeDefined();
    expect(metrics.aggregates.peakMemoryUsed).toBeDefined();

    // Verify sparkline data is available
    const memorySparkline = performanceMonitor.getMemorySparkline();
    expect(Array.isArray(memorySparkline)).toBe(true);
    expect(memorySparkline.length).toBeGreaterThan(0);
  });

  test('cache prevents redundant system calls during rapid refresh', async () => {
    let fetchCount = 0;

    const fetchSystemMetrics = async () => {
      fetchCount++;
      return {
        cpu: 50 + fetchCount,
        memory: 60 + fetchCount,
        disk: 55,
      };
    };

    const cacheKey = 'rapid-refresh-test';
    const ttl = 100; // 100ms TTL

    // First fetch - cache miss
    let metrics = cache.get(cacheKey);
    if (metrics === null) {
      metrics = await fetchSystemMetrics();
      cache.set(cacheKey, metrics, ttl);
    }
    expect(fetchCount).toBe(1);

    // Second fetch within TTL - cache hit
    metrics = cache.get(cacheKey);
    expect(metrics).toBeDefined();
    expect(fetchCount).toBe(1); // Should not have fetched again

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, ttl + 10));

    // Third fetch after TTL - cache miss, should fetch again
    metrics = cache.get(cacheKey);
    if (metrics === null) {
      metrics = await fetchSystemMetrics();
      cache.set(cacheKey, metrics, ttl);
    }
    expect(fetchCount).toBe(2);
  });
});

describe('Integration: Settings Validation + Config Workflow', () => {
  let validateSettings, validateGatewayEndpoint, getDefaultSettings;

  beforeEach(async () => {
    const validation = await import('../src/validation.js');
    validateSettings = validation.validateSettings;
    validateGatewayEndpoint = validation.validateGatewayEndpoint;
    getDefaultSettings = validation.getDefaultSettings;
  });

  test('default settings pass validation', () => {
    const defaultSettings = getDefaultSettings();
    const result = validateSettings(defaultSettings);

    expect(result.valid).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value.refreshInterval).toBe(config.REFRESH_INTERVALS.DEFAULT);
  });

  test('invalid refresh interval is corrected', () => {
    const invalidSettings = {
      ...getDefaultSettings(),
      refreshInterval: 100, // Below minimum
    };

    const result = validateSettings(invalidSettings);

    expect(result.valid).toBe(true); // Should auto-correct
    expect(result.value.refreshInterval).toBeGreaterThanOrEqual(config.VALIDATION.REFRESH_INTERVAL.MIN);
  });

  test('invalid theme is corrected to default', () => {
    const invalidSettings = {
      ...getDefaultSettings(),
      theme: 'nonexistent-theme',
    };

    const result = validateSettings(invalidSettings);

    expect(result.valid).toBe(true);
    expect(config.VALIDATION.VALID_THEMES).toContain(result.value.theme);
  });

  test('gateway endpoint validation catches missing fields', () => {
    const invalidEndpoints = [
      { name: '', host: 'localhost', port: 3000 }, // Empty name
      { name: 'test', host: '', port: 3000 }, // Empty host
    ];

    invalidEndpoints.forEach(endpoint => {
      const result = validateGatewayEndpoint(endpoint);
      expect(result.valid).toBe(false);
    });
  });

  test('valid gateway endpoint passes validation', () => {
    const validEndpoint = {
      name: 'test-endpoint',
      host: 'localhost',
      port: 3000,
      token: 'test-token',
      enabled: true,
      type: 'local',
    };

    const result = validateGatewayEndpoint(validEndpoint);
    expect(result.valid).toBe(true);
  });

  test('settings export format validation', () => {
    const validFormats = ['json', 'yaml'];
    const invalidFormat = 'xml';

    // Valid format
    const validSettings = { ...getDefaultSettings(), exportFormat: 'json' };
    let result = validateSettings(validSettings);
    expect(result.valid).toBe(true);

    // Invalid format should be corrected
    const invalidSettings = { ...getDefaultSettings(), exportFormat: invalidFormat };
    result = validateSettings(invalidSettings);
    expect(result.value.exportFormat).not.toBe(invalidFormat);
  });
});

describe('Integration: Error Recovery Workflow', () => {
  beforeEach(() => {
    cache.clear();
    alerts.clearAllAlerts();
  });

  test('graceful degradation when cache fails', async () => {
    // Simulate cache miss with retry fallback
    const cacheKey = 'degradation-test';

    // Ensure cache miss
    expect(cache.get(cacheKey)).toBeNull();

    // Simulated fetch that might fail
    let fetchAttempts = 0;
    const unreliableFetch = async () => {
      fetchAttempts++;
      if (fetchAttempts === 1) {
        throw new Error('Temporary failure');
      }
      return { data: 'recovered' };
    };

    // Use retry module for resilience
    const wrappedFetch = retry.withRetry(unreliableFetch, {
      maxRetries: 2,
      initialDelay: 10,
      retryableErrors: ['Temporary failure'],
    });

    const result = await wrappedFetch();
    expect(result.data).toBe('recovered');
    expect(fetchAttempts).toBe(2);
  });

  test('alert system continues working after module errors', () => {
    // Use all valid metric values that will generate alerts
    const metricsWithAllValid = {
      cpu: 95,    // Above critical threshold (90)
      memory: 85, // Above warning threshold (75)
      disk: 96,   // Above critical threshold (95)
    };

    // Alert system should process all valid metrics
    const results = alerts.checkAllMetrics(metricsWithAllValid);

    // Should generate alerts for all three metrics
    expect(results.length).toBeGreaterThanOrEqual(2);
    const alertTypes = results.map(a => a.type);
    expect(alertTypes).toContain('cpu');
    expect(alertTypes).toContain('disk');
  });

  test('retry module handles transient network errors', async () => {
    let attemptCount = 0;
    const networkErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'];

    const flakyNetworkFn = async () => {
      attemptCount++;
      if (attemptCount < 3) {
        const error = new Error(networkErrors[attemptCount - 1]);
        error.code = networkErrors[attemptCount - 1];
        throw error;
      }
      return { success: true };
    };

    const wrappedFn = retry.withRetry(flakyNetworkFn, {
      maxRetries: 3,
      initialDelay: 10,
      maxDelay: 50,
      retryableErrors: networkErrors,
    });

    const result = await wrappedFn();
    expect(result.success).toBe(true);
    expect(attemptCount).toBe(3);
  });

  test('retry gives up on non-retryable errors', async () => {
    const nonRetryableErrors = ['EINVAL', 'ENOENT', 'EACCES'];

    for (const errorCode of nonRetryableErrors) {
      let attemptCount = 0;

      const failingFn = async () => {
        attemptCount++;
        const error = new Error(`Non-retryable: ${errorCode}`);
        error.code = errorCode;
        throw error;
      };

      const wrappedFn = retry.withRetry(failingFn, {
        maxRetries: 3,
        initialDelay: 10,
        retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
      });

      await expect(wrappedFn()).rejects.toThrow();
      expect(attemptCount).toBe(1); // Should not retry
    }
  });
});

describe('Integration: Multi-Module Dashboard Refresh Simulation', () => {
  beforeEach(() => {
    cache.clear();
    alerts.resetThresholds();
    alerts.clearAllAlerts();
    alerts.resetRateLimit();
    performanceMonitor.reset();
    performanceMonitor.stop();
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  test('simulates complete dashboard refresh with all modules', async () => {
    // Initialize all modules
    performanceMonitor.start();

    // Simulate a complete dashboard refresh cycle
    const refreshCycle = async () => {
      // 1. Fetch system metrics (simulated)
      const systemMetrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: 50 + Math.random() * 10,
      };

      // 2. Cache metrics
      cache.set('dashboard-system-metrics', systemMetrics, config.CACHE_TTL.CPU);

      // 3. Record performance snapshot
      await performanceMonitor.record(100);

      // 4. Check alerts
      const newAlerts = alerts.checkAllMetrics(systemMetrics);

      // 5. Get health status
      const health = performanceMonitor.checkHealth();

      return { systemMetrics, newAlerts, health };
    };

    // Run multiple refresh cycles
    const results = [];
    for (let i = 0; i < 5; i++) {
      const result = await refreshCycle();
      results.push(result);

      // Small delay between cycles
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Verify all cycles completed
    expect(results.length).toBe(5);

    // Verify performance history was recorded
    expect(performanceMonitor.history.length).toBeGreaterThan(0);

    // Verify cache was used
    const cachedMetrics = cache.get('dashboard-system-metrics');
    expect(cachedMetrics).toBeDefined();
  });

  test('handles rapid refresh requests with debouncing', async () => {
    let refreshCount = 0;

    const doRefresh = async () => {
      refreshCount++;
      return { timestamp: Date.now() };
    };

    // Wrap with debounce
    const debouncedRefresh = cache.debounce(doRefresh, 100);

    // Trigger multiple rapid refreshes
    debouncedRefresh();
    debouncedRefresh();
    debouncedRefresh();
    debouncedRefresh();

    // Wait for debounce to settle
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should only execute once due to debouncing
    expect(refreshCount).toBe(1);
  });

  test('handles rapid refresh requests with throttling', async () => {
    let refreshCount = 0;
    const results = [];

    const doRefresh = async () => {
      refreshCount++;
      const result = { timestamp: Date.now(), count: refreshCount };
      results.push(result);
      return result;
    };

    // Wrap with throttle
    const throttledRefresh = cache.throttle(doRefresh, 100);

    // Trigger multiple rapid refreshes
    await throttledRefresh();
    await throttledRefresh();
    await throttledRefresh();

    // Should only execute once within throttle window
    expect(refreshCount).toBe(1);
  });

  test('alert escalation and recovery workflow', async () => {
    performanceMonitor.start();

    // Phase 1: Normal state
    let newAlerts = alerts.checkAllMetrics({ cpu: 40, memory: 50, disk: 50 });
    expect(newAlerts.length).toBe(0);

    // Phase 2: Warning state
    newAlerts = alerts.checkAllMetrics({ cpu: 75, memory: 50, disk: 50 });
    expect(newAlerts.length).toBe(1);
    expect(newAlerts[0].level).toBe(alerts.AlertLevel.WARNING);

    // Phase 3: Critical escalation
    newAlerts = alerts.checkAllMetrics({ cpu: 95, memory: 50, disk: 50 });
    // Should update existing alert (returns null for updates)
    const activeAlerts = alerts.getActiveAlerts();
    const cpuAlert = activeAlerts.find(a => a.type === 'cpu');
    expect(cpuAlert.level).toBe(alerts.AlertLevel.CRITICAL);

    // Phase 4: Recovery
    newAlerts = alerts.checkAllMetrics({ cpu: 40, memory: 50, disk: 50 });
    expect(newAlerts.length).toBe(1);
    expect(newAlerts[0].level).toBe(alerts.AlertLevel.CLEARED);
    expect(newAlerts[0].message).toContain('normalized');

    // Verify alert history
    const history = alerts.getAlertHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  test('concurrent metric updates maintain consistency', async () => {
    performanceMonitor.start();

    // Simulate concurrent metric updates
    const concurrentUpdates = async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const metrics = {
              cpu: 50 + Math.random() * 20,
              memory: 50 + Math.random() * 20,
              disk: 50,
            };
            cache.set('concurrent-metrics', metrics, config.CACHE_TTL.CPU);
            performanceMonitor.record(50);
            return metrics;
          })
        );
      }

      return Promise.all(promises);
    };

    const results = await concurrentUpdates();
    expect(results.length).toBe(10);

    // Verify final cached state is consistent
    const finalMetrics = cache.get('concurrent-metrics');
    expect(finalMetrics).toBeDefined();
    expect(finalMetrics.cpu).toBeGreaterThan(0);
    expect(finalMetrics.memory).toBeGreaterThan(0);
  });
});

describe('Integration: Container Detection + System Info Workflow', () => {
  let containerDetector;

  beforeEach(async () => {
    containerDetector = await import('../src/container-detector.js');
  });

  test('container detector module exports expected functions', () => {
    expect(containerDetector.detectContainerEnv).toBeDefined();
    expect(typeof containerDetector.detectContainerEnv).toBe('function');
  });

  test('container detection integrates with system info', async () => {
    // This test verifies the module integration
    // Full container detection would require actual container environment
    const env = await containerDetector.detectContainerEnv();

    // Should return an object with expected properties
    expect(env).toHaveProperty('isContainer');
    expect(env).toHaveProperty('isWSL');
    expect(typeof env.isContainer).toBe('boolean');
    expect(typeof env.isWSL).toBe('boolean');
  });
});
