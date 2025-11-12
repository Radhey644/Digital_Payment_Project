const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

/**
 * GET /api/transactions
 * Get all transactions with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { address, eventId, type, limit } = req.query;
    
    let query = {};
    
    // Filter by address (from or to)
    if (address) {
      query.$or = [
        { from: address.toLowerCase() },
        { to: address.toLowerCase() }
      ];
    }
    
    // Filter by event ID
    if (eventId) {
      query.eventId = parseInt(eventId);
    }
    
    // Filter by transaction type
    if (type) {
      query.type = type.toUpperCase();
    }
    
    let queryBuilder = Transaction.find(query).sort({ timestamp: -1 });
    
    // Limit results
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }
    
    const transactions = await queryBuilder;
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/:hash
 * Get a specific transaction by hash
 */
router.get('/:hash', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      transactionHash: req.params.hash 
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/user/:address
 * Get all transactions for a specific user
 */
router.get('/user/:address', async (req, res) => {
  try {
    const transactions = await Transaction.getUserTransactions(req.params.address);
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user transactions',
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/event/:eventId
 * Get all transactions for a specific event
 */
router.get('/event/:eventId', async (req, res) => {
  try {
    const transactions = await Transaction.getEventTransactions(
      parseInt(req.params.eventId)
    );
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching event transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event transactions',
      error: error.message
    });
  }
});

/**
 * POST /api/transactions
 * Create a new transaction record
 */
router.post('/', async (req, res) => {
  try {
    const {
      transactionHash,
      tokenId,
      eventId,
      eventName,
      type,
      from,
      to,
      price,
      blockNumber,
      status
    } = req.body;
    
    // Validate required fields
    if (!transactionHash || !tokenId || !eventId || !eventName || !type || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if transaction already exists
    const existingTx = await Transaction.findOne({ transactionHash });
    if (existingTx) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already recorded'
      });
    }
    
    // Create new transaction
    const transaction = new Transaction({
      transactionHash,
      tokenId,
      eventId,
      eventName,
      type: type.toUpperCase(),
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      price,
      blockNumber,
      status: status || 'CONFIRMED'
    });
    
    await transaction.save();
    
    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
});

/**
 * PUT /api/transactions/:hash
 * Update transaction status
 */
router.put('/:hash', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      transactionHash: req.params.hash 
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Update allowed fields
    if (req.body.status) {
      transaction.status = req.body.status.toUpperCase();
    }
    if (req.body.blockNumber) {
      transaction.blockNumber = req.body.blockNumber;
    }
    
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
});

module.exports = router;
