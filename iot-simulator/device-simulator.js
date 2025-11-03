const mqtt = require('mqtt');

// Configuration for demo sensors
const SENSORS = [
  {
    id: 'SENSOR_001',
    location: 'Field_A_North',
    crop: 'Wheat',
    coordinates: { lat: 40.7128, lon: -74.0060 }
  },
  {
    id: 'SENSOR_002',
    location: 'Field_A_South',
    crop: 'Wheat',
    coordinates: { lat: 40.7120, lon: -74.0065 }
  },
  {
    id: 'SENSOR_003',
    location: 'Field_B_East',
    crop: 'Corn',
    coordinates: { lat: 40.7135, lon: -74.0055 }
  },
  {
    id: 'SENSOR_004',
    location: 'Field_B_West',
    crop: 'Corn',
    coordinates: { lat: 40.7130, lon: -74.0070 }
  },
  {
    id: 'SENSOR_005',
    location: 'Greenhouse_1',
    crop: 'Tomatoes',
    coordinates: { lat: 40.7140, lon: -74.0050 }
  }
];

class IoTDeviceSimulator {
  constructor(brokerUrl = 'mqtt://localhost:1883') {
    this.brokerUrl = brokerUrl;
    this.client = null;
    this.sensors = SENSORS;
    this.intervalId = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Connecting to MQTT broker...');
      this.client = mqtt.connect(this.brokerUrl);

      this.client.on('connect', () => {
        console.log('✅ IoT Simulator connected to MQTT broker');
        console.log(`📱 Simulating ${this.sensors.length} IoT devices`);
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('❌ MQTT connection error:', error);
        reject(error);
      });

      this.client.on('close', () => {
        console.log('📴 Disconnected from MQTT broker');
      });
    });
  }

  // Generate realistic sensor data with some variation
  generateSensorData(sensor) {
    const baseTime = Date.now();
    const hourOfDay = new Date().getHours();
    
    // Temperature varies by time of day (cooler at night, warmer during day)
    const tempVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 10;
    let baseTemp = 20 + tempVariation + (Math.random() - 0.5) * 3;
    
    // Greenhouse has more controlled temperature
    if (sensor.location.includes('Greenhouse')) {
      baseTemp = 22 + (Math.random() - 0.5) * 2;
    }
    
    // Humidity inversely related to temperature
    const humidity = Math.max(30, Math.min(90, 80 - (baseTemp - 20) * 2 + (Math.random() - 0.5) * 10));
    
    // Soil moisture decreases slowly over time, with random variation
    const soilMoisture = Math.max(20, Math.min(80, 50 + (Math.random() - 0.3) * 15));
    
    // Soil pH is relatively stable
    const soilPH = Math.max(5.5, Math.min(7.5, 6.5 + (Math.random() - 0.5) * 0.5));
    
    // Light intensity varies by time of day
    let lightIntensity = 0;
    if (hourOfDay >= 6 && hourOfDay <= 18) {
      const sunPosition = Math.sin((hourOfDay - 6) * Math.PI / 12);
      lightIntensity = Math.round(sunPosition * 1000 + (Math.random() - 0.5) * 100);
    } else {
      lightIntensity = Math.round(Math.random() * 50); // Some ambient light at night
    }
    
    return {
      sensorId: sensor.id,
      location: sensor.location,
      crop: sensor.crop,
      coordinates: sensor.coordinates,
      timestamp: baseTime,
      temperature: Math.round(baseTemp * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      soilMoisture: Math.round(soilMoisture * 10) / 10,
      soilPH: Math.round(soilPH * 100) / 100,
      lightIntensity: Math.max(0, lightIntensity),
      batteryLevel: Math.max(20, Math.min(100, 100 - Math.random() * 2)), // Slowly decreasing
      status: 'active'
    };
  }

  publishSensorData(sensor) {
    const data = this.generateSensorData(sensor);
    const topic = `agrochain/sensors/${sensor.id}`;
    
    this.client.publish(topic, JSON.stringify(data), { qos: 1 }, (error) => {
      if (error) {
        console.error(`❌ Error publishing data for ${sensor.id}:`, error);
      } else {
        console.log(`📤 ${sensor.id} (${sensor.location}): Temp=${data.temperature}°C, Humidity=${data.humidity}%, Soil=${data.soilMoisture}%`);
      }
    });
  }

  startSimulation(intervalSeconds = 10) {
    console.log(`\n🌱 Starting IoT device simulation (update every ${intervalSeconds}s)`);
    console.log('━'.repeat(60));
    
    // Publish initial data immediately
    this.sensors.forEach(sensor => {
      this.publishSensorData(sensor);
    });
    
    // Then publish at regular intervals
    this.intervalId = setInterval(() => {
      console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Publishing sensor data...`);
      this.sensors.forEach(sensor => {
        this.publishSensorData(sensor);
      });
    }, intervalSeconds * 1000);
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('\n⏹️  Simulation stopped');
    }
  }

  startDemoMode(intervalSeconds = 10) {
    console.log(`\n🎭 Starting DEMO MODE simulation (update every ${intervalSeconds}s)`);
    console.log('Demo features: battery drain, intermittent connectivity, random alerts');
    console.log('━'.repeat(60));
    
    let cycleCount = 0;
    const batteryDrainRate = 0.5; // % per cycle
    
    // Publish initial data
    this.sensors.forEach(sensor => {
      this.publishSensorData(sensor);
    });
    
    this.intervalId = setInterval(() => {
      cycleCount++;
      console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Cycle ${cycleCount} - Publishing sensor data...`);
      
      this.sensors.forEach((sensor, index) => {
        // Simulate battery drain
        if (!sensor.batteryLevel) sensor.batteryLevel = 100;
        sensor.batteryLevel = Math.max(0, sensor.batteryLevel - batteryDrainRate);
        
        // Simulate intermittent connectivity (10% chance of failure)
        if (Math.random() < 0.1) {
          console.log(`⚠️  ${sensor.id}: Connection timeout (simulated)`);
          return;
        }
        
        // Simulate low battery alert
        if (sensor.batteryLevel < 20 && sensor.batteryLevel > 19) {
          console.log(`🔋 ${sensor.id}: LOW BATTERY ALERT! (${sensor.batteryLevel.toFixed(1)}%)`);
        }
        
        // Simulate sensor going offline when battery dies
        if (sensor.batteryLevel <= 0) {
          console.log(`❌ ${sensor.id}: OFFLINE - Battery depleted`);
          return;
        }
        
        // Simulate extreme reading alerts (5% chance)
        const data = this.generateSensorData(sensor);
        if (Math.random() < 0.05) {
          // Generate extreme value for one metric
          const extremeTypes = ['temperature', 'humidity', 'soilMoisture'];
          const extremeType = extremeTypes[Math.floor(Math.random() * extremeTypes.length)];
          
          if (extremeType === 'temperature') {
            data.temperature = Math.random() < 0.5 ? 45 : 5; // Too hot or cold
            console.log(`🌡️  ${sensor.id}: EXTREME TEMPERATURE ALERT! (${data.temperature}°C)`);
          } else if (extremeType === 'humidity') {
            data.humidity = Math.random() < 0.5 ? 95 : 15; // Too humid or dry
            console.log(`💧 ${sensor.id}: EXTREME HUMIDITY ALERT! (${data.humidity}%)`);
          } else if (extremeType === 'soilMoisture') {
            data.soilMoisture = Math.random() < 0.5 ? 10 : 85; // Too dry or saturated
            console.log(`🌱 ${sensor.id}: SOIL MOISTURE ALERT! (${data.soilMoisture}%)`);
          }
        }
        
        data.batteryLevel = sensor.batteryLevel;
        data.status = sensor.batteryLevel > 0 ? 'active' : 'offline';
        
        const topic = `agrochain/sensors/${sensor.id}`;
        this.client.publish(topic, JSON.stringify(data), { qos: 1 }, (error) => {
          if (error) {
            console.error(`❌ Error publishing data for ${sensor.id}:`, error);
          } else {
            console.log(`📤 ${sensor.id} (${sensor.location}): Temp=${data.temperature}°C, Humidity=${data.humidity}%, Soil=${data.soilMoisture}%, Battery=${data.batteryLevel.toFixed(1)}%`);
          }
        });
      });
      
      // Simulate battery recharge every 50 cycles
      if (cycleCount % 50 === 0) {
        console.log('\n🔌 Recharging all sensor batteries to 100%...');
        this.sensors.forEach(sensor => {
          sensor.batteryLevel = 100;
        });
      }
    }, intervalSeconds * 1000);
  }

  disconnect() {
    this.stopSimulation();
    if (this.client) {
      this.client.end();
    }
  }
}

// Main execution
async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let intervalSeconds = 10;
  let demoMode = false;
  let numSensors = SENSORS.length;
  let brokerUrl = 'mqtt://localhost:1883';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--interval' && args[i + 1]) {
      intervalSeconds = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--demo') {
      demoMode = true;
    } else if (args[i] === '--sensors' && args[i + 1]) {
      numSensors = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--broker' && args[i + 1]) {
      brokerUrl = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
🌱 AgroChain IoT Device Simulator

Usage: node device-simulator.js [options]

Options:
  --interval <seconds>   Update interval in seconds (default: 10)
  --demo                 Enable demo mode with intermittent issues
  --sensors <number>     Number of sensors to simulate (default: ${SENSORS.length})
  --broker <url>         MQTT broker URL (default: mqtt://localhost:1883)
  --help, -h            Show this help message

Examples:
  node device-simulator.js --interval 5
  node device-simulator.js --demo --sensors 3
  node device-simulator.js --broker mqtt://192.168.1.100:1883
      `);
      process.exit(0);
    }
  }
  
  const simulator = new IoTDeviceSimulator(brokerUrl);
  
  // Limit sensors if specified
  if (numSensors < SENSORS.length) {
    simulator.sensors = SENSORS.slice(0, numSensors);
  }
  
  try {
    await simulator.connect();
    
    // Wait a bit for broker to be ready
    setTimeout(() => {
      if (demoMode) {
        console.log('🎭 Demo mode enabled: simulating intermittent connectivity and battery drain');
        simulator.startDemoMode(intervalSeconds);
      } else {
        simulator.startSimulation(intervalSeconds);
      }
    }, 2000);
    
  } catch (error) {
    console.error('Failed to start simulator:', error);
    process.exit(1);
  }
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down simulator...');
    simulator.disconnect();
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = IoTDeviceSimulator;
