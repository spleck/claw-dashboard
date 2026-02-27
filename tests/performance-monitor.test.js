/**
 * Tests for Performance Monitor module
 */

import { jest } from '@jest/globals';
import { PerformanceMonitor } from '../src/performance-monitor.js';

describe('PerformanceMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.stop();
  });

  describe('start/stop', () => {
    test('starts monitoring when start() is called', () => {
      expect(monitor.isTracking).toBe(false);
      monitor.start();
      expect(monitor.isTracking).toBe(true);
    });

    test('stops monitoring when stop() is called', () => {
      monitor.start();
      expect(monitor.isTracking).toBe(true);
      monitor.stop();
      expect(monitor.isTracking).toBe(false);
    });
  });

  describe('record', () => {
    test('returns null when not tracking', () => {
      const result = monitor.record();
      expect(result).toBeNull();
    });

    test('records metrics when tracking', () => {
      monitor.start();
      const result = monitor.record(2000);

      expect(result).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.refreshRate).toBe(2000);
      expect(typeof result.memoryUsed).toBe('number');
      expect(typeof result.memoryPercent).toBe('number');
      expect(typeof result.cpuPercent).toBe('number');
      expect(typeof result.uptime).toBe('number');
    });

    test('maintains history within max limit', () => {
      monitor.start();
      monitor.maxHistory = 5;

      for (let i = 0; i < 10; i++) {
        monitor.record(2000);
      }

      expect(monitor.history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getMetrics', () => {
    test('returns current metrics', () => {
      monitor.start();
      monitor.record(2000);

      const metrics = monitor.getMetrics();
      expect(metrics.current).toBeDefined();
      expect(metrics.history).toBeDefined();
      expect(metrics.aggregates).toBeDefined();
      expect(metrics.isTracking).toBe(true);
    });

    test('returns empty aggregates when no history', () => {
      const metrics = monitor.getMetrics();
      expect(metrics.aggregates.avgMemoryUsed).toBe(0);
      expect(metrics.aggregates.peakMemoryUsed).toBe(0);
    });
  });

  describe('getStatusString', () => {
    test('returns inactive message when no history', () => {
      const status = monitor.getStatusString();
      expect(status).toBe('Performance monitoring inactive');
    });

    test('returns formatted status when tracking', () => {
      monitor.start();
      monitor.record(2000);

      const status = monitor.getStatusString();
      expect(status).toContain('MEM:');
      expect(status).toContain('MB');
      expect(status).toContain('CPU:');
      expect(status).toContain('Refresh:');
    });

    test('includes detailed metrics when requested', () => {
      monitor.start();
      monitor.record(2000);

      const status = monitor.getStatusString(true);
      expect(status).toContain('MEM:');
    });
  });

  describe('getMemorySparkline', () => {
    test('returns data array', () => {
      monitor.start();
      monitor.record(2000);
      monitor.record(2000);

      const data = monitor.getMemorySparkline();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('returns array with zero when no history', () => {
      const data = monitor.getMemorySparkline();
      expect(data).toEqual([0]);
    });
  });

  describe('getCpuSparkline', () => {
    test('returns data array', () => {
      monitor.start();
      monitor.record(2000);

      const data = monitor.getCpuSparkline();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('checkHealth', () => {
    test('returns not degraded for normal metrics', () => {
      monitor.start();
      monitor.record(2000);

      const health = monitor.checkHealth();
      expect(health.degraded).toBe(false);
      expect(health.reasons).toEqual([]);
    });

    test('returns degraded for high memory usage', () => {
      monitor.start();
      // Mock high memory usage
      monitor.history.push({
        timestamp: Date.now(),
        memoryPercent: 90,
        cpuPercent: 10,
      });

      const health = monitor.checkHealth();
      expect(health.degraded).toBe(true);
      expect(health.reasons.length).toBeGreaterThan(0);
      expect(health.reasons[0]).toContain('memory');
    });

    test('returns degraded for high CPU usage', () => {
      monitor.start();
      monitor.history.push({
        timestamp: Date.now(),
        memoryPercent: 50,
        cpuPercent: 85,
      });

      const health = monitor.checkHealth();
      expect(health.degraded).toBe(true);
      expect(health.reasons.some(r => r.includes('CPU'))).toBe(true);
    });
  });

  describe('reset', () => {
    test('clears history and resets metrics', () => {
      monitor.start();
      monitor.record(2000);
      monitor.record(2000);

      expect(monitor.history.length).toBeGreaterThan(0);

      monitor.reset();

      expect(monitor.history.length).toBe(0);
      expect(monitor.metrics.avgMemoryUsed).toBe(0);
    });
  });
});
