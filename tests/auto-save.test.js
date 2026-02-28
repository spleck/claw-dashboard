/**
 * Tests for auto-save module
 * Dashboard state persistence and auto-save functionality
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the modules to test - using dynamic import to handle ESM mocks
let autoSaveModule;

describe('auto-save', () => {
  let tempDir;
  let statePath;

  beforeAll(async () => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'autosave-test-'));
    statePath = path.join(tempDir, 'dashboard-state.json');

    // Import the module fresh for each test
    autoSaveModule = await import('../src/auto-save.js');
  });

  afterAll(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clean up any files in temp directory
    if (fs.existsSync(tempDir)) {
      fs.readdirSync(tempDir).forEach(f => {
        try {
          fs.unlinkSync(path.join(tempDir, f));
        } catch {
          // Ignore cleanup errors
        }
      });
    }
  });

  describe('AutoSaveManager', () => {
    test('should create instance with default options', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({});

      expect(manager.enabled).toBe(true);
      expect(manager.intervalMs).toBe(30000);
      expect(manager.isDirty).toBe(false);
      expect(manager.saveCount).toBe(0);
    });

    test('should create instance with custom options', () => {
      const { AutoSaveManager } = autoSaveModule;
      const getState = () => ({ test: 'state' });
      const getSettings = () => ({ test: 'settings' });
      const saveSettings = jest.fn();

      const manager = new AutoSaveManager({
        enabled: false,
        intervalMs: 5000,
        statePath: '/custom/path/state.json',
        getState,
        getSettings,
        saveSettings,
      });

      expect(manager.enabled).toBe(false);
      expect(manager.intervalMs).toBe(5000);
      expect(manager.statePath).toBe('/custom/path/state.json');
      expect(manager.getState).toBe(getState);
      expect(manager.getSettings).toBe(getSettings);
      expect(manager.saveSettings).toBe(saveSettings);
    });

    test('should start and stop timer', () => {
      jest.useFakeTimers();

      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        intervalMs: 1000,
      });

      expect(manager.timer).toBeNull();

      manager.start();
      expect(manager.timer).not.toBeNull();

      manager.stop();
      expect(manager.timer).toBeNull();

      jest.useRealTimers();
    });

    test('should not start when disabled', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        enabled: false,
        statePath,
      });

      manager.start();
      expect(manager.timer).toBeNull();
    });

    test('should mark dirty', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({ statePath });

      expect(manager.isDirty).toBe(false);
      manager.markDirty();
      expect(manager.isDirty).toBe(true);
    });

    test('should perform save and write file', async () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        getState: () => ({
          selectedSessionIndex: 1,
          paginationOffset: 2,
          sessionSearchQuery: 'query',
          isSearchMode: true,
          showFavoritesOnly: true,
          focusedWidgetIndex: 0,
          currentRefreshInterval: 5000,
        }),
        getSettings: () => ({ theme: 'dark' }),
      });

      // Trigger save
      const result = manager.saveNow();

      expect(result).toBe(true);
      expect(manager.saveCount).toBe(1);
      expect(fs.existsSync(statePath)).toBe(true);

      // Verify file content
      const savedData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      expect(savedData.settings).toEqual({ theme: 'dark' });
      expect(savedData.ui.selectedSessionIndex).toBe(1);
      expect(savedData.ui.sessionSearchQuery).toBe('query');
      expect(savedData.ui.isSearchMode).toBe(true);
    });

    test('should skip save if state unchanged', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        getState: () => ({ test: 'state' }),
        getSettings: () => ({ test: 'settings' }),
      });

      // First save
      manager.performAutoSave();
      expect(manager.saveCount).toBe(1);

      // Second save with same state should be skipped
      manager.performAutoSave();
      expect(manager.saveCount).toBe(1);
    });

    test('should save on state change', () => {
      let state = { version: 1 };
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        getState: () => state,
        getSettings: () => ({}),
      });

      // First save
      manager.performAutoSave();
      expect(manager.saveCount).toBe(1);

      // Change state and save again
      state = { version: 2 };
      manager.isDirty = true;
      manager.performAutoSave();
      expect(manager.saveCount).toBe(2);
    });

    test('should return false when disabled', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        enabled: false,
        statePath,
        getState: () => ({ test: 'state' }),
        getSettings: () => ({}),
      });

      const result = manager.performAutoSave();
      expect(result).toBe(false);
    });

    test('should return stats', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath: '/test/state.json',
        intervalMs: 5000,
      });

      const stats = manager.getStats();

      expect(stats.enabled).toBe(true);
      expect(stats.intervalMs).toBe(5000);
      expect(stats.saveCount).toBe(0);
      expect(stats.statePath).toBe('/test/state.json');
    });

    test('should update config', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        intervalMs: 1000,
      });

      manager.start();
      expect(manager.intervalMs).toBe(1000);

      manager.updateConfig({ intervalMs: 2000 });
      expect(manager.intervalMs).toBe(2000);

      manager.stop();
    });

    test('should save state file with correct structure', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        getState: () => ({
          selectedSessionIndex: 5,
          paginationOffset: 10,
          sessionSearchQuery: 'test',
          isSearchMode: true,
          showFavoritesOnly: false,
          focusedWidgetIndex: 2,
          currentRefreshInterval: 5000,
        }),
        getSettings: () => ({ theme: 'dark' }),
      });

      manager.performAutoSave();

      const savedData = JSON.parse(fs.readFileSync(statePath, 'utf8'));

      expect(savedData.timestamp).toBeDefined();
      expect(savedData.settings).toEqual({ theme: 'dark' });
      expect(savedData.ui.selectedSessionIndex).toBe(5);
      expect(savedData.ui.paginationOffset).toBe(10);
      expect(savedData.ui.sessionSearchQuery).toBe('test');
      expect(savedData.ui.isSearchMode).toBe(true);
    });

    test('should create backup before overwriting existing state', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        getState: () => ({ selectedSessionIndex: 0 }),
        getSettings: () => ({ theme: 'dark' }),
      });

      // First save - creates initial state
      manager.performAutoSave();
      expect(fs.existsSync(statePath)).toBe(true);

      // Second save - should create backup
      manager.getState = () => ({ selectedSessionIndex: 1 });
      manager.isDirty = true;
      manager.performAutoSave();

      // Check backup was created
      const dir = path.dirname(statePath);
      const backups = fs.readdirSync(dir).filter(f => f.includes('dashboard-state.json') && f.endsWith('.backup'));
      expect(backups.length).toBeGreaterThan(0);

      // Verify backup contains first save data
      const backupPath = path.join(dir, backups[0]);
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      expect(backupData.ui.selectedSessionIndex).toBe(0);
    });

    test('should not create backup when backupEnabled is false', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        backupEnabled: false,
        getState: () => ({ selectedSessionIndex: 0 }),
        getSettings: () => ({ theme: 'dark' }),
      });

      // First save
      manager.performAutoSave();

      // Second save - should not create backup
      manager.getState = () => ({ selectedSessionIndex: 1 });
      manager.isDirty = true;
      manager.performAutoSave();

      // Check no backups were created
      const dir = path.dirname(statePath);
      const backups = fs.readdirSync(dir).filter(f => f.endsWith('.backup'));
      expect(backups.length).toBe(0);
    });

    test('should clean up old backups keeping only backupCount', () => {
      // Use isolated temp directory for this test to avoid interference
      const isolatedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'autosave-backup-test-'));
      const isolatedStatePath = path.join(isolatedDir, 'dashboard-state.json');

      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath: isolatedStatePath,
        backupCount: 3,
        getState: () => ({ selectedSessionIndex: 0 }),
        getSettings: () => ({ theme: 'dark' }),
      });

      // Create multiple saves to generate backups
      // First save creates initial state (no backup)
      // Subsequent saves create backups (i=1..5 creates 5 backups, cleanup removes oldest 2, keeps 3)
      for (let i = 0; i < 6; i++) {
        manager.getState = () => ({ selectedSessionIndex: i });
        manager.isDirty = true;
        manager.performAutoSave();
      }

      // Check only 3 backups remain
      const backups = fs.readdirSync(isolatedDir)
        .filter(f => f.endsWith('.backup'));
      expect(backups.length).toBe(3);

      // Cleanup
      fs.rmSync(isolatedDir, { recursive: true, force: true });
    });

    test('should track statistics on saves', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        getState: () => ({ selectedSessionIndex: 5 }),
        getSettings: () => ({ theme: 'dark' }),
      });

      manager.performAutoSave();

      expect(manager.saveCount).toBe(1);
      expect(manager.stats.totalBytesWritten).toBeGreaterThan(0);
      expect(manager.stats.totalSaveTimeMs).toBeGreaterThanOrEqual(0);
      expect(manager.stats.averageSaveTimeMs).toBeGreaterThanOrEqual(0);
    });

    test('should return extended stats including backup info', () => {
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath: '/test/state.json',
        backupCount: 3,
        backupEnabled: true,
      });

      const stats = manager.getStats();

      expect(stats.backupEnabled).toBe(true);
      expect(stats.backupCount).toBe(3);
      expect(stats.totalBytesWritten).toBe(0);
      expect(stats.totalBackupsCreated).toBe(0);
      expect(stats.totalBackupsCleaned).toBe(0);
      expect(stats.lastBackupPath).toBeNull();
      expect(stats.averageSaveTimeMs).toBe(0);
      expect(stats.totalSaveTimeMs).toBe(0);
    });

    test('should log stats periodically', () => {
      jest.useFakeTimers();
      const { AutoSaveManager } = autoSaveModule;
      const manager = new AutoSaveManager({
        statePath,
        statsLogIntervalMs: 1000,
        getState: () => ({ selectedSessionIndex: 0 }),
        getSettings: () => ({ theme: 'dark' }),
      });

      // First save should log initial stats
      manager.performAutoSave();
      expect(manager.lastStatsLogTime).toBeGreaterThan(0);

      // Fast-forward time
      jest.advanceTimersByTime(500);

      // Second save should not log (interval not passed)
      const prevLogTime = manager.lastStatsLogTime;
      manager.isDirty = true;
      manager.performAutoSave();
      expect(manager.lastStatsLogTime).toBe(prevLogTime);

      // Fast-forward past interval
      jest.advanceTimersByTime(600);

      // Third save should log again
      manager.isDirty = true;
      manager.performAutoSave();
      expect(manager.lastStatsLogTime).toBeGreaterThan(prevLogTime);

      jest.useRealTimers();
    });
  });

  describe('loadDashboardState', () => {
    test('should load existing state file', () => {
      const { loadDashboardState } = autoSaveModule;
      const stateData = {
        timestamp: Date.now(),
        settings: { theme: 'dark' },
        ui: { selectedSessionIndex: 3 },
      };

      fs.writeFileSync(statePath, JSON.stringify(stateData, null, 2));

      const loaded = loadDashboardState(statePath);

      expect(loaded.settings.theme).toBe('dark');
      expect(loaded.ui.selectedSessionIndex).toBe(3);
    });

    test('should return null for non-existent file', () => {
      const { loadDashboardState } = autoSaveModule;
      const loaded = loadDashboardState(path.join(tempDir, 'nonexistent-state.json'));
      expect(loaded).toBeNull();
    });

    test('should return null for invalid JSON', () => {
      const { loadDashboardState } = autoSaveModule;
      const badStatePath = path.join(tempDir, 'bad-state.json');
      fs.writeFileSync(badStatePath, 'invalid json');
      const loaded = loadDashboardState(badStatePath);
      expect(loaded).toBeNull();
    });
  });

  describe('restoreDashboardState', () => {
    test('should restore UI state to dashboard', () => {
      const { restoreDashboardState } = autoSaveModule;
      const dashboard = {
        selectedSessionIndex: 0,
        paginationOffset: 0,
        sessionSearchQuery: '',
        isSearchMode: false,
        showFavoritesOnly: false,
        focusedWidgetIndex: -1,
        currentRefreshInterval: 2000,
      };

      const savedState = {
        ui: {
          selectedSessionIndex: 5,
          paginationOffset: 10,
          sessionSearchQuery: 'test query',
          isSearchMode: true,
          showFavoritesOnly: true,
          focusedWidgetIndex: 2,
          currentRefreshInterval: 5000,
        },
      };

      const result = restoreDashboardState(savedState, dashboard);

      expect(result).toBe(true);
      expect(dashboard.selectedSessionIndex).toBe(5);
      expect(dashboard.paginationOffset).toBe(10);
      expect(dashboard.sessionSearchQuery).toBe('test query');
      expect(dashboard.isSearchMode).toBe(true);
      expect(dashboard.showFavoritesOnly).toBe(true);
      expect(dashboard.focusedWidgetIndex).toBe(2);
      expect(dashboard.currentRefreshInterval).toBe(5000);
    });

    test('should return false for null savedState', () => {
      const { restoreDashboardState } = autoSaveModule;
      const dashboard = {};
      const result = restoreDashboardState(null, dashboard);
      expect(result).toBe(false);
    });

    test('should return false for missing ui data', () => {
      const { restoreDashboardState } = autoSaveModule;
      const dashboard = {};
      const result = restoreDashboardState({}, dashboard);
      expect(result).toBe(false);
    });
  });

  describe('cleanupOldStateFiles', () => {
    test('should clean up old state files', () => {
      const { cleanupOldStateFiles } = autoSaveModule;

      // Create test files
      for (let i = 0; i < 5; i++) {
        const filePath = path.join(tempDir, `dashboard-state-${i}.json`);
        fs.writeFileSync(filePath, '{}');
      }

      cleanupOldStateFiles(tempDir, 2);

      const files = fs.readdirSync(tempDir).filter(f => f.startsWith('dashboard-state'));
      expect(files.length).toBe(2);
    });

    test('should handle non-existent directory', () => {
      const { cleanupOldStateFiles } = autoSaveModule;
      // Should not throw
      expect(() => {
        cleanupOldStateFiles('/nonexistent/directory', 3);
      }).not.toThrow();
    });
  });
});
