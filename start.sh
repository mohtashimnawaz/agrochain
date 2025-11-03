#!/bin/bash

# AgroChain Quick Start Script
# This script sets up and runs the entire AgroChain application

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌾 AgroChain - Smart Farming with IoT and Blockchain"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}💡 A temporary wallet will be generated on first run.${NC}"
    echo -e "${YELLOW}   Save the private key from console to .env if you want to reuse it.${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm run install-all
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Ask user what to run
echo -e "${BLUE}What would you like to do?${NC}"
echo "1) Run full application (backend + simulator + frontend)"
echo "2) Run with demo mode (includes simulated issues)"
echo "3) Run backend only"
echo "4) Run IoT simulator only"
echo "5) Run tests to verify setup"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Starting AgroChain (normal mode)...${NC}"
        echo ""
        echo -e "${BLUE}Services:${NC}"
        echo "  • Backend API: http://localhost:3001"
        echo "  • MQTT Broker: mqtt://localhost:1883"
        echo "  • Frontend: http://localhost:3000"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
        echo ""
        npm run dev
        ;;
    2)
        echo -e "${GREEN}🎭 Starting AgroChain (demo mode)...${NC}"
        echo ""
        echo -e "${YELLOW}Demo mode features:${NC}"
        echo "  • Battery drain simulation"
        echo "  • Intermittent connectivity issues"
        echo "  • Random extreme reading alerts"
        echo "  • Low battery warnings"
        echo ""
        echo -e "${BLUE}Services:${NC}"
        echo "  • Backend API: http://localhost:3001"
        echo "  • MQTT Broker: mqtt://localhost:1883"
        echo "  • Frontend: http://localhost:3000"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
        echo ""
        npm run dev-demo
        ;;
    3)
        echo -e "${GREEN}🔧 Starting backend only...${NC}"
        echo ""
        npm run backend
        ;;
    4)
        echo -e "${GREEN}📡 Starting IoT simulator only...${NC}"
        echo ""
        echo "Options:"
        echo "  --interval <seconds>  Update interval (default: 10)"
        echo "  --demo               Enable demo mode"
        echo "  --sensors <number>   Number of sensors (default: 5)"
        echo ""
        npm run iot-simulator
        ;;
    5)
        echo -e "${GREEN}🧪 Running verification tests...${NC}"
        echo ""
        echo -e "${YELLOW}Make sure backend and simulator are running first!${NC}"
        echo -e "${YELLOW}Start them in separate terminals with:${NC}"
        echo "  Terminal 1: npm run backend"
        echo "  Terminal 2: npm run iot-simulator"
        echo ""
        read -p "Press Enter to continue with tests or Ctrl+C to cancel..."
        npm run test
        ;;
    6)
        echo -e "${BLUE}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac
