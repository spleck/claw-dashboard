/**
 * Theme definitions for the Claw Dashboard
 * Contains multiple color themes for borders, text, gauges, charts, and alerts
 */

import logger from './logger.js';
import fs from 'fs';
import { execSync } from 'child_process';

// Settings path for theme persistence
const SETTINGS_PATH = process.env.HOME + '/.openclaw/dashboard-settings.json';
const THEME_KEY = 'theme';

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
 * Get the detected terminal background
 * @returns {string} 'light' or 'dark'
 */
function getDetectedBackground() {
  if (!detectedBackground) {
    detectedBackground = detectTerminalBackground();
    logger.info(`Terminal background detected: ${detectedBackground}`);
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
  getDetectedBackground
};
