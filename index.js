#!/usr/bin/env node

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  showNetwork: true,
  showGPU: true,
  showDisk: true,
  colorScheme: 'default'
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

const C = {
  green: 'green', brightGreen: 'brightgreen',
  yellow: 'yellow', brightYellow: 'brightyellow',
  red: 'red', brightRed: 'brightred',
  cyan: 'cyan', brightCyan: 'brightcyan',
  magenta: 'magenta', brightMagenta: 'brightmagenta',
  blue: 'blue', brightBlue: 'brightblue',
  white: 'white', brightWhite: 'brightwhite',
  gray: 'gray', black: 'black'
};

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
    // Get PID from launchctl
    const { stdout: launchctlOut } = await execAsync('launchctl list | grep openclaw 2>/dev/null', { timeout: 2000 });
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
    this.screen = blessed.screen({ smartCSR: true, title: 'Claw Dashboard' });
    this.history = { cpu: new Array(HISTORY_LENGTH).fill(0), memory: new Array(HISTORY_LENGTH).fill(0), netRx: new Array(NETWORK_HISTORY_LENGTH).fill(0), netTx: new Array(NETWORK_HISTORY_LENGTH).fill(0) };
    this.data = { cpu: [], memory: {}, openclaw: null, gpu: null, network: null, sessions: [], agents: [], version: null, latest: null, sessionTPS: {}, sessionLastTPS: {} };
    this.prev = null;
    this.lastTime = Date.now();
    this.logLines = [];
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
    
    // Header area: logo on left, 3 stat boxes in a horizontal row on right
    // Logo is ~39 chars wide, dashboard version + clawbot version stacked under
    
    this.w.logo = blessed.text({ parent: this.screen, top: 0, left: 1, width: 40, content: ASCII_LOGO.join('\n'), style: { fg: C.brightCyan, bold: true } });
    this.w.title = blessed.text({ parent: this.screen, top: 6, left: 3, content: `Dashboard ${DASHBOARD_VERSION}, openclaw checking...`, style: { fg: C.brightWhite, bold: true } });

    // 3 stat boxes in a horizontal row
    // Fixed positioning: logo ends ~col 42, remaining space split evenly
    const boxHeight = 5;  // removed blank row at bottom
    const startCol = 42;
    const boxWidth = 32;  // wider to prevent wrapping
    const boxTop = 1;     // moved down one line
    
    this.w.cpuBox = blessed.box({ parent: this.screen, top: boxTop, left: startCol, width: boxWidth, height: boxHeight, border: { type: 'line' }, label: ' CPU ', style: { border: { fg: C.cyan } } });
    this.w.cpuValue = blessed.text({ parent: this.w.cpuBox, top: 0, left: 'center', content: '0%', style: { fg: C.brightGreen, bold: true } });
    this.w.cpuDetail = blessed.text({ parent: this.w.cpuBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });
    this.w.cpuSpark = blessed.text({ parent: this.w.cpuBox, top: 2, left: 'center', content: sparkline(this.history.cpu), style: { fg: C.cyan } });

    this.w.memBox = blessed.box({ parent: this.screen, top: boxTop, left: startCol + boxWidth, width: boxWidth, height: boxHeight, border: { type: 'line' }, label: ' MEMORY ', style: { border: { fg: C.magenta } } });
    this.w.memValue = blessed.text({ parent: this.w.memBox, top: 0, left: 'center', content: '0GB', style: { fg: C.brightMagenta, bold: true } });
    this.w.memDetail = blessed.text({ parent: this.w.memBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });
    this.w.memSpark = blessed.text({ parent: this.w.memBox, top: 2, left: 'center', content: sparkline(this.history.memory), style: { fg: C.magenta } });

    this.w.gpuBox = blessed.box({ parent: this.screen, top: boxTop, left: startCol + boxWidth * 2, width: boxWidth, height: boxHeight, border: { type: 'line' }, label: ' GPU ', style: { border: { fg: C.yellow } } });
    this.w.gpuValue = blessed.text({ parent: this.w.gpuBox, top: 0, left: 'center', content: 'Detecting...', style: { fg: C.brightYellow, bold: true } });
    this.w.gpuDetail = blessed.text({ parent: this.w.gpuBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });
    this.w.gpuSpark = blessed.text({ parent: this.w.gpuBox, top: 2, left: 'center', content: '', style: { fg: C.yellow } });

    this.w.sessBox = blessed.box({ parent: this.screen, top: 8, left: 0, width: '75%', height: 8, border: { type: 'line' }, label: ' SESSIONS ', style: { border: { fg: C.blue } } });
    this.w.sessHeader = blessed.text({ parent: this.w.sessBox, top: 0, left: 1, content: 'Session ID     Model        Tokens   TPS  Usage Agent Idle', style: { fg: C.brightWhite, bold: true } });
    this.w.sessList = blessed.text({ parent: this.w.sessBox, top: 1, left: 1, width: '90%', height: 5, content: '', style: { fg: C.white }, tags: true });

    this.w.agBox = blessed.box({ parent: this.screen, top: 8, left: '75%', width: '25%', height: 8, border: { type: 'line' }, label: ' AGENTS ', style: { border: { fg: C.yellow } } });
    this.w.agHeader = blessed.text({ parent: this.w.agBox, top: 0, left: 1, content: 'Agent       Status    Idle', style: { fg: C.brightWhite, bold: true } });
    this.w.agList = blessed.text({ parent: this.w.agBox, top: 1, left: 1, width: '90%', height: 5, content: 'No agents', style: { fg: C.white }, tags: true });

    this.w.sysBox = blessed.box({ parent: this.screen, top: 16, left: 0, width: '25%', height: 4, border: { type: 'line' }, label: ' SYSTEM ', style: { border: { fg: C.gray } } });
    this.w.sysInfoLine1 = blessed.text({ parent: this.w.sysBox, top: 0, left: 'center', content: '...', style: { fg: C.gray } });
    this.w.sysInfoLine2 = blessed.text({ parent: this.w.sysBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    this.w.netBox = blessed.box({ parent: this.screen, top: 16, left: '25%', width: '25%', height: 4, border: { type: 'line' }, label: ' NETWORK ', style: { border: { fg: C.brightCyan } } });
    this.w.netValue = blessed.text({ parent: this.w.netBox, top: 0, left: 'center', content: 'Loading...', style: { fg: C.brightCyan, bold: true } });
    this.w.netDetail = blessed.text({ parent: this.w.netBox, top: 1, left: 'center', content: '', style: { fg: C.gray } });

    this.w.diskBox = blessed.box({ parent: this.screen, top: 16, left: '50%', width: '25%', height: 4, border: { type: 'line' }, label: ' DISK ', style: { border: { fg: C.green } } });
    this.w.diskGauge = blessed.text({ parent: this.w.diskBox, top: 0, left: 'center', content: '', style: { fg: C.green } });
    this.w.diskValue = blessed.text({ parent: this.w.diskBox, top: 1, left: 'center', content: 'Loading...', style: { fg: C.brightGreen, bold: true } });

    this.w.uptimeBox = blessed.box({ parent: this.screen, top: 16, left: '75%', width: '25%', height: 4, border: { type: 'line' }, label: ' UPTIME ', style: { border: { fg: C.brightMagenta } } });
    this.w.uptimeSys = blessed.text({ parent: this.w.uptimeBox, top: 0, left: 'center', content: 'Sys: --', style: { fg: C.brightMagenta, bold: true } });
    this.w.uptimeClaw = blessed.text({ parent: this.w.uptimeBox, top: 1, left: 'center', content: 'Claw: --', style: { fg: C.brightMagenta, bold: true } });

    this.w.logBox = blessed.box({ parent: this.screen, top: 20, left: 0, width: '100%', height: '100%-21', border: { type: 'line' }, label: ' OPENCLAW LOGS ', style: { border: { fg: C.cyan } }, scrollable: true, alwaysScroll: true });
    this.w.logContent = blessed.text({ parent: this.w.logBox, top: 0, left: 1, width: '95%-2', content: 'Loading logs...', style: { fg: C.gray } });

    this.w.footer = blessed.box({ parent: this.screen, bottom: 0, left: 0, width: '100%', height: 1, style: { bg: C.black, fg: C.gray } });
    this.w.footerText = blessed.text({ parent: this.w.footer, top: 0, left: 'center', content: '', style: { fg: C.gray } });
  }

  setupKeys() {
    this.screen.key(['q', 'C-c'], () => { clearInterval(this.timer); this.screen.destroy(); process.exit(0); });
    this.screen.key('r', () => this.refresh());
    this.screen.key(['?', 'h'], () => this.toggleHelp());
    this.screen.key(['s', 'S'], () => this.toggleSettings());
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
      '  {cyan-fg}?{/cyan-fg} or {cyan-fg}h{/cyan-fg}        Toggle this help panel',
      '  {cyan-fg}s{/cyan-fg} or {cyan-fg}S{/cyan-fg}        Open settings panel',
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
      height: 16,
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

    this.w.settingsList = blessed.list({
      parent: this.w.settingsBox,
      top: 5,
      left: 2,
      width: 52,
      height: 6,
      items: [
        `Refresh Interval: ${refreshSec}s (1s/2s/5s/10s)`,
        `Show Network:     ${this.settings.showNetwork ? 'ON' : 'OFF'}`,
        `Show GPU:         ${this.settings.showGPU ? 'ON' : 'OFF'}`,
        `Show Disk:        ${this.settings.showDisk ? 'ON' : 'OFF'}`
      ],
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
      const newRefreshMs = this.settings.refreshInterval;
      const newRefreshSec = newRefreshMs / 1000;
      this.w.settingsList.setItems([
        `Refresh Interval: ${newRefreshSec}s (1s/2s/5s/10s)`,
        `Show Network:     ${this.settings.showNetwork ? 'ON' : 'OFF'}`,
        `Show GPU:         ${this.settings.showGPU ? 'ON' : 'OFF'}`,
        `Show Disk:        ${this.settings.showDisk ? 'ON' : 'OFF'}`
      ]);
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
      case 1: // Toggle network
        this.settings.showNetwork = !this.settings.showNetwork;
        break;
      case 2: // Toggle GPU
        this.settings.showGPU = !this.settings.showGPU;
        break;
      case 3: // Toggle disk
        this.settings.showDisk = !this.settings.showDisk;
        break;
    }
    saveSettings(this.settings);
    // Re-render main dashboard to apply visibility changes
    this.render();
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
      
      // Fetch disk stats for root partition (if enabled)
      if (!this.settings.showDisk) {
        this.data.disk = null;
      } else try {
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
      
      // Fetch GPU stats (if enabled)
      if (this.settings.showGPU) {
        this.data.gpu = await getMacGPU();
      } else {
        this.data.gpu = null;
      }
      
      // Fetch network stats (if enabled)
      if (!this.settings.showNetwork) {
        this.data.network = null;
      } else try {
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
      
      try {
        const { stdout } = await execAsync('openclaw status --json', { timeout: 5000 });
        this.data.openclaw = JSON.parse(stdout);
        this.data.sessions = this.data.openclaw.sessions?.recent || [];
        this.data.agents = this.data.openclaw.heartbeat?.agents || [];
      } catch {
        this.data.openclaw = null;
        this.data.sessions = [];
        this.data.agents = [];
        this.data.gatewayUptime = null;
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
        const { stdout } = await execAsync('openclaw logs --limit 100 --plain 2>/dev/null', { timeout: 3000 });
        this.logLines = stdout.trim().split('\n')
          .filter(line => !line.includes('plugin CLI register skipped'))
          .slice(-20);
      } catch {
        this.logLines = ['Logs unavailable'];
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
    this.w.cpuSpark.setContent(sparkline(this.history.cpu));
    this.w.cpuSpark.style.fg = cpuPercent > 60 ? C.yellow : C.cyan;

    const memPercent = this.data.memory.percent || 0;
    this.w.memValue.setContent(`${this.data.memory.usedGB}GB / ${this.data.memory.totalGB}GB`);
    this.w.memValue.style.fg = getColor(memPercent);
    // Show cache info if significant (>1GB)
    const cacheInfo = this.data.memory.cachedGB > 1 ? ` (${this.data.memory.cachedGB}GB cache)` : '';
    this.w.memDetail.setContent(`${memPercent}% used${cacheInfo}`);
    this.w.memSpark.setContent(sparkline(this.history.memory));
    this.w.memSpark.style.fg = memPercent > 60 ? C.yellow : C.magenta;

    if (!this.settings.showGPU) {
      this.w.gpuValue.setContent('[Disabled]');
      this.w.gpuValue.style.fg = C.gray;
      this.w.gpuDetail.setContent('');
      this.w.gpuSpark.setContent('');
    } else if (this.data.gpu) {
      this.w.gpuValue.setContent(this.data.gpu.short);
      this.w.gpuValue.style.fg = C.brightYellow;
      let details = [];
      if (this.data.gpu.utilization != null) details.push(`${Math.round(this.data.gpu.utilization)}% util`);
      if (this.data.gpu.frequency) details.push(`${this.data.gpu.frequency}MHz`);
      this.w.gpuDetail.setContent(details.join('  ') || 'Apple Silicon');
      this.w.gpuDetail.style.fg = C.gray;
      this.w.gpuSpark.setContent(gauge(this.data.gpu.utilization || 0, 12));
      this.w.gpuSpark.style.fg = C.yellow;
    } else {
      this.w.gpuValue.setContent('Not Detected');
      this.w.gpuValue.style.fg = C.gray;
      this.w.gpuDetail.setContent('');
      this.w.gpuSpark.setContent('');
    }

    // Render network widget (compact version in bottom row)
    if (!this.settings.showNetwork) {
      this.w.netValue.setContent('[Disabled]');
      this.w.netValue.style.fg = C.gray;
      this.w.netDetail.setContent('');
    } else if (this.data.network) {
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
      const lines = this.data.sessions.map(s => {
        const tpsData = this.data.sessionTPS?.[s.key];
        const tpsValue = tpsData?.value;
        const tpsActive = tpsData?.active;
        const id = s.key.split(':').pop().substring(0, 14).padEnd(14);
        const model = (s.model?.split('/').pop()?.substring(0, 12) || '?').padEnd(12);
        const tokens = ((s.totalTokens || 0).toString()).padStart(6);
        // Show TPS value, gray if idle/active=false
        let tpsStr;
        if (tpsValue !== null && tpsValue !== undefined) {
          tpsStr = tpsValue.toFixed(1);
        } else {
          tpsStr = '--';
        }
        tpsStr = tpsStr.padStart(6);
        const usage = (`${s.percentUsed || 0}%`).padStart(5);
        const agent = (s.agentId?.substring(0, 6) || 'main').padStart(6);
        // Calculate idle time from updatedAt timestamp
        let idle = '--';
        if (s.updatedAt) {
          const idleMs = Date.now() - s.updatedAt;
          if (idleMs < 60000) idle = `${Math.round(idleMs / 1000)}s`;
          else if (idleMs < 3600000) idle = `${Math.round(idleMs / 60000)}m`;
          else idle = `${Math.round(idleMs / 3600000)}h`;
        }
        idle = idle.padStart(5);
        // Build line with TPS coloring - gray when idle, white when active
        const tpsColored = tpsActive ? tpsStr : `{gray-fg}${tpsStr}{/gray-fg}`;
        return `${id} ${model} ${tokens} ${tpsColored} ${usage} ${agent} ${idle}`;
      });
      this.w.sessList.setContent(lines.join('\n'));
    } else {
      this.w.sessList.setContent('No active sessions');
    }

    if (this.data.agents.length) {
      const agentLines = this.data.agents.map(a => {
        const id = (a.agentId || 'unknown').substring(0, 10).padEnd(10);
        // Find most recent session activity for this agent
        const agentSessions = this.data.sessions.filter(s => s.agentId === a.agentId);
        const mostRecentUpdate = agentSessions.length > 0
          ? Math.max(...agentSessions.map(s => s.updatedAt || 0))
          : null;
        // Calculate idle time from sessions
        let idle = '--';
        let isRunning = false;
        if (mostRecentUpdate) {
          const idleMs = Date.now() - mostRecentUpdate;
          if (idleMs < 60000) {
            idle = `${Math.round(idleMs / 1000)}s`;
            isRunning = true;
          } else if (idleMs < 300000) {
            idle = `${Math.round(idleMs / 60000)}m`;
            isRunning = true;
          } else if (idleMs < 3600000) {
            idle = `${Math.round(idleMs / 60000)}m`;
          } else {
            idle = `${Math.round(idleMs / 3600000)}h`;
          }
        }
        // Status: running if active within 5 min, on if enabled, off if disabled
        const status = isRunning ? '{green-fg}▶ run{/green-fg}' : (a.enabled ? '{cyan-fg}● on{/cyan-fg}' : '{gray-fg}○ off{/gray-fg}');
        return `${id} ${status.padEnd(10)} ${idle.padStart(6)}`;
      });
      this.w.agList.setContent(agentLines.join('\n'));
    } else {
      this.w.agList.setContent('No agents');
    }

    // Update logs
    if (this.logLines.length) {
      this.w.logContent.setContent(this.logLines.join('\n'));
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

    // Render disk widget
    if (!this.settings.showDisk) {
      this.w.diskValue.setContent('[Disabled]');
      this.w.diskValue.style.fg = C.gray;
      this.w.diskGauge.setContent('');
      this.w.diskBox.style.border.fg = C.gray;
    } else if (this.data.disk) {
      const diskPercent = this.data.disk.percent || 0;
      const diskText = `${this.data.disk.usedGB}GB / ${this.data.disk.totalGB}GB`;
      this.w.diskValue.setContent(diskText);
      this.w.diskValue.style.fg = getColor(diskPercent);
      this.w.diskGauge.setContent(gauge(diskPercent, 10));
      this.w.diskGauge.style.fg = getColor(diskPercent);
      this.w.diskBox.style.border.fg = getColor(diskPercent);
    } else {
      this.w.diskValue.setContent('No disk info');
      this.w.diskValue.style.fg = C.gray;
      this.w.diskGauge.setContent('');
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

    // Update footer with current refresh interval
    const refreshSec = Math.round(this.settings.refreshInterval / 1000);
    this.w.footerText.setContent(`q quit  r refresh  ? help  s settings  •  ${refreshSec}s refresh`);

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
