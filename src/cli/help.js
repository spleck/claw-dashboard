/**
 * CLI Help Module
 * Displays help information for Claw Dashboard CLI
 */

/**
 * Display CLI help message
 */
export function showHelp() {
  console.log(`
Claw Dashboard - A beautiful terminal dashboard for monitoring OpenClaw instances

Usage: clawdash [OPTIONS] [COMMAND]

Commands:
  create-plugin <id>      Create a new widget plugin scaffold
                          Use -h with this command for options
  validate-plugin <path>  Validate a plugin.json manifest file
                          Use -h with this command for options
  validate-config [path]  Validate dashboard configuration file
                          Uses ~/.openclaw/dashboard-settings.json by default
  export-snapshot [path]  Export dashboard configuration snapshot
                          Shareable JSON format for backups and sharing
                          Use -h with this command for options
  import-snapshot [path]  Import dashboard configuration snapshot
                          Use --list to see available snapshots
                          Use -h with this command for options
  list-templates          List available widget templates
                          Shows all templates for create-plugin command
  export-schedule         Manage scheduled metric exports
                          Configure cron-style auto-exports to CSV/JSON
                          Use -h with this command for options

Options:
  -h, --help       Display this help message
  -v, --version    Display version information
  -d, --debug      Run in debug mode with additional logging
  -w, --web        Run web server mode (no TUI, HTTP API only)
  -p, --web-port   Set web server port (default: 18790, requires --web)
  --web-host       Set web server host (default: 0.0.0.0, requires --web)
  -W, --watch      Enable plugin hot-reload (watches ~/.openclaw/plugins/)

Developer Mode:
  --watch          Automatically reload plugins when files change
                   Watches plugin.json and index.js files in plugin directories
                   Shows notifications in dashboard when plugins reload

Web Server Endpoints (when --web is enabled):
  GET /health      Health check
  GET /metrics     System metrics (CPU, memory, GPU, etc.)
  GET /sessions    Active OpenClaw sessions
  GET /agents      Available OpenClaw agents
  GET /logs        Recent OpenClaw logs
  GET /status      Full dashboard status (all data)

Controls:
  q, Q, Ctrl+C     Quit the dashboard
  r, R             Force refresh data
  p, Space         Pause/resume auto-refresh
  o                Cycle session sort (time/tokens/idle/name)
  ?                Toggle help panel
  s, S             Open settings panel
  1-8              Toggle widgets

For full documentation, see: man clawdash
`);
}

export default { showHelp };
