/**
 * API Status Widget Plugin
 * Demonstrates API integration patterns including:
 * - Fetching data from external APIs
 * - Error handling and retry logic
 * - Loading states
 * - Configurable refresh intervals
 * - Timeout handling
 */

import { BaseWidget } from '../../../src/widgets/plugin-api.js';

/**
 * API Status Widget - Fetches and displays data from an external API
 */
export default class ApiStatusWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'API Status';
    this.description = 'Fetches data from external API';

    // Internal state
    this.loading = false;
    this.error = null;
    this.lastFetch = null;
    this.refreshTimer = null;
    this.data = null;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', 'API Status widget initialized');
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

    this.screen = screen;
    this.theme = theme;

    // Main container
    this.box = blessed.default.box({
      parent: screen,
      width: '50%',
      height: 7,
      border: { type: 'line' },
      label: ' API STATUS ',
      style: { border: { fg: C.cyan || 'cyan' } },
    });

    // Status line (shows loading/success/error)
    this.statusText = blessed.default.text({
      parent: this.box,
      top: 0,
      left: 1,
      content: 'Initializing...',
      style: { fg: C.gray || 'gray' },
    });

    // Data content line
    this.contentText = blessed.default.text({
      parent: this.box,
      top: 1,
      left: 1,
      content: '',
      style: { fg: C.white || 'white' },
      wrap: true,
    });

    // Last updated line
    this.updatedText = blessed.default.text({
      parent: this.box,
      top: 3,
      left: 1,
      content: 'Never updated',
      style: { fg: C.gray || 'gray' },
    });

    // Stats line (shows request count, errors)
    this.statsText = blessed.default.text({
      parent: this.box,
      top: 4,
      left: 1,
      content: 'Requests: 0 | Errors: 0',
      style: { fg: C.gray || 'gray' },
    });

    this.loaded = true;
    this.log('debug', 'API Status widget UI created');

    // Start auto-refresh if configured
    const refreshInterval = this.config.refreshInterval || 60000;
    if (refreshInterval > 0) {
      this.startAutoRefresh(refreshInterval);
    }

    return this;
  }

  /**
   * Fetch data from the configured API
   * Includes retry logic and timeout handling
   */
  async getData() {
    const apiUrl = this.config.apiUrl || 'https://api.github.com/zen';
    const timeout = this.config.timeout || 5000;
    const maxRetries = this.config.retries || 3;

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.loading = true;
        this.error = null;
        this.updateStatus('loading', `Fetching (attempt ${attempt}/${maxRetries})...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Claw-Dashboard-Widget/1.0',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle different response types
        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        this.loading = false;
        this.lastFetch = new Date();

        return {
          success: true,
          data,
          timestamp: this.lastFetch.toISOString(),
          apiUrl,
        };
      } catch (err) {
        lastError = err;
        this.log('warn', `API fetch attempt ${attempt} failed: ${err.message}`);

        // Don't retry on abort (timeout)
        if (err.name === 'AbortError') {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All retries failed
    this.loading = false;
    this.error = lastError;

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      apiUrl,
    };
  }

  /**
   * Render the widget with fetched data
   * @param {Object} result - Result from getData()
   */
  render(result) {
    if (!this.box) return;

    if (result.success) {
      this.updateStatus('success', 'Connected');

      // Format the data for display
      let content;
      if (typeof result.data === 'object') {
        content = JSON.stringify(result.data, null, 0).slice(0, 100);
      } else {
        content = String(result.data).slice(0, 100);
      }

      this.contentText.setContent(content);
      this.contentText.style.fg = this.theme?.colors?.white || 'white';
    } else {
      this.updateStatus('error', `Error: ${result.error}`);
      this.contentText.setContent('Unable to fetch data');
      this.contentText.style.fg = this.theme?.colors?.red || 'red';
    }

    // Update timestamp
    this.updatedText.setContent(`Last: ${result.timestamp || 'Never'}`);

    // Update stats
    const stats = this.getStats();
    this.statsText.setContent(`Requests: ${stats.requests} | Errors: ${stats.errors}`);
  }

  /**
   * Update the status indicator
   * @private
   */
  updateStatus(status, message) {
    const colors = {
      loading: this.theme?.colors?.yellow || 'yellow',
      success: this.theme?.colors?.green || 'green',
      error: this.theme?.colors?.red || 'red',
    };

    this.statusText.setContent(message);
    this.statusText.style.fg = colors[status] || 'white';
  }

  /**
   * Track request statistics
   * @private
   */
  getStats() {
    if (!this._stats) {
      this._stats = { requests: 0, errors: 0 };
    }
    return this._stats;
  }

  /**
   * Start auto-refresh timer
   * @param {number} intervalMs - Refresh interval in milliseconds
   */
  startAutoRefresh(intervalMs) {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      if (!this.loading) {
        this.getData()
          .then(data => this.render(data))
          .catch(err => this.log('error', `Auto-refresh failed: ${err.message}`));
      }
    }, intervalMs);

    this.log('debug', `Auto-refresh started (${intervalMs}ms interval)`);
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      this.log('debug', 'Auto-refresh stopped');
    }
  }

  /**
   * Destroy the widget
   */
  async destroy() {
    this.stopAutoRefresh();

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', 'API Status widget destroyed');
  }
}

// Export named export for flexibility
export { ApiStatusWidget };