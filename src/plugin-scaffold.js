#!/usr/bin/env node

/**
 * Plugin scaffolding CLI for Claw Dashboard
 * Provides `clawdash create-plugin <name>` functionality with multiple templates
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import readline from 'readline';

/**
 * Create a readline interface for interactive prompts
 * @returns {readline.Interface} Readline interface
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt for user input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} User input
 */
function prompt(question) {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Prompt with default value
 * @param {string} question - Question to ask
 * @param {string} defaultValue - Default value
 * @returns {Promise<string>} User input or default
 */
async function promptWithDefault(question, defaultValue) {
  const answer = await prompt(`${question} [${defaultValue}]: `);
  return answer.trim() || defaultValue;
}

/**
 * Prompt with multiple choice
 * @param {string} question - Question to ask
 * @param {string[]} choices - Available choices
 * @param {number} defaultIndex - Default choice index
 * @returns {Promise<string>} Selected choice
 */
async function promptChoice(question, choices, defaultIndex = 0) {
  const options = choices.map((c, i) => `  ${i + 1}. ${c}`).join('\n');

  while (true) {
    const answer = await prompt(`${question}\n${options}\nSelect (1-${choices.length}) [${defaultIndex + 1}]: `);

    const input = answer.trim() || String(defaultIndex + 1);
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 1 && num <= choices.length) {
      return choices[num - 1];
    }

    console.log('Invalid selection. Please enter a number between 1 and ' + choices.length);
  }
}

/**
 * Run interactive mode to prompt for all options
 * @returns {Promise<object>} Collected options
 */
async function runInteractiveMode() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Claw Dashboard - Create New Widget Plugin               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Get plugin ID
  const id = await prompt('Plugin ID (kebab-case, e.g., "my-widget"): ');
  if (!id.trim()) {
    console.log('Error: Plugin ID is required');
    return null;
  }

  // Validate ID format
  const idValidation = validatePluginId(id.trim());
  if (!idValidation.valid) {
    console.log('Error: ' + idValidation.error);
    return null;
  }

  // Get display name
  const defaultName = id.trim().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const name = await promptWithDefault('Display name', defaultName);

  // Get template
  const templates = listTemplates();
  const templateNames = templates.map(t => t.name + ' (' + t.id + ')');
  const selectedTemplate = await promptChoice('Select template:', templateNames, 0);
  const template = templates[templateNames.indexOf(selectedTemplate)].id;

  // Get author
  const author = await promptWithDefault('Author name/email', '');

  // Get category
  const category = await promptChoice('Select category:', ['Custom', 'System', 'Monitoring', 'Example'], 0);

  // Get description
  const description = await promptWithDefault('Description', 'A custom widget for Claw Dashboard');

  console.log('');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('Summary:');
  console.log('  ID:          ' + id.trim());
  console.log('  Name:        ' + name);
  console.log('  Template:    ' + template);
  console.log('  Category:    ' + category.toLowerCase());
  console.log('  Author:      ' + (author || '(none)'));
  console.log('  Description: ' + description);
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');

  const confirm = await promptChoice('Create plugin?', ['Yes', 'No'], 0);

  if (confirm !== 'Yes') {
    console.log('Cancelled.');
    return null;
  }

  return {
    id: id.trim(),
    name,
    template,
    author,
    category: category.toLowerCase(),
    description,
  };
}

/**
 * Template definitions for different widget types
 */
const TEMPLATES = {
  basic: {
    name: 'Basic Widget',
    description: 'Simple widget with minimal setup - displays static or simple data',
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: options.description || 'A custom widget plugin for Claw Dashboard',
      version: '1.0.0',
      author: author || '',
      category: options.category || 'custom',
      type: 'widget',
      lazyLoad: true,
      priority: 100,
      config: {
        message: 'Hello, World!',
        showTimestamp: true,
      },
      __version: 1,
    }),

    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Generated by clawdash create-plugin
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - A custom widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'A custom widget';
  }

  /**
   * Initialize the widget
   * Called once when the widget is first loaded
   */
  async init() {
    this.log('info', '${className} widget initialized');
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

    // Create main container
    this.box = blessed.default.box({
      parent: screen,
      width: '50%',
      height: 10,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create content text
    this.contentText = blessed.default.text({
      parent: this.box,
      top: 2,
      left: 1,
      content: 'Loading...',
      style: { fg: C.white || 'white' },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    return this;
  }

  /**
   * Get data for the widget
   * Fetch and return data for rendering
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
    if (!this.box || !data) return;

    let content = data.message;
    if (data.timestamp) {
      content += '\\n[' + data.timestamp + ']';
    }

    this.contentText.setContent(content);
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
    this.log('info', '${className} widget destroyed');
  }
}

// Export named export for flexibility
export { ${className} };
`,
  },

  api: {
    name: 'API Widget',
    description: 'Widget with API fetching, error handling, and retry logic',
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: options.description || 'A widget that fetches data from an external API',
      version: '1.0.0',
      author: author || '',
      category: options.category || 'monitoring',
      type: 'widget',
      lazyLoad: true,
      priority: 100,
      config: {
        apiUrl: '${API_URL:-https://api.github.com/zen}',
        apiKey: '${API_KEY:-}',
        refreshInterval: 60000,
        timeout: 5000,
        retries: 3,
      },
      __version: 1,
    }),

    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * API-powered widget with error handling and retry logic
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - API-powered widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'API-powered widget';

    // Internal state
    this.loading = false;
    this.error = null;
    this.lastFetch = null;
    this.refreshTimer = null;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
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
      label: ' ${className.toUpperCase()} ',
      style: { border: { fg: C.cyan || 'cyan' } },
    });

    // Status line
    this.statusText = blessed.default.text({
      parent: this.box,
      top: 0,
      left: 1,
      content: 'Initializing...',
      style: { fg: C.gray || 'gray' },
    });

    // Data content
    this.contentText = blessed.default.text({
      parent: this.box,
      top: 1,
      left: 1,
      content: '',
      style: { fg: C.white || 'white' },
      wrap: true,
    });

    // Last updated
    this.updatedText = blessed.default.text({
      parent: this.box,
      top: 3,
      left: 1,
      content: 'Never updated',
      style: { fg: C.gray || 'gray' },
    });

    // Stats
    this.statsText = blessed.default.text({
      parent: this.box,
      top: 4,
      left: 1,
      content: 'Requests: 0 | Errors: 0',
      style: { fg: C.gray || 'gray' },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    const refreshInterval = this.config.refreshInterval || 60000;
    if (refreshInterval > 0) {
      this.startAutoRefresh(refreshInterval);
    }

    return this;
  }

  /**
   * Fetch data from the configured API
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
        this.updateStatus('loading', 'Fetching (attempt ' + attempt + '/' + maxRetries + ')...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Claw-Dashboard-Widget/1.0',
            ...(this.config.apiKey && { 'Authorization': 'Bearer ' + this.config.apiKey }),
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ' + response.statusText);
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
        this.log('warn', 'API fetch attempt ' + attempt + ' failed: ' + err.message);

        if (err.name === 'AbortError') {
          break;
        }

        // Exponential backoff
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
      this.updateStatus('error', 'Error: ' + result.error);
      this.contentText.setContent('Unable to fetch data');
      this.contentText.style.fg = this.theme?.colors?.red || 'red';
    }

    this.updatedText.setContent('Last: ' + (result.timestamp || 'Never'));

    const stats = this.getStats();
    this.statsText.setContent('Requests: ' + stats.requests + ' | Errors: ' + stats.errors);
  }

  /**
   * Update the status indicator
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
   */
  getStats() {
    if (!this._stats) {
      this._stats = { requests: 0, errors: 0 };
    }
    return this._stats;
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh(intervalMs) {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      if (!this.loading) {
        this.getData()
          .then(data => this.render(data))
          .catch(err => this.log('error', 'Auto-refresh failed: ' + err.message));
      }
    }, intervalMs);

    this.log('debug', 'Auto-refresh started (' + intervalMs + 'ms interval)');
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
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`,
  },

  chart: {
    name: 'Chart Widget',
    description: 'Widget with real-time line chart visualization using ASCII art',
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: options.description || 'A widget that displays real-time data with charts',
      version: '1.0.0',
      author: author || '',
      category: options.category || 'monitoring',
      type: 'widget',
      lazyLoad: true,
      priority: 100,
      config: {
        metricType: 'cpu',
        maxDataPoints: 30,
        refreshInterval: 2000,
        showLegend: true,
      },
      __version: 1,
    }),

    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Chart widget with real-time data visualization using ASCII art
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Chart widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Chart widget with real-time data';

    // Chart configuration
    this.metricType = this.config.metricType || 'cpu';
    this.maxDataPoints = this.config.maxDataPoints || 30;
    this.refreshInterval = this.config.refreshInterval || 2000;
    this.showLegend = this.config.showLegend !== false;

    // Data storage for time series
    this.dataHistory = { labels: [], values: [] };

    // Widget state
    this.chart = null;
    this.refreshTimer = null;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
    return true;
  }

  /**
   * Create the widget UI with ASCII line chart
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');

    this.screen = screen;
    this.theme = theme;

    // Create main container box
    this.box = blessed.default.box({
      parent: screen,
      width: '70%',
      height: 17,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create ASCII chart area using text element
    this.chartArea = blessed.default.text({
      parent: this.box,
      top: 1,
      left: 1,
      width: '95%',
      height: 13,
      tags: true,
      style: { fg: C.green || 'green' },
    });

    // Add info text
    this.infoText = blessed.default.text({
      parent: this.box,
      bottom: 0,
      left: 1,
      content: 'Initializing...',
      style: { fg: C.gray || 'gray' },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Generate ASCII chart from data
   */
  _renderAsciiChart(values, width = 60, height = 10) {
    if (!values || values.length === 0) return 'No data';
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    let chart = '';
    for (let row = height - 1; row >= 0; row--) {
      const threshold = min + (range * row / height);
      let line = '';
      for (let i = 0; i < Math.min(values.length, width); i++) {
        const val = values[i];
        line += val >= threshold ? '█' : '░';
      }
      chart += line + '\n';
    }
    return chart;
  }

  /**
   * Generate sample data - customize this for your data source
   */
  async getData() {
    const now = new Date();
    const timeLabel = now.getHours().toString().padStart(2, '0') + ':' +
                     now.getMinutes().toString().padStart(2, '0') + ':' +
                     now.getSeconds().toString().padStart(2, '0');

    // Generate sample data - replace with actual data fetching
    const baseValue = 30;
    const variance = Math.random() * 40;
    const value = Math.min(100, Math.max(0, Math.floor(baseValue + variance)));

    // Store in history
    this.dataHistory.labels.push(timeLabel);
    this.dataHistory.values.push(value);

    // Trim to max data points
    if (this.dataHistory.labels.length > this.maxDataPoints) {
      this.dataHistory.labels.shift();
      this.dataHistory.values.shift();
    }

    return {
      currentValue: value,
      timestamp: now.toISOString(),
      labels: [...this.dataHistory.labels],
      values: [...this.dataHistory.values],
      dataPoints: this.dataHistory.values.length,
    };
  }

  /**
   * Render the chart with data
   */
  render(data) {
    if (!this.chart || !data) return;

    // Generate ASCII chart
    const asciiChart = this._renderAsciiChart(data.values);
    this.chartArea.setContent(asciiChart);

    // Update info text
    const avg = data.values.length > 0
      ? Math.floor(data.values.reduce((a, b) => a + b, 0) / data.values.length)
      : 0;
    const current = data.currentValue;
    const max = data.values.length > 0 ? Math.max(...data.values) : 0;

    this.infoText.setContent(
      'Current: ' + current + ' | Avg: ' + avg + ' | Peak: ' + max +
      ' | Points: ' + data.dataPoints + '/' + this.maxDataPoints
    );
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
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

    // Clear data history
    this.dataHistory = { labels: [], values: [] };

    if (this.chart) {
      this.chart = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`,
  },

  table: {
    name: 'Table Widget',
    description: 'Widget that displays data in a sortable table format',
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: options.description || 'A widget that displays tabular data',
      version: '1.0.0',
      author: author || '',
      category: options.category || 'monitoring',
      type: 'widget',
      lazyLoad: true,
      priority: 100,
      config: {
        columns: ['Name', 'Status', 'Value'],
        refreshInterval: 5000,
        maxRows: 10,
      },
      __version: 1,
    }),

    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Table widget for displaying tabular data
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Table widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Table widget';

    // Table configuration
    this.columns = this.config.columns || ['Name', 'Status', 'Value'];
    this.refreshInterval = this.config.refreshInterval || 5000;
    this.maxRows = this.config.maxRows || 10;

    // Widget state
    this.table = null;
    this.refreshTimer = null;
    this.sortColumn = 0;
    this.sortAsc = true;
    this.data = [];
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
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
      width: '60%',
      height: 15,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create table
    this.table = blessed.default.table({
      parent: this.box,
      top: 1,
      left: 1,
      width: '98%',
      height: '90%',
      border: { type: 'none' },
      style: {
        header: { fg: C.cyan || 'cyan', bold: true },
        cell: { fg: C.white || 'white' },
      },
      columns: this.columns,
      rows: [],
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Generate sample data - customize this for your data source
   */
  async getData() {
    // Sample data - replace with actual data fetching
    const sampleData = [
      ['Server 1', 'Online', Math.floor(Math.random() * 100) + '%'],
      ['Server 2', 'Online', Math.floor(Math.random() * 100) + '%'],
      ['Server 3', 'Warning', Math.floor(Math.random() * 100) + '%'],
      ['Server 4', 'Online', Math.floor(Math.random() * 100) + '%'],
      ['Server 5', 'Offline', '0%'],
    ];

    // Sort data
    const sorted = [...sampleData].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];
      const cmp = aVal.localeCompare(bVal);
      return this.sortAsc ? cmp : -cmp;
    });

    this.data = sorted.slice(0, this.maxRows);

    return {
      rows: this.data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Render the table with data
   */
  render(result) {
    if (!this.table || !result) return;

    this.table.setData({
      headers: this.columns,
      rows: result.rows,
    });
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
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

    if (this.table) {
      this.table.destroy();
      this.table = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`,
  },

  gauge: {
    name: 'Gauge Widget',
    description: 'Widget that displays a circular or linear gauge for single metrics',
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: options.description || 'A widget that displays metrics with a gauge',
      version: '1.0.0',
      author: author || '',
      category: options.category || 'monitoring',
      type: 'widget',
      lazyLoad: true,
      priority: 100,
      config: {
        gaugeType: 'circle',
        minValue: 0,
        maxValue: 100,
        refreshInterval: 2000,
        unit: '%',
      },
      __version: 1,
    }),

    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Gauge widget for displaying single metrics
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Gauge widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Gauge widget';

    // Gauge configuration
    this.gaugeType = this.config.gaugeType || 'circle';
    this.minValue = this.config.minValue || 0;
    this.maxValue = this.config.maxValue || 100;
    this.refreshInterval = this.config.refreshInterval || 2000;
    this.unit = this.config.unit || '%';

    // Widget state
    this.gauge = null;
    this.refreshTimer = null;
    this.currentValue = 0;
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');
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
      width: '30%',
      height: 10,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create ASCII gauge area
    this.gaugeArea = blessed.default.text({
      parent: this.box,
      top: 1,
      left: 'center',
      width: '90%',
      height: 6,
      tags: true,
      style: { fg: C.green || 'green' },
    });

    // Value display
    this.valueText = blessed.default.text({
      parent: this.box,
      bottom: 0,
      left: 'center',
      content: '0' + this.unit,
      style: { fg: C.white || 'white', bold: true },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Generate ASCII gauge
   */
  _renderAsciiGauge(percent, width = 20) {
    const filled = Math.round((percent / 100) * width);
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
    return bar;
  }

  /**
   * Generate sample data - customize this for your data source
   */
  async getData() {
    // Sample data - replace with actual data fetching
    const value = Math.floor(Math.random() * (this.maxValue - this.minValue) + this.minValue);
    this.currentValue = value;

    return {
      value: value,
      percentage: ((value - this.minValue) / (this.maxValue - this.minValue)) * 100,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Render the gauge with data
   */
  render(result) {
    if (!this.gaugeArea || !result) return;

    // Generate ASCII gauge
    const asciiGauge = this._renderAsciiGauge(result.percentage);
    
    // Color based on value
    let color = 'green';
    if (result.percentage > 80) {
      color = 'red';
    } else if (result.percentage > 60) {
      color = 'yellow';
    }

    // Update gauge display
    this.gaugeArea.setContent('{' + color + '-fg}' + asciiGauge + '{/' + color + '-fg}');
    
    // Update value text
    this.valueText.setContent(result.value + this.unit);
    this.valueText.style.fg = this.theme?.colors?.[color] || color;
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
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

    if (this.gaugeArea) {
      this.gaugeArea = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`,
  },

  logViewer: {
    name: 'Log Viewer Widget',
    description: 'Widget that displays scrolling log entries with filtering',
    manifest: (id, name, author, options = {}) => ({
      id,
      name: name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: options.description || 'A widget that displays scrolling log entries',
      version: '1.0.0',
      author: author || '',
      category: options.category || 'monitoring',
      type: 'widget',
      lazyLoad: true,
      priority: 100,
      config: {
        maxLines: 50,
        showTimestamp: true,
        filterLevels: ['info', 'warn', 'error'],
        refreshInterval: 1000,
      },
      __version: 1,
    }),

    widgetCode: (id, className) => `/**
 * ${className} Widget Plugin
 * Log viewer widget for displaying scrolling log entries
 */

import { BaseWidget } from 'claw-dashboard/widgets';

/**
 * ${className} - Log viewer widget for Claw Dashboard
 */
export default class ${className} extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || '${className}';
    this.description = options.description || 'Log viewer widget';

    // Log viewer configuration
    this.maxLines = this.config.maxLines || 50;
    this.showTimestamp = this.config.showTimestamp !== false;
    this.filterLevels = this.config.filterLevels || ['info', 'warn', 'error'];
    this.refreshInterval = this.config.refreshInterval || 1000;

    // Widget state
    this.logBox = null;
    this.refreshTimer = null;
    this.logEntries = [];
  }

  /**
   * Initialize the widget
   */
  async init() {
    this.log('info', '${className} widget initialized');

    // Add initial log entries
    this.addLogEntry('info', 'Log viewer initialized');
    this.addLogEntry('info', 'Waiting for log data...');

    return true;
  }

  /**
   * Add a log entry
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   */
  addLogEntry(level, message) {
    const entry = {
      level,
      message,
      timestamp: new Date(),
    };

    this.logEntries.push(entry);

    // Trim to max lines
    if (this.logEntries.length > this.maxLines) {
      this.logEntries.shift();
    }
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
      width: '70%',
      height: 15,
      border: { type: 'line' },
      label: ' ${className.toUpperCase()} ',
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Log entries box with scrolling
    this.logBox = blessed.default.log({
      parent: this.box,
      top: 1,
      left: 1,
      width: '98%',
      height: '90%',
      scrollable: true,
      scrollbar: {
        style: {
          bg: C.gray || 'gray',
        },
      },
      style: {
        fg: C.white || 'white',
        bg: C.black || 'black',
      },
    });

    this.loaded = true;
    this.log('debug', '${className} widget UI created');

    // Initial render
    this.renderLogs();

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Get filtered log entries
   */
  async getData() {
    // Sample log generation - replace with actual log fetching
    const levels = ['info', 'info', 'info', 'warn', 'error'];
    const messages = [
      'Request processed successfully',
      'Connection established',
      'Data synchronized',
      'High memory usage detected',
      'Failed to connect to service',
    ];

    // Randomly add new log entry
    if (Math.random() > 0.7) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      this.addLogEntry(level, message);
    }

    // Filter by level
    const filtered = this.logEntries.filter(entry =>
      this.filterLevels.includes(entry.level)
    );

    return {
      entries: filtered,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Render the log entries
   */
  renderLogs() {
    if (!this.logBox) return;

    this.logBox.setContent('');

    for (const entry of this.logEntries) {
      if (!this.filterLevels.includes(entry.level)) continue;

      let line = '';

      if (this.showTimestamp) {
        const time = entry.timestamp.toLocaleTimeString();
        line += '[' + time + '] ';
      }

      const levelStr = entry.level.toUpperCase().padEnd(5);
      line += '[' + levelStr + '] ' + entry.message;

      // Set color based on level
      const colorMap = {
        info: this.theme?.colors?.white || 'white',
        warn: this.theme?.colors?.yellow || 'yellow',
        error: this.theme?.colors?.red || 'red',
      };

      this.logBox.add(line, colorMap[entry.level] || 'white');
    }

    // Scroll to bottom
    this.logBox.setScrollPerc(100);
  }

  /**
   * Render the widget with data
   */
  render(result) {
    if (!result) return;
    this.renderLogs();
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const data = await this.getData();
          this.render(data);
        } catch (err) {
          this.log('error', 'Auto-refresh failed: ' + err.message);
        }
      }, this.refreshInterval);

      this.log('debug', 'Auto-refresh started (' + this.refreshInterval + 'ms)');
    }
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

    if (this.logBox) {
      this.logBox.destroy();
      this.logBox = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.logEntries = [];
    this.loaded = false;
    this.log('info', '${className} widget destroyed');
  }
}

export { ${className} };
`,
  },
};

/**
 * Converts a plugin ID to a valid JavaScript class name
 * @param {string} id - Plugin ID (e.g., "my-custom-widget")
 * @returns {string} Class name (e.g., "MyCustomWidget")
 */
function toClassName(id) {
  return id
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Validates a plugin ID
 * @param {string} id - Plugin ID
 * @returns {object} Validation result
 */
function validatePluginId(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'Plugin ID must be a non-empty string' };
  }

  if (id.length < 1 || id.length > 64) {
    return { valid: false, error: 'Plugin ID must be between 1 and 64 characters' };
  }

  // Check for valid characters
  const validPattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;
  if (!validPattern.test(id)) {
    return {
      valid: false,
      error: 'Plugin ID must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with a hyphen/underscore',
    };
  }

  // Check for reserved names
  const reservedNames = ['claw', 'dashboard', 'admin', 'system', 'test'];
  if (reservedNames.includes(id.toLowerCase())) {
    return { valid: false, error: `'${id}' is a reserved name` };
  }

  return { valid: true };
}

/**
 * Generate README content
 * @param {string} id - Plugin ID
 * @param {string} name - Plugin name
 * @param {string} templateType - Template type
 * @returns {string} README content
 */
function generateReadme(id, name, templateType) {
  const template = TEMPLATES[templateType] || TEMPLATES.basic;
  return `# ${name}

${template.description} for Claw Dashboard.

## Installation

1. Copy this directory to your Claw Dashboard plugins folder:
   \`\`\`bash
   cp -r ${id} ~/.openclaw/plugins/
   \`\`\`

2. Restart Claw Dashboard or reload plugins

## Configuration

Edit \`plugin.json\` to customize the widget:

\`\`\`json
{
  "config": {
    // See plugin.json for available options
  }
}
\`\`\`

## Development

### File Structure

\`\`\`
${id}/
├── plugin.json    # Plugin manifest
├── index.js       # Widget code
└── README.md      # This file
\`\`\`

### Testing

Run your widget in Claw Dashboard:

\`\`\`bash
clawdash --debug
\`\`\`

## API Reference

See [Claw Dashboard Plugin Documentation](https://github.com/spleck/claw-dashboard/blob/main/docs/PLUGINS.md) for full API reference.

## License

MIT
`;
}

/**
 * List available templates
 * @returns {object[]} Array of template info
 */
export function listTemplates() {
  return Object.entries(TEMPLATES).map(([key, template]) => ({
    id: key,
    name: template.name,
    description: template.description,
  }));
}

/**
 * Creates a plugin scaffold
 * @param {string} id - Plugin ID
 * @param {object} options - Options
 * @returns {object} Result
 */
export async function createPlugin(id, options = {}) {
  const {
    name,
    author,
    outputDir,
    template = 'basic',
    dryRun = false,
    force = false,
  } = options;

  // Validate plugin ID
  const validation = validatePluginId(id);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      code: 'INVALID_ID',
    };
  }

  // Validate template
  const selectedTemplate = TEMPLATES[template];
  if (!selectedTemplate) {
    return {
      success: false,
      error: `Unknown template: ${template}. Available: ${Object.keys(TEMPLATES).join(', ')}`,
      code: 'INVALID_TEMPLATE',
    };
  }

  // Determine output directory
  const pluginsDir = outputDir || join(homedir(), '.openclaw', 'plugins');
  const pluginDir = join(pluginsDir, id);

  // Check if plugin already exists
  if (existsSync(pluginDir) && !force) {
    return {
      success: false,
      error: `Plugin directory already exists: ${pluginDir}`,
      code: 'ALREADY_EXISTS',
      path: pluginDir,
    };
  }

  // Generate class name from ID
  const className = toClassName(id);

  // Generate files
  const files = {
    'plugin.json': JSON.stringify(
      selectedTemplate.manifest(id, name, author, options),
      null,
      2
    ),
    'index.js': selectedTemplate.widgetCode(id, className),
    'README.md': generateReadme(id, name || id, template),
  };

  // In dry-run mode, just return what would be created
  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      path: pluginDir,
      files: Object.keys(files),
      template,
    };
  }

  // Create directory
  try {
    mkdirSync(pluginDir, { recursive: true });
  } catch (err) {
    return {
      success: false,
      error: `Failed to create directory: ${err.message}`,
      code: 'MKDIR_ERROR',
    };
  }

  // Write files
  const createdFiles = [];
  for (const [filename, content] of Object.entries(files)) {
    const filePath = join(pluginDir, filename);
    try {
      writeFileSync(filePath, content);
      createdFiles.push(filename);
    } catch (err) {
      return {
        success: false,
        error: `Failed to write ${filename}: ${err.message}`,
        code: 'WRITE_ERROR',
        path: filePath,
      };
    }
  }

  return {
    success: true,
    path: pluginDir,
    files: createdFiles,
    id,
    className,
    template,
  };
}

/**
 * Main CLI handler
 * @param {string[]} args - CLI arguments
 * @returns {number} Exit code
 */
export async function runScaffoldCli(args) {
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(`
Plugin Scaffolding CLI for Claw Dashboard

Usage: clawdash create-plugin <id> [options]

Arguments:
  id                Plugin ID (kebab-case, e.g., "my-custom-widget")

Options:
  -t, --template    Template to use (basic, api, chart, table, gauge, logViewer)
                    Default: basic
  -n, --name        Display name for the widget
  -a, --author      Author name or email
  -c, --category    Widget category (system, monitoring, custom, example)
                    Default: custom
  --desc            Widget description
  -o, --output      Output directory (default: ~/.openclaw/plugins/)
  -f, --force       Overwrite existing plugin
  --dry-run         Show what would be created without creating it
  --list-templates  Show available templates
  -i, --interactive Start interactive mode (prompts for all options)
  -h, --help        Show this help message

Examples:
  clawdash create-plugin my-widget
  clawdash create-plugin api-status --template api --author "John Doe"
  clawdash create-plugin metrics --template chart --category monitoring
  clawdash create-plugin my-widget --interactive
  clawdash create-plugin --list-templates
`);
    return 0;
  }

  if (command === '--version' || command === '-v') {
    console.log('clawdash-create-plugin 1.1.0');
    return 0;
  }

  if (command === '--list-templates' || command === 'list-templates') {
    console.log('Available Templates:');
    console.log('');
    const templates = listTemplates();
    templates.forEach(t => {
      console.log(`  ${t.id.padEnd(12)} ${t.name}`);
      console.log(`              ${t.description}`);
      console.log('');
    });
    return 0;
  }

  // Parse arguments
  const options = {
    name: undefined,
    author: undefined,
    category: 'custom',
    description: undefined,
    template: 'basic',
    outputDir: undefined,
    force: false,
    dryRun: false,
  };

  let pluginId = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg.startsWith('-') && !pluginId) {
      pluginId = arg;
      continue;
    }

    switch (arg) {
      case '-t':
      case '--template':
        options.template = args[++i];
        break;
      case '-n':
      case '--name':
        options.name = args[++i];
        break;
      case '-a':
      case '--author':
        options.author = args[++i];
        break;
      case '-c':
      case '--category':
        options.category = args[++i];
        break;
      case '--desc':
        options.description = args[++i];
        break;
      case '-o':
      case '--output':
        options.outputDir = args[++i];
        break;
      case '-f':
      case '--force':
        options.force = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '-i':
      case '--interactive':
        options.interactive = true;
        break;
      case '-h':
      case '--help':
        // Already handled above
        break;
    }
  }

  // Handle interactive mode
  if (options.interactive) {
    const interactiveOptions = await runInteractiveMode();
    if (!interactiveOptions) {
      return 0; // User cancelled
    }
    // Merge interactive options with any passed CLI options
    Object.assign(options, interactiveOptions);
    pluginId = interactiveOptions.id;
  }

  if (!pluginId) {
    console.error('Error: Plugin ID is required');
    console.error('Run with --help for usage information');
    return 1;
  }

  const result = await createPlugin(pluginId, options);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    return 1;
  }

  if (result.dryRun) {
    console.log('Dry run - would create:');
    console.log(`  Directory: ${result.path}`);
    console.log(`  Template: ${result.template}`);
    console.log('  Files:');
    result.files.forEach(f => console.log(`    - ${f}`));
  } else {
    console.log(`✓ Created plugin: ${pluginId}`);
    console.log(`  Path: ${result.path}`);
    console.log(`  Template: ${result.template}`);
    console.log(`  Files: ${result.files.join(', ')}`);
    console.log('');
    console.log('Next steps:');
    console.log(`  1. Edit ${result.path}/index.js to implement your widget`);
    console.log(`  2. Update ${result.path}/plugin.json with your configuration`);
    console.log('  3. Run clawdash to see your widget in action');
  }

  return 0;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const exitCode = await runScaffoldCli(process.argv.slice(2));
    process.exit(exitCode);
  })();
}
