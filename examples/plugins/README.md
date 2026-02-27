# Plugin Examples

This directory contains example plugins demonstrating the Claw Dashboard widget plugin system.

## Available Examples

### hello-world

The simplest possible widget example demonstrating:
- Basic widget structure extending BaseWidget
- Required lifecycle methods (init, create, getData, render, destroy)
- Simple configuration handling
- Basic blessed UI creation

### weather-widget

A weather widget that demonstrates:
- Plugin manifest structure
- Widget class extending BaseWidget
- UI creation with blessed
- Simulated data fetching and rendering
- Configuration handling with defaults

### api-status

An API integration widget demonstrating:
- Fetching data from external APIs
- Error handling and retry logic
- Loading states and timeout handling
- Configurable refresh intervals
- Request statistics tracking

### system-metrics-chart

A data visualization widget demonstrating:
- **blessed-contrib line charts** for time-series data
- Multiple metric support (CPU, memory, network)
- Dynamic data updates with configurable refresh
- History management for rolling data windows
- Theme integration for chart styling

## Installation

To install an example plugin:

```bash
# Copy the plugin to the plugins directory
cp -r hello-world ~/.openclaw/plugins/
# or
cp -r weather-widget ~/.openclaw/plugins/
# or
cp -r api-status ~/.openclaw/plugins/
# or
cp -r system-metrics-chart ~/.openclaw/plugins/

# Restart clawdash
clawdash
```

## Example Comparison

| Example | Complexity | Demonstrates |
|---------|------------|--------------|
| `hello-world` | Beginner | Basic structure, lifecycle hooks |
| `weather-widget` | Beginner | Configuration, data fetching |
| `api-status` | Intermediate | API integration, error handling |
| `system-metrics-chart` | Advanced | Data visualization, charts, history |

## Creating Your Own Plugin

1. Copy the example that best matches your use case:
   - Start with `hello-world` for simple widgets
   - Use `weather-widget` for data-driven widgets
   - Use `api-status` for external API integration
   - Use `system-metrics-chart` for data visualization

2. Update `plugin.json` with your plugin details
3. Modify `index.js` to implement your widget logic
4. Install to `~/.openclaw/plugins/`

See the full documentation in `docs/PLUGINS.md`.
