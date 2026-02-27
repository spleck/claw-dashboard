/**
 * Performance Monitor Module
 * Tracks dashboard performance metrics including refresh rates and memory usage
 */

import os from 'os';
import logger from './logger.js';

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
 */

class PerformanceMonitor {
  constructor() {
    /** @type {PerformanceSnapshot[]} */
    this.history = [];
    this.maxHistory = 60; // 2 minutes at 2s refresh
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    this.isTracking = false;

    // Metrics
    this.metrics = {
      avgRefreshRate: 0,
      avgMemoryUsed: 0,
      peakMemoryUsed: 0,
      avgCpuPercent: 0,
      avgEventLoopLag: 0,
    };
  }

  /**
   * Start performance tracking
   */
  start() {
    this.isTracking = true;
    this.lastCheck = Date.now();
    this.lastCPUUsage = process.cpuUsage();
    logger.debug('Performance monitoring started');
  }

  /**
   * Stop performance tracking
   */
  stop() {
    this.isTracking = false;
    logger.debug('Performance monitoring stopped');
  }

  /**
   * Record a performance snapshot
   * @param {number} refreshRate - Current refresh interval in ms
   * @returns {PerformanceSnapshot}
   */
  record(refreshRate = 2000) {
    if (!this.isTracking) {
      return null;
    }

    const now = Date.now();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCPUUsage);

    // Calculate CPU percentage (user + system time / elapsed time)
    const elapsedMs = now - this.lastCheck;
    const cpuPercent = elapsedMs > 0
      ? Math.min(100, ((cpuUsage.user + cpuUsage.system) / 1000) / elapsedMs * 100)
      : 0;

    // Calculate event loop lag (how much behind schedule we are)
    const eventLoopLag = Math.max(0, now - this.lastCheck - refreshRate);

    const snapshot = {
      timestamp: now,
      refreshRate,
      memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      memoryPercent: memoryUsage.heapTotal > 0
        ? Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        : 0,
      cpuPercent: Math.round(cpuPercent * 10) / 10,
      eventLoopLag: Math.round(eventLoopLag),
      uptime: Math.floor(process.uptime()),
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

    this.metrics = {
      avgRefreshRate: Math.round(sum(this.history, 'refreshRate') / count),
      avgMemoryUsed: Math.round(sum(this.history, 'memoryUsed') / count),
      peakMemoryUsed: Math.max(...this.history.map(h => h.memoryUsed)),
      avgCpuPercent: Math.round((sum(this.history, 'cpuPercent') / count) * 10) / 10,
      avgEventLoopLag: Math.round(sum(this.history, 'eventLoopLag') / count),
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

    let status = `{${memoryColor}}MEM: ${latest.memoryUsed}MB (${latest.memoryPercent}%){/${memoryColor}}`;
    status += ` | {${cpuColor}}CPU: ${latest.cpuPercent}%{/${cpuColor}}`;
    status += ` | Refresh: ${latest.refreshRate}ms`;

    if (detailed && this.metrics.avgEventLoopLag > 0) {
      const lagColor = this.metrics.avgEventLoopLag > 100 ? 'red-fg' :
                      this.metrics.avgEventLoopLag > 50 ? 'yellow-fg' : 'gray-fg';
      status += ` | {${lagColor}}Lag: ${this.metrics.avgEventLoopLag}ms{/${lagColor}}`;
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

    return {
      degraded: reasons.length > 0,
      reasons,
    };
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
    logger.debug('Performance metrics reset');
  }
}

// Export singleton instance
export default new PerformanceMonitor();
export { PerformanceMonitor };
