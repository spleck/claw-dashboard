/**
 * Performance Monitor Module
 * Tracks dashboard performance metrics including refresh rates, memory usage, and worker pool stats
 */

import os from 'os';
import si from 'systeminformation';
import logger from './logger.js';
import memoryPressure, { MemoryPressureDetector } from './memory-pressure.js';

// Worker pool reference (set via setWorkerPool)
let workerPoolRef = null;

/**
 * Set the worker pool reference for metrics tracking
 * @param {Object} pool - Worker pool instance
 */
export function setWorkerPool(pool) {
  workerPoolRef = pool;
}

/**
 * Get worker pool metrics
 * @returns {Object|null} Worker pool status or null if not available
 */
export function getWorkerPoolMetrics() {
  if (!workerPoolRef) {
    return null;
  }
  try {
    return workerPoolRef.getStatus();
  } catch (error) {
    logger.debug('Failed to get worker pool metrics:', error.message);
    return null;
  }
}

/**
 * Performance metrics snapshot
 * @typedef {Object} PerformanceSnapshot
 * @property {number} timestamp - Unix timestamp
 * @property {number} refreshRate - Current refresh rate in ms
 * @property {number} memoryUsed - Heap used in MB
 * @property {number} memoryTotal - Heap total in MB
 * @property {number} memoryPercent - Memory usage percentage
 * @property {number} cpuPercent - CPU usage percentage (process-specific)
 * @property {number} eventLoopLag - Event loop lag in ms
 * @property {number} uptime - Process uptime in seconds
 * @property {Object} operationTimings - Timing details for each operation
 * @property {string|null} slowOperations - Summary of slow operations
 * @property {number} totalRefreshTime - Total refresh cycle time in ms
 */

class PerformanceMonitor {
  constructor() {
    /** @type {PerformanceSnapshot[]} */
    this.history = [];
    this.maxHistory = 60; // 2 minutes at 2s refresh
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    this.isTracking = false;

    // Memory pressure detector
    this.memoryPressure = memoryPressure;
    this.enableMemoryPressure = true;

    // Metrics
    this.metrics = {
      avgRefreshRate: 0,
      avgMemoryUsed: 0,
      peakMemoryUsed: 0,
      avgHeapUsed: 0,
      peakHeapUsed: 0,
      avgCpuPercent: 0,
      avgEventLoopLag: 0,
      slowOperations: null,
      totalRefreshTime: 0,
    };
  }

  /**
   * Start performance tracking
   */
  start() {
    this.isTracking = true;
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    memoryPressure.start();
    logger.debug('Performance monitoring started');
  }

  /**
   * Stop performance tracking
   */
  stop() {
    this.isTracking = false;
    memoryPressure.stop();
    logger.debug('Performance monitoring stopped');
  }

  /**
   * Record a performance snapshot
   * @param {number} refreshRate - Current refresh interval in ms
   * @param {Object} timingDetails - Optional timing details from refresh operations
   * @returns {PerformanceSnapshot}
   */
  async record(refreshRate = 2000, timingDetails = {}) {
    if (!this.isTracking) {
      return null;
    }

    const now = Date.now();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCPUUsage);
    
    // Get system memory for comparison
    let systemMem = null;
    try {
      systemMem = await si.mem();
    } catch (e) {
      // Fallback to process memory only
    }

    // Calculate CPU percentage (user + system time / elapsed time)
    const elapsedMs = now - this.lastCheck;
    const cpuPercent = elapsedMs > 0
      ? Math.min(100, ((cpuUsage.user + cpuUsage.system) / 1000) / elapsedMs * 100)
      : 0;

    // Calculate event loop lag (how much behind schedule we are)
    const eventLoopLag = Math.max(0, now - this.lastCheck - refreshRate);

    // Calculate system memory (excluding cache like Activity Monitor)
    const systemUsed = systemMem 
      ? (systemMem.available ? systemMem.total - systemMem.available : systemMem.used)
      : memoryUsage.heapUsed;
    const systemTotal = systemMem ? systemMem.total : memoryUsage.heapTotal;
    const systemPercent = systemMem && systemMem.total > 0
      ? Math.round((systemUsed / systemMem.total) * 100)
      : 0;
    
    const snapshot = {
      timestamp: now,
      refreshRate,
      // Node.js process memory (heap)
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapPercent: memoryUsage.heapTotal > 0
        ? Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        : 0,
      // System memory (what Activity Monitor shows)
      memoryUsed: Math.round(systemUsed / 1024 / 1024),
      memoryTotal: Math.round(systemTotal / 1024 / 1024),
      memoryPercent: systemPercent,
      cpuPercent: Math.round(cpuPercent * 10) / 10,
      eventLoopLag: Math.round(eventLoopLag),
      uptime: Math.floor(process.uptime()),
      operationTimings: timingDetails.operationTimings || {},
      slowOperations: timingDetails.slowOperations || null,
      totalRefreshTime: timingDetails.totalRefreshTime || 0,
    };

    // Add to history
    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Update cached metrics
    this._updateMetrics();

    // Update for next iteration
    this.lastCheck = now;
    this.lastCPUUsage = process.cpuUsage();

    return snapshot;
  }

  /**
   * Update cached aggregate metrics
   * @private
   */
  _updateMetrics() {
    if (this.history.length === 0) {
      return;
    }

    const count = this.history.length;
    const sum = (arr, key) => arr.reduce((a, b) => a + (b[key] || 0), 0);
    
    // Get latest for slow operations
    const latest = this.history[this.history.length - 1];

    this.metrics = {
      avgRefreshRate: Math.round(sum(this.history, 'refreshRate') / count),
      // System memory (Activity Monitor style)
      avgMemoryUsed: Math.round(sum(this.history, 'memoryUsed') / count),
      peakMemoryUsed: Math.max(...this.history.map(h => h.memoryUsed)),
      // Heap memory (Node.js process)
      avgHeapUsed: Math.round(sum(this.history, 'heapUsed') / count),
      peakHeapUsed: Math.max(...this.history.map(h => h.heapUsed)),
      avgCpuPercent: Math.round((sum(this.history, 'cpuPercent') / count) * 10) / 10,
      avgEventLoopLag: Math.round(sum(this.history, 'eventLoopLag') / count),
      slowOperations: latest.slowOperations || null,
      totalRefreshTime: latest.totalRefreshTime || 0,
    };
  }

  /**
   * Get current metrics summary
   * @returns {Object}
   */
  getMetrics() {
    const latest = this.history[this.history.length - 1] || null;
    return {
      current: latest,
      history: [...this.history],
      aggregates: { ...this.metrics },
      isTracking: this.isTracking,
    };
  }

  /**
   * Get formatted status string for display
   * @param {boolean} detailed - Include detailed metrics
   * @returns {string}
   */
  getStatusString(detailed = false) {
    const latest = this.history[this.history.length - 1];
    if (!latest) {
      return 'Performance monitoring inactive';
    }

    const memoryColor = latest.memoryPercent >= 80 ? 'red-fg' :
                       latest.memoryPercent >= 60 ? 'yellow-fg' : 'green-fg';
    const cpuColor = latest.cpuPercent >= 80 ? 'red-fg' :
                    latest.cpuPercent >= 50 ? 'yellow-fg' : 'green-fg';

    // Show system memory (not heap) in footer
    let status = `{${memoryColor}}MEM: ${latest.memoryUsed}MB (${latest.memoryPercent}%){/${memoryColor}`;

    // Add memory pressure indicator if elevated
    if (this.enableMemoryPressure) {
      const pressureStatus = memoryPressure.getStatusString();
      if (memoryPressure.isElevated()) {
        status += ` | ${pressureStatus}`;
      }
    }

    status += ` | {${cpuColor}}CPU: ${latest.cpuPercent}%{/${cpuColor}}`;
    status += ` | Refresh: ${latest.refreshRate}ms`;

    if (detailed && this.metrics.avgEventLoopLag > 0) {
      const lagColor = this.metrics.avgEventLoopLag > 100 ? 'red-fg' :
                      this.metrics.avgEventLoopLag > 50 ? 'yellow-fg' : 'gray-fg';
      status += ` | {${lagColor}}Lag: ${this.metrics.avgEventLoopLag}ms{/${lagColor}}`;
    }

    // Add worker pool metrics when available
    const workerMetrics = getWorkerPoolMetrics();
    if (workerMetrics) {
      const workerColor = workerMetrics.pendingTasks > 0 ? 'yellow-fg' : 'green-fg';
      const busyCount = workerMetrics.busyWorkers || 0;
      const totalCount = workerMetrics.totalWorkers || 0;
      const pendingCount = workerMetrics.pendingTasks || 0;
      status += ` | {${workerColor}}Workers: ${busyCount}/${totalCount}{/${workerColor}}`;
      if (pendingCount > 0) {
        status += ` ({yellow-fg}${pendingCount} pending{/${yellow-fg}})`;
      }
    }

    // Add memory pressure info when detailed and pressure is elevated
    if (detailed && this.enableMemoryPressure) {
      const pressureStatus = memoryPressure.getStatus();
      if (pressureStatus.currentLevel !== 'none') {
        const pressureColor = pressureStatus.currentLevel === 'emergency' ? 'red-fg' :
                             pressureStatus.currentLevel === 'critical' ? 'red-fg' :
                             pressureStatus.currentLevel === 'warning' ? 'yellow-fg' : 'cyan-fg';
        status += ` | {${pressureColor}}Pressure: ${pressureStatus.currentLevel}{/${pressureColor}}`;
        if (pressureStatus.trend?.direction === 'growing') {
          status += ` {yellow-fg}↑${pressureStatus.trend.rateMBPerMin.toFixed(0)}MB/min{/}`;
        }
      }
    }

    return status;
  }

  /**
   * Get memory usage sparkline data
   * @param {number} points - Number of data points
   * @returns {number[]}
   */
  getMemorySparkline(points = 30) {
    const data = this.history.slice(-points).map(h => h.memoryUsed);
    return data.length > 0 ? data : [0];
  }

  /**
   * Get CPU usage sparkline data
   * @param {number} points - Number of data points
   * @returns {number[]}
   */
  getCpuSparkline(points = 30) {
    const data = this.history.slice(-points).map(h => h.cpuPercent);
    return data.length > 0 ? data : [0];
  }

  /**
   * Check if performance is degraded
   * @returns {{degraded: boolean, reasons: string[]}}
   */
  checkHealth() {
    const reasons = [];
    const latest = this.history[this.history.length - 1];

    if (!latest) {
      return { degraded: false, reasons: [] };
    }

    if (latest.memoryPercent >= 85) {
      reasons.push(`High memory usage: ${latest.memoryPercent}%`);
    }

    if (latest.cpuPercent >= 80) {
      reasons.push(`High CPU usage: ${latest.cpuPercent}%`);
    }

    if (this.metrics.avgEventLoopLag > 100) {
      reasons.push(`Event loop lag: ${this.metrics.avgEventLoopLag}ms`);
    }

    // Check memory pressure
    const pressureState = memoryPressure.check();
    if (pressureState.level !== 'none' && pressureState.level !== 'elevated') {
      reasons.push(`Memory pressure: ${pressureState.level} (${pressureState.heapUsedMB}MB)`);
    }

    return {
      degraded: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Check memory pressure state
   * @returns {import('./memory-pressure.js').PressureState}
   */
  checkMemoryPressure() {
    return memoryPressure.check();
  }

  /**
   * Reset all metrics and history
   */
  reset() {
    this.history = [];
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    this.metrics = {
      avgRefreshRate: 0,
      avgMemoryUsed: 0,
      peakMemoryUsed: 0,
      avgCpuPercent: 0,
      avgEventLoopLag: 0,
    };
    memoryPressure.reset();
    logger.debug('Performance metrics reset');
  }
}

// Export singleton instance
export default new PerformanceMonitor();
export { PerformanceMonitor };
