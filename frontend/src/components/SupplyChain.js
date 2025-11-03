import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function SupplyChain() {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event: 'harvest',
    batchId: '',
    location: '',
    handler: '',
    metadata: ''
  });

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supply-chain/events`);
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supply-chain/batches`);
      setBatches(response.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchBatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/supply-chain/event`, {
        ...formData,
        metadata: formData.metadata || undefined
      });

      if (response.data.success) {
        alert('✅ Supply chain event recorded on blockchain!');
        setFormData({
          event: 'harvest',
          batchId: '',
          location: '',
          handler: '',
          metadata: ''
        });
        fetchEvents();
        fetchBatches();
      } else {
        alert('❌ Failed to record event: ' + response.data.error);
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">➕ Record New Supply Chain Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="supply-chain-form">
          <div className="form-group">
            <label>Event Type</label>
            <select name="event" value={formData.event} onChange={handleChange} required>
              <option value="harvest">🌾 Harvest</option>
              <option value="processing">⚙️ Processing</option>
              <option value="packaging">📦 Packaging</option>
              <option value="storage">🏭 Storage</option>
              <option value="transport">🚚 Transport</option>
              <option value="retail">🏪 Retail</option>
              <option value="delivery">📬 Delivery</option>
            </select>
          </div>

          <div className="form-group">
            <label>Batch ID</label>
            <input
              type="text"
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              placeholder="e.g., BATCH-2024-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Farm A, Warehouse B"
              required
            />
          </div>

          <div className="form-group">
            <label>Handler/Responsible Party</label>
            <input
              type="text"
              name="handler"
              value={formData.handler}
              onChange={handleChange}
              placeholder="e.g., John Doe, ABC Logistics"
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Metadata (Optional)</label>
            <textarea
              name="metadata"
              value={formData.metadata}
              onChange={handleChange}
              placeholder="Any additional information about this event"
              rows="3"
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? '⏳ Recording to Blockchain...' : '📝 Record Event'}
          </button>
        </form>
      </div>

      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">📦 Active Batches</h2>
        </div>

        {batches.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {batches.map((batch) => (
              <div key={batch.batchId} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
                <h3 style={{ marginBottom: '10px', color: '#667eea' }}>
                  {batch.batchId}
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
                  Total Events: {batch.events.length} | Status: {batch.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No batches created yet. Create your first supply chain event above.</p>
        )}
      </div>

      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">📋 Supply Chain Timeline</h2>
        </div>

        {events.length > 0 ? (
          <div className="event-timeline">
            {events.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-content">
                  <div className="event-title">
                    {getEventIcon(event.event)} {event.event.toUpperCase()}
                  </div>
                  <div className="event-details">
                    <div><strong>Batch:</strong> {event.batchId}</div>
                    <div><strong>Location:</strong> {event.location}</div>
                    <div><strong>Handler:</strong> {event.handler}</div>
                    <div><strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}</div>
                    {event.metadata && (
                      <div><strong>Notes:</strong> {event.metadata}</div>
                    )}
                    {event.signature && (
                      <div style={{ marginTop: '5px' }}>
                        <a 
                          href={`https://explorer.solana.com/tx/${event.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transaction-link"
                        >
                          🔍 View on Blockchain →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No supply chain events recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function getEventIcon(eventType) {
  const icons = {
    harvest: '🌾',
    processing: '⚙️',
    packaging: '📦',
    storage: '🏭',
    transport: '🚚',
    retail: '🏪',
    delivery: '📬'
  };
  return icons[eventType] || '📌';
}

export default SupplyChain;
