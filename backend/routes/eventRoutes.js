const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

/**
 * GET /api/events
 * Get all active events
 */
router.get('/', async (req, res) => {
  try {
    const { active, category, sort } = req.query;
    
    let query = {};
    
    // Filter by active status
    if (active !== undefined) {
      query.isActive = active === 'true';
      query.availableTickets = { $gt: 0 };
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Build sort options
    let sortOptions = { date: 1 }; // Default: sort by date ascending
    if (sort === 'date_desc') sortOptions = { date: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'name') sortOptions = { name: 1 };
    
    const events = await Event.find(query).sort(sortOptions);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

/**
 * GET /api/events/:id
 * Get a specific event by eventId
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});

/**
 * POST /api/events
 * Create a new event
 */
router.post('/', async (req, res) => {
  try {
    const {
      eventId,
      name,
      description,
      date,
      time,
      venue,
      price,
      totalTickets,
      category,
      image,
      organizer
    } = req.body;
    
    // Validate required fields
    if (!eventId || !name || !date || !venue || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventId, name, date, venue, price'
      });
    }
    
    // Check if event already exists
    const existingEvent = await Event.findOne({ eventId });
    if (existingEvent) {
      return res.status(400).json({
        success: false,
        message: 'Event with this ID already exists'
      });
    }
    
    // Create new event
    const event = new Event({
      eventId,
      name,
      description,
      date,
      time,
      venue,
      price,
      totalTickets: totalTickets || 100,
      availableTickets: totalTickets || 100,
      category,
      image,
      organizer
    });
    
    await event.save();
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
});

/**
 * PUT /api/events/:id
 * Update an event
 */
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'date', 'time', 'venue', 
      'price', 'totalTickets', 'availableTickets', 
      'category', 'image', 'organizer', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });
    
    await event.save();
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});

/**
 * DELETE /api/events/:id
 * Delete an event (soft delete - set isActive to false)
 */
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    event.isActive = false;
    await event.save();
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});

/**
 * POST /api/events/:id/purchase
 * Decrease available tickets after purchase
 */
router.post('/:id/purchase', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Event is not active'
      });
    }
    
    const success = await event.decreaseAvailableTickets();
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'No tickets available'
      });
    }
    
    res.json({
      success: true,
      message: 'Ticket purchased successfully',
      availableTickets: event.availableTickets
    });
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing ticket',
      error: error.message
    });
  }
});

module.exports = router;
