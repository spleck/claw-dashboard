/**
 * Alert notifications module for Claw Dashboard
 * Monitors system metrics (CPU, memory, disk) against configurable thresholds
 * and provides visual notifications in the Dashboard UI
 */

import logger from './logger.js';
import { getCurrentTheme } from './themes.js';

// Default threshold configurations
const DEFAULT_THRESHOLDS = {
  cpu: {
    warning: 70,    // percentage
    critical: 90    // percentage
  },
  memory: {
    warning: 75,
    critical: 90
  },
  disk: {
    warning: 80,
    critical: 95
  }
};

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
const MAX_HISTORY = 100;

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
      const alert = createAlert(type, AlertLevel.CRITICAL, value, critical);
      addAlert(alert);
      return alert;
    }
    // Update existing alert with new value
    existingAlert.value = value;
    existingAlert.timestamp = new Date().toISOString();
    return null;
  }
  
  // Check for warning level
  if (value >= warning) {
    if (!existingAlert || existingAlert.level === AlertLevel.CLEARED) {
      const alert = createAlert(type, AlertLevel.WARNING, value, warning);
      addAlert(alert);
      return alert;
    }
    // Update existing alert
    existingAlert.value = value;
    existingAlert.timestamp = new Date().toISOString();
    return null;
  }
  
  // Value below threshold - clear existing alert
  if (existingAlert) {
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
  
  if (metrics.cpu !== undefined) {
    const alert = checkThreshold('cpu', metrics.cpu);
    if (alert) newAlerts.push(alert);
  }
  
  if (metrics.memory !== undefined) {
    const alert = checkThreshold('memory', metrics.memory);
    if (alert) newAlerts.push(alert);
  }
  
  if (metrics.disk !== undefined) {
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
  clearAllAlerts
};
