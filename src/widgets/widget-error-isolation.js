/**
 * Widget Error Isolation Module
 * Ensures that widget failures don't crash the entire dashboard
 * Provides health tracking and recovery mechanisms
 */

import logger from '../logger.js';
import { DashboardError, UIError } from '../errors.js';

// Safe logger wrapper for test environments
const safeLogger = logger || {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

/**
 * Widget health status constants
 */
export const WidgetHealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',  // Partially working with errors
  FAILED: 'failed',      // Completely failed, not rendering
  RECOVERING: 'recovering', // Attempting recovery
};

/**
 * Widget error types
 */
export const WidgetErrorType = {
  INIT_ERROR: 'init_error',
  CREATE_ERROR: 'create_error',
  DATA_ERROR: 'data_error',
  RENDER_ERROR: 'render_error',
  DESTROY_ERROR: 'destroy_error',
  TIMEOUT_ERROR: 'timeout_error',
  UNKNOWN_ERROR: 'unknown_error',
};

/**
 * Default configuration for error isolation
 */
export const DEFAULT_ISOLATION_CONFIG = {
  // Error thresholds
  maxConsecutiveErrors: 3,
  errorWindowMs: 60000, // 1 minute window for error counting

  // Recovery settings
  autoRecover: true,
  recoveryDelayMs: 5000,
  maxRecoveryAttempts: 3,

  // Timeout settings
  initTimeoutMs: 5000,
  createTimeoutMs: 5000,
  dataTimeoutMs: 10000,
  renderTimeoutMs: 1000,
  destroyTimeoutMs: 3000,

  // Behavior settings
  failSilently: true,     // Don't throw on widget errors
  logErrors: true,        // Log widget errors
  degradeOnError: true,   // Mark as degraded instead of failed on first errors
};

/**
 * Widget error for isolated widget failures
 */
export class WidgetIsolatedError extends DashboardError {
  constructor(widgetId, operation, originalError, type = WidgetErrorType.UNKNOWN_ERROR) {
    super(
      `Widget '${widgetId}' ${operation} failed: ${originalError?.message || 'Unknown error'}`,
      'WIDGET_ISOLATED_ERROR',
      500,
      { widgetId, operation, type, originalError: originalError?.message }
    );
    this.widgetId = widgetId;
    this.operation = operation;
    this.errorType = type;
    this.originalError = originalError;
  }
}

/**
 * Widget health tracker for monitoring widget status
 */
export class WidgetHealthTracker {
  constructor(config = {}) {
    this.config = { ...DEFAULT_ISOLATION_CONFIG, ...config };
    this.healthStatus = new Map(); // widgetId -> health info
    this.errorHistory = new Map(); // widgetId -> array of error timestamps
  }

  /**
   * Get or create health record for a widget
   * @private
   */
  _getHealthRecord(widgetId) {
    if (!this.healthStatus.has(widgetId)) {
      this.healthStatus.set(widgetId, {
        status: WidgetHealthStatus.HEALTHY,
        consecutiveErrors: 0,
        totalErrors: 0,
        recoveryAttempts: 0,
        lastError: null,
        lastSuccess: Date.now(),
        firstFailure: null,
        degradedSince: null,
        failedSince: null,
      });
    }
    return this.healthStatus.get(widgetId);
  }

  /**
   * Record a successful widget operation
   * @param {string} widgetId - Widget identifier
   */
  recordSuccess(widgetId) {
    const record = this._getHealthRecord(widgetId);
    record.status = WidgetHealthStatus.HEALTHY;
    record.consecutiveErrors = 0;
    record.lastSuccess = Date.now();
    record.recoveryAttempts = 0;

    // Clear error history for this widget
    this.errorHistory.delete(widgetId);
  }

  /**
   * Record a widget error and update health status
   * @param {string} widgetId - Widget identifier
   * @param {Error} error - The error that occurred
   * @param {string} errorType - Type of error
   * @returns {Object} Updated health status
   */
  recordError(widgetId, error, errorType = WidgetErrorType.UNKNOWN_ERROR) {
    const record = this._getHealthRecord(widgetId);
    const now = Date.now();

    // Update error counts
    record.consecutiveErrors++;
    record.totalErrors++;
    record.lastError = {
      message: error?.message,
      type: errorType,
      timestamp: now,
      stack: error?.stack,
    };

    // Track error history
    if (!this.errorHistory.has(widgetId)) {
      this.errorHistory.set(widgetId, []);
    }
    const errors = this.errorHistory.get(widgetId);
    errors.push(now);

    // Clean old errors outside the window
    const cutoff = now - this.config.errorWindowMs;
    while (errors.length > 0 && errors[0] < cutoff) {
      errors.shift();
    }

    // Update status based on error thresholds
    if (record.firstFailure === null) {
      record.firstFailure = now;
    }

    // Check if we should mark as failed
    const recentErrorCount = errors.length;
    if (recentErrorCount >= this.config.maxConsecutiveErrors) {
      record.status = WidgetHealthStatus.FAILED;
      record.failedSince = now;
    } else if (this.config.degradeOnError && record.status === WidgetHealthStatus.HEALTHY) {
      record.status = WidgetHealthStatus.DEGRADED;
      record.degradedSince = now;
    }

    return { ...record };
  }

  /**
   * Mark widget as recovering
   * @param {string} widgetId - Widget identifier
   */
  markRecovering(widgetId) {
    const record = this._getHealthRecord(widgetId);
    record.status = WidgetHealthStatus.RECOVERING;
    record.recoveryAttempts++;
  }

  /**
   * Get health status for a widget
   * @param {string} widgetId - Widget identifier
   * @returns {Object|null} Health status or null if not tracked
   */
  getHealth(widgetId) {
    const record = this.healthStatus.get(widgetId);
    if (!record) return null;

    const errors = this.errorHistory.get(widgetId) || [];
    return {
      ...record,
      recentErrorCount: errors.length,
      isHealthy: record.status === WidgetHealthStatus.HEALTHY,
      isOperational: record.status !== WidgetHealthStatus.FAILED,
    };
  }

  /**
   * Get health status for all tracked widgets
   * @returns {Object} Map of widgetId to health status
   */
  getAllHealth() {
    const result = {};
    for (const [widgetId, record] of this.healthStatus) {
      result[widgetId] = this.getHealth(widgetId);
    }
    return result;
  }

  /**
   * Check if a widget should be allowed to recover
   * @param {string} widgetId - Widget identifier
   * @returns {boolean} True if recovery should be attempted
   */
  canRecover(widgetId) {
    const record = this._getHealthRecord(widgetId);
    if (!this.config.autoRecover) return false;
    if (record.recoveryAttempts >= this.config.maxRecoveryAttempts) return false;
    if (record.status === WidgetHealthStatus.FAILED) {
      // Check if enough time has passed since last failure
      const timeSinceFailure = Date.now() - (record.failedSince || 0);
      return timeSinceFailure >= this.config.recoveryDelayMs;
    }
    return record.status !== WidgetHealthStatus.HEALTHY;
  }

  /**
   * Reset health status for a widget
   * @param {string} widgetId - Widget identifier
   */
  resetHealth(widgetId) {
    this.healthStatus.delete(widgetId);
    this.errorHistory.delete(widgetId);
  }

  /**
   * Get summary statistics
   * @returns {Object} Health statistics
   */
  getStats() {
    const allHealth = Array.from(this.healthStatus.values());
    return {
      total: allHealth.length,
      healthy: allHealth.filter(h => h.status === WidgetHealthStatus.HEALTHY).length,
      degraded: allHealth.filter(h => h.status === WidgetHealthStatus.DEGRADED).length,
      failed: allHealth.filter(h => h.status === WidgetHealthStatus.FAILED).length,
      recovering: allHealth.filter(h => h.status === WidgetHealthStatus.RECOVERING).length,
      totalErrors: allHealth.reduce((sum, h) => sum + h.totalErrors, 0),
    };
  }
}

/**
 * Widget error isolator - wraps widget operations with error handling
 */
export class WidgetErrorIsolator {
  constructor(config = {}) {
    this.config = { ...DEFAULT_ISOLATION_CONFIG, ...config };
    this.healthTracker = new WidgetHealthTracker(this.config);
    this.failedWidgets = new Set();
    this.recoveryTimers = new Map();
  }

  /**
   * Create a timeout promise
   * @private
   */
  _createTimeout(ms, message) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  /**
   * Wrap a widget operation with timeout and error handling
   * @private
   */
  async _wrapOperation(widgetId, operation, fn, timeoutMs, errorType) {
    // Check if widget is already failed
    const health = this.healthTracker.getHealth(widgetId);
    if (health?.status === WidgetHealthStatus.FAILED) {
      if (this.config.failSilently) {
        return null;
      }
      throw new WidgetIsolatedError(widgetId, operation, new Error('Widget is in failed state'), errorType);
    }

    try {
      // Race between operation and timeout
      const result = await Promise.race([
        fn(),
        this._createTimeout(timeoutMs, `Operation timed out after ${timeoutMs}ms`),
      ]);

      // Record success
      this.healthTracker.recordSuccess(widgetId);
      this.failedWidgets.delete(widgetId);

      return result;
    } catch (error) {
      // Record the error
      this.healthTracker.recordError(widgetId, error, errorType);

      if (this.config.logErrors) {
        safeLogger.warn(`Widget '${widgetId}' ${operation} failed: ${error.message}`);
      }

      // Schedule recovery if appropriate
      this._scheduleRecovery(widgetId);

      if (this.config.failSilently) {
        return null;
      }

      throw new WidgetIsolatedError(widgetId, operation, error, errorType);
    }
  }

  /**
   * Schedule a recovery attempt
   * @private
   */
  _scheduleRecovery(widgetId) {
    if (this.recoveryTimers.has(widgetId)) return;
    if (!this.healthTracker.canRecover(widgetId)) return;

    const timer = setTimeout(() => {
      this.recoveryTimers.delete(widgetId);
      this.healthTracker.markRecovering(widgetId);
      if (this.config.logErrors) {
        safeLogger.info(`Attempting recovery for widget '${widgetId}'`);
      }
    }, this.config.recoveryDelayMs);

    this.recoveryTimers.set(widgetId, timer);
  }

  /**
   * Wrap widget initialization
   * @param {string} widgetId - Widget identifier
   * @param {Function} initFn - Initialization function
   * @returns {Promise<any>} Init result or null on failure
   */
  async wrapInit(widgetId, initFn) {
    return this._wrapOperation(
      widgetId,
      'init',
      initFn,
      this.config.initTimeoutMs,
      WidgetErrorType.INIT_ERROR
    );
  }

  /**
   * Wrap widget creation
   * @param {string} widgetId - Widget identifier
   * @param {Function} createFn - Creation function
   * @returns {Promise<any>} Create result or null on failure
   */
  async wrapCreate(widgetId, createFn) {
    return this._wrapOperation(
      widgetId,
      'create',
      createFn,
      this.config.createTimeoutMs,
      WidgetErrorType.CREATE_ERROR
    );
  }

  /**
   * Wrap widget data fetching
   * @param {string} widgetId - Widget identifier
   * @param {Function} dataFn - Data fetching function
   * @returns {Promise<any>} Data or null on failure
   */
  async wrapGetData(widgetId, dataFn) {
    return this._wrapOperation(
      widgetId,
      'getData',
      dataFn,
      this.config.dataTimeoutMs,
      WidgetErrorType.DATA_ERROR
    );
  }

  /**
   * Wrap widget render
   * @param {string} widgetId - Widget identifier
   * @param {Function} renderFn - Render function
   * @returns {Promise<any>} Render result or null on failure
   */
  async wrapRender(widgetId, renderFn) {
    return this._wrapOperation(
      widgetId,
      'render',
      renderFn,
      this.config.renderTimeoutMs,
      WidgetErrorType.RENDER_ERROR
    );
  }

  /**
   * Wrap widget destruction
   * @param {string} widgetId - Widget identifier
   * @param {Function} destroyFn - Destroy function
   * @returns {Promise<any>} Destroy result or null on failure
   */
  async wrapDestroy(widgetId, destroyFn) {
    return this._wrapOperation(
      widgetId,
      'destroy',
      destroyFn,
      this.config.destroyTimeoutMs,
      WidgetErrorType.DESTROY_ERROR
    );
  }

  /**
   * Get health status for a widget
   * @param {string} widgetId - Widget identifier
   * @returns {Object|null} Health status
   */
  getHealth(widgetId) {
    return this.healthTracker.getHealth(widgetId);
  }

  /**
   * Get all health statuses
   * @returns {Object} All health statuses
   */
  getAllHealth() {
    return this.healthTracker.getAllHealth();
  }

  /**
   * Check if a widget is operational (not failed)
   * @param {string} widgetId - Widget identifier
   * @returns {boolean} True if operational
   */
  isOperational(widgetId) {
    const health = this.getHealth(widgetId);
    return !health || health.status !== WidgetHealthStatus.FAILED;
  }

  /**
   * Force reset a widget's health status
   * @param {string} widgetId - Widget identifier
   */
  resetWidget(widgetId) {
    this.healthTracker.resetHealth(widgetId);
    this.failedWidgets.delete(widgetId);

    const timer = this.recoveryTimers.get(widgetId);
    if (timer) {
      clearTimeout(timer);
      this.recoveryTimers.delete(widgetId);
    }
  }

  /**
   * Get isolator statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.healthTracker.getStats(),
      failedWidgetCount: this.failedWidgets.size,
      pendingRecoveries: this.recoveryTimers.size,
    };
  }

  /**
   * Shutdown the isolator and clear all timers
   */
  shutdown() {
    for (const [widgetId, timer] of this.recoveryTimers) {
      clearTimeout(timer);
    }
    this.recoveryTimers.clear();
    this.failedWidgets.clear();
  }
}

/**
 * Execute multiple widget operations with isolation
 * @param {Array<{widgetId: string, operation: Function}>} operations - Operations to execute
 * @param {Object} config - Isolation configuration
 * @returns {Promise<Array<{widgetId: string, success: boolean, result: any, error: Error|null}>>} Results
 */
export async function executeWithIsolation(operations, config = {}) {
  const isolator = new WidgetErrorIsolator({ ...config, failSilently: false });
  const results = [];

  await Promise.all(
    operations.map(async ({ widgetId, operation, type = 'operation' }) => {
      try {
        const result = await isolator._wrapOperation(
          widgetId,
          type,
          operation,
          config.operationTimeoutMs || 10000,
          WidgetErrorType.UNKNOWN_ERROR
        );
        results.push({ widgetId, success: true, result, error: null });
      } catch (error) {
        results.push({ widgetId, success: false, result: null, error });
      }
    })
  );

  return results;
}

// Singleton instance for simple usage
let defaultIsolator = null;

/**
 * Get the default widget error isolator instance
 * @param {Object} config - Configuration options
 * @returns {WidgetErrorIsolator} Default isolator instance
 */
export function getWidgetErrorIsolator(config = {}) {
  if (!defaultIsolator) {
    defaultIsolator = new WidgetErrorIsolator(config);
  }
  return defaultIsolator;
}

export default {
  WidgetErrorIsolator,
  WidgetHealthTracker,
  WidgetIsolatedError,
  WidgetHealthStatus,
  WidgetErrorType,
  executeWithIsolation,
  getWidgetErrorIsolator,
  DEFAULT_ISOLATION_CONFIG,
};
