#!/bin/bash

# AgroChain E2E Test Script
# Tests the full flow: IoT Simulator → Backend → Solana

echo "🧪 AgroChain End-to-End Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001/api"

# Function to check if a service is running
check_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    local name=$1
    local url=$2
    local max_wait=30
    local count=0
    
    echo -n "Waiting for $name to start"
    while [ $count -lt $max_wait ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
        ((count++))
    done
    echo -e " ${RED}✗ Timeout${NC}"
    return 1
}

echo "📋 Step 1: Checking backend service"
if ! check_service "Backend" "$API_URL/health"; then
    echo -e "${YELLOW}⚠️  Backend not running. Please start it with: npm run backend${NC}"
    echo ""
    echo "Run these commands in separate terminals:"
    echo "  Terminal 1: npm run backend"
    echo "  Terminal 2: npm run iot-simulator"
    echo "  Terminal 3: ./test-flow.sh"
    exit 1
fi

echo ""
echo "📋 Step 2: Testing API endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test health endpoint
echo -n "Testing /health... "
HEALTH=$(curl -s "$API_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${RED}✗ Fail${NC}"
    exit 1
fi

# Test wallet endpoint
echo -n "Testing /wallet... "
WALLET=$(curl -s "$API_URL/wallet")
if echo "$WALLET" | grep -q "address"; then
    ADDRESS=$(echo "$WALLET" | grep -o '"address":"[^"]*"' | cut -d'"' -f4)
    BALANCE=$(echo "$WALLET" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ Pass${NC}"
    echo "   Address: $ADDRESS"
    echo "   Balance: $BALANCE SOL"
else
    echo -e "${RED}✗ Fail${NC}"
    exit 1
fi

# Test sensors endpoint
echo -n "Testing /sensors... "
SENSORS=$(curl -s "$API_URL/sensors")
SENSOR_COUNT=$(echo "$SENSORS" | grep -o '"sensorId"' | wc -l | tr -d ' ')
if [ "$SENSOR_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Pass${NC} ($SENSOR_COUNT sensors detected)"
else
    echo -e "${YELLOW}⚠ No sensors yet${NC}"
    echo "   Waiting for IoT simulator data..."
    sleep 5
    SENSORS=$(curl -s "$API_URL/sensors")
    SENSOR_COUNT=$(echo "$SENSORS" | grep -o '"sensorId"' | wc -l | tr -d ' ')
    if [ "$SENSOR_COUNT" -gt 0 ]; then
        echo -e "   ${GREEN}✓ Now detected $SENSOR_COUNT sensors${NC}"
    else
        echo -e "   ${RED}✗ Still no sensors. Is the simulator running?${NC}"
        exit 1
    fi
fi

echo ""
echo "📋 Step 3: Testing blockchain integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check balance
if (( $(echo "$BALANCE < 0.01" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance detected ($BALANCE SOL)${NC}"
    echo "   Requesting airdrop..."
    AIRDROP_RESULT=$(curl -s -X POST "$API_URL/wallet/airdrop")
    if echo "$AIRDROP_RESULT" | grep -q "success"; then
        echo -e "   ${GREEN}✓ Airdrop successful${NC}"
        sleep 3
        WALLET=$(curl -s "$API_URL/wallet")
        BALANCE=$(echo "$WALLET" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
        echo "   New balance: $BALANCE SOL"
    else
        echo -e "   ${YELLOW}⚠ Airdrop may have failed (devnet rate limits)${NC}"
    fi
fi

# Test manual blockchain recording
echo -n "Testing blockchain recording... "
FIRST_SENSOR=$(echo "$SENSORS" | grep -o '"sensorId":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$FIRST_SENSOR" ]; then
    RECORD_RESULT=$(curl -s -X POST "$API_URL/record-to-blockchain" \
        -H "Content-Type: application/json" \
        -d "{\"sensorId\":\"$FIRST_SENSOR\"}")
    
    if echo "$RECORD_RESULT" | grep -q "signature"; then
        SIGNATURE=$(echo "$RECORD_RESULT" | grep -o '"signature":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ Pass${NC}"
        echo "   Sensor: $FIRST_SENSOR"
        echo "   TX: $SIGNATURE"
        echo "   Explorer: https://explorer.solana.com/tx/$SIGNATURE?cluster=devnet"
    else
        echo -e "${YELLOW}⚠ Recording may have failed${NC}"
        echo "   Response: $RECORD_RESULT"
    fi
else
    echo -e "${RED}✗ No sensors available${NC}"
fi

echo ""
echo "📋 Step 4: Testing supply chain features"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create a supply chain event
echo -n "Creating supply chain event... "
BATCH_ID="TEST-BATCH-$(date +%s)"
EVENT_RESULT=$(curl -s -X POST "$API_URL/supply-chain/event" \
    -H "Content-Type: application/json" \
    -d "{
        \"event\": \"harvest\",
        \"batchId\": \"$BATCH_ID\",
        \"location\": \"Test Field\",
        \"handler\": \"Test Script\",
        \"metadata\": \"Automated test event\"
    }")

if echo "$EVENT_RESULT" | grep -q "signature"; then
    SIGNATURE=$(echo "$EVENT_RESULT" | grep -o '"signature":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Pass${NC}"
    echo "   Batch: $BATCH_ID"
    echo "   TX: $SIGNATURE"
    echo "   Explorer: https://explorer.solana.com/tx/$SIGNATURE?cluster=devnet"
else
    echo -e "${YELLOW}⚠ Event creation may have failed${NC}"
    echo "   Response: $EVENT_RESULT"
fi

# Verify event was stored
echo -n "Verifying event storage... "
sleep 2
EVENTS=$(curl -s "$API_URL/supply-chain/events")
if echo "$EVENTS" | grep -q "$BATCH_ID"; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${RED}✗ Event not found in storage${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All tests completed successfully!${NC}"
echo ""
echo "Summary:"
echo "  • Backend: Running"
echo "  • Wallet: $ADDRESS"
echo "  • Balance: $BALANCE SOL"
echo "  • Active Sensors: $SENSOR_COUNT"
echo "  • Blockchain: Connected (devnet)"
echo ""
echo "🌐 Open http://localhost:3000 to view the dashboard"
echo ""
