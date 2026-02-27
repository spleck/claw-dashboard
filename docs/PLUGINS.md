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

## API Version

Current Plugin API Version: **1.0.0**

The API follows semantic versioning:
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes
