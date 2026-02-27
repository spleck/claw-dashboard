/**
 * Widget System for Claw Dashboard
 * Provides lazy loading, plugin API, and built-in widgets
 */

export { WidgetLoader, getWidgetLoader } from './widget-loader.js';
export {
  PluginAPI,
  BaseWidget,
  validateManifest,
  createWidgetPlugin,
  PLUGIN_API_VERSION,
  getPluginAPI,
} from './plugin-api.js';

export {
  CpuWidget,
  MemoryWidget,
  GpuWidget,
  NetworkWidget,
  DiskWidget,
  SystemWidget,
  UptimeWidget,
  DataHealthWidget,
  createWidget,
  getWidgetTypes,
  WIDGET_REGISTRY,
} from './builtin-widgets.js';

// Re-export all types (including RateLimiter from plugin-api.js)
export * from './widget-loader.js';
export * from './plugin-api.js';
export * from './builtin-widgets.js';
