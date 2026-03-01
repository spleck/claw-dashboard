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
import { WorkerPoolOverloadError } from '../errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Degradation levels
const DEGRADATION_LEVELS = {
  NONE: 'none',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// Circuit breaker states
const CIRCUIT_STATES = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open',
};

/**
 * Worker Pool Manager class
 * Manages a pool of worker threads for parallel system information gathering
 * with graceful degradation under overload conditions
 */
export const DegradationLevel = {
  NONE: 'none',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

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

    // Graceful degradation settings
    const degradationConfig = options.degradationConfig || config.WORKER_DEGRADATION || {};
    this.degradationConfig = {
      queue: degradationConfig.QUEUE || { WARNING_SIZE: 10, CRITICAL_SIZE: 25, MAX_SIZE: 50 },
      utilization: degradationConfig.UTILIZATION || { WARNING_PCT: 75, CRITICAL_PCT: 90 },
      strategies: degradationConfig.STRATEGIES || {
        ADAPTIVE_TIMEOUT: { ENABLED: true, WARNING_MULTIPLIER: 1.5, CRITICAL_MULTIPLIER: 2.0 },
        SHED_LOAD: { ENABLED: true, SHED_NON_CRITICAL: true },
        CIRCUIT_BREAKER: { ENABLED: true, FAILURE_THRESHOLD: 5, RESET_TIMEOUT_MS: 30000 },
      },
      recovery: degradationConfig.RECOVERY || { COOLDOWN_MS: 5000, MIN_NORMAL_OPERATIONS: 5 },
    };

    // Degradation state
    this.degradationLevel = DEGRADATION_LEVELS.NONE;
    this.degradationSince = null;
    this.consecutiveFailures = 0;
    this.circuitBreakerState = CIRCUIT_STATES.CLOSED;
    this.circuitBreakerOpenedAt = null;
    this.successfulOperations = 0;
    this.overloadEvents = 0;
    this.lastOverloadTime = null;
    this.totalRejected = 0;
    this.totalShed = 0;

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
    const worker = new Worker(this.workerPath, {
      execArgv: ['--experimental-vm-modules'],
      workerData: { __filename: this.workerPath }
    });

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
          this.recordSuccess();
          task.resolve(message.data);
        } else {
          this.recordFailure();
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

    // Create replacement worker (unref'd to prevent timer from blocking shutdown)
    setTimeout(() => {
      if (!this.isShutdown) {
        this.createWorker(id);
      }
    }, 100).unref();
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
   * Check current system load and detect overload conditions
   * @returns {Object} Load status with degradation level
   */
  checkOverload() {
    const queueSize = this.taskQueue.length;
    const busyWorkers = this.workers.filter(w => w.isBusy).length;
    const utilizationPercent = this.workers.length > 0
      ? Math.round((busyWorkers / this.workers.length) * 100)
      : 0;

    // Check circuit breaker
    if (this.circuitBreakerState === CIRCUIT_STATES.OPEN) {
      const timeOpen = Date.now() - this.circuitBreakerOpenedAt;
      if (timeOpen >= this.degradationConfig.strategies.CIRCUIT_BREAKER.RESET_TIMEOUT_MS) {
        // Try half-open state
        this.circuitBreakerState = CIRCUIT_STATES.HALF_OPEN;
        logger.info('Circuit breaker entering half-open state');
      } else {
        return {
          level: DEGRADATION_LEVELS.CRITICAL,
          queueSize,
          utilizationPercent,
          circuitOpen: true,
          reason: 'circuit_breaker',
        };
      }
    }

    // Check queue size thresholds
    const { WARNING_SIZE, CRITICAL_SIZE, MAX_SIZE } = this.degradationConfig.queue;

    if (queueSize >= MAX_SIZE) {
      return {
        level: DEGRADATION_LEVELS.CRITICAL,
        queueSize,
        utilizationPercent,
        reason: 'max_queue_size',
      };
    }

    if (queueSize >= CRITICAL_SIZE || utilizationPercent >= this.degradationConfig.utilization.CRITICAL_PCT) {
      return {
        level: DEGRADATION_LEVELS.CRITICAL,
        queueSize,
        utilizationPercent,
        reason: queueSize >= CRITICAL_SIZE ? 'queue_size' : 'utilization',
      };
    }

    if (queueSize >= WARNING_SIZE || utilizationPercent >= this.degradationConfig.utilization.WARNING_PCT) {
      return {
        level: DEGRADATION_LEVELS.WARNING,
        queueSize,
        utilizationPercent,
        reason: queueSize >= WARNING_SIZE ? 'queue_size' : 'utilization',
      };
    }

    return {
      level: DEGRADATION_LEVELS.NONE,
      queueSize,
      utilizationPercent,
      reason: null,
    };
  }

  /**
   * Get adaptive timeout based on current degradation level
   * @returns {number} Adjusted timeout in milliseconds
   */
  getAdaptiveTimeout() {
    const baseTimeout = this.taskTimeout;

    if (!this.degradationConfig.strategies.ADAPTIVE_TIMEOUT.ENABLED) {
      return baseTimeout;
    }

    switch (this.degradationLevel) {
      case DEGRADATION_LEVELS.CRITICAL:
        return baseTimeout * this.degradationConfig.strategies.ADAPTIVE_TIMEOUT.CRITICAL_MULTIPLIER;
      case DEGRADATION_LEVELS.WARNING:
        return baseTimeout * this.degradationConfig.strategies.ADAPTIVE_TIMEOUT.WARNING_MULTIPLIER;
      default:
        return baseTimeout;
    }
  }

  /**
   * Update degradation level based on current load
   * @param {Object} loadStatus - Result from checkOverload()
   */
  updateDegradationLevel(loadStatus) {
    const previousLevel = this.degradationLevel;
    const newLevel = loadStatus.level;

    if (previousLevel !== newLevel) {
      this.degradationLevel = newLevel;
      this.degradationSince = Date.now();

      if (newLevel === DEGRADATION_LEVELS.CRITICAL) {
        this.overloadEvents++;
        this.lastOverloadTime = Date.now();
        logger.warn(`Worker pool entering critical degradation: ${loadStatus.reason} (queue: ${loadStatus.queueSize}, utilization: ${loadStatus.utilizationPercent}%)`);
      } else if (newLevel === DEGRADATION_LEVELS.WARNING) {
        logger.warn(`Worker pool entering warning state: ${loadStatus.reason} (queue: ${loadStatus.queueSize}, utilization: ${loadStatus.utilizationPercent}%)`);
      } else if (previousLevel !== DEGRADATION_LEVELS.NONE) {
        logger.info(`Worker pool returning to normal operation from ${previousLevel}`);
      }
    }

    // Reset consecutive successes when level changes
    if (previousLevel !== newLevel) {
      this.successfulOperations = 0;
    }
  }

  /**
   * Record a successful operation for recovery tracking
   */
  recordSuccess() {
    this.consecutiveFailures = 0;
    this.successfulOperations++;

    // Close circuit breaker if in half-open state
    if (this.circuitBreakerState === CIRCUIT_STATES.HALF_OPEN) {
      this.circuitBreakerState = CIRCUIT_STATES.CLOSED;
      this.circuitBreakerOpenedAt = null;
      logger.info('Circuit breaker closed - service recovered');
    }

    // Auto-recover if we've had enough successful operations
    if (this.degradationLevel !== DEGRADATION_LEVELS.NONE) {
      const cooldownElapsed = Date.now() - this.degradationSince >= this.degradationConfig.recovery.COOLDOWN_MS;
      const minOpsMet = this.successfulOperations >= this.degradationConfig.recovery.MIN_NORMAL_OPERATIONS;

      if (cooldownElapsed && minOpsMet) {
        const loadStatus = this.checkOverload();
        if (loadStatus.level === DEGRADATION_LEVELS.NONE) {
          this.updateDegradationLevel(loadStatus);
        }
      }
    }
  }

  /**
   * Record a failed operation and potentially open circuit breaker
   */
  recordFailure() {
    this.consecutiveFailures++;
    this.successfulOperations = 0;

    const threshold = this.degradationConfig.strategies.CIRCUIT_BREAKER.FAILURE_THRESHOLD;

    if (this.degradationConfig.strategies.CIRCUIT_BREAKER.ENABLED &&
        this.consecutiveFailures >= threshold &&
        this.circuitBreakerState === CIRCUIT_STATES.CLOSED) {
      this.circuitBreakerState = CIRCUIT_STATES.OPEN;
      this.circuitBreakerOpenedAt = Date.now();
      logger.error(`Circuit breaker opened after ${this.consecutiveFailures} consecutive failures`);
    }
  }

  /**
   * Check if we should reject/shed a new task due to overload
   * @param {Object} options - Task options
   * @returns {boolean} True if task should be rejected
   */
  shouldShedLoad(options = {}) {
    // Never shed critical tasks
    if (options.critical || options.priority === 'high') {
      return false;
    }

    // Check if load shedding is enabled
    if (!this.degradationConfig.strategies.SHED_LOAD.ENABLED) {
      return false;
    }

    // Shed non-critical tasks when in critical state
    if (this.degradationLevel === DEGRADATION_LEVELS.CRITICAL &&
        this.degradationConfig.strategies.SHED_LOAD.SHED_NON_CRITICAL) {
      return true;
    }

    return false;
  }

  /**
   * Execute a systeminformation command via worker thread
   * @param {string} command - Command to execute
   * @param {Object} options - Command options
   * @returns {Promise<any>} Command result
   */
  async execute(command, options = {}) {
    // Check for overload conditions
    const loadStatus = this.checkOverload();
    this.updateDegradationLevel(loadStatus);

    // Check if queue is at max capacity (reject before load shedding)
    if (loadStatus.level === DEGRADATION_LEVELS.CRITICAL && loadStatus.reason === 'max_queue_size') {
      this.totalRejected++;
      throw new WorkerPoolOverloadError('Worker pool queue at maximum capacity', {
        degradationLevel: this.degradationLevel,
        queueSize: loadStatus.queueSize,
        utilizationPercent: loadStatus.utilizationPercent,
      });
    }

    // Check if circuit breaker is open
    if (loadStatus.circuitOpen) {
      this.totalRejected++;
      throw new WorkerPoolOverloadError('Worker pool circuit breaker is open', {
        degradationLevel: this.degradationLevel,
        queueSize: loadStatus.queueSize,
        utilizationPercent: loadStatus.utilizationPercent,
      });
    }

    // Check if we should shed load (after max queue check)
    if (this.shouldShedLoad(options)) {
      this.totalShed++;
      logger.debug(`Shedding load for command: ${command}`);
      // Fall back to direct execution for shed tasks
      try {
        const result = await this.fallbackExecute(command, options);
        this.recordSuccess();
        return result;
      } catch (error) {
        this.recordFailure();
        throw error;
      }
    }

    // Fall back to direct execution if workers aren't available
    if (!this.workersSupported || !this.enableWorkers || this.workers.length === 0) {
      try {
        const result = await this.fallbackExecute(command, options);
        this.recordSuccess();
        return result;
      } catch (error) {
        this.recordFailure();
        throw error;
      }
    }

    return new Promise((resolve, reject) => {
      const id = ++this.taskId;

      // Use adaptive timeout based on degradation level
      const adaptiveTimeout = this.getAdaptiveTimeout();

      // Set up timeout with unref to prevent timer from keeping process alive
      const timeout = setTimeout(() => {
        this.pendingTasks.delete(id);
        this.recordFailure();
        reject(new Error(`Worker task timeout: ${command}`));
      }, adaptiveTimeout).unref();

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
    const loadStatus = this.checkOverload();
    return {
      enabled: this.enableWorkers,
      supported: this.workersSupported,
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter(w => w.isBusy).length,
      readyWorkers: this.workers.filter(w => w.isReady).length,
      pendingTasks: this.pendingTasks.size,
      queuedTasks: this.taskQueue.length,
      degradation: {
        level: this.degradationLevel,
        since: this.degradationSince,
        queueSize: loadStatus.queueSize,
        utilizationPercent: loadStatus.utilizationPercent,
        circuitBreakerState: this.circuitBreakerState,
        consecutiveFailures: this.consecutiveFailures,
        successfulOperations: this.successfulOperations,
        overloadEvents: this.overloadEvents,
        lastOverloadTime: this.lastOverloadTime,
        totalRejected: this.totalRejected,
        totalShed: this.totalShed,
      },
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
export { WorkerPool, DEGRADATION_LEVELS, CIRCUIT_STATES };
