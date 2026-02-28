/**
 * Custom error classes for Claw Dashboard
 * Provides specific error types for better error handling and debugging
 * @module errors
 */

/**
 * Base error class for all dashboard-specific errors
 * @extends Error
 */
export class DashboardError extends Error {
  constructor(message, code = 'DASHBOARD_ERROR', details = {}) {
    super(message);
    this.name = 'DashboardError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Configuration related errors
export class ConfigError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

// Settings validation or load/save errors
export class SettingsError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'SETTINGS_ERROR', details);
    this.name = 'SettingsError';
  }
}

// Gateway/OpenClaw communication errors
export class GatewayError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'GATEWAY_ERROR', details);
    this.name = 'GatewayError';
  }
}

// Session-related errors
export class SessionError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'SESSION_ERROR', details);
    this.name = 'SessionError';
  }
}

// Data fetch errors (systeminformation, CLI commands)
export class DataFetchError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'DATA_FETCH_ERROR', details);
    this.name = 'DataFetchError';
  }
}

// Authentication/authorization errors
export class AuthError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}

// Network-related errors
export class NetworkError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

// UI/Rendering errors
export class UIError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'UI_ERROR', details);
    this.name = 'UIError';
  }
}

// Database errors
export class DatabaseError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

// Validation errors
export class ValidationError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Timeout errors
export class TimeoutError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'TimeoutError';
  }
}

// Worker pool overload errors
export class WorkerPoolOverloadError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'WORKER_POOL_OVERLOAD', details);
    this.name = 'WorkerPoolOverloadError';
    this.degradationLevel = details.degradationLevel || 'none';
    this.queueSize = details.queueSize || 0;
    this.utilizationPercent = details.utilizationPercent || 0;
  }
}

// Checksum verification errors
export class ChecksumError extends DashboardError {
  constructor(message, details = {}) {
    super(message, 'CHECKSUM_ERROR', details);
    this.name = 'ChecksumError';
  }
}

// Error code constants for programmatic handling
export const ERROR_CODES = {
  CONFIG_ERROR: 'CONFIG_ERROR',
  SETTINGS_ERROR: 'SETTINGS_ERROR',
  GATEWAY_ERROR: 'GATEWAY_ERROR',
  SESSION_ERROR: 'SESSION_ERROR',
  DATA_FETCH_ERROR: 'DATA_FETCH_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UI_ERROR: 'UI_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CHECKSUM_ERROR: 'CHECKSUM_ERROR',
  WORKER_POOL_OVERLOAD: 'WORKER_POOL_OVERLOAD',
  DASHBOARD_ERROR: 'DASHBOARD_ERROR'
};

// Helper to check if error is a dashboard error
export function isDashboardError(error) {
  return error instanceof DashboardError;
}

// Helper to get error code or default
export function getErrorCode(error) {
  if (error instanceof DashboardError) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}
