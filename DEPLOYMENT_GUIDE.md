# 🚀 Deployment Guide - NFT Ticketing dApp

## Prerequisites ✅

Before deploying, ensure you have:

1. **MetaMask Wallet** installed in your browser
2. **Test MATIC** in your wallet for Mumbai testnet
   - Get free test MATIC: https://faucet.polygon.technology/
3. **Node.js** and **npm** installed
4. **MongoDB Atlas** account (already configured)
5. **Wallet Private Key** for deployment

---

## Step 1: Get Your Private Key 🔑

### From MetaMask:
1. Open MetaMask
2. Click on the three dots (⋮) in the top right
3. Click "Account Details"
4. Click "Show Private Key"
5. Enter your password
6. Copy the private key

⚠️ **SECURITY WARNING:**
- Never share your private key
- Never commit it to GitHub
- Use a test wallet for development
- This wallet should only have test MATIC

---

## Step 2: Get Test MATIC 💰

1. Go to: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Select "MATIC Token"
4. Paste your wallet address
5. Complete CAPTCHA
6. Click "Submit"
7. Wait ~1 minute for test MATIC to arrive

**You need at least 0.5 MATIC for deployment.**

Check your balance in MetaMask (switch to Mumbai network).

---

## Step 3: Configure Environment Variables 📝

Edit `.env` file in the project root:

```bash
# Add your private key (from Step 1)
PRIVATE_KEY=your_private_key_here_without_0x

# RPC URL (already set)
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# MongoDB (already configured)
MONGODB_URI=mongodb+srv://radheyverma644_db_user:eHRBOxP4Ecbip82O@digitalpayment.hto0jbx.mongodb.net/ticketnft?retryWrites=true&w=majority&appName=DigitalPayment

# Backend
PORT=5000
VITE_API_URL=http://localhost:5000

# Frontend
VITE_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_CHAIN_ID=80001

# Contract addresses (will be filled after deployment)
CONTRACT_ADDRESS=
VITE_CONTRACT_ADDRESS=
```

**Save the file.**

---

## Step 4: Deploy Smart Contract to Mumbai 🎯

### 4.1 Install Dependencies
```powershell
cd smart-contract
npm install
```

### 4.2 Compile Contract
```powershell
npm run compile
```

**Expected Output:**
```
Compiled 20 Solidity files successfully (evm target: paris).
```

### 4.3 Deploy to Mumbai
```powershell
npm run deploy:mumbai
```

**Expected Output:**
```
Deploying TicketNFT contract...
TicketNFT deployed to: 0x... (contract address)
Contract verified on Polygonscan
ABI and deployment info saved to src/web3/
```

### 4.4 Copy Contract Address

From the deployment output, copy the contract address (starts with `0x`).

Example: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## Step 5: Update Environment Variables 🔄

Edit `.env` again and add the deployed contract address:

```bash
CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
```

**Make sure BOTH variables are set!**

---

## Step 6: Start Backend Server 🖥️

Open a **new terminal** window:

```powershell
# From project root
cd backend
npm install
node server.js
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ Connected to MongoDB
```

**Keep this terminal running.**

---

## Step 7: Start Frontend 🎨

Open **another new terminal** window:

```powershell
# From project root
npm install
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal running.**

---

## Step 8: Configure MetaMask 🦊

### 8.1 Add Mumbai Network (if not already added)

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add Network" or "Add Network Manually"
4. Enter:
   - **Network Name:** Polygon Mumbai Testnet
   - **RPC URL:** https://rpc-mumbai.maticvigil.com
   - **Chain ID:** 80001
   - **Currency Symbol:** MATIC
   - **Block Explorer:** https://mumbai.polygonscan.com
5. Click "Save"

### 8.2 Switch to Mumbai Network

1. Click network dropdown
2. Select "Polygon Mumbai Testnet"

---

## Step 9: Test the Application 🧪

### 9.1 Open the App
Go to: http://localhost:5173/

### 9.2 Connect Wallet
1. Click "Connect Wallet" button in the header
2. MetaMask popup appears
3. Click "Next" → "Connect"
4. Wallet connected! ✅

### 9.3 Buy a Ticket
1. Go to "Events" page (default page)
2. Find an event (loaded from backend)
3. Click "Buy Ticket"
4. MetaMask popup appears for transaction
5. Review gas fees
6. Click "Confirm"
7. Wait for transaction confirmation (~10-30 seconds)
8. Success message appears! 🎉

### 9.4 View Your Tickets
1. Click "My Tickets" in navigation
2. Your NFT ticket appears with QR code
3. See ticket details and validity status

### 9.5 Transfer a Ticket
1. Click "Transfer" in navigation
2. Select a ticket
3. Enter recipient's wallet address
4. Click "Transfer Ticket"
5. Confirm in MetaMask
6. Ticket transferred! ✅

### 9.6 Verify a Ticket
1. Click "Verify" in navigation
2. Enter a token ID (e.g., "1")
3. Click "Verify Ticket"
4. See verification result with ticket details

---

## 🔍 Viewing on Blockchain Explorer

### View Your Contract
https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS

### View Your NFT
https://mumbai.polygonscan.com/token/YOUR_CONTRACT_ADDRESS?a=TOKEN_ID

### View Transactions
https://mumbai.polygonscan.com/tx/TRANSACTION_HASH

---

## 📊 Backend API Endpoints

Backend running on http://localhost:5000

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/:id/purchase` - Decrease available tickets

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction record
- `GET /api/transactions/user/:address` - Get user transactions

### Health Check
- `GET /health` - Check API status

---

## 🐛 Troubleshooting

### Issue: "Contract address not configured"
**Solution:**
1. Check `.env` file has `VITE_CONTRACT_ADDRESS` set
2. Restart frontend: `npm run dev`

### Issue: "Insufficient funds"
**Solution:**
1. Get more test MATIC from faucet
2. Check you're on Mumbai network
3. Check wallet balance

### Issue: "Wrong network"
**Solution:**
1. Switch to Polygon Mumbai in MetaMask
2. App will auto-detect and prompt

### Issue: "Transaction failed"
**Possible causes:**
1. Insufficient gas
2. Event sold out
3. Invalid recipient address

### Issue: Backend not connecting
**Solution:**
1. Check MongoDB URI in `.env`
2. Ensure `node server.js` is running
3. Check port 5000 is not in use

### Issue: "Cannot read property of undefined"
**Solution:**
1. Ensure backend is running first
2. Check VITE_API_URL is correct
3. Wait for events to load

---

## 📱 Production Deployment (Optional)

### Frontend (Vercel/Netlify)
1. Update VITE_API_URL to production backend URL
2. Build: `npm run build`
3. Deploy `dist/` folder

### Backend (Railway/Heroku)
1. Push to Git
2. Deploy on platform
3. Set environment variables
4. Update VITE_API_URL in frontend

### Smart Contract
Contract is already on Mumbai testnet - no changes needed!
For mainnet deployment, use `deploy:mainnet` script.

---

## 🎉 Success Checklist

- ✅ Contract deployed to Mumbai
- ✅ Backend running on localhost:5000
- ✅ Frontend running on localhost:5173
- ✅ MetaMask connected to Mumbai
- ✅ Test MATIC in wallet
- ✅ Can buy tickets
- ✅ Can view tickets
- ✅ Can transfer tickets
- ✅ Can verify tickets

---

## 🔗 Important Links

- **Mumbai Faucet:** https://faucet.polygon.technology/
- **Polygonscan (Mumbai):** https://mumbai.polygonscan.com/
- **MetaMask:** https://metamask.io/
- **Polygon Docs:** https://docs.polygon.technology/

---

## 💡 Tips

1. **Gas Fees:** Always keep 0.1-0.2 MATIC in wallet for gas
2. **Transaction Speed:** Mumbai transactions take 10-30 seconds
3. **Testing:** Use multiple accounts to test transfers
4. **QR Codes:** Generated automatically for each ticket
5. **Event Management:** Add more events via backend API

---

## 📞 Need Help?

If you encounter issues:

1. Check terminal logs for errors
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set
4. Ensure all services (frontend, backend) are running
5. Check MetaMask is on Mumbai network

---

**Congratulations! Your NFT Ticketing dApp is now live! 🚀🎉**
