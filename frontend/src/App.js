import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SensorDashboard from './components/SensorDashboard';
import BlockchainInfo from './components/BlockchainInfo';
import SupplyChain from './components/SupplyChain';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import './index.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('sensors');
  const [sensors, setSensors] = useState([]);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cropHistory, setCropHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Fetch sensor data
  const fetchSensors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors`);
      setSensors(response.data);
    } catch (err) {
      console.error('Error fetching sensors:', err);
    }
  };

  // Fetch wallet info
  const fetchWalletInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wallet`);
      setWalletInfo(response.data);
    } catch (err) {
      console.error('Error fetching wallet info:', err);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions`);
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // Fetch crop history
  const fetchCropHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/crop-history?limit=100`);
      setCropHistory(response.data);
    } catch (err) {
      console.error('Error fetching crop history:', err);
    }
  };

  // Generate alerts from sensor data
  const generateAlerts = () => {
    const newAlerts = [];
    sensors.forEach(sensor => {
      if (sensor.temperature > 35) {
        newAlerts.push({ type: 'danger', sensor: sensor.sensorId, message: `High temperature: ${sensor.temperature}°C`, timestamp: sensor.timestamp });
      }
      if (sensor.temperature < 5) {
        newAlerts.push({ type: 'danger', sensor: sensor.sensorId, message: `Low temperature: ${sensor.temperature}°C`, timestamp: sensor.timestamp });
      }
      if (sensor.soilMoisture < 25) {
        newAlerts.push({ type: 'warning', sensor: sensor.sensorId, message: `Low soil moisture: ${sensor.soilMoisture}%`, timestamp: sensor.timestamp });
      }
      if (sensor.humidity < 30) {
        newAlerts.push({ type: 'warning', sensor: sensor.sensorId, message: `Low humidity: ${sensor.humidity}%`, timestamp: sensor.timestamp });
      }
      if (sensor.batteryLevel < 20) {
        newAlerts.push({ type: 'info', sensor: sensor.sensorId, message: `Low battery: ${sensor.batteryLevel}%`, timestamp: sensor.timestamp });
      }
    });
    setAlerts(newAlerts.slice(0, 10)); // Keep only recent 10 alerts
  };

  // Check health
  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setHealth(response.data);
      setError(null);
    } catch (err) {
      setError('Unable to connect to backend server. Please make sure it\'s running on port 3001.');
      console.error('Health check failed:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await checkHealth();
      await Promise.all([
        fetchSensors(),
        fetchWalletInfo(),
        fetchTransactions(),
        fetchCropHistory()
      ]);
      setLoading(false);
    };

    initialize();
  }, []);

  // Generate alerts when sensors update
  useEffect(() => {
    if (sensors.length > 0) {
      generateAlerts();
    }
  }, [sensors]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensors();
      fetchTransactions();
      fetchCropHistory();
      checkHealth();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>🌱 Loading AgroChain Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <h1>🌾 AgroChain</h1>
        <p>Smart Farming with IoT Devices and Blockchain Technology</p>
      </header>

      {error && (
        <div className="error">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      <div className="status-bar">
        <div className="status-item">
          <div className={`status-indicator ${health?.services?.mqtt === 'running' ? 'active' : 'inactive'}`}></div>
          <span>MQTT Broker: {health?.services?.mqtt || 'Unknown'}</span>
        </div>
        <div className="status-item">
          <div className={`status-indicator ${health?.services?.solana === 'connected' ? 'active' : 'inactive'}`}></div>
          <span>Solana: {health?.services?.solana || 'Unknown'}</span>
        </div>
        <div className="status-item">
          <div className="status-indicator active"></div>
          <span>Active Sensors: {sensors.length}</span>
        </div>
        {walletInfo && (
          <div className="status-item">
            <span>💰 Balance: {walletInfo.balance?.toFixed(4)} SOL</span>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="alerts-banner">
          <span className="alert-icon">⚠️</span>
          <span>{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</span>
          <button className="view-alerts-btn" onClick={() => setActiveTab('alerts')}>
            View Details
          </button>
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'sensors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sensors')}
        >
          📊 IoT Sensors
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`}
          onClick={() => setActiveTab('blockchain')}
        >
          ⛓️ Blockchain
        </button>
        <button 
          className={`tab ${activeTab === 'supply-chain' ? 'active' : ''}`}
          onClick={() => setActiveTab('supply-chain')}
        >
          🚚 Supply Chain
        </button>
        <button 
          className={`tab ${activeTab === 'alerts' ? 'active' : ''} ${alerts.length > 0 ? 'has-alerts' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 Alerts {alerts.length > 0 && `(${alerts.length})`}
        </button>
      </div>

      {activeTab === 'sensors' && (
        <SensorDashboard sensors={sensors} />
      )}

      {activeTab === 'analytics' && (
        <Analytics sensors={sensors} cropHistory={cropHistory} />
      )}

      {activeTab === 'blockchain' && (
        <BlockchainInfo 
          walletInfo={walletInfo}
          transactions={transactions}
          onAirdrop={fetchWalletInfo}
        />
      )}

      {activeTab === 'supply-chain' && (
        <SupplyChain />
      )}

      {activeTab === 'alerts' && (
        <Alerts alerts={alerts} sensors={sensors} />
      )}
    </div>
  );
}

export default App;
