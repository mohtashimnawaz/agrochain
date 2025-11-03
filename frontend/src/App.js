import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SensorDashboard from './components/SensorDashboard';
import BlockchainInfo from './components/BlockchainInfo';
import SupplyChain from './components/SupplyChain';
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
        fetchTransactions()
      ]);
      setLoading(false);
    };

    initialize();
  }, []);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensors();
      fetchTransactions();
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

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'sensors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sensors')}
        >
          📊 IoT Sensors
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
      </div>

      {activeTab === 'sensors' && (
        <SensorDashboard sensors={sensors} />
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
    </div>
  );
}

export default App;
