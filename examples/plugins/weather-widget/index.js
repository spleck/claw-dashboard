/**
 * Example Weather Widget Plugin
 * Demonstrates how to create a custom widget for Claw Dashboard
 */

import { BaseWidget } from '../../../src/widgets/plugin-api.js';

/**
 * Weather Widget - Displays simulated weather data
 * In a real implementation, this would fetch from a weather API
 */
export default class WeatherWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'Weather';
    this.description = 'Current weather conditions';
    this.weatherData = null;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', 'Weather widget initialized');
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

    this.box = blessed.default.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' WEATHER ',
      style: { border: { fg: C.brightCyan || 'bright-cyan' } },
    });

    this.locationText = blessed.default.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: this.config.location || 'Unknown',
      style: { fg: C.brightCyan || 'bright-cyan', bold: true },
    });

    this.tempText = blessed.default.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '--°C',
      style: { fg: C.white || 'white' },
    });

    this.conditionText = blessed.default.text({
      parent: this.box,
      top: 2,
      left: 'center',
      content: 'Loading...',
      style: { fg: C.gray || 'gray' },
    });

    this.loaded = true;
    this.log('debug', 'Weather widget UI created');

    return this;
  }

  /**
   * Get weather data
   * In a real implementation, this would call a weather API
   */
  async getData() {
    // Simulate API call with random weather data
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 30) - 5; // -5 to 25°C

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      location: this.config.location || 'Local',
      temperature: randomTemp,
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update the display
   * @param {Object} data - Weather data
   */
  update(data) {
    if (!this.box || !data) return;

    this.weatherData = data;

    this.locationText.setContent(data.location);
    this.tempText.setContent(`${data.temperature}°C`);
    this.conditionText.setContent(
      `${data.condition} • ${data.humidity}% humidity`
    );
  }

  /**
   * Render the widget
   * @param {Object} data - Weather data from getData()
   */
  render(data) {
    this.update(data);
  }

  /**
   * Destroy the widget
   */
  async destroy() {
    if (this.box) {
      this.box.destroy();
      this.box = null;
    }
    this.loaded = false;
    this.log('info', 'Weather widget destroyed');
  }
}

// Also export as named export for flexibility
export { WeatherWidget };
