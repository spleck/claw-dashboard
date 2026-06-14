/**
 * Unit tests for database.js
 * (DB fully removed in lean trim; this is a minimal smoke test for stub load/exports only)
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

// Minimal smoke test: stub loads successfully (top-level import succeeds) and all
// expected functions are present with correct type. Does not invoke init or
// assume any DB state (prevents failures post-trim; addresses review issue 6).
describe('Database stub (post lean trim)', () => {
  test('stub module loads and exports all functions are present', () => {
    expect(typeof initDatabase).toBe('function');
    expect(typeof closeDatabase).toBe('function');
    expect(typeof storeSessionSnapshot).toBe('function');
    expect(typeof storeCpuMetrics).toBe('function');
    expect(typeof storeMemoryMetrics).toBe('function');
    expect(typeof storeNetworkMetrics).toBe('function');
    expect(typeof storeMetricsSnapshot).toBe('function');
    expect(typeof getSessionsLast24Hours).toBe('function');
    expect(typeof getSessionsLast7Days).toBe('function');
    expect(typeof getSessionsByHours).toBe('function');
    expect(typeof getSessionsByDays).toBe('function');
    expect(typeof getCpuMetricsHistory).toBe('function');
    expect(typeof getMemoryMetricsHistory).toBe('function');
    expect(typeof getNetworkMetricsHistory).toBe('function');
    expect(typeof getMetricsSummary).toBe('function');
    expect(typeof cleanupOldData).toBe('function');
  });

  test('initDatabase returns false (stub behavior)', async () => {
    const result = await initDatabase();
    expect(result).toBe(false);
  });

  test('getters return safe empty values without init', () => {
    expect(getSessionsLast24Hours()).toEqual([]);
    expect(getSessionsByHours()).toEqual([]);
    expect(getCpuMetricsHistory()).toEqual([]);
    expect(getMemoryMetricsHistory()).toEqual([]);
    expect(getNetworkMetricsHistory()).toEqual([]);
    expect(getMetricsSummary()).toBeNull();
  });

  test('stores and close are silent no-ops (no throw)', () => {
    expect(() => storeSessionSnapshot(null)).not.toThrow();
    expect(() => storeCpuMetrics(null)).not.toThrow();
    expect(() => storeMemoryMetrics(null)).not.toThrow();
    expect(() => storeNetworkMetrics(null)).not.toThrow();
    expect(() => storeMetricsSnapshot(null)).not.toThrow();
    expect(() => cleanupOldData()).not.toThrow();
    expect(() => closeDatabase()).not.toThrow();
  });
});
