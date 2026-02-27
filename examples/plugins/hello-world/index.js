/**
 * Hello World Widget Plugin
 * The simplest possible widget example for Claw Dashboard
 *
 * This example demonstrates:
 * - Basic widget structure extending BaseWidget
 * - Required lifecycle methods (init, create, getData, render, destroy)
 * - Simple configuration handling
 * - Basic blessed UI creation
 */

import { BaseWidget } from '../../../src/widgets/plugin-api.js';

/**
 * HelloWidget - A minimal widget that displays a greeting
 */
export default class HelloWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'Hello World';
    this.description = 'Simple greeting widget';
  }

  /**
   * Initialize the widget
   * Called once when the widget is first loaded
   */
  async init() {
    this.log('info', 'Hello World widget initialized');
    return true;
  }

  /**
   * Create the widget UI
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');

    // Create a simple box with a border
    this.box = blessed.default.box({
      parent: screen,
      width: '50%',
      height: 5,
      border: { type: 'line' },
      label: ' HELLO ',
      style: { border: { fg: C.green || 'green' } },
      align: 'center',
      valign: 'middle',
    });

    this.loaded = true;
    this.log('debug', 'Hello World widget UI created');

    return this;
  }

  /**
   * Get data for the widget
   * Returns the message to display
   */
  async getData() {
    const message = this.config.message || 'Hello, World!';
    const showTimestamp = this.config.showTimestamp !== false;

    return {
      message,
      timestamp: showTimestamp ? new Date().toISOString() : null,
    };
  }

  /**
   * Render the widget with data
   * @param {Object} data - Data from getData()
   */
  render(data) {
    if (!this.box) return;

    let content = data.message;
    if (data.timestamp) {
      content += `\n[${data.timestamp}]`;
    }

    this.box.setContent(content);
  }

  /**
   * Destroy the widget
   * Clean up resources
   */
  async destroy() {
    if (this.box) {
      this.box.destroy();
      this.box = null;
    }
    this.loaded = false;
    this.log('info', 'Hello World widget destroyed');
  }
}

// Export named export for flexibility
export { HelloWidget };