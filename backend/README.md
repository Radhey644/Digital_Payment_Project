# NFT Ticketing System - Backend API

## 📝 Overview
Backend API server for the NFT Ticketing System, built with Node.js, Express, and MongoDB.

## 🚀 Features
- RESTful API for event management
- Transaction logging and tracking
- MongoDB integration
- CORS enabled for frontend integration
- Error handling and validation

## 🛠️ Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy the `.env.example` from the root directory
   - Update the following variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `PORT`: Server port (default: 5000)

## 🗄️ Database Setup

### Start MongoDB (if running locally):
```bash
# Windows
mongod

# Or use MongoDB Atlas (cloud)
```

### Seed the database with sample events:
```bash
node seedDatabase.js
```

## 🚀 Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Events API

**GET /api/events**
- Get all events
- Query params: `?active=true&category=Concert&sort=date_desc`

**GET /api/events/:id**
- Get specific event by eventId

**POST /api/events**
- Create a new event
- Body: `{ eventId, name, date, venue, price, ... }`

**PUT /api/events/:id**
- Update an event

**DELETE /api/events/:id**
- Soft delete an event (sets isActive to false)

**POST /api/events/:id/purchase**
- Decrease available tickets after purchase

### Transactions API

**GET /api/transactions**
- Get all transactions
- Query params: `?address=0x...&eventId=1&type=MINT&limit=10`

**GET /api/transactions/:hash**
- Get specific transaction by hash

**GET /api/transactions/user/:address**
- Get all transactions for a user

**GET /api/transactions/event/:eventId**
- Get all transactions for an event

**POST /api/transactions**
- Record a new transaction
- Body: `{ transactionHash, tokenId, eventId, type, from, to, ... }`

### Health Check

**GET /health**
- Check server and database status

## 📊 Data Models

### Event Model
```javascript
{
  eventId: Number,
  name: String,
  description: String,
  date: String,
  venue: String,
  price: String,
  totalTickets: Number,
  availableTickets: Number,
  category: String,
  image: String,
  organizer: String,
  isActive: Boolean
}
```

### Transaction Model
```javascript
{
  transactionHash: String,
  tokenId: Number,
  eventId: Number,
  eventName: String,
  type: 'MINT' | 'TRANSFER' | 'INVALIDATE',
  from: String,
  to: String,
  price: String,
  blockNumber: Number,
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
}
```

## 🧪 Testing

Test the API using:
- Postman
- cURL
- Your frontend application

Example cURL command:
```bash
curl http://localhost:5000/api/events
```

## 📝 Notes
- Ensure MongoDB is running before starting the server
- Use `seedDatabase.js` to populate initial event data
- Check `/health` endpoint to verify server status

## 📄 License
MIT
