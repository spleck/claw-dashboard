#!/bin/bash

# Claw Dashboard Launcher Script
# Usage: ./start.sh [options]

DASHBOARD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="/tmp/claw-dashboard.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo "Claw Dashboard - OpenClaw Monitoring Tool"
    echo ""
    echo "Usage: ./start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start the dashboard in foreground"
    echo "  daemon      Start the dashboard in background (detached)"
    echo "  stop        Stop the background dashboard"
    echo "  status      Check if dashboard is running"
    echo "  attach      Attach to running background dashboard"
    echo "  logs        Show dashboard logs"
    echo "  install     Install npm dependencies"
    echo "  help        Show this help message"
    echo ""
}

check_deps() {
    if [ ! -d "$DASHBOARD_DIR/node_modules" ]; then
        echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
        cd "$DASHBOARD_DIR" && npm install
    fi
}

cmd_start() {
    check_deps
    echo -e "${GREEN}Starting Claw Dashboard...${NC}"
    echo -e "${BLUE}Press 'q' to quit${NC}"
    cd "$DASHBOARD_DIR" && node index.js
}

cmd_daemon() {
    check_deps
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
        echo -e "${YELLOW}Dashboard is already running (PID: $(cat $PIDFILE))${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Starting Claw Dashboard in background...${NC}"
    nohup node "$DASHBOARD_DIR/index.js" > /tmp/claw-dashboard.log 2>&1 &
    echo $! > "$PIDFILE"
    echo -e "${GREEN}Dashboard started with PID: $!${NC}"
    echo -e "${BLUE}View logs: ./start.sh logs${NC}"
}

cmd_stop() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${YELLOW}Stopping dashboard (PID: $PID)...${NC}"
            kill "$PID"
            rm -f "$PIDFILE"
            echo -e "${GREEN}Dashboard stopped${NC}"
        else
            echo -e "${RED}Dashboard is not running${NC}"
            rm -f "$PIDFILE"
        fi
    else
        echo -e "${RED}No PID file found. Dashboard may not be running.${NC}"
    fi
}

cmd_status() {
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
        echo -e "${GREEN}Dashboard is running (PID: $(cat $PIDFILE))${NC}"
    else
        echo -e "${RED}Dashboard is not running${NC}"
        [ -f "$PIDFILE" ] && rm -f "$PIDFILE"
    fi
}

cmd_logs() {
    if [ -f "/tmp/claw-dashboard.log" ]; then
        tail -f "/tmp/claw-dashboard.log"
    else
        echo -e "${RED}No log file found${NC}"
    fi
}

cmd_install() {
    echo -e "${BLUE}Installing dependencies...${NC}"
    cd "$DASHBOARD_DIR" && npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Dependencies installed successfully!${NC}"
    else
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
}

# Main command handler
case "${1:-start}" in
    start)
        cmd_start
        ;;
    daemon)
        cmd_daemon
        ;;
    stop)
        cmd_stop
        ;;
    status)
        cmd_status
        ;;
    logs)
        cmd_logs
        ;;
    install)
        cmd_install
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
