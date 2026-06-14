/**
 * CLI Import Snapshot Module
 * Imports dashboard configuration from a snapshot file
 */

import fs from 'fs';
import os from 'os';
import { join, resolve } from 'path';
import {
  importSnapshotFromFile,
  validateSnapshot,
  mergeSnapshotSettings,
  getSnapshotSummary,
  getSnapshotsDirectory,
  listSnapshots,
} from '../snapshot.js';
import { DEFAULT_SETTINGS, PATHS } from '../config.js';

/**
 * Save settings to file
 * @param {Object} settings - Settings to save
 */
function saveSettings(settings) {
  try {
    const settingsPath = PATHS.SETTINGS;
    const dir = PATHS.OPENCLAW_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (err) {
    throw new Error(`Failed to save settings: ${err.message}`);
  }
}

/**
 * Run the import-snapshot CLI command
 * @param {string[]} args - CLI arguments
 * @returns {number} Exit code
 */
export async function runImportSnapshotCli(args) {
  const jsonOutput = args.includes('--json') || args.includes('-j');
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const force = args.includes('--force') || args.includes('-f');
  const showHelp = args.includes('--help') || args.includes('-h');
  const listMode = args.includes('--list') || args.includes('-l');

  // Get file path (first non-flag argument)
  const filePath = args.find(a => !a.startsWith('-'));

  if (showHelp) {
    console.log(`
Import Dashboard Snapshot for Claw Dashboard

Usage: clawdash import-snapshot [path] [options]

Arguments:
  path              Path to snapshot file (optional with --list)

Options:
  -l, --list        List available snapshots
  -d, --dry-run     Validate without applying
  -f, --force       Skip confirmation
  -j, --json        Output results as JSON
  -h, --help        Show this help message

Examples:
  clawdash import-snapshot --list
  clawdash import-snapshot ~/my-layout.json
  clawdash import-snapshot ~/.openclaw/snapshots/claw-snapshot-*.json --dry-run
  clawdash import-snapshot ~/backup.json --force
`);
    return 0;
  }

  // List mode
  if (listMode) {
    const snapshots = listSnapshots();
    if (jsonOutput) {
      console.log(JSON.stringify({ snapshots }, null, 2));
    } else {
      if (snapshots.length === 0) {
        console.log('No snapshots found in ~/.openclaw/snapshots/');
      } else {
        console.log('Available snapshots:');
        console.log('');
        snapshots.forEach((s, i) => {
          const date = new Date(s.createdAt).toLocaleDateString();
          console.log(`  ${i + 1}. ${s.name}`);
          console.log(`     Created: ${date}`);
          console.log(`     Path: ${s.path}`);
          if (s.metadata) {
            console.log(`     Widgets: ${s.metadata.widgetCount}, Plugins: ${s.metadata.pluginCount}`);
          }
          console.log('');
        });
      }
    }
    return 0;
  }

  // Require file path for import
  if (!filePath) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: false,
        error: 'File path is required (use --list to see available snapshots)',
      }, null, 2));
    } else {
      console.error('Error: File path is required');
      console.error('Run with --list to see available snapshots');
      console.error('Run with --help for usage information');
    }
    return 1;
  }

  try {
    // Resolve the path
    let resolvedPath = filePath;
    if (filePath.startsWith('~/')) {
      resolvedPath = join(os.homedir(), filePath.slice(2));
    } else if (filePath.startsWith('~')) {
      resolvedPath = join(os.homedir(), filePath.slice(1));
    }
    resolvedPath = resolve(resolvedPath);

    // Import and validate
    const result = importSnapshotFromFile(resolvedPath);

    if (!result.success) {
      if (jsonOutput) {
        console.log(JSON.stringify({
          success: false,
          error: result.error,
          path: resolvedPath,
        }, null, 2));
      } else {
        console.error(`✗ Import failed: ${result.error}`);
      }
      return 1;
    }

    const { snapshot } = result;

    // Dry run mode - just validate and show info
    if (dryRun) {
      const summary = getSnapshotSummary(snapshot);
      if (jsonOutput) {
        console.log(JSON.stringify({
          success: true,
          dryRun: true,
          path: resolvedPath,
          snapshot: {
            name: snapshot.name,
            description: snapshot.description,
            version: snapshot.dashboardVersion,
            schemaVersion: snapshot.schemaVersion,
            createdAt: snapshot.createdAt,
            metadata: snapshot.metadata,
          },
          summary: summary.split('\n'),
        }, null, 2));
      } else {
        console.log('✓ Snapshot is valid (dry run, no changes applied)');
        console.log('');
        console.log(summary);
      }
      return 0;
    }

    // Show summary before applying (unless --force)
    if (!jsonOutput && !force) {
      const summary = getSnapshotSummary(snapshot);
      console.log('Snapshot to import:');
      console.log('');
      console.log(summary);
      console.log('');
      console.log('Run with --force to apply, or --dry-run to preview');
      return 0;
    }

    // Load current settings and merge
    const currentSettings = { ...DEFAULT_SETTINGS };
    try {
      if (fs.existsSync(PATHS.SETTINGS)) {
        const data = fs.readFileSync(PATHS.SETTINGS, 'utf8');
        Object.assign(currentSettings, JSON.parse(data));
      }
    } catch (err) {
      // Continue with defaults
    }

    const mergedSettings = mergeSnapshotSettings(currentSettings, snapshot.settings);

    // Save merged settings
    saveSettings(mergedSettings);

    if (jsonOutput) {
      console.log(JSON.stringify({
        success: true,
        path: resolvedPath,
        snapshot: {
          name: snapshot.name,
          version: snapshot.dashboardVersion,
          createdAt: snapshot.createdAt,
        },
        applied: Object.keys(snapshot.settings),
      }, null, 2));
    } else {
      console.log('✓ Snapshot imported successfully');
      console.log(`  Name: ${snapshot.name}`);
      console.log(`  Version: ${snapshot.dashboardVersion}`);
      console.log('');
      console.log('Settings have been merged and saved.');
      console.log('Restart Claw Dashboard to apply all changes.');
    }

    return 0;
  } catch (err) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: false,
        error: err.message,
      }, null, 2));
    } else {
      console.error(`✗ Import error: ${err.message}`);
    }
    return 1;
  }
}

export default { runImportSnapshotCli };
