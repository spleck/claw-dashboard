/**
 * CLI Validate Plugin Module
 * Validates plugin.json manifest files
 */

import fs from 'fs';
import os from 'os';
import { dirname, join, resolve } from 'path';
import { validateManifest, validatePluginIdFormat } from '../plugin-manifest-validator.js';

/**
 * Run the validate-plugin CLI command
 * @param {string[]} args - CLI arguments
 * @returns {number} Exit code
 */
export async function runValidatePluginCli(args) {
  const pluginPath = args[0];
  const jsonOutput = args.includes('--json') || args.includes('-j');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp) {
    console.log(`
Validate Plugin Manifest for Claw Dashboard

Usage: clawdash validate-plugin <path> [options]

Arguments:
  path              Path to plugin.json file or plugin directory

Options:
  -j, --json        Output results as JSON
  -v, --verbose     Show detailed output including code analysis
  -h, --help        Show this help message

Examples:
  clawdash validate-plugin ./my-widget/plugin.json
  clawdash validate-plugin ~/.openclaw/plugins/my-widget
  clawdash validate-plugin ./my-widget --json
  clawdash validate-plugin ./my-widget --verbose
`);
    return 0;
  }

  if (!pluginPath) {
    console.error('Error: Path is required');
    console.error('Run with --help for usage information');
    return 1;
  }

  // Resolve the path
  let resolvedPath = pluginPath;
  if (pluginPath.startsWith('~')) {
    resolvedPath = join(os.homedir(), pluginPath.slice(1));
  }
  resolvedPath = resolve(resolvedPath);

  // Check if path exists
  if (!fs.existsSync(resolvedPath)) {
    const result = {
      valid: false,
      error: `Path does not exist: ${pluginPath}`,
    };
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(`Error: ${result.error}`);
    }
    return 1;
  }

  // Determine the manifest file path
  let manifestPath = resolvedPath;
  const stats = fs.statSync(resolvedPath);
  if (stats.isDirectory()) {
    manifestPath = join(resolvedPath, 'plugin.json');
    if (!fs.existsSync(manifestPath)) {
      const result = {
        valid: false,
        path: resolvedPath,
        error: `No plugin.json found in directory: ${pluginPath}`,
      };
      if (jsonOutput) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.error(`Error: ${result.error}`);
      }
      return 1;
    }
  }

  // Read and parse the manifest
  let manifest;
  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(content);
  } catch (err) {
    const result = {
      valid: false,
      path: manifestPath,
      error: `Failed to read/parse plugin.json: ${err.message}`,
    };
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(`Error: ${result.error}`);
    }
    return 1;
  }

  // Validate the manifest
  const validation = validateManifest(manifest);

  // Also validate the plugin ID if present
  let idValidation = { valid: true };
  if (manifest.id) {
    idValidation = validatePluginIdFormat(manifest.id);
  }

  const result = {
    valid: validation.valid && idValidation.valid,
    path: manifestPath,
    errors: validation.errors,
    id: manifest.id || null,
    name: manifest.name || null,
    version: manifest.version || null,
  };

  if (!idValidation.valid) {
    result.errors.push(`Invalid plugin ID: ${idValidation.error}`);
  }

  // Enhanced validation for verbose mode
  let warnings = [];
  if (verbose && result.valid) {
    // Check for recommended fields
    if (!manifest.description || manifest.description === 'A custom widget plugin for Claw Dashboard') {
      warnings.push('Add a meaningful description to your plugin');
    }
    if (!manifest.author) {
      warnings.push('Missing author - recommended for plugin distribution');
    }
    if (!manifest.config || Object.keys(manifest.config).length === 0) {
      warnings.push('Consider adding configurable options to your plugin');
    }
    // Check for index.js if it's a widget type
    if (manifest.type === 'widget') {
      const indexPath = stats.isDirectory() ? join(resolvedPath, 'index.js') : join(dirname(resolvedPath), 'index.js');
      if (!fs.existsSync(indexPath)) {
        result.valid = false;
        result.errors.push('Widget plugins must have an index.js file');
      }
    }
  }

  // Output results
  if (jsonOutput) {
    if (verbose) {
      result.warnings = warnings;
    }
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.valid) {
      console.log(`✓ Valid plugin manifest: ${manifestPath}`);
      console.log(`  ID: ${result.id}`);
      console.log(`  Name: ${result.name}`);
      console.log(`  Version: ${result.version}`);
      if (verbose && warnings.length > 0) {
        console.log('');
        console.log('Warnings:');
        warnings.forEach(warning => {
          console.log(`  ⚠ ${warning}`);
        });
      }
    } else {
      console.error(`✗ Invalid plugin manifest: ${manifestPath}`);
      console.error('  Errors:');
      result.errors.forEach(error => {
        console.error(`    - ${error}`);
      });
    }
  }

  return result.valid ? 0 : 1;
}

export default { runValidatePluginCli };
