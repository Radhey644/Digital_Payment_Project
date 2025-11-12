# 🚀 Quick Start Guide - NFT Ticketing System

## ⚡ Quick Setup (5 Steps)

### Step 1: Install All Dependencies
```bash
# Install smart contract dependencies
cd smart-contract
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### Step 2: Get Test MATIC
1. Install MetaMask browser extension
2. Create/Import a wallet
3. Switch to Polygon Mumbai Testnet
4. Get free test MATIC: https://faucet.polygon.technology/

### Step 3: Deploy Smart Contract
```bash
cd smart-contract

# Create .env file (copy from .env.example in root)
# Add your MetaMask private key to .env:
# PRIVATE_KEY=your_private_key_here

# Compile
npm run compile

# Deploy to Mumbai
npm run deploy:mumbai

# ✅ Copy the contract address from output
```

### Step 4: Start Backend
```bash
cd ../backend

# Update .env with:
# MONGODB_URI=mongodb://localhost:27017/ticketnft

# Make sure MongoDB is running, then:
node seedDatabase.js  # Load sample events
npm run dev           # Start server on port 5000
```

### Step 5: Start Frontend
```bash
cd ..

# Update .env with your contract address:
# VITE_CONTRACT_ADDRESS=your_deployed_contract_address
# VITE_API_URL=http://localhost:5000

npm run dev  # Start on port 5173
```

---

## 🎯 Test the Application

1. **Open Browser**: http://localhost:5173
2. **Connect Wallet**: Click "Connect Wallet" button
3. **Switch Network**: Approve Mumbai network in MetaMask
4. **Browse Events**: See sample events on Events page
5. **Buy Ticket**: Click "Buy Ticket" → Approve transaction
6. **View Tickets**: Go to "My Tickets" to see your NFTs

---

## 📋 Environment Variables Quick Reference

Create `.env` in project root:

```env
# Smart Contract
PRIVATE_KEY=your_metamask_private_key_without_0x
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=deployed_contract_address

# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticketnft

# Frontend
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_CHAIN_ID=80001
VITE_API_URL=http://localhost:5000
```

---

## 🔧 Common Issues & Solutions

### Issue: "MetaMask is not installed"
**Solution**: Install MetaMask extension from https://metamask.io/

### Issue: "Wrong network"
**Solution**: Click the network switch button or manually switch to Polygon Mumbai in MetaMask

### Issue: "Insufficient funds"
**Solution**: Get test MATIC from https://faucet.polygon.technology/

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Ensure MongoDB is installed and running
- Windows: `net start MongoDB` (run as admin)
- Or use MongoDB Atlas (cloud): Update `MONGODB_URI` in .env

### Issue: "Contract not found"
**Solution**: 
1. Make sure contract is deployed
2. Update `VITE_CONTRACT_ADDRESS` in `.env`
3. Restart frontend: `npm run dev`

### Issue: "Backend API not responding"
**Solution**: 
- Check backend is running: `cd backend && npm run dev`
- Verify `VITE_API_URL=http://localhost:5000` in `.env`

---

## 📦 Available Scripts

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend
```bash
npm start        # Production server
npm run dev      # Development with auto-reload
node seedDatabase.js  # Add sample events
```

### Smart Contract
```bash
npm run compile          # Compile contracts
npm run deploy:local     # Deploy to local network
npm run deploy:mumbai    # Deploy to Mumbai testnet
npm run node            # Start local Hardhat node
```

---

## 🎨 Features You Can Test

✅ **Connect Wallet** - MetaMask integration
✅ **Buy Tickets** - Mint NFT tickets with MATIC
✅ **View Tickets** - See your NFT collection
✅ **Transfer Tickets** - Send tickets to other addresses
✅ **Verify Ownership** - Check ticket validity
✅ **QR Codes** - Generate QR codes for tickets
✅ **Event Management** - Browse available events
✅ **Transaction History** - View all blockchain transactions

---

## 🔗 Useful Links

- **Mumbai Faucet**: https://faucet.polygon.technology/
- **Mumbai Explorer**: https://mumbai.polygonscan.com/
- **MetaMask**: https://metamask.io/
- **MongoDB**: https://www.mongodb.com/try/download/community

---

## 📞 Need Help?

1. Check console logs in browser (F12)
2. Check backend logs in terminal
3. Verify all environment variables are set
4. Ensure all services are running
5. Refer to `SETUP.md` for detailed instructions

---

## 🎉 You're Ready!

Your NFT Ticketing System is now fully functional. Start buying and managing blockchain-powered event tickets!

**Next Steps:**
- Customize event data in backend
- Modify UI styling in frontend
- Add more features like refunds, event creation UI, etc.
- Deploy to production networks

Happy ticketing! 🎟️
