#!/usr/bin/env node

/**
 * AgroChain Flow Verification Script
 * 
 * Tests the complete data flow:
 * 1. Backend service initialization (MQTT + Solana)
 * 2. IoT simulator connecting and publishing
 * 3. Backend receiving sensor data
 * 4. Manual blockchain recording
 * 5. Supply chain event creation
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHealth() {
  log('\n📊 Step 1: Checking backend health...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    const { status, services } = response.data;
    
    if (status === 'ok') {
      log('✅ Backend is running', 'green');
      log(`   - MQTT Broker: ${services.mqtt}`, services.mqtt === 'running' ? 'green' : 'red');
      log(`   - Solana: ${services.solana}`, services.solana === 'connected' ? 'green' : 'red');
      
      if (services.mqtt !== 'running' || services.solana !== 'connected') {
        throw new Error('Services not ready');
      }
      return true;
    }
  } catch (error) {
    log('❌ Backend health check failed', 'red');
    log('   Make sure backend is running: npm run backend', 'yellow');
    throw error;
  }
}

async function checkWallet() {
  log('\n💰 Step 2: Checking Solana wallet...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE_URL}/wallet`);
    const { address, balance, network } = response.data;
    
    log(`✅ Wallet connected`, 'green');
    log(`   - Network: ${network}`);
    log(`   - Address: ${address}`);
    log(`   - Balance: ${balance.toFixed(4)} SOL`);
    
    if (balance < 0.01) {
      log('⚠️  Low balance detected, requesting airdrop...', 'yellow');
      await axios.post(`${API_BASE_URL}/wallet/airdrop`);
      log('   Airdrop requested, waiting 5 seconds...', 'yellow');
      await sleep(5000);
      
      const newResponse = await axios.get(`${API_BASE_URL}/wallet`);
      log(`   New balance: ${newResponse.data.balance.toFixed(4)} SOL`, 'green');
    }
    
    return true;
  } catch (error) {
    log('❌ Wallet check failed', 'red');
    throw error;
  }
}

async function checkSensors() {
  log('\n📡 Step 3: Checking for sensor data...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE_URL}/sensors`);
    const sensors = response.data;
    
    if (sensors.length === 0) {
      log('⚠️  No sensors detected', 'yellow');
      log('   Make sure IoT simulator is running: npm run iot-simulator', 'yellow');
      log('   Waiting 15 seconds for data...', 'yellow');
      await sleep(15000);
      
      const retryResponse = await axios.get(`${API_BASE_URL}/sensors`);
      if (retryResponse.data.length === 0) {
        throw new Error('No sensor data after waiting');
      }
      sensors.push(...retryResponse.data);
    }
    
    log(`✅ Found ${sensors.length} active sensors`, 'green');
    sensors.forEach(sensor => {
      log(`   - ${sensor.sensorId} (${sensor.location}): ${sensor.temperature}°C, ${sensor.humidity}% humidity`);
    });
    
    return sensors;
  } catch (error) {
    log('❌ Sensor check failed', 'red');
    throw error;
  }
}

async function testBlockchainRecording(sensorId) {
  log('\n⛓️  Step 4: Testing blockchain recording...', 'cyan');
  try {
    log(`   Recording data for ${sensorId}...`);
    const response = await axios.post(`${API_BASE_URL}/record-to-blockchain`, {
      sensorId
    });
    
    if (response.data.success) {
      log('✅ Data recorded to blockchain', 'green');
      log(`   - Transaction: ${response.data.signature}`);
      log(`   - Explorer: ${response.data.explorer}`, 'blue');
      return response.data;
    } else {
      throw new Error(response.data.error || 'Recording failed');
    }
  } catch (error) {
    log('❌ Blockchain recording failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    throw error;
  }
}

async function testSupplyChainEvent() {
  log('\n🚚 Step 5: Testing supply chain event...', 'cyan');
  try {
    const batchId = `TEST-BATCH-${Date.now()}`;
    const eventData = {
      event: 'harvest',
      batchId,
      location: 'Test Farm A',
      handler: 'Automated Test',
      metadata: 'Created by test-flow.js verification script'
    };
    
    log(`   Creating harvest event for batch ${batchId}...`);
    const response = await axios.post(`${API_BASE_URL}/supply-chain/event`, eventData);
    
    if (response.data.success) {
      log('✅ Supply chain event recorded', 'green');
      log(`   - Batch: ${batchId}`);
      log(`   - Transaction: ${response.data.signature}`);
      log(`   - Explorer: ${response.data.explorer}`, 'blue');
      return response.data;
    } else {
      throw new Error(response.data.error || 'Event creation failed');
    }
  } catch (error) {
    log('❌ Supply chain event failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    throw error;
  }
}

async function checkTransactionHistory() {
  log('\n📜 Step 6: Verifying transaction history...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions?limit=5`);
    const transactions = response.data;
    
    log(`✅ Found ${transactions.length} recent transactions`, 'green');
    transactions.slice(0, 3).forEach((tx, i) => {
      log(`   ${i + 1}. ${tx.signature.substring(0, 20)}...`);
    });
    
    return transactions;
  } catch (error) {
    log('⚠️  Could not fetch transaction history', 'yellow');
    return [];
  }
}

async function testEdgeCases() {
  log('\n🧪 Step 7: Testing edge cases...', 'cyan');
  
  // Test 1: Invalid sensor ID
  log('   Test 1: Recording with invalid sensor ID...');
  try {
    await axios.post(`${API_BASE_URL}/record-to-blockchain`, {
      sensorId: 'INVALID_SENSOR_999'
    });
    log('   ❌ Should have failed but succeeded', 'red');
  } catch (error) {
    if (error.response?.status === 404) {
      log('   ✅ Correctly rejected invalid sensor', 'green');
    } else {
      log(`   ⚠️  Unexpected error: ${error.message}`, 'yellow');
    }
  }
  
  // Test 2: Missing required fields in supply chain event
  log('   Test 2: Creating event with missing fields...');
  try {
    await axios.post(`${API_BASE_URL}/supply-chain/event`, {
      event: 'harvest'
      // Missing batchId
    });
    log('   ❌ Should have failed but succeeded', 'red');
  } catch (error) {
    if (error.response?.status === 400) {
      log('   ✅ Correctly rejected missing fields', 'green');
    } else {
      log(`   ⚠️  Unexpected error: ${error.message}`, 'yellow');
    }
  }
  
  log('✅ Edge case testing complete', 'green');
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🌾 AgroChain Flow Verification Test', 'cyan');
  console.log('='.repeat(60));
  
  try {
    await checkHealth();
    await checkWallet();
    const sensors = await checkSensors();
    
    if (sensors.length > 0) {
      await testBlockchainRecording(sensors[0].sensorId);
    }
    
    await testSupplyChainEvent();
    await checkTransactionHistory();
    await testEdgeCases();
    
    console.log('\n' + '='.repeat(60));
    log('🎉 All tests passed successfully!', 'green');
    console.log('='.repeat(60));
    log('\n✅ Your AgroChain setup is working correctly!', 'green');
    log('   - IoT sensors are publishing data', 'green');
    log('   - Backend is receiving and storing data', 'green');
    log('   - Blockchain recording is functional', 'green');
    log('   - Supply chain events are being created', 'green');
    log('\n📱 Open http://localhost:3000 to view the dashboard\n', 'blue');
    
    process.exit(0);
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log('❌ Test failed', 'red');
    console.log('='.repeat(60));
    log(`\nError: ${error.message}`, 'red');
    log('\nPlease make sure:', 'yellow');
    log('1. Backend is running: npm run backend', 'yellow');
    log('2. IoT simulator is running: npm run iot-simulator', 'yellow');
    log('3. All dependencies are installed: npm run install-all', 'yellow');
    process.exit(1);
  }
}

// Run tests
runTests();
