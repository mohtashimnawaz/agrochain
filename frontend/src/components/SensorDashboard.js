import React, { useState } from 'react';

function SensorDashboard({ sensors }) {
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (sensors.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">No Sensors Connected</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📡</div>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Waiting for IoT devices to connect and send data...</p>
          <p style={{ marginTop: '10px', color: '#666' }}>
            Make sure the IoT simulator is running: <code>npm run iot-simulator</code>
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (value, type) => {
    switch(type) {
      case 'temp':
        if (value > 35 || value < 5) return '#dc3545';
        if (value > 30 || value < 10) return '#ffc107';
        return '#28a745';
      case 'moisture':
        if (value < 25) return '#dc3545';
        if (value < 40) return '#ffc107';
        return '#28a745';
      case 'battery':
        if (value < 20) return '#dc3545';
        if (value < 50) return '#ffc107';
        return '#28a745';
      default:
        return '#28a745';
    }
  };

  return (
    <div>
      {/* View Controls */}
      <div className="dashboard-controls">
        <div className="control-group">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            🔲 Grid View
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
        </div>
        <div className="sensor-count-badge">
          {sensors.filter(s => s.status === 'active').length} / {sensors.length} Active
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'dashboard-grid' : 'dashboard-list'}>
        {sensors.map((sensor) => (
          <div 
            key={sensor.sensorId} 
            className={`card sensor-card ${selectedSensor === sensor.sensorId ? 'selected' : ''}`}
            onClick={() => setSelectedSensor(selectedSensor === sensor.sensorId ? null : sensor.sensorId)}
          >
            <div className="card-header">
              <div>
                <h2 className="card-title">{sensor.location}</h2>
                <span className="sensor-badge">{sensor.crop}</span>
              </div>
              <div className={`status-dot ${sensor.status === 'active' ? 'active' : 'inactive'}`}></div>
            </div>
            
            <div className="sensor-info-row">
              <div className="sensor-info-item">
                <span className="info-icon">📍</span>
                <span>{sensor.sensorId}</span>
              </div>
              <div className="sensor-info-item">
                <span className="info-icon">🕐</span>
                <span>{new Date(sensor.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="sensor-info-item">
                <span className="info-icon">🔋</span>
                <span style={{ color: getStatusColor(sensor.batteryLevel, 'battery') }}>
                  {sensor.batteryLevel?.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="sensor-metrics-enhanced">
              <div className="metric-enhanced">
                <div className="metric-header">
                  <span className="metric-icon">🌡️</span>
                  <span className="metric-label-enhanced">Temperature</span>
                </div>
                <div 
                  className="metric-value-enhanced" 
                  style={{ color: getStatusColor(sensor.temperature, 'temp') }}
                >
                  {sensor.temperature}°C
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-bar-fill" 
                    style={{ 
                      width: `${(sensor.temperature / 50) * 100}%`,
                      background: getStatusColor(sensor.temperature, 'temp')
                    }}
                  ></div>
                </div>
              </div>

              <div className="metric-enhanced">
                <div className="metric-header">
                  <span className="metric-icon">💧</span>
                  <span className="metric-label-enhanced">Humidity</span>
                </div>
                <div className="metric-value-enhanced">
                  {sensor.humidity}%
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-bar-fill" 
                    style={{ width: `${sensor.humidity}%`, background: '#667eea' }}
                  ></div>
                </div>
              </div>

              <div className="metric-enhanced">
                <div className="metric-header">
                  <span className="metric-icon">🌱</span>
                  <span className="metric-label-enhanced">Soil Moisture</span>
                </div>
                <div 
                  className="metric-value-enhanced"
                  style={{ color: getStatusColor(sensor.soilMoisture, 'moisture') }}
                >
                  {sensor.soilMoisture}%
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-bar-fill" 
                    style={{ 
                      width: `${sensor.soilMoisture}%`,
                      background: getStatusColor(sensor.soilMoisture, 'moisture')
                    }}
                  ></div>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-compact">
                  <span className="metric-icon-compact">⚗️</span>
                  <div>
                    <div className="metric-label-compact">Soil pH</div>
                    <div className="metric-value-compact">{sensor.soilPH}</div>
                  </div>
                </div>
                <div className="metric-compact">
                  <span className="metric-icon-compact">☀️</span>
                  <div>
                    <div className="metric-label-compact">Light</div>
                    <div className="metric-value-compact">{sensor.lightIntensity} lux</div>
                  </div>
                </div>
              </div>
            </div>

            {selectedSensor === sensor.sensorId && (
              <div className="sensor-details-expanded">
                <div className="details-header">📊 Detailed Information</div>
                <div className="details-grid">
                  <div className="detail-item">
                    <span>Coordinates:</span>
                    <span>{sensor.coordinates?.lat?.toFixed(4)}, {sensor.coordinates?.lon?.toFixed(4)}</span>
                  </div>
                  <div className="detail-item">
                    <span>Last Reading:</span>
                    <span>{new Date(sensor.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Status:</span>
                    <span className={`status-badge ${sensor.status}`}>
                      {sensor.status === 'active' ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SensorDashboard;
