# AgroChain Setup Guide

## Step-by-Step Installation

### 1. Prerequisites Check

Make sure you have Node.js installed:
```bash
node --version  # Should be v16 or higher
npm --version
```

### 2. Clone or Download the Project

If you have the project folder, navigate to it:
```bash
cd /Users/mohtashimnawaz/Desktop/agrochain
```

### 3. Install Dependencies

Install all project dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

This will install:
- Express, MQTT, Solana Web3.js (backend)
- React, Axios, Recharts (frontend)
- IoT simulation tools

### 4. Set Up Environment

Create your environment file:
```bash
cp .env.example .env
```

You can use the default settings. The application will auto-generate a Solana wallet on first run.

### 5. First Run

Start all services:
```bash
npm run dev
```

This command starts:
- Backend API (http://localhost:3001)
- IoT Simulator (5 sensors)
- React Dashboard (http://localhost:3000)

### 6. Access the Dashboard

Open your web browser:
```
http://localhost:3000
```

You should see the AgroChain dashboard with:
- Status indicators (green = running)
- Real-time sensor data (updates every 10s)
- Blockchain connection info

### 7. Get Test SOL

1. Click on the "⛓️ Blockchain" tab
2. Note your wallet address
3. Click "Request Airdrop (2 SOL)"
4. Wait ~10 seconds for confirmation

Now you have SOL to pay for blockchain transactions!

### 8. Test the System

**IoT Sensors Tab:**
- Watch sensor data update in real-time
- See temperature, humidity, soil moisture, pH, and light levels
- Monitor battery levels

**Blockchain Tab:**
- View your wallet balance
- See transaction history
- Each transaction links to Solana Explorer

**Supply Chain Tab:**
- Create a test batch (e.g., "BATCH-2024-001")
- Add harvest event
- Add transport event
- View timeline with blockchain verification

## Understanding the Output

### Backend Console

When you start the backend, you'll see:
```
✅ MQTT Broker running on port 1883
✅ Solana service initialized
Wallet Address: ABC123...XYZ789
Wallet Balance: 2.0000 SOL
🚀 AgroChain Server running on port 3001
```

### IoT Simulator Console

The simulator shows:
```
📱 Simulating 5 IoT devices
📤 SENSOR_001 (Field_A_North): Temp=23.4°C, Humidity=65.2%, Soil=54.7%
📤 SENSOR_002 (Field_A_South): Temp=24.1°C, Humidity=63.8%, Soil=52.3%
...
```

### Frontend

The dashboard displays:
- 🟢 Green indicators = Services running
- 🔴 Red indicators = Services down
- Real-time metrics update every 5 seconds

## Common Operations

### Start Individual Services

If you prefer to run services separately:

**Backend only:**
```bash
npm run backend
```

**IoT Simulator only:**
```bash
npm run iot-simulator
```

**Frontend only:**
```bash
cd frontend
npm start
```

### Stop Services

Press `Ctrl+C` in the terminal to stop any service.

### View Logs

All services log to their respective terminals:
- Backend: API requests, blockchain transactions
- Simulator: Sensor data being published
- Frontend: Build and runtime info

### Reset Wallet

To start with a new wallet:
1. Stop all services
2. Delete the `WALLET_PRIVATE_KEY` line from `.env`
3. Restart the backend
4. New wallet will be auto-generated

## Verification Steps

### 1. Check Backend Health

Open in browser or use curl:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "services": {
    "mqtt": "running",
    "solana": "connected"
  }
}
```

### 2. Check Sensor Data

```bash
curl http://localhost:3001/api/sensors
```

Should return array of sensor data.

### 3. Check Blockchain Connection

```bash
curl http://localhost:3001/api/wallet
```

Should return wallet address and balance.

## Next Steps

1. **Explore the Dashboard**: Click through all tabs
2. **Monitor Sensors**: Watch real-time data updates
3. **Create Supply Chain Events**: Test the batch tracking
4. **View on Blockchain**: Click explorer links to see transactions
5. **Experiment**: Try different sensor configurations

## Tips

- **Sensor updates**: Data refreshes every 10 seconds
- **Blockchain recording**: Automatic every 10 readings (saves costs)
- **Airdrop limit**: Can request ~once per day per wallet
- **Explorer links**: All blockchain data is publicly verifiable

## Need Help?

Check the main README.md for:
- Troubleshooting guide
- API documentation
- Architecture details
- Development tips

Enjoy exploring AgroChain! 🌾
