import blessed from 'blessed';

import config from './config.js';
import logger from './logger.js';

const { PATHS, DASHBOARD_VERSION } = config;

// Hint definitions with contextual information for first-time users
const HINTS = [
  {
    id: 'navigation',
    title: '📋 Navigation Tips',
    content: [
      'Use ↑/↓ arrows to navigate sessions',
      'Use h/l or ←/→ to change pages',
      'Press Enter to select a session',
      'Press / to search sessions',
    ],
    position: { top: 'center', left: 'center' },
  },
  {
    id: 'vi-mode',
    title: '⌨️  Vi-Mode Navigation',
    content: [
      'h / l : Previous/next page',
      'j / k : Select next/previous session',
      'g / G : Go to first/last page',
      'Ctrl+B / Ctrl+F : Page up/down',
    ],
    position: { top: 'center', left: 'center' },
  },
  {
    id: 'bookmarks',
    title: '⭐ Bookmarks & Favorites',
    content: [
      "Press 'f' to toggle favorite on current session",
      "Press 'F' to filter/show favorites only",
      'Favorites persist across restarts',
      'Access them quickly with the F filter',
    ],
    position: { top: 'center', left: 'center' },
  },
  {
    id: 'widgets',
    title: '📊 Widget Controls',
    content: [
      'Use number keys 1-7 to toggle widgets',
      'Tab to cycle through widgets',
      'Resize terminal to adjust layout',
      'Widgets auto-refresh with live data',
    ],
    position: { top: 'center', left: 'center' },
  },
  {
    id: 'actions',
    title: '⚡ Quick Actions',
    content: [
      'r : Refresh data immediately',
      's : Change sort mode',
      'e : Export session data',
      'd : View session details',
      'q : Quit dashboard',
    ],
    position: { top: 'center', left: 'center' },
  },
];

// Store dismissed hints per session
let dismissedHints = new Set();
let currentHintIndex = 0;
let hintOverlay = null;
let screenRef = null;

/**
 * Check if hints should be shown (first run or explicit request)
 * @param {Object} settings - Current dashboard settings
 * @returns {boolean} - True if hints should be displayed
 */
export function shouldShowHints(settings) {
  return settings?.firstRun === true;
}

/**
 * Mark first run as complete in settings
 * @param {Object} settings - Current settings object
 * @param {Function} saveSettingsFn - Function to save settings
 */
export function markFirstRunComplete(settings, saveSettingsFn) {
  if (settings && settings.firstRun) {
    settings.firstRun = false;
    if (typeof saveSettingsFn === 'function') {
      saveSettingsFn(settings);
      logger.info('First run hints marked as complete');
    }
  }
}

/**
 * Create a styled hint box with navigation controls
 * @param {blessed.Screen} screen - The blessed screen
 * @param {Object} hint - Hint configuration object
 * @param {number} index - Current hint index
 * @param {number} total - Total number of hints
 * @returns {blessed.Box} - The hint box element
 */
function createHintBox(screen, hint, index, total) {
  const width = 50;
  const height = 14;

  // Main container
  const container = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: width,
    height: height,
    border: { type: 'line', fg: 'brightCyan' },
    style: {
      bg: 'black',
      border: { fg: 'brightCyan' },
    },
    tags: true,
    shadow: true,
  });

  // Title bar
  blessed.text({
    parent: container,
    top: 0,
    left: 'center',
    width: width - 2,
    content: ` {bold}${hint.title}{/bold} `,
    style: {
      fg: 'brightCyan',
      bg: 'black',
    },
    tags: true,
  });

  // Separator line
  blessed.line({
    parent: container,
    top: 2,
    left: 1,
    right: 1,
    orientation: 'horizontal',
    style: { fg: 'dim' },
  });

  // Hint content
  let contentY = 3;
  hint.content.forEach((line) => {
    blessed.text({
      parent: container,
      top: contentY++,
      left: 2,
      width: width - 4,
      content: `  ${line}`,
      style: {
        fg: 'white',
        bg: 'black',
      },
    });
  });

  // Footer separator
  blessed.line({
    parent: container,
    top: height - 4,
    left: 1,
    right: 1,
    orientation: 'horizontal',
    style: { fg: 'dim' },
  });

  // Navigation help at bottom
  const navText = index < total - 1
    ? ' {bold}n{/bold}: Next  {bold}q{/bold}: Skip all'
    : ' {bold}q{/bold}: Close hints  {bold}r{/bold}: Show again later';

  blessed.text({
    parent: container,
    top: height - 3,
    left: 'center',
    width: width - 2,
    content: navText,
    style: {
      fg: 'gray',
      bg: 'black',
    },
    tags: true,
  });

  // Progress indicator
  const progress = ` (${index + 1}/${total})`;
  blessed.text({
    parent: container,
    top: height - 2,
    left: 'center',
    content: progress,
    style: {
      fg: 'dim',
      bg: 'black',
    },
  });

  return container;
}

/**
 * Show the next hint in sequence
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {boolean} - True if hint was shown, false if no more hints
 */
function showNextHint(screen) {
  // Clean up previous hint
  if (hintOverlay) {
    hintOverlay.destroy();
    hintOverlay = null;
  }

  // Check if we've shown all hints
  if (currentHintIndex >= HINTS.length) {
    return false;
  }

  const hint = HINTS[currentHintIndex];
  hintOverlay = createHintBox(screen, hint, currentHintIndex, HINTS.length);
  screen.render();

  return true;
}

/**
 * Display first-run hint tooltips
 * @param {blessed.Screen} screen - The blessed screen
 * @param {Object} settings - Current settings
 * @param {Function} saveSettingsFn - Function to save settings
 * @returns {Promise<void>} - Resolves when all hints are dismissed
 */
export async function showFirstRunHints(screen, settings, saveSettingsFn) {
  if (!shouldShowHints(settings)) {
    return;
  }

  screenRef = screen;
  currentHintIndex = 0;
  dismissedHints.clear();

  return new Promise((resolve) => {
    // Show first hint
    showNextHint(screen);

    // Set up key handlers for hint navigation
    const keyHandler = (ch, key) => {
      // 'n' or right arrow for next hint
      if (ch === 'n' || ch === ' ' || key.name === 'right') {
        currentHintIndex++;
        if (!showNextHint(screen)) {
          // No more hints, clean up
          if (hintOverlay) {
            hintOverlay.destroy();
            hintOverlay = null;
          }
          screen.removeListener('keypress', keyHandler);
          markFirstRunComplete(settings, saveSettingsFn);
          screen.render();
          resolve();
        }
      }

      // 'q' or Escape to skip/close
      if (ch === 'q' || key.name === 'escape') {
        if (hintOverlay) {
          hintOverlay.destroy();
          hintOverlay = null;
        }
        screen.removeListener('keypress', keyHandler);
        markFirstRunComplete(settings, saveSettingsFn);
        screen.render();
        resolve();
      }

      // 'r' to reset hints (shown on last hint)
      if (ch === 'r' && currentHintIndex >= HINTS.length - 1) {
        settings.firstRun = true;
        if (typeof saveSettingsFn === 'function') {
          saveSettingsFn(settings);
        }
        if (hintOverlay) {
          hintOverlay.destroy();
          hintOverlay = null;
        }
        screen.removeListener('keypress', keyHandler);
        screen.render();
        resolve();
      }
    };

    screen.on('keypress', keyHandler);
  });
}

/**
 * Manually trigger hint display (for help menu)
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {Promise<void>}
 */
export async function showHintsManual(screen) {
  screenRef = screen;
  currentHintIndex = 0;
  dismissedHints.clear();

  return new Promise((resolve) => {
    showNextHint(screen);

    const keyHandler = (ch, key) => {
      if (ch === 'n' || ch === ' ' || key.name === 'right') {
        currentHintIndex++;
        if (!showNextHint(screen)) {
          if (hintOverlay) {
            hintOverlay.destroy();
            hintOverlay = null;
          }
          screen.removeListener('keypress', keyHandler);
          screen.render();
          resolve();
        }
      }

      if (ch === 'q' || key.name === 'escape' || ch === 'h') {
        if (hintOverlay) {
          hintOverlay.destroy();
          hintOverlay = null;
        }
        screen.removeListener('keypress', keyHandler);
        screen.render();
        resolve();
      }
    };

    screen.on('keypress', keyHandler);
  });
}

/**
 * Dismiss any active hint overlay
 */
export function dismissActiveHint() {
  if (hintOverlay) {
    hintOverlay.destroy();
    hintOverlay = null;
  }
}

/**
 * Check if hints are currently being displayed
 * @returns {boolean}
 */
export function isShowingHints() {
  return hintOverlay !== null;
}

export default {
  shouldShowHints,
  showFirstRunHints,
  showHintsManual,
  markFirstRunComplete,
  dismissActiveHint,
  isShowingHints,
};
