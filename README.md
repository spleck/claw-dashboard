# 🖥️ Claw Dashboard

A beautiful, real-time terminal dashboard for monitoring OpenClaw instances — inspired by modern system monitors like **btop**, **htop**, and **mactop**.

![Dashboard Preview](https://img.shields.io/badge/OpenClaw-Dashboard-00d4aa?style=for-the-badge)

## ✨ Features

- **🎨 Stunning Visuals**: ASCII art logo, gradient colors, donut charts, and progress bars
- **📊 Real-time Monitoring**: Auto-refreshes every 2 seconds
- **🖥️ System Stats**: CPU usage (per-core + average), Memory usage with visual gauges
- **🎮 GPU Monitoring**: Apple Silicon GPU support (temperature, VRAM utilization)
- **📈 Top Processes**: Live view of top CPU and memory consuming processes
- **🤖 OpenClaw Integration**: Live session tracking, agent status, security audit
- **📱 Session Management**: View all active sessions with token usage
- **🔒 Security Dashboard**: Visual security audit status
- **⚡ Lightweight**: Built with Node.js and blessed for minimal resource usage

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ (tested on v25.5.0)
- OpenClaw installed and configured
- macOS (Apple Silicon optimized)

### Installation

1. **Navigate to the dashboard directory**:
   ```bash
   cd ~/.openclaw/workspace/claw-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the dashboard**:
   ```bash
   npm start
   # or
   node index.js
   ```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `q` or `Q` | Quit the dashboard |
| `r` or `R` | Force refresh data |
| `?` or `h` | Toggle help panel |
| `s` or `S` | Open/close settings panel |
| `Esc` | Close settings panel (when open) |
| `Ctrl+C` | Quit gracefully |

## ⚙️ Settings

Press `s` to open the settings panel where you can customize:

- **Refresh Interval**: Toggle between 1s, 2s, 5s, or 10s
- **Show Network**: Enable/disable network monitoring widget
- **Show GPU**: Enable/disable GPU monitoring widget  
- **Show Disk**: Enable/disable disk usage widget
- **Show Processes**: Enable/disable top processes widget

Settings are automatically saved to `~/.openclaw/dashboard-settings.json` and persist across sessions.

Disabled widgets show `[Disabled]` and skip data fetching, reducing CPU usage.

## 📦 Running Persistently on Mac mini

### Option 1: Using `screen` (Simple)

```bash
# Install screen if not present
brew install screen

# Create a new detached screen session
screen -dmS claw-dashboard bash -c 'cd ~/.openclaw/workspace/claw-dashboard && npm start'

# To reattach later
screen -r claw-dashboard

# To detach without killing (press Ctrl+A, then D)
```

### Option 2: Using `tmux` (Recommended)

```bash
# Install tmux
brew install tmux

# Create a new tmux session
tmux new-session -d -s claw-dashboard -c ~/.openclaw/workspace/claw-dashboard 'npm start'

# To attach to the session
tmux attach -t claw-dashboard

# To detach: press Ctrl+B, then D
```

### Option 3: LaunchAgent Service (Auto-start on Boot)

Create a LaunchAgent plist to run the dashboard at startup:

```bash
# Create the plist file
cat > ~/Library/LaunchAgents/ai.openclaw.dashboard.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>ai.openclaw.dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/Users/kdsmith/.openclaw/workspace/claw-dashboard/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/kdsmith/.openclaw/workspace/claw-dashboard</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/openclaw/dashboard.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/openclaw/dashboard.err</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
        <key>TERM</key>
        <string>xterm-256color</string>
    </dict>
</dict>
</plist>
EOF

# Load the service
launchctl load ~/Library/LaunchAgents/ai.openclaw.dashboard.plist

# Check status
launchctl list | grep ai.openclaw.dashboard

# View logs
tail -f /tmp/openclaw/dashboard.out
```

### Option 4: Using `pm2` (Process Manager)

```bash
# Install pm2 globally
npm install -g pm2

# Start the dashboard with pm2
pm2 start index.js --name claw-dashboard --cwd ~/.openclaw/workspace/claw-dashboard

# Save the pm2 config
pm2 save

# Setup pm2 to start on boot
pm2 startup

# View logs
pm2 logs claw-dashboard

# Monitor
pm2 monit
```

## 🎨 Customization

### Color Scheme

Edit the `COLORS` object in `index.js`:

```javascript
const COLORS = {
  bg: '#0c0c0c',      // Background
  fg: '#e0e0e0',      // Foreground text
  highlight: '#00d4aa', // Accent color
  warning: '#ff9f43',   // Warnings
  danger: '#ff6b6b',    // Errors/critical
  // ... more colors
};
```

### Refresh Interval

Change the update frequency (default: 2000ms):

```javascript
const REFRESH_INTERVAL = 2000; // milliseconds
```

## 📊 Data Sources

The dashboard aggregates data from:

1. **System Information** (`systeminformation` npm package)
   - CPU load, temperature, per-core stats
   - Memory usage (RAM, swap)
   - GPU stats (Apple Silicon compatible)
   - OS and Node.js version info

2. **OpenClaw Status** (`openclaw status --json`)
   - Gateway connectivity
   - Active sessions with token usage
   - Agent and sub-agent status
   - Security audit results
   - Heartbeat configuration

## 🔧 Troubleshooting

### Dashboard shows "Not Available" for OpenClaw

Ensure OpenClaw is running:
```bash
openclaw gateway status
```

If not running:
```bash
openclaw gateway start
```

### Permission Issues

If you see permission errors when running as a service:
```bash
chmod 700 ~/.openclaw
```

### Display Issues

For best results, use a terminal that supports:
- 256 colors
- Unicode box-drawing characters
- TrueColor (optional but recommended)

Recommended terminals:
- **iTerm2** (macOS)
- **Kitty**
- **Alacritty**
- **Terminal.app** (basic support)

### High CPU Usage

If the dashboard itself uses too much CPU:
1. Increase `REFRESH_INTERVAL` to 5000 (5 seconds)
2. Disable GPU monitoring (comment out `fetchGPUStats()` call)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Claw Dashboard                  │
├─────────────────────────────────────────────┤
│  Header (ASCII Logo)                        │
├──────────┬──────────┬──────────┬────────────┤
│   CPU    │  Memory  │   GPU    │  OpenClaw  │
│  Donut   │  Donut   │  Stats   │   Status   │
├─────────────────────┴───────────────────────┤
│  Active Sessions          │  Agents & Tasks │
│  (Table)                  │  (Text)         │
├───────────────────────────┴─────────────────┤
│  System Info              │  Security       │
├─────────────────────────────────────────────┤
│  Footer (Controls)                          │
└─────────────────────────────────────────────┘
```

## 📝 Dependencies

- `blessed` - Terminal UI framework
- `blessed-contrib` - Widgets (charts, tables, gauges)
- `systeminformation` - System stats (CPU, memory, GPU)
- `chalk` - Terminal colors (ESM compatible)

## 🤝 Contributing

This dashboard is part of the OpenClaw ecosystem. Feel free to:
- Submit issues for bugs or feature requests
- Customize colors and layout for your setup
- Add new data sources or visualizations

## 📜 License

MIT License - Part of OpenClaw

---

<p align="center">
  <b>Made with 💜 for the OpenClaw community</b><br>
  <sub>Terminal aesthetics inspired by btop, htop, and mactop</sub>
</p>
