/**
 * CLI Export Snapshot Module
 * Exports dashboard configuration to a shareable JSON file
 */

import fs from 'fs';
import os from 'os';
import { join, resolve } from 'path';
import {
  createSnapshot,
  exportSnapshotToFile,
  generateSnapshotFilename,
  getSnapshotsDirectory,
} from '../snapshot.js';
import { DEFAULT_SETTINGS, DASHBOARD_VERSION, PATHS } from '../config.js';

/**
 * Load current settings from file
 * @returns {Object} Current settings or defaults
 */
function loadCurrentSettings() {
  try {
    const settingsPath = PATHS.SETTINGS;
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    // Fall through to defaults
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Run the export-snapshot CLI command
 * @param {string[]} args - CLI arguments
 * @returns {number} Exit code
 */
export async function runExportSnapshotCli(args) {
  const jsonOutput = args.includes('--json') || args.includes('-j');
  const showHelp = args.includes('--help') || args.includes('-h');
  const nameFlag = args.findIndex(a => a === '--name' || a === '-n');
  const snapshotName = nameFlag !== -1 && args[nameFlag + 1] ? args[nameFlag + 1] : 'Dashboard Configuration';

  // Get output path (first non-flag argument)
  const outputPath = args.find(a => !a.startsWith('-') && !args[args.indexOf(a) - 1]?.startsWith('-'));

  if (showHelp) {
    console.log(`
Export Dashboard Snapshot for Claw Dashboard

Usage: clawdash export-snapshot [path] [options]

Arguments:
  path              Output file path (optional, defaults to ~/.openclaw/snapshots/)

Options:
  -n, --name        Snapshot name (default: "Dashboard Configuration")
  -j, --json        Output results as JSON
  -h, --help        Show this help message

Examples:
  clawdash export-snapshot
  clawdash export-snapshot ~/my-layout.json
  clawdash export-snapshot --name "Production Setup"
  clawdash export-snapshot ~/backup.json --json
`);
    return 0;
  }

  try {
    // Load current settings
    const settings = loadCurrentSettings();

    // Create snapshot
    const snapshot = createSnapshot(settings, {
      name: snapshotName,
      description: `Claw Dashboard v${DASHBOARD_VERSION} - Exported via CLI`,
    });

    // Determine output path
    let filePath;
    if (outputPath) {
      let resolvedPath = outputPath;
      if (outputPath.startsWith('~/')) {
        resolvedPath = join(os.homedir(), outputPath.slice(2));
      } else if (outputPath.startsWith('~')) {
        resolvedPath = join(os.homedir(), outputPath.slice(1));
      }
      filePath = resolve(resolvedPath);
    } else {
      const snapshotDir = getSnapshotsDirectory();
      const filename = generateSnapshotFilename(snapshotName);
      filePath = join(snapshotDir, filename);
    }

    // Export to file
    const result = exportSnapshotToFile(snapshot, filePath);

    if (jsonOutput) {
      console.log(JSON.stringify({
        success: result.success,
        path: result.path,
        error: result.error,
        snapshot: {
          name: snapshot.name,
          version: snapshot.dashboardVersion,
          schemaVersion: snapshot.schemaVersion,
          createdAt: snapshot.createdAt,
          metadata: snapshot.metadata,
        },
      }, null, 2));
    } else {
      if (result.success) {
        console.log('✓ Snapshot exported successfully');
        console.log(`  Name: ${snapshot.name}`);
        console.log(`  Path: ${result.path}`);
        console.log(`  Version: ${snapshot.dashboardVersion}`);
        console.log(`  Widgets: ${snapshot.metadata?.widgetCount || 'N/A'}`);
        console.log(`  Plugins: ${snapshot.metadata?.pluginCount || 'N/A'}`);
      } else {
        console.error(`✗ Export failed: ${result.error}`);
      }
    }

    return result.success ? 0 : 1;
  } catch (err) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: false,
        error: err.message,
      }, null, 2));
    } else {
      console.error(`✗ Export error: ${err.message}`);
    }
    return 1;
  }
}

export default { runExportSnapshotCli };
