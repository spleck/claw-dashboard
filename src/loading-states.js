/**
 * Animated Loading States Module
 * Provides spinners, progress indicators, and animated transitions
 * for widget loading, data fetching, and initialization states
 */

import logger from './logger.js';
import { getCurrentTheme } from './themes.js';

/**
 * Spinner frame sets for different animation styles
 */
const SPINNER_FRAMES = {
  dots: {
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    interval: 80
  },
  line: {
    frames: ['-', '\\', '|', '/'],
    interval: 100
  },
  pulse: {
    frames: ['○', '◔', '◑', '◕', '●', '◕', '◑', '◔'],
    interval: 100
  },
  blocks: {
    frames: ['▁', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃'],
    interval: 80
  },
  arrows: {
    frames: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
    interval: 100
  },
  bouncing: {
    frames: ['( ●    )', '(  ●   )', '(   ●  )', '(    ● )', '(     ●)', '(    ● )', '(   ●  )', '(  ●   )', '( ●    )', '(●     )'],
    interval: 80
  }
};

/**
 * Progress bar styles
 */
const PROGRESS_STYLES = {
  blocks: ['░', '▒', '▓', '█'],
  bars: [' ', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'],
  ascii: [' ', '=', '=','=','=','=','=','=','#'],
  dots: [' ', '·', '∙', '●'],
  minimal: ['○', '◐', '◑', '●']
};

/**
 * Loading state manager for tracking active loading operations
 */
class LoadingStateManager {
  constructor() {
    this.activeStates = new Map();
    this.globalSpinner = null;
    this.animationFrameId = null;
  }

  /**
   * Create a new loading state
   * @param {string} id - Unique identifier for this loading state
   * @param {Object} options - Loading state options
   * @param {string} options.type - Type: 'spinner', 'progress', 'pulse', 'custom'
   * @param {string} options.message - Loading message to display
   * @param {string} options.style - Spinner/progress style name
   * @param {number} options.total - Total for progress bars
   * @returns {Object} Loading state controller
   */
  create(id, options = {}) {
    const {
      type = 'spinner',
      message = 'Loading...',
      style = 'dots',
      total = 100
    } = options;

    const state = {
      id,
      type,
      message,
      style,
      total,
      current: 0,
      frames: SPINNER_FRAMES[style]?.frames || SPINNER_FRAMES.dots.frames,
      frameIndex: 0,
      interval: SPINNER_FRAMES[style]?.interval || 80,
      startTime: Date.now(),
      timerId: null,
      listeners: new Set(),
      isComplete: false
    };

    this.activeStates.set(id, state);

    // Start animation
    if (type === 'spinner') {
      this._startSpinnerAnimation(state);
    }

    logger.debug(`Loading state created: ${id} (${type})`);

    return {
      id,
      update: (newMessage) => this.updateMessage(id, newMessage),
      progress: (current, newTotal) => this.updateProgress(id, current, newTotal),
      complete: (finalMessage) => this.complete(id, finalMessage),
      onUpdate: (callback) => this._addListener(id, callback),
      getFrame: () => this._getCurrentFrame(state),
      elapsed: () => Date.now() - state.startTime
    };
  }

  /**
   * Start spinner animation timer
   * @private
   */
  _startSpinnerAnimation(state) {
    state.timerId = setInterval(() => {
      state.frameIndex = (state.frameIndex + 1) % state.frames.length;
      this._notifyListeners(state);
    }, state.interval);
  }

  /**
   * Get current spinner frame
   * @private
   */
  _getCurrentFrame(state) {
    const theme = getCurrentTheme();
    const colors = theme.colors;
    const frame = state.frames[state.frameIndex];

    if (state.type === 'progress') {
      return this._renderProgressBar(state, colors);
    }

    // Return formatted spinner with message
    return {
      frame,
      message: state.message,
      elapsed: this._formatElapsed(Date.now() - state.startTime),
      color: colors.branding.logo
    };
  }

  /**
   * Render progress bar
   * @private
   */
  _renderProgressBar(state, colors) {
    const { bars } = PROGRESS_STYLES;
    const percentage = Math.min(100, Math.max(0, (state.current / state.total) * 100));
    const filledLength = Math.floor((percentage / 100) * bars.length);

    const filled = bars[bars.length - 1].repeat(filledLength);
    const empty = bars[0].repeat(bars.length - filledLength);

    return {
      bar: `[${filled}${empty}]`,
      percentage: percentage.toFixed(1),
      current: state.current,
      total: state.total,
      message: state.message,
      color: percentage < 30 ? colors.gauge.low :
             percentage < 70 ? colors.gauge.medium :
             percentage < 90 ? colors.gauge.high : colors.gauge.critical
    };
  }

  /**
   * Format elapsed time
   * @private
   */
  _formatElapsed(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(0);
    return `${mins}m ${secs}s`;
  }

  /**
   * Add update listener
   * @private
   */
  _addListener(id, callback) {
    const state = this.activeStates.get(id);
    if (state) {
      state.listeners.add(callback);
      return () => state.listeners.delete(callback);
    }
    return () => {};
  }

  /**
   * Notify all listeners of state update
   * @private
   */
  _notifyListeners(state) {
    const frame = this._getCurrentFrame(state);
    state.listeners.forEach(callback => {
      try {
        callback(frame, state);
      } catch (err) {
        logger.debug(`Loading state listener error: ${err.message}`);
      }
    });
  }

  /**
   * Update loading message
   * @param {string} id - Loading state ID
   * @param {string} newMessage - New message to display
   */
  updateMessage(id, newMessage) {
    const state = this.activeStates.get(id);
    if (state) {
      state.message = newMessage;
      this._notifyListeners(state);
    }
  }

  /**
   * Update progress bar
   * @param {string} id - Loading state ID
   * @param {number} current - Current progress value
   * @param {number} newTotal - Optional new total
   */
  updateProgress(id, current, newTotal) {
    const state = this.activeStates.get(id);
    if (state) {
      state.current = current;
      if (newTotal !== undefined) state.total = newTotal;
      this._notifyListeners(state);
    }
  }

  /**
   * Mark loading state as complete
   * @param {string} id - Loading state ID
   * @param {string} finalMessage - Optional final message
   */
  complete(id, finalMessage) {
    const state = this.activeStates.get(id);
    if (state) {
      state.isComplete = true;
      if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
      if (finalMessage) {
        state.message = finalMessage;
      }
      this._notifyListeners(state);
      logger.debug(`Loading state completed: ${id} (${this._formatElapsed(Date.now() - state.startTime)})`);
    }
  }

  /**
   * Remove a loading state
   * @param {string} id - Loading state ID
   */
  remove(id) {
    const state = this.activeStates.get(id);
    if (state) {
      if (state.timerId) {
        clearInterval(state.timerId);
      }
      this.activeStates.delete(id);
      logger.debug(`Loading state removed: ${id}`);
    }
  }

  /**
   * Get all active loading states
   * @returns {Array} Array of active state IDs
   */
  getActive() {
    return Array.from(this.activeStates.keys());
  }

  /**
   * Clear all loading states
   */
  clearAll() {
    for (const [id, state] of this.activeStates) {
      if (state.timerId) {
        clearInterval(state.timerId);
      }
    }
    this.activeStates.clear();
    logger.debug('All loading states cleared');
  }
}

// Create singleton instance
const loadingStates = new LoadingStateManager();

/**
 * Create a loading spinner for widget initialization
 * @param {string} widgetName - Name of the widget being loaded
 * @param {Object} blessed - Blessed library instance
 * @param {Object} parent - Parent element
 * @returns {Object} Spinner controller with attach/detach methods
 */
export function createWidgetSpinner(widgetName, blessed, parent) {
  const state = loadingStates.create(`widget:${widgetName}`, {
    type: 'spinner',
    message: `Loading ${widgetName}...`,
    style: 'dots'
  });

  let spinnerElement = null;

  const controller = {
    /**
     * Attach spinner to UI
     * @param {Object} options - Position options
     */
    attach(options = {}) {
      const theme = getCurrentTheme();
      const { top = 'center', left = 'center', width = 30, height = 3 } = options;

      spinnerElement = blessed.box({
        parent,
        top,
        left,
        width,
        height,
        content: `{center}${state.getFrame().frame} ${state.message}{/center}`,
        tags: true,
        style: {
          fg: theme.colors.branding.logo,
          bg: theme.colors.footer.bg
        },
        border: {
          type: 'line',
          fg: theme.colors.border.modal
        }
      });

      // Subscribe to updates
      state.onUpdate((frame) => {
        if (spinnerElement && !spinnerElement.destroyed) {
          spinnerElement.setContent(`{center}${frame.frame} ${frame.message}{/center}`);
          spinnerElement.style.fg = frame.color;
        }
      });

      parent.screen.render();
      return controller;
    },

    /**
     * Update spinner message
     * @param {string} message - New message
     */
    update(message) {
      state.update(message);
      return controller;
    },

    /**
     * Complete and remove spinner
     * @param {string} finalMessage - Optional final message
     */
    complete(finalMessage) {
      state.complete(finalMessage);
      if (spinnerElement) {
        if (finalMessage) {
          spinnerElement.setContent(`{center}✓ ${finalMessage}{/center}`);
          spinnerElement.style.fg = 'green';
          parent.screen.render();
          // Auto-remove after delay
          setTimeout(() => controller.detach(), 500);
        } else {
          controller.detach();
        }
      }
      return controller;
    },

    /**
     * Detach and destroy spinner
     */
    detach() {
      if (spinnerElement) {
        spinnerElement.destroy();
        spinnerElement = null;
        parent.screen.render();
      }
      loadingStates.remove(state.id);
      return controller;
    }
  };

  return controller;
}

/**
 * Create a progress bar for data fetching operations
 * @param {string} operationName - Name of the operation
 * @param {number} total - Total items to process
 * @returns {Object} Progress controller
 */
export function createProgressBar(operationName, total = 100) {
  return loadingStates.create(`progress:${operationName}`, {
    type: 'progress',
    message: operationName,
    style: 'blocks',
    total
  });
}

/**
 * Create a sequential loading animation for multiple items
 * @param {Array} items - Array of items to load
 * @param {Function} loader - Async function to load each item
 * @param {Object} options - Options
 * @returns {Promise<Array>} Results from all loaders
 */
export async function loadSequentially(items, loader, options = {}) {
  const { onProgress, onItemComplete, delay = 0 } = options;
  const results = [];

  const state = loadingStates.create('sequential', {
    type: 'progress',
    message: 'Loading...',
    total: items.length
  });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    state.update(`Loading ${item.name || item.id || item}...`);
    state.progress(i);

    try {
      const result = await loader(item, i);
      results.push({ success: true, result, item, index: i });
      if (onItemComplete) {
        onItemComplete(item, result, i);
      }
    } catch (err) {
      results.push({ success: false, error: err, item, index: i });
      logger.warn(`Failed to load item ${i}: ${err.message}`);
    }

    if (onProgress) {
      onProgress(i + 1, items.length, item);
    }

    if (delay > 0 && i < items.length - 1) {
      await new Promise(r => setTimeout(r, delay));
    }
  }

  state.progress(items.length, items.length);
  state.complete('Complete');
  loadingStates.remove('sequential');

  return results;
}

/**
 * Create a staggered loading animation for multiple widgets
 * @param {Array} widgets - Array of widget configurations
 * @param {Function} factory - Widget factory function
 * @param {Object} options - Options
 * @returns {Promise<Array>} Created widgets
 */
export async function loadStaggered(widgets, factory, options = {}) {
  const { staggerDelay = 100, onWidgetLoaded } = options;

  return loadSequentially(widgets, async (widgetConfig, index) => {
    await new Promise(r => setTimeout(r, staggerDelay * index));
    const widget = await factory(widgetConfig);
    if (onWidgetLoaded) {
      onWidgetLoaded(widget, widgetConfig, index);
    }
    return widget;
  }, options);
}

/**
 * Get a simple spinner animation frame
 * @param {string} style - Spinner style name
 * @param {number} frame - Frame index (auto-increments if not provided)
 * @returns {string} Spinner character
 */
export function getSpinnerFrame(style = 'dots', frame) {
  const spinner = SPINNER_FRAMES[style] || SPINNER_FRAMES.dots;
  if (frame === undefined) {
    frame = Math.floor(Date.now() / spinner.interval) % spinner.frames.length;
  }
  return spinner.frames[frame % spinner.frames.length];
}

/**
 * Get all available spinner styles
 * @returns {Array} Array of style names
 */
export function getSpinnerStyles() {
  return Object.keys(SPINNER_FRAMES);
}

export default loadingStates;
export { SPINNER_FRAMES, PROGRESS_STYLES, LoadingStateManager };
