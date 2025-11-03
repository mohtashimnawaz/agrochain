import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function BlockchainInfo({ walletInfo, transactions, onAirdrop }) {
  const [loading, setLoading] = useState(false);

  const handleAirdrop = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/wallet/airdrop`);
      alert('Airdrop requested! Balance will update shortly.');
      onAirdrop();
    } catch (err) {
      alert('Airdrop failed. You may need to wait before requesting again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">💰 Solana Wallet Information</h2>
        </div>

        {walletInfo ? (
          <>
            <div className="blockchain-info">
              <div className="info-box">
                <div className="info-label">Network</div>
                <div className="info-value">{walletInfo.network}</div>
              </div>
              <div className="info-box">
                <div className="info-label">Balance</div>
                <div className="info-value">{walletInfo.balance?.toFixed(4)} SOL</div>
              </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Wallet Address:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                {walletInfo.address}
              </div>
            </div>

            <button 
              className="btn" 
              onClick={handleAirdrop}
              disabled={loading}
              style={{ marginTop: '15px' }}
            >
              {loading ? 'Requesting...' : '🚰 Request Airdrop (2 SOL)'}
            </button>
          </>
        ) : (
          <p>Loading wallet information...</p>
        )}
      </div>

      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">📜 Recent Blockchain Transactions</h2>
        </div>

        {transactions.length > 0 ? (
          <div className="transaction-list">
            {transactions.map((tx, index) => (
              <div key={index} className="transaction-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong>Transaction #{index + 1}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    Slot: {tx.slot}
                  </span>
                </div>
                <div className="transaction-signature">
                  {tx.signature}
                </div>
                {tx.timestamp && (
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </div>
                )}
                <a 
                  href={tx.explorer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transaction-link"
                >
                  🔍 View on Solana Explorer →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p>No transactions yet. Sensor data will be recorded to the blockchain automatically.</p>
        )}
      </div>
    </div>
  );
}

export default BlockchainInfo;
