/**
 * Memory Pressure Detection Module
 * Monitors dashboard process memory for long-running sessions
 * Detects memory trends, sustained pressure, and potential leaks
 */

import logger from './logger.js';
import config from './config.js';
import { RateLimiter } from './alerts.js';

const { MEMORY_PRESSURE } = config;

/**
 * Memory pressure levels
 */
export const PressureLevel = {
  NONE: 'none',
  ELEVATED: 'elevated',
  WARNING: 'warning',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency',
};

/**
 * Memory trend directions
 */
export const TrendDirection = {
  STABLE: 'stable',
  GROWING: 'growing',
  SHRINKING: 'shrinking',
};

/**
 * Memory sample for trend analysis
 * @typedef {Object} MemorySample
 * @property {number} timestamp - Unix timestamp
 * @property {number} heapUsed - Heap used in MB
 * @property {number} heapTotal - Heap total in MB
 * @property {number} rss - RSS memory in MB
 * @property {number} external - External memory in MB
 */

/**
 * Memory pressure state
 * @typedef {Object} PressureState
 * @property {string} level - Current pressure level
 * @property {number} heapUsedMB - Current heap usage in MB
 * @property {number} heapTotalMB - Current heap total in MB
 * @property {number} usagePercent - Current usage percentage
 * @property {string} trend - Memory trend direction
 * @property {number} trendRateMB - Memory growth rate in MB/minute
 * @property {boolean} sustained - Whether pressure has been sustained
 * @property {number} sustainedDurationMs - How long pressure has been sustained
 * @property {string[]} recommendations - Action recommendations
 */

class MemoryPressureDetector {
  constructor() {
    /** @type {MemorySample[]} */
    this.samples = [];
    this.maxSamples = MEMORY_PRESSURE.TREND.SAMPLE_COUNT * 2;

    // Pressure state tracking
    this.currentLevel = PressureLevel.NONE;
    this.sustainedSince = null;
    this.lastCheck = Date.now();

    // Trend tracking
    this.lastTrend = TrendDirection.STABLE;
    this.lastTrendRate = 0;

    // Alert rate limiter (separate from threshold alerts)
    this.rateLimiter = new RateLimiter({
      enabled: true,
      windowMs: 300000, // 5 minutes between pressure alerts
      maxAlerts: 3,
      alwaysAllowCritical: true,
    });

    // Statistics
    this.stats = {
      peakHeapMB: 0,
      pressureEvents: 0,
      sustainedEvents: 0,
      lastPressureTime: null,
    };

    // Callbacks
    this.onPressureChange = null;
    this.onSustainedPressure = null;
    this.onEmergency = null;

    this.isRunning = false;
  }

  /**
   * Start memory pressure monitoring
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.debug('Memory pressure monitoring started');
  }

  /**
   * Stop memory pressure monitoring
   */
  stop() {
    this.isRunning = false;
    logger.debug('Memory pressure monitoring stopped');
  }

  /**
   * Record a memory sample
   * @returns {MemorySample}
   */
  recordSample() {
    const usage = process.memoryUsage();
    const sample = {
      timestamp: Date.now(),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      external: Math.round((usage.external || 0) / 1024 / 1024),
    };

    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // Update peak stats
    if (sample.heapUsed > this.stats.peakHeapMB) {
      this.stats.peakHeapMB = sample.heapUsed;
    }

    return sample;
  }

  /**
   * Analyze memory trend from samples
   * @returns {{direction: string, rateMBPerMin: number}}
   */
  analyzeTrend() {
    if (this.samples.length < MEMORY_PRESSURE.TREND.SAMPLE_COUNT) {
      return { direction: TrendDirection.STABLE, rateMBPerMin: 0 };
    }

    const recentSamples = this.samples.slice(-MEMORY_PRESSURE.TREND.SAMPLE_COUNT);
    const first = recentSamples[0];
    const last = recentSamples[recentSamples.length - 1];
    const durationMinutes = (last.timestamp - first.timestamp) / 60000;

    if (durationMinutes < 0.5) {
      return { direction: TrendDirection.STABLE, rateMBPerMin: 0 };
    }

    const growthMB = last.heapUsed - first.heapUsed;
    const rateMBPerMin = growthMB / durationMinutes;

    // Determine direction based on threshold
    const threshold = MEMORY_PRESSURE.TREND.GROWTH_THRESHOLD_MB;
    if (growthMB > threshold) {
      return { direction: TrendDirection.GROWING, rateMBPerMin };
    } else if (growthMB < -threshold) {
      return { direction: TrendDirection.SHRINKING, rateMBPerMin };
    }

    return { direction: TrendDirection.STABLE, rateMBPerMin };
  }

  /**
   * Determine pressure level from heap usage
   * @param {number} heapUsedMB
   * @returns {string}
   */
  getPressureLevel(heapUsedMB) {
    const { THRESHOLDS } = MEMORY_PRESSURE;
    if (heapUsedMB >= THRESHOLDS.EMERGENCY_MB) return PressureLevel.EMERGENCY;
    if (heapUsedMB >= THRESHOLDS.CRITICAL_MB) return PressureLevel.CRITICAL;
    if (heapUsedMB >= THRESHOLDS.WARNING_MB) return PressureLevel.WARNING;
    // Elevated is 75% of warning threshold
    if (heapUsedMB >= THRESHOLDS.WARNING_MB * 0.75) return PressureLevel.ELEVATED;
    return PressureLevel.NONE;
  }

  /**
   * Check for sustained pressure
   * @param {string} level - Current pressure level
   * @returns {{sustained: boolean, durationMs: number}}
   */
  checkSustainedPressure(level) {
    const isElevated = level !== PressureLevel.NONE && level !== PressureLevel.ELEVATED;

    if (!isElevated) {
      this.sustainedSince = null;
      return { sustained: false, durationMs: 0 };
    }

    if (!this.sustainedSince) {
      this.sustainedSince = Date.now();
    }

    const durationMs = Date.now() - this.sustainedSince;
    const sustained = durationMs >= MEMORY_PRESSURE.SUSTAINED.DURATION_MS;

    return { sustained, durationMs };
  }

  /**
   * Get recommendations based on pressure state
   * @param {PressureState} state
   * @returns {string[]}
   */
  getRecommendations(state) {
    const recommendations = [];

    if (state.level === PressureLevel.EMERGENCY) {
      recommendations.push('Consider restarting the dashboard immediately');
      recommendations.push('Check for memory leaks in custom widgets/plugins');
    } else if (state.level === PressureLevel.CRITICAL) {
      recommendations.push('Enable performance metrics to identify resource-heavy widgets');
      recommendations.push('Consider disabling unused widgets');
      if (state.trend === TrendDirection.GROWING) {
        recommendations.push(`Memory growing at ${state.trendRateMB.toFixed(1)}MB/min - possible leak detected`);
      }
    } else if (state.level === PressureLevel.WARNING) {
      if (state.trend === TrendDirection.GROWING) {
        recommendations.push('Memory trend indicates potential leak - monitor closely');
      }
      recommendations.push('Dashboard memory is elevated but stable');
    }

    if (this.samples.length > MEMORY_PRESSURE.TREND.SAMPLE_COUNT) {
      const ageMs = Date.now() - this.samples[0].timestamp;
      const ageHours = ageMs / (1000 * 60 * 60);
      if (ageHours > 24) {
        recommendations.push(`Dashboard has been running for ${ageHours.toFixed(1)} hours - consider periodic restarts`);
      }
    }

    return recommendations;
  }

  /**
   * Perform memory pressure check
   * @returns {PressureState}
   */
  check() {
    if (!this.isRunning) {
      this.start();
    }

    const sample = this.recordSample();
    const trend = this.analyzeTrend();
    const level = this.getPressureLevel(sample.heapUsed);
    const { sustained, durationMs } = this.checkSustainedPressure(level);
    const usagePercent = sample.heapTotal > 0
      ? Math.round((sample.heapUsed / sample.heapTotal) * 100)
      : 0;

    const state = {
      level,
      heapUsedMB: sample.heapUsed,
      heapTotalMB: sample.heapTotal,
      usagePercent,
      trend: trend.direction,
      trendRateMB: trend.rateMBPerMin,
      sustained,
      sustainedDurationMs: durationMs,
      recommendations: [],
    };

    state.recommendations = this.getRecommendations(state);

    // Track state changes
    if (level !== this.currentLevel) {
      this.handleLevelChange(this.currentLevel, level, state);
      this.currentLevel = level;
    }

    // Handle sustained pressure
    if (sustained && durationMs >= MEMORY_PRESSURE.SUSTAINED.DURATION_MS) {
      this.handleSustainedPressure(state);
    }

    this.lastTrend = trend.direction;
    this.lastTrendRate = trend.rateMBPerMin;
    this.lastCheck = Date.now();

    return state;
  }

  /**
   * Handle pressure level change
   * @param {string} oldLevel
   * @param {string} newLevel
   * @param {PressureState} state
   */
  handleLevelChange(oldLevel, newLevel, state) {
    const escalation = [
      PressureLevel.NONE,
      PressureLevel.ELEVATED,
      PressureLevel.WARNING,
      PressureLevel.CRITICAL,
      PressureLevel.EMERGENCY,
    ];

    const oldIndex = escalation.indexOf(oldLevel);
    const newIndex = escalation.indexOf(newLevel);

    if (newIndex > oldIndex) {
      // Escalating
      logger.warn(`Memory pressure escalating: ${oldLevel} -> ${newLevel} (${state.heapUsedMB}MB)`);
      this.stats.pressureEvents++;
      this.stats.lastPressureTime = Date.now();

      if (newLevel === PressureLevel.EMERGENCY && this.onEmergency) {
        this.onEmergency(state);
      }
    } else {
      // De-escalating
      logger.info(`Memory pressure de-escalating: ${oldLevel} -> ${newLevel} (${state.heapUsedMB}MB)`);
    }

    if (this.onPressureChange) {
      this.onPressureChange(oldLevel, newLevel, state);
    }
  }

  /**
   * Handle sustained pressure
   * @param {PressureState} state
   */
  handleSustainedPressure(state) {
    const rateLimitResult = this.rateLimiter.checkAndRecord('sustained-pressure', state.level);
    if (!rateLimitResult.allowed) {
      return;
    }

    logger.warn(`Sustained memory pressure detected: ${state.level} for ${(state.sustainedDurationMs / 1000).toFixed(0)}s`);
    this.stats.sustainedEvents++;

    if (this.onSustainedPressure) {
      this.onSustainedPressure(state);
    }

    // Auto-actions
    if (MEMORY_PRESSURE.ACTIONS.REQUEST_GC && global.gc) {
      logger.debug('Requesting garbage collection');
      try {
        global.gc();
      } catch (error) {
        logger.debug('GC request failed:', error.message);
      }
    }
  }

  /**
   * Get memory pressure status for display
   * @returns {Object}
   */
  getStatus() {
    const latest = this.samples[this.samples.length - 1];
    return {
      isRunning: this.isRunning,
      currentLevel: this.currentLevel,
      samples: this.samples.length,
      peakHeapMB: this.stats.peakHeapMB,
      pressureEvents: this.stats.pressureEvents,
      sustainedEvents: this.stats.sustainedEvents,
      lastPressureTime: this.stats.lastPressureTime,
      latest: latest || null,
      trend: {
        direction: this.lastTrend,
        rateMBPerMin: this.lastTrendRate,
      },
      thresholds: MEMORY_PRESSURE.THRESHOLDS,
    };
  }

  /**
   * Get formatted status string for display
   * @returns {string}
   */
  getStatusString() {
    const status = this.getStatus();
    const latest = status.latest;

    if (!latest) {
      return 'Memory pressure monitoring inactive';
    }

    const colors = {
      [PressureLevel.NONE]: 'green-fg',
      [PressureLevel.ELEVATED]: 'cyan-fg',
      [PressureLevel.WARNING]: 'yellow-fg',
      [PressureLevel.CRITICAL]: 'red-fg',
      [PressureLevel.EMERGENCY]: 'red-fg',
    };

    const color = colors[this.currentLevel] || 'white-fg';
    const trendIcon = this.lastTrend === TrendDirection.GROWING ? '↑' :
                      this.lastTrend === TrendDirection.SHRINKING ? '↓' : '→';

    return `{${color}}MEM:${latest.heapUsed}MB ${trendIcon}{/${color}}`;
  }

  /**
   * Check if memory pressure is currently elevated
   * @returns {boolean}
   */
  isElevated() {
    return this.currentLevel === PressureLevel.WARNING ||
           this.currentLevel === PressureLevel.CRITICAL ||
           this.currentLevel === PressureLevel.EMERGENCY;
  }

  /**
   * Check if memory pressure is critical
   * @returns {boolean}
   */
  isCritical() {
    return this.currentLevel === PressureLevel.CRITICAL ||
           this.currentLevel === PressureLevel.EMERGENCY;
  }

  /**
   * Reset all statistics and samples
   */
  reset() {
    this.samples = [];
    this.currentLevel = PressureLevel.NONE;
    this.sustainedSince = null;
    this.lastTrend = TrendDirection.STABLE;
    this.lastTrendRate = 0;
    this.stats = {
      peakHeapMB: 0,
      pressureEvents: 0,
      sustainedEvents: 0,
      lastPressureTime: null,
    };
    this.rateLimiter.reset();
    logger.debug('Memory pressure detector reset');
  }

  /**
   * Get recommendations for current state
   * @returns {string[]}
   */
  getCurrentRecommendations() {
    if (this.samples.length === 0) {
      return [];
    }
    const state = {
      level: this.currentLevel,
      trend: this.lastTrend,
      trendRateMB: this.lastTrendRate,
      heapUsedMB: this.samples[this.samples.length - 1]?.heapUsed || 0,
    };
    return this.getRecommendations(state);
  }
}

// Export singleton instance
export default new MemoryPressureDetector();
export { MemoryPressureDetector };
