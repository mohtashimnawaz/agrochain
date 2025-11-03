import React from 'react';

function Alerts({ alerts, sensors }) {
  const getAlertClass = (type) => {
    switch(type) {
      case 'danger': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getSensorDetails = (sensorId) => {
    return sensors.find(s => s.sensorId === sensorId);
  };

  if (alerts.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🔔 System Alerts</h2>
        </div>
        <div className="no-alerts">
          <div className="no-alerts-icon">✅</div>
          <h3>All Systems Normal</h3>
          <p>No active alerts at this time. All sensors are operating within normal parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">🔔 Active Alerts ({alerts.length})</h2>
        </div>
        
        <div className="alert-summary">
          <div className="alert-stat">
            <span className="alert-stat-number danger">
              {alerts.filter(a => a.type === 'danger').length}
            </span>
            <span className="alert-stat-label">Critical</span>
          </div>
          <div className="alert-stat">
            <span className="alert-stat-number warning">
              {alerts.filter(a => a.type === 'warning').length}
            </span>
            <span className="alert-stat-label">Warnings</span>
          </div>
          <div className="alert-stat">
            <span className="alert-stat-number info">
              {alerts.filter(a => a.type === 'info').length}
            </span>
            <span className="alert-stat-label">Info</span>
          </div>
        </div>

        <div className="alerts-list">
          {alerts.map((alert, index) => {
            const sensor = getSensorDetails(alert.sensor);
            return (
              <div key={index} className={`alert-item ${getAlertClass(alert.type)}`}>
                <div className="alert-icon-wrapper">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <span className="alert-sensor">{alert.sensor}</span>
                    {sensor && (
                      <span className="alert-location">{sensor.location} - {sensor.crop}</span>
                    )}
                  </div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-timestamp">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="alert-actions">
                  <button className="alert-action-btn" title="View Sensor Details">
                    👁️
                  </button>
                  <button className="alert-action-btn" title="Acknowledge">
                    ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card large-card">
        <div className="card-header">
          <h2 className="card-title">💡 Recommended Actions</h2>
        </div>
        <div className="recommendations-list">
          {alerts.filter(a => a.type === 'danger' || a.type === 'warning').slice(0, 5).map((alert, index) => {
            let recommendation = '';
            if (alert.message.includes('High temperature')) {
              recommendation = '🌊 Consider increasing irrigation or providing shade to reduce temperature.';
            } else if (alert.message.includes('Low temperature')) {
              recommendation = '🔥 Consider using frost protection methods or heating systems.';
            } else if (alert.message.includes('Low soil moisture')) {
              recommendation = '💧 Increase irrigation immediately to prevent crop stress.';
            } else if (alert.message.includes('Low humidity')) {
              recommendation = '💨 Consider using humidification systems or misting.';
            } else if (alert.message.includes('Low battery')) {
              recommendation = '🔋 Schedule battery replacement or sensor maintenance.';
            }

            return (
              <div key={index} className="recommendation-item">
                <div className="recommendation-icon">💡</div>
                <div className="recommendation-content">
                  <div className="recommendation-title">For {alert.sensor}: {alert.message}</div>
                  <div className="recommendation-text">{recommendation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert History Stats */}
      <div className="alerts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Alert Statistics</h3>
          </div>
          <div className="alert-stats">
            <div className="alert-stat-row">
              <span>Total Alerts:</span>
              <strong>{alerts.length}</strong>
            </div>
            <div className="alert-stat-row">
              <span>Most Affected Sensor:</span>
              <strong>
                {alerts.length > 0 
                  ? (() => {
                      const counts = alerts.reduce((acc, alert) => {
                        acc[alert.sensor] = (acc[alert.sensor] || 0) + 1;
                        return acc;
                      }, {});
                      const entries = Object.entries(counts);
                      return entries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
                    })()
                  : 'N/A'}
              </strong>
            </div>
            <div className="alert-stat-row">
              <span>Avg Response Time:</span>
              <strong>~2 minutes</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn">
              📧 Email Report
            </button>
            <button className="quick-action-btn">
              📱 Send SMS Alerts
            </button>
            <button className="quick-action-btn">
              🔕 Mute Alerts (1hr)
            </button>
            <button className="quick-action-btn">
              ✅ Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
