/**
 * Unit tests for database.js
 * Tests history persistence and metrics storage
 */

import {
  initDatabase,
  closeDatabase,
  storeSessionSnapshot,
  storeCpuMetrics,
  storeMemoryMetrics,
  storeNetworkMetrics,
  storeMetricsSnapshot,
  getSessionsLast24Hours,
  getSessionsLast7Days,
  getSessionsByHours,
  getSessionsByDays,
  getCpuMetricsHistory,
  getMemoryMetricsHistory,
  getNetworkMetricsHistory,
  getMetricsSummary,
  cleanupOldData,
} from '../src/database.js';

describe('Database', () => {
  // Clean up after each test
  afterEach(async () => {
    await closeDatabase();
  });

  describe('initDatabase', () => {
    test('should initialize database successfully', async () => {
      const result = await initDatabase();
      expect(result).toBe(true);
    });

    test('should handle errors gracefully', async () => {
      // Second initialization should still work
      await initDatabase();
      const result = await initDatabase();
      expect(result).toBe(true);
    });
  });

  describe('storeSessionSnapshot', () => {
    test('should store session with all fields', async () => {
      await initDatabase();

      const session = {
        sessionId: 'test-session-1',
        key: 'agent:main:main',
        agent: 'test-agent',
        deliveryContext: { channel: 'test-channel' },
        model: 'gpt-4',
        totalTokens: 1500,
        status: 'running',
      };

      // Should not throw
      expect(() => storeSessionSnapshot(session)).not.toThrow();
    });

    test('should handle null session gracefully', () => {
      // Should not throw even without database
      expect(() => storeSessionSnapshot(null)).not.toThrow();
    });

    test('should handle session with minimal fields', async () => {
      await initDatabase();

      const session = {
        sessionId: 'minimal-session',
        key: 'agent:test',
      };

      expect(() => storeSessionSnapshot(session)).not.toThrow();
    });

    test('should extract agent from session key', async () => {
      await initDatabase();

      const session = {
        key: 'agent:my-agent:instance',
        sessionId: 'test',
      };

      expect(() => storeSessionSnapshot(session)).not.toThrow();
    });

    test('should handle alternative field names', async () => {
      await initDatabase();

      const session = {
        key: 'test-key',
        llmModel: 'claude',
        tokens: 500,
        systemRunning: true,
      };

      expect(() => storeSessionSnapshot(session)).not.toThrow();
    });
  });

  describe('storeCpuMetrics', () => {
    test('should store CPU metrics', async () => {
      await initDatabase();

      const cpuData = {
        cpus: [
          {
            load: 50,
            loadAvg1: 0.5,
            loadAvg5: 0.6,
            loadAvg15: 0.7,
            cpuUsageUser: 20,
            cpuUsageSystem: 10,
            cpuUsageIdle: 70,
          },
        ],
      };

      expect(() => storeCpuMetrics(cpuData)).not.toThrow();
    });

    test('should handle null data', () => {
      // Should not throw
      expect(() => storeCpuMetrics(null)).not.toThrow();
    });

    test('should handle empty data', () => {
      // Should not throw
      expect(() => storeCpuMetrics({})).not.toThrow();
    });

    test('should handle object format (non-array)', async () => {
      await initDatabase();

      const cpuData = {
        loadAvg1: 1.0,
        loadAvg5: 2.0,
        loadAvg15: 3.0,
        cpuUsageUser: 25,
        cpuUsageSystem: 15,
        cpuUsageIdle: 60,
      };

      expect(() => storeCpuMetrics(cpuData)).not.toThrow();
    });

    test('should handle alternative field names', async () => {
      await initDatabase();

      const cpuData = {
        cpu_count: 8,
        load_avg_1: 1.5,
        loadavg: [1.0, 2.0, 3.0],
        cpuUsage: [20, 10, 70, 0, 0, 0],
      };

      expect(() => storeCpuMetrics(cpuData)).not.toThrow();
    });
  });

  describe('storeMemoryMetrics', () => {
    test('should store memory metrics', async () => {
      await initDatabase();

      const memoryData = {
        totalBytes: 16000000000,
        usedBytes: 8000000000,
        freeBytes: 7000000000,
        availableBytes: 7500000000,
        usedPercent: 50,
        swapTotalBytes: 2000000000,
        swapUsedBytes: 500000000,
        swapFreeBytes: 1500000000,
        swapUsedPercent: 25,
      };

      expect(() => storeMemoryMetrics(memoryData)).not.toThrow();
    });

    test('should handle null data', () => {
      expect(() => storeMemoryMetrics(null)).not.toThrow();
    });

    test('should handle alternative field names', async () => {
      await initDatabase();

      const memoryData = {
        total_bytes: 16000000000,
        used_bytes: 8000000000,
        free_bytes: 7000000000,
        available_bytes: 7500000000,
        used_percent: 50,
      };

      expect(() => storeMemoryMetrics(memoryData)).not.toThrow();
    });
  });

  describe('storeNetworkMetrics', () => {
    test('should store network metrics', async () => {
      await initDatabase();

      const networkData = {
        interfaceName: 'eth0',
        rxBytes: 1000000,
        txBytes: 500000,
        rxSec: 1000,
        txSec: 500,
      };

      expect(() => storeNetworkMetrics(networkData)).not.toThrow();
    });

    test('should handle array of interfaces', async () => {
      await initDatabase();

      const interfaces = [
        { interfaceName: 'eth0', rxBytes: 100 },
        { interfaceName: 'eth1', rxBytes: 200 },
      ];

      expect(() => storeNetworkMetrics(interfaces)).not.toThrow();
    });

    test('should handle null data', () => {
      expect(() => storeNetworkMetrics(null)).not.toThrow();
    });

    test('should handle alternative field names', async () => {
      await initDatabase();

      const networkData = {
        interface_name: 'wlan0',
        rx_bytes: 1000000,
        tx_bytes: 500000,
        rx_sec: 1000,
        tx_sec: 500,
      };

      expect(() => storeNetworkMetrics(networkData)).not.toThrow();
    });
  });

  describe('storeMetricsSnapshot', () => {
    test('should store all metrics from data object', async () => {
      await initDatabase();

      const data = {
        cpu: { cpus: [{ load: 50 }] },
        memory: { totalBytes: 16000000000, usedBytes: 8000000000 },
        network: { interfaceName: 'eth0', rxBytes: 100 },
        sessions: [
          { sessionId: 's1', tokens: 100 },
          { sessionId: 's2', tokens: 200 },
        ],
      };

      expect(() => storeMetricsSnapshot(data)).not.toThrow();
    });

    test('should handle empty data', () => {
      expect(() => storeMetricsSnapshot({})).not.toThrow();
    });

    test('should handle null data', () => {
      expect(() => storeMetricsSnapshot(null)).not.toThrow();
    });

    test('should handle partial data', async () => {
      await initDatabase();

      // Only CPU data
      expect(() => storeMetricsSnapshot({ cpu: { cpus: [] } })).not.toThrow();

      // Only memory data
      expect(() => storeMetricsSnapshot({ memory: {} })).not.toThrow();

      // Only network data
      expect(() => storeMetricsSnapshot({ network: {} })).not.toThrow();

      // Only sessions
      expect(() => storeMetricsSnapshot({ sessions: [] })).not.toThrow();
    });
  });

  describe('getSessionsLast24Hours', () => {
    test('should return array even when not initialized', () => {
      const sessions = getSessionsLast24Hours();
      expect(Array.isArray(sessions)).toBe(true);
    });

    test('should return array when initialized', async () => {
      await initDatabase();
      const sessions = getSessionsLast24Hours();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('getSessionsByHours', () => {
    test('should return array even when not initialized', () => {
      const sessions = getSessionsByHours(12);
      expect(Array.isArray(sessions)).toBe(true);
    });

    test('should return array when initialized', async () => {
      await initDatabase();
      const sessions = getSessionsByHours(12);
      expect(Array.isArray(sessions)).toBe(true);
    });

    test('should handle default hours parameter', async () => {
      await initDatabase();
      const sessions = getSessionsByHours();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('getSessionsByDays', () => {
    test('should return array', async () => {
      await initDatabase();
      const sessions = getSessionsByDays(7);
      expect(Array.isArray(sessions)).toBe(true);
    });

    test('should handle default days parameter', async () => {
      await initDatabase();
      const sessions = getSessionsByDays();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('getCpuMetricsHistory', () => {
    test('should return empty array when not initialized', () => {
      const metrics = getCpuMetricsHistory(24);
      expect(metrics).toEqual([]);
    });

    test('should return array when initialized', async () => {
      await initDatabase();
      const metrics = getCpuMetricsHistory(24);
      expect(Array.isArray(metrics)).toBe(true);
    });

    test('should handle default hours parameter', async () => {
      await initDatabase();
      const metrics = getCpuMetricsHistory();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('getMemoryMetricsHistory', () => {
    test('should return empty array when not initialized', () => {
      const metrics = getMemoryMetricsHistory(24);
      expect(metrics).toEqual([]);
    });

    test('should return array when initialized', async () => {
      await initDatabase();
      const metrics = getMemoryMetricsHistory(24);
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('getNetworkMetricsHistory', () => {
    test('should return empty array when not initialized', () => {
      const metrics = getNetworkMetricsHistory(24);
      expect(metrics).toEqual([]);
    });

    test('should return array when initialized', async () => {
      await initDatabase();
      const metrics = getNetworkMetricsHistory(24);
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('getMetricsSummary', () => {
    test('should return null when not initialized', () => {
      const summary = getMetricsSummary(24);
      expect(summary).toBeNull();
    });

    test('should return summary when initialized', async () => {
      await initDatabase();
      const summary = getMetricsSummary(24);
      expect(summary).toHaveProperty('cpu');
      expect(summary).toHaveProperty('memory');
      expect(summary).toHaveProperty('sessions');
      expect(summary).toHaveProperty('tokens');
    });

    test('should handle default hours parameter', async () => {
      await initDatabase();
      const summary = getMetricsSummary();
      expect(summary).toHaveProperty('cpu');
      expect(summary).toHaveProperty('memory');
    });
  });

  describe('cleanupOldData', () => {
    test('should run without errors when initialized', async () => {
      await initDatabase();
      // Should not throw
      expect(() => cleanupOldData(30)).not.toThrow();
    });

    test('should run without errors when not initialized', () => {
      // Should not throw
      expect(() => cleanupOldData(30)).not.toThrow();
    });

    test('should handle default days parameter', async () => {
      await initDatabase();
      expect(() => cleanupOldData()).not.toThrow();
    });
  });

  describe('closeDatabase', () => {
    test('should close database gracefully', async () => {
      await initDatabase();
      expect(() => closeDatabase()).not.toThrow();
    });

    test('should handle closing when not initialized', async () => {
      expect(() => closeDatabase()).not.toThrow();
    });

    test('should allow re-initialization after close', async () => {
      await initDatabase();
      await closeDatabase();
      const result = await initDatabase();
      expect(result).toBe(true);
    });
  });
});
