const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const solanaService = require('./solana-service');
const mqttService = require('./mqtt-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Store for crop data history
const cropDataHistory = [];
const supplyChainEvents = [];

// Initialize services
async function initializeServices() {
  try {
    // Start MQTT Broker
    await mqttService.startBroker(process.env.MQTT_PORT || 1883);
    
    // Initialize Solana
    await solanaService.initialize();
    
    // Set up sensor data handler
    mqttService.onSensorData(async (data) => {
      console.log('📊 Received sensor data:', data.sensorId);
      
      // Store in history
      cropDataHistory.unshift({
        ...data,
        timestamp: Date.now()
      });
      
      // Keep only last 100 records
      if (cropDataHistory.length > 100) {
        cropDataHistory.pop();
      }
      
      // Record to blockchain every 10 readings (to save on transactions)
      if (cropDataHistory.length % 10 === 0) {
        await solanaService.recordCropData(data);
      }
    });
    
    console.log('✅ All services initialized');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    services: {
      mqtt: mqttService.broker ? 'running' : 'stopped',
      solana: solanaService.initialized ? 'connected' : 'disconnected'
    }
  });
});

// Get all sensor data
app.get('/api/sensors', (req, res) => {
  const sensors = mqttService.getAllSensorData();
  res.json(sensors);
});

// Get specific sensor data
app.get('/api/sensors/:sensorId', (req, res) => {
  const sensor = mqttService.getSensorData(req.params.sensorId);
  if (sensor) {
    res.json(sensor);
  } else {
    res.status(404).json({ error: 'Sensor not found' });
  }
});

// Get crop data history
app.get('/api/crop-history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(cropDataHistory.slice(0, limit));
});

// Manually record sensor data to blockchain
app.post('/api/record-to-blockchain', async (req, res) => {
  try {
    const { sensorId } = req.body;
    const sensorData = mqttService.getSensorData(sensorId);
    
    if (!sensorData) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    
    const result = await solanaService.recordCropData(sensorData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Solana wallet info
app.get('/api/wallet', async (req, res) => {
  try {
    const balance = await solanaService.getBalance();
    res.json({
      address: solanaService.wallet.publicKey.toString(),
      balance,
      network: process.env.SOLANA_NETWORK || 'devnet'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain transaction history
app.get('/api/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const transactions = await solanaService.getTransactionHistory(limit);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supply Chain Routes

// Create supply chain event
app.post('/api/supply-chain/event', async (req, res) => {
  try {
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.event || !eventData.batchId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Record to blockchain
    const result = await solanaService.recordSupplyChainEvent(eventData);
    
    if (result.success) {
      supplyChainEvents.unshift({
        ...eventData,
        timestamp: Date.now(),
        signature: result.signature
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supply chain events
app.get('/api/supply-chain/events', (req, res) => {
  const { batchId } = req.query;
  
  if (batchId) {
    const events = supplyChainEvents.filter(e => e.batchId === batchId);
    res.json(events);
  } else {
    res.json(supplyChainEvents);
  }
});

// Get supply chain batches
app.get('/api/supply-chain/batches', (req, res) => {
  const batches = {};
  
  supplyChainEvents.forEach(event => {
    if (!batches[event.batchId]) {
      batches[event.batchId] = {
        batchId: event.batchId,
        events: [],
        status: 'active'
      };
    }
    batches[event.batchId].events.push(event);
  });
  
  res.json(Object.values(batches));
});

// Request airdrop (for testing)
app.post('/api/wallet/airdrop', async (req, res) => {
  try {
    await solanaService.requestAirdrop();
    const balance = await solanaService.getBalance();
    res.json({ 
      success: true, 
      balance,
      message: 'Airdrop requested successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 AgroChain Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  await initializeServices();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  mqttService.close();
  process.exit(0);
});
