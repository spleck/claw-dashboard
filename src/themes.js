/**
 * Theme definitions for the Claw Dashboard
 * Contains multiple color themes for borders, text, gauges, charts, and alerts
 */

import logger from './logger.js';

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
  }
};

// Current theme state
let currentThemeName = 'default';

/**
 * Get the current theme
 * @returns {object} Current theme object
 */
function getCurrentTheme() {
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
  logger.info(`Theme changed to: ${themes[name].name}`);
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
  logger.info(`Theme cycled to: ${themes[currentThemeName].name}`);
  return currentThemeName;
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
  getColor
};
