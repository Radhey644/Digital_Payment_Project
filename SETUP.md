# NFT Ticketing System - Complete Setup Guide

## 🎯 Project Structure
```
Digital_Payment_Project/
├── smart-contract/          # Solidity contracts & deployment
├── backend/                 # Node.js + Express + MongoDB API
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── pages/              # Page components
│   ├── web3/               # Blockchain integration
│   └── utils/              # Helper utilities
└── .env                    # Environment variables
```

## 🚀 Setup Instructions

### 1. Smart Contract Deployment

```bash
# Navigate to smart-contract directory
cd smart-contract

# Install dependencies
npm install

# Compile the contract
npm run compile

# Deploy to Polygon Mumbai (or local network)
npm run deploy:mumbai
```

**After deployment:**
- Copy the contract address from console output
- Update `.env` file with `CONTRACT_ADDRESS`
- Contract ABI will be auto-saved to `src/web3/contractABI.json`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the database with sample events
node seedDatabase.js

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Smart Contract
PRIVATE_KEY=your_wallet_private_key_here
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
CONTRACT_ADDRESS=deployed_contract_address_here

# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticketnft
NODE_ENV=development

# Frontend
VITE_CONTRACT_ADDRESS=deployed_contract_address_here
VITE_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_CHAIN_ID=80001
VITE_API_URL=http://localhost:5000
```

## 📋 Prerequisites

### Required Software:
- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **MetaMask** browser extension
- **Git**

### Blockchain Requirements:
- MetaMask wallet with Polygon Mumbai network
- Test MATIC tokens (get from [Mumbai Faucet](https://faucet.polygon.technology/))

## 🧪 Testing the Application

### 1. Connect MetaMask
- Open the app in your browser
- Click "Connect Wallet"
- Approve connection in MetaMask
- Ensure you're on Polygon Mumbai network

### 2. Buy a Ticket
- Browse events on the Events page
- Click "Buy Ticket" on any event
- Approve the transaction in MetaMask
- Wait for confirmation

### 3. View Your Tickets
- Navigate to "My Tickets" page
- See all your purchased NFT tickets
- View ticket details and QR codes

### 4. Transfer a Ticket
- Go to "Transfer" page
- Enter recipient address and token ID
- Approve transfer in MetaMask

### 5. Verify Tickets
- Go to "Verify" page
- Enter token ID and owner address
- Check if ticket is valid

## 📦 Package Scripts

### Frontend:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend:
```bash
npm start            # Start production server
npm run dev          # Start with nodemon (auto-reload)
node seedDatabase.js # Populate database with sample events
```

### Smart Contract:
```bash
npm run compile      # Compile contracts
npm run deploy:local # Deploy to local Hardhat network
npm run deploy:mumbai # Deploy to Polygon Mumbai
npm test             # Run tests
npm run node         # Start local Hardhat node
```

## 🔧 Troubleshooting

### MetaMask Issues:
- **Can't connect**: Make sure MetaMask is installed and unlocked
- **Wrong network**: Switch to Polygon Mumbai in MetaMask
- **No test MATIC**: Get from [Mumbai Faucet](https://faucet.polygon.technology/)

### Backend Issues:
- **MongoDB connection error**: Ensure MongoDB is running
- **Port already in use**: Change PORT in .env file
- **No events showing**: Run `node seedDatabase.js`

### Contract Issues:
- **Deployment fails**: Check you have enough test MATIC
- **Contract not found**: Update CONTRACT_ADDRESS in .env
- **ABI errors**: Re-compile and redeploy the contract

## 📚 API Documentation

### Events Endpoints:
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `POST /api/events/:id/purchase` - Mark ticket as purchased

### Transactions Endpoints:
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/user/:address` - Get user transactions
- `POST /api/transactions` - Record new transaction

## 🎨 Features Implemented

✅ Solidity ERC-721 NFT contract
✅ Hardhat deployment setup
✅ Express.js backend API
✅ MongoDB data storage
✅ MetaMask wallet connection
✅ Ticket minting (NFT creation)
✅ Ticket transfer functionality
✅ Ticket verification system
✅ QR code generation
✅ Event management
✅ Transaction logging
✅ Responsive UI with Tailwind CSS

## 🔒 Security Features

- OpenZeppelin audited contracts
- Payment validation with refunds
- Ownership verification
- Ticket invalidation mechanism
- CORS protection
- Environment variable protection

## 📖 Learn More

- [Ethereum Documentation](https://ethereum.org/developers)
- [Polygon Documentation](https://docs.polygon.technology/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)

## 📄 License
MIT

## 👨‍💻 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console logs
3. Verify all environment variables are set
4. Ensure all services are running

---

**Happy Ticketing! 🎟️**
