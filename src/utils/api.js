const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetch all events
 */
export const fetchEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.active !== undefined) {
      params.append('active', filters.active);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.sort) {
      params.append('sort', filters.sort);
    }

    const url = `${API_BASE_URL}/api/events${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

/**
 * Create a new event
 */
export const createEvent = async (eventData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Mark ticket as purchased
 */
export const purchaseTicket = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to update ticket count');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    throw error;
  }
};

/**
 * Fetch all transactions
 */
export const fetchTransactions = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.address) {
      params.append('address', filters.address);
    }
    if (filters.eventId) {
      params.append('eventId', filters.eventId);
    }
    if (filters.type) {
      params.append('type', filters.type);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const url = `${API_BASE_URL}/api/transactions${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Fetch user transactions
 */
export const fetchUserTransactions = async (address) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/user/${address}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user transactions');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

/**
 * Record a new transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to record transaction');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error recording transaction:', error);
    throw error;
  }
};

/**
 * Check API health
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};

export default {
  fetchEvents,
  fetchEventById,
  createEvent,
  purchaseTicket,
  fetchTransactions,
  fetchUserTransactions,
  createTransaction,
  checkHealth,
};
