#!/bin/bash

# Claw Dashboard Installation Script for Mac mini
# This script installs dependencies and sets up the dashboard

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

DASHBOARD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}          ${GREEN}Claw Dashboard Installer${NC}             ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠ Warning: This script is optimized for macOS${NC}"
fi

# Check Node.js
echo -e "${BLUE}📦 Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first:${NC}"
    echo "   brew install node"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node --version)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check OpenClaw
echo -e "${BLUE}🤖 Checking OpenClaw...${NC}"
if ! command -v openclaw &> /dev/null; then
    echo -e "${RED}❌ OpenClaw not found. Please install OpenClaw first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ OpenClaw found${NC}"

# Check if OpenClaw gateway is running
echo -e "${BLUE}🌐 Checking OpenClaw gateway...${NC}"
if ! openclaw gateway status &> /dev/null; then
    echo -e "${YELLOW}⚠ OpenClaw gateway not running. Starting it now...${NC}"
    openclaw gateway start
    sleep 2
fi
echo -e "${GREEN}✅ OpenClaw gateway running${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing npm dependencies...${NC}"
cd "$DASHBOARD_DIR"
npm install

# Make scripts executable
echo -e "${BLUE}🔧 Setting up scripts...${NC}"
chmod +x "$DASHBOARD_DIR/start.sh"
chmod +x "$DASHBOARD_DIR/index.js"

# Create log directory
echo -e "${BLUE}📁 Creating log directory...${NC}"
mkdir -p /tmp/openclaw

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Quick Start:${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}Start dashboard:${NC}"
echo -e "    cd ${DASHBOARD_DIR}"
echo -e "    npm start"
echo ""
echo -e "  ${YELLOW}Or use the helper script:${NC}"
echo -e "    ./start.sh"
echo ""
echo -e "  ${YELLOW}Run in background:${NC}"
echo -e "    ./start.sh daemon"
echo ""
echo -e "  ${YELLOW}View logs:${NC}"
echo -e "    ./start.sh logs"
echo ""
echo -e "  ${YELLOW}Setup auto-start on boot:${NC}"
echo -e "    cp ai.openclaw.dashboard.plist ~/Library/LaunchAgents/"
echo -e "    launchctl load ~/Library/LaunchAgents/ai.openclaw.dashboard.plist"
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
