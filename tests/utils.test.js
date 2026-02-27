/**
 * Unit tests for utility functions
 */

import {
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
} from './utils.js';

describe('gauge', () => {
  test('returns empty gauge for 0%', () => {
    const result = gauge(0, 10);
    expect(result).toBe('░'.repeat(10));
  });

  test('returns full gauge for 100%', () => {
    const result = gauge(100, 10);
    expect(result).toBe('█'.repeat(10));
  });

  test('returns half gauge for 50%', () => {
    const result = gauge(50, 10);
    expect(result).toBe('█'.repeat(5) + '░'.repeat(5));
  });

  test('handles decimal percentages correctly', () => {
    const result = gauge(33, 10);
    // 33% of 10 = 3.3 rounded = 3 filled
    expect(result.startsWith('███')).toBe(true);
  });

  test('defaults to width 15', () => {
    const result = gauge(50);
    expect(result.length).toBe(15);
  });

  test('handles boundary values', () => {
    expect(gauge(1, 10).length).toBe(10);
    expect(gauge(99, 10).length).toBe(10);
  });
});

describe('sparkline', () => {
  test('returns dashes for empty array', () => {
    const result = sparkline([]);
    expect(result).toBe('─'.repeat(15));
  });

  test('returns dashes for null/undefined', () => {
    expect(sparkline(null)).toBe('─'.repeat(15));
    expect(sparkline(undefined)).toBe('─'.repeat(15));
  });

  test('returns single character for single value', () => {
    const result = sparkline([100], 10);
    expect(result.length).toBe(1);
    expect(result).toBe('█');
  });

  test('handles increasing values', () => {
    const data = [10, 20, 30, 40, 50];
    const result = sparkline(data, 5);
    expect(result.length).toBe(5);
  });

  test('handles decreasing values', () => {
    const data = [50, 40, 30, 20, 10];
    const result = sparkline(data, 5);
    expect(result.length).toBe(5);
  });

  test('uses only recent data when array is larger than width', () => {
    const data = Array.from({ length: 30 }, (_, i) => i * 10);
    const result = sparkline(data, 10);
    expect(result.length).toBe(10);
  });

  test('handles all same values', () => {
    const data = [50, 50, 50, 50, 50];
    const result = sparkline(data, 5);
    // Should use middle character for 50% value
    expect(result.length).toBe(5);
  });
});

describe('getColor', () => {
  test('returns green for low percentages', () => {
    expect(getColor(0)).toBe('green');
    expect(getColor(30)).toBe('green');
    expect(getColor(59)).toBe('green');
  });

  test('returns yellow for medium percentages', () => {
    expect(getColor(60)).toBe('yellow');
    expect(getColor(70)).toBe('yellow');
    expect(getColor(79)).toBe('yellow');
  });

  test('returns red for high percentages', () => {
    expect(getColor(80)).toBe('red');
    expect(getColor(90)).toBe('red');
    expect(getColor(100)).toBe('red');
  });
});

describe('formatBytes', () => {
  test('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  test('formats bytes correctly', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  test('formats kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(10240)).toBe('10 KB');
  });

  test('formats megabytes correctly', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1572864)).toBe('1.5 MB');
  });

  test('formats gigabytes correctly', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  test('handles large values', () => {
    const result = formatBytes(5000000000);
    expect(result).toContain('GB');
  });
});

describe('formatBitsPerSecond', () => {
  test('formats 0 bps', () => {
    expect(formatBitsPerSecond(0)).toBe('0');
  });

  test('formats bits correctly', () => {
    expect(formatBitsPerSecond(1)).toBe('8b');
    expect(formatBitsPerSecond(100)).toBe('800b');
    expect(formatBitsPerSecond(125)).toBe('1K');
  });

  test('formats kilobits correctly', () => {
    expect(formatBitsPerSecond(125)).toBe('1K');
    expect(formatBitsPerSecond(1250)).toBe('10K');
  });

  test('formats megabits correctly', () => {
    expect(formatBitsPerSecond(125000)).toBe('1.0M');
    expect(formatBitsPerSecond(1250000)).toBe('10.0M');
  });
});

describe('formatDuration', () => {
  test('returns -- for null/undefined', () => {
    expect(formatDuration(null)).toBe('--');
    expect(formatDuration(undefined)).toBe('--');
  });

  test('returns -- for negative values', () => {
    expect(formatDuration(-1)).toBe('--');
  });

  test('formats minutes correctly', () => {
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(300)).toBe('5m');
    expect(formatDuration(3599)).toBe('59m');
  });

  test('formats hours correctly', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(7200)).toBe('2h 0m');
    expect(formatDuration(3660)).toBe('1h 1m');
  });

  test('formats days correctly', () => {
    expect(formatDuration(86400)).toBe('1d 0h');
    expect(formatDuration(90000)).toBe('1d 1h');
    expect(formatDuration(172800)).toBe('2d 0h');
  });
});

describe('calcTPS', () => {
  test('returns null for missing sessions', () => {
    expect(calcTPS(null, {}, 1000)).toBeNull();
    expect(calcTPS({}, null, 1000)).toBeNull();
    expect(calcTPS({}, {}, 1000)).toBeNull();
  });

  test('returns null for elapsed time less than 100ms', () => {
    const session = { totalTokens: 100 };
    const prevSession = { totalTokens: 0 };
    expect(calcTPS(session, prevSession, 50)).toBeNull();
    expect(calcTPS(session, prevSession, 99)).toBeNull();
  });

  test('returns null when tokens decreased', () => {
    const session = { totalTokens: 50 };
    const prevSession = { totalTokens: 100 };
    expect(calcTPS(session, prevSession, 1000)).toBeNull();
  });

  test('returns null when tokens are equal', () => {
    const session = { totalTokens: 100 };
    const prevSession = { totalTokens: 100 };
    expect(calcTPS(session, prevSession, 1000)).toBeNull();
  });

  test('calculates TPS correctly', () => {
    const session = { totalTokens: 1000 };
    const prevSession = { totalTokens: 0 };
    // 1000 tokens in 1 second = 1000 TPS
    const result = calcTPS(session, prevSession, 1000);
    expect(result).toBe(1000);
  });

  test('handles missing totalTokens property (defaults to 0)', () => {
    const session = {};
    const prevSession = {};
    expect(calcTPS(session, prevSession, 1000)).toBeNull(); // 0 - 0 = 0, so null
  });
});

describe('validateFilePath', () => {
  // Note: validateFilePath now uses ESM imports instead of require()
  // These tests verify basic behavior

  test('rejects null/undefined paths', () => {
    expect(validateFilePath(null).valid).toBe(false);
    expect(validateFilePath(undefined).valid).toBe(false);
    expect(validateFilePath('').valid).toBe(false);
  });

  test('rejects path traversal attempts', () => {
    // This works because it checks for ".." in the path
    const result = validateFilePath('/home/user/../../../etc/passwd');
    expect(result.valid).toBe(false);
  });

  test('rejects paths outside allowed directories', () => {
    const result = validateFilePath('/usr/bin/test');
    expect(result.valid).toBe(false);
  });
});

describe('colorizeLogLine', () => {
  test('returns unchanged for null/undefined', () => {
    expect(colorizeLogLine(null)).toBeNull();
    expect(colorizeLogLine(undefined)).toBeUndefined();
  });

  test('returns unchanged for non-string', () => {
    expect(colorizeLogLine(123)).toBe(123);
  });

  test('colorizes error lines with brackets', () => {
    const line = '[ERROR] Something went wrong';
    const result = colorizeLogLine(line);
    expect(result).toContain('{bright-red-fg}');
    expect(result).toContain('{/}');
  });

  test('colorizes warn lines with brackets', () => {
    const line = '[WARN] Warning message';
    const result = colorizeLogLine(line);
    expect(result).toContain('{bright-yellow-fg}');
  });

  test('colorizes info lines with brackets', () => {
    const line = '[INFO] Info message';
    const result = colorizeLogLine(line);
    expect(result).toContain('{cyan-fg}');
  });

  test('colorizes debug lines with brackets', () => {
    const line = '[DEBUG] Debug message';
    const result = colorizeLogLine(line);
    expect(result).toContain('{gray-fg}');
  });

  test('handles lowercase brackets', () => {
    const line = '[error] Lowercase error';
    const result = colorizeLogLine(line);
    expect(result).toContain('{bright-red-fg}');
  });

  test('returns unchanged for lines without log levels', () => {
    const line = 'Just a regular message';
    const result = colorizeLogLine(line);
    expect(result).toBe(line);
  });
});

describe('toTagColor', () => {
  test('converts camelCase to dash-case', () => {
    expect(toTagColor('brightRed')).toBe('bright-red');
    expect(toTagColor('brightGreen')).toBe('bright-green');
    expect(toTagColor('brightYellow')).toBe('bright-yellow');
  });

  test('handles single words', () => {
    expect(toTagColor('red')).toBe('red');
  });
});
