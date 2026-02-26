/**
 * Alert notifications module for Claw Dashboard
 * Monitors system metrics (CPU, memory, disk) against configurable thresholds
 * and provides visual notifications in the Dashboard UI
 */

import logger from './logger.js';
import config from './config.js';
import { getCurrentTheme } from './themes.js';

// Default threshold configurations
const DEFAULT_THRESHOLDS = config.ALERT_THRESHOLDS;

// Alert levels
const AlertLevel = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
  CLEARED: 'cleared'
};

// Alert state storage
let alerts = [];
let thresholds = { ...DEFAULT_THRESHOLDS };
let alertHistory = [];
const MAX_HISTORY = config.MAX_ALERT_HISTORY;

// Rate limiting configuration
const DEFAULT_RATE_LIMIT = config.ALERT_RATE_LIMIT;

// Rate limiting state
let rateLimit = { ...DEFAULT_RATE_LIMIT };
let alertTimestamps = {};  // Track timestamps per alert type: { cpu: [ts1, ts2, ...] }

/**
 * Check if alert should be rate-limited
 * @param {string} type - Alert type (cpu, memory, disk)
 * @returns {boolean} True if alert should be suppressed
 */
function shouldRateLimitAlert(type) {
  if (!rateLimit.enabled) {
    return false;
  }
  
  const now = Date.now();
  const timestamps = alertTimestamps[type] || [];
  
  // Clean up old timestamps outside the window
  const validTimestamps = timestamps.filter(ts => now - ts < rateLimit.windowMs);
  
  // Check if we've exceeded the max alerts in this window
  if (validTimestamps.length >= rateLimit.maxAlerts) {
    logger.debug(`[RATE LIMIT] Alert for ${type} suppressed - rate limit exceeded (${validTimestamps.length}/${rateLimit.maxAlerts} in ${rateLimit.windowMs}ms)`);
    return true;
  }
  
  // Record this check/timestamp
  validTimestamps.push(now);
  alertTimestamps[type] = validTimestamps;
  
  return false;
}

/**
 * Record an alert timestamp for rate limiting
 * @param {string} type - Alert type
 */
function recordAlertTimestamp(type) {
  if (!rateLimit.enabled) {
    return;
  }
  
  if (!alertTimestamps[type]) {
    alertTimestamps[type] = [];
  }
  alertTimestamps[type].push(Date.now());
}

/**
 * Set rate limiting configuration
 * @param {object} config - Rate limit configuration
 */
function setRateLimit(config) {
  rateLimit = { ...rateLimit, ...config };
  logger.info(`Rate limiting updated: enabled=${rateLimit.enabled}, window=${rateLimit.windowMs}ms, max=${rateLimit.maxAlerts}`);
}

/**
 * Get current rate limiting configuration
 * @returns {object} Current rate limit config
 */
function getRateLimit() {
  return { ...rateLimit };
}

/**
 * Reset rate limiting state (useful for testing)
 */
function resetRateLimit() {
  alertTimestamps = {};
  rateLimit = { ...DEFAULT_RATE_LIMIT };
}

/**
 * Create a new alert object
 * @param {string} type - Alert type (cpu, memory, disk)
 * @param {string} level - Alert level (info, warning, critical)
 * @param {number} value - Current value
 * @param {number} threshold - Threshold that was exceeded
 * @returns {object} Alert object
 */
function createAlert(type, level, value, threshold) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    level,
    value,
    threshold,
    timestamp: new Date().toISOString(),
    message: getAlertMessage(type, level, value, threshold),
    dismissed: false
  };
}

/**
 * Generate alert message based on type and level
 */
function getAlertMessage(type, level, value, threshold) {
  const typeNames = {
    cpu: 'CPU usage',
    memory: 'Memory usage',
    disk: 'Disk usage'
  };
  
  const levelNames = {
    info: 'Information',
    warning: 'Warning',
    critical: 'Critical',
    cleared: 'Resolved'
  };
  
  if (level === AlertLevel.CLEARED) {
    return `${typeNames[type]} normalized (${value}% - was above ${threshold}%)`;
  }
  
  return `${levelNames[level]}: ${typeNames[type]} at ${value}% (threshold: ${threshold}%)`;
}

/**
 * Check a metric against thresholds and create alert if needed
 * @param {string} type - Metric type (cpu, memory, disk)
 * @param {number} value - Current value (0-100)
 * @returns {object|null} New alert if created, null otherwise
 */
function checkThreshold(type, value) {
  if (!thresholds[type]) {
    logger.warn(`Unknown alert type: ${type}`);
    return null;
  }
  
  const { warning, critical } = thresholds[type];
  const existingAlert = alerts.find(a => a.type === type && !a.dismissed);
  
  // Check for critical level
  if (value >= critical) {
    if (!existingAlert || existingAlert.level !== AlertLevel.CRITICAL) {
      // Check rate limit - but always allow critical alerts
      if (!shouldRateLimitAlert(type) || value >= critical) {
        const alert = createAlert(type, AlertLevel.CRITICAL, value, critical);
        addAlert(alert);
        recordAlertTimestamp(type);
        return alert;
      }
    }
    // Update existing alert if it exists and is already critical
    if (existingAlert) {
      existingAlert.value = value;
      existingAlert.timestamp = new Date().toISOString();
    }
    return null;
  }
  
  // Check for warning level
  if (value >= warning) {
    if (!existingAlert || existingAlert.level === AlertLevel.CLEARED) {
      // Check rate limit
      if (!shouldRateLimitAlert(type)) {
        const alert = createAlert(type, AlertLevel.WARNING, value, warning);
        addAlert(alert);
        recordAlertTimestamp(type);
        return alert;
      }
    }
    // Update existing alert if it exists
    if (existingAlert) {
      existingAlert.value = value;
      existingAlert.timestamp = new Date().toISOString();
    }
    return null;
  }
  
  // Value below threshold - clear existing alert
  if (existingAlert) {
    // Always allow cleared alerts through
    const clearedAlert = createAlert(type, AlertLevel.CLEARED, value, existingAlert.threshold);
    dismissAlert(existingAlert.id);
    addAlert(clearedAlert);
    return clearedAlert;
  }
  
  return null;
}

/**
 * Add an alert to the active alerts list and history
 */
function addAlert(alert) {
  // Remove duplicates of same type
  alerts = alerts.filter(a => a.type !== alert.type || a.dismissed);
  alerts.push(alert);
  
  // Add to history
  alertHistory.push(alert);
  if (alertHistory.length > MAX_HISTORY) {
    alertHistory = alertHistory.slice(-MAX_HISTORY);
  }
  
  logger.info(`[ALERT] ${alert.message}`);
}

/**
 * Dismiss an active alert
 * @param {string} id - Alert ID to dismiss
 */
function dismissAlert(id) {
  const alert = alerts.find(a => a.id === id);
  if (alert) {
    alert.dismissed = true;
    alert.timestamp = new Date().toISOString();
  }
}

/**
 * Get all active (non-dismissed) alerts
 * @returns {object[]} Active alerts
 */
function getActiveAlerts() {
  return alerts.filter(a => !a.dismissed);
}

/**
 * Get all alerts of a specific level
 * @param {string} level - Alert level to filter
 * @returns {object[]} Filtered alerts
 */
function getAlertsByLevel(level) {
  return alerts.filter(a => a.level === level && !a.dismissed);
}

/**
 * Get alert history
 * @returns {object[]} Alert history
 */
function getAlertHistory() {
  return [...alertHistory];
}

/**
 * Clear all alerts
 */
function clearAllAlerts() {
  alerts.forEach(a => a.dismissed = true);
}

/**
 * Set custom thresholds
 * @param {object} newThresholds - New threshold configuration
 */
function setThresholds(newThresholds) {
  if (newThresholds.cpu) {
    thresholds.cpu = { ...thresholds.cpu, ...newThresholds.cpu };
  }
  if (newThresholds.memory) {
    thresholds.memory = { ...thresholds.memory, ...newThresholds.memory };
  }
  if (newThresholds.disk) {
    thresholds.disk = { ...thresholds.disk, ...newThresholds.disk };
  }
  logger.info(`Alert thresholds updated: CPU ${thresholds.cpu.warning}/${thresholds.cpu.critical}%, Memory ${thresholds.memory.warning}/${thresholds.memory.critical}%, Disk ${thresholds.disk.warning}/${thresholds.disk.critical}%`);
}

/**
 * Get current thresholds
 * @returns {object} Current thresholds
 */
function getThresholds() {
  return { ...thresholds };
}

/**
 * Reset thresholds to defaults
 */
function resetThresholds() {
  thresholds = { ...DEFAULT_THRESHOLDS };
  logger.info('Alert thresholds reset to defaults');
}

/**
 * Check all system metrics and generate alerts
 * @param {object} metrics - Object with cpu, memory, disk values
 * @returns {object[]} Array of new alerts generated
 */
function checkAllMetrics(metrics) {
  const newAlerts = [];
  
  if (metrics && metrics.cpu !== undefined) {
    const alert = checkThreshold('cpu', metrics.cpu);
    if (alert) newAlerts.push(alert);
  }
  
  if (metrics && metrics.memory !== undefined) {
    const alert = checkThreshold('memory', metrics.memory);
    if (alert) newAlerts.push(alert);
  }
  
  if (metrics && metrics.disk !== undefined) {
    const alert = checkThreshold('disk', metrics.disk);
    if (alert) newAlerts.push(alert);
  }
  
  return newAlerts;
}

/**
 * Get alert color based on level and current theme
 * @param {string} level - Alert level
 * @returns {string} Color name
 */
function getAlertColor(level) {
  const theme = getCurrentTheme();
  const colorMap = {
    [AlertLevel.INFO]: theme.colors.alert?.info || 'cyan',
    [AlertLevel.WARNING]: theme.colors.alert?.warning || 'yellow',
    [AlertLevel.CRITICAL]: theme.colors.alert?.error || 'red',
    [AlertLevel.CLEARED]: theme.colors.alert?.success || 'green'
  };
  return colorMap[level] || 'white';
}

/**
 * Format alert for display in UI
 * @param {object} alert - Alert object
 * @returns {string} Formatted string
 */
function formatAlert(alert) {
  const color = getAlertColor(alert.level);
  const icon = getAlertIcon(alert.level);
  return `{${color}-fg}${icon} ${alert.message}{/}`;
}

/**
 * Get icon for alert level
 */
function getAlertIcon(level) {
  const icons = {
    [AlertLevel.INFO]: 'ℹ',
    [AlertLevel.WARNING]: '⚠',
    [AlertLevel.CRITICAL]: '✖',
    [AlertLevel.CLEARED]: '✓'
  };
  return icons[level] || '•';
}

/**
 * Get count of active alerts by level
 * @returns {object} Counts by level
 */
function getAlertCounts() {
  const active = getActiveAlerts();
  return {
    info: active.filter(a => a.level === AlertLevel.INFO).length,
    warning: active.filter(a => a.level === AlertLevel.WARNING).length,
    critical: active.filter(a => a.level === AlertLevel.CRITICAL).length,
    total: active.length
  };
}

export default {
  AlertLevel,
  checkThreshold,
  checkAllMetrics,
  dismissAlert,
  getActiveAlerts,
  getAlertsByLevel,
  getAlertHistory,
  getAlertCounts,
  getAlertColor,
  formatAlert,
  setThresholds,
  getThresholds,
  resetThresholds,
  clearAllAlerts,
  // Rate limiting exports
  setRateLimit,
  getRateLimit,
  resetRateLimit,
  shouldRateLimitAlert
};
