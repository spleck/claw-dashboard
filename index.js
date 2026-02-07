#!/usr/bin/env node

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

const REFRESH_INTERVAL = 2000;
const HISTORY_LENGTH = 60;

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
    this.screen = blessed.screen({ smartCSR: true, title: 'Claw Dashboard' });
    this.history = { cpu: new Array(HISTORY_LENGTH).fill(0), memory: new Array(HISTORY_LENGTH).fill(0) };
    this.data = { cpu: [], memory: {}, openclaw: null, gpu: null, sessions: [], agents: [], version: null, latest: null, sessionTPS: {} };
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
    
    this.w.headerBox = blessed.box({ parent: this.screen, top: 0, left: 0, width: '100%', height: 3, style: { bg: C.black } });
    
    this.w.logo = blessed.text({ parent: this.w.headerBox, top: 0, left: 1, width: 40, content: ASCII_LOGO.join('\n'), style: { fg: C.brightCyan, bold: true } });
    this.w.title = blessed.text({ parent: this.w.headerBox, top: 1, left: 42, content: 'Dashboard', style: { fg: C.brightWhite, bold: true } });
    this.w.subtitle = blessed.text({ parent: this.w.headerBox, top: 1, left: 52, content: 'v1.0', style: { fg: C.gray } });

    this.w.cpuBox = blessed.box({ parent: this.screen, top: 3, left: 0, width: '25%', height: 4, border: { type: 'line' }, label: ' CPU ', style: { border: { fg: C.cyan } } });
    this.w.cpuValue = blessed.text({ parent: this.w.cpuBox, top: 1, left: 'center', content: '0%', style: { fg: C.brightGreen, bold: true } });
    this.w.cpuBar = blessed.text({ parent: this.w.cpuBox, top: 2, left: 'center', content: gauge(0), style: { fg: C.green } });
    this.w.cpuSpark = blessed.text({ parent: this.w.cpuBox, bottom: 0, left: 'center', content: sparkline(this.history.cpu), style: { fg: C.cyan } });

    this.w.memBox = blessed.box({ parent: this.screen, top: 3, left: '25%', width: '25%', height: 4, border: { type: 'line' }, label: ' MEMORY ', style: { border: { fg: C.magenta } } });
    this.w.memValue = blessed.text({ parent: this.w.memBox, top: 1, left: 'center', content: '0GB', style: { fg: C.brightMagenta, bold: true } });
    this.w.memBar = blessed.text({ parent: this.w.memBox, top: 2, left: 'center', content: gauge(0), style: { fg: C.magenta } });
    this.w.memSpark = blessed.text({ parent: this.w.memBox, bottom: 0, left: 'center', content: sparkline(this.history.memory), style: { fg: C.magenta } });

    this.w.gpuBox = blessed.box({ parent: this.screen, top: 3, left: '50%', width: '25%', height: 4, border: { type: 'line' }, label: ' GPU ', style: { border: { fg: C.yellow } } });
    this.w.gpuValue = blessed.text({ parent: this.w.gpuBox, top: 1, left: 'center', content: 'Detecting...', style: { fg: C.brightYellow, bold: true } });
    this.w.gpuDetail = blessed.text({ parent: this.w.gpuBox, top: 2, left: 'center', content: '', style: { fg: C.gray } });

    this.w.clawBox = blessed.box({ parent: this.screen, top: 3, left: '75%', width: '25%', height: 4, border: { type: 'line' }, label: ' OPENCLAW ', style: { border: { fg: C.green } } });
    this.w.clawStatus = blessed.text({ parent: this.w.clawBox, top: 1, left: 'center', content: 'Loading...', style: { fg: C.cyan, bold: true } });
    this.w.clawStats = blessed.text({ parent: this.w.clawBox, top: 2, left: 'center', content: '', style: { fg: C.white } });

    this.w.sessBox = blessed.box({ parent: this.screen, top: 7, left: 0, width: '75%', height: 5, border: { type: 'line' }, label: ' SESSIONS ', style: { border: { fg: C.blue } } });
    this.w.sessHeader = blessed.text({ parent: this.w.sessBox, top: 0, left: 1, content: 'Session ID     Model        Tokens TPS  Usage Agent', style: { fg: C.brightWhite, bold: true } });
    this.w.sessList = blessed.text({ parent: this.w.sessBox, top: 1, left: 1, width: '95%', height: '80%', content: '', style: { fg: C.white } });

    this.w.agBox = blessed.box({ parent: this.screen, top: 7, left: '75%', width: '25%', height: 5, border: { type: 'line' }, label: ' AGENTS ', style: { border: { fg: C.yellow } } });
    this.w.agList = blessed.text({ parent: this.w.agBox, top: 1, left: 1, content: 'No agents', style: { fg: C.white } });

    this.w.sysBox = blessed.box({ parent: this.screen, top: 12, left: 0, width: '50%', height: 3, border: { type: 'line' }, label: ' SYSTEM ', style: { border: { fg: C.gray } } });
    this.w.sysInfo = blessed.text({ parent: this.w.sysBox, top: 'center', left: 'center', content: '...', style: { fg: C.gray } });

    this.w.verBox = blessed.box({ parent: this.screen, top: 12, left: '50%', width: '50%', height: 3, border: { type: 'line' }, label: ' VERSION ', style: { border: { fg: C.gray } } });
    this.w.verInfo = blessed.text({ parent: this.w.verBox, top: 'center', left: 'center', content: '...', style: { fg: C.white } });

    this.w.footer = blessed.box({ parent: this.screen, bottom: 0, left: 0, width: '100%', height: 1, style: { bg: C.black, fg: C.gray } });
    this.w.footerText = blessed.text({ parent: this.w.footer, top: 0, left: 'center', content: 'q quit  r refresh  •  2s refresh', style: { fg: C.gray } });
  }

  setupKeys() {
    this.screen.key(['q', 'C-c'], () => { clearInterval(this.timer); this.screen.destroy(); process.exit(0); });
    this.screen.key('r', () => this.refresh());
  }

  start() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), REFRESH_INTERVAL);
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
      this.data.memory = { usedGB: (mem.used / 1024**3).toFixed(1), totalGB: (mem.total / 1024**3).toFixed(1), percent: Math.round((mem.used / mem.total) * 100) };
      
      this.updateHistory(this.data.cpuAvg, this.data.memory.percent);
      
      const os = await si.osInfo();
      const ver = await si.versions();
      this.data.system = `${os.distro || 'macOS'} ${os.release} (${os.arch})  Node v${ver.node}`;
      
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
      
      this.data.sessionTPS = {};
      if (this.data.openclaw?.sessions?.recent && this.prev?.openclaw?.sessions?.recent) {
        for (const session of this.data.openclaw.sessions.recent) {
          const prevSession = this.prev.openclaw.sessions.recent.find(s => s.key === session.key);
          if (prevSession) this.data.sessionTPS[session.key] = calcTPS(session, prevSession, elapsed);
        }
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
    this.w.cpuBar.setContent(gauge(cpuPercent));
    this.w.cpuBar.style.fg = getColor(cpuPercent);
    this.w.cpuSpark.setContent(sparkline(this.history.cpu));
    this.w.cpuSpark.style.fg = cpuPercent > 60 ? C.yellow : C.cyan;

    const memPercent = this.data.memory.percent || 0;
    this.w.memValue.setContent(`${this.data.memory.usedGB}GB / ${this.data.memory.totalGB}GB`);
    this.w.memValue.style.fg = getColor(memPercent);
    this.w.memBar.setContent(gauge(memPercent));
    this.w.memBar.style.fg = getColor(memPercent);
    this.w.memSpark.setContent(sparkline(this.history.memory));
    this.w.memSpark.style.fg = memPercent > 60 ? C.yellow : C.magenta;

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

    if (this.data.openclaw) {
      const ok = this.data.openclaw.gateway?.reachable;
      this.w.clawStatus.setContent(ok ? '● Online' : '● Offline');
      this.w.clawStatus.style.fg = ok ? C.green : C.red;
      this.w.clawStats.setContent(`${this.data.openclaw.agents?.totalSessions || 0} sessions  ${this.data.agents.length} agents`);
    } else {
      this.w.clawStatus.setContent('● Not Available');
      this.w.clawStatus.style.fg = C.red;
      this.w.clawStats.setContent('');
    }

    if (this.data.sessions.length) {
      const lines = this.data.sessions.map(s => {
        const tps = this.data.sessionTPS?.[s.key];
        const id = s.key.split(':').pop().substring(0, 14).padEnd(14);
        const model = (s.model?.split('/').pop()?.substring(0, 12) || '?').padEnd(12);
        const tokens = ((s.totalTokens || 0).toString()).padStart(6);
        const tpsStr = (tps ? tps.toString() : '--').padStart(4);
        const usage = (`${s.percentUsed || 0}%`).padStart(5);
        const agent = (s.agentId?.substring(0, 6) || 'main').padStart(6);
        return `${id} ${model} ${tokens} ${tpsStr} ${usage} ${agent}`;
      });
      this.w.sessList.setContent(lines.join('\n'));
    } else {
      this.w.sessList.setContent('No active sessions');
    }

    if (this.data.agents.length) {
      this.w.agList.setContent(this.data.agents.map(a => `${a.bootstrapPending ? '⏳' : '●'} ${a.id.substring(0, 8)} ${a.sessionsCount}s`).join('\n'));
      this.w.agList.style.fg = C.white;
    } else {
      this.w.agList.setContent('No agents');
      this.w.agList.style.fg = C.gray;
    }

    this.w.sysInfo.setContent(this.data.system || 'Unknown System');

    let v = this.data.version || 'unknown';
    const cleanVersion = v.replace(/-\d+$/, '');
    const hasUpdate = this.data.latest && cleanVersion !== this.data.latest && v !== 'unknown';
    const isLatest = this.data.latest && cleanVersion === this.data.latest;
    
    if (v.length > 20) v = v.substring(0, 20);
    let verContent = v;
    if (hasUpdate) {
      verContent += `  ↑ ${this.data.latest}`;
      this.w.verInfo.style.fg = C.yellow;
    } else if (isLatest || !this.data.latest) {
      verContent += '  ✓ latest';
      this.w.verInfo.style.fg = C.green;
    } else {
      this.w.verInfo.style.fg = C.cyan;
    }
    this.w.verInfo.setContent(verContent);

    this.screen.render();
  }
}

new Dashboard();
