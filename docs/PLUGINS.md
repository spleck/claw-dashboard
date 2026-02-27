# Claw Dashboard Widget Plugin System

The Claw Dashboard now supports **lazy loading** of widgets and a **plugin API** for third-party widgets.

## Features

- **Lazy Loading**: Widgets are loaded on-demand, improving startup performance
- **Plugin API**: Stable API for developing third-party widgets
- **Built-in Widgets**: All built-in widgets use the lazy loading system
- **Auto-Discovery**: Plugins are automatically discovered from `~/.openclaw/plugins/`

## Quick Start

### Creating a Custom Widget Plugin

1. Create a directory in `~/.openclaw/plugins/my-widget/`
2. Create `plugin.json` manifest
3. Create `index.js` with your widget code

### Plugin Structure

```
~/.openclaw/plugins/
└── my-widget/
    ├── plugin.json
    └── index.js
```

### Plugin Manifest (plugin.json)

```json
{
  "id": "my-custom-widget",
  "name": "My Custom Widget",
  "description": "A custom widget for the dashboard",
  "version": "1.0.0",
  "author": "Your Name",
  "category": "custom",
  "type": "widget",
  "lazyLoad": true,
  "config": {
    "title": "Custom Widget",
    "refreshInterval": 5000
  }
}
```

### Widget Code (index.js)

```javascript
import { BaseWidget } from 'claw-dashboard/widgets';

export default class MyCustomWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.name = options.name || 'Custom Widget';
    this.data = null;
  }

  async create(screen, theme) {
    // Create blessed elements
    const blessed = require('blessed');

    this.box = blessed.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ` ${this.name} `,
      style: { border: { fg: 'cyan' } },
    });

    this.content = blessed.text({
      parent: this.box,
      top: 1,
      left: 'center',
      content: 'Loading...',
    });

    return this;
  }

  async getData(dataProvider) {
    // Fetch data from built-in providers or custom sources
    return dataProvider ? await dataProvider('cpu') : null;
  }

  render(data) {
    if (!this.box || !data) return;
    this.content.setContent(`CPU: ${data.avg}%`);
  }
}
```

## Plugin API Reference

### BaseWidget Class

All custom widgets should extend `BaseWidget`:

```javascript
class MyWidget extends BaseWidget {
  // Required methods
  async create(screen, theme)   // Create UI elements
  async getData(provider)       // Fetch widget data
  async render(data)            // Update display

  // Optional methods
  async init()                  // Initialize (called once)
  async destroy()               // Cleanup (called on unload)
  show()                        // Show widget
  hide()                        // Hide widget
}
```

### PluginAPI

The PluginAPI provides access to dashboard functionality:

```javascript
// Register extension points
api.registerExtensionPoint('header', {
  description: 'Add items to header',
  multiple: true,
});

// Extend functionality
api.extend('header', handler, { priority: 100 });

// Register data providers
api.registerDataProvider('custom', async () => {
  return await fetchCustomData();
});

// Access system metrics
const cpu = await api.getMetrics('cpu');
const memory = await api.getMetrics('memory');

// Create UI components
const box = api.createComponent('box', {
  top: 0,
  left: 0,
  width: 20,
  height: 5,
});

// Logging
api.log('debug', 'Debug message');
api.log('info', 'Info message');
api.log('warn', 'Warning');
api.log('error', 'Error!');

// Configuration
const config = api.getConfig('my-widget', { default: 'value' });
await api.saveConfig('my-widget', { key: 'value' });
```

## Plugin Manifest Schema

The `plugin.json` file defines your widget's metadata and configuration. All fields are validated on load.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier for the plugin (kebab-case recommended) |
| `name` | `string` | Display name for the widget |
| `version` | `string` | Semantic version (e.g., "1.0.0") |
| `type` | `string` | Plugin type: `"widget"` |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | `string` | `""` | Brief description of the widget |
| `author` | `string` | `""` | Author name or email |
| `category` | `string` | `"custom"` | Category for organization: `"system"`, `"monitoring"`, `"custom"`, `"example"` |
| `lazyLoad` | `boolean` | `true` | Whether to defer loading until needed |
| `priority` | `number` | `100` | Loading priority (lower = earlier) |
| `config` | `object` | `{}` | Default configuration values |
| `entryPoint` | `string` | `"index.js"` | Main JavaScript file (deprecated, use standard `index.js`) |

### Complete Manifest Example

```json
{
  "id": "my-custom-widget",
  "name": "My Custom Widget",
  "description": "A widget that displays custom data with visualization",
  "version": "1.2.0",
  "author": "Your Name <you@example.com>",
  "category": "monitoring",
  "type": "widget",
  "lazyLoad": true,
  "priority": 50,
  "config": {
    "refreshInterval": 5000,
    "maxDataPoints": 30,
    "theme": "auto",
    "enabled": true
  }
}
```

### Field Constraints

- **id**: Must be unique across all plugins. Valid characters: alphanumeric, hyphens, underscores
- **version**: Must follow semantic versioning (major.minor.patch)
- **category**: Standard categories are `"system"`, `"monitoring"`, `"custom"`, `"example"`
- **priority**: Range 0-1000, where lower numbers load earlier
- **config**: JSON-serializable object with primitive values, arrays, and nested objects

### Manifest Validation Errors

The widget loader validates manifests and reports specific errors:

- `Missing required fields: id, name, version`
- `Invalid version format: expected semver (e.g., 1.0.0)`
- `Duplicate plugin id: my-widget`
- `Invalid category: must be one of system, monitoring, custom, example`

## Widget Lifecycle Hooks

Widgets follow a well-defined lifecycle. Each hook is called at specific points during the widget's existence.

### Lifecycle Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Load   │────▶│  Init   │────▶│ Create  │────▶│ getData │────▶│ Render  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
                                                                            │
     ┌───────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────┐     ┌─────────┐
│  Show   │────▶│ Destroy │
└─────────┘     └─────────┘
```

### Hook Reference

#### `init()`

Called once when the widget is first loaded. Use this for one-time initialization.

**Timing:** After the widget class is instantiated, before `create()`
**Returns:** `Promise<boolean>` - Return `true` to proceed, `false` to prevent loading

```javascript
async init() {
  // Initialize state
  this.cache = new Map();
  this.requestCount = 0;

  // Validate configuration
  if (!this.config.apiKey) {
    this.log('error', 'API key required');
    return false;
  }

  // Setup external connections
  this.client = new ApiClient(this.config.apiKey);
  await this.client.connect();

  this.log('info', 'Widget initialized');
  return true;
}
```

**Best Practices:**
- Validate configuration and return `false` if required settings are missing
- Initialize internal state and caches
- Set up external connections (API clients, databases)
- Avoid creating UI elements here (do that in `create()`)

---

#### `create(screen, theme)`

Create the widget's UI elements using blessed. This is where you define the visual appearance.

**Parameters:**
- `screen` (`blessed.Screen`) - The blessed screen instance
- `theme` (`Object`) - Theme colors and styling

**Returns:** `Promise<Object>` - Returns `this` for chaining

```javascript
async create(screen, theme = {}) {
  const C = theme.colors || {};
  const blessed = await import('blessed');

  // Main container
  this.box = blessed.default.box({
    parent: screen,
    width: '50%',
    height: 10,
    border: { type: 'line' },
    label: ' MY WIDGET ',
    style: {
      border: { fg: C.cyan || 'cyan' },
    },
  });

  // Child elements
  this.titleText = blessed.default.text({
    parent: this.box,
    top: 0,
    left: 'center',
    style: { fg: C.brightCyan || 'bright-cyan', bold: true },
  });

  this.contentText = blessed.default.text({
    parent: this.box,
    top: 2,
    left: 1,
    wrap: true,
    style: { fg: C.white || 'white' },
  });

  this.loaded = true;
  return this;
}
```

**Best Practices:**
- Always set `parent: screen` or `parent: this.box` for proper rendering
- Use theme colors for consistent styling
- Store element references (e.g., `this.titleText`) for later updates
- Set `this.loaded = true` when complete

---

#### `getData()`

Fetch and return data for the widget. Called before each render cycle.

**Returns:** `Promise<Object>` - Data to pass to `render()`

```javascript
async getData() {
  const startTime = Date.now();

  try {
    // Fetch from API
    const response = await fetch(this.config.apiUrl);
    const data = await response.json();

    // Process data
    return {
      items: data.results,
      count: data.total,
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    this.log('error', `Data fetch failed: ${err.message}`);

    // Return error state
    return {
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

**Best Practices:**
- Always return an object, even on error
- Include timestamps for cache validation
- Handle errors gracefully - don't throw
- Use `this.log()` for debugging
- Respect rate limits with `RateLimiter`

---

#### `render(data)`

Update the widget display with new data. This should be fast and synchronous where possible.

**Parameters:**
- `data` (`Object`) - The data returned from `getData()`

```javascript
render(data) {
  if (!this.box) return;

  if (data.error) {
    this.titleText.setContent('Error');
    this.contentText.setContent(data.error);
    this.contentText.style.fg = 'red';
    return;
  }

  // Update display
  this.titleText.setContent(`${data.count} Items`);
  this.contentText.setContent(
    data.items.slice(0, 5).map(item => item.name).join('\n')
  );

  // Update footer
  if (this.footerText) {
    this.footerText.setContent(`Updated: ${data.timestamp}`);
  }
}
```

**Best Practices:**
- Check if elements exist before updating (`if (!this.box) return`)
- Handle error states gracefully
- Keep updates minimal - only change what changed
- Use `setContent()` rather than recreating elements

---

#### `destroy()`

Clean up resources when the widget is unloaded. Always called when the dashboard exits or the widget is disabled.

**Returns:** `Promise<void>`

```javascript
async destroy() {
  // Stop timers
  if (this.refreshTimer) {
    clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  // Close connections
  if (this.client) {
    await this.client.disconnect();
    this.client = null;
  }

  // Clear caches
  this.cache.clear();

  // Destroy blessed elements
  if (this.box) {
    this.box.destroy();
    this.box = null;
  }

  this.loaded = false;
  this.log('info', 'Widget destroyed');
}
```

**Best Practices:**
- Stop all timers and intervals
- Close external connections
- Clear caches and large data structures
- Destroy blessed elements
- Set `this.loaded = false`

---

### Optional Hooks

#### `show()` / `hide()`

Control widget visibility. Built into `BaseWidget`, but can be overridden.

```javascript
show() {
  if (this.box) {
    this.box.show();
    this.visible = true;
    this.emit('show');
  }
}

hide() {
  if (this.box) {
    this.box.hide();
    this.visible = false;
    this.emit('hide');
  }
}
```

---

### Hook Execution Order

```javascript
// When dashboard starts with your widget enabled:
const widget = new MyWidget(options);
await widget.init();        // 1. Initialize
await widget.create(screen, theme);  // 2. Create UI
const data = await widget.getData(); // 3. Fetch data
widget.render(data);          // 4. Render display

// During normal operation (on refresh):
const data = await widget.getData(); // 1. Fetch data
widget.render(data);          // 2. Render display

// When widget is disabled or dashboard exits:
await widget.destroy();       // 1. Cleanup
```

---

### Error Handling in Hooks

Each hook should handle its own errors. Unhandled exceptions may crash the widget loader.

```javascript
async getData() {
  try {
    return await fetchData();
  } catch (err) {
    this.log('error', err.message);
    return { error: err.message }; // Return error state
  }
}

async create(screen, theme) {
  try {
    // ... setup code
    return this;
  } catch (err) {
    this.log('error', `Create failed: ${err.message}`);
    throw err; // Re-throw to prevent partial initialization
  }
}
```

### Lifecycle Events

Widgets can emit and listen to lifecycle events:

```javascript
async init() {
  // Listen to dashboard events
  this.api.on('theme:changed', () => {
    this.updateTheme();
  });

  // Emit custom events
  this.emit('initialized', { timestamp: Date.now() });
}
```

## Configuration

Add to `~/.openclaw/dashboard-settings.json`:

```json
{
  "widgetLoading": {
    "enabled": true,
    "preloadPriority": ["cpu", "memory", "gpu"],
    "lazyLoadDelay": 500,
    "maxConcurrent": 3,
    "autoDiscover": true
  },
  "plugins": {
    "my-widget": {
      "enabled": true,
      "customSetting": "value"
    }
  }
}
```

## Built-in Widgets

The following built-in widgets are available:

| Widget | ID | Priority | Lazy Load |
|--------|-----|----------|-----------|
| CPU | `cpu` | 10 | No |
| Memory | `memory` | 20 | No |
| GPU | `gpu` | 30 | No |
| Network | `network` | 40 | Yes |
| Disk | `disk` | 50 | Yes |
| System | `system` | 60 | Yes |
| Uptime | `uptime` | 70 | Yes |
| Data Health | `dataHealth` | 80 | Yes |

## Widget Loader

For programmatic control:

```javascript
import { getWidgetLoader } from 'claw-dashboard/widgets';

const loader = getWidgetLoader();

// Register a widget
loader.register('my-widget', metadata, async () => {
  const { MyWidget } = await import('./my-widget.js');
  return new MyWidget();
});

// Load on demand
const widget = await loader.load('my-widget');

// Get loading stats
const stats = loader.getStats();
console.log(stats);
// { total: 10, loaded: 3, failed: 0, loading: 0, averageLoadTime: 45.2 }
```

## Hooks

The widget loader supports lifecycle hooks:

```javascript
loader.addHook('beforeLoad', (widget) => {
  console.log(`Loading widget: ${widget.id}`);
});

loader.addHook('afterLoad', (widget) => {
  console.log(`Widget ${widget.id} loaded in ${widget.loadTime}ms`);
});

loader.addHook('beforeUnload', (widget) => {
  console.log(`Unloading widget: ${widget.id}`);
});
```

## Best Practices

1. **Lazy Load**: Set `lazyLoad: true` for widgets that aren't immediately needed
2. **Error Handling**: Always wrap async operations in try/catch
3. **Cleanup**: Implement `destroy()` to clean up resources
4. **Themes**: Respect the theme colors passed to `create()`
5. **Testing**: Test widgets with the plugin system enabled and disabled

## RateLimiter API

The `RateLimiter` class provides rate limiting functionality for plugins that need to control the frequency of operations like API calls, notifications, or alerts.

### Importing

```javascript
import { RateLimiter } from 'claw-dashboard/widgets';
```

### Constructor

```javascript
const limiter = new RateLimiter(options);
```

**Options:**
- `enabled` (boolean): Enable rate limiting (default: `true`)
- `windowMs` (number): Time window in milliseconds (default: `60000`)
- `maxAlerts` (number): Maximum operations allowed per window (default: `5`)
- `alwaysAllowCritical` (boolean): Always allow critical-level operations (default: `true`)

### Methods

#### `check(type, level?)`

Check if an operation should be allowed without recording it.

**Parameters:**
- `type` (string): A category identifier (e.g., 'api', 'notification')
- `level` (string, optional): Severity level - 'warning', 'critical', 'info' (default: 'warning')

**Returns:** `{ allowed: boolean, reason: string }`

```javascript
const result = limiter.check('api', 'warning');
if (result.allowed) {
  // Proceed with operation
} else {
  console.log(`Rate limited: ${result.reason}`);
}
```

#### `record(type, level?)`

Record an operation occurrence (use after `check` if you need separate check/record).

```javascript
limiter.record('api', 'warning');
```

#### `checkAndRecord(type, level?)`

Atomic check-and-record operation (recommended for most use cases).

```javascript
const result = limiter.checkAndRecord('notification', 'warning');
if (result.allowed) {
  sendNotification();
}
```

#### `getCount(type)`

Get the current count of operations in the window for a type.

```javascript
const count = limiter.getCount('api');
console.log(`${count} API calls in current window`);
```

#### `getRetryAfter(type)`

Get milliseconds until the next operation is allowed for a type.

```javascript
const waitMs = limiter.getRetryAfter('api');
if (waitMs > 0) {
  console.log(`Try again in ${waitMs}ms`);
}
```

#### `getStatus()`

Get complete rate limiter status.

```javascript
const status = limiter.getStatus();
// Returns:
// {
//   enabled: boolean,
//   windowMs: number,
//   maxAlerts: number,
//   alwaysAllowCritical: boolean,
//   types: {
//     [type]: { current: number, max: number, retryAfter: number }
//   }
// }
```

#### `configure(options)`

Update rate limiter configuration at runtime.

```javascript
limiter.configure({
  maxAlerts: 10,
  windowMs: 30000
});
```

#### `reset()`

Clear all recorded timestamps and reset state.

```javascript
limiter.reset();
```

### Example: Rate-Limited API Client

```javascript
import { RateLimiter } from 'claw-dashboard/widgets';

class RateLimitedApiClient {
  constructor() {
    this.limiter = new RateLimiter({
      windowMs: 60000,  // 1 minute window
      maxAlerts: 10,    // Max 10 calls per minute
      alwaysAllowCritical: false
    });
  }

  async fetch(url, options = {}) {
    const level = options.critical ? 'critical' : 'warning';
    const result = this.limiter.checkAndRecord('api', level);

    if (!result.allowed) {
      const waitMs = this.limiter.getRetryAfter('api');
      throw new Error(`Rate limited. Try again in ${waitMs}ms`);
    }

    return fetch(url);
  }

  getStatus() {
    return this.limiter.getStatus();
  }
}
```

### Example: Notification Throttling

```javascript
import { RateLimiter } from 'claw-dashboard/widgets';

const notificationLimiter = new RateLimiter({
  windowMs: 300000,    // 5 minutes
  maxAlerts: 3,        // Max 3 notifications per 5 minutes
  alwaysAllowCritical: true  // Always allow critical notifications
});

function notifyUser(message, level = 'warning') {
  const result = notificationLimiter.checkAndRecord('notification', level);

  if (!result.allowed) {
    console.log('Notification throttled:', message);
    return false;
  }

  // Send notification
  showNotification(message);
  return true;
}
```

## Example: System Metrics Chart

A complete example showing data visualization with blessed-contrib line charts:

```javascript
// ~/.openclaw/plugins/system-metrics-chart/index.js
import { BaseWidget } from 'claw-dashboard/widgets';

export default class SystemMetricsChartWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.name = 'System Metrics Chart';
    this.metricType = this.config.metricType || 'cpu';
    this.maxDataPoints = this.config.maxDataPoints || 30;
    this.dataHistory = { labels: [], values: [] };
  }

  async create(screen, theme = {}) {
    const C = theme.colors || {};
    const blessed = await import('blessed');
    const contrib = await import('blessed-contrib');

    // Main container
    this.box = blessed.default.box({
      parent: screen,
      width: '70%',
      height: 15,
      border: { type: 'line' },
      label: ` METRICS (${this.metricType.toUpperCase()}) `,
      style: { border: { fg: C.cyan || 'cyan' } },
    });

    // Create blessed-contrib line chart
    this.chart = contrib.default.line({
      parent: this.box,
      width: '95%',
      height: 12,
      style: {
        line: C.green || 'green',
        text: C.white || 'white',
        baseline: C.gray || 'gray',
      },
      numYLabels: 5,
      showLegend: true,
      minY: 0,
      maxY: 100,
    });

    this.loaded = true;
    return this;
  }

  async getData() {
    const now = new Date();
    const label = now.toLocaleTimeString();

    // Simulate metric value
    const value = Math.floor(Math.random() * 60) + 20;

    // Update history
    this.dataHistory.labels.push(label);
    this.dataHistory.values.push(value);

    // Trim to max data points
    if (this.dataHistory.labels.length > this.maxDataPoints) {
      this.dataHistory.labels.shift();
      this.dataHistory.values.shift();
    }

    return {
      title: this.metricType.toUpperCase(),
      x: [...this.dataHistory.labels],
      y: [...this.dataHistory.values],
    };
  }

  render(data) {
    if (!this.chart) return;

    // Update chart with new data
    this.chart.setData([{
      title: data.title,
      x: data.x,
      y: data.y,
      style: { line: 'green' },
    }]);
  }

  async destroy() {
    if (this.chart) this.chart = null;
    if (this.box) {
      this.box.destroy();
      this.box = null;
    }
    this.loaded = false;
  }
}
```

### Chart Configuration

The `blessed-contrib.line` chart accepts these options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `style.line` | `string` | `'yellow'` | Line color |
| `style.text` | `string` | `'green'` | Text color |
| `style.baseline` | `string` | `'black'` | Baseline color |
| `numYLabels` | `number` | `5` | Number of Y-axis labels |
| `showNthLabel` | `number` | `1` | Show every Nth X label |
| `showLegend` | `boolean` | `false` | Show legend box |
| `minY` | `number` | `0` | Minimum Y value |
| `maxY` | `number` | auto | Maximum Y value |
| `wholeNumbersOnly` | `boolean` | `false` | Round Y labels to integers |

### Data Format for Line Charts

```javascript
// Single series
const chartData = {
  title: 'CPU Usage',
  x: ['10:00', '10:01', '10:02', '10:03', '10:04'],
  y: [20, 35, 45, 30, 25],
  style: { line: 'green' },
};

this.chart.setData([chartData]);

// Multiple series (for comparison)
const multiSeriesData = [
  {
    title: 'CPU',
    x: timestamps,
    y: cpuValues,
    style: { line: 'green' },
  },
  {
    title: 'Memory',
    x: timestamps,
    y: memoryValues,
    style: { line: 'yellow' },
  },
];

this.chart.setData(multiSeriesData);
```

## Example: Custom Weather Widget

```javascript
// ~/.openclaw/plugins/weather/plugin.json
{
  "id": "weather",
  "name": "Weather",
  "description": "Display current weather",
  "version": "1.0.0",
  "author": "You",
  "category": "custom",
  "type": "widget",
  "lazyLoad": true,
  "config": {
    "location": "auto",
    "unit": "celsius"
  }
}

// ~/.openclaw/plugins/weather/index.js
import { BaseWidget } from 'claw-dashboard/widgets';

export default class WeatherWidget extends BaseWidget {
  async create(screen, theme) {
    const blessed = await import('blessed');

    this.box = blessed.default.box({
      parent: screen,
      height: 5,
      border: { type: 'line' },
      label: ' WEATHER ',
    });

    this.text = blessed.default.text({
      parent: this.box,
      top: 1,
      left: 'center',
    });
  }

  async getData() {
    const config = this.api.getConfig('weather');
    // Fetch weather data
    return { temp: 22, condition: 'sunny' };
  }

  render(data) {
    if (this.text) {
      this.text.setContent(`${data.temp}°C - ${data.condition}`);
    }
  }
}
```

## Migration Guide

### From Built-in Widgets

If you have custom widgets built into the main codebase:

1. Move widget code to a separate file in `src/widgets/`
2. Extend `BaseWidget` instead of creating blessed elements directly
3. Register the widget in the widget loader
4. Remove inline widget code from `index.js`

### Breaking Changes

- Widgets must now extend `BaseWidget`
- `create()` is now async
- `getData()` receives a dataProvider function
- `render()` receives data instead of accessing `this.data`

## Troubleshooting

### Widget not loading
- Check plugin.json is valid JSON
- Verify entry point (index.js) exists
- Check for syntax errors in widget code
- Enable debug logging: `clawdash --debug`

### Widget renders blank
- Ensure `create()` properly sets up blessed elements
- Check that `render()` is being called
- Verify data is being returned from `getData()`

### Performance issues
- Enable lazy loading: `"lazyLoad": true`
- Reduce refresh intervals
- Cache expensive calculations

### Common Error Patterns

#### Error: "Cannot read property X of undefined"
This usually means a blessed element hasn't been initialized. Always check if elements exist before accessing them:

```javascript
render(data) {
  // Safe access pattern
  if (!this.box || !this.content) return;
  this.content.setContent(data.value);
}
```

#### Error: "Rate limit exceeded"
You're making too many API calls. Use the built-in RateLimiter:

```javascript
async getData() {
  const limiter = this.api.getRateLimiter();
  const result = limiter.checkAndRecord('myWidget');

  if (!result.allowed) {
    // Return cached data instead of making API call
    return this.cachedData;
  }

  // Fetch new data
  const data = await this.fetchData();
  this.cachedData = data;
  return data;
}
```

#### Widget crashes the dashboard
Wrap your widget code in error boundaries:

```javascript
async getData() {
  try {
    // Your data fetching logic
    return await this.fetchData();
  } catch (err) {
    this.log('error', `Data fetch failed: ${err.message}`);
    return { error: err.message, _isError: true };
  }
}

render(data) {
  // Always check for error state
  if (data?._isError) {
    this.errorText.setContent(`Error: ${data.error}`);
    this.errorText.show();
    return;
  }

  // Normal rendering
  this.errorText.hide();
  this.content.setContent(data.value);
}
```

### Debug Mode

Enable debug logging to diagnose issues:

```bash
clawdash --debug
```

Debug output includes:
- Widget loading/unloading events
- Plugin registration
- Data provider calls
- Rate limit status
- Configuration loading

### Validation Errors

If you see validation errors in plugin.json:

| Error | Solution |
|-------|----------|
| `Missing required fields: id, name, version` | Add all required fields to manifest |
| `Invalid version format` | Use semver format: "1.0.0" |
| `Duplicate plugin id` | Choose a unique ID for your plugin |
| `Invalid category` | Must be one of: system, monitoring, custom, example |

### Common Error Solutions

#### Module not found errors
If you see `Cannot find module 'some-module'`:
```javascript
// Use dynamic import instead of static import for external modules
async getData() {
  const axios = await import('axios');
  const response = await axios.default.get(this.config.apiUrl);
  return response.data;
}
```

#### Rate limit exceeded
If API calls are being throttled:
```javascript
async getData() {
  const status = this.api.getRateLimitStatus();
  if (status.types.getData?.current >= status.types.getData?.max * 0.8) {
    // Use cached data or reduce refresh rate
    return this.cachedData;
  }
  // Proceed with API call
}
```

#### Plugin crashes the dashboard
Add error boundaries to your widget:

```javascript
import { BaseWidget } from 'claw-dashboard/widgets';

export default class SafeWidget extends BaseWidget {
  async getData() {
    try {
      // Risky operation
      return await fetchData();
    } catch (err) {
      this.log('error', `Data fetch failed: ${err.message}`);
      return { error: err.message, fallback: true };
    }
  }

  render(data) {
    try {
      if (data.error) {
        this.showError(data.error);
        return;
      }
      // Normal rendering
      this.updateDisplay(data);
    } catch (err) {
      this.log('error', `Render failed: ${err.message}`);
      // Render error state safely
      this.showErrorState();
    }
  }
}
```

### Debug Mode

Enable detailed plugin logging:
```javascript
// In your widget
log(level, message) {
  // This uses the dashboard's logging system
  if (this.api) {
    this.api.log(this.id, level, message);
  }
}

// Usage
this.log('debug', 'Widget initializing');
this.log('info', 'Data fetched successfully');
this.log('warn', 'Using cached data');
this.log('error', 'Failed to connect to API');
```

Run with debug mode:
```bash
clawdash --debug
```

Debug output includes:
- Widget loading/unloading events
- Plugin API calls and rate limiting
- Data provider invocations
- Extension point executions

## API Version

Current Plugin API Version: **1.0.0**

The API follows semantic versioning:
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes
