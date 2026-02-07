#!/usr/bin/env node

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

const REFRESH_INTERVAL = 2000;
const HISTORY_LENGTH = 60; // Keep last 60 data points for sparklines

// Color palette - using blessed color names
const C = {
  green: 'green',
  brightGreen: 'brightgreen',
  yellow: 'yellow',
  brightYellow: 'brightyellow',
  red: 'red',
  brightRed: 'brightred',
  cyan: 'cyan',
  brightCyan: 'brightcyan',
  magenta: 'magenta',
  brightMagenta: 'brightmagenta',
  blue: 'blue',
  brightBlue: 'brightblue',
  white: 'white',
  brightWhite: 'brightwhite',
  gray: 'gray',
  black: 'black'
};

// ASCII Art Logo
const ASCII_LOGO = [
  '   ██████╗██╗      █████╗ ██╗    ██╗   ',
  '  ██╔════╝██║     ██╔══██╗██║    ██║   ',
  '  ██║     ██║     ███████║██║ █╗ ██║   ',
  '  ██║     ██║     ██╔══██║██║███╗██║   ',
  '  ╚██████╗███████╗██║  ██║╚███╔███╔╝   ',
  '   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝    '
];

// Gradient characters for progress bars (from empty to full)
const GRADIENT_CHARS = ['░', '▒', '▓', '█'];

function createGradientBar(percent, width = 20) {
  const filled = Math.round((percent / 100) * width);
  const remainder = ((percent / 100) * width) - filled;
  
  let bar = C.brightCyan + '█'.repeat(filled);
  
  // Add partial block for smoother gradient
  if (filled < width) {
    if (remainder > 0.75) bar += '▓';
    else if (remainder > 0.5) bar += '▒';
    else if (remainder > 0.25) bar += '░';
    bar += '{gray-fg}░{/gray-fg}'.repeat(width - filled - (remainder > 0.25 ? 1 : 0));
  }
  
  return bar;
}

function getColorForLoad(percent) {
  if (percent >= 80) return C.brightRed;
  if (percent >= 60) return C.brightYellow;
  if (percent >= 40) return C.brightCyan;
  return C.brightGreen;
}

function getColorForPercent(percent) {
  if (percent >= 80) return C.red;
  if (percent >= 60) return C.yellow;
  return C.green;
}

// Simple ASCII sparkline generator
function sparkline(data, width = 20, minVal = 0, maxVal = null) {
  if (!data || data.length === 0) return '─'.repeat(width);
  
  const chars = '▁▂▃▄▅▆▇█';
  const max = maxVal !== null ? maxVal : Math.max(...data, 1);
  const min = minVal;
  const range = max - min || 1;
  
  // Get last 'width' data points
  const recent = data.slice(-width);
  
  return recent.map(v => {
    const normalized = Math.max(0, Math.min(1, (v - min) / range));
    const idx = Math.floor(normalized * (chars.length - 1));
    return chars[idx];
  }).join('');
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

async function getMacGPU() {
  let model = null;
  let utilization = null;
  let frequency = null;
  let temperature = null;
  
  // Try system_profiler with JSON output first
  try {
    const { stdout } = await execAsync('system_profiler SPDisplaysDataType -json 2>/dev/null', { timeout: 5000 });
    const data = JSON.parse(stdout);
    const displays = data?.SPDisplaysDataType;
    if (displays && displays.length > 0) {
      const gpu = displays[0];
      model = gpu.sppci_model || gpu._name || gpu.model;
      // Try to get utilization if available
      if (gpu.spdisplays_utilization) {
        utilization = parseFloat(gpu.spdisplays_utilization);
      }
      if (gpu.spdisplays_vram) {
        // Sometimes shows dedicated memory info
      }
    }
  } catch {}
  
  // Try ioreg for Apple Silicon GPU details
  try {
    const { stdout } = await execAsync('ioreg -l -w 0 2>/dev/null | grep -E "(GPU|AGX|G14G|G13G|G15G)" | head -20', { timeout: 3000 });
    
    // Detect Apple Silicon GPU model from ioreg
    if (stdout.includes('AGX')) {
      if (!model) {
        if (stdout.includes('G15G') || stdout.includes('G16G')) model = 'Apple M3 GPU';
        else if (stdout.includes('G14G')) model = 'Apple M2 GPU';
        else if (stdout.includes('G13G')) model = 'Apple M1 GPU';
        else model = 'Apple Silicon GPU';
      }
    }
    
    // Try to get performance state
    const perfMatch = stdout.match(/"PerformanceStatistics"\s*=\s*<([^>]+)>/);
    if (perfMatch) {
      // Parse binary data or hex string for utilization
    }
  } catch {}
  
  // Try more specific ioreg query for Apple Silicon
  try {
    const { stdout } = await execAsync('ioreg -l -w 0 | grep -A 20 "AGXAccelerator" | head -30', { timeout: 3000 });
    
    // Look for model info
    const modelMatch = stdout.match(/model\s*=\s*<"([^"]+)"/) || stdout.match(/model\s*=\s*"([^"]+)"/);
    if (modelMatch && !model) {
      model = modelMatch[1];
    }
  } catch {}
  
  // Fallback to basic system_profiler text
  if (!model) {
    try {
      const { stdout } = await execAsync('system_profiler SPDisplaysDataType 2>/dev/null', { timeout: 5000 });
      const chipsetMatch = stdout.match(/Chipset Model:\s*(.+)/);
      const modelMatch = stdout.match(/Model:\s*(.+)/);
      model = chipsetMatch?.[1] || modelMatch?.[1];
    } catch {}
  }
  
  // Try powermetrics for GPU utilization (works on Apple Silicon without sudo sometimes)
  try {
    const { stdout } = await execAsync('powermetrics --samplers gpu_power -n 1 -i 50 2>&1 | grep -E "(GPU active|GPU frequency|GPU Power)" | head -10', { timeout: 3000 });
    
    const utilMatch = stdout.match(/GPU active residency:\s+(\d+\.?\d*)%/);
    const freqMatch = stdout.match(/GPU frequency:\s+(\d+)\s*MHz/);
    const powerMatch = stdout.match(/GPU Power:\s+(\d+\.?\d*)\s*m?W/);
    
    if (utilMatch) utilization = parseFloat(utilMatch[1]);
    if (freqMatch) frequency = parseInt(freqMatch[1]);
  } catch {}
  
  // Final fallback to systeminformation library
  if (!model) {
    try {
      const graphics = await si.graphics();
      if (graphics.controllers?.[0]) {
        model = graphics.controllers[0].model;
        if (graphics.controllers[0].utilizationGpu) {
          utilization = graphics.controllers[0].utilizationGpu;
        }
      }
    } catch {}
  }
  
  if (model) {
    return {
      model: model.trim(),
      short: model.replace(/Apple /, '').replace(/M(\d)/, 'M$1').substring(0, 16),
      utilization,
      frequency,
      temperature
    };
  }
  return null;
}

// Fixed TPS calculation - uses correct property names from JSON
function calcSessionTPS(session, prevSession, elapsedMs) {
  if (!session || !prevSession || elapsedMs < 100) return null;
  
  // Use totalTokens directly from the session object
  const currTokens = session.totalTokens || 0;
  const prevTokens = prevSession.totalTokens || 0;
  
  const diff = currTokens - prevTokens;
  if (diff <= 0) return null;
  
  const tps = diff / (elapsedMs / 1000);
  return tps > 0 ? parseFloat(tps.toFixed(1)) : null;
}

class Dashboard {
  constructor() {
    this.screen = blessed.screen({ 
      smartCSR: true, 
      title: 'Claw Dashboard',
      dockBorders: true,
      cursor: { artificial: true, shape: 'block', blink: false, color: null }
    });
    
    // History data for sparklines
    this.history = {
      cpu: new Array(HISTORY_LENGTH).fill(0),
      memory: new Array(HISTORY_LENGTH).fill(0),
      timestamps: []
    };
    
    this.data = { 
      cpu: [], 
      memory: {}, 
      openclaw: null, 
      gpu: null, 
      sessions: [], 
      agents: [], 
      version: null, 
      latest: null 
    };
    this.prev = null;
    this.lastTime = Date.now();
    this.init();
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
    
    // Header with ASCII art - Row 0-2
    this.w.headerBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      style: { bg: C.black }
    });
    
    this.w.logo = blessed.text({
      parent: this.w.headerBox,
      top: 0,
      left: 1,
      width: 40,
      content: ASCII_LOGO.join('\n'),
      style: { fg: C.brightCyan, bold: true }
    });
    
    this.w.title = blessed.text({
      parent: this.w.headerBox,
      top: 1,
      left: 42,
      content: 'Dashboard',
      style: { fg: C.brightWhite, bold: true }
    });
    
    this.w.subtitle = blessed.text({
      parent: this.w.headerBox,
      top: 1,
      left: 52,
      content: '{gray-fg}v1.0{/gray-fg}',
      tags: true,
      style: { fg: C.gray }
    });

    // CPU Box with sparkline - Row 3-5, Left
    this.w.cpuBox = blessed.box({
      parent: this.screen,
      top: 3,
      left: 0,
      width: '25%',
      height: 4,
      border: { type: 'line', fg: C.cyan },
      label: { text: ' CPU ', side: 'left', fg: C.brightCyan },
      style: { border: { fg: C.cyan } }
    });
    
    this.w.cpuValue = blessed.text({
      parent: this.w.cpuBox,
      top: 1,
      left: 'center',
      content: '0%',
      style: { fg: C.brightGreen, bold: true }
    });
    
    this.w.cpuBar = blessed.text({
      parent: this.w.cpuBox,
      top: 2,
      left: 'center',
      content: createGradientBar(0, 15),
      tags: true
    });
    
    this.w.cpuSpark = blessed.text({
      parent: this.w.cpuBox,
      bottom: 0,
      left: 'center',
      content: sparkline(this.history.cpu, 15),
      style: { fg: C.cyan }
    });

    // Memory Box with sparkline - Row 3-5, Center-Left
    this.w.memBox = blessed.box({
      parent: this.screen,
      top: 3,
      left: '25%',
      width: '25%',
      height: 4,
      border: { type: 'line', fg: C.magenta },
      label: { text: ' MEMORY ', side: 'left', fg: C.brightMagenta },
      style: { border: { fg: C.magenta } }
    });
    
    this.w.memValue = blessed.text({
      parent: this.w.memBox,
      top: 1,
      left: 'center',
      content: '0GB',
      style: { fg: C.brightMagenta, bold: true }
    });
    
    this.w.memBar = blessed.text({
      parent: this.w.memBox,
      top: 2,
      left: 'center',
      content: createGradientBar(0, 15),
      tags: true
    });
    
    this.w.memSpark = blessed.text({
      parent: this.w.memBox,
      bottom: 0,
      left: 'center',
      content: sparkline(this.history.memory, 15),
      style: { fg: C.magenta }
    });

    // GPU Box - Row 3-5, Center-Right
    this.w.gpuBox = blessed.box({
      parent: this.screen,
      top: 3,
      left: '50%',
      width: '25%',
      height: 4,
      border: { type: 'line', fg: C.yellow },
      label: { text: ' GPU ', side: 'left', fg: C.brightYellow },
      style: { border: { fg: C.yellow } }
    });
    
    this.w.gpuValue = blessed.text({
      parent: this.w.gpuBox,
      top: 1,
      left: 'center',
      content: 'Detecting...',
      style: { fg: C.brightYellow, bold: true }
    });
    
    this.w.gpuDetail = blessed.text({
      parent: this.w.gpuBox,
      top: 2,
      left: 'center',
      content: '',
      style: { fg: C.gray }
    });

    // OpenClaw Status Box - Row 3-5, Right
    this.w.clawBox = blessed.box({
      parent: this.screen,
      top: 3,
      left: '75%',
      width: '25%',
      height: 4,
      border: { type: 'line', fg: C.green },
      label: { text: ' OPENCLAW ', side: 'left', fg: C.brightGreen },
      style: { border: { fg: C.green } }
    });
    
    this.w.clawStatus = blessed.text({
      parent: this.w.clawBox,
      top: 1,
      left: 'center',
      content: 'Loading...',
      style: { fg: C.cyan, bold: true }
    });
    
    this.w.clawStats = blessed.text({
      parent: this.w.clawBox,
      top: 2,
      left: 'center',
      content: '',
      style: { fg: C.white }
    });

    // Sessions Table - Row 7-10, Left (75% width)
    this.w.sessBox = blessed.box({
      parent: this.screen,
      top: 7,
      left: 0,
      width: '75%',
      height: 5,
      border: { type: 'line', fg: C.blue },
      label: { text: ' SESSIONS ', side: 'left', fg: C.brightBlue },
      style: { border: { fg: C.blue } }
    });
    
    this.w.sessTable = contrib.table({
      parent: this.w.sessBox,
      interactive: false,
      columnWidth: [16, 14, 8, 10, 12, 8],
      columnSpacing: 2,
      top: 0,
      left: 1,
      height: '90%',
      width: '98%',
      style: {
        header: { fg: C.brightWhite, bold: true },
        cell: { fg: C.white },
        fg: C.white
      }
    });

    // Agents Box - Row 7-10, Right (25% width)
    this.w.agBox = blessed.box({
      parent: this.screen,
      top: 7,
      left: '75%',
      width: '25%',
      height: 5,
      border: { type: 'line', fg: C.yellow },
      label: { text: ' AGENTS ', side: 'left', fg: C.brightYellow },
      style: { border: { fg: C.yellow } }
    });
    
    this.w.agList = blessed.text({
      parent: this.w.agBox,
      top: 1,
      left: 1,
      content: 'No agents',
      style: { fg: C.white }
    });

    // System Info Box - Row 12, Left (50% width)
    this.w.sysBox = blessed.box({
      parent: this.screen,
      top: 12,
      left: 0,
      width: '50%',
      height: 3,
      border: { type: 'line', fg: C.gray },
      label: { text: ' SYSTEM ', side: 'left', fg: C.white },
      style: { border: { fg: C.gray } }
    });
    
    this.w.sysInfo = blessed.text({
      parent: this.w.sysBox,
      top: 'center',
      left: 'center',
      content: '...',
      style: { fg: C.gray }
    });

    // Version/Update Box - Row 12, Right (50% width)
    this.w.verBox = blessed.box({
      parent: this.screen,
      top: 12,
      left: '50%',
      width: '50%',
      height: 3,
      border: { type: 'line', fg: C.gray },
      label: { text: ' VERSION ', side: 'left', fg: C.white },
      style: { border: { fg: C.gray } }
    });
    
    this.w.verInfo = blessed.text({
      parent: this.w.verBox,
      top: 'center',
      left: 'center',
      content: '...',
      style: { fg: C.white }
    });

    // Footer - Row 15
    this.w.footer = blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      style: { bg: C.black, fg: C.gray }
    });
    
    this.w.footerText = blessed.text({
      parent: this.w.footer,
      top: 0,
      left: 'center',
      content: '{cyan-fg}q{/cyan-fg} quit  {cyan-fg}r{/cyan-fg} refresh  {gray-fg}•{/gray-fg}  2s refresh',
      tags: true,
      style: { fg: C.gray }
    });
  }

  setupKeys() {
    this.screen.key(['q', 'C-c'], () => { 
      clearInterval(this.timer); 
      this.screen.destroy(); 
      process.exit(0); 
    });
    this.screen.key('r', () => this.refresh());
  }

  start() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), REFRESH_INTERVAL);
  }

  updateHistory(cpuPercent, memPercent) {
    this.history.cpu.push(cpuPercent);
    this.history.cpu.shift();
    this.history.memory.push(memPercent);
    this.history.memory.shift();
  }

  async refresh() {
    const now = Date.now();
    const elapsed = now - this.lastTime;
    
    try {
      // Fetch system data
      const [cpu, mem] = await Promise.all([si.currentLoad(), si.mem()]);
      this.data.cpu = cpu.cpus.map(c => c.load);
      this.data.cpuAvg = cpu.currentLoad;
      this.data.memory = {
        usedGB: (mem.used / 1024**3).toFixed(1),
        totalGB: (mem.total / 1024**3).toFixed(1),
        percent: Math.round((mem.used / mem.total) * 100)
      };
      
      // Update history for sparklines
      this.updateHistory(this.data.cpuAvg, this.data.memory.percent);
      
      // System info
      const os = await si.osInfo();
      const ver = await si.versions();
      this.data.system = `${os.distro || 'macOS'} ${os.release} (${os.arch})  Node v${ver.node}`;
      
      // GPU detection
      this.data.gpu = await getMacGPU();
      
      // OpenClaw status
      try {
        const { stdout } = await execAsync('openclaw status --json', { timeout: 5000 });
        this.data.openclaw = JSON.parse(stdout);
        this.data.sessions = this.data.openclaw.sessions?.recent || [];
        this.data.agents = this.data.openclaw.agents?.agents || [];
      } catch {
        this.data.openclaw = null;
        this.data.sessions = [];
        this.data.agents = [];
      }
      
      // Calculate per-session TPS
      this.data.sessionTPS = {};
      if (this.data.openclaw?.sessions?.recent && this.prev?.openclaw?.sessions?.recent) {
        for (const session of this.data.openclaw.sessions.recent) {
          const prevSession = this.prev.openclaw.sessions.recent.find(s => s.key === session.key);
          if (prevSession) {
            this.data.sessionTPS[session.key] = calcSessionTPS(session, prevSession, elapsed);
          }
        }
      }
      
      this.prev = JSON.parse(JSON.stringify(this.data));
      this.lastTime = now;
      
      this.render();
    } catch (e) {
      // Silent error handling
    }
  }

  render() {
    // CPU Section
    const cpuPercent = Math.round(this.data.cpuAvg || 0);
    const cpuColor = getColorForLoad(cpuPercent);
    this.w.cpuValue.setContent(`${cpuPercent}%`);
    this.w.cpuValue.style.fg = cpuColor;
    this.w.cpuBar.setContent(createGradientBar(cpuPercent, 15));
    this.w.cpuBar.style.fg = cpuColor;
    this.w.cpuSpark.setContent(sparkline(this.history.cpu, 15));
    this.w.cpuSpark.style.fg = cpuColor;

    // Memory Section
    const memPercent = this.data.memory.percent || 0;
    const memColor = getColorForPercent(memPercent);
    this.w.memValue.setContent(`${this.data.memory.usedGB}GB / ${this.data.memory.totalGB}GB`);
    this.w.memValue.style.fg = memColor;
    this.w.memBar.setContent(createGradientBar(memPercent, 15));
    this.w.memBar.style.fg = memColor;
    this.w.memSpark.setContent(sparkline(this.history.memory, 15));
    this.w.memSpark.style.fg = memColor;

    // GPU Section
    if (this.data.gpu) {
      this.w.gpuValue.setContent(this.data.gpu.short);
      this.w.gpuValue.style.fg = C.brightYellow;
      
      let gpuDetails = [];
      if (this.data.gpu.utilization != null) {
        gpuDetails.push(`${Math.round(this.data.gpu.utilization)}% util`);
      }
      if (this.data.gpu.frequency) {
        gpuDetails.push(`${this.data.gpu.frequency}MHz`);
      }
      this.w.gpuDetail.setContent(gpuDetails.join('  ') || 'Apple Silicon');
      this.w.gpuDetail.style.fg = C.gray;
    } else {
      this.w.gpuValue.setContent('Not Detected');
      this.w.gpuValue.style.fg = C.gray;
      this.w.gpuDetail.setContent('');
    }

    // OpenClaw Section
    if (this.data.openclaw) {
      const ok = this.data.openclaw.gateway?.reachable;
      const sessions = this.data.openclaw.agents?.totalSessions || 0;
      const agents = this.data.agents.length;
      
      this.w.clawStatus.setContent(ok ? '{green-fg}●{/green-fg} Online' : '{red-fg}●{/red-fg} Offline');
      this.w.clawStatus.style.fg = ok ? C.green : C.red;
      this.w.clawStats.setContent(`${sessions} sessions  ${agents} agents`);
      this.w.clawStats.style.fg = C.white;
    } else {
      this.w.clawStatus.setContent('{red-fg}●{/red-fg} Not Available');
      this.w.clawStatus.style.fg = C.red;
      this.w.clawStats.setContent('');
    }

    // Sessions Table with TPS
    if (this.data.sessions.length) {
      const tableData = this.data.sessions.map(s => {
        const tps = this.data.sessionTPS?.[s.key];
        const shortId = s.key.split(':').pop().substring(0, 12);
        const modelName = s.model?.split('/').pop()?.substring(0, 12) || '?';
        const tokens = s.totalTokens?.toString() || '0';
        const tpsStr = tps ? tps.toString() : '--';
        const percent = `${s.percentUsed || 0}%`;
        
        return [shortId, modelName, tokens, tpsStr, percent, s.agentId.substring(0, 6)];
      });
      
      this.w.sessTable.setData({
        headers: ['Session ID', 'Model', 'Tokens', 'TPS', 'Usage', 'Agent'],
        data: tableData
      });
      
      // Color code TPS values
      this.w.sessTable.rows.style.selected = { bg: C.blue };
    } else {
      this.w.sessTable.setData({ 
        headers: ['Session ID', 'Model', 'Tokens', 'TPS', 'Usage', 'Agent'], 
        data: [['No active sessions', '', '', '', '', '']] 
      });
    }

    // Agents List
    if (this.data.agents.length) {
      const agentLines = this.data.agents.map(a => {
        const status = a.bootstrapPending ? '{yellow-fg}⏳{/yellow-fg}' : '{green-fg}●{/green-fg}';
        const id = a.id.substring(0, 8);
        return `${status} ${id} ${a.sessionsCount}s`;
      });
      this.w.agList.setContent(agentLines.join('\n'));
      this.w.agList.style.fg = C.white;
    } else {
      this.w.agList.setContent('{gray-fg}No agents{/gray-fg}');
      this.w.agList.style.fg = C.gray;
    }

    // System Info
    this.w.sysInfo.setContent(this.data.system || 'Unknown System');
    this.w.sysInfo.style.fg = C.gray;

    // Version Info
    let v = this.data.version || 'unknown';
    const cleanVersion = v.replace(/-\d+$/, '');
    const isLatest = this.data.latest && cleanVersion === this.data.latest;
    const hasUpdate = this.data.latest && cleanVersion !== this.data.latest && v !== 'unknown';
    
    if (v.length > 20) v = v.substring(0, 20);
    
    let verContent = v;
    if (hasUpdate) {
      verContent += `  {yellow-fg}↑ ${this.data.latest}{/yellow-fg}`;
      this.w.verInfo.style.fg = C.yellow;
    } else if (isLatest || !this.data.latest) {
      verContent += '  {green-fg}✓ latest{/green-fg}';
      this.w.verInfo.style.fg = C.green;
    } else {
      this.w.verInfo.style.fg = C.cyan;
    }
    this.w.verInfo.setContent(verContent);

    this.screen.render();
  }
}

new Dashboard();
