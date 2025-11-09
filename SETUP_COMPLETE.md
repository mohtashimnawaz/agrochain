# 🌾 AgroChain - Setup Complete! ✅

## What You Have Now

A complete **Smart Farming application** with:
- ✅ IoT device simulator (5 virtual sensors)
- ✅ MQTT broker for real-time telemetry
- ✅ Express backend API
- ✅ Solana blockchain integration (devnet)
- ✅ React dashboard frontend
- ✅ Supply chain tracking
- ✅ Automated tests

## 🚀 Quick Start

### Option 1: Run Everything at Once (Recommended)

```bash
npm run dev
```

This starts:
- Backend API on port 3001
- IoT Simulator (5 sensors)
- Frontend on port 3000

### Option 2: Run Services Individually

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - IoT Simulator:**
```bash
npm run iot-simulator
```

Or with demo mode (battery drain, connection issues, alerts):
```bash
npm run iot-demo
```

**Terminal 3 - Frontend:**
```bash
npm run frontend
```

### Option 3: Custom IoT Simulator Options

```bash
# Simulate 10 sensors with 5 second updates
node iot-simulator/device-simulator.js --sensors 10 --interval 5

# Demo mode with alerts and issues
node iot-simulator/device-simulator.js --demo

# Connect to custom MQTT broker
node iot-simulator/device-simulator.js --broker mqtt://192.168.1.100:1883

# See all options
node iot-simulator/device-simulator.js --help
```

## 🌐 Access Points

Once running, open these URLs:

- **Dashboard:** http://localhost:3000
- **API Health:** http://localhost:3001/api/health
- **API Docs:** http://localhost:3001/api (see README for all endpoints)

## 💰 Solana Wallet

### Generated Wallet

On first run, the backend generates a new Solana wallet. **Important:**

1. The private key is printed in the console
2. Copy it to your `.env` file as `WALLET_PRIVATE_KEY`
3. This keeps the same wallet across restarts

Current wallet (from this session):
```
Address: 9xSSj5VoXQbzdybcbUhLueQk7GTHd2PRarLUHnRjcBaD
Private Key: mQsviX63qsbMDMTzo19f43LfSBpR4YhKNAMVck3Kg759oYC41n3CuUkW4knGk1X5eyn5W4otqJETcCmdBkmUuGy
```

### Get Test SOL

The wallet needs SOL to record blockchain transactions:

**Option 1: Via Dashboard**
1. Open http://localhost:3000
2. Go to "Blockchain" tab
3. Click "Request Airdrop (2 SOL)"

**Option 2: Via API**
```bash
curl -X POST http://localhost:3001/api/wallet/airdrop
```

**Option 3: Solana CLI**
```bash
solana airdrop 2 9xSSj5VoXQbzdybcbUhLueQk7GTHd2PRarLUHnRjcBaD --url devnet
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

Or use the shell script:
```bash
./test-flow.sh
```

### Quick API Tests

```bash
# Check health
curl http://localhost:3001/api/health

# Get sensor data
curl http://localhost:3001/api/sensors

# Get wallet info
curl http://localhost:3001/api/wallet

# Record sensor data to blockchain
curl -X POST http://localhost:3001/api/record-to-blockchain \
  -H "Content-Type: application/json" \
  -d '{"sensorId":"SENSOR_001"}'

# Create supply chain event
curl -X POST http://localhost:3001/api/supply-chain/event \
  -H "Content-Type: application/json" \
  -d '{
    "event": "harvest",
    "batchId": "BATCH-001",
    "location": "Field A",
    "handler": "John Doe",
    "metadata": "Quality Grade A"
  }'
```

## 📊 Verified Features

✅ All features have been tested and verified:

1. **Backend Services**
   - MQTT broker running on port 1883
   - Solana connection to devnet
   - REST API endpoints working

2. **IoT Simulator**
   - 5 sensors actively publishing data
   - Real-time telemetry (temp, humidity, soil, pH, light, battery)
   - Demo mode with intermittent issues and alerts

3. **Blockchain Integration**
   - Wallet created and funded with 2 SOL (devnet)
   - Crop data recorded to blockchain ✅
   - Supply chain events recorded ✅
   - Transaction signatures and explorer links working

4. **Data Flow Verified**
   - IoT Simulator → MQTT → Backend → Storage ✅
   - Backend → Solana blockchain ✅
   - Backend API → Frontend (via REST) ✅

## 🔗 Sample Blockchain Transactions

From this test session:

**Crop Data Transaction:**
- Signature: `iJNLayMuRWnbryjW2syHbwtisnjvYSKnJGdxpHcLC63NP4fi1XeCFPVGWjvbYaFGwWfxHxdsGmDoqpxnH16ShtT`
- Explorer: https://explorer.solana.com/tx/iJNLayMuRWnbryjW2syHbwtisnjvYSKnJGdxpHcLC63NP4fi1XeCFPVGWjvbYaFGwWfxHxdsGmDoqpxnH16ShtT?cluster=devnet

**Supply Chain Event:**
- Signature: `T9ueiwv9zxdY3xJnDBifbLAp3CNJ8s8EFpoUhSX5mgqmP3rhs4k8yEkwifAekFHSzd6DTS8ZPJw6eZhSYzu1wro`
- Explorer: https://explorer.solana.com/tx/T9ueiwv9zxdY3xJnDBifbLAp3CNJ8s8EFpoUhSX5mgqmP3rhs4k8yEkwifAekFHSzd6DTS8ZPJw6eZhSYzu1wro?cluster=devnet

## 📱 Simulated IoT Devices

5 sensors are currently configured:

1. **SENSOR_001** - Field A North (Wheat)
2. **SENSOR_002** - Field A South (Wheat)
3. **SENSOR_003** - Field B East (Corn)
4. **SENSOR_004** - Field B West (Corn)
5. **SENSOR_005** - Greenhouse 1 (Tomatoes)

Each sensor reports:
- 🌡️ Temperature (°C)
- 💧 Humidity (%)
- 🌱 Soil Moisture (%)
- ⚗️ Soil pH
- ☀️ Light Intensity (lux)
- 🔋 Battery Level (%)

## 🎯 Next Steps

### For Development

1. **Customize Sensors**: Edit `iot-simulator/device-simulator.js`
2. **Add API Endpoints**: Edit `backend/server.js`
3. **Update Frontend**: Edit files in `frontend/src/components/`
4. **Deploy to Production**: See README for deployment guide

### For Production Use

1. Use a production Solana RPC endpoint
2. Implement proper key management (AWS KMS, Azure Key Vault)
3. Add authentication and authorization
4. Set up monitoring and logging
5. Use SSL/TLS for all connections
6. Implement database persistence (PostgreSQL, MongoDB)

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### Frontend errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Blockchain transactions failing
- Ensure wallet has balance (request airdrop)
- Check Solana devnet status: https://status.solana.com
- Verify RPC endpoint is accessible

### No sensor data appearing
- Ensure IoT simulator is running
- Check MQTT broker is running (backend logs)
- Verify sensors are publishing (simulator logs)

## 📚 Documentation

- **Full README**: See `README.md` for detailed documentation
- **Setup Guide**: See `SETUP_GUIDE.md` for step-by-step instructions
- **API Reference**: Check backend logs for available endpoints

## 🎉 Success Criteria - All Met! ✅

- [x] Backend running with MQTT and Solana
- [x] IoT simulator publishing sensor data
- [x] Sensors visible in backend API
- [x] Wallet funded with devnet SOL
- [x] Blockchain transactions successful
- [x] Supply chain events working
- [x] Frontend compiled and ready
- [x] All test scripts passing

## 💡 Tips

- **Save your private key** in `.env` to keep the same wallet
- Use **demo mode** (`npm run iot-demo`) to see alerts and connection issues
- Check **Solana Explorer** links to verify on-chain data
- The backend **auto-records** crop data every 10 sensor readings
- **Battery levels** drain over time in demo mode

## 🌟 Features Demonstrated

✅ Real-time IoT data collection  
✅ MQTT pub/sub messaging  
✅ Blockchain immutability  
✅ Supply chain transparency  
✅ Automated testing  
✅ Demo mode simulation  
✅ REST API architecture  
✅ React dashboard  

---

**Built with ❤️ for sustainable agriculture and blockchain transparency**

Need help? Check the logs or run `npm test` to diagnose issues.
