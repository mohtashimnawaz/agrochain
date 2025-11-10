import React, { useState } from 'react';

function SensorDashboard({ sensors }) {
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (sensors.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 animate-fadeIn">
        <div className="text-center space-y-6">
          <div className="text-7xl animate-bounce">📡</div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">No Sensors Connected</h2>
            <p className="text-lg text-white/70 mb-4">Waiting for IoT devices to connect and send data...</p>
            <div className="inline-block backdrop-blur-lg bg-primary-500/10 border border-primary-500/30 rounded-xl px-6 py-3">
              <p className="text-white/60 text-sm">
                Make sure the IoT simulator is running: 
                <code className="ml-2 px-3 py-1 bg-slate-800 text-primary-400 rounded-lg font-mono text-xs">
                  npm run iot-simulator
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (value, type) => {
    switch(type) {
      case 'temp':
        if (value > 35 || value < 5) return 'text-red-400';
        if (value > 30 || value < 10) return 'text-yellow-400';
        return 'text-success-400';
      case 'moisture':
        if (value < 25) return 'text-red-400';
        if (value < 40) return 'text-yellow-400';
        return 'text-success-400';
      case 'battery':
        if (value < 20) return 'text-red-400';
        if (value < 50) return 'text-yellow-400';
        return 'text-success-400';
      default:
        return 'text-success-400';
    }
  };

  const getStatusBg = (value, type) => {
    switch(type) {
      case 'temp':
        if (value > 35 || value < 5) return 'from-red-500/20 to-red-600/10';
        if (value > 30 || value < 10) return 'from-yellow-500/20 to-yellow-600/10';
        return 'from-success-500/20 to-success-600/10';
      case 'moisture':
        if (value < 25) return 'from-red-500/20 to-red-600/10';
        if (value < 40) return 'from-yellow-500/20 to-yellow-600/10';
        return 'from-success-500/20 to-success-600/10';
      case 'battery':
        if (value < 20) return 'from-red-500/20 to-red-600/10';
        if (value < 50) return 'from-yellow-500/20 to-yellow-600/10';
        return 'from-success-500/20 to-success-600/10';
      default:
        return 'from-success-500/20 to-success-600/10';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Enhanced View Controls */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <button 
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-lg shadow-primary-500/50 scale-105' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <span className="flex items-center gap-2">
                🔲 Grid View
              </span>
            </button>
            <button 
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-lg shadow-primary-500/50 scale-105' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
              onClick={() => setViewMode('list')}
            >
              <span className="flex items-center gap-2">
                📋 List View
              </span>
            </button>
          </div>
          <div className="backdrop-blur-lg bg-gradient-to-r from-primary-500/20 to-success-500/20 border border-primary-500/30 rounded-xl px-6 py-3 shadow-lg">
            <span className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 bg-success-400 rounded-full animate-pulse shadow-lg shadow-success-400/50"></span>
              {sensors.filter(s => s.status === 'active').length} / {sensors.length} Active
            </span>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
        {sensors.map((sensor, index) => (
          <div 
            key={sensor.sensorId} 
            className={`group backdrop-blur-xl bg-gradient-to-br ${getStatusBg(sensor.temperature || 0, 'temp')} border border-white/10 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-primary-500/30 cursor-pointer ${
              selectedSensor === sensor.sensorId ? 'ring-2 ring-primary-500 scale-105' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedSensor(selectedSensor === sensor.sensorId ? null : sensor.sensorId)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-success-400 bg-clip-text text-transparent mb-2">
                    {sensor.location}
                  </h2>
                  <span className="inline-block px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-lg text-sm font-semibold">
                    {sensor.crop}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${sensor.status === 'active' ? 'bg-success-400 animate-pulse shadow-lg shadow-success-400/50' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-white/60 uppercase tracking-wide">{sensor.status}</span>
                </div>
              </div>
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
