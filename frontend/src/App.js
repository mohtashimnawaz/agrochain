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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6 animate-pulse">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white">🌱 Loading AgroChain Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with gradient */}
      <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-400 via-purple-400 to-success-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            🌾 AgroChain
          </h1>
          <p className="text-white/70 mt-2 text-sm md:text-base">
            Smart Farming with IoT Devices and Blockchain Technology
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="backdrop-blur-lg bg-red-500/10 border border-red-500/30 rounded-2xl p-4 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong className="text-red-400 font-semibold">Error:</strong>
                <span className="text-red-300 ml-2">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar with Tailwind */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${health?.services?.mqtt === 'running' ? 'bg-success-400 shadow-lg shadow-success-400/50 animate-pulse' : 'bg-red-500'}`}></div>
              <div>
                <div className="text-white/50 text-xs uppercase tracking-wide">MQTT Broker</div>
                <div className="text-white font-semibold">{health?.services?.mqtt || 'Unknown'}</div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${health?.services?.solana === 'connected' ? 'bg-success-400 shadow-lg shadow-success-400/50 animate-pulse' : 'bg-red-500'}`}></div>
              <div>
                <div className="text-white/50 text-xs uppercase tracking-wide">Solana</div>
                <div className="text-white font-semibold">{health?.services?.solana || 'Unknown'}</div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-success-400 shadow-lg shadow-success-400/50 animate-pulse"></div>
              <div>
                <div className="text-white/50 text-xs uppercase tracking-wide">Active Sensors</div>
                <div className="text-white font-semibold text-xl">{sensors.length}</div>
              </div>
            </div>
          </div>
          
          {walletInfo && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-primary-500/10 to-success-500/10 border border-primary-500/30 rounded-2xl p-4 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-white/50 text-xs uppercase tracking-wide">Balance</div>
                  <div className="text-white font-bold text-xl">{walletInfo.balance?.toFixed(4)} SOL</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce">⚠️</span>
                <span className="text-white font-semibold">
                  {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('alerts')}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50"
              >
                View Details
              </button>
            </div>
          </div>
        )}

        {/* Modern Tabs */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 shadow-xl">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'sensors' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-lg shadow-primary-500/50 scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab('sensors')}
            >
              📊 IoT Sensors
            </button>
            <button 
              className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'analytics' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-lg shadow-primary-500/50 scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 Analytics
            </button>
            <button 
              className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'blockchain' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-lg shadow-primary-500/50 scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab('blockchain')}
            >
              ⛓️ Blockchain
            </button>
            <button 
              className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'supply-chain' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-lg shadow-primary-500/50 scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab('supply-chain')}
            >
              🚚 Supply Chain
            </button>
            <button 
              className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                activeTab === 'alerts' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-lg shadow-primary-500/50 scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab('alerts')}
            >
              🔔 Alerts {alerts.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
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
    </div>
  );
}

export default App;
