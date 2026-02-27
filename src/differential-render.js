/**
 * Differential Rendering Module
 * Optimizes blessed screen rendering by tracking widget state and only
 * updating components that have actually changed.
 */

import logger from './logger.js';

/**
 * Widget state tracker for differential rendering
 * Tracks content, styles, and labels to minimize unnecessary re-renders
 */
export class WidgetStateTracker {
  constructor() {
    this.states = new Map();
    this.stats = {
      totalUpdates: 0,
      skippedUpdates: 0,
      actualUpdates: 0,
      screenRenders: 0,
      skippedRenders: 0
    };
  }

  /**
   * Generate a hash for comparing complex objects
   * @param {*} value - Value to hash
   * @returns {string} Hash string
   */
  _hash(value) {
    if (value === null || value === undefined) return String(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Track widget content update
   * @param {string} widgetId - Unique widget identifier
   * @param {string} newContent - New content to set
   * @param {Function} updateFn - Function to call if update is needed
   * @returns {boolean} True if update was performed
   */
  trackContent(widgetId, newContent, updateFn) {
    const key = `${widgetId}:content`;
    const current = this.states.get(key);
    const newValue = String(newContent ?? '');

    this.stats.totalUpdates++;

    if (current === newValue) {
      this.stats.skippedUpdates++;
      return false;
    }

    this.states.set(key, newValue);
    this.stats.actualUpdates++;
    updateFn(newValue);
    return true;
  }

  /**
   * Track style update for a widget
   * @param {string} widgetId - Unique widget identifier
   * @param {string} styleProp - Style property name
   * @param {*} newValue - New style value
   * @param {Function} updateFn - Function to call if update is needed
   * @returns {boolean} True if update was performed
   */
  trackStyle(widgetId, styleProp, newValue, updateFn) {
    const key = `${widgetId}:style:${styleProp}`;
    const current = this.states.get(key);
    const hashedNew = this._hash(newValue);

    if (current === hashedNew) {
      return false;
    }

    this.states.set(key, hashedNew);
    updateFn(newValue);
    return true;
  }

  /**
   * Track label update for a widget
   * @param {string} widgetId - Unique widget identifier
   * @param {string} newLabel - New label value
   * @param {Function} updateFn - Function to call if update is needed
   * @returns {boolean} True if update was performed
   */
  trackLabel(widgetId, newLabel, updateFn) {
    const key = `${widgetId}:label`;
    const current = this.states.get(key);
    const newValue = String(newLabel ?? '');

    if (current === newValue) {
      return false;
    }

    this.states.set(key, newValue);
    updateFn(newValue);
    return true;
  }

  /**
   * Reset state for a specific widget (e.g., after resize)
   * @param {string} widgetId - Widget identifier
   */
  resetWidget(widgetId) {
    for (const key of this.states.keys()) {
      if (key.startsWith(`${widgetId}:`)) {
        this.states.delete(key);
      }
    }
  }

  /**
   * Reset all tracked state
   */
  resetAll() {
    this.states.clear();
    logger.debug('Differential render state reset');
  }

  /**
   * Get current statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const efficiency = this.stats.totalUpdates > 0
      ? ((this.stats.skippedUpdates / this.stats.totalUpdates) * 100).toFixed(1)
      : 0;
    const renderEfficiency = this.stats.screenRenders > 0
      ? ((this.stats.skippedRenders / (this.stats.screenRenders + this.stats.skippedRenders)) * 100).toFixed(1)
      : 0;

    return {
      ...this.stats,
      efficiency: `${efficiency}%`,
      renderEfficiency: `${renderEfficiency}%`,
      trackedWidgets: this.states.size
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalUpdates: 0,
      skippedUpdates: 0,
      actualUpdates: 0,
      screenRenders: 0,
      skippedRenders: 0
    };
  }
}

/**
 * Differential renderer that batches updates and minimizes screen.render() calls
 */
export class DifferentialRenderer {
  constructor(screen) {
    this.screen = screen;
    this.tracker = new WidgetStateTracker();
    this.pendingChanges = new Set();
    this.batchMode = false;
    this.deferredRender = null;
  }

  /**
   * Start batching mode - screen.render() will be deferred
   */
  beginBatch() {
    this.batchMode = true;
    this.pendingChanges.clear();
  }

  /**
   * End batching and render if changes occurred
   */
  endBatch() {
    this.batchMode = false;
    const hasChanges = this.pendingChanges.size > 0;
    this.pendingChanges.clear();

    if (hasChanges) {
      this.tracker.stats.screenRenders++;
      this.screen.render();
      return true;
    } else {
      this.tracker.stats.skippedRenders++;
      return false;
    }
  }

  /**
   * Request a screen render, may be deferred in batch mode
   */
  requestRender() {
    if (this.batchMode) {
      this.pendingChanges.add('render');
    } else {
      this.tracker.stats.screenRenders++;
      this.screen.render();
    }
  }

  /**
   * Set widget content with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} content - New content
   * @returns {boolean} True if content was updated
   */
  setContent(widgetId, widget, content) {
    if (!widget || widget.destroyed) return false;

    const changed = this.tracker.trackContent(widgetId, content, (newContent) => {
      widget.setContent(newContent);
      this.pendingChanges.add(widgetId);
    });

    return changed;
  }

  /**
   * Set widget style property with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} prop - Style property
   * @param {*} value - New value
   * @returns {boolean} True if style was updated
   */
  setStyle(widgetId, widget, prop, value) {
    if (!widget || widget.destroyed) return false;

    const changed = this.tracker.trackStyle(widgetId, prop, value, (newValue) => {
      widget.style[prop] = newValue;
      this.pendingChanges.add(`${widgetId}:style`);
    });

    return changed;
  }

  /**
   * Set widget foreground color with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} color - New color
   * @returns {boolean} True if color was updated
   */
  setFg(widgetId, widget, color) {
    return this.setStyle(widgetId, widget, 'fg', color);
  }

  /**
   * Set border color with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget with border
   * @param {string} color - New color
   * @returns {boolean} True if border was updated
   */
  setBorderFg(widgetId, widget, color) {
    if (!widget || widget.destroyed || !widget.style.border) return false;

    const changed = this.tracker.trackStyle(widgetId, 'border.fg', color, (newValue) => {
      widget.style.border.fg = newValue;
      this.pendingChanges.add(`${widgetId}:border`);
    });

    return changed;
  }

  /**
   * Set widget label with differential tracking
   * @param {string} widgetId - Widget identifier
   * @param {Object} widget - Blessed widget
   * @param {string} label - New label
   * @returns {boolean} True if label was updated
   */
  setLabel(widgetId, widget, label) {
    if (!widget || widget.destroyed) return false;

    const changed = this.tracker.trackLabel(widgetId, label, (newLabel) => {
      widget.setLabel(newLabel);
      this.pendingChanges.add(`${widgetId}:label`);
    });

    return changed;
  }

  /**
   * Reset state for a widget (useful after resize events)
   * @param {string} widgetId - Widget identifier
   */
  resetWidget(widgetId) {
    this.tracker.resetWidget(widgetId);
  }

  /**
   * Reset all tracked state
   */
  resetAll() {
    this.tracker.resetAll();
    this.pendingChanges.clear();
  }

  /**
   * Get rendering statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return this.tracker.getStats();
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.tracker.resetStats();
  }
}

export default {
  WidgetStateTracker,
  DifferentialRenderer
};
