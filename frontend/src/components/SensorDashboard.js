import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SensorDashboard({ sensors }) {
  if (sensors.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">No Sensors Connected</h2>
        </div>
        <p>Waiting for IoT devices to connect and send data...</p>
        <p style={{ marginTop: '10px', color: '#666' }}>
          Make sure the IoT simulator is running: <code>npm run iot-simulator</code>
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {sensors.map((sensor) => (
        <div key={sensor.sensorId} className="card">
          <div className="card-header">
            <h2 className="card-title">{sensor.location}</h2>
            <span className="sensor-badge">{sensor.crop}</span>
          </div>
          
          <div style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
            <div>📍 {sensor.sensorId}</div>
            <div>🕐 Last Update: {new Date(sensor.timestamp).toLocaleTimeString()}</div>
            <div>🔋 Battery: {sensor.batteryLevel?.toFixed(1)}%</div>
          </div>

          <div className="sensor-metrics">
            <div className="metric">
              <div className="metric-label">🌡️ Temperature</div>
              <div className="metric-value">
                {sensor.temperature}
                <span className="metric-unit">°C</span>
              </div>
            </div>

            <div className="metric">
              <div className="metric-label">💧 Humidity</div>
              <div className="metric-value">
                {sensor.humidity}
                <span className="metric-unit">%</span>
              </div>
            </div>

            <div className="metric">
              <div className="metric-label">🌱 Soil Moisture</div>
              <div className="metric-value">
                {sensor.soilMoisture}
                <span className="metric-unit">%</span>
              </div>
            </div>

            <div className="metric">
              <div className="metric-label">⚗️ Soil pH</div>
              <div className="metric-value">
                {sensor.soilPH}
              </div>
            </div>

            <div className="metric">
              <div className="metric-label">☀️ Light Intensity</div>
              <div className="metric-value">
                {sensor.lightIntensity}
                <span className="metric-unit">lux</span>
              </div>
            </div>

            <div className="metric">
              <div className="metric-label">📊 Status</div>
              <div className="metric-value" style={{ fontSize: '1.2rem' }}>
                {sensor.status === 'active' ? '✅ Active' : '❌ Inactive'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SensorDashboard;
