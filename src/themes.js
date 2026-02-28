/**
 * Theme definitions for the Claw Dashboard
 * Contains multiple color themes for borders, text, gauges, charts, and alerts
 */

import logger from './logger.js';
import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';

// Settings path for theme persistence
const SETTINGS_PATH = process.env.HOME + '/.openclaw/dashboard-settings.json';
const THEME_KEY = 'theme';

// Theme change listeners
const themeChangeListeners = new Set();
let systemThemeWatcher = null;

/**
 * Detect system-wide dark/light mode (macOS)
 * Uses AppleInterfaceStyle which returns "Dark" or "" (empty for light)
 * @returns {string|null} 'dark', 'light', or null if unable to detect
 */
function detectMacOSAppearance() {
  try {
    const result = execSync(
      'defaults read -g AppleInterfaceStyle 2>/dev/null || echo "Light"',
      { encoding: 'utf8', timeout: 1000 }
    );
    const style = result.trim();
    return style === 'Dark' ? 'dark' : 'light';
  } catch {
    return null;
  }
}

/**
 * Detect system theme on Linux using freedesktop settings
 * @returns {string|null} 'dark', 'light', or null if unable to detect
 */
function detectLinuxAppearance() {
  try {
    // Try gsettings for GNOME/GTK-based desktops
    const result = execSync(
      'gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null || echo "default"',
      { encoding: 'utf8', timeout: 1000 }
    );
    const scheme = result.trim().replace(/'/g, '');
    if (scheme === 'prefer-dark') return 'dark';
    if (scheme === 'prefer-light') return 'light';

    // Fallback: check GTK theme name
    const themeResult = execSync(
      'gsettings get org.gnome.desktop.interface gtk-theme 2>/dev/null || echo ""',
      { encoding: 'utf8', timeout: 1000 }
    );
    const theme = themeResult.trim().toLowerCase();
    if (theme.includes('dark')) return 'dark';
    if (theme.includes('light')) return 'light';

    return null;
  } catch {
    return null;
  }
}

/**
 * Detect system theme using environment variables and COLORFGBG
 * @returns {string|null} 'dark', 'light', or null
 */
function detectFromEnvironment() {
  // Check COLORFGBG which some terminals set (e.g., "15;0" means white on black)
  const colorFgBg = process.env.COLORFGBG;
  if (colorFgBg) {
    const parts = colorFgBg.split(';');
    if (parts.length >= 2) {
      // Standard colors: 0-7 are dark, 8-15 are light/bright
      const bgColor = parseInt(parts[1], 10);
      if (bgColor >= 0 && bgColor <= 7) return 'dark';  // Dark background
      if (bgColor >= 8 && bgColor <= 15) return 'light'; // Light background
    }
  }

  // Check for explicit dark mode env vars
  if (process.env.DARK_MODE === '1' || process.env.THEME === 'dark') {
    return 'dark';
  }
  if (process.env.THEME === 'light') {
    return 'light';
  }

  return null;
}

/**
 * Detect system theme using multiple methods
 * Falls back to terminal background detection if system detection fails
 * @returns {string} 'light' or 'dark'
 */
function detectSystemTheme() {
  let theme = null;

  // Try platform-specific detection first
  const platform = os.platform();
  if (platform === 'darwin') {
    theme = detectMacOSAppearance();
  } else if (platform === 'linux') {
    theme = detectLinuxAppearance();
  }

  // Fall back to environment detection
  if (!theme) {
    theme = detectFromEnvironment();
  }

  // Final fallback to terminal detection
  if (!theme) {
    theme = detectTerminalBackground();
  }

  return theme;
}

/**
 * Start watching for system theme changes (macOS only)
 * Uses a polling mechanism that checks every 2 seconds
 * @param {Function} callback - Called when theme changes with new theme ('dark' or 'light')
 * @returns {Object|null} Watcher object with stop() method, or null if not supported
 */
function startSystemThemeWatcher(callback) {
  // Only macOS supports reliable system theme watching via AppleInterfaceStyle
  if (os.platform() !== 'darwin') {
    logger.debug('System theme watching only supported on macOS');
    return null;
  }

  let lastTheme = detectMacOSAppearance();

  // Poll every 2 seconds for theme changes
  const intervalId = setInterval(() => {
    const currentTheme = detectMacOSAppearance();
    if (currentTheme && currentTheme !== lastTheme) {
      logger.info(`System theme changed: ${lastTheme} -> ${currentTheme}`);
      lastTheme = currentTheme;
      callback(currentTheme);
    }
  }, 2000);

  return {
    stop: () => {
      clearInterval(intervalId);
      logger.debug('System theme watcher stopped');
    }
  };
}

/**
 * Register a callback to be called when the theme changes
 * @param {Function} callback - Function(themeName) called when theme changes
 * @returns {Function} Unsubscribe function
 */
function onThemeChange(callback) {
  themeChangeListeners.add(callback);
  return () => themeChangeListeners.delete(callback);
}

/**
 * Notify all registered listeners of a theme change
 * @param {string} themeName - Name of the new theme
 */
function notifyThemeChange(themeName) {
  themeChangeListeners.forEach(callback => {
    try {
      callback(themeName);
    } catch (err) {
      logger.debug(`Theme change listener error: ${err.message}`);
    }
  });
}

/**
 * Start automatic system theme detection and switching
 * Only works when current theme is set to 'auto'
 * @returns {Object|null} Watcher object or null if not started
 */
function startAutoThemeDetection() {
  // Stop existing watcher if any
  if (systemThemeWatcher) {
    systemThemeWatcher.stop();
    systemThemeWatcher = null;
  }

  // Only start if theme is set to 'auto'
  if (currentThemeName !== 'auto') {
    return null;
  }

  systemThemeWatcher = startSystemThemeWatcher((newTheme) => {
    // Re-detect and notify listeners
    detectedBackground = newTheme;
    notifyThemeChange('auto');
  });

  if (systemThemeWatcher) {
    logger.info('Auto theme detection started - watching for system theme changes');
  }

  return systemThemeWatcher;
}

/**
 * Stop automatic system theme detection
 */
function stopAutoThemeDetection() {
  if (systemThemeWatcher) {
    systemThemeWatcher.stop();
    systemThemeWatcher = null;
    logger.debug('Auto theme detection stopped');
  }
}

/**
 * Detect terminal background color (light or dark)
 * @returns {string} 'light' or 'dark'
 */
function detectTerminalBackground() {
  try {
    // Check common terminal environment variables
    const termProgram = process.env.TERM_PROGRAM || '';
    const colorTerm = process.env.COLORTERM || '';
    const term = process.env.TERM || '';

    // iTerm2 on macOS
    if (termProgram === 'iTerm.app' || termProgram === 'vscode') {
      // Try to get background color from iTerm
      if (termProgram === 'iTerm.app') {
        try {
          const itermBg = execSync(
            'osascript -e \'tell app "System Events" to tell process "iTerm2" to get value of attribute "AXBackgroundColor" of window 1\'',
            { encoding: 'utf8', timeout: 1000 }
          );
          if (itermBg && itermBg.trim()) {
            // Parse RGB values - if dark, first values will be low
            const rgb = itermBg.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / (255 * 3);
              return brightness < 0.5 ? 'dark' : 'light';
            }
          }
        } catch {}
      }

      // VS Code terminal - assume dark
      if (termProgram === 'vscode') {
        return 'dark';
      }
    }

    // Check for common light terminal indicators
    const lightTermIndicators = ['-light', 'light'];
    const isLightTerm = lightTermIndicators.some(ind =>
      term.toLowerCase().includes(ind) || colorTerm.toLowerCase().includes(ind)
    );

    if (isLightTerm) {
      return 'light';
    }

    // Check for common dark terminal indicators
    const darkTermIndicators = ['-256color', 'dark', 'truecolor'];
    const isDarkTerm = darkTermIndicators.some(ind =>
      term.toLowerCase().includes(ind)
    ) || termProgram !== '';

    if (isDarkTerm) {
      return 'dark';
    }

    // Check for explicit background color setting in iTerm
    if (process.env.TERM_SESSION_ID) {
      try {
        const profile = execSync(
          'osascript -e \'tell app "iTerm2" to tell current session of current window to get background color\'',
          { encoding: 'utf8', timeout: 1000 }
        );
        if (profile) {
          const rgb = profile.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / (255 * 3);
            return brightness < 0.5 ? 'dark' : 'light';
          }
        }
      } catch {}
    }

    // Check Apple Terminal
    if (termProgram === 'Apple_Terminal') {
      try {
        const bgColor = execSync(
          'osascript -e \'tell app "Terminal" to get background color of window 1\'',
          { encoding: 'utf8', timeout: 1000 }
        );
        if (bgColor) {
          const rgb = bgColor.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / (255 * 3);
            return brightness < 0.5 ? 'dark' : 'light';
          }
        }
      } catch {}
    }

    // Default to dark for unknown terminals (more common for developers)
    return 'dark';
  } catch (err) {
    logger.debug(`Background detection failed: ${err.message}`);
    return 'dark'; // Default to dark
  }
}

// Theme definitions
const themes = {
  default: {
    name: 'Default',
    colors: {
      // Borders
      border: {
        sessions: 'blue',
        logs: 'cyan',
        cpu: 'cyan',
        memory: 'magenta',
        gpu: 'yellow',
        network: 'brightCyan',
        disk: 'green',
        system: 'gray',
        uptime: 'brightMagenta',
        help: 'brightCyan',
        settings: 'brightCyan',
        modal: 'brightBlue'
      },
      // Text
      text: {
        primary: 'white',
        secondary: 'gray',
        bright: 'brightWhite',
        header: 'brightWhite'
      },
      // Status indicators
      status: {
        active: 'green',
        idle: 'yellow',
        stale: 'gray',
        error: 'red',
        warning: 'yellow',
        success: 'green'
      },
      // Gauges and values
      gauge: {
        low: 'green',
        medium: 'yellow',
        high: 'red',
        critical: 'brightRed'
      },
      // Charts
      chart: {
        line: 'cyan',
        fill: 'blue',
        grid: 'gray'
      },
      // Alerts
      alert: {
        info: 'cyan',
        warning: 'yellow',
        error: 'red',
        success: 'green'
      },
      // Logo and title
      branding: {
        logo: 'brightCyan',
        title: 'brightWhite',
        clock: 'brightCyan'
      },
      // Footer
      footer: {
        bg: 'black',
        fg: 'gray'
      }
    }
  },

  dark: {
    name: 'Dark',
    colors: {
      // Borders - muted tones
      border: {
        sessions: 'cyan',
        logs: 'blue',
        cpu: 'green',
        memory: 'magenta',
        gpu: 'yellow',
        network: 'cyan',
        disk: 'green',
        system: 'gray',
        uptime: 'magenta',
        help: 'cyan',
        settings: 'cyan',
        modal: 'cyan'
      },
      // Text
      text: {
        primary: 'white',
        secondary: 'black',
        bright: 'brightWhite',
        header: 'brightWhite'
      },
      // Status indicators
      status: {
        active: 'green',
        idle: 'yellow',
        stale: 'black',
        error: 'red',
        warning: 'yellow',
        success: 'green'
      },
      // Gauges and values
      gauge: {
        low: 'green',
        medium: 'yellow',
        high: 'red',
        critical: 'brightRed'
      },
      // Charts
      chart: {
        line: 'green',
        fill: 'cyan',
        grid: 'black'
      },
      // Alerts
      alert: {
        info: 'cyan',
        warning: 'yellow',
        error: 'red',
        success: 'green'
      },
      // Logo and title
      branding: {
        logo: 'green',
        title: 'brightGreen',
        clock: 'green'
      },
      // Footer
      footer: {
        bg: 'black',
        fg: 'green'
      }
    }
  },

  'high-contrast': {
    name: 'High Contrast',
    colors: {
      // Borders - bright on black
      border: {
        sessions: 'brightWhite',
        logs: 'brightWhite',
        cpu: 'brightWhite',
        memory: 'brightWhite',
        gpu: 'brightWhite',
        network: 'brightWhite',
        disk: 'brightWhite',
        system: 'brightWhite',
        uptime: 'brightWhite',
        help: 'brightWhite',
        settings: 'brightWhite',
        modal: 'brightWhite'
      },
      // Text
      text: {
        primary: 'white',
        secondary: 'brightWhite',
        bright: 'brightWhite',
        header: 'brightWhite'
      },
      // Status indicators
      status: {
        active: 'brightGreen',
        idle: 'brightYellow',
        stale: 'brightWhite',
        error: 'brightRed',
        warning: 'brightYellow',
        success: 'brightGreen'
      },
      // Gauges and values
      gauge: {
        low: 'brightGreen',
        medium: 'brightYellow',
        high: 'brightRed',
        critical: 'brightRed'
      },
      // Charts
      chart: {
        line: 'brightWhite',
        fill: 'brightWhite',
        grid: 'brightWhite'
      },
      // Alerts
      alert: {
        info: 'brightCyan',
        warning: 'brightYellow',
        error: 'brightRed',
        success: 'brightGreen'
      },
      // Logo and title
      branding: {
        logo: 'brightWhite',
        title: 'brightWhite',
        clock: 'brightWhite'
      },
      // Footer
      footer: {
        bg: 'white',
        fg: 'black'
      }
    }
  },

  ocean: {
    name: 'Ocean',
    colors: {
      // Borders - ocean blues
      border: {
        sessions: 'blue',
        logs: 'cyan',
        cpu: 'blue',
        memory: 'cyan',
        gpu: 'blue',
        network: 'cyan',
        disk: 'blue',
        system: 'cyan',
        uptime: 'blue',
        help: 'cyan',
        settings: 'cyan',
        modal: 'brightBlue'
      },
      // Text
      text: {
        primary: 'white',
        secondary: 'blue',
        bright: 'brightWhite',
        header: 'brightCyan'
      },
      // Status indicators
      status: {
        active: 'cyan',
        idle: 'blue',
        stale: 'gray',
        error: 'red',
        warning: 'yellow',
        success: 'green'
      },
      // Gauges and values
      gauge: {
        low: 'cyan',
        medium: 'blue',
        high: 'yellow',
        critical: 'red'
      },
      // Charts
      chart: {
        line: 'cyan',
        fill: 'blue',
        grid: 'blue'
      },
      // Alerts
      alert: {
        info: 'cyan',
        warning: 'yellow',
        error: 'red',
        success: 'green'
      },
      // Logo and title
      branding: {
        logo: 'cyan',
        title: 'brightCyan',
        clock: 'cyan'
      },
      // Footer
      footer: {
        bg: 'blue',
        fg: 'cyan'
      }
    }
  },

  // Auto-detect theme - resolves to dark or light based on terminal background
  auto: {
    name: 'Auto-detect',
    isAuto: true,
    colors: null // Will be resolved dynamically
  }
};

// Detected background state
let detectedBackground = null;

/**
 * Get the detected system/theme background
 * Uses system theme detection with terminal fallback
 * @returns {string} 'light' or 'dark'
 */
function getDetectedBackground() {
  if (!detectedBackground) {
    detectedBackground = detectSystemTheme();
    logger.info(`Theme background detected: ${detectedBackground}`);
  }
  return detectedBackground;
}

/**
 * Force re-detection of the system theme
 * Useful after system theme changes
 * @returns {string} Newly detected 'light' or 'dark'
 */
function refreshDetectedBackground() {
  const oldTheme = detectedBackground;
  detectedBackground = detectSystemTheme();
  if (oldTheme !== detectedBackground) {
    logger.info(`Theme background changed: ${oldTheme} -> ${detectedBackground}`);
  }
  return detectedBackground;
}

/**
 * Resolve auto theme to actual theme based on detection
 * @returns {object} Resolved theme object
 */
function resolveAutoTheme() {
  const background = getDetectedBackground();
  return background === 'light' ? themes.default : themes.dark;
}

// Current theme state
let currentThemeName = 'default';

/**
 * Get the current theme
 * @returns {object} Current theme object
 */
function getCurrentTheme() {
  if (currentThemeName === 'auto') {
    return resolveAutoTheme();
  }
  return themes[currentThemeName] || themes.default;
}

/**
 * Get current theme name
 * @returns {string} Current theme name
 */
function getThemeName() {
  return currentThemeName;
}

/**
 * Get theme by name
 * @param {string} name - Theme name
 * @returns {object} Theme object or null
 */
function getTheme(name) {
  if (name === 'auto') {
    return themes.auto;
  }
  return themes[name] || null;
}

/**
 * Get all available theme names
 * @returns {string[]} Array of theme names
 */
function getThemeNames() {
  return Object.keys(themes);
}

/**
 * Set the current theme
 * @param {string} name - Theme name to set
 * @returns {boolean} Success
 */
function setTheme(name) {
  if (!themes[name]) {
    logger.warn(`Theme '${name}' not found, keeping current theme`);
    return false;
  }
  currentThemeName = name;
  const displayName = name === 'auto' ? `Auto-detect (${getDetectedBackground()})` : themes[name].name;
  logger.info(`Theme changed to: ${displayName}`);
  return true;
}

/**
 * Cycle to the next theme
 * @returns {string} New theme name
 */
function cycleTheme() {
  const themeNames = Object.keys(themes);
  const currentIndex = themeNames.indexOf(currentThemeName);
  const nextIndex = (currentIndex + 1) % themeNames.length;
  currentThemeName = themeNames[nextIndex];
  const displayName = currentThemeName === 'auto' ? `Auto-detect (${getDetectedBackground()})` : themes[currentThemeName].name;
  logger.info(`Theme cycled to: ${displayName}`);
  return currentThemeName;
}

/**
 * Load saved theme from settings
 */
function loadTheme() {
  try {
    const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
    const settings = JSON.parse(data);
    if (settings[THEME_KEY] && themes[settings[THEME_KEY]]) {
      currentThemeName = settings[THEME_KEY];
      if (currentThemeName === 'auto') {
        const bg = getDetectedBackground();
        logger.info(`Loaded theme: Auto-detect (${bg} background)`);
      } else {
        logger.info(`Loaded theme: ${themes[currentThemeName].name}`);
      }
    }
  } catch {
    // File doesn't exist or invalid JSON - use default
  }
}

/**
 * Save current theme to settings
 */
function saveTheme() {
  try {
    let settings = {};
    try {
      const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
      settings = JSON.parse(data);
    } catch {}
    
    settings[THEME_KEY] = currentThemeName;
    
    const dir = process.env.HOME + '/.openclaw';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  } catch (err) {
    logger.warn(`Failed to save theme: ${err.message}`);
  }
}

/**
 * Get a color from the current theme
 * @param {string} category - Color category (border, text, status, gauge, chart, alert, branding, footer)
 * @param {string} key - Key within the category
 * @returns {string} Color value
 */
function getColor(category, key) {
  const theme = getCurrentTheme();
  if (theme.colors[category] && theme.colors[category][key]) {
    return theme.colors[category][key];
  }
  // Fallback to default theme
  if (themes.default.colors[category] && themes.default.colors[category][key]) {
    return themes.default.colors[category][key];
  }
  return 'white';
}

export default themes;
export {
  themes,
  getCurrentTheme,
  getThemeName,
  getTheme,
  getThemeNames,
  setTheme,
  cycleTheme,
  getColor,
  loadTheme,
  saveTheme,
  getDetectedBackground,
  refreshDetectedBackground,
  detectSystemTheme,
  startSystemThemeWatcher,
  onThemeChange,
  startAutoThemeDetection,
  stopAutoThemeDetection
};
