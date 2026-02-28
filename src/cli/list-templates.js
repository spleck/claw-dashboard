/**
 * CLI List Templates Module
 * Lists available widget templates for scaffolding
 */

import { listTemplates } from '../plugin-scaffold.js';

/**
 * Run the list-templates CLI command
 * @param {string[]} args - CLI arguments
 * @returns {number} Exit code
 */
export async function runListTemplatesCli(args) {
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp) {
    console.log(`
List Available Widget Templates

Usage: clawdash list-templates [options]

Options:
  -j, --json        Output as JSON
  -h, --help        Show this help message

Examples:
  clawdash list-templates
  clawdash list-templates --json
`);
    return 0;
  }

  const jsonOutput = args.includes('--json') || args.includes('-j');

  try {
    const templates = listTemplates();

    if (jsonOutput) {
      console.log(JSON.stringify(templates, null, 2));
    } else {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║           Available Widget Templates                         ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');

      templates.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name}`);
        console.log(`     ID: ${template.id}`);
        console.log(`     ${template.description}`);
        console.log('');
      });

      console.log('Usage:');
      console.log('  clawdash create-plugin <name> --template <id>');
      console.log('');
      console.log('Example:');
      console.log('  clawdash create-plugin my-widget --template api');
      console.log('');
    }

    return 0;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return 1;
  }
}

export default { runListTemplatesCli };
