/**
 * Dashboard Snapshot Module
 * Provides export/import functionality for dashboard configurations
 * Allows users to share layouts and backup settings
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { PATHS, DEFAULT_SETTINGS, DASHBOARD_VERSION } from './config.js';
import logger from './logger.js';
import { validatePluginPath } from './security.js';

/**
 * Snapshot schema version for compatibility checking
 */
export const SNAPSHOT_SCHEMA_VERSION = '1.0.0';

/**
 * Settings keys to export (for a clean, portable snapshot)
 * Excludes: sessionSearchQuery, firstRun (runtime state)
 */
const EXPORTABLE_SETTINGS = [
  'refreshInterval',
  'logLevelFilter',
  'sessionSortMode',
  'showWidget1',
  'showWidget2',
  'showWidget3',
  'showWidget4',
  'showWidget5',
  'showWidget6',
  'showWidget7',
  'showWidget8',
  'showWidget9',
  'showPerformanceMetrics',
  'theme',
  'exportFormat',
  'exportDirectory',
  'favorites',
  'showFavoritesOnly',
  'gatewayEndpoints',
  'activeGatewayEndpoint',
  'webInterface',
  'widgetLoading',
  'plugins',
  'autoRetry',
];

/**
 * Create a snapshot from current settings
 * @param {Object} currentSettings - Current dashboard settings
 * @param {Object} options - Snapshot options
 * @param {string} [options.name] - Optional snapshot name
 * @param {string} [options.description] - Optional description
 * @returns {Object} Snapshot object
 */
export function createSnapshot(currentSettings, options = {}) {
  const snapshot = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    dashboardVersion: DASHBOARD_VERSION,
    createdAt: new Date().toISOString(),
    name: options.name || 'Dashboard Snapshot',
    description: options.description || '',
    platform: {
      os: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
    },
    settings: {},
  };

  // Extract only exportable settings
  for (const key of EXPORTABLE_SETTINGS) {
    if (key in currentSettings) {
      snapshot.settings[key] = currentSettings[key];
    }
  }

  // Add metadata about what's included
  snapshot.metadata = {
    widgetCount: [
      'showWidget1', 'showWidget2', 'showWidget3', 'showWidget4',
      'showWidget5', 'showWidget6', 'showWidget7', 'showWidget8', 'showWidget9',
    ].filter(w => snapshot.settings[w] !== false).length,
    pluginCount: Object.keys(snapshot.settings.plugins || {}).length,
    endpointCount: (snapshot.settings.gatewayEndpoints || []).length,
  };

  return snapshot;
}

/**
 * Validate a snapshot before importing
 * @param {Object} snapshot - Snapshot to validate
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return { valid: false, error: 'Invalid snapshot format' };
  }

  // Check schema version (allow same major version)
  const schemaVersion = snapshot.schemaVersion || '0.0.0';
  const [major] = schemaVersion.split('.');
  const [currentMajor] = SNAPSHOT_SCHEMA_VERSION.split('.');

  if (parseInt(major) > parseInt(currentMajor)) {
    return {
      valid: false,
      error: `Snapshot version ${schemaVersion} is newer than supported (${SNAPSHOT_SCHEMA_VERSION})`
    };
  }

  // Validate settings object exists
  if (!snapshot.settings || typeof snapshot.settings !== 'object') {
    return { valid: false, error: 'Missing or invalid settings in snapshot' };
  }

  // Validate critical settings have correct types
  const validations = [
    { key: 'refreshInterval', type: 'number', min: 500, max: 60000 },
    { key: 'theme', type: 'string', allowed: ['auto', 'default', 'dark', 'high-contrast', 'ocean'] },
    { key: 'logLevelFilter', type: 'string', allowed: ['all', 'debug', 'info', 'warn', 'error'] },
  ];

  for (const v of validations) {
    const value = snapshot.settings[v.key];
    if (value !== undefined) {
      if (v.type && typeof value !== v.type) {
        return { valid: false, error: `Invalid type for ${v.key}: expected ${v.type}` };
      }
      if (v.min !== undefined && value < v.min) {
        return { valid: false, error: `${v.key} must be at least ${v.min}` };
      }
      if (v.max !== undefined && value > v.max) {
        return { valid: false, error: `${v.key} must be at most ${v.max}` };
      }
      if (v.allowed && !v.allowed.includes(value)) {
        return { valid: false, error: `${v.key} must be one of: ${v.allowed.join(', ')}` };
      }
    }
  }

  // Validate widget booleans
  for (let i = 1; i <= 9; i++) {
    const key = `showWidget${i}`;
    const value = snapshot.settings[key];
    if (value !== undefined && typeof value !== 'boolean') {
      return { valid: false, error: `${key} must be a boolean` };
    }
  }

  return { valid: true };
}

/**
 * Merge snapshot settings with defaults (for safe import)
 * Preserves existing settings not in snapshot, applies snapshot settings
 * @param {Object} existingSettings - Current settings
 * @param {Object} snapshotSettings - Settings from snapshot
 * @returns {Object} Merged settings
 */
export function mergeSnapshotSettings(existingSettings, snapshotSettings) {
  const merged = { ...existingSettings };

  // Apply snapshot settings
  for (const key of EXPORTABLE_SETTINGS) {
    if (key in snapshotSettings) {
      // Deep clone to avoid reference issues
      if (typeof snapshotSettings[key] === 'object' && snapshotSettings[key] !== null) {
        merged[key] = JSON.parse(JSON.stringify(snapshotSettings[key]));
      } else {
        merged[key] = snapshotSettings[key];
      }
    }
  }

  return merged;
}

/**
 * Export snapshot to file
 * @param {Object} snapshot - Snapshot object
 * @param {string} filePath - Target file path
 * @returns {Object} Result { success: boolean, error?: string, path?: string }
 */
export function exportSnapshotToFile(snapshot, filePath) {
  try {
    // Route through validator (allowAbsolute for documented arbitrary user paths e.g. ~/my-layout.json or /tmp/snap.json;
    // traversal/characters/hidden still apply: hidden dirs only if whitelisted (see the allowedHidden list and hidden check in security.js: only .openclaw etc allowed; e.g. ~/.config/.secret/ or /tmp/.foo/ rejected even with abs).
    // no allowedDirs to permit user-chosen locations (delete uses internal-dir restriction).
    const validation = validatePluginPath(filePath, {
      allowAbsolute: true,
      mustExist: false,
      expectedType: null,
    });
    if (!validation.valid) {
      return { success: false, error: validation.error || 'Invalid snapshot path' };
    }
    const safePath = validation.path || filePath;

    const dir = path.dirname(safePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(safePath, JSON.stringify(snapshot, null, 2));

    // Set secure permissions (owner read/write only)
    try {
      fs.chmodSync(safePath, 0o600);
    } catch (permErr) {
      logger.warn(`Could not set permissions on snapshot: ${permErr.message}`);
    }

    return { success: true, path: safePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Import snapshot from file
 * @param {string} filePath - Path to snapshot file
 * @returns {Object} Result { success: boolean, error?: string, snapshot?: Object }
 */
export function importSnapshotFromFile(filePath) {
  try {
    // Route through validator (allowAbsolute:true for arbitrary user-specified import paths per CLI/TUI/docs;
    // traversal/character/hidden checks still enforced; omit allowedDirs to permit outside snap dir).
    // Exact rule (shared w/ plugins): abs paths ok but dot-dir components limited to whitelisted ('.openclaw' etc per the allowedHidden list in security.js); other dots like .secret or .foo under ~ or /tmp are rejected (tests cover intended .openclaw + non-dot).
    const validation = validatePluginPath(filePath, {
      allowAbsolute: true,
      mustExist: false,
      expectedType: null,
    });
    if (!validation.valid) {
      return { success: false, error: validation.error || 'Invalid snapshot path' };
    }
    const safePath = validation.path || filePath;

    if (!fs.existsSync(safePath)) {
      return { success: false, error: `File not found: ${safePath}` };
    }

    const data = fs.readFileSync(safePath, 'utf8');
    const snapshot = JSON.parse(data);

    const schemaValidation = validateSnapshot(snapshot);
    if (!schemaValidation.valid) {
      return { success: false, error: schemaValidation.error };
    }

    return { success: true, snapshot };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON format' };
    }
    return { success: false, error: err.message };
  }
}

/**
 * Generate default snapshot filename
 * @param {string} [name] - Optional name to include in filename
 * @returns {string} Generated filename
 */
export function generateSnapshotFilename(name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeName = name ? name.replace(/[^a-zA-Z0-9-_]/g, '_') : 'dashboard';
  return `claw-snapshot-${safeName}-${timestamp}.json`;
}

/**
 * Get snapshots directory
 * @returns {string} Path to snapshots directory
 */
export function getSnapshotsDirectory() {
  return path.join(PATHS.OPENCLAW_DIR, 'snapshots');
}

/**
 * List available snapshots
 * @returns {Array} Array of snapshot info objects
 */
export function listSnapshots() {
  const dir = getSnapshotsDirectory();
  if (!fs.existsSync(dir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(dir, f);
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          const snapshot = JSON.parse(data);
          const stats = fs.statSync(filePath);
          return {
            filename: f,
            path: filePath,
            name: snapshot.name || 'Unnamed',
            description: snapshot.description || '',
            createdAt: snapshot.createdAt || stats.mtime.toISOString(),
            dashboardVersion: snapshot.dashboardVersion || 'unknown',
            schemaVersion: snapshot.schemaVersion || 'unknown',
            metadata: snapshot.metadata || {},
          };
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return files;
  } catch (err) {
    logger.warn(`Failed to list snapshots: ${err.message}`);
    return [];
  }
}

/**
 * Delete a snapshot
 * @param {string} filename - Snapshot filename
 * @returns {Object} Result { success: boolean, error?: string }
 */
export function deleteSnapshot(filename) {
  const dir = getSnapshotsDirectory();
  const filePath = path.join(dir, filename);

  // Security: route through validator + proper realpath + trailing sep (fixes pre-existing broken .safe + startsWith).
  // Mirrors validatePluginPath + validateFilePath patterns used elsewhere.
  // For internal snapshots only (always under ~/.openclaw/snapshots); abs user paths for export/import use allowAbsolute no allowedDirs (see rules in exportSnapshotToFile/importSnapshotFromFile comments + security hidden whitelist).
  const validation = validatePluginPath(filePath, {
    allowedDirs: [dir],
    allowAbsolute: true,
    mustExist: false,
    expectedType: null,
  });
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Invalid snapshot path' };
  }
  const safePath = validation.path || filePath;

  let unlinkPath = safePath;
  try {
    const resolvedPath = fs.realpathSync(safePath);
    const resolvedDir = fs.realpathSync(dir);
    if (!resolvedPath.startsWith(resolvedDir + path.sep) && resolvedPath !== resolvedDir) {
      return { success: false, error: 'Invalid snapshot path' };
    }
    unlinkPath = resolvedPath;
  } catch (realErr) {
    // If file doesn't exist yet, proceed to not-found (or let later check handle)
    if (!fs.existsSync(safePath)) {
      return { success: false, error: 'Snapshot not found' };
    }
  }

  try {
    if (!fs.existsSync(unlinkPath)) {
      return { success: false, error: 'Snapshot not found' };
    }
    fs.unlinkSync(unlinkPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Get snapshot summary for display
 * @param {Object} snapshot - Snapshot object
 * @returns {string} Formatted summary
 */
export function getSnapshotSummary(snapshot) {
  if (!snapshot) return 'Invalid snapshot';

  const lines = [
    `Name: ${snapshot.name || 'Unnamed'}`,
    `Created: ${snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleString() : 'Unknown'}`,
  ];

  if (snapshot.description) {
    lines.push(`Description: ${snapshot.description}`);
  }

  if (snapshot.metadata) {
    const { widgetCount, pluginCount, endpointCount } = snapshot.metadata;
    lines.push(`Widgets: ${widgetCount}, Plugins: ${pluginCount}, Endpoints: ${endpointCount}`);
  }

  if (snapshot.settings) {
    const theme = snapshot.settings.theme || 'auto';
    const refresh = snapshot.settings.refreshInterval || 2000;
    lines.push(`Theme: ${theme}, Refresh: ${refresh}ms`);
  }

  return lines.join('\n');
}

export default {
  SNAPSHOT_SCHEMA_VERSION,
  EXPORTABLE_SETTINGS,
  createSnapshot,
  validateSnapshot,
  mergeSnapshotSettings,
  exportSnapshotToFile,
  importSnapshotFromFile,
  generateSnapshotFilename,
  getSnapshotsDirectory,
  listSnapshots,
  deleteSnapshot,
  getSnapshotSummary,
};
