/**
 * Theme Selector UI Module
 * Provides an interactive theme selection interface with live preview
 */

import logger from './logger.js';
import {
  getThemeNames,
  getTheme,
  getCurrentTheme,
  getThemeName,
  setTheme,
  saveTheme,
  onThemeChange
} from './themes.js';

/**
 * Theme preview card dimensions and layout
 */
const PREVIEW_CARD = {
  width: 28,
  height: 14,
  margin: 2
};

/**
 * Sample content for theme preview
 * Shows various UI elements that demonstrate the theme
 */
const PREVIEW_SAMPLES = {
  header: 'Theme Preview',
  border: '─'.repeat(24),
  textSample: 'Aa Bb Cc 123',
  statusActive: '● Active',
  statusIdle: '○ Idle',
  gauge: '████░░░░░░ 40%',
  chart: '▁▂▃▄▅▆▇█'
};

/**
 * Create theme selector modal
 * @param {blessed.Screen} screen - Blessed screen instance
 * @param {Object} blessed - Blessed library
 * @param {Function} onClose - Callback when modal closes
 * @returns {Object} Theme selector controller
 */
export function createThemeSelector(screen, blessed, onClose) {
  const themeNames = getThemeNames();
  const currentThemeName = getThemeName();
  let selectedIndex = themeNames.indexOf(currentThemeName);
  if (selectedIndex === -1) selectedIndex = 0;

  let modalBox = null;
  let previewBoxes = [];
  let infoText = null;
  let helpText = null;
  let unsubscribeThemeChange = null;

  /**
   * Apply color to blessed element from theme
   */
  function applyThemeColor(element, color, isBg = false) {
    if (isBg) {
      element.style.bg = color;
    } else {
      element.style.fg = color;
    }
  }

  /**
   * Render theme preview content with colors
   */
  function renderPreviewContent(theme, blessed) {
    const colors = theme.colors;
    return [
      `{${colors.branding.title}-fg}{bold}${PREVIEW_SAMPLES.header}{/bold}{/${colors.branding.title}-fg}`,
      `{${colors.border.cpu}-fg}${PREVIEW_SAMPLES.border}{/${colors.border.cpu}-fg}`,
      '',
      ` {${colors.text.primary}-fg}${PREVIEW_SAMPLES.textSample}{/${colors.text.primary}-fg}`,
      '',
      ` {${colors.status.active}-fg}${PREVIEW_SAMPLES.statusActive}{/${colors.status.active}-fg}`,
      ` {${colors.status.idle}-fg}${PREVIEW_SAMPLES.statusIdle}{/${colors.status.idle}-fg}`,
      '',
      ` {${colors.gauge.medium}-fg}${PREVIEW_SAMPLES.gauge}{/${colors.gauge.medium}-fg}`,
      '',
      ` {${colors.chart.line}-fg}${PREVIEW_SAMPLES.chart}{/${colors.chart.line}-fg}`,
      '',
      `{center}{${colors.text.secondary}-fg}${theme.name}{/${colors.text.secondary}-fg}{/center}`
    ].join('\n');
  }

  /**
   * Create the theme selector modal
   */
  function createModal() {
    const screenWidth = screen.width;
    const screenHeight = screen.height;

    // Calculate layout
    const cardsPerRow = Math.min(3, themeNames.length);
    const modalWidth = (PREVIEW_CARD.width + PREVIEW_CARD.margin) * cardsPerRow + 4;
    const rows = Math.ceil(themeNames.length / cardsPerRow);
    const modalHeight = PREVIEW_CARD.height * rows + 8;

    // Main modal container
    modalBox = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: Math.min(modalWidth, screenWidth - 4),
      height: Math.min(modalHeight, screenHeight - 4),
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        bg: 'black'
      },
      tags: true,
      label: ' {bold}Theme Selector{/bold} ',
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        style: { bg: 'cyan' }
      }
    });

    // Title
    blessed.text({
      parent: modalBox,
      top: 1,
      left: 'center',
      width: modalWidth - 4,
      content: '{center}Select a theme with arrow keys, press Enter to apply{/center}',
      style: { fg: 'white' },
      tags: true
    });

    // Create preview cards for each theme
    themeNames.forEach((themeName, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const theme = themeName === 'auto' ? getCurrentTheme() : getTheme(themeName);
      const isSelected = index === selectedIndex;
      const isCurrent = themeName === currentThemeName;

      const left = 2 + col * (PREVIEW_CARD.width + PREVIEW_CARD.margin);
      const top = 3 + row * PREVIEW_CARD.height;

      // Card container
      const card = blessed.box({
        parent: modalBox,
        top,
        left,
        width: PREVIEW_CARD.width,
        height: PREVIEW_CARD.height,
        border: {
          type: 'line',
          fg: isSelected ? 'brightCyan' : 'gray'
        },
        style: {
          bg: isSelected ? 'brightBlack' : 'black',
          border: {
            fg: isSelected ? 'brightCyan' : 'gray'
          }
        },
        tags: true,
        content: renderPreviewContent(theme, blessed)
      });

      // Selection indicator
      if (isCurrent) {
        blessed.text({
          parent: card,
          top: 0,
          right: 0,
          content: '●',
          style: { fg: 'green' }
        });
      }

      previewBoxes.push({ box: card, themeName, index });
    });

    // Info text
    infoText = blessed.text({
      parent: modalBox,
      bottom: 2,
      left: 'center',
      width: modalWidth - 4,
      content: getInfoText(),
      style: { fg: 'gray' },
      tags: true
    });

    // Help text
    helpText = blessed.text({
      parent: modalBox,
      bottom: 1,
      left: 'center',
      width: modalWidth - 4,
      content: '{center}↑/↓/←/→: Navigate  Enter: Apply  t: Cycle themes  q/Esc: Close{/center}',
      style: { fg: 'gray' },
      tags: true
    });

    screen.render();
  }

  /**
   * Get info text for current selection
   */
  function getInfoText() {
    const themeName = themeNames[selectedIndex];
    const theme = getTheme(themeName);
    if (themeName === 'auto') {
      const detected = getCurrentTheme();
      return `{center}Auto-detect → ${detected.name} (currently selected: ${currentThemeName}){/center}`;
    }
    return `{center}${theme.name}${themeName === currentThemeName ? ' (current)' : ''}{/center}`;
  }

  /**
   * Update selection highlighting
   */
  function updateSelection() {
    previewBoxes.forEach(({ box, index }) => {
      const isSelected = index === selectedIndex;
      const isCurrent = themeNames[index] === currentThemeName;

      box.style.bg = isSelected ? 'brightBlack' : 'black';
      box.style.border.fg = isSelected ? 'brightCyan' : 'gray';
    });

    if (infoText) {
      infoText.setContent(getInfoText());
    }

    screen.render();
  }

  /**
   * Navigate selection
   */
  function navigate(delta) {
    const cardsPerRow = Math.min(3, themeNames.length);
    const rows = Math.ceil(themeNames.length / cardsPerRow);

    if (delta === -cardsPerRow && selectedIndex - cardsPerRow >= 0) {
      // Move up
      selectedIndex -= cardsPerRow;
    } else if (delta === cardsPerRow && selectedIndex + cardsPerRow < themeNames.length) {
      // Move down
      selectedIndex += cardsPerRow;
    } else if (delta === -1 && selectedIndex % cardsPerRow > 0) {
      // Move left
      selectedIndex--;
    } else if (delta === 1 && (selectedIndex + 1) % cardsPerRow !== 0 && selectedIndex + 1 < themeNames.length) {
      // Move right
      selectedIndex++;
    }

    updateSelection();
  }

  /**
   * Apply selected theme
   */
  function applySelectedTheme() {
    const themeName = themeNames[selectedIndex];
    if (themeName !== currentThemeName) {
      setTheme(themeName);
      saveTheme();
      logger.info(`Theme changed to: ${themeName}`);
    }
    close();
  }

  /**
   * Cycle to next theme (quick switch)
   */
  function cycleThemeQuick() {
    selectedIndex = (selectedIndex + 1) % themeNames.length;
    const themeName = themeNames[selectedIndex];
    setTheme(themeName);
    saveTheme();
    updateSelection();

    // Update all preview cards to show current selection
    previewBoxes.forEach(({ box, index }) => {
      const isCurrent = themeNames[index] === themeName;
      // Re-render with updated selection
      const theme = themeNames[index] === 'auto' ? getCurrentTheme() : getTheme(themeNames[index]);
      box.setContent(renderPreviewContent(theme, blessed));
    });

    screen.render();
  }

  /**
   * Close the modal
   */
  function close() {
    if (unsubscribeThemeChange) {
      unsubscribeThemeChange();
    }

    if (modalBox) {
      modalBox.destroy();
      modalBox = null;
    }

    previewBoxes = [];

    if (onClose) {
      onClose();
    }

    screen.render();
  }

  /**
   * Handle key events
   */
  function handleKey(ch, key) {
    // Navigation
    if (key.name === 'up') navigate(-3);
    else if (key.name === 'down') navigate(3);
    else if (key.name === 'left') navigate(-1);
    else if (key.name === 'right') navigate(1);
    else if (key.name === 'return') applySelectedTheme();
    else if (ch === 't') cycleThemeQuick();
    else if (ch === 'q' || key.name === 'escape') close();
  }

  // Create the modal
  createModal();

  // Listen for theme changes from elsewhere
  unsubscribeThemeChange = onThemeChange(() => {
    // Refresh previews if theme changes externally
    previewBoxes.forEach(({ box, index }) => {
      const theme = themeNames[index] === 'auto' ? getCurrentTheme() : getTheme(themeNames[index]);
      box.setContent(renderPreviewContent(theme, blessed));
    });
    screen.render();
  });

  return {
    handleKey,
    close,
    isActive: () => modalBox !== null
  };
}

/**
 * Show theme selector as a modal overlay
 * @param {blessed.Screen} screen - Blessed screen instance
 * @param {Object} blessed - Blessed library
 * @param {Function} onThemeApplied - Callback when theme is applied
 * @returns {Promise<void>}
 */
export async function showThemeSelector(screen, blessed, onThemeApplied) {
  return new Promise((resolve) => {
    const selector = createThemeSelector(screen, blessed, () => {
      screen.removeListener('keypress', keyHandler);
      if (onThemeApplied) {
        onThemeApplied();
      }
      resolve();
    });

    function keyHandler(ch, key) {
      selector.handleKey(ch, key);
    }

    screen.on('keypress', keyHandler);
  });
}

/**
 * Get theme info for display
 * @param {string} themeName - Theme name
 * @returns {Object} Theme info object
 */
export function getThemeInfo(themeName) {
  const theme = getTheme(themeName);
  const current = getThemeName();

  return {
    name: themeName,
    displayName: theme?.name || themeName,
    isCurrent: themeName === current,
    isAuto: themeName === 'auto',
    colors: theme?.colors ? Object.keys(theme.colors) : []
  };
}

/**
 * Get all themes info
 * @returns {Array} Array of theme info objects
 */
export function getAllThemesInfo() {
  return getThemeNames().map(name => getThemeInfo(name));
}

export default {
  createThemeSelector,
  showThemeSelector,
  getThemeInfo,
  getAllThemesInfo
};
