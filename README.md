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
- **⚡ Lightweight**: Built with Node.js and blessed for minimal resource usage

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- OpenClaw installed and configured
- macOS (Apple Silicon optimized)

### Installation

```bash
# Install globally (recommended)
npm install -g claw-dashboard

# Or run without installing
npx claw-dashboard
```

### Usage

```bash
# Run the dashboard
clawdash

# Or with npm start (if installed locally)
npm start
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `q` or `Q` | Quit the dashboard |
| `r` or `R` | Force refresh data |
| `p` | Toggle performance metrics overlay |
| `P` or `Space` | Pause/resume auto-refresh |
| `o` | Cycle session sort (time/tokens/idle/name) |
| `?` or `h` | Toggle help panel |
| `s` or `S` | Open/close settings panel |
| `Esc` | Close settings panel (when open) |
| `Ctrl+C` | Quit gracefully |
| `1-9` | Toggle widgets (1:CPU, 2:MEM, 3:GPU, 4:NET, 5:DISK, 6:SYS, 7:UP, 8:HLTH, 9:GATEWAY) |
| `0` | Cycle log level filter |
| `e` | Export dashboard data |
| `E` | Cycle export format (JSON/CSV) |
| `t` | Cycle theme |
| `v` | Show version info |
| `G` | Retry gateway connection |
| `f` | Toggle favorite on current session |
| `F` | Show favorites only (filter) |
| `Tab` | Focus next widget |
| `Shift+Tab` | Focus previous widget |

### Session Sorting

Press `o` to cycle through different ways to sort the sessions list:
- **time** (default): Most recently updated sessions first
- **tokens**: Sessions with highest token usage first
- **idle**: Sessions with longest idle time first
- **name**: Alphabetical order by agent name

## ⚙️ Settings

Press `s` to open the settings panel where you can customize:

- **Refresh Interval**: Toggle between 1s, 2s, 5s, or 10s
- **Show Network**: Enable/disable network monitoring widget
- **Show GPU**: Enable/disable GPU monitoring widget  
- **Show Disk**: Enable/disable disk usage widget
- **Show Processes**: Enable/disable top processes widget

Settings are automatically saved to `~/.openclaw/dashboard-settings.json` and persist across sessions.

Disabled widgets show `[Disabled]` and skip data fetching, reducing CPU usage.

## 📦 Running Persistently

### Option 1: Using `screen`

```bash
# Install screen
brew install screen

# Create a detached screen session
screen -dmS claw-dashboard bash -c 'clawdash'

# To reattach
screen -r claw-dashboard

# To detach: press Ctrl+A, then D
```

### Option 2: Using `tmux` (Recommended)

```bash
# Install tmux
brew install tmux

# Create a new tmux session
tmux new-session -d -s claw-dashboard 'clawdash'

# To attach
tmux attach -t claw-dashboard

# To detach: press Ctrl+B, then D
```

### Option 3: LaunchAgent (Auto-start on Boot)

```bash
# Copy the plist (included in package)
cp ~/node_modules/claw-dashboard/ai.openclaw.dashboard.plist ~/Library/LaunchAgents/

# Edit paths in the plist
nano ~/Library/LaunchAgents/ai.openclaw.dashboard.plist
# Change /Users/kdsmith/... to your home directory

# Load the service
launchctl load ~/Library/LaunchAgents/ai.openclaw.dashboard.plist

# Check status
launchctl list | grep openclaw.dashboard
```

### Option 4: Using `pm2`

```bash
# Install pm2
npm install -g pm2

# Start with pm2
pm2 start claw-dashboard --name claw-dashboard

# Save config
pm2 save

# Auto-start on boot
pm2 startup
```

## 🔧 Troubleshooting

### "command not found" after global install

```bash
# Ensure npm global bin is in your PATH
export PATH="$(npm root -g)/../bin:$PATH"

# Add to your shell profile for persistence
echo 'export PATH="$(npm root -g)/../bin:$PATH"' >> ~/.zshrc
```

### Dashboard shows "Not Available" for OpenClaw

```bash
# Check if OpenClaw is running
openclaw gateway status

# Start if needed
openclaw gateway start
```

### Display Issues

For best results, use a terminal that supports:
- 256 colors
- Unicode box-drawing characters
- TrueColor (optional)

Recommended: **iTerm2**, **Kitty**, **Alacritty**

## 📝 Dependencies

- `blessed` - Terminal UI framework
- `blessed-contrib` - Widgets (charts, tables, gauges)
- `systeminformation` - System stats
- `chalk` - Terminal colors

## 📚 Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[docs/API.md](docs/API.md)** - Internal API documentation for modules
- **[TODO.md](TODO.md)** - Planned features and development roadmap

## 🤝 Contributing

Issues and PRs welcome at [github.com/openclaw/claw-dashboard](https://github.com/openclaw/claw-dashboard)

## 📜 License

MIT
