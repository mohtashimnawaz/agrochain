const mqtt = require('mqtt');
const aedes = require('aedes')();
const net = require('net');

class MQTTService {
  constructor() {
    this.broker = null;
    this.client = null;
    this.sensorData = new Map();
    this.dataCallbacks = [];
  }

  startBroker(port = 1883) {
    return new Promise((resolve, reject) => {
      try {
        this.broker = net.createServer(aedes.handle);
        
        this.broker.listen(port, () => {
          console.log(`✅ MQTT Broker running on port ${port}`);
          resolve();
        });

        aedes.on('client', (client) => {
          console.log(`📱 IoT Device connected: ${client.id}`);
        });

        aedes.on('clientDisconnect', (client) => {
          console.log(`📱 IoT Device disconnected: ${client.id}`);
        });

        aedes.on('publish', (packet, client) => {
          if (client && packet.topic.startsWith('agrochain/sensors/')) {
            try {
              const data = JSON.parse(packet.payload.toString());
              this.handleSensorData(data);
            } catch (error) {
              console.error('Error parsing sensor data:', error);
            }
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  connectClient(brokerUrl = 'mqtt://localhost:1883') {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(brokerUrl);

      this.client.on('connect', () => {
        console.log('✅ MQTT Client connected to broker');
        this.client.subscribe('agrochain/sensors/#', (err) => {
          if (err) {
            console.error('Error subscribing to topics:', err);
          } else {
            console.log('📡 Subscribed to sensor topics');
          }
        });
        resolve();
      });

      this.client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleSensorData(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      this.client.on('error', (error) => {
        console.error('MQTT Client error:', error);
        reject(error);
      });
    });
  }

  handleSensorData(data) {
    this.sensorData.set(data.sensorId, {
      ...data,
      lastUpdate: Date.now()
    });

    // Notify all callbacks
    this.dataCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in data callback:', error);
      }
    });
  }

  onSensorData(callback) {
    this.dataCallbacks.push(callback);
  }

  getAllSensorData() {
    return Array.from(this.sensorData.values());
  }

  getSensorData(sensorId) {
    return this.sensorData.get(sensorId);
  }

  publish(topic, message) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, JSON.stringify(message));
    }
  }

  close() {
    if (this.client) {
      this.client.end();
    }
    if (this.broker) {
      this.broker.close();
    }
  }
}

module.exports = new MQTTService();
