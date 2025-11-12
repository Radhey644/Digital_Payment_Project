const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { ethers } = require('ethers');
// Load env from project root first, then fallback to local backend .env
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config();

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketnft';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);

// Simple local faucet to fund an address on localhost Hardhat chain
// POST /api/fund { address: string, amountEth?: string }
app.post('/api/fund', async (req, res) => {
  try {
    const { address, amountEth = '50' } = req.body || {};
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing address' });
    }

    // Local provider (Hardhat node)
    const rpcUrl = process.env.LOCAL_RPC_URL || process.env.VITE_MUMBAI_RPC_URL || 'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Use Hardhat default account #0 private key for local funding (publicly known; local only)
    const HARDHAT_PK = process.env.HARDHAT_FUND_PK || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const funder = new ethers.Wallet(HARDHAT_PK, provider);

    const funderAddr = await funder.getAddress();
    const balBefore = await provider.getBalance(address);
    const tx = await funder.sendTransaction({ to: address, value: ethers.parseEther(String(amountEth)) });
    const receipt = await tx.wait();
    const balAfter = await provider.getBalance(address);

    return res.json({
      success: true,
      message: 'Funded successfully',
      txHash: tx.hash,
      from: funderAddr,
      to: address,
      amountEth: String(amountEth),
      balanceBefore: ethers.formatEther(balBefore),
      balanceAfter: ethers.formatEther(balAfter),
      blockNumber: receipt.blockNumber,
      rpcUrl,
    });
  } catch (err) {
    console.error('Faucet error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Funding failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NFT Ticketing API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to NFT Ticketing System API',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      transactions: '/api/transactions',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Events API: http://localhost:${PORT}/api/events`);
  console.log(`💳 Transactions API: http://localhost:${PORT}/api/transactions\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

module.exports = app;
