/**
 * CLI Commands for Export Schedule Management
 * Allows users to configure, enable/disable, and manage scheduled exports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';
import config from '../config.js';
import validation from '../validation.js';
import { ExportScheduler, CRON_PRESETS, DEFAULT_SCHEDULE_CONFIG } from '../export-scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_PATH = config.PATHS.SETTINGS;

/**
 * Load current settings
 * @returns {Object} Settings object
 */
function loadSettings() {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      return config.DEFAULT_SETTINGS;
    }
    const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
    const loaded = JSON.parse(data);
    const result = validation.validateSettings(loaded);
    return result.valid ? result.value : config.DEFAULT_SETTINGS;
  } catch (err) {
    logger.error(`Failed to load settings: ${err.message}`);
    return config.DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to file
 * @param {Object} settings - Settings to save
 */
function saveSettings(settings) {
  try {
    const dir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    logger.info('Settings saved successfully');
  } catch (err) {
    logger.error(`Failed to save settings: ${err.message}`);
  }
}

/**
 * Show current export schedule configuration
 */
export function showScheduleStatus() {
  const settings = loadSettings();
  const schedule = settings.exportSchedule || DEFAULT_SCHEDULE_CONFIG;

  console.log('\n=== Export Schedule Status ===\n');
  console.log(`Enabled: ${schedule.enabled ? 'Yes' : 'No'}`);
  console.log(`Format: ${schedule.format}`);
  console.log(`Schedule: ${schedule.schedule}`);
  console.log(`Retention: ${schedule.retentionDays} days${schedule.retentionDays === 0 ? ' (forever)' : ''}`);
  console.log(`Directory: ${schedule.directory || '(default)'}`);
  console.log(`Include Metrics: ${schedule.includeMetrics ? 'Yes' : 'No'}`);

  // Show preset name if matches
  const presetName = Object.entries(CRON_PRESETS).find(([_, value]) => value === schedule.schedule);
  if (presetName) {
    console.log(`Preset: ${presetName[0]}`);
  }

  console.log('\n=== Available Cron Presets ===\n');
  for (const [name, expression] of Object.entries(CRON_PRESETS)) {
    console.log(`  ${name.padEnd(20)} ${expression}`);
  }
  console.log('');
}

/**
 * Enable or disable export schedule
 * @param {boolean} enabled - Whether to enable or disable
 */
export function setScheduleEnabled(enabled) {
  const settings = loadSettings();

  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }

  settings.exportSchedule.enabled = Boolean(enabled);
  saveSettings(settings);

  console.log(`Export schedule ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Set the export schedule cron expression
 * @param {string} expression - Cron expression or preset name
 */
export function setSchedule(expression) {
  const settings = loadSettings();

  // Check if it's a preset name
  let cronExpression = expression;
  if (CRON_PRESETS[expression]) {
    cronExpression = CRON_PRESETS[expression];
    console.log(`Using preset: ${expression} (${cronExpression})`);
  }

  // Validate the cron expression
  try {
    const { CronParser } = ExportScheduler;
    CronParser.parse(cronExpression);
  } catch (err) {
    console.error(`Invalid cron expression: ${err.message}`);
    console.error('\nAvailable presets:');
    for (const [name, expr] of Object.entries(CRON_PRESETS)) {
      console.error(`  ${name}: ${expr}`);
    }
    process.exit(1);
  }

  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }

  settings.exportSchedule.schedule = cronExpression;
  saveSettings(settings);

  console.log(`Export schedule set to: ${cronExpression}`);
}

/**
 * Set the export format
 * @param {string} format - Export format ('json' or 'csv')
 */
export function setScheduleFormat(format) {
  const normalizedFormat = format.toLowerCase();

  if (!['json', 'csv'].includes(normalizedFormat)) {
    console.error(`Invalid format: ${format}`);
    console.error('Valid formats: json, csv');
    process.exit(1);
  }

  const settings = loadSettings();

  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }

  settings.exportSchedule.format = normalizedFormat;
  saveSettings(settings);

  console.log(`Export format set to: ${normalizedFormat}`);
}

/**
 * Set the retention period for exports
 * @param {number} days - Number of days to retain (0 = forever)
 */
export function setScheduleRetention(days) {
  const daysNum = parseInt(days, 10);

  if (isNaN(daysNum) || daysNum < 0 || daysNum > 365) {
    console.error('Invalid retention days: must be 0-365');
    console.error('  0 = keep forever');
    console.error('  1-365 = keep for N days');
    process.exit(1);
  }

  const settings = loadSettings();

  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }

  settings.exportSchedule.retentionDays = daysNum;
  saveSettings(settings);

  console.log(`Export retention set to: ${daysNum === 0 ? 'forever' : `${daysNum} days`}`);
}

/**
 * Set the export directory
 * @param {string} directory - Directory path
 */
export function setScheduleDirectory(directory) {
  const settings = loadSettings();

  if (!settings.exportSchedule) {
    settings.exportSchedule = { ...DEFAULT_SCHEDULE_CONFIG };
  }

  settings.exportSchedule.directory = directory || null;
  saveSettings(settings);

  console.log(`Export directory set to: ${directory || '(default)'}`);
}

/**
 * Trigger an immediate export
 */
export async function triggerExport() {
  const settings = loadSettings();
  const schedule = settings.exportSchedule || DEFAULT_SCHEDULE_CONFIG;

  console.log('\nTriggering immediate export...\n');

  const scheduler = new ExportScheduler(schedule);

  // Mock metrics callback for CLI
  scheduler.setMetricsCallback(async () => {
    // Return placeholder metrics for CLI export
    return {
      timestamp: new Date().toISOString(),
      source: 'cli-manual-export',
    };
  });

  const result = await scheduler.triggerExport();

  if (result.success) {
    console.log(`Export completed successfully: ${result.path}`);
  } else {
    console.error(`Export failed: ${result.error}`);
    process.exit(1);
  }
}

/**
 * List recent exports
 */
export function listExports() {
  const settings = loadSettings();
  const schedule = settings.exportSchedule || DEFAULT_SCHEDULE_CONFIG;
  const exportDir = schedule.directory || path.join(config.PATHS.OPENCLAW_DIR, 'snapshots');

  console.log(`\n=== Recent Exports in ${exportDir} ===\n`);

  if (!fs.existsSync(exportDir)) {
    console.log('No exports found (directory does not exist)');
    return;
  }

  try {
    const files = fs.readdirSync(exportDir)
      .filter(f => f.startsWith('claw-export-') || f.startsWith('claw-snapshot-'))
      .map(f => {
        const filePath = path.join(exportDir, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          size: stats.size,
          mtime: stats.mtime,
        };
      })
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 20); // Show last 20 exports

    if (files.length === 0) {
      console.log('No exports found');
      return;
    }

    console.log('Filename'.padEnd(50) + 'Size'.padEnd(15) + 'Modified');
    console.log('-'.repeat(80));

    for (const file of files) {
      const sizeStr = formatFileSize(file.size);
      const dateStr = file.mtime.toISOString().replace('T', ' ').slice(0, 19);
      console.log(file.name.padEnd(50) + sizeStr.padEnd(15) + dateStr);
    }

    console.log('');
  } catch (err) {
    console.error(`Failed to list exports: ${err.message}`);
  }
}

/**
 * Format file size in human-readable form
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Show help for export-schedule commands
 */
export function showExportScheduleHelp() {
  console.log(`
Export Schedule Management Commands

Usage: clawdash export-schedule <command> [options]

Commands:
  status              Show current schedule configuration
  enable              Enable scheduled exports
  disable             Disable scheduled exports
  set <expression>    Set cron schedule (or preset name)
  format <format>     Set export format (json or csv)
  retention <days>    Set retention period (0-365 days, 0=forever)
  directory <path>    Set export directory
  export              Trigger immediate export
  list                List recent exports

Cron Presets:
  everyMinute         * * * * *
  every5Minutes       */5 * * * *
  every15Minutes      */15 * * * *
  hourly              0 * * * *
  every6Hours         0 */6 * * *
  daily               0 0 * * *
  weekly              0 0 * * 0
  monthly             0 0 1 * *

Examples:
  clawdash export-schedule status
  clawdash export-schedule enable
  clawdash export-schedule set hourly
  clawdash export-schedule set "*/30 * * * *"
  clawdash export-schedule format csv
  clawdash export-schedule retention 7
  clawdash export-schedule export
`);
}

/**
 * Main CLI handler for export-schedule commands
 * @param {string[]} args - Command line arguments
 * @returns {Promise<number>} Exit code
 */
export async function runExportScheduleCli(args = []) {
  const command = args[0];
  const arg = args[1];

  switch (command) {
    case 'status':
      showScheduleStatus();
      break;

    case 'enable':
      setScheduleEnabled(true);
      break;

    case 'disable':
      setScheduleEnabled(false);
      break;

    case 'set':
      if (!arg) {
        console.error('Error: cron expression required');
        console.error('Usage: clawdash export-schedule set <expression>');
        console.error('Example: clawdash export-schedule set "0 * * * *"');
        return 1;
      }
      setSchedule(arg);
      break;

    case 'format':
      if (!arg) {
        console.error('Error: format required');
        console.error('Usage: clawdash export-schedule format <json|csv>');
        return 1;
      }
      setScheduleFormat(arg);
      break;

    case 'retention':
      if (arg === undefined) {
        console.error('Error: retention days required');
        console.error('Usage: clawdash export-schedule retention <days>');
        return 1;
      }
      setScheduleRetention(arg);
      break;

    case 'directory':
      setScheduleDirectory(arg || '');
      break;

    case 'export':
      await triggerExport();
      break;

    case 'list':
      listExports();
      break;

    case 'help':
    case '--help':
    case '-h':
      showExportScheduleHelp();
      break;

    default:
      if (!command) {
        showScheduleStatus();
      } else {
        console.error(`Unknown command: ${command}`);
        console.error('Run with --help for usage');
        return 1;
      }
  }

  return 0;
}
