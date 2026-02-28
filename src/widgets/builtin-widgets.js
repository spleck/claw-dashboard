/**
 * Built-in System Widgets for Claw Dashboard
 * Each widget module can be lazy loaded on demand
 */

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { BaseWidget } from './plugin-api.js';

/**
 * CPU Widget - Displays CPU usage with gauge and sparkline
 */
export class CpuWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'CPU';
    this.description = 'CPU usage and history';
    this.history = [];
    this.maxHistory = 60;
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' CPU ',
      style: { border: { fg: C.cyan || 'cyan' } },
    });

    this.valueText = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: '0%',
      style: { fg: C.brightGreen || 'bright-green', bold: true },
    });

    this.detailText = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '',
      style: { fg: C.gray || 'gray' },
    });

    return this;
  }

  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider('cpu');
    }
    return null;
  }

  update(data) {
    if (!data || !this.box) return;

    const percent = data.avg || 0;
    const cores = data.cores || 1;

    // Update history
    this.history.push(percent);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Update display
    const color = percent > 90 ? 'red' : percent > 70 ? 'yellow' : 'green';
    const gaugeWidth = 15;
    const filled = Math.round((percent / 100) * gaugeWidth);
    const gauge = '█'.repeat(filled) + '░'.repeat(gaugeWidth - filled);

    this.valueText.setContent(`{${color}-fg}${percent}%{/${color}-fg} ${gauge}`);
    this.detailText.setContent(`${cores} cores`);
  }

  render(data) {
    this.update(data);
  }
}

/**
 * Memory Widget - Displays memory usage with gauge and sparkline
 */
export class MemoryWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'Memory';
    this.description = 'Memory usage and history';
    this.history = [];
    this.maxHistory = 60;
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' MEMORY ',
      style: { border: { fg: C.magenta || 'magenta' } },
    });

    this.valueText = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: '0%',
      style: { fg: C.brightMagenta || 'bright-magenta', bold: true },
    });

    this.detailText = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '',
      style: { fg: C.gray || 'gray' },
    });

    return this;
  }

  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider('memory');
    }
    return null;
  }

  update(data) {
    if (!data || !this.box) return;

    const percent = data.percent || 0;
    const used = data.used || 0;
    const total = data.total || 0;

    // Update history
    this.history.push(percent);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Update display
    const color = percent > 90 ? 'red' : percent > 75 ? 'yellow' : 'green';
    const gaugeWidth = 15;
    const filled = Math.round((percent / 100) * gaugeWidth);
    const gauge = '█'.repeat(filled) + '░'.repeat(gaugeWidth - filled);

    this.valueText.setContent(`{${color}-fg}${percent}%{/${color}-fg} ${gauge}`);
    this.detailText.setContent(`${used}/${total} GB`);
  }

  render(data) {
    this.update(data);
  }
}

/**
 * GPU Widget - Displays GPU information
 */
export class GpuWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'GPU';
    this.description = 'GPU usage and temperature';
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' GPU ',
      style: { border: { fg: C.yellow || 'yellow' } },
    });

    this.valueText = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: 'Detecting...',
      style: { fg: C.brightYellow || 'bright-yellow', bold: true },
    });

    this.detailText = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '',
      style: { fg: C.gray || 'gray' },
    });

    return this;
  }

  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider('gpu');
    }
    return null;
  }

  update(data) {
    if (!this.box) return;

    if (!data) {
      this.valueText.setContent('Not detected');
      this.detailText.setContent('');
      return;
    }

    const utilization = data.utilization;
    const temp = data.temperature;
    const short = data.short || 'GPU';

    let value = short;
    if (utilization !== null) {
      value += ` ${utilization}%`;
    }
    if (temp !== null) {
      value += ` ${temp}°C`;
    }

    this.valueText.setContent(value);
    this.detailText.setContent(data.memoryUsed && data.memoryTotal
      ? `${data.memoryUsed}/${data.memoryTotal} GB`
      : '');
  }

  render(data) {
    this.update(data);
  }
}

/**
 * Network Widget - Displays network activity
 */
export class NetworkWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'Network';
    this.description = 'Network activity';
    this.history = [];
    this.maxHistory = 30;
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' NETWORK ',
      style: { border: { fg: C.brightCyan || 'bright-cyan' } },
    });

    this.valueText = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: 'Loading...',
      style: { fg: C.brightCyan || 'bright-cyan', bold: true },
    });

    this.detailText = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '',
      style: { fg: C.gray || 'gray' },
    });

    this.sparkline = contrib.sparkline({
      parent: this.box,
      top: 2,
      left: 'center',
      width: 20,
      height: 1,
      style: { fg: C.cyan || 'cyan' },
    });

    return this;
  }

  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider('network');
    }
    return null;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  update(data) {
    if (!data || !this.box) return;

    const iface = data.interface || 'unknown';
    const rx = data.rxSec || 0;
    const tx = data.txSec || 0;
    const total = rx + tx;

    // Update history
    this.history.push(total);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.valueText.setContent(iface);
    this.detailText.setContent(`↓${this.formatBytes(rx)} ↑${this.formatBytes(tx)}`);

    if (this.sparkline && this.history.length > 1) {
      this.sparkline.setData([this.history]);
    }
  }

  render(data) {
    this.update(data);
  }
}

/**
 * Disk Widget - Displays disk usage
 */
export class DiskWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'Disk';
    this.description = 'Disk usage';
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' DISK ',
      style: { border: { fg: C.green || 'green' } },
    });

    this.valueText = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: '0%',
      style: { fg: C.brightGreen || 'bright-green', bold: true },
    });

    this.detailText = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '',
      style: { fg: C.gray || 'gray' },
    });

    return this;
  }

  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider('disk');
    }
    return null;
  }

  update(data) {
    if (!data || !this.box) return;

    const percent = data.percent || 0;
    const used = data.used || 0;
    const size = data.size || 0;

    const color = percent > 90 ? 'red' : percent > 80 ? 'yellow' : 'green';
    const gaugeWidth = 15;
    const filled = Math.round((percent / 100) * gaugeWidth);
    const gauge = '█'.repeat(filled) + '░'.repeat(gaugeWidth - filled);

    this.valueText.setContent(`{${color}-fg}${percent}%{/${color}-fg} ${gauge}`);
    this.detailText.setContent(`${used}/${size} GB`);
  }

  render(data) {
    this.update(data);
  }
}

/**
 * System Widget - Displays system information
 */
export class SystemWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'System';
    this.description = 'System information';
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' SYSTEM ',
      style: { border: { fg: C.gray || 'gray' } },
    });

    this.line1 = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: '...',
      style: { fg: C.gray || 'gray' },
    });

    this.line2 = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '',
      style: { fg: C.gray || 'gray' },
    });

    return this;
  }

  async getData(dataProvider) {
    if (dataProvider) {
      return dataProvider('system');
    }
    return null;
  }

  update(data) {
    if (!data || !this.box) return;

    const platform = data.platform || '';
    const release = data.release || '';
    const arch = data.arch || '';
    const container = data.isContainer ? ' [container]' : '';

    this.line1.setContent(`${platform} ${release}`);
    this.line2.setContent(`${arch}${container}`);
  }

  render(data) {
    this.update(data);
  }
}

/**
 * Uptime Widget - Displays system and claw uptime
 */
export class UptimeWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'Uptime';
    this.description = 'System and OpenClaw uptime';
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' UPTIME ',
      style: { border: { fg: C.brightMagenta || 'bright-magenta' } },
    });

    this.sysText = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: 'Sys: --',
      style: { fg: C.brightMagenta || 'bright-magenta', bold: true },
    });

    this.clawText = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: 'Claw: --',
      style: { fg: C.brightMagenta || 'bright-magenta', bold: true },
    });

    return this;
  }

  async getData(dataProvider) {
    if (dataProvider) {
      const [sysUptime, clawUptime] = await Promise.all([
        dataProvider('uptime'),
        dataProvider('clawUptime'),
      ]);
      return { sysUptime, clawUptime };
    }
    return null;
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  update(data) {
    if (!data || !this.box) return;

    const sysUptime = data.sysUptime || 0;
    const clawUptime = data.clawUptime || 0;

    this.sysText.setContent(`Sys: ${this.formatUptime(sysUptime)}`);
    this.clawText.setContent(`Claw: ${this.formatUptime(clawUptime)}`);
  }

  render(data) {
    this.update(data);
  }
}

/**
 * Data Health Widget - Shows data freshness
 */
export class DataHealthWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'Data Health';
    this.description = 'Data freshness indicators';
    this.lastUpdate = null;
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' DATA HEALTH ',
      style: { border: { fg: C.green || 'green' } },
    });

    this.statusText = blessed.text({
      parent: this.box,
      top: 0,
      left: 'center',
      content: 'All Fresh',
      style: { fg: C.brightGreen || 'bright-green', bold: true },
    });

    this.detailText = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: '',
      style: { fg: C.gray || 'gray' },
    });

    return this;
  }

  async getData(dataProvider) {
    // This widget tracks its own update time
    return { timestamp: Date.now() };
  }

  update(data) {
    if (!this.box) return;

    const now = Date.now();
    if (data?.timestamp) {
      this.lastUpdate = data.timestamp;
    }

    if (!this.lastUpdate) {
      this.statusText.setContent('Waiting...');
      return;
    }

    const age = now - this.lastUpdate;
    const ageSec = Math.floor(age / 1000);

    let status = 'All Fresh';
    let color = 'green';
    let detail = `${ageSec}s ago`;

    if (age > 30000) {
      status = 'Stale';
      color = 'red';
      detail = `Last update: ${ageSec}s ago`;
    } else if (age > 10000) {
      status = 'Aging';
      color = 'yellow';
      detail = `${ageSec}s since last refresh`;
    }

    this.statusText.setContent(`{${color}-fg}${status}{/${color}-fg}`);
    this.detailText.setContent(detail);
  }

  render(data) {
    this.update(data);
  }
}

/**
 * Settings Widget - Interactive settings panel for user preferences
 * Allows users to modify theme, refresh rate, and other settings
 */
export class SettingsWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'Settings';
    this.description = 'User preferences configuration';
    this.settings = options.settings || {};
    this.onSettingsChange = options.onSettingsChange || null;
    this.onSave = options.onSave || null;
    this.currentIndex = 0;
    this.isEditing = false;
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};

    this.box = blessed.box({
      parent: screen,
      height: 12,
      border: { type: 'line' },
      label: ' SETTINGS ',
      style: { border: { fg: C.cyan || 'cyan' } },
    });

    this.instructionsText = blessed.text({
      parent: this.box,
      top: 0,
      left: 0,
      right: 0,
      content: ' {cyan-fg}j/k{/cyan-fg} navigate  {cyan-fg}enter{/cyan-fg} edit  {cyan-fg}s{/cyan-fg} save  {cyan-fg}q{/cyan-fg} close',
      style: { fg: C.gray || 'gray' },
    });

    this.settingsList = blessed.list({
      parent: this.box,
      top: 1,
      left: 0,
      right: 0,
      bottom: 0,
      keys: true,
      interactive: false,
      style: {
        item: { fg: C.white || 'white' },
        selected: { fg: C.black || 'black', bg: C.cyan || 'cyan', bold: true },
        focus: { fg: C.black || 'black', bg: C.cyan || 'cyan' },
      },
    });

    // Set up keyboard navigation
    this.setupKeys();

    return this;
  }

  setupKeys() {
    this.settingsList.key(['j', 'down'], () => {
      if (!this.isEditing) {
        this.currentIndex = Math.min(this.currentIndex + 1, this.getSettingsCount() - 1);
        this.updateSelection();
      }
    });

    this.settingsList.key(['k', 'up'], () => {
      if (!this.isEditing) {
        this.currentIndex = Math.max(this.currentIndex - 1, 0);
        this.updateSelection();
      }
    });

    this.settingsList.key(['g', 'home'], () => {
      if (!this.isEditing) {
        this.currentIndex = 0;
        this.updateSelection();
      }
    });

    this.settingsList.key(['G', 'end'], () => {
      if (!this.isEditing) {
        this.currentIndex = this.getSettingsCount() - 1;
        this.updateSelection();
      }
    });

    this.settingsList.key(['enter', 'space'], () => {
      this.editCurrentSetting();
    });

    this.settingsList.key('s', () => {
      this.saveSettings();
    });

    this.settingsList.key(['q', 'escape'], () => {
      if (this.onClose) this.onClose();
    });

    // Focus the list
    this.settingsList.focus();
  }

  getSettingsCount() {
    // Theme, Refresh Rate, Log Level, Show/Hide Widgets (8), Export Format
    return 12;
  }

  getSettingsOptions() {
    return [
      { key: 'theme', label: 'Theme', options: ['auto', 'default', 'dark', 'high-contrast', 'ocean'] },
      { key: 'refreshInterval', label: 'Refresh Rate', options: ['1000ms', '2000ms', '5000ms', '10000ms'] },
      { key: 'logLevelFilter', label: 'Log Level', options: ['all', 'error', 'warn', 'info', 'debug'] },
      { key: 'showWidget1', label: 'Show CPU Widget', options: ['ON', 'OFF'] },
      { key: 'showWidget2', label: 'Show Memory Widget', options: ['ON', 'OFF'] },
      { key: 'showWidget3', label: 'Show GPU Widget', options: ['ON', 'OFF'] },
      { key: 'showWidget4', label: 'Show Network Widget', options: ['ON', 'OFF'] },
      { key: 'showWidget5', label: 'Show Disk Widget', options: ['ON', 'OFF'] },
      { key: 'showWidget6', label: 'Show System Widget', options: ['ON', 'OFF'] },
      { key: 'showWidget7', label: 'Show Uptime Widget', options: ['ON', 'OFF'] },
      { key: 'showWidget8', label: 'Show Data Health Widget', options: ['ON', 'OFF'] },
      { key: 'exportFormat', label: 'Export Format', options: ['json', 'csv'] },
    ];
  }

  formatSettingRow(option, index) {
    const currentValue = this.settings[option.key];
    let displayValue;

    if (option.key === 'refreshInterval') {
      displayValue = `${currentValue}ms`;
    } else if (option.key.startsWith('showWidget')) {
      displayValue = currentValue !== false ? 'ON' : 'OFF';
    } else {
      displayValue = currentValue || 'auto';
    }

    const label = option.label.padEnd(25, ' ');
    const isSelected = index === this.currentIndex;
    const prefix = isSelected ? '> ' : '  ';

    return `${prefix}${label} ${displayValue}`;
  }

  updateDisplay() {
    if (!this.settingsList) return;

    const options = this.getSettingsOptions();
    const items = options.map((opt, idx) => this.formatSettingRow(opt, idx));
    this.settingsList.setItems(items);
    this.updateSelection();
  }

  updateSelection() {
    if (this.settingsList) {
      this.settingsList.select(this.currentIndex);
      this.box.screen.render();
    }
  }

  editCurrentSetting() {
    const options = this.getSettingsOptions();
    const option = options[this.currentIndex];
    if (!option) return;

    const currentValue = this.settings[option.key];

    if (option.key === 'refreshInterval') {
      // Cycle through refresh intervals
      const intervals = [1000, 2000, 5000, 10000];
      const currentIdx = intervals.indexOf(currentValue);
      const nextIdx = (currentIdx + 1) % intervals.length;
      this.settings[option.key] = intervals[nextIdx];
    } else if (option.key.startsWith('showWidget')) {
      // Toggle boolean
      this.settings[option.key] = currentValue === false;
    } else if (option.options) {
      // Cycle through options
      const currentIdx = option.options.indexOf(currentValue);
      const nextIdx = (currentIdx + 1) % option.options.length;
      this.settings[option.key] = option.options[nextIdx];
    }

    this.updateDisplay();

    // Notify of immediate change
    if (this.onSettingsChange) {
      this.onSettingsChange({ [option.key]: this.settings[option.key] });
    }
  }

  saveSettings() {
    if (this.onSave) {
      this.onSave(this.settings);
    }
    // Show brief feedback
    this.instructionsText.setContent(' {green-fg}Settings saved!{/green-fg}');
    setTimeout(() => {
      this.instructionsText.setContent(' {cyan-fg}j/k{/cyan-fg} navigate  {cyan-fg}enter{/cyan-fg} edit  {cyan-fg}s{/cyan-fg} save  {cyan-fg}q{/cyan-fg} close');
      this.box.screen.render();
    }, 1000);
  }

  async getData(dataProvider) {
    // Settings widget shows current settings
    return { settings: this.settings };
  }

  update(data) {
    if (data?.settings) {
      this.settings = data.settings;
    }
    this.updateDisplay();
  }

  render(data) {
    this.update(data);
  }

  focus() {
    if (this.settingsList) {
      this.settingsList.focus();
    }
  }
}

/**
 * Widget registry - maps widget types to classes
 */
export const WIDGET_REGISTRY = {
  cpu: CpuWidget,
  memory: MemoryWidget,
  gpu: GpuWidget,
  network: NetworkWidget,
  disk: DiskWidget,
  system: SystemWidget,
  uptime: UptimeWidget,
  dataHealth: DataHealthWidget,
  settings: SettingsWidget,
};

/**
 * Create a widget instance
 * @param {string} type - Widget type
 * @param {Object} options - Widget options
 */
export function createWidget(type, options = {}) {
  const WidgetClass = WIDGET_REGISTRY[type];
  if (!WidgetClass) {
    throw new Error(`Unknown widget type: ${type}`);
  }
  return new WidgetClass(options);
}

/**
 * Get all available widget types
 */
export function getWidgetTypes() {
  return Object.keys(WIDGET_REGISTRY);
}

export default {
  CpuWidget,
  MemoryWidget,
  GpuWidget,
  NetworkWidget,
  DiskWidget,
  SystemWidget,
  UptimeWidget,
  DataHealthWidget,
  SettingsWidget,
  createWidget,
  getWidgetTypes,
  WIDGET_REGISTRY,
};
