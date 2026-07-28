/**
 * Tests for WorkerPool - task execution, timeout handling, worker recovery, error propagation
 */

import { jest } from '@jest/globals';
import { WorkerPool } from '../src/workers/worker-pool.js';
import workerPoolSingleton from '../src/workers/worker-pool.js';

// Mock systeminformation for fallback tests
const mockSiData = {
  currentLoad: { avgLoad: 1.5, currentLoad: 25 },
  mem: { total: 16000000000, used: 8000000000 },
  graphics: { controllers: [] },
  networkStats: [{ iface: 'eth0', rx_bytes: 1000 }],
  fsSize: [{ fs: '/', size: 1000000000 }],
  osInfo: { platform: 'darwin', hostname: 'test-host' },
  versions: { node: '18.0.0' },
  time: { uptime: 3600 },
};

jest.unstable_mockModule('systeminformation', () => ({
  default: {
    currentLoad: jest.fn().mockResolvedValue(mockSiData.currentLoad),
    mem: jest.fn().mockResolvedValue(mockSiData.mem),
    graphics: jest.fn().mockResolvedValue(mockSiData.graphics),
    networkStats: jest.fn().mockResolvedValue(mockSiData.networkStats),
    fsSize: jest.fn().mockResolvedValue(mockSiData.fsSize),
    osInfo: jest.fn().mockResolvedValue(mockSiData.osInfo),
    versions: jest.fn().mockResolvedValue(mockSiData.versions),
    time: jest.fn().mockResolvedValue(mockSiData.time),
  },
}));

// Mock logger
jest.unstable_mockModule('../src/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('WorkerPool', () => {
  let pool;

  afterEach(async () => {
    if (pool) {
      await pool.shutdown();
      pool = null;
    }
  });

  afterAll(async () => {
    // Shut down the module-level singleton to prevent worker leak warning
    await workerPoolSingleton.shutdown();
  });

  describe('constructor', () => {
    test('should create WorkerPool with default options from config', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Uses config.js defaults since we can't mock it effectively in ES modules
      expect(pool.taskTimeout).toBe(10000); // Default from worker-pool.js
      expect(pool.enableWorkers).toBe(false);
      expect(pool.workersSupported).toBe(true);
    });

    test('should create WorkerPool with custom options', async () => {
      pool = new WorkerPool({
        maxWorkers: 4,
        taskTimeout: 5000,
        enableWorkers: false,
      });

      expect(pool.maxWorkers).toBe(4);
      expect(pool.taskTimeout).toBe(5000);
      expect(pool.enableWorkers).toBe(false);
      expect(pool.workers.length).toBe(0);
    });

    test('should respect workersSupported flag when disabled', async () => {
      pool = new WorkerPool({ enableWorkers: false });
      expect(pool.workersSupported).toBe(true);
      expect(pool.workers.length).toBe(0);
    });
  });

  describe('task execution', () => {
    test('should execute task and return result via fallback', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('currentLoad');

      expect(result).toEqual(mockSiData.currentLoad);
    });

    test('should execute multiple commands', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result1 = await pool.execute('mem');
      const result2 = await pool.execute('fsSize');

      expect(result1).toEqual(mockSiData.mem);
      expect(result2).toEqual(mockSiData.fsSize);
    });
  });

  describe('fallback execution', () => {
    test('should use fallback when workers are disabled', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('currentLoad');

      expect(result).toEqual(mockSiData.currentLoad);
    });

    test('should use fallback when workers are not supported', async () => {
      pool = new WorkerPool({ enableWorkers: false });
      pool.workersSupported = false;

      const result = await pool.execute('mem');

      expect(result).toEqual(mockSiData.mem);
    });

    test('should fallback execute currentLoad command', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('currentLoad');
      expect(result).toEqual(mockSiData.currentLoad);
    });

    test('should fallback execute mem command', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('mem');
      expect(result).toEqual(mockSiData.mem);
    });

    test('should fallback execute graphics command', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('graphics');
      expect(result).toEqual(mockSiData.graphics);
    });

    test('should fallback execute networkStats command', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('networkStats');
      expect(result).toEqual(mockSiData.networkStats);
    });

    test('should fallback execute fsSize command', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('fsSize');
      expect(result).toEqual(mockSiData.fsSize);
    });

    test('should fallback execute systemData command', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('systemData');

      expect(result).toEqual({
        os: mockSiData.osInfo,
        ver: mockSiData.versions,
        time: mockSiData.time,
      });
    });

    test('should throw for unknown command in fallback', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      await expect(pool.execute('unknownCommand')).rejects.toThrow('Unknown command: unknownCommand');
    });

    test('should propagate fallback execution errors', async () => {
      const { default: systemInfo } = await import('systeminformation');
      pool = new WorkerPool({ enableWorkers: false });

      systemInfo.currentLoad.mockRejectedValueOnce(new Error('SI Error'));

      await expect(pool.execute('currentLoad')).rejects.toThrow('SI Error');
    });
  });

  describe('getStatus', () => {
    test('should return pool status with workers disabled', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const status = pool.getStatus();

      expect(status.enabled).toBe(false);
      expect(status.supported).toBe(true);
      expect(status.totalWorkers).toBe(0);
      expect(status.busyWorkers).toBe(0);
      expect(status.readyWorkers).toBe(0);
      expect(status.pendingTasks).toBe(0);
      expect(status.queuedTasks).toBe(0);
    });

    test('should count pending and queued tasks correctly', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Manually add some pending and queued tasks
      pool.pendingTasks.set(1, {
        id: 1,
        command: 'test',
        resolve: () => {},
        reject: () => {},
        timeout: null,
      });
      pool.taskQueue.push({ id: 2, command: 'test2' });

      const status = pool.getStatus();
      expect(status.pendingTasks).toBe(1);
      expect(status.queuedTasks).toBe(1);
    });
  });

  describe('shutdown', () => {
    test('should set shutdown flag', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      expect(pool.isShutdown).toBe(false);
      await pool.shutdown();

      expect(pool.isShutdown).toBe(true);
    });

    test('should reject pending tasks on shutdown', async () => {
      pool = new WorkerPool({ enableWorkers: false, taskTimeout: 10000 });

      // Add a pending task with proper reject function
      const rejectFn = jest.fn();
      pool.pendingTasks.set(1, {
        id: 1,
        command: 'test',
        resolve: () => {},
        reject: rejectFn,
        timeout: null,
      });

      await pool.shutdown();

      expect(rejectFn).toHaveBeenCalledWith(new Error('Worker pool shutting down'));
      expect(pool.pendingTasks.size).toBe(0);
    });

    test('should clear task queue on shutdown', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Add tasks to queue
      pool.taskQueue.push({ id: 1, command: 'test' });
      pool.taskQueue.push({ id: 2, command: 'test2' });

      await pool.shutdown();

      expect(pool.taskQueue.length).toBe(0);
    });

    test('should be safe to call shutdown multiple times', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      await pool.shutdown();
      await pool.shutdown(); // Should not throw

      expect(pool.isShutdown).toBe(true);
    });
  });

  describe('checkWorkerSupport', () => {
    test('should return true for Node.js 12+', () => {
      pool = new WorkerPool({ enableWorkers: false });
      expect(pool.checkWorkerSupport()).toBe(true);
    });
  });

  describe('task ID generation', () => {
    test('taskId starts at 0', () => {
      pool = new WorkerPool({ enableWorkers: false });
      expect(pool.taskId).toBe(0);
    });
  });

  describe('processQueue edge cases', () => {
    test('should handle empty queue', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Should not throw
      pool.processQueue();
      expect(pool.taskQueue.length).toBe(0);
    });

    test('should not process queue when workers are disabled', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Add task to queue
      pool.taskQueue.push({ id: 1, command: 'test', options: {} });

      // Try to process
      pool.processQueue();

      // Task should remain in queue since no workers
      expect(pool.taskQueue.length).toBe(1);
    });
  });

  describe('worker management', () => {
    test('should create and remove workers', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Mock worker for testing
      const mockWorker = { id: 99, terminate: jest.fn().mockResolvedValue(0) };
      pool.workers.push(mockWorker);

      expect(pool.workers.length).toBe(1);

      pool.removeWorker(99);

      expect(pool.workers.length).toBe(0);
    });

    test('should handle removing non-existent worker', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Should not throw
      pool.removeWorker(999);
      expect(pool.workers.length).toBe(0);
    });

    test('should restart worker', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      // Mock worker for testing
      const mockWorker = { id: 99, terminate: jest.fn().mockResolvedValue(0) };
      pool.workers.push(mockWorker);

      // Restart worker
      pool.restartWorker(99);

      // Should have called terminate
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });

  describe('error handling in fallbackExecute', () => {
    test('should propagate fallback execution errors', async () => {
      const { default: systemInfo } = await import('systeminformation');

      pool = new WorkerPool({ enableWorkers: false });

      systemInfo.currentLoad.mockRejectedValueOnce(new Error('Test error'));

      await expect(pool.execute('currentLoad')).rejects.toThrow('Test error');
    });
  });

  describe('handleWorkerMessage', () => {
    test('should handle ready signal', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const mockWorker = { id: 1, isReady: false, isBusy: false };

      pool.handleWorkerMessage(mockWorker, { type: 'ready' });

      expect(mockWorker.isReady).toBe(true);
    });

    test('should handle successful task completion', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const resolve = jest.fn();
      const reject = jest.fn();

      pool.pendingTasks.set(1, {
        id: 1,
        command: 'test',
        resolve,
        reject,
        timeout: null,
      });

      const mockWorker = { id: 1, isBusy: true };

      pool.handleWorkerMessage(mockWorker, {
        id: 1,
        success: true,
        data: { result: 'test-data' },
      });

      expect(resolve).toHaveBeenCalledWith({ result: 'test-data' });
      expect(mockWorker.isBusy).toBe(false);
      expect(pool.pendingTasks.has(1)).toBe(false);
    });

    test('should handle failed task completion', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const resolve = jest.fn();
      const reject = jest.fn();

      pool.pendingTasks.set(1, {
        id: 1,
        command: 'test',
        resolve,
        reject,
        timeout: null,
      });

      const mockWorker = { id: 1, isBusy: true };

      pool.handleWorkerMessage(mockWorker, {
        id: 1,
        success: false,
        error: 'Task failed',
        stack: 'Error: Task failed\n    at test',
      });

      expect(reject).toHaveBeenCalled();
      const errorArg = reject.mock.calls[0][0];
      expect(errorArg.message).toBe('Task failed');
      expect(errorArg.stack).toBe('Error: Task failed\n    at test');
      expect(mockWorker.isBusy).toBe(false);
    });

    test('should clear timeout on task completion', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const timeout = setTimeout(() => {}, 10000);
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const resolve = jest.fn();

      pool.pendingTasks.set(1, {
        id: 1,
        command: 'test',
        resolve,
        reject: jest.fn(),
        timeout,
      });

      const mockWorker = { id: 1, isBusy: true };

      pool.handleWorkerMessage(mockWorker, {
        id: 1,
        success: true,
        data: { result: 'test' },
      });

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeout);

      clearTimeoutSpy.mockRestore();
    });

    test('should ignore messages for unknown task IDs', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const mockWorker = { id: 1, isBusy: true };

      // Should not throw
      pool.handleWorkerMessage(mockWorker, {
        id: 999,
        success: true,
        data: { result: 'test' },
      });

      // Worker should remain busy since task wasn't found
      expect(mockWorker.isBusy).toBe(true);
    });

    test('should handle failed task with default error message', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const reject = jest.fn();

      pool.pendingTasks.set(1, {
        id: 1,
        command: 'test',
        resolve: jest.fn(),
        reject,
        timeout: null,
      });

      const mockWorker = { id: 1, isBusy: true };

      pool.handleWorkerMessage(mockWorker, {
        id: 1,
        success: false,
        // No error message provided
      });

      expect(reject).toHaveBeenCalled();
      const errorArg = reject.mock.calls[0][0];
      expect(errorArg.message).toBe('Worker task failed');
    });
  });

  describe('execute method', () => {
    test('should not set up timeout in fallback mode', async () => {
      pool = new WorkerPool({
        enableWorkers: false,
        taskTimeout: 5000,
      });

      // Mock setTimeout to verify it's not called in fallback mode
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      await pool.execute('currentLoad');

      // In fallback mode, setTimeout should not be called
      expect(setTimeoutSpy).not.toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
    });

    test('should use direct execution in fallback mode', async () => {
      pool = new WorkerPool({ enableWorkers: false });

      const result = await pool.execute('currentLoad');

      expect(result).toEqual(mockSiData.currentLoad);
    });
  });
});
