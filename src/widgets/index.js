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
  processWidgetConfig,
  interpolateEnvVars,
  processConfigValues,
  validateConfigVersion,
  migrateConfig,
  registerMigration,
  compareVersions,
  extractEnvRequirements,
  createConfigPreprocessor,
  CONFIG_VERSION,
  DEFAULT_PROCESSING_OPTIONS,
} from './config-processor.js';

export {
  parseDependency,
  parseDependencies,
  buildDependencyGraph,
  detectCircularDependency,
  satisfiesVersion,
  checkVersionConstraints,
  findMissingDependencies,
  topologicalSort,
  resolveDependencies,
  getAllDependencies,
  getAllDependents,
  validateWidgetDependencies,
} from './dependency-resolver.js';

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

export {
  WidgetErrorBoundary,
  ErrorBoundaryManager,
  ErrorStyles,
  withErrorBoundary,
  getErrorBoundaryManager,
} from './widget-error-boundary.js';

export {
  PluginError,
  PluginErrorAnalyzer,
  PLUGIN_ERROR_CODES,
  formatPluginError,
  extractErrorInfo,
} from '../plugin-errors.js';

// Re-export all types (including RateLimiter from plugin-api.js)
export * from './widget-loader.js';
export * from './plugin-api.js';
export * from './builtin-widgets.js';
export * from './widget-error-boundary.js';
