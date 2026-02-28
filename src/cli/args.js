/**
 * CLI Argument Parsing Module
 * Handles parsing of command-line arguments for Claw Dashboard
 */

import config from '../config.js';

/**
 * Parse command-line arguments
 * @returns {Object} Parsed CLI options
 */
export function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    version: false,
    debug: false,
    web: false,
    webPort: config.WEB.DEFAULT_PORT,
    webHost: config.WEB.HOST,
    watch: false,
    watchPlugins: false,
    command: null,
    commandArgs: [],
  };

  // Check for commands first
  if (args.length > 0 && !args[0].startsWith('-')) {
    const firstArg = args[0];
    if (firstArg === 'create-plugin') {
      options.command = 'create-plugin';
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === 'validate-plugin') {
      options.command = 'validate-plugin';
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === 'validate-config') {
      options.command = 'validate-config';
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === 'export-snapshot') {
      options.command = 'export-snapshot';
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === 'import-snapshot') {
      options.command = 'import-snapshot';
      options.commandArgs = args.slice(1);
      return options;
    }
    if (firstArg === 'list-templates') {
      options.command = 'list-templates';
      options.commandArgs = args.slice(1);
      return options;
    }
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-v':
      case '--version':
        options.version = true;
        break;
      case '-d':
      case '--debug':
        options.debug = true;
        break;
      case '-w':
      case '--web':
        options.web = true;
        break;
      case '-p':
      case '--web-port':
        options.web = true;
        if (i + 1 < args.length) {
          const port = parseInt(args[++i], 10);
          if (!isNaN(port) && port > 0 && port < 65536) {
            options.webPort = port;
          }
        }
        break;
      case '--web-host':
        options.web = true;
        if (i + 1 < args.length) {
          options.webHost = args[++i];
        }
        break;
      case '-W':
      case '--watch':
        options.watch = true;
        break;
      case '--watch-plugins':
        options.watchPlugins = true;
        break;
    }
  }

  return options;
}

export default { parseCliArgs };
