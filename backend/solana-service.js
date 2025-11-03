const { Connection, PublicKey, Keypair, Transaction, SystemProgram, TransactionInstruction, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

class SolanaService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    this.wallet = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (process.env.WALLET_PRIVATE_KEY && process.env.WALLET_PRIVATE_KEY !== 'your_base58_encoded_private_key_here') {
        const privateKey = bs58.decode(process.env.WALLET_PRIVATE_KEY);
        this.wallet = Keypair.fromSecretKey(privateKey);
      } else {
        // Generate a new keypair for testing
        this.wallet = Keypair.generate();
        console.log('⚠️  Generated new wallet for testing');
        console.log('Public Key:', this.wallet.publicKey.toString());
        console.log('Private Key (base58):', bs58.encode(this.wallet.secretKey));
        console.log('⚠️  Please save this private key in your .env file as WALLET_PRIVATE_KEY');
        
        // Request airdrop for testing
        await this.requestAirdrop();
      }
      
      this.initialized = true;
      console.log('✅ Solana service initialized');
      console.log('Wallet Address:', this.wallet.publicKey.toString());
      
      const balance = await this.getBalance();
      console.log(`Wallet Balance: ${balance} SOL`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Solana service:', error.message);
      return false;
    }
  }

  async requestAirdrop() {
    try {
      console.log('Requesting airdrop...');
      const signature = await this.connection.requestAirdrop(
        this.wallet.publicKey,
        2 * 1e9 // 2 SOL
      );
      await this.connection.confirmTransaction(signature);
      console.log('✅ Airdrop successful');
    } catch (error) {
      console.error('⚠️  Airdrop failed:', error.message);
      console.log('You may need to request airdrop manually or use a faucet');
    }
  }

  async getBalance() {
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async recordCropData(sensorData) {
    try {
      if (!this.initialized) {
        throw new Error('Solana service not initialized');
      }

      // Create a memo transaction with crop data
      const memoData = JSON.stringify({
        type: 'CROP_DATA',
        timestamp: Date.now(),
        sensorId: sensorData.sensorId,
        location: sensorData.location,
        data: {
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          soilMoisture: sensorData.soilMoisture,
          soilPH: sensorData.soilPH,
          lightIntensity: sensorData.lightIntensity
        }
      });

      // Create a transaction that sends 0 SOL to self with memo
      const transaction = new Transaction();

      // Add a tiny transfer so transaction is valid (some lamports)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: this.wallet.publicKey,
          lamports: 1000, // Minimal amount
        })
      );

      // Attach a Memo instruction so the JSON is discoverable on-chain.
      // Memo Program ID (official)
      const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoData)
      });

      transaction.add(memoInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet],
        { commitment: 'confirmed' }
      );

      console.log('✅ Crop data recorded on blockchain:', signature);
      
      return {
        success: true,
        signature,
        data: memoData,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };
    } catch (error) {
      console.error('❌ Error recording crop data:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async recordSupplyChainEvent(eventData) {
    try {
      if (!this.initialized) {
        throw new Error('Solana service not initialized');
      }

      const memoData = JSON.stringify({
        type: 'SUPPLY_CHAIN',
        timestamp: Date.now(),
        event: eventData.event,
        batchId: eventData.batchId,
        location: eventData.location,
        handler: eventData.handler,
        metadata: eventData.metadata
      });

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: this.wallet.publicKey,
          lamports: 1000,
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet],
        { commitment: 'confirmed' }
      );

      console.log('✅ Supply chain event recorded:', signature);
      
      return {
        success: true,
        signature,
        data: memoData,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };
    } catch (error) {
      console.error('❌ Error recording supply chain event:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTransactionHistory(limit = 10) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        this.wallet.publicKey,
        { limit }
      );

      const transactions = [];
      for (const sig of signatures) {
        transactions.push({
          signature: sig.signature,
          slot: sig.slot,
          timestamp: sig.blockTime,
          explorer: `https://explorer.solana.com/tx/${sig.signature}?cluster=devnet`
        });
      }

      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}

module.exports = new SolanaService();
