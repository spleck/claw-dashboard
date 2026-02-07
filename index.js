#!/usr/bin/env node

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

const REFRESH_INTERVAL = 2000;

// Color names for blessed
const C = {
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  cyan: 'cyan',
  magenta: 'magenta',
  blue: 'blue',
  white: 'white',
  gray: 'gray',
  black: 'black'
};

function gauge(percent) {
  const filled = Math.round((percent / 100) * 12);
  return '█'.repeat(filled) + '░'.repeat(12 - filled);
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
  let temp = null;
  
  // Try system_profiler with JSON output first
  try {
    const { stdout } = await execAsync('system_profiler SPDisplaysDataType -json 2>/dev/null', { timeout: 5000 });
    const data = JSON.parse(stdout);
    const displays = data?.SPDisplaysDataType;
    if (displays && displays.length > 0) {
      const gpu = displays[0];
      model = gpu.sppci_model || gpu._name;
      // Try to get utilization if available
      if (gpu.spdisplays_utilization) {
        utilization = parseFloat(gpu.spdisplays_utilization);
      }
    }
  } catch {}
  
  // Try ioreg for more hardware details
  if (!model) {
    try {
      const { stdout } = await execAsync('ioreg -l | grep -E "(GPU|Graphics)" | head -5', { timeout: 3000 });
      const match = stdout.match(/"model"\s*=\s*<"([^"]+)"/);
      if (match) model = match[1];
    } catch {}
  }
  
  // Fallback to basic system_profiler text
  if (!model) {
    try {
      const { stdout } = await execAsync('system_profiler SPDisplaysDataType 2>/dev/null', { timeout: 5000 });
      const chipsetMatch = stdout.match(/Chipset Model:\s*(.+)/);
      const modelMatch = stdout.match(/Model:\s*(.+)/);
      model = chipsetMatch?.[1] || modelMatch?.[1];
    } catch {}
  }
  
  // Try to get GPU utilization via top or other means
  try {
    const { stdout } = await execAsync('top -l 1 -s 0 -stats pid,command,cpu | grep -i gpu 2>/dev/null || echo ""', { timeout: 2000 });
    if (stdout.includes('GPU')) {
      // Extract utilization if possible
      const utilMatch = stdout.match(/(\d+\.?\d*)%/);
      if (utilMatch) utilization = parseFloat(utilMatch[1]);
    }
  } catch {}
  
  // Try powermetrics (may work without sudo on some systems or give partial data)
  if (!utilization) {
    try {
      const { stdout } = await execAsync('powermetrics --samplers gpu_power -n 1 -i 100 2>&1 | head -10', { timeout: 3000 });
      const utilMatch = stdout.match(/GPU active residency:\s+(\d+\.?\d*)%/);
      const freqMatch = stdout.match(/GPU frequency:\s+(\d+)\s*MHz/);
      if (utilMatch) utilization = parseFloat(utilMatch[1]);
      if (freqMatch) temp = parseInt(freqMatch[1]); // Using freq as temp placeholder
    } catch {}
  }
  
  // Final fallback to systeminformation library
  if (!model) {
    try {
      const graphics = await si.graphics();
      if (graphics.controllers?.[0]) {
        model = graphics.controllers[0].model;
      }
    } catch {}
  }
  
  if (model) {
    return {
      model: model.trim(),
      short: model.replace(/Apple /, '').replace(/M(\d)/, 'M$1').substring(0, 14),
      utilization,
      temp
    };
  }
  return null;
}

function calcSessionTPS(session, prevSession, elapsedMs) {
  if (!session?.tokenUsage || !prevSession?.tokenUsage || elapsedMs < 100) return null;
  const currTokens = (session.tokenUsage.total || 0) + (session.tokenUsageOutput?.total || 0);
  const prevTokens = (prevSession.tokenUsage.total || 0) + (prevSession.tokenUsageOutput?.total || 0);
  const diff = currTokens - prevTokens;
  const tps = diff / (elapsedMs / 1000);
  return tps > 0 ? tps.toFixed(1) : null;
}

class Dashboard {
  constructor() {
    this.screen = blessed.screen({ smartCSR: true, title: 'Claw Dashboard' });
    this.grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });
    this.data = { cpu: [], memory: {}, openclaw: null, gpu: null, sessions: [], agents: [], version: null, latest: null, tps: null };
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
    // Row 0: Header
    this.w = {};
    this.w.header = this.grid.set(0, 0, 1, 12, blessed.box, {
      content: '◉ CLAW DASHBOARD ◉',
      align: 'center', valign: 'middle',
      style: { fg: C.cyan, bold: true }
    });

    // Row 1-3: Stats boxes
    this.w.cpuBox = this.grid.set(1, 0, 3, 3, blessed.box, { label: 'CPU', border: { type: 'line' } });
    this.w.cpuVal = blessed.text({ parent: this.w.cpuBox, top: 1, align: 'center', content: '0%', style: { fg: C.green, bold: true } });
    this.w.cpuBar = blessed.text({ parent: this.w.cpuBox, bottom: 1, align: 'center', content: gauge(0), style: { fg: C.green } });

    this.w.memBox = this.grid.set(1, 3, 3, 3, blessed.box, { label: 'MEMORY', border: { type: 'line' } });
    this.w.memVal = blessed.text({ parent: this.w.memBox, top: 1, align: 'center', content: '0GB', style: { fg: C.magenta, bold: true } });
    this.w.memBar = blessed.text({ parent: this.w.memBox, bottom: 1, align: 'center', content: gauge(0), style: { fg: C.magenta } });

    this.w.gpuBox = this.grid.set(1, 6, 3, 3, blessed.box, { label: 'GPU', border: { type: 'line' } });
    this.w.gpuVal = blessed.text({ parent: this.w.gpuBox, top: 1, align: 'center', content: '...', style: { fg: C.cyan } });

    this.w.clawBox = this.grid.set(1, 9, 3, 3, blessed.box, { label: 'OPENCLAW', border: { type: 'line' } });
    this.w.clawVal = blessed.text({ parent: this.w.clawBox, top: 1, align: 'center', content: 'Loading...', style: { fg: C.cyan } });

    // Row 4-7: Sessions and Agents
    this.w.sessBox = this.grid.set(4, 0, 4, 8, blessed.box, { label: 'SESSIONS', border: { type: 'line' } });
    this.w.sessTable = contrib.table({
      parent: this.w.sessBox, interactive: false,
      columnWidth: [14, 12, 6, 6], columnSpacing: 1,
      top: 1, left: 1, height: '80%', width: '95%'
    });

    this.w.agBox = this.grid.set(4, 8, 4, 4, blessed.box, { label: 'AGENTS', border: { type: 'line' } });
    this.w.agVal = blessed.text({ parent: this.w.agBox, top: 1, left: 1, content: '...' });

    // Row 8-9: System and Version
    this.w.sysBox = this.grid.set(8, 0, 2, 6, blessed.box, { label: 'SYSTEM', border: { type: 'line' } });
    this.w.sysVal = blessed.text({ parent: this.w.sysBox, top: 'center', left: 1, content: '' });

    this.w.verBox = this.grid.set(8, 6, 2, 6, blessed.box, { label: 'VERSION', border: { type: 'line' } });
    this.w.verVal = blessed.text({ parent: this.w.verBox, top: 'center', align: 'center', content: '...', style: { fg: C.cyan } });

    // Row 10-11: Footer
    this.w.footer = this.grid.set(10, 0, 2, 12, blessed.box, {
      content: 'Press q to quit | r to refresh | Updates every 2s',
      align: 'center', valign: 'middle',
      style: { fg: C.gray }
    });
  }

  setupKeys() {
    this.screen.key(['q', 'C-c'], () => { clearInterval(this.timer); this.screen.destroy(); process.exit(0); });
    this.screen.key('r', () => this.refresh());
  }

  start() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), REFRESH_INTERVAL);
  }

  async refresh() {
    const now = Date.now();
    const elapsed = now - this.lastTime;
    
    try {
      // Fetch data
      const [cpu, mem] = await Promise.all([si.currentLoad(), si.mem()]);
      this.data.cpu = cpu.cpus.map(c => c.load);
      this.data.cpuAvg = cpu.currentLoad;
      this.data.memory = {
        usedGB: (mem.used / 1024**3).toFixed(1),
        percent: Math.round((mem.used / mem.total) * 100)
      };
      
      const os = await si.osInfo();
      const ver = await si.versions();
      this.data.system = `${os.distro || 'macOS'} ${os.release} (${os.arch}) Node v${ver.node}`;
      
      this.data.gpu = await getMacGPU();
      
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
      console.error('Error:', e.message);
    }
  }

  render() {
    // CPU
    const cpu = Math.round(this.data.cpuAvg || 0);
    this.w.cpuVal.setContent(`${cpu}%`);
    this.w.cpuVal.style.fg = cpu > 80 ? C.red : cpu > 50 ? C.yellow : C.green;
    this.w.cpuBar.setContent(gauge(cpu));
    this.w.cpuBar.style.fg = this.w.cpuVal.style.fg;

    // Memory
    const mem = this.data.memory.percent || 0;
    this.w.memVal.setContent(`${this.data.memory.usedGB}GB`);
    this.w.memBar.setContent(gauge(mem));

    // GPU
    if (this.data.gpu) {
      let gpuContent = `${this.data.gpu.short}`;
      if (this.data.gpu.utilization != null) {
        gpuContent += `\n${Math.round(this.data.gpu.utilization)}% util`;
      }
      if (this.data.gpu.temp) {
        gpuContent += `\n${this.data.gpu.temp} MHz`;
      }
      this.w.gpuVal.setContent(gpuContent);
    } else {
      this.w.gpuVal.setContent('Not detected');
    }

    // OpenClaw
    if (this.data.openclaw) {
      const ok = this.data.openclaw.gateway?.reachable;
      this.w.clawVal.setContent(`${ok ? '● Online' : '● Offline'}\n${this.data.openclaw.agents?.totalSessions || 0} sessions\n${this.data.agents.length} agents`);
      this.w.clawVal.style.fg = ok ? C.green : C.red;
    } else {
      this.w.clawVal.setContent('Not Available');
      this.w.clawVal.style.fg = C.red;
    }

    // Sessions with TPS
    if (this.data.sessions.length) {
      this.w.sessTable.setData({
        headers: ['ID', 'Model', 'TPS', '%'],
        data: this.data.sessions.map(s => {
          const tps = this.data.sessionTPS?.[s.key];
          return [
            s.key.split(':').pop().substring(0, 12),
            s.model?.split('/').pop()?.substring(0, 10) || '?',
            tps ? `${tps}` : '--',
            `${s.percentUsed || 0}%`
          ];
        })
      });
    } else {
      this.w.sessTable.setData({ headers: ['ID', 'Model', 'TPS', '%'], data: [['No sessions', '', '', '']] });
    }

    // Agents
    if (this.data.agents.length) {
      this.w.agVal.setContent(this.data.agents.map(a => 
        `${a.id.substring(0, 10)} ${a.bootstrapPending ? '⏳' : '●'} ${a.sessionsCount}s`
      ).join('\n'));
    } else {
      this.w.agVal.setContent('No agents');
    }

    // System
    this.w.sysVal.setContent(this.data.system || '...');

    // Version - strip brew suffix for comparison
    let v = this.data.version || 'unknown';
    const cleanVersion = v.replace(/-\d+$/, ''); // Remove -1, -2, etc suffix
    const isLatest = this.data.latest && cleanVersion === this.data.latest;
    const hasUpdate = this.data.latest && cleanVersion !== this.data.latest && v !== 'unknown';
    
    if (v.length > 20) v = v.substring(0, 20);
    if (hasUpdate) {
      v += `\nUpdate: ${this.data.latest}`;
      this.w.verVal.style.fg = C.yellow;
    } else if (isLatest || !this.data.latest) {
      v += `\n✓ Latest`;
      this.w.verVal.style.fg = C.green;
    } else {
      this.w.verVal.style.fg = C.cyan;
    }
    this.w.verVal.setContent(v);

    this.screen.render();
  }
}

new Dashboard();
