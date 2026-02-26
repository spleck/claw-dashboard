/**
 * Logger module with timestamp support
 * Replaces direct console.error usage throughout the codebase
 */

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
 */
const logger = {
  /**
   * Log error level messages to stderr
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    console.error(getTimestamp(), '[ERROR]', ...args);
  },

  /**
   * Log warning level messages to stderr
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    console.warn(getTimestamp(), '[WARN]', ...args);
  },

  /**
   * Log info level messages to stdout
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    console.log(getTimestamp(), '[INFO]', ...args);
  },

  /**
   * Log debug level messages to stdout (only when DEBUG env var is set)
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (process.env.DEBUG) {
      console.log(getTimestamp(), '[DEBUG]', ...args);
    }
  }
};

export default logger;
export { logger };
