const mongoose = require('mongoose');

/**
 * Transaction Schema - Stores ticket purchase and transfer records
 */
const transactionSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  tokenId: {
    type: Number,
    required: true
  },
  eventId: {
    type: Number,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['MINT', 'TRANSFER', 'INVALIDATE'],
    required: true
  },
  from: {
    type: String,
    required: true,
    lowercase: true
  },
  to: {
    type: String,
    required: true,
    lowercase: true
  },
  price: {
    type: String,
    default: '0'
  },
  blockNumber: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'FAILED'],
    default: 'CONFIRMED'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ transactionHash: 1 });
transactionSchema.index({ tokenId: 1 });
transactionSchema.index({ eventId: 1 });
transactionSchema.index({ to: 1 });
transactionSchema.index({ from: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ timestamp: -1 });

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = function(address) {
  return this.find({
    $or: [
      { from: address.toLowerCase() },
      { to: address.toLowerCase() }
    ]
  }).sort({ timestamp: -1 });
};

// Static method to get event transactions
transactionSchema.statics.getEventTransactions = function(eventId) {
  return this.find({ eventId })
    .sort({ timestamp: -1 });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
