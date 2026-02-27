/**
 * System Metrics Chart Widget Plugin
 * Demonstrates data visualization capabilities using blessed-contrib line charts
 *
 * This example shows:
 * - Creating line charts with blessed-contrib
 * - Managing time-series data with configurable history
 * - Multiple metric support (CPU, memory, network)
 * - Dynamic data updates with smooth rendering
 * - Theme integration for consistent styling
 */

import { BaseWidget } from '../../../src/widgets/plugin-api.js';

/**
 * SystemMetricsChartWidget - Displays real-time system metrics as line charts
 *
 * Uses blessed-contrib line charts to visualize:
 * - CPU usage percentage over time
 * - Memory usage percentage over time
 * - Network I/O rates over time
 */
export default class SystemMetricsChartWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'System Metrics Chart';
    this.description = 'Real-time system metrics visualization with line charts';

    // Chart configuration
    this.metricType = this.config.metricType || 'cpu';
    this.maxDataPoints = this.config.maxDataPoints || 30;
    this.refreshInterval = this.config.refreshInterval || 2000;
    this.showLegend = this.config.showLegend !== false;
    this.chartHeight = this.config.chartHeight || 15;

    // Data storage for time series
    this.dataHistory = {
      cpu: { labels: [], values: [] },
      memory: { labels: [], values: [] },
      network: { labels: [], values: [] },
    };

    // Widget state
    this.chart = null;
    this.refreshTimer = null;
    this.initialized = false;
  }

  /**
   * Initialize the widget
   * Called once when the widget is first loaded
   */
  async init() {
    this.log('info', `System Metrics Chart initialized (metric: ${this.metricType})`);
    return true;
  }

  /**
   * Create the widget UI with blessed-contrib line chart
   * @param {Object} screen - Blessed screen object
   * @param {Object} theme - Theme colors
   */
  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');
    const contrib = await import('blessed-contrib');

    this.screen = screen;
    this.theme = theme;

    // Create main container box
    this.box = blessed.default.box({
      parent: screen,
      width: '70%',
      height: this.chartHeight + 2,
      border: { type: 'line' },
      label: ` SYSTEM METRICS (${this.metricType.toUpperCase()}) `,
      style: {
        border: { fg: C.cyan || 'cyan' },
      },
    });

    // Create the line chart using blessed-contrib
    this.chart = contrib.default.line({
      parent: this.box,
      top: 1,
      left: 1,
      width: '95%',
      height: this.chartHeight - 2,
      style: {
        line: C.green || 'green',
        text: C.white || 'white',
        baseline: C.gray || 'gray',
      },
      xLabelPadding: 3,
      xPadding: 5,
      numYLabels: 5,
      showNthLabel: Math.ceil(this.maxDataPoints / 6),
      showLegend: this.showLegend,
      legend: {
        width: 12,
      },
      minY: 0,
      maxY: 100,
      wholeNumbersOnly: true,
    });

    // Add metric info text
    this.infoText = blessed.default.text({
      parent: this.box,
      bottom: 0,
      left: 1,
      content: 'Initializing...',
      style: {
        fg: C.gray || 'gray',
      },
    });

    this.loaded = true;
    this.initialized = true;
    this.log('debug', 'System Metrics Chart UI created');

    // Start auto-refresh
    this.startAutoRefresh();

    return this;
  }

  /**
   * Generate sample metrics data
   * In a real implementation, this would fetch from system APIs
   */
  async getData() {
    const now = new Date();
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Generate realistic-looking data based on metric type
    let value;
    let unit;

    switch (this.metricType) {
      case 'cpu': {
        // Simulate CPU percentage with some randomness but realistic patterns
        const baseLoad = 30;
        const variance = Math.random() * 40;
        const spike = Math.random() > 0.9 ? 20 : 0; // Occasional spike
        value = Math.min(100, Math.max(0, Math.floor(baseLoad + variance + spike)));
        unit = '%';
        break;
      }
      case 'memory': {
        // Simulate memory percentage (trending data)
        const baseMem = 50;
        const memVariance = Math.random() * 20;
        value = Math.min(100, Math.max(0, Math.floor(baseMem + memVariance)));
        unit = '%';
        break;
      }
      case 'network': {
        // Simulate network rate (0-50 MB/s)
        value = Math.floor(Math.random() * 50);
        unit = ' MB/s';
        break;
      }
      default: {
        value = Math.floor(Math.random() * 100);
        unit = '';
      }
    }

    // Store in history
    const history = this.dataHistory[this.metricType];
    history.labels.push(timeLabel);
    history.values.push(value);

    // Trim to max data points
    if (history.labels.length > this.maxDataPoints) {
      history.labels.shift();
      history.values.shift();
    }

    return {
      metricType: this.metricType,
      currentValue: value,
      unit,
      timestamp: now.toISOString(),
      labels: [...history.labels],
      values: [...history.values],
      dataPoints: history.values.length,
    };
  }

  /**
   * Render the chart with data
   * @param {Object} data - Metrics data from getData()
   */
  render(data) {
    if (!this.chart || !data) return;

    // Prepare chart data format for blessed-contrib
    const chartData = {
      title: `${this.metricType.toUpperCase()}`,
      x: data.labels,
      y: data.values,
      style: this.getMetricStyle(this.metricType),
    };

    // Update the chart
    this.chart.setData([chartData]);

    // Update info text
    const avg = data.values.length > 0
      ? Math.floor(data.values.reduce((a, b) => a + b, 0) / data.values.length)
      : 0;
    const current = data.currentValue;
    const max = data.values.length > 0 ? Math.max(...data.values) : 0;

    this.infoText.setContent(
      `Current: ${current}${data.unit} | Average: ${avg}${data.unit} | Peak: ${max}${data.unit} | Points: ${data.dataPoints}/${this.maxDataPoints}`
    );
  }

  /**
   * Get style configuration for different metric types
   * @param {string} metricType - Type of metric
   * @returns {Object} Style configuration
   */
  getMetricStyle(metricType) {
    const C = this.theme?.colors || {};

    const styles = {
      cpu: {
        line: C.green || 'green',
        text: C.brightGreen || 'bright-green',
      },
      memory: {
        line: C.yellow || 'yellow',
        text: C.brightYellow || 'bright-yellow',
      },
      network: {
        line: C.cyan || 'cyan',
        text: C.brightCyan || 'bright-cyan',
      },
    };

    return styles[metricType] || styles.cpu;
  }

  /**
   * Switch to display a different metric type
   * @param {string} metricType - Metric type ('cpu', 'memory', 'network')
   */
  switchMetric(metricType) {
    if (!['cpu', 'memory', 'network'].includes(metricType)) {
      this.log('warn', `Invalid metric type: ${metricType}`);
      return;
    }

    this.metricType = metricType;

    // Update label
    if (this.box) {
      this.box.setLabel(` SYSTEM METRICS (${metricType.toUpperCase()}) `);
    }

    // Adjust chart scale for network (different range)
    if (this.chart && metricType === 'network') {
      this.chart.options.maxY = 50; // MB/s
    } else if (this.chart) {
      this.chart.options.maxY = 100; // percentage
    }

    this.log('info', `Switched to ${metricType} metric display`);

    // Trigger immediate refresh
    this.getData().then(data => this.render(data));
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
          this.log('error', `Auto-refresh failed: ${err.message}`);
        }
      }, this.refreshInterval);

      this.log('debug', `Auto-refresh started (${this.refreshInterval}ms)`);
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
   * Destroy the widget and clean up resources
   */
  async destroy() {
    this.stopAutoRefresh();

    // Clear data history
    this.dataHistory = {
      cpu: { labels: [], values: [] },
      memory: { labels: [], values: [] },
      network: { labels: [], values: [] },
    };

    if (this.chart) {
      this.chart = null;
    }

    if (this.box) {
      this.box.destroy();
      this.box = null;
    }

    this.loaded = false;
    this.initialized = false;
    this.log('info', 'System Metrics Chart widget destroyed');
  }
}

// Export named export for flexibility
export { SystemMetricsChartWidget };
