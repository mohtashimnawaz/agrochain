# 🌾 AgroChain - Smart Farming with IoT and Blockchain

A comprehensive smart farming application that combines IoT sensor monitoring with Solana blockchain for transparent crop tracking and supply chain management.

## 🌟 Features

- **📊 Real-time IoT Monitoring**: Track temperature, humidity, soil moisture, pH levels, and light intensity
- **⛓️ Blockchain Integration**: Record crop data on Solana blockchain for transparency and immutability
- **🚚 Supply Chain Tracking**: Monitor crop journey from farm to consumer
- **🤖 IoT Device Simulator**: Demo sensors for testing without physical hardware
- **📈 Live Dashboard**: Beautiful React-based dashboard with real-time updates
- **💰 Solana Devnet**: Test environment with airdrop support

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│   Dashboard     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │ (Port 3001)
│   Backend       │
└────┬────────┬───┘
     │        │
     │        ▼
     │  ┌──────────────┐
     │  │ Solana Web3  │
     │  │   Devnet     │
     │  └──────────────┘
     │
     ▼
┌──────────────┐
│ MQTT Broker  │ (Port 1883)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ IoT Devices  │
│  Simulator   │
└──────────────┘
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Internet connection (for Solana Devnet)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

The default configuration will work out of the box. A Solana wallet will be auto-generated on first run.

### 3. Run the Application

**Option A: Run all services at once (Recommended)**

```bash
npm run dev
```

This will start:
- Backend API server (http://localhost:3001)
- IoT Device Simulator (5 virtual sensors)
- Frontend Dashboard (http://localhost:3000)

**Option B: Run services individually**

Terminal 1 - Backend:
```bash
npm run backend
```

Terminal 2 - IoT Simulator:
```bash
npm run iot-simulator
```

Terminal 3 - Frontend:
```bash
npm run frontend
```

### 4. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

## 📱 IoT Sensors

The simulator creates 5 virtual sensors:

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

## ⛓️ Blockchain Features

### Automated Recording
- Crop data is automatically recorded to Solana blockchain every 10 sensor readings
- Each transaction includes sensor ID, location, and all metrics

### Manual Recording
- Use the dashboard to manually record specific sensor data
- Useful for critical measurements or milestone events

### Supply Chain Events
Record supply chain events:
- 🌾 Harvest
- ⚙️ Processing
- 📦 Packaging
- 🏭 Storage
- 🚚 Transport
- 🏪 Retail
- 📬 Delivery

All events are immutably recorded on the Solana blockchain.

## 🔑 Wallet Management

### Auto-Generated Wallet
On first run, a new Solana wallet is automatically created. The private key will be displayed in the console.

**⚠️ IMPORTANT**: Save the private key shown in the console to your `.env` file:
```
WALLET_PRIVATE_KEY=your_base58_encoded_private_key_here
```

### Request Airdrop
Get free SOL for testing:
1. Navigate to the "Blockchain" tab
2. Click "Request Airdrop (2 SOL)"
3. Wait a few seconds for the transaction to confirm

## 🌐 API Endpoints

### Health & Status
- `GET /api/health` - Check service status

### Sensors
- `GET /api/sensors` - Get all sensor data
- `GET /api/sensors/:sensorId` - Get specific sensor data
- `GET /api/crop-history` - Get historical crop data

### Blockchain
- `GET /api/wallet` - Get wallet info
- `GET /api/transactions` - Get transaction history
- `POST /api/record-to-blockchain` - Manually record sensor data
- `POST /api/wallet/airdrop` - Request SOL airdrop

### Supply Chain
- `GET /api/supply-chain/events` - Get all events
- `GET /api/supply-chain/batches` - Get all batches
- `POST /api/supply-chain/event` - Create new event

## 📊 Dashboard Features

### IoT Sensors Tab
- Real-time sensor readings
- Visual metrics for each sensor
- Battery levels and status indicators
- Last update timestamps

### Blockchain Tab
- Wallet address and balance
- Transaction history
- Solana Explorer links
- Airdrop functionality

### Supply Chain Tab
- Create supply chain events
- View batch tracking
- Interactive timeline
- Blockchain verification links

## 🛠️ Technology Stack

### Backend
- Node.js + Express
- @solana/web3.js (Blockchain)
- MQTT (IoT Communication)
- Aedes (MQTT Broker)

### Frontend
- React 18
- Axios (API calls)
- Recharts (Data visualization)
- Lucide React (Icons)

### Blockchain
- Solana Devnet
- Web3.js
- BS58 (Key encoding)

## 🔧 Configuration Options

### Environment Variables

```env
# Server Configuration
PORT=3001                    # Backend API port
MQTT_PORT=1883              # MQTT broker port

# Solana Configuration
SOLANA_NETWORK=devnet       # Network (devnet/testnet/mainnet)
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PRIVATE_KEY=...      # Your wallet private key (base58)

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### IoT Simulator Configuration

Edit `iot-simulator/device-simulator.js`:
- Modify `SENSORS` array to add/remove sensors
- Adjust update interval in `startSimulation(seconds)`
- Customize sensor data generation logic

## 📝 Development

### Project Structure

```
agrochain/
├── backend/
│   ├── server.js           # Express API server
│   ├── solana-service.js   # Blockchain integration
│   └── mqtt-service.js     # IoT communication
├── iot-simulator/
│   └── device-simulator.js # Virtual IoT devices
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main application
│   │   ├── components/     # React components
│   │   └── index.css       # Styling
│   └── package.json
├── package.json            # Root dependencies
├── .env                    # Configuration
└── README.md
```

### Adding New Features

1. **New Sensor Types**: Modify the simulator to add new sensor types
2. **Custom Blockchain Data**: Update `solana-service.js` to store different data structures
3. **Additional Supply Chain Events**: Add new event types in the frontend

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Ensure all dependencies are installed: `npm install`

### IoT Simulator not connecting
- Make sure the backend is running first
- Check MQTT broker is running on port 1883
- Look for connection errors in console

### Blockchain transactions failing
- Ensure you have sufficient SOL balance
- Request an airdrop from the dashboard
- Check Solana devnet status: https://status.solana.com

### Frontend can't connect to backend
- Verify backend is running on http://localhost:3001
- Check browser console for CORS errors
- Ensure `.env` is configured correctly

## 🔒 Security Notes

- This is a development/demo application
- Private keys are shown in console for testing only
- Never use devnet wallets for mainnet
- In production, use proper key management and HSMs

## 🚀 Production Deployment

For production use:
1. Use environment-specific configuration
2. Implement proper key management (AWS KMS, Azure Key Vault, etc.)
3. Add authentication and authorization
4. Use production Solana RPC endpoints
5. Implement proper error handling and logging
6. Add monitoring and alerting
7. Use SSL/TLS for all connections

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please create an issue on the repository.

---

Built with ❤️ for sustainable agriculture and blockchain transparency
