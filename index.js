#!/usr/bin/env node

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from './src/logger.js';
import { cycleTheme, getCurrentTheme, loadTheme, saveTheme } from './src/themes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load dashboard version from package.json
let DASHBOARD_VERSION = 'unknown';
try {
  const pkg = JSON.parse(fs.readFileSync(join(__dirname, 'package.json'), 'utf8'));
  DASHBOARD_VERSION = pkg.version || 'unknown';
} catch {}

const execAsync = promisify(exec);

const DEFAULT_REFRESH_INTERVAL = 2000;
const HISTORY_LENGTH = 60;
const NETWORK_HISTORY_LENGTH = 30;

// Settings storage path
const SETTINGS_PATH = process.env.HOME + '/.openclaw/dashboard-settings.json';

const DEFAULT_SETTINGS = {
  refreshInterval: DEFAULT_REFRESH_INTERVAL,
  logLevelFilter: 'all',
  sessionSortMode: 'time', // 'time' | 'tokens' | 'idle' | 'name'
  // Widget visibility toggles (1-7 keys) - all 7 small widgets
  showWidget1: true,  // CPU
  showWidget2: true,  // Memory
  showWidget3: true,  // GPU
  showWidget4: true,  // Network
  showWidget5: true,  // Disk
  showWidget6: true,  // System
  showWidget7: true,  // Uptime
  // Theme persistence
  theme: 'default', // 'default' | 'dark' | 'high-contrast' | 'ocean'
  // Export options
  exportFormat: 'json', // 'json' | 'csv'
  exportDirectory: process.env.HOME + '/.openclaw/exports',
};

function loadSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  try {
    const dir = process.env.HOME + '/.openclaw';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  } catch {}
}

function getGatewayConfig() {
  const configPath = process.env.HOME + '/.openclaw/openclaw.json';
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(raw);
    return {
      port: config.gateway?.port || 18789,
      token: config.gateway?.auth?.token,
    };
  } catch {
    return { port: 18789, token: null };
  }
}

const C = {
  green: 'green', brightGreen: 'bright-green',
  yellow: 'yellow', brightYellow: 'bright-yellow',
  red: 'red', brightRed: 'bright-red',
  cyan: 'cyan', brightCyan: 'bright-cyan',
  magenta: 'magenta', brightMagenta: 'bright-magenta',
  blue: 'blue', brightBlue: 'bright-blue',
  white: 'white', brightWhite: 'bright-white',
  gray: 'gray', black: 'black'
};

// Log level color mapping
const LOG_COLORS = {
  error: C.brightRed,
  fatal: C.brightRed,
  critical: C.brightRed,
  warn: C.brightYellow,
  warning: C.brightYellow,
  info: C.cyan,
  debug: C.gray,
  trace: C.gray,
  verbose: C.gray
};

// Convert color name to tag format (camelCase -> dash-case)
function toTagColor(color) {
  return color.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Detect log level from a line and return colored version
function colorizeLogLine(line) {
  if (!line || typeof line !== 'string') return line;
  
  let matchedLevel = null;
  let levelStart = -1;
  let levelEnd = -1;
  
  // Check for bracketed levels first: [ERROR], [WARN], etc.
  for (const level of ['error', 'warn', 'info', 'debug']) {
    const escapedLevel = level.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\[${escapedLevel.toUpperCase()}\\]`, 'i');
    const match = line.match(pattern);
    if (match) {
      matchedLevel = level;
      levelStart = match.index;
      levelEnd = levelStart + match[0].length;
      break;
    }
  }
  
  // If no bracketed level, check for standalone level after ISO timestamp
  if (!matchedLevel) {
    // Match ISO timestamp (2026-02-13T15:19:29.870Z) followed by level
    const isoPattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)\s+(\w+)/i;
    const match = line.match(isoPattern);
    if (match) {
      const levelFromTimestamp = match[2].toLowerCase();
      if (['error', 'warn', 'info', 'debug'].includes(levelFromTimestamp)) {
        matchedLevel = levelFromTimestamp;
        // Level starts after timestamp + space
        levelStart = match[1].length + 1;
        levelEnd = levelStart + matchedLevel.length;
      }
    }
  }
  
  if (!matchedLevel) {
    // No recognized level - return gray for timestamp, rest unchanged
    return '{gray-fg}' + line + '{/gray-fg}';
  }
  
  const color = LOG_COLORS[matchedLevel] || 'gray';
  const tagColor = toTagColor(color);
  
  const before = line.substring(0, levelStart);
  const levelStr = line.substring(levelStart, levelEnd);
  const after = line.substring(levelEnd);
  
  return '{' + tagColor + '-fg}' + before + '{/' + tagColor + '-fg}{white-fg}' + levelStr + '{/white-fg}{' + tagColor + '-fg}' + after + '{/' + tagColor + '-fg}';
}

// Get filter function for log level
function getLogFilterFn(filter) {
  if (filter === 'all') return () => true;
  
  const levelPriorities = { error: 4, warn: 3, info: 2, debug: 1 };
  const filterPriority = levelPriorities[filter] || 0;
  
  // debug shows ONLY debug, other filters show that level and above
  const exactMatchOnly = (filter === 'debug');
  
  return (line) => {
    if (!line) return false;
    const upper = line.toUpperCase();
    let linePriority = 0;
    for (const [level, priority] of Object.entries(levelPriorities)) {
      if (upper.includes('[' + level.toUpperCase() + ']') || 
          upper.includes(level.toUpperCase() + ':') ||
          upper.includes('-' + level.toUpperCase() + '-')) {
        linePriority = Math.max(linePriority, priority);
      }
    }
    // No level detected in line - show if filtering is off (all) or lenient
    if (linePriority === 0) return filterPriority <= 1;
    
    if (exactMatchOnly) {
      return linePriority === filterPriority;
    }
    return linePriority >= filterPriority;
  };
}

// Calculate how many lines a text will wrap to given a width
function calculateWrappedLines(text, width) {
  if (!text || width <= 0) return 1;
  const words = text.split(' ');
  let lines = 1;
  let currentLineLength = 0;
  
  for (const word of words) {
    if (currentLineLength + word.length + 1 > width) {
      lines++;
      currentLineLength = word.length;
    } else {
      currentLineLength += word.length + 1;
    }
  }
  return lines;
}

const ASCII_LOGO = [
  '   ██████╗██╗      █████╗ ██╗    ██╗   ',
  '  ██╔════╝██║     ██╔══██╗██║    ██║   ',
  '  ██║     ██║     ███████║██║ █╗ ██║   ',
  '  ██║     ██║     ██╔══██║██║███╗██║   ',
  '  ╚██████╗███████╗██║  ██║╚███╔███╔╝   ',
  '   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝    '
];

function gauge(percent, width = 15) {
  const filled = Math.round((percent / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function sparkline(data, width = 15) {
  if (!data || data.length === 0) return '─'.repeat(width);
  const chars = '▁▂▃▄▅▆▇█';
  const max = Math.max(...data, 1);
  const recent = data.slice(-width);
  return recent.map(v => {
    const normalized = Math.max(0, Math.min(1, v / max));
    return chars[Math.floor(normalized * (chars.length - 1))];
  }).join('');
}

function getColor(percent) {
  if (percent >= 80) return C.red;
  if (percent >= 60) return C.yellow;
  return C.green;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatBitsPerSecond(bytesPerSec) {
  const bitsPerSec = bytesPerSec * 8;
  if (bitsPerSec === 0) return '0';
  if (bitsPerSec < 1000) return Math.round(bitsPerSec) + 'b';
  if (bitsPerSec < 1000000) return (bitsPerSec / 1000).toFixed(0) + 'K';
  return (bitsPerSec / 1000000).toFixed(1) + 'M';
}

async function getLatestVersion() {
  try {
    return await new Promise((resolve) => {
      https.get('https://api.github.com/repos/openclaw/openclaw/releases/latest', {
        headers: { 'User-Agent': 'claw-dashboard' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data).tag_name?.replace(/^v/, '')); } catch { resolve(null); }
        });
      }).on('error', () => resolve(null)).setTimeout(3000);
    });
  } catch { return null; }
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '--';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

async function getGatewayUptime() {
  try {
    // Get PID from launchctl - filter for gateway process
    const { stdout: launchctlOut } = await execAsync('launchctl list | grep gateway 2>/dev/null', { timeout: 2000 });
    // Match PID after any leading dashes/tabs
    const pidMatch = launchctlOut.trim().match(/^(\d+)\s/);
    if (!pidMatch) return null;
    const pid = pidMatch[1];
    // Get process start time
    const { stdout: psOut } = await execAsync(`ps -o lstart= -p ${pid} 2>/dev/null`, { timeout: 2000 });
    const startTime = new Date(psOut.trim());
    if (isNaN(startTime.getTime())) return null;
    return Math.floor((Date.now() - startTime.getTime()) / 1000);
  } catch {
    return null;
  }
}

async function getMacGPU() {
  let model = null, utilization = null, frequency = null;
  
  try {
    const { stdout } = await execAsync('system_profiler SPDisplaysDataType -json 2>/dev/null', { timeout: 5000 });
    const data = JSON.parse(stdout);
    const displays = data?.SPDisplaysDataType;
    if (displays?.length > 0) {
      model = displays[0].sppci_model || displays[0]._name;
      if (displays[0].spdisplays_utilization) utilization = parseFloat(displays[0].spdisplays_utilization);
    }
  } catch {}
  
  try {
    const { stdout } = await execAsync('ioreg -l -w 0 2>/dev/null | grep -E "(AGX|G14G|G13G|G15G)" | head -5', { timeout: 3000 });
    if (stdout.includes('AGX') && !model) {
      if (stdout.includes('G15G') || stdout.includes('G16G')) model = 'Apple M3 GPU';
      else if (stdout.includes('G14G')) model = 'Apple M2 GPU';
      else if (stdout.includes('G13G')) model = 'Apple M1 GPU';
      else model = 'Apple Silicon GPU';
    }
  } catch {}
  
  try {
    const { stdout } = await execAsync('powermetrics --samplers gpu_power -n 1 -i 50 2>&1 | grep -E "(GPU active|GPU frequency)" | head -5', { timeout: 3000 });
    const utilMatch = stdout.match(/GPU active residency:\s+(\d+\.?\d*)%/);
    const freqMatch = stdout.match(/GPU frequency:\s+(\d+)\s*MHz/);
    if (utilMatch) utilization = parseFloat(utilMatch[1]);
    if (freqMatch) frequency = parseInt(freqMatch[1]);
  } catch {}
  
  if (!model) {
    try {
      const graphics = await si.graphics();
      if (graphics.controllers?.[0]) model = graphics.controllers[0].model;
    } catch {}
  }
  
  if (model) {
    return {
      model: model.trim(),
      short: model.replace(/Apple /, '').substring(0, 16),
      utilization, frequency
    };
  }
  return null;
}

function calcTPS(session, prevSession, elapsedMs) {
  if (!session || !prevSession || elapsedMs < 100) return null;
  const currTokens = session.totalTokens || 0;
  const prevTokens = prevSession.totalTokens || 0;
  const diff = currTokens - prevTokens;
  if (diff <= 0) return null;
  const tps = diff / (elapsedMs / 1000);
  return tps > 0 ? parseFloat(tps.toFixed(1)) : null;
}

class Dashboard {
  constructor() {
    this.settings = loadSettings();
    // Load saved theme on startup
    loadTheme();
    this.screen = blessed.screen({ smartCSR: true, title: 'Claw Dashboard' });
    this.history = { cpu: new Array(HISTORY_LENGTH).fill(0), memory: new Array(HISTORY_LENGTH).fill(0), netRx: new Array(NETWORK_HISTORY_LENGTH).fill(0), netTx: new Array(NETWORK_HISTORY_LENGTH).fill(0) };
    this.data = { cpu: [], memory: {}, openclaw: null, gpu: null, network: null, sessions: [], agents: [], version: null, latest: null, sessionTPS: {}, sessionLastTPS: {} };
    this.prev = null;
    this.lastTime = Date.now();
    this.logLines = [];
    this.isPaused = false;
    this.init();
    
    // Handle terminal resize gracefully
    process.stdout.on('error', (err) => {
      if (err.code === 'EPIPE') {
        // Ignore EPIPE errors from terminal resize/close
        return;
      }
    });
    
    // Catch any uncaught EPIPE errors from blessed internals
    process.on('uncaughtException', (err) => {
      if (err.code === 'EPIPE' || err.message?.includes('EPIPE') || err.message?.includes('write')) {
        // Terminal resized or closed - graceful exit
        process.exit(0);
      }
      throw err;
    });
  }

  init() {
    this.createWidgets();
    this.setupKeys();
    this.fetchVersion();
    // Sync settings with loaded theme and apply it
    const theme = getCurrentTheme();
    this.settings.theme = theme.name.toLowerCase().replace(' ', '-').replace('high-contrast', 'high-contrast');
    this.applyTheme();
    setTimeout(() => this.start(), 500);
  }

  async fetchVersion() {
    try {
      const { stdout } = await execAsync('openclaw --version 2>/dev/null || echo "unknown"', { timeout: 3000 });
      this.data.version = stdout.trim();
      this.data.latest = await getLatestVersion();
    } catch { this.data.version = 'unknown'; }
  }

  createWidgets() {
    this.w = {};
    
    // COMPACT HEADER LAYOUT:
    // Row 0-5: Logo on left (40 cols), widgets flow on right
    // Row 6: Title line below logo
    // Row 7+: Sessions, then logs
    
    const LOGO_WIDTH = 40;
    
    // Logo on left side of header
    this.w.logo = blessed.text({ parent: this.screen, top: 2, left: 1, width: LOGO_WIDTH, content: ASCII_LOGO.join('\n'), style: { fg: C.brightCyan, bold: true } });
    
    // Title below logo (spans full width)
    this.w.title = blessed.text({ parent: this.screen, top: 8, left: 3, content: `Dashboard ${DASHBOARD_VERSION}, openclaw checking...`, style: { fg: C.brightWhite, bold: true } });
    
    // Clock positioned at top-left corner
    this.w.clock = blessed.text({ parent: this.screen, top: 0, left: 0, width: 26, content: '--:--', style: { fg: C.brightCyan, bold: true }, align: 'left', tags: true });

    // All 7 small widgets: positioned to the RIGHT of logo in header area
    this.createWidgetBoxes();

    // Sessions always below header area (row 10), height 9 to span rows 10-18
    this.w.sessBox = blessed.box({ parent: this.screen, left: 0, width: '100%', height: 9, border: { type: 'line' }, label: ' SESSIONS ', style: { border: { fg: C.blue } }, tags: true, overflow: 'hidden', scrollable: false });
    this.w.sessHeader = blessed.text({ parent: this.w.sessBox, top: 0, left: 1, width: '98%', content: 'STATUS AGENT                                          MODEL           CONTEXT      IDLE    CHAN', style: { fg: C.brightWhite, bold: true }, overflow: 'hidden' });
    this.w.sessList = blessed.text({ parent: this.w.sessBox, top: 1, left: 1, width: '98%', height: 6, content: '', style: { fg: C.white }, tags: true, overflow: 'hidden', scrollable: false });
    this.w.sessCount = blessed.text({ parent: this.w.sessBox, top: 0, right: 2, content: '', style: { fg: C.gray } });

    // Logs always below sessions
    this.w.logBox = blessed.box({ parent: this.screen, left: 0, width: '100%', height: 19, border: { type: 'line' }, label: ' OPENCLAW LOGS ', style: { border: { fg: C.cyan } }, scrollable: true, alwaysScroll: true });
    this.w.logContent = blessed.text({ parent: this.w.logBox, top: 0, left: 1, width: '95%-2', content: 'Loading logs...', style: { fg: C.gray }, tags: true });

    this.w.footer = blessed.box({ parent: this.screen, bottom: 0, left: 0, width: '100%', height: 1, style: { bg: C.black, fg: C.gray } });
    this.w.footerText = blessed.text({ parent: this.w.footer, top: 0, left: 'center', content: '', style: { fg: C.gray } });
    
    // Initial layout calculation
    this.recalculateLayout();
  }

  // Create the 7 widget boxes (always created, visibility toggled)
  createWidgetBoxes() {
    const boxHeight = 5;
    
    // Widget 1: CPU (priority)
    this.w.cpuBox = blessed.box({ parent: this.screen, height: boxHeight, border: { type: 'line' }, label: ' CPU ', style: { border: { fg: C.cyan } } });
    this.w.cpuValue = blessed.text({ parent: this.w.cpuBox, top: 0, left: 'center', content: '0%', style: { fg: C.brightGreen, bold: true } });
    this.w.cpuDetail = blessed.text({ parent: this.w.cpuBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    // Widget 2: MEMORY (priority)
    this.w.memBox = blessed.box({ parent: this.screen, height: boxHeight, border: { type: 'line' }, label: ' MEMORY ', style: { border: { fg: C.magenta } } });
    this.w.memValue = blessed.text({ parent: this.w.memBox, top: 0, left: 'center', content: '0%', style: { fg: C.brightMagenta, bold: true } });
    this.w.memDetail = blessed.text({ parent: this.w.memBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    // Widget 3: GPU (priority)
    this.w.gpuBox = blessed.box({ parent: this.screen, height: boxHeight, border: { type: 'line' }, label: ' GPU ', style: { border: { fg: C.yellow } } });
    this.w.gpuValue = blessed.text({ parent: this.w.gpuBox, top: 0, left: 'center', content: 'Detecting...', style: { fg: C.brightYellow, bold: true } });
    this.w.gpuDetail = blessed.text({ parent: this.w.gpuBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    // Widget 4: NETWORK
    this.w.netBox = blessed.box({ parent: this.screen, height: boxHeight, border: { type: 'line' }, label: ' NETWORK ', style: { border: { fg: C.brightCyan } } });
    this.w.netValue = blessed.text({ parent: this.w.netBox, top: 0, left: 'center', content: 'Loading...', style: { fg: C.brightCyan, bold: true } });
    this.w.netDetail = blessed.text({ parent: this.w.netBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    // Widget 5: DISK
    this.w.diskBox = blessed.box({ parent: this.screen, height: boxHeight, border: { type: 'line' }, label: ' DISK ', style: { border: { fg: C.green } } });
    this.w.diskValue = blessed.text({ parent: this.w.diskBox, top: 0, left: 'center', content: '0%', style: { fg: C.brightGreen, bold: true } });
    this.w.diskDetail = blessed.text({ parent: this.w.diskBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    // Widget 6: SYSTEM
    this.w.sysBox = blessed.box({ parent: this.screen, height: boxHeight, border: { type: 'line' }, label: ' SYSTEM ', style: { border: { fg: C.gray } } });
    this.w.sysInfoLine1 = blessed.text({ parent: this.w.sysBox, top: 0, left: 'center', content: '...', style: { fg: C.gray } });
    this.w.sysInfoLine2 = blessed.text({ parent: this.w.sysBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    // Widget 7: UPTIME
    this.w.uptimeBox = blessed.box({ parent: this.screen, height: boxHeight, border: { type: 'line' }, label: ' UPTIME ', style: { border: { fg: C.brightMagenta } } });
    this.w.uptimeSys = blessed.text({ parent: this.w.uptimeBox, top: 0, left: 'center', content: 'Sys: --', style: { fg: C.brightMagenta, bold: true } });
    this.w.uptimeClaw = blessed.text({ parent: this.w.uptimeBox, top: 1, left: 'center', content: 'Claw: --', style: { fg: C.brightMagenta, bold: true } });
  }

  // Recalculate layout positions - COMPACT DESIGN
  // Widgets flow to the right of logo in header area (rows 0-5)
  // Sessions below at row 7, logs below sessions
  recalculateLayout() {
    const boxHeight = 5;
    const LOGO_COLS = 42;  // Logo takes roughly 42 cols on left
    const HEADER_ROWS = 10; // Clock moved to top-left, sessions start at row 10
    const SESSIONS_HEIGHT = 9; // rows 10-18 inclusive = 9 rows to ensure bottom border visible

    // Determine which widgets are visible
    const widgets = [
      { name: 'cpu', box: this.w.cpuBox, visible: this.settings.showWidget1 },
      { name: 'mem', box: this.w.memBox, visible: this.settings.showWidget2 },
      { name: 'gpu', box: this.w.gpuBox, visible: this.settings.showWidget3 },
      { name: 'net', box: this.w.netBox, visible: this.settings.showWidget4 },
      { name: 'disk', box: this.w.diskBox, visible: this.settings.showWidget5 },
      { name: 'sys', box: this.w.sysBox, visible: this.settings.showWidget6 },
      { name: 'uptime', box: this.w.uptimeBox, visible: this.settings.showWidget7 },
    ];

    const visibleWidgets = widgets.filter(w => w.visible);
    const numVisible = visibleWidgets.length;

    if (numVisible === 0) {
      // All widgets hidden - position sessions at top
      this.w.sessBox.position = { top: HEADER_ROWS };
      this.w.sessBox.height = SESSIONS_HEIGHT;
      const logTop = Math.max(19, HEADER_ROWS + SESSIONS_HEIGHT);  // Sessions is now 9 rows, ensure min 19
      this.w.logBox.position = { top: logTop };
      this.w.logBox.height = '100%-' + (logTop + 1);  // -1 for footer
    } else {
      // BALANCED LAYOUT: Split visible widgets evenly between 2 rows
      // Algorithm: row1Count = Math.ceil(visibleCount / 2), row2Count = visibleCount - row1Count
      // 5 widgets -> 3 on top, 2 on bottom
      // 4 widgets -> 2 on top, 2 on bottom
      // 3 widgets -> 2 on top, 1 on bottom
      // 6 widgets -> 3 on top, 3 on bottom

      const row1Count = Math.ceil(numVisible / 2);
      const row2Count = numVisible - row1Count;

      // Calculate width percentage for each widget
      // Available space is roughly (100% - logo offset)
      // Logo is about 42 chars wide in ~120 char terminal = ~35%
      const logoWidthPercent = 35;
      const availablePercent = 100 - logoWidthPercent;

      visibleWidgets.forEach((widget, index) => {
        const row = index < row1Count ? 0 : 1;
        const colInRow = row === 0 ? index : index - row1Count;
        const widgetsInThisRow = row === 0 ? row1Count : row2Count;

        const widthPercent = Math.floor(availablePercent / widgetsInThisRow);
        const leftPercent = logoWidthPercent + (colInRow * widthPercent);

        widget.box.top = row * boxHeight;
        widget.box.left = leftPercent + '%';
        widget.box.width = widthPercent + '%';
        widget.box.show();
      });

      // Hide invisible widgets
      widgets.filter(w => !w.visible).forEach(widget => {
        widget.box.hide();
      });

      // Position sessions below header area (row 10), spanning rows 10-18 (height 9)
      this.w.sessBox.position = { top: HEADER_ROWS };
      this.w.sessBox.height = SESSIONS_HEIGHT;

      // Position logs below sessions (minimum row 19, fill remaining space, account for footer)
      const logTop = Math.max(19, HEADER_ROWS + SESSIONS_HEIGHT);  // Sessions is 9 rows, ensure min 19
      this.w.logBox.position = { top: logTop };
      this.w.logBox.height = '100%-' + (logTop + 1);  // -1 for footer
    }
  }

  setupKeys() {
    this.screen.key(['q', 'C-c'], () => { clearInterval(this.timer); this.screen.destroy(); process.exit(0); });
    this.screen.key('r', () => this.refresh());
    this.screen.key(['?', 'h'], () => this.toggleHelp());
    this.screen.key(['s', 'S'], () => this.toggleSettings());
    this.screen.key(['p', ' '], () => this.togglePause());
    this.screen.key('o', () => this.cycleSessionSort());
    this.screen.key('e', () => this.exportDashboard());
    this.screen.key('E', () => this.cycleExportFormat());
    this.screen.key('t', () => this.cycleTheme());
    
    // Widget toggle keys 1-7
    this.screen.key('1', () => this.toggleWidget('showWidget1'));
    this.screen.key('2', () => this.toggleWidget('showWidget2'));
    this.screen.key('3', () => this.toggleWidget('showWidget3'));
    this.screen.key('4', () => this.toggleWidget('showWidget4'));
    this.screen.key('5', () => this.toggleWidget('showWidget5'));
    this.screen.key('6', () => this.toggleWidget('showWidget6'));
    this.screen.key('7', () => this.toggleWidget('showWidget7'));
  }

  toggleWidget(settingKey) {
    this.settings[settingKey] = !this.settings[settingKey];
    saveSettings(this.settings);
    this.recalculateLayout();
    this.screen.render();
  }

  cycleSessionSort() {
    const modes = ['time', 'tokens', 'idle', 'name'];
    const currentIdx = modes.indexOf(this.settings.sessionSortMode);
    this.settings.sessionSortMode = modes[(currentIdx + 1) % modes.length];
    saveSettings(this.settings);
    this.render();
  }

  cycleTheme() {
    const newTheme = cycleTheme();
    saveTheme();
    this.settings.theme = newTheme;
    saveSettings(this.settings);
    this.applyTheme();
    this.screen.render();
  }

  cycleExportFormat() {
    const formats = ['json', 'csv'];
    const currentIdx = formats.indexOf(this.settings.exportFormat);
    this.settings.exportFormat = formats[(currentIdx + 1) % formats.length];
    saveSettings(this.settings);
    this.w.footerText.setContent(`{green-fg}Export format set to ${this.settings.exportFormat.toUpperCase()}{/green-fg}`);
    this.screen.render();
    setTimeout(() => this.render(), 3000);
  }

  applyTheme() {
    const theme = getCurrentTheme();
    const colors = theme.colors;

    // Apply border colors
    if (this.w.sessBox) this.w.sessBox.style.border.fg = colors.border.sessions;
    if (this.w.logBox) this.w.logBox.style.border.fg = colors.border.logs;
    if (this.w.cpuBox) this.w.cpuBox.style.border.fg = colors.border.cpu;
    if (this.w.memBox) this.w.memBox.style.border.fg = colors.border.memory;
    if (this.w.gpuBox) this.w.gpuBox.style.border.fg = colors.border.gpu;
    if (this.w.netBox) this.w.netBox.style.border.fg = colors.border.network;
    if (this.w.diskBox) this.w.diskBox.style.border.fg = colors.border.disk;
    if (this.w.sysBox) this.w.sysBox.style.border.fg = colors.border.system;
    if (this.w.uptimeBox) this.w.uptimeBox.style.border.fg = colors.border.uptime;

    // Apply text colors
    if (this.w.sessHeader) this.w.sessHeader.style.fg = colors.text.header;
    if (this.w.sessList) this.w.sessList.style.fg = colors.text.primary;
    if (this.w.sessCount) this.w.sessCount.style.fg = colors.text.secondary;
    if (this.w.logContent) this.w.logContent.style.fg = colors.text.secondary;

    // Apply branding colors
    if (this.w.logo) this.w.logo.style.fg = colors.branding.logo;
    if (this.w.title) this.w.title.style.fg = colors.branding.title;
    if (this.w.clock) this.w.clock.style.fg = colors.branding.clock;

    // Footer
    if (this.w.footer) this.w.footer.style.bg = colors.footer.bg;
    if (this.w.footer) this.w.footer.style.fg = colors.footer.fg;
    if (this.w.footerText) this.w.footerText.style.fg = colors.footer.fg;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      clearInterval(this.timer);
    } else {
      this.refresh();
      this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
    }
    this.render();
  }

  exportDashboard() {
    const exportDir = this.settings.exportDirectory || process.env.HOME + '/.openclaw/exports';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const format = this.settings.exportFormat || 'json';
    const filename = `dashboard-${timestamp}.${format}`;
    const filepath = exportDir + '/' + filename;

    try {
      // Create export directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      if (format === 'csv') {
        // Build CSV data with sessions as rows
        let csv = 'exportTime,dashboardVersion,sessionId,sessionType,model,status,runtime,tokens,cost\n';
        
        const exportTime = new Date().toISOString();
        const version = DASHBOARD_VERSION;
        
        if (this.data.sessions && this.data.sessions.length > 0) {
          for (const s of this.data.sessions) {
            const row = [
              exportTime,
              version,
              s.id || '',
              s.type || '',
              s.model || '',
              s.status || '',
              s.runtime || '',
              s.tokens || 0,
              s.cost || 0
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
            csv += row + '\n';
          }
        } else {
          // No sessions - add system info row
          const row = [
            exportTime,
            version,
            'system',
            'system',
            'N/A',
            'active',
            this.data.systemUptime || '',
            0,
            0
          ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
          csv += row + '\n';
        }
        
        fs.writeFileSync(filepath, csv);
      } else {
        // Build JSON data object
        const exportData = {
          exportedAt: new Date().toISOString(),
          dashboardVersion: DASHBOARD_VERSION,
          settings: this.settings,
          system: this.data.system,
          systemUptime: this.data.systemUptime,
          gatewayUptime: this.data.gatewayUptime,
          cpu: this.data.cpu,
          memory: this.data.memory,
          gpu: this.data.gpu,
          disk: this.data.disk,
          network: this.data.network,
          openclaw: this.data.openclaw,
          sessions: this.data.sessions,
          logLines: this.logLines,
        };

        fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
      }
      
      // Show brief notification in footer
      this.w.footerText.setContent(`{green-fg}Exported to ${filename} (${format.toUpperCase()}){/green-fg}`);
      this.screen.render();
      
      // Restore footer after 3 seconds
      setTimeout(() => this.render(), 3000);
    } catch (err) {
      // Show error in footer
      this.w.footerText.setContent(`{red-fg}Export failed: ${err.message}{/red-fg}`);
      this.screen.render();
      
      // Restore footer after 5 seconds
      setTimeout(() => this.render(), 5000);
    }
  }

  toggleHelp() {
    if (this.w.helpBox) {
      this.w.helpBox.destroy();
      delete this.w.helpBox;
      this.w.helpContent.destroy();
      delete this.w.helpContent;
      this.screen.render();
    } else {
      this.showHelp();
    }
  }

  showHelp() {
    const helpText = [
      '{center}{bold}CLAW DASHBOARD - KEYBOARD SHORTCUTS{/bold}{/center}',
      '',
      '  {cyan-fg}q{/cyan-fg} or {cyan-fg}Ctrl+C{/cyan-fg}  Quit the dashboard',
      '  {cyan-fg}r{/cyan-fg}              Force refresh all data',
      '  {cyan-fg}p{/cyan-fg} or {cyan-fg}Space{/cyan-fg}    Pause/resume auto-refresh',
      '  {cyan-fg}o{/cyan-fg}              Cycle session sort (time/tokens/idle/name)',
      '  {cyan-fg}e{/cyan-fg}              Export dashboard data (JSON/CSV)',
      '  {cyan-fg}E{/cyan-fg}              Cycle export format (JSON/CSV)',
      '  {cyan-fg}t{/cyan-fg}              Cycle theme (default/dark/high-contrast/ocean)',
      '  {cyan-fg}?{/cyan-fg} or {cyan-fg}h{/cyan-fg}        Toggle this help panel',
      '  {cyan-fg}s{/cyan-fg} or {cyan-fg}S{/cyan-fg}        Open settings panel',
      '',
      '  {cyan-fg}1-7{/cyan-fg}            Toggle widgets (1:CPU 2:MEM 3:GPU 4:NET 5:DISK 6:SYS 7:UP)',
      '',
      `  {gray-fg}Export Dir: ${this.settings.exportDirectory}{/gray-fg}`,
      `  {gray-fg}Export Format: ${this.settings.exportFormat.toUpperCase()}{/gray-fg}`,
      `  {gray-fg}Theme: ${this.settings.theme}{/gray-fg}`,
      '',
      '{center}{gray-fg}Press ? or h to close this help{/gray-fg}{/center}'
    ].join('\n');

    this.w.helpBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 50,
      height: 13,
      border: { type: 'line' },
      style: {
        border: { fg: C.brightCyan },
        bg: C.black
      },
      label: ' HELP '
    });

    this.w.helpContent = blessed.text({
      parent: this.w.helpBox,
      top: 1,
      left: 1,
      width: '95%',
      height: '90%',
      content: helpText,
      style: { fg: C.white },
      tags: true
    });

    this.screen.render();
  }

  toggleSettings() {
    if (this.w.settingsBox) {
      this.closeSettings();
    } else {
      this.showSettings();
    }
  }

  closeSettings() {
    if (this.w.settingsBox) {
      this.w.settingsBox.destroy();
      delete this.w.settingsBox;
      delete this.w.settingsList;
      this.screen.render();
    }
  }

  showSettings() {
    const refreshMs = this.settings.refreshInterval;
    const refreshSec = refreshMs / 1000;

    this.w.settingsBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 56,
      height: 18,
      border: { type: 'line' },
      style: {
        border: { fg: C.brightGreen },
        bg: C.black
      },
      label: ' SETTINGS '
    });

    blessed.text({
      parent: this.w.settingsBox,
      top: 1,
      left: 'center',
      content: '{bold}SETTINGS{/bold}',
      style: { fg: C.brightWhite },
      tags: true
    });

    blessed.text({
      parent: this.w.settingsBox,
      top: 3,
      left: 2,
      content: '↑/↓ Navigate    Enter Toggle    s/Esc Close',
      style: { fg: C.cyan },
      tags: true
    });

    const getSettingsItems = () => [
      `Refresh Interval: ${refreshSec}s (1s/2s/5s/10s)`,
      `1 CPU:            ${this.settings.showWidget1 ? 'ON' : 'OFF'}`,
      `2 Memory:         ${this.settings.showWidget2 ? 'ON' : 'OFF'}`,
      `3 GPU:            ${this.settings.showWidget3 ? 'ON' : 'OFF'}`,
      `4 Network:        ${this.settings.showWidget4 ? 'ON' : 'OFF'}`,
      `5 Disk:           ${this.settings.showWidget5 ? 'ON' : 'OFF'}`,
      `6 System:         ${this.settings.showWidget6 ? 'ON' : 'OFF'}`,
      `7 Uptime:         ${this.settings.showWidget7 ? 'ON' : 'OFF'}`,
      `Log Level Filter: ${this.settings.logLevelFilter.toUpperCase()}`
    ];

    this.w.settingsList = blessed.list({
      parent: this.w.settingsBox,
      top: 5,
      left: 2,
      width: 52,
      height: 9,
      items: getSettingsItems(),
      style: {
        fg: C.white,
        bg: C.black,
        selected: { fg: C.black, bg: C.yellow, bold: true },
        item: { fg: C.white }
      },
      keys: true,
      vi: false,
      mouse: false,
      scrollable: false
    });

    blessed.text({
      parent: this.w.settingsBox,
      bottom: 1,
      left: 'center',
      content: 'Changes auto-saved',
      style: { fg: C.gray },
      tags: true
    });

    // Handle selection
    this.w.settingsList.on('select', (item, index) => {
      this.toggleSettingOption(index);
      // Refresh the list items
      this.w.settingsList.setItems(getSettingsItems());
      this.w.settingsList.select(index);
      this.screen.render();
    });

    // Handle escape to close
    this.w.settingsList.key(['escape'], () => {
      this.closeSettings();
    });

    this.w.settingsList.focus();
    this.screen.render();
  }

  toggleSettingOption(index) {
    switch (index) {
      case 0: // Refresh interval - cycle through 1s, 2s, 5s, 10s
        const intervals = [1000, 2000, 5000, 10000];
        // Ensure we're working with a number (settings loaded from JSON may be strings)
        const currentVal = Number(this.settings.refreshInterval) || 2000;
        let currentIdx = intervals.indexOf(currentVal);
        // If not found, find closest lower value or wrap to start
        if (currentIdx === -1) {
          currentIdx = intervals.findIndex(v => v > currentVal) - 1;
          if (currentIdx < 0) currentIdx = intervals.length - 1;
        }
        this.settings.refreshInterval = intervals[(currentIdx + 1) % intervals.length];
        // Restart timer with new interval
        clearInterval(this.timer);
        this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
        break;
      case 1: // Toggle Widget 1 (CPU)
        this.settings.showWidget1 = !this.settings.showWidget1;
        this.recalculateLayout();
        break;
      case 2: // Toggle Widget 2 (Memory)
        this.settings.showWidget2 = !this.settings.showWidget2;
        this.recalculateLayout();
        break;
      case 3: // Toggle Widget 3 (GPU)
        this.settings.showWidget3 = !this.settings.showWidget3;
        this.recalculateLayout();
        break;
      case 4: // Toggle Widget 4 (Network)
        this.settings.showWidget4 = !this.settings.showWidget4;
        this.recalculateLayout();
        break;
      case 5: // Toggle Widget 5 (Disk)
        this.settings.showWidget5 = !this.settings.showWidget5;
        this.recalculateLayout();
        break;
      case 6: // Toggle Widget 6 (System)
        this.settings.showWidget6 = !this.settings.showWidget6;
        this.recalculateLayout();
        break;
      case 7: // Toggle Widget 7 (Uptime)
        this.settings.showWidget7 = !this.settings.showWidget7;
        this.recalculateLayout();
        break;
      case 8: // Cycle log level filter: all -> debug -> info -> warn -> error -> all
        const levels = ['all', 'debug', 'info', 'warn', 'error'];
        const currentLevel = levels.indexOf(this.settings.logLevelFilter);
        this.settings.logLevelFilter = levels[(currentLevel + 1) % levels.length];
        break;
    }
    saveSettings(this.settings);
    this.screen.render();
  }

  // Fetch sessions directly from sessions.json (like openclaw CLI does)
  // The Gateway API now only returns the current session, so we read the file directly
  async fetchSessions() {
    const sessionsPath = process.env.HOME + '/.openclaw/agents/main/sessions/sessions.json';
    try {
      const data = fs.readFileSync(sessionsPath, 'utf8');
      const sessionsObj = JSON.parse(data);
      
      // Convert sessions object to array format similar to what the API used to return
      const sessions = Object.entries(sessionsObj).map(([key, session]) => ({
        key: key,
        channel: session.channel || 'unknown',
        displayName: session.displayName || key,
        updatedAt: session.updatedAt || session.lastMessageAt || 0,
        sessionId: session.sessionId || key,
        model: session.model || 'unknown',
        contextTokens: session.contextWindow || session.contextTokens || 0,
        totalTokens: session.totalTokens || 0,
        kind: session.kind || 'other',
        deliveryContext: session.deliveryContext || {},
        systemSent: session.systemSent || false,
        abortedLastRun: session.abortedLastRun || false,
        lastChannel: session.lastChannel || session.channel || '',
        lastTo: session.lastTo || '',
        lastAccountId: session.lastAccountId || '',
        transcriptPath: session.transcriptPath || ''
      }));
      
      // Sorting is applied in render() based on sessionSortMode setting
      return sessions;
    } catch (err) {
      throw new Error('Failed to read sessions: ' + err.message);
    }
  }

  start() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), this.settings.refreshInterval);
  }

  updateHistory(cpu, mem) {
    this.history.cpu.push(cpu); this.history.cpu.shift();
    this.history.memory.push(mem); this.history.memory.shift();
  }

  async refresh() {
    const now = Date.now();
    const elapsed = now - this.lastTime;
    
    try {
      const [cpu, mem] = await Promise.all([si.currentLoad(), si.mem()]);
      this.data.cpu = cpu.cpus.map(c => c.load);
      this.data.cpuAvg = cpu.currentLoad;
      // On macOS, mem.used includes cached memory. Use active + wired for actual usage
      // or calculate from available memory for consistency with Activity Monitor
      const actualUsed = mem.available ? (mem.total - mem.available) : mem.used;
      this.data.memory = { 
        usedGB: (actualUsed / 1024**3).toFixed(1), 
        totalGB: (mem.total / 1024**3).toFixed(1), 
        percent: Math.round((actualUsed / mem.total) * 100),
        cachedGB: ((mem.used - actualUsed) / 1024**3).toFixed(1) // Track cache separately
      };
      
      this.updateHistory(this.data.cpuAvg, this.data.memory.percent);
      
      const os = await si.osInfo();
      const ver = await si.versions();
      const time = await si.time();
      this.data.system = `${os.distro || 'macOS'} ${os.release} (${os.arch})  Node v${ver.node}`;
      this.data.systemUptime = time.uptime;
      
      // Fetch disk stats for root partition
      try {
        const fsSize = await si.fsSize();
        const rootFs = fsSize.find(f => f.mount === '/') || fsSize[0];
        if (rootFs) {
          this.data.disk = {
            usedGB: (rootFs.used / 1024**3).toFixed(1),
            availableGB: (rootFs.available / 1024**3).toFixed(1),
            totalGB: (rootFs.size / 1024**3).toFixed(1),
            percent: Math.round(rootFs.use),
            mount: rootFs.mount,
            fs: rootFs.fs
          };
        }
      } catch (e) {
        this.data.disk = null;
      }
      
      // Fetch GPU stats
      this.data.gpu = await getMacGPU();
      
      // Fetch network stats
      try {
        const netStats = await si.networkStats();
        const primaryInterface = netStats.find(n => n.operstate === 'up' && !n.internal) || netStats[0];
        if (primaryInterface) {
          const now = Date.now();
          if (this.lastNetTime && this.lastNetStats) {
            const elapsedSec = (now - this.lastNetTime) / 1000;
            const rxDiff = Math.max(0, primaryInterface.rx_bytes - this.lastNetStats.rx_bytes);
            const txDiff = Math.max(0, primaryInterface.tx_bytes - this.lastNetStats.tx_bytes);
            this.data.network = {
              rxSec: rxDiff / elapsedSec,
              txSec: txDiff / elapsedSec,
              rxTotal: primaryInterface.rx_bytes,
              txTotal: primaryInterface.tx_bytes,
              interface: primaryInterface.iface
            };
            this.history.netRx.push(this.data.network.rxSec);
            this.history.netRx.shift();
            this.history.netTx.push(this.data.network.txSec);
            this.history.netTx.shift();
          }
          this.lastNetStats = { rx_bytes: primaryInterface.rx_bytes, tx_bytes: primaryInterface.tx_bytes };
          this.lastNetTime = now;
        }
      } catch (e) {
        this.data.network = null;
      }
      
      // Fetch sessions via API (same as clawps) - has displayName and channel
      try {
        const sessions = await this.fetchSessions();
        this.data.sessions = sessions || [];
        this.data.openclaw = { gateway: { reachable: true } };
      } catch (err) {
        // eslint-disable-next-line no-console
        logger.error('Session fetch error:', err.message);
        this.data.sessions = this.data.sessions || [];
        this.data.openclaw = { gateway: { reachable: false } };
      }

      // Calculate TPS - persist last known value, show gray when idle
      if (this.data.openclaw?.sessions?.recent && this.prev?.openclaw?.sessions?.recent) {
        for (const session of this.data.openclaw.sessions.recent) {
          const prevSession = this.prev.openclaw.sessions.recent.find(s => s.key === session.key);
          const tps = calcTPS(session, prevSession, elapsed);
          if (tps !== null) {
            this.data.sessionTPS[session.key] = { value: tps, active: true };
            this.data.sessionLastTPS[session.key] = tps;
          } else {
            // No new tokens - show last known TPS as inactive
            const lastTPS = this.data.sessionLastTPS?.[session.key];
            this.data.sessionTPS[session.key] = { value: lastTPS || null, active: false };
          }
        }
      }

      // Fetch gateway uptime
      this.data.gatewayUptime = await getGatewayUptime();

      // Fetch recent logs
      try {
        const { stdout } = await execAsync('openclaw logs --limit 200 --plain 2>/dev/null', { timeout: 5000 });
        const filterFn = getLogFilterFn(this.settings.logLevelFilter || 'all');
        const lines = stdout.trim().split('\n')
          .filter(line => !line.includes('plugin CLI register skipped'))
          .filter(line => filterFn(line));
        // Store all filtered logs - dynamic slicing happens in render()
        if (lines.length > 0 && lines[0]) {
          this.logLines = lines;
        }
        // If fetch failed but we have previous logs, keep those
      } catch (e) {
        // Keep existing this.logLines on failure - don't replace with unavailable
      }
      
      this.prev = JSON.parse(JSON.stringify(this.data));
      this.lastTime = now;
      this.render();
    } catch (e) {}
  }

  render() {
    const cpuPercent = Math.round(this.data.cpuAvg || 0);
    this.w.cpuValue.setContent(`${cpuPercent}%`);
    this.w.cpuValue.style.fg = getColor(cpuPercent);
    this.w.cpuDetail.setContent(`${this.data.cpu?.length || 0} cores`);

    const memPercent = this.data.memory.percent || 0;
    this.w.memValue.setContent(`${memPercent}%`);
    this.w.memValue.style.fg = getColor(memPercent);
    this.w.memDetail.setContent(`${this.data.memory.usedGB}/${this.data.memory.totalGB}`);

    // GPU widget content
    if (this.data.gpu) {
      this.w.gpuValue.setContent(this.data.gpu.short);
      this.w.gpuValue.style.fg = C.brightYellow;
      let details = [];
      if (this.data.gpu.utilization != null) details.push(`${Math.round(this.data.gpu.utilization)}% util`);
      if (this.data.gpu.frequency) details.push(`${this.data.gpu.frequency}MHz`);
      this.w.gpuDetail.setContent(details.join('  ') || 'Apple Silicon');
      this.w.gpuDetail.style.fg = C.gray;
    } else {
      this.w.gpuValue.setContent('Not Detected');
      this.w.gpuValue.style.fg = C.gray;
      this.w.gpuDetail.setContent('');
    }

    // Render network widget
    if (this.data.network) {
      const rxStr = formatBitsPerSecond(this.data.network.rxSec);
      const txStr = formatBitsPerSecond(this.data.network.txSec);
      const netText = `▼${rxStr} ▲${txStr}`;
      this.w.netValue.setContent(netText);
      this.w.netValue.style.fg = C.brightCyan;
      this.w.netDetail.setContent(this.data.network.interface || 'eth0');
    } else {
      this.w.netValue.setContent('No network');
      this.w.netValue.style.fg = C.gray;
      this.w.netDetail.setContent('');
    }

    // Render header OpenClaw status - logo color shows offline state
    const isOnline = this.data.openclaw?.gateway?.reachable;
    if (isOnline) {
      this.w.logo.style.fg = C.brightCyan;
    } else {
      this.w.logo.style.fg = C.red;  // Logo turns red when offline!
    }

    if (this.data.sessions.length) {
      // Sort sessions based on current sort mode
      const sortMode = this.settings.sessionSortMode || 'time';
      const sortedSessions = [...this.data.sessions].sort((a, b) => {
        switch (sortMode) {
          case 'time':
            return (b.updatedAt || 0) - (a.updatedAt || 0); // Most recent first
          case 'tokens':
            return (b.totalTokens || 0) - (a.totalTokens || 0); // Most tokens first
          case 'idle':
            const idleA = a.updatedAt ? Date.now() - a.updatedAt : 0;
            const idleB = b.updatedAt ? Date.now() - b.updatedAt : 0;
            return idleB - idleA; // Longest idle first
          case 'name':
            return (a.displayName || '').localeCompare(b.displayName || ''); // A-Z
          default:
            return (b.updatedAt || 0) - (a.updatedAt || 0);
        }
      });

      // Show 6 sessions within 9-row box (header + 6 lines + footer/border)
      const displaySessions = sortedSessions.slice(0, 6);

      const lines = displaySessions.map(s => {
        // Calculate idle time
        const idleMs = s.updatedAt ? Date.now() - s.updatedAt : 0;

        // Status: active (green), idle (yellow), stale (red)
        let statusStr;
        if (idleMs < 5 * 60 * 1000) {
          statusStr = `{green-fg}active{/green-fg}`;
        } else if (idleMs < 30 * 60 * 1000) {
          statusStr = `{yellow-fg}idle  {/yellow-fg}`;
        } else {
          statusStr = `{gray-fg}stale {/gray-fg}`;
        }

        // Agent name from displayName (like clawps) - wider now
        let agentName = s.displayName || 'unknown';
        agentName = agentName
          .replace(/^Cron: /, '')
          .substring(0, 45)
          .padEnd(45);

        // Model (shortened) - wider
        const model = (s.model?.replace('moonshot/', '').replace('openrouter/', 'or/')?.substring(0, 15) || '-').padEnd(15);

        // Context: current/max (e.g., 15K/250K)
        const currentTokens = s.totalTokens || 0;
        const maxTokens = s.contextWindow || s.contextTokens || 0;
        const formatToks = (n) => {
          if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
          if (n >= 1000) return Math.round(n/1000) + 'K';
          return n.toString();
        };
        const context = `${formatToks(currentTokens)}/${formatToks(maxTokens)}`.padEnd(12);

        // Idle time formatted - wider
        let idle;
        if (idleMs < 60000) idle = `${Math.round(idleMs / 1000)}s`;
        else if (idleMs < 3600000) idle = `${Math.round(idleMs / 60000)}m`;
        else idle = `${Math.round(idleMs / 3600000)}h`;
        idle = idle.padEnd(7);

        // Channel (telegram, webchat, etc.) - wider
        const channel = (s.channel || '-').substring(0, 10).padEnd(10);

        return `${statusStr} ${agentName} ${model} ${context} ${idle} ${channel}`;
      });
      this.w.sessList.setContent(lines.join('\n').replace(/\n$/, ''));
      const totalCount = this.data.sessions.length;
      const showingCount = displaySessions.length;
      this.w.sessCount.setContent(showingCount < totalCount ? `${showingCount}/${totalCount}` : `${totalCount}`);
    } else {
      this.w.sessList.setContent('No active sessions');
      this.w.sessCount.setContent('0 sessions');
    }

    // Update logs - dynamically fill available space with wrapping calculation
    if (this.logLines.length) {
      const filter = this.settings.logLevelFilter || 'all';
      const filterFn = getLogFilterFn(filter);
      const filteredLogs = this.logLines.filter(line => filterFn(line));
      
      // Calculate available space for logs
      const logHeight = this.w.logBox.height || 15;
      const logWidth = (this.w.logBox.width || 80) - 4; // account for borders/padding
      const availableLines = Math.max(1, logHeight - 2); // subtract header/border space
      
      // Fill from bottom (latest first) accounting for wrapped lines
      let usedLines = 0;
      const logsToShow = [];
      
      // Iterate from end (newest) backwards
      for (let i = filteredLogs.length - 1; i >= 0; i--) {
        const log = filteredLogs[i];
        const lineCount = calculateWrappedLines(log, logWidth);
        
        if (usedLines + lineCount <= availableLines) {
          logsToShow.unshift(log); // add to beginning (oldest of shown)
          usedLines += lineCount;
        } else {
          break; // no more space
        }
      }
      
      // Colorize and display
      const coloredLines = logsToShow.map(line => colorizeLogLine(line));
      this.w.logContent.setContent(coloredLines.join('\n'));
    } else {
      this.w.logContent.setContent('No log output');
    }

    // Split system info into two lines: OS version and Node version
    if (this.data.system) {
      const parts = this.data.system.split('  ');
      this.w.sysInfoLine1.setContent(parts[0] || 'macOS');
      this.w.sysInfoLine2.setContent(parts[1] || '');
    } else {
      this.w.sysInfoLine1.setContent('Unknown System');
      this.w.sysInfoLine2.setContent('');
    }

    // Render combined dashboard + openclaw version line
    let openclawText = 'openclaw unknown';
    if (this.data.version) {
      const current = this.data.version.replace(/-\d+$/, ''); // Strip brew revision suffix
      const latest = this.data.latest;
      if (latest && current !== 'unknown') {
        if (current === latest) {
          openclawText = `openclaw ${current} ✓`;
        } else {
          openclawText = `openclaw ${current} → ${latest}`;
        }
      } else {
        openclawText = `openclaw ${current}`;
      }
    }
    this.w.title.setContent(`Dashboard ${DASHBOARD_VERSION}, ${openclawText}`);

    // Update clock - show current local time, PAUSED indicator on the right
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    if (this.isPaused) {
      this.w.clock.setContent(`${timeStr} ${dateStr}  {yellow-fg}[PAUSED]{/yellow-fg}`);
    } else {
      this.w.clock.setContent(`${timeStr} ${dateStr}`);
    }

    // Render disk widget
    if (this.data.disk) {
      const diskPercent = this.data.disk.percent || 0;
      this.w.diskValue.setContent(`${diskPercent}%`);
      this.w.diskValue.style.fg = getColor(diskPercent);
      this.w.diskDetail.setContent(`${this.data.disk.usedGB}/${this.data.disk.totalGB}`);
      this.w.diskBox.style.border.fg = getColor(diskPercent);
    } else {
      this.w.diskValue.setContent('No disk info');
      this.w.diskValue.style.fg = C.gray;
      this.w.diskDetail.setContent('');
    }

    // Render uptime widget - Sys on line 1, Claw on line 2
    const sysUptime = formatDuration(this.data.systemUptime);
    const gwUptime = formatDuration(this.data.gatewayUptime);
    this.w.uptimeSys.setContent(`Sys: ${sysUptime}`);
    this.w.uptimeClaw.setContent(`Claw: ${gwUptime}`);
    // Color based on gateway health - green if running, yellow if system up but gateway down
    if (this.data.openclaw?.gateway?.reachable) {
      this.w.uptimeSys.style.fg = C.brightMagenta;
      this.w.uptimeClaw.style.fg = C.brightMagenta;
      this.w.uptimeBox.style.border.fg = C.brightMagenta;
    } else if (this.data.systemUptime) {
      this.w.uptimeSys.style.fg = C.yellow;
      this.w.uptimeClaw.style.fg = C.yellow;
      this.w.uptimeBox.style.border.fg = C.yellow;
    } else {
      this.w.uptimeSys.style.fg = C.gray;
      this.w.uptimeClaw.style.fg = C.gray;
      this.w.uptimeBox.style.border.fg = C.gray;
    }

    // Update footer with current refresh interval, pause state, and sort mode
    const refreshSec = Math.round(this.settings.refreshInterval / 1000);
    const pauseIndicator = this.isPaused ? '▶ running' : 'p pause';
    const sortMode = this.settings.sessionSortMode;
    this.w.footerText.setContent(`q quit  r refresh  ${pauseIndicator}  o sort:${sortMode}  1-7 toggle  ? help  s settings  •  ${refreshSec}s refresh`);

    // Update session box label to show sort mode
    const sortLabel = sortMode === 'time' ? 'TIME' : sortMode === 'tokens' ? 'TOKENS' : sortMode === 'idle' ? 'IDLE' : 'NAME';
    this.w.sessBox.setLabel(` SESSIONS (${sortLabel}) `);

    try {
      this.screen.render();
    } catch (err) {
      if (err.code === 'EPIPE' || err.message?.includes('write')) {
        // Terminal resized or closed - ignore
        return;
      }
      throw err;
    }
  }
}

new Dashboard();
