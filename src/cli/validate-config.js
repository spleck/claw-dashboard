/**
 * CLI Validate Config Module
 * Validates dashboard configuration files
 */

import os from 'os';
import { resolve, join } from 'path';
import { validateConfigFile, formatConfigValidationResult, getDefaultConfigPath } from '../config-validator.js';

/**
 * Run the validate-config CLI command
 * @param {string[]} args - CLI arguments
 * @returns {number} Exit code
 */
export async function runValidateConfigCli(args) {
  const configPath = args[0];
  const jsonOutput = args.includes('--json') || args.includes('-j');
  const showHelp = args.includes('--help') || args.includes('-h');
  const strict = args.includes('--strict') || args.includes('-s');

  if (showHelp) {
    console.log(`
Validate Dashboard Configuration for Claw Dashboard

Usage: clawdash validate-config [path] [options]

Arguments:
  path                Path to configuration file (optional)
                      Defaults to: ~/.openclaw/dashboard-settings.json

Options:
  -j, --json          Output results as JSON
  -s, --strict        Fail on unknown properties
  -h, --help          Show this help message

Examples:
  clawdash validate-config
  clawdash validate-config ~/.openclaw/dashboard-settings.json
  clawdash validate-config ./my-config.json --json
  clawdash validate-config --strict
`);
    return 0;
  }

  // Determine the config file path
  const targetPath = configPath || getDefaultConfigPath();

  // Resolve the path (handle ~ expansion)
  let resolvedPath = targetPath;
  if (targetPath.startsWith('~')) {
    resolvedPath = join(os.homedir(), targetPath.slice(1));
  }
  resolvedPath = resolve(resolvedPath);

  // Validate the configuration
  const result = validateConfigFile(resolvedPath, { strict });

  // Output results
  if (jsonOutput) {
    const output = {
      valid: result.valid,
      path: resolvedPath,
      errors: result.errors,
      warnings: result.warnings,
      info: result.info,
      stats: result.stats,
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(formatConfigValidationResult(result, resolvedPath));
  }

  return result.valid ? 0 : 1;
}

export default { runValidateConfigCli };
