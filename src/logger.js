/**
 * Logger module with timestamp support and file output
 * Replaces direct console.error usage throughout the codebase
 * 
 * IMPORTANT: Logs are written to file only to avoid interfering with blessed TUI
 */

import fs from 'fs';
import { setSecurePermissionsSync } from './security.js';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this module to resolve the log path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log file path - using ~/.openclaw/claw-dashboard.log
const LOG_FILE_PATH = os.homedir() + '/.openclaw/claw-dashboard.log';

// Ensure log directory exists
function ensureLogDir() {
  const logDir = os.homedir() + '/.openclaw';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Sanitize user-controlled input to prevent log injection attacks
 * - Escapes newlines and carriage returns
 * - Removes or escapes ANSI control codes
 * - Escapes other special characters that could affect log formatting
 * 
 * @param {any} value - The value to sanitize
 * @returns {string} Sanitized string representation
 */
function sanitize(value) {
  if (value === null || value === undefined) {
    return String(value);
  }
  
  // Convert to string
  let str = String(value);
  
  // Remove ANSI escape sequences (color codes, cursor movement, etc.)
  // These patterns match common ANSI control sequences
  str = str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  str = str.replace(/\x1b\][^\x07]*\x07/g, '');  // OSC sequences
  str = str.replace(/\x1b[P][a-zA-Z0-9]/g, '');   // DCS sequences
  str = str.replace(/\x1b\[[0-9;]*[@-~]/g, '');   // Generic CSI sequences
  
  // Escape or remove control characters (except common safe ones)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, (char) => {
    // Allow tab and newline but escape them for safety
    if (char === '\t') return '\t';
    if (char === '\n') return '\\n';
    if (char === '\r') return '\\r';
    // Replace other control chars with hex representation
    return '\\x' + char.charCodeAt(0).toString(16).padStart(2, '0');
  });
  
  // Replace newlines with escaped versions to prevent log injection
  // But keep them readable in the log
  str = str.replace(/\r\n/g, '\\r\\n');
  str = str.replace(/\n/g, '\\n');
  str = str.replace(/\r/g, '\\r');
  
  return str;
}

/**
 * Sanitize all arguments in a log call
 * @param {any[]} args - Arguments to sanitize
 * @returns {string[]} Array of sanitized strings
 */
function sanitizeArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'object') {
      // For objects, try to serialize and sanitize
      try {
        return sanitize(JSON.stringify(arg));
      } catch {
        return sanitize(String(arg));
      }
    }
    return sanitize(arg);
  });
}

/**
 * Write a formatted log line to the log file
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG)
 * @param {any[]} args - Arguments to log
 */
function writeLog(level, args) {
  const timestamp = getTimestamp();
  const sanitizedArgs = sanitizeArgs(args);
  const message = sanitizedArgs.join(' ');
  const logLine = `${timestamp} [${level}] ${message}\n`;
  
  try {
    ensureLogDir();
    // Avoid TOCTOU by using appendFileSync which creates if needed
    // Track if this is likely first write via file existence
    let isNewFile = false;
    try {
      fs.accessSync(LOG_FILE_PATH, fs.constants.F_OK);
    } catch {
      isNewFile = true;
    }
    
    fs.appendFileSync(LOG_FILE_PATH, logLine);
    
    // Set secure permissions on new files (not TOCTOU vulnerable since we just created it)
    if (isNewFile) {
      setSecurePermissionsSync(LOG_FILE_PATH);
    }
  } catch (err) {
    // Silently fail if we can't write to log file - don't disrupt the dashboard
    // Could also try console.error for critical errors, but that defeats the purpose
    if (level === 'ERROR') {
      // For critical errors, at least try to indicate something is wrong
      process.stderr.write(`[Log Error] Failed to write ERROR log: ${err.message}\n`);
    }
  }
}

/**
 * Format a timestamp for log messages
 * @returns {string} Formatted timestamp [YYYY-MM-DD HH:mm:ss]
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
}

/**
 * Logger object with level-based logging methods
 * All logs are written to file only to prevent interfering with blessed TUI
 */
const logger = {
  /**
   * Log error level messages to file
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    writeLog('ERROR', args);
  },

  /**
   * Log warning level messages to file
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    writeLog('WARN', args);
  },

  /**
   * Log info level messages to file
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    writeLog('INFO', args);
  },

  /**
   * Log debug level messages to file (only when DEBUG env var is set)
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (process.env.DEBUG) {
      writeLog('DEBUG', args);
    }
  }
};

export default logger;
export { logger, LOG_FILE_PATH };
