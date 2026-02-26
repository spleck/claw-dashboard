/**
 * Test utilities extracted from index.js
 * These are pure functions that can be unit tested without the Dashboard class
 */

// Color constants (same as in index.js)
const C = {
  green: 'green', brightGreen: 'bright-green',
  yellow: 'yellow', brightYellow: 'bright-yellow',
  red: 'red', brightRed: 'bright-red',
  cyan: 'cyan', brightCyan: 'bright-cyan',
  magenta: 'magenta', brightMagenta: 'bright-magenta',
  blue: 'blue', brightBlue: 'bright-blue',
  white: 'white', brightWhite: 'bright-white',
  gray: 'gray', black: 'black'
};

/**
 * Generate a gauge bar visualization
 * @param {number} percent - Percentage (0-100)
 * @param {number} width - Width of the gauge in characters
 * @returns {string} Gauge visualization
 */
function gauge(percent, width = 15) {
  const filled = Math.round((percent / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/**
 * Generate a sparkline from data points
 * @param {number[]} data - Array of numeric values
 * @param {number} width - Max width of sparkline
 * @returns {string} Sparkline visualization
 */
function sparkline(data, width = 15) {
  if (!data || data.length === 0) return '─'.repeat(width);
  const chars = '▁▂▃▄▅▆▇█';
  const max = Math.max(...data, 1);
  const recent = data.slice(-width);
  return recent.map(v => {
    const normalized = Math.max(0, Math.min(1, v / max));
    return chars[Math.floor(normalized * (chars.length - 1))];
  }).join('');
}

/**
 * Get color based on percentage threshold
 * @param {number} percent - Percentage value
 * @returns {string} Color name
 */
function getColor(percent) {
  if (percent >= 80) return C.red;
  if (percent >= 60) return C.yellow;
  return C.green;
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 GB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format bytes per second to bits per second
 * @param {number} bytesPerSec - Bytes per second
 * @returns {string} Formatted string (e.g., "1.5M")
 */
function formatBitsPerSecond(bytesPerSec) {
  const bitsPerSec = bytesPerSec * 8;
  if (bitsPerSec === 0) return '0';
  if (bitsPerSec < 1000) return Math.round(bitsPerSec) + 'b';
  if (bitsPerSec < 1000000) return (bitsPerSec / 1000).toFixed(0) + 'K';
  return (bitsPerSec / 1000000).toFixed(1) + 'M';
}

/**
 * Format duration in seconds to human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2d 3h")
 */
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '--';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Calculate tokens per second between two sessions
 * @param {object} session - Current session
 * @param {object} prevSession - Previous session
 * @param {number} elapsedMs - Elapsed time in milliseconds
 * @returns {number|null} Tokens per second or null
 */
function calcTPS(session, prevSession, elapsedMs) {
  if (!session || !prevSession || elapsedMs < 100) return null;
  const currTokens = session.totalTokens || 0;
  const prevTokens = prevSession.totalTokens || 0;
  const diff = currTokens - prevTokens;
  if (diff <= 0) return null;
  const tps = diff / (elapsedMs / 1000);
  return tps > 0 ? parseFloat(tps.toFixed(1)) : null;
}

/**
 * Validate file path for security
 * @param {string} filePath - Path to validate
 * @param {string[]} allowedDirs - Additional allowed directories
 * @returns {object} Validation result
 */
function validateFilePath(filePath, allowedDirs = []) {
  try {
    if (!filePath || typeof filePath !== 'string') {
      return { valid: false, resolvedPath: filePath, error: "Invalid file path" };
    }
    
    const os = require('os');
    const { resolve, join } = require('path');
    
    const normalizedPath = filePath.startsWith('~')
      ? join(os.homedir(), filePath.slice(1))
      : filePath;
    
    const resolvedPath = resolve(normalizedPath);
    
    if (filePath.includes("..")) {
      return { valid: false, resolvedPath, error: "Path traversal not allowed" };
    }
    
    const homeDir = os.homedir();
    const defaultAllowedDirs = [
      homeDir,
      homeDir + "/.openclaw",
      homeDir + "/.openclaw/agents",
      "/tmp"
    ];
    
    const allAllowedDirs = [...defaultAllowedDirs, ...allowedDirs];
    
    const isAllowed = allAllowedDirs.some(allowedDir => {
      const resolvedAllowed = resolve(allowedDir);
      return resolvedPath.startsWith(resolvedAllowed + "/") || resolvedPath === resolvedAllowed;
    });
    
    if (!isAllowed) {
      return { valid: false, resolvedPath, error: "Path not in allowed directories" };
    }
    
    return { valid: true, resolvedPath };
  } catch (err) {
    return { valid: false, resolvedPath: filePath, error: err.message };
  }
}

/**
 * Colorize log line based on log level
 * @param {string} line - Log line to colorize
 * @returns {string} Colorized log line
 */
function colorizeLogLine(line) {
  if (!line || typeof line !== 'string') return line;
  
  let matchedLevel = null;
  let levelStart = -1;
  let levelEnd = -1;
  
  for (const level of ['error', 'warn', 'info', 'debug']) {
    const escapedLevel = level.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\[${escapedLevel.toUpperCase()}\\]`, 'i');
    const match = line.match(pattern);
    if (match) {
      matchedLevel = level;
      levelStart = match.index;
      levelEnd = levelStart + match[0].length;
      break;
    }
  }
  
  if (!matchedLevel) {
    for (const level of ['error', 'warn', 'info', 'debug']) {
      const escapedLevel = level.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`^\\d{4}-\\d{2}-\\d{2}[T ].*?${escapedLevel}:`, 'i');
      const match = line.match(pattern);
      if (match) {
        matchedLevel = level;
        levelStart = match.index;
        const afterMatch = line.slice(match.index + match[0].length);
        const spaceMatch = afterMatch.match(/^(\s*)/);
        levelEnd = match.index + match[0].length + (spaceMatch ? spaceMatch[1].length : 0);
        break;
      }
    }
  }
  
  if (!matchedLevel) return line;
  
  const LOG_COLORS = {
    error: C.brightRed,
    warn: C.brightYellow,
    info: C.cyan,
    debug: C.gray
  };
  
  const color = LOG_COLORS[matchedLevel] || C.white;
  const colorTag = `{${color}-fg}`;
  const resetTag = '{/}';
  
  return line.slice(0, levelStart) + colorTag + line.slice(levelStart, levelEnd) + resetTag + line.slice(levelEnd);
}

/**
 * Convert camelCase to dash-case for tag colors
 * @param {string} color - Color name in camelCase
 * @returns {string} Color name in dash-case
 */
function toTagColor(color) {
  return color.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export {
  C,
  gauge,
  sparkline,
  getColor,
  formatBytes,
  formatBitsPerSecond,
  formatDuration,
  calcTPS,
  validateFilePath,
  colorizeLogLine,
  toTagColor
};
