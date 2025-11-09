#!/bin/bash

# AgroChain Quick Start Script
# This script starts the backend, IoT simulator, and frontend

echo "🌾 AgroChain - Starting All Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Running npm install...${NC}"
    npm install
fi

if [ ! -d frontend/node_modules ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed. Installing...${NC}"
    cd frontend && npm install && cd ..
fi

echo ""
echo -e "${BLUE}Starting services...${NC}"
echo ""

# Kill any existing processes on the ports
echo "Checking for existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:1883 | xargs kill -9 2>/dev/null || true

sleep 2

echo ""
echo -e "${GREEN}✓ Ports cleared${NC}"
echo ""

# Start backend in background
echo -e "${BLUE}🚀 Starting backend server...${NC}"
node backend/server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Start IoT simulator in background
echo -e "${BLUE}📡 Starting IoT device simulator...${NC}"
node iot-simulator/device-simulator.js > logs/simulator.log 2>&1 &
SIMULATOR_PID=$!
echo "   Simulator PID: $SIMULATOR_PID"

# Wait for simulator to connect
sleep 3

# Start frontend in background
echo -e "${BLUE}🌐 Starting frontend...${NC}"
cd frontend && PORT=3000 npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Service Status:"
echo "   • Backend API:        http://localhost:3001"
echo "   • Frontend Dashboard: http://localhost:3000"
echo "   • MQTT Broker:        mqtt://localhost:1883"
echo ""
echo "📝 Process IDs:"
echo "   • Backend:    $BACKEND_PID"
echo "   • Simulator:  $SIMULATOR_PID"
echo "   • Frontend:   $FRONTEND_PID"
echo ""
echo "📋 Logs:"
echo "   • Backend:    tail -f logs/backend.log"
echo "   • Simulator:  tail -f logs/simulator.log"
echo "   • Frontend:   tail -f logs/frontend.log"
echo ""
echo "🔗 Quick Links:"
echo "   • Dashboard:     http://localhost:3000"
echo "   • API Health:    http://localhost:3001/api/health"
echo "   • API Sensors:   http://localhost:3001/api/sensors"
echo ""
echo "💡 Tips:"
echo "   • Wait ~20 seconds for frontend to compile"
echo "   • Check logs/backend.log for Solana wallet private key"
echo "   • Request airdrop from dashboard if needed"
echo ""
echo "⏹️  To stop all services:"
echo "   kill $BACKEND_PID $SIMULATOR_PID $FRONTEND_PID"
echo "   or press Ctrl+C"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping all services...'; kill $BACKEND_PID $SIMULATOR_PID $FRONTEND_PID 2>/dev/null; echo '✅ All services stopped'; exit 0" INT

# Keep script running
echo "Press Ctrl+C to stop all services..."
echo ""
wait
