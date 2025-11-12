const mongoose = require('mongoose');

/**
 * Event Schema - Stores event information
 */
const eventSchema = new mongoose.Schema({
  eventId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: '18:00'
  },
  venue: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true,
    default: '0.05'
  },
  totalTickets: {
    type: Number,
    required: true,
    default: 100
  },
  availableTickets: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Concert', 'Sports', 'Conference', 'Theater', 'Other'],
    default: 'Other'
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Event'
  },
  organizer: {
    type: String,
    default: 'Event Organizer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries (eventId already unique, no need to add duplicate index)
eventSchema.index({ isActive: 1 });
eventSchema.index({ date: 1 });

// Method to decrease available tickets
eventSchema.methods.decreaseAvailableTickets = async function() {
  if (this.availableTickets > 0) {
    this.availableTickets -= 1;
    await this.save();
    return true;
  }
  return false;
};

// Static method to get active events
eventSchema.statics.getActiveEvents = function() {
  return this.find({ isActive: true, availableTickets: { $gt: 0 } })
    .sort({ date: 1 });
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
