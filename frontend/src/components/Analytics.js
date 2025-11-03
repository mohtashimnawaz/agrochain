import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

function Analytics({ sensors, cropHistory }) {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [timeRange, setTimeRange] = useState('all');

  // Process historical data for charts
  const historicalData = useMemo(() => {
    if (!cropHistory || cropHistory.length === 0) return [];
    
    const filteredData = timeRange === 'all' 
      ? cropHistory 
      : cropHistory.slice(0, parseInt(timeRange));

    return filteredData.map((item, index) => ({
      index: cropHistory.length - index,
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      temperature: item.temperature,
      humidity: item.humidity,
      soilMoisture: item.soilMoisture,
      soilPH: item.soilPH,
      lightIntensity: item.lightIntensity,
      sensorId: item.sensorId
    })).reverse();
  }, [cropHistory, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (sensors.length === 0) return {};
    
    const temps = sensors.map(s => s.temperature);
    const humidities = sensors.map(s => s.humidity);
    const soilMoistures = sensors.map(s => s.soilMoisture);
    
    return {
      avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      minTemp: Math.min(...temps).toFixed(1),
      maxTemp: Math.max(...temps).toFixed(1),
      avgHumidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1),
      avgSoilMoisture: (soilMoistures.reduce((a, b) => a + b, 0) / soilMoistures.length).toFixed(1),
      totalSensors: sensors.length,
      activeSensors: sensors.filter(s => s.status === 'active').length
    };
  }, [sensors]);

  // Prepare data for sensor comparison
  const sensorComparison = useMemo(() => {
    return sensors.map(sensor => ({
      name: sensor.sensorId,
      temperature: sensor.temperature,
      humidity: sensor.humidity,
      soilMoisture: sensor.soilMoisture,
      soilPH: sensor.soilPH * 10, // Scale pH for visibility
      lightIntensity: sensor.lightIntensity / 10 // Scale light for visibility
    }));
  }, [sensors]);

  // Prepare data for crop type distribution
  const cropDistribution = useMemo(() => {
    const crops = {};
    sensors.forEach(sensor => {
      crops[sensor.crop] = (crops[sensor.crop] || 0) + 1;
    });
    return Object.entries(crops).map(([name, value]) => ({ name, value }));
  }, [sensors]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (sensors.length === 0) return [];
    
    const metrics = ['Temperature', 'Humidity', 'Soil Moisture', 'Soil pH', 'Light'];
    return metrics.map(metric => {
      const values = sensors.map(s => {
        switch(metric) {
          case 'Temperature': return s.temperature / 50 * 100; // Normalize to 0-100
          case 'Humidity': return s.humidity;
          case 'Soil Moisture': return s.soilMoisture;
          case 'Soil pH': return s.soilPH / 7 * 100; // Normalize to 0-100
          case 'Light': return s.lightIntensity / 10; // Normalize
          default: return 0;
        }
      });
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { metric, value: avg };
    });
  }, [sensors]);

  if (sensors.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📈 Analytics</h2>
        </div>
        <p>No sensor data available for analytics. Waiting for data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌡️</div>
          <div className="stat-content">
            <div className="stat-label">Avg Temperature</div>
            <div className="stat-value">{stats.avgTemp}°C</div>
            <div className="stat-range">
              Min: {stats.minTemp}°C | Max: {stats.maxTemp}°C
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <div className="stat-label">Avg Humidity</div>
            <div className="stat-value">{stats.avgHumidity}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <div className="stat-label">Avg Soil Moisture</div>
            <div className="stat-value">{stats.avgSoilMoisture}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <div className="stat-label">Active Sensors</div>
            <div className="stat-value">{stats.activeSensors}/{stats.totalSensors}</div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      {historicalData.length > 0 && (
        <div className="chart-controls">
          <label>Historical Data Range: </label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="10">Last 10 readings</option>
            <option value="25">Last 25 readings</option>
            <option value="50">Last 50 readings</option>
            <option value="all">All readings</option>
          </select>
        </div>
      )}

      {/* Historical Trends Chart */}
      {historicalData.length > 0 && (
        <div className="card large-card">
          <div className="card-header">
            <h2 className="card-title">📊 Historical Trends</h2>
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-selector"
            >
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="soilMoisture">Soil Moisture</option>
              <option value="soilPH">Soil pH</option>
              <option value="lightIntensity">Light Intensity</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#667eea" 
                strokeWidth={2}
                dot={{ fill: '#667eea' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sensor Comparison Chart */}
      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">🔄 Sensor Comparison</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sensorComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="temperature" fill="#667eea" name="Temperature" />
            <Bar dataKey="humidity" fill="#764ba2" name="Humidity" />
            <Bar dataKey="soilMoisture" fill="#4facfe" name="Soil Moisture" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-grid">
        {/* Crop Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🌾 Crop Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={cropDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Environmental Metrics Radar */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🎯 Environmental Profile</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Average" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health Status Overview */}
      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">🏥 System Health Overview</h2>
        </div>
        <div className="health-grid">
          {sensors.map(sensor => {
            const tempStatus = sensor.temperature > 35 || sensor.temperature < 5 ? 'critical' : 
                              sensor.temperature > 30 || sensor.temperature < 10 ? 'warning' : 'good';
            const moistureStatus = sensor.soilMoisture < 25 ? 'critical' : 
                                  sensor.soilMoisture < 40 ? 'warning' : 'good';
            const batteryStatus = sensor.batteryLevel < 20 ? 'critical' : 
                                 sensor.batteryLevel < 50 ? 'warning' : 'good';

            return (
              <div key={sensor.sensorId} className="health-item">
                <div className="health-sensor-name">{sensor.sensorId}</div>
                <div className="health-indicators">
                  <span className={`health-badge ${tempStatus}`}>
                    🌡️ {tempStatus === 'good' ? '✓' : '⚠'}
                  </span>
                  <span className={`health-badge ${moistureStatus}`}>
                    🌱 {moistureStatus === 'good' ? '✓' : '⚠'}
                  </span>
                  <span className={`health-badge ${batteryStatus}`}>
                    🔋 {batteryStatus === 'good' ? '✓' : '⚠'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
