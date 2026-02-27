/**
 * Worker Pool Manager for system information gathering
 * Manages worker thread lifecycle and provides a simple interface
 * for offloading heavy systeminformation calls
 */

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from '../logger.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Worker Pool Manager class
 * Manages a pool of worker threads for parallel system information gathering
 */
class WorkerPool {
  constructor(options = {}) {
    this.workerPath = options.workerPath || join(__dirname, 'system-worker.js');
    this.maxWorkers = options.maxWorkers || config.WORKERS?.MAX_WORKERS || 2;
    this.taskTimeout = options.taskTimeout || config.WORKERS?.TASK_TIMEOUT || 10000;
    this.enableWorkers = options.enableWorkers ?? config.WORKERS?.ENABLED ?? true;

    this.workers = [];
    this.taskQueue = [];
    this.taskId = 0;
    this.pendingTasks = new Map();
    this.isShutdown = false;

    // Check if worker threads are supported (Node.js 12+)
    this.workersSupported = this.checkWorkerSupport();

    if (this.enableWorkers && this.workersSupported) {
      this.initializeWorkers();
    }
  }

  /**
   * Check if worker threads are supported
   * @returns {boolean} True if worker threads are available
   */
  checkWorkerSupport() {
    try {
      // Worker threads are available in Node.js 12+
      const [major] = process.versions.node.split('.').map(Number);
      if (major < 12) {
        logger.info('Worker threads not available (Node.js < 12)');
        return false;
      }

      // Worker threads are available - we'll verify when creating workers
      // This is a preliminary check
      return true;
    } catch (error) {
      logger.info('Worker threads not supported in this environment:', error.message);
      return false;
    }
  }

  /**
   * Initialize worker threads
   */
  initializeWorkers() {
    try {
      for (let i = 0; i < this.maxWorkers; i++) {
        this.createWorker(i);
      }
      logger.info(`Initialized ${this.maxWorkers} system information worker threads`);
    } catch (error) {
      logger.error('Failed to initialize workers:', error.message);
      this.workersSupported = false;
      this.workers = [];
    }
  }

  /**
   * Create a new worker thread
   * @param {number} id - Worker ID
   * @returns {Worker} Created worker
   */
  createWorker(id) {
    const worker = new Worker(this.workerPath);

    worker.id = id;
    worker.isReady = false;
    worker.isBusy = false;

    worker.on('message', (message) => {
      this.handleWorkerMessage(worker, message);
    });

    worker.on('error', (error) => {
      logger.error(`Worker ${id} error:`, error.message);
      this.restartWorker(id);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        logger.warn(`Worker ${id} exited with code ${code}`);
      }
      this.removeWorker(id);
    });

    this.workers.push(worker);
    return worker;
  }

  /**
   * Handle messages from worker threads
   * @param {Worker} worker - Worker that sent the message
   * @param {Object} message - Message from worker
   */
  handleWorkerMessage(worker, message) {
    // Handle ready signal
    if (message.type === 'ready') {
      worker.isReady = true;
      this.processQueue();
      return;
    }

    // Handle task completion
    if (message.id !== undefined) {
      const task = this.pendingTasks.get(message.id);
      if (task) {
        this.pendingTasks.delete(message.id);
        worker.isBusy = false;

        if (task.timeout) {
          clearTimeout(task.timeout);
        }

        if (message.success) {
          task.resolve(message.data);
        } else {
          const error = new Error(message.error || 'Worker task failed');
          if (message.stack) {
            error.stack = message.stack;
          }
          task.reject(error);
        }

        this.processQueue();
      }
    }
  }

  /**
   * Restart a worker thread
   * @param {number} id - Worker ID to restart
   */
  restartWorker(id) {
    const existingWorker = this.workers.find(w => w.id === id);
    if (existingWorker) {
      existingWorker.terminate().catch(() => {});
    }

    // Create replacement worker
    setTimeout(() => {
      if (!this.isShutdown) {
        this.createWorker(id);
      }
    }, 100);
  }

  /**
   * Remove a worker from the pool
   * @param {number} id - Worker ID to remove
   */
  removeWorker(id) {
    const index = this.workers.findIndex(w => w.id === id);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }
  }

  /**
   * Execute a systeminformation command via worker thread
   * @param {string} command - Command to execute
   * @param {Object} options - Command options
   * @returns {Promise<any>} Command result
   */
  async execute(command, options = {}) {
    // Fall back to direct execution if workers aren't available
    if (!this.workersSupported || !this.enableWorkers || this.workers.length === 0) {
      return this.fallbackExecute(command, options);
    }

    return new Promise((resolve, reject) => {
      const id = ++this.taskId;

      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingTasks.delete(id);
        reject(new Error(`Worker task timeout: ${command}`));
      }, this.taskTimeout);

      // Store task
      this.pendingTasks.set(id, {
        id,
        command,
        options,
        resolve,
        reject,
        timeout,
        timestamp: Date.now(),
      });

      // Add to queue
      this.taskQueue.push({ id, command, options });
      this.processQueue();
    });
  }

  /**
   * Process the task queue
   */
  processQueue() {
    if (this.taskQueue.length === 0) return;

    // Find an available worker
    const availableWorker = this.workers.find(w => w.isReady && !w.isBusy);
    if (!availableWorker) return;

    // Get next task
    const task = this.taskQueue.shift();
    if (!task) return;

    // Mark worker as busy and send task
    availableWorker.isBusy = true;
    availableWorker.postMessage({
      id: task.id,
      command: task.command,
      options: task.options,
    });
  }

  /**
   * Fallback execution when workers aren't available
   * Executes directly in the main thread
   * @param {string} command - Command to execute
   * @param {Object} options - Command options
   * @returns {Promise<any>} Command result
   */
  async fallbackExecute(command, options = {}) {
    try {
      // Dynamically import systeminformation
      const si = await import('systeminformation');
      const systemInfo = si.default || si;

      switch (command) {
        case 'currentLoad':
          return await systemInfo.currentLoad();
        case 'mem':
          return await systemInfo.mem();
        case 'graphics':
          return await systemInfo.graphics();
        case 'networkStats':
          return await systemInfo.networkStats();
        case 'fsSize':
          return await systemInfo.fsSize();
        case 'systemData': {
          const [os, ver, time] = await Promise.all([
            systemInfo.osInfo(),
            systemInfo.versions(),
            systemInfo.time(),
          ]);
          return { os, ver, time };
        }
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      logger.warn(`Fallback execution failed for ${command}:`, error.message);
      throw error;
    }
  }

  /**
   * Get worker pool status
   * @returns {Object} Pool status
   */
  getStatus() {
    return {
      enabled: this.enableWorkers,
      supported: this.workersSupported,
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter(w => w.isBusy).length,
      readyWorkers: this.workers.filter(w => w.isReady).length,
      pendingTasks: this.pendingTasks.size,
      queuedTasks: this.taskQueue.length,
    };
  }

  /**
   * Shut down all workers
   */
  async shutdown() {
    this.isShutdown = true;

    // Reject pending tasks
    for (const [id, task] of this.pendingTasks) {
      if (task.timeout) {
        clearTimeout(task.timeout);
      }
      task.reject(new Error('Worker pool shutting down'));
    }
    this.pendingTasks.clear();
    this.taskQueue = [];

    // Terminate all workers
    const terminationPromises = this.workers.map(worker =>
      worker.terminate().catch(() => {})
    );

    await Promise.all(terminationPromises);
    this.workers = [];

    logger.info('Worker pool shut down');
  }
}

// Create singleton instance
const workerPool = new WorkerPool();

export default workerPool;
export { WorkerPool };
