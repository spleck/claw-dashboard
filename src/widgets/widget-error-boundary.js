/**
 * Widget Error Boundary Module
 * Provides visual error boundaries for widgets with retry functionality
 * Wraps widgets to catch errors and display user-friendly error UI
 */

import blessed from 'blessed';
import logger from '../logger.js';
import {
  WidgetErrorIsolator,
  WidgetHealthStatus,
  WidgetErrorType,
} from './widget-error-isolation.js';

/**
 * Error state visual styles
 */
export const ErrorStyles = {
  CONTAINER: {
    border: { type: 'line' },
    style: {
      border: { fg: 'red' },
      bg: 'black',
    },
  },
  TITLE: {
    fg: 'red',
    bold: true,
  },
  MESSAGE: {
    fg: 'white',
    bg: 'black',
  },
  ERROR_DETAIL: {
    fg: 'gray',
    bg: 'black',
  },
  RETRY_BUTTON: {
    fg: 'black',
    bg: 'green',
    bold: true,
  },
  RETRY_BUTTON_FOCUSED: {
    fg: 'black',
    bg: 'bright-green',
    bold: true,
  },
  DISMISS_BUTTON: {
    fg: 'white',
    bg: 'gray',
  },
  ICON: {
    fg: 'red',
    bg: 'black',
  },
};

/**
 * Widget error boundary class
 * Wraps a widget with error handling and visual error UI
 */
export class WidgetErrorBoundary {
  constructor(widget, options = {}) {
    this.widget = widget;
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 5000,
      showErrorDetails: options.showErrorDetails ?? true,
      allowDismiss: options.allowDismiss ?? true,
      errorTitle: options.errorTitle ?? 'Widget Error',
      onRetry: options.onRetry ?? null,
      onDismiss: options.onDismiss ?? null,
      onError: options.onError ?? null,
      theme: options.theme ?? {},
    };

    this.errorState = {
      hasError: false,
      error: null,
      retryCount: 0,
      lastError: null,
      isRecovering: false,
    };

    this.isolator = new WidgetErrorIsolator({
      maxConsecutiveErrors: this.options.maxRetries,
      recoveryDelayMs: this.options.retryDelay,
      autoRecover: true,
    });

    this.errorContainer = null;
    this.retryButton = null;
    this.dismissButton = null;
    this.errorText = null;
    this.originalBox = null;
    this.parentScreen = null;

    // Bind methods
    this.handleRetry = this.handleRetry.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
  }

  /**
   * Wrap the widget's create method with error boundary
   * @param {Object} screen - Blessed screen
   * @param {Object} theme - Theme configuration
   */
  async create(screen, theme = {}) {
    this.parentScreen = screen;
    this.options.theme = { ...this.options.theme, ...theme };

    try {
      // Try to create the widget normally
      const result = await this.isolator.wrapCreate(
        this.widget.id || 'widget',
        () => this.widget.create(screen, theme)
      );

      if (result === null) {
        // Widget creation failed, show error boundary
        this.showErrorBoundary(this.isolator.getHealth(this.widget.id)?.lastError?.message || 'Widget creation failed');
        return this;
      }

      // Store reference to the widget's box for hiding/showing
      this.originalBox = this.widget.box;

      return this;
    } catch (error) {
      this.handleError(error, WidgetErrorType.CREATE_ERROR);
      return this;
    }
  }

  /**
   * Show the error boundary UI
   * @param {string} message - Error message to display
   * @param {Error} originalError - Original error object
   * @private
   */
  showErrorBoundary(message, originalError = null) {
    if (!this.parentScreen) {
      logger.error('Cannot show error boundary without parent screen');
      return;
    }

    const C = this.options.theme.colors || {};
    const styles = this.getErrorStyles(C);

    // Hide the original widget box if it exists
    if (this.originalBox && !this.originalBox.destroyed) {
      this.originalBox.hide();
    }

    // Create error container
    this.errorContainer = blessed.box({
      parent: this.parentScreen,
      ...styles.container,
      label: ` ${this.options.errorTitle} `,
      tags: true,
    });

    // Try to position error container where widget would be
    if (this.originalBox) {
      this.errorContainer.top = this.originalBox.top;
      this.errorContainer.left = this.originalBox.left;
      this.errorContainer.width = this.originalBox.width;
      this.errorContainer.height = this.originalBox.height;
    }

    // Error icon
    blessed.text({
      parent: this.errorContainer,
      top: 1,
      left: 'center',
      content: '{red-fg}✖{/red-fg}',
      tags: true,
      style: styles.icon,
    });

    // Error title
    blessed.text({
      parent: this.errorContainer,
      top: 2,
      left: 'center',
      content: '{bold}Widget Failed{/bold}',
      tags: true,
      style: styles.title,
    });

    // Error message
    const shortMessage = message.length > 40 ? message.substring(0, 37) + '...' : message;
    this.errorText = blessed.text({
      parent: this.errorContainer,
      top: 3,
      left: 'center',
      content: shortMessage,
      tags: true,
      style: styles.message,
    });

    // Show error details if enabled
    let currentTop = 4;
    if (this.options.showErrorDetails && originalError?.stack) {
      const stackLines = originalError.stack.split('\n').slice(0, 3);
      blessed.text({
        parent: this.errorContainer,
        top: currentTop++,
        left: 'center',
        content: stackLines[0] || '',
        tags: true,
        style: styles.errorDetail,
      });
    }

    // Retry count indicator
    if (this.errorState.retryCount > 0) {
      blessed.text({
        parent: this.errorContainer,
        top: currentTop++,
        left: 'center',
        content: `Retry ${this.errorState.retryCount}/${this.options.maxRetries}`,
        tags: true,
        style: styles.errorDetail,
      });
    }

    // Retry button
    currentTop++;
    this.retryButton = blessed.button({
      parent: this.errorContainer,
      top: currentTop,
      left: 'center',
      width: 12,
      height: 1,
      content: '  Retry  ',
      align: 'center',
      valign: 'middle',
      tags: true,
      style: {
        fg: styles.retryButton.fg,
        bg: styles.retryButton.bg,
        bold: styles.retryButton.bold,
        focus: {
          fg: styles.retryButtonFocused.fg,
          bg: styles.retryButtonFocused.bg,
          bold: styles.retryButtonFocused.bold,
        },
        hover: {
          fg: styles.retryButtonFocused.fg,
          bg: styles.retryButtonFocused.bg,
        },
      },
    });

    this.retryButton.on('press', this.handleRetry);

    // Dismiss button (if allowed)
    if (this.options.allowDismiss) {
      this.dismissButton = blessed.button({
        parent: this.errorContainer,
        top: currentTop + 2,
        left: 'center',
        width: 12,
        height: 1,
        content: ' Dismiss ',
        align: 'center',
        valign: 'middle',
        tags: true,
        style: {
          fg: styles.dismissButton.fg,
          bg: styles.dismissButton.bg,
          focus: {
            fg: 'black',
            bg: 'white',
          },
          hover: {
            fg: 'black',
            bg: 'white',
          },
        },
      });

      this.dismissButton.on('press', this.handleDismiss);
    }

    // Set focus to retry button
    this.retryButton.focus();

    // Keyboard navigation
    this.parentScreen.on('keypress', this.handleKeypress);

    this.errorState.hasError = true;
    this.errorState.lastError = originalError;

    // Notify callback
    if (this.options.onError) {
      this.options.onError(originalError || new Error(message), this.errorState.retryCount);
    }

    logger.warn(`Error boundary shown for widget '${this.widget.id}': ${message}`);
  }

  /**
   * Get error styles merged with theme
   * @private
   */
  getErrorStyles(themeColors) {
    return {
      container: {
        border: { type: 'line' },
        style: {
          border: { fg: themeColors.error || 'red' },
          bg: 'black',
        },
      },
      title: {
        fg: themeColors.error || 'red',
        bold: true,
      },
      message: {
        fg: 'white',
        bg: 'black',
      },
      errorDetail: {
        fg: themeColors.gray || 'gray',
        bg: 'black',
      },
      retryButton: ErrorStyles.RETRY_BUTTON,
      retryButtonFocused: ErrorStyles.RETRY_BUTTON_FOCUSED,
      dismissButton: ErrorStyles.DISMISS_BUTTON,
      icon: {
        fg: themeColors.error || 'red',
        bg: 'black',
      },
    };
  }

  /**
   * Handle keypress for keyboard navigation
   * @private
   */
  handleKeypress(ch, key) {
    if (!this.errorState.hasError) return;

    if (key.name === 'r' || key.name === 'return') {
      this.handleRetry();
    } else if (key.name === 'd' || key.name === 'escape') {
      this.handleDismiss();
    } else if (key.name === 'tab') {
      // Toggle focus between buttons
      if (this.dismissButton) {
        const focused = this.retryButton.focused;
        if (focused) {
          this.dismissButton.focus();
        } else {
          this.retryButton.focus();
        }
      }
    }
  }

  /**
   * Handle retry action
   * @private
   */
  async handleRetry() {
    if (this.errorState.isRecovering) return;

    this.errorState.isRecovering = true;
    this.errorState.retryCount++;

    logger.info(`Retrying widget '${this.widget.id}' (attempt ${this.errorState.retryCount})`);

    // Show loading state
    if (this.retryButton) {
      this.retryButton.setContent('Retrying...');
      this.retryButton.style.bg = 'yellow';
    }

    try {
      // Clear error state
      this.clearErrorBoundary();

      // Reset isolator health for this widget
      this.isolator.resetWidget(this.widget.id);

      // Attempt to recreate the widget
      let initResult = null;
      let createResult = null;

      if (this.widget.init) {
        initResult = await this.isolator.wrapInit(
          this.widget.id,
          () => this.widget.init()
        );
      }

      if (this.widget.create && initResult !== null) {
        createResult = await this.isolator.wrapCreate(
          this.widget.id,
          () => this.widget.create(this.parentScreen, this.options.theme)
        );
      }

      // Check if any operation failed (null result indicates failure in isolator)
      if (initResult === null && this.widget.init) {
        throw new Error('Widget initialization failed');
      }
      if (createResult === null && this.widget.create) {
        throw new Error('Widget creation failed');
      }

      // Success! Update state
      this.errorState.hasError = false;
      this.errorState.error = null;
      this.originalBox = this.widget.box;

      if (this.options.onRetry) {
        this.options.onRetry(true, this.errorState.retryCount);
      }

      logger.info(`Widget '${this.widget.id}' recovered successfully`);
    } catch (error) {
      // Retry failed, show error again
      this.errorState.hasError = true;
      this.errorState.error = error;

      // Check if we should show error again or give up
      if (this.errorState.retryCount >= this.options.maxRetries) {
        this.showErrorBoundary(`Widget failed after ${this.options.maxRetries} retries`, error);
        blessed.text({
          parent: this.errorContainer,
          top: this.errorContainer.children.length - 2,
          left: 'center',
          content: '{red-fg}Max retries reached{/red-fg}',
          tags: true,
          style: { fg: 'red' },
        });
      } else {
        this.showErrorBoundary(error.message || 'Widget failed to recover', error);
      }

      if (this.options.onRetry) {
        this.options.onRetry(false, this.errorState.retryCount, error);
      }

      logger.error(`Widget '${this.widget.id}' retry failed: ${error.message}`);
    } finally {
      this.errorState.isRecovering = false;
    }
  }

  /**
   * Handle dismiss action
   * @private
   */
  handleDismiss() {
    logger.info(`Widget '${this.widget.id}' error boundary dismissed`);

    this.clearErrorBoundary();

    if (this.options.onDismiss) {
      this.options.onDismiss();
    }
  }

  /**
   * Clear the error boundary UI
   * @private
   */
  clearErrorBoundary() {
    // Remove keypress listener
    if (this.parentScreen) {
      this.parentScreen.removeListener('keypress', this.handleKeypress);
    }

    // Destroy error container
    if (this.errorContainer && !this.errorContainer.destroyed) {
      this.errorContainer.destroy();
      this.errorContainer = null;
    }

    // Show original widget if it exists
    if (this.originalBox && !this.originalBox.destroyed) {
      this.originalBox.show();
    }

    this.retryButton = null;
    this.dismissButton = null;
    this.errorText = null;
  }

  /**
   * Handle error and show boundary
   * @param {Error} error - The error that occurred
   * @param {string} type - Error type
   * @private
   */
  handleError(error, type = WidgetErrorType.UNKNOWN_ERROR) {
    this.errorState.error = error;
    this.errorState.hasError = true;
    this.isolator.healthTracker.recordError(this.widget.id, error, type);
    this.showErrorBoundary(error.message, error);
  }

  /**
   * Get data with error handling
   */
  async getData(dataProvider) {
    if (this.errorState.hasError) {
      return null;
    }

    const result = await this.isolator.wrapGetData(
      this.widget.id,
      () => this.widget.getData(dataProvider)
    );

    // Check if operation failed (result is null and health shows error)
    if (result === null) {
      const health = this.isolator.getHealth(this.widget.id);
      if (health?.lastError && !this.errorState.hasError) {
        const error = new Error(health.lastError.message || 'Data fetch failed');
        error.stack = health.lastError.stack;
        this.handleError(error, WidgetErrorType.DATA_ERROR);
      }
    }

    return result;
  }

  /**
   * Render with error handling
   */
  async render(data) {
    if (this.errorState.hasError) {
      return;
    }

    const result = await this.isolator.wrapRender(
      this.widget.id,
      () => this.widget.render(data)
    );

    // Check if operation failed (result is null and health shows error)
    if (result === null) {
      const health = this.isolator.getHealth(this.widget.id);
      if (health?.lastError && !this.errorState.hasError) {
        const error = new Error(health.lastError.message || 'Render failed');
        error.stack = health.lastError.stack;
        this.handleError(error, WidgetErrorType.RENDER_ERROR);
      }
    }
  }

  /**
   * Update with error handling
   */
  update(data) {
    if (this.errorState.hasError || !this.widget.update) {
      return;
    }

    try {
      this.widget.update(data);
    } catch (error) {
      this.handleError(error, WidgetErrorType.RENDER_ERROR);
    }
  }

  /**
   * Destroy the error boundary and widget
   */
  async destroy() {
    this.clearErrorBoundary();

    try {
      await this.isolator.wrapDestroy(
        this.widget.id,
        () => this.widget.destroy()
      );
    } catch (error) {
      logger.error(`Error destroying widget '${this.widget.id}': ${error.message}`);
    }

    this.isolator.shutdown();
  }

  /**
   * Get current error state
   */
  getErrorState() {
    return {
      ...this.errorState,
      health: this.isolator.getHealth(this.widget.id),
    };
  }

  /**
   * Check if widget is in error state
   */
  hasError() {
    return this.errorState.hasError;
  }

  /**
   * Force show error boundary with custom message
   * @param {string} message - Error message
   * @param {Error} error - Optional error object
   */
  showError(message, error = null) {
    this.errorState.hasError = true;
    this.errorState.error = error || new Error(message);
    this.errorState.lastError = error || new Error(message);
    if (this.parentScreen) {
      this.showErrorBoundary(message, error);
    } else {
      // Store message for later display when screen is available
      this._pendingErrorMessage = message;
    }
  }

  /**
   * Reset error state
   */
  async reset() {
    this.clearErrorBoundary();
    this.errorState.hasError = false;
    this.errorState.error = null;
    this.errorState.retryCount = 0;
    this.isolator.resetWidget(this.widget.id);
  }
}

/**
 * Create an error boundary for a widget
 * @param {Object} widget - Widget instance to wrap
 * @param {Object} options - Error boundary options
 * @returns {WidgetErrorBoundary} Error boundary instance
 */
export function withErrorBoundary(widget, options = {}) {
  return new WidgetErrorBoundary(widget, options);
}

/**
 * Error boundary manager for managing multiple widget error boundaries
 */
export class ErrorBoundaryManager {
  constructor() {
    this.boundaries = new Map();
    this.globalOptions = {};
  }

  /**
   * Set global options for all error boundaries
   * @param {Object} options - Global options
   */
  setGlobalOptions(options) {
    this.globalOptions = { ...this.globalOptions, ...options };
  }

  /**
   * Wrap a widget with error boundary
   * @param {Object} widget - Widget to wrap
   * @param {Object} options - Options (merged with global options)
   * @returns {WidgetErrorBoundary} Error boundary instance
   */
  wrap(widget, options = {}) {
    const mergedOptions = { ...this.globalOptions, ...options };
    const boundary = new WidgetErrorBoundary(widget, mergedOptions);
    this.boundaries.set(widget.id, boundary);
    return boundary;
  }

  /**
   * Get error boundary for a widget
   * @param {string} widgetId - Widget ID
   * @returns {WidgetErrorBoundary|null} Error boundary or null
   */
  get(widgetId) {
    return this.boundaries.get(widgetId) || null;
  }

  /**
   * Remove an error boundary
   * @param {string} widgetId - Widget ID
   */
  remove(widgetId) {
    const boundary = this.boundaries.get(widgetId);
    if (boundary) {
      boundary.destroy();
      this.boundaries.delete(widgetId);
    }
  }

  /**
   * Get all error states
   * @returns {Object} Map of widget ID to error state
   */
  getAllErrorStates() {
    const states = {};
    for (const [id, boundary] of this.boundaries) {
      states[id] = boundary.getErrorState();
    }
    return states;
  }

  /**
   * Retry all failed widgets
   * @returns {Promise<Object>} Results of retry attempts
   */
  async retryAll() {
    const results = {};
    for (const [id, boundary] of this.boundaries) {
      if (boundary.hasError()) {
        try {
          await boundary.handleRetry();
          results[id] = { success: true };
        } catch (error) {
          results[id] = { success: false, error: error.message };
        }
      }
    }
    return results;
  }

  /**
   * Clear all error boundaries
   */
  clearAll() {
    for (const boundary of this.boundaries.values()) {
      boundary.destroy();
    }
    this.boundaries.clear();
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const all = Array.from(this.boundaries.values());
    return {
      total: all.length,
      inError: all.filter(b => b.hasError()).length,
      healthy: all.filter(b => !b.hasError()).length,
    };
  }
}

// Singleton instance
let defaultManager = null;

/**
 * Get default error boundary manager
 * @returns {ErrorBoundaryManager} Default manager instance
 */
export function getErrorBoundaryManager() {
  if (!defaultManager) {
    defaultManager = new ErrorBoundaryManager();
  }
  return defaultManager;
}

export default {
  WidgetErrorBoundary,
  ErrorBoundaryManager,
  ErrorStyles,
  withErrorBoundary,
  getErrorBoundaryManager,
};
