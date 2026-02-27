# Plugin Examples

This directory contains example plugins demonstrating the Claw Dashboard widget plugin system.

## Available Examples

### weather-widget

A simple weather widget that demonstrates:
- Plugin manifest structure
- Widget class extending BaseWidget
- UI creation with blessed
- Data fetching and rendering
- Configuration handling

## Installation

To install an example plugin:

```bash
# Copy the plugin to the plugins directory
cp -r weather-widget ~/.openclaw/plugins/

# Restart clawdash
clawdash
```

## Creating Your Own Plugin

1. Copy the `weather-widget` directory as a template
2. Update `plugin.json` with your plugin details
3. Modify `index.js` to implement your widget logic
4. Install to `~/.openclaw/plugins/`

See the full documentation in `docs/PLUGINS.md`.
