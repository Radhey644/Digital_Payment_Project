# Mumbai RPC Update & Deployment Guide

## ✅ RPC URL Fixed!

I've updated the Mumbai RPC URL to a more reliable endpoint:

**Old (Not Working):**
```
https://rpc-mumbai.maticvigil.com
```

**New (Working):**
```
https://polygon-mumbai-bor-rpc.publicnode.com
```

### Files Updated:
1. ✅ `.env` - Both MUMBAI_RPC_URL and VITE_MUMBAI_RPC_URL
2. ✅ `smart-contract/hardhat.config.js` - Network configuration
3. ✅ `src/web3/connectWallet.js` - MetaMask network addition
4. ✅ `src/web3/contract.js` - Read-only contract calls

---

## 🔑 Next Step: Add Your Private Key

Before deploying, you need to add your wallet's private key to `.env`:

### How to Get Your Private Key from MetaMask:

1. **Open MetaMask** extension
2. **Click the three dots** (⋮) in the top right
3. **Click "Account Details"**
4. **Click "Show Private Key"**
5. **Enter your password**
6. **Copy the private key**

### Add it to `.env`:

Open `.env` file and paste your private key:

```bash
PRIVATE_KEY=your_private_key_here_without_0x
```

**Example:**
```bash
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

⚠️ **IMPORTANT:**
- Do NOT include "0x" at the start
- Do NOT share this key with anyone
- Do NOT commit this file to GitHub
- Use a test wallet with only test MATIC

---

## 💰 Get Test MATIC

You need Mumbai testnet MATIC to deploy:

1. **Go to Mumbai Faucet:**
   - https://faucet.polygon.technology/
   - OR: https://mumbaifaucet.com/

2. **Select:**
   - Network: Mumbai
   - Token: MATIC

3. **Paste your wallet address**

4. **Complete CAPTCHA**

5. **Click Submit**

6. **Wait ~1 minute** for MATIC to arrive

**You need at least 0.5 MATIC for deployment.**

Check your balance in MetaMask (make sure you're on Mumbai network).

---

## 🚀 Deploy Contract

Once you have:
- ✅ Private key in `.env`
- ✅ Test MATIC in wallet

Run deployment:

```powershell
cd smart-contract
npm run deploy:mumbai
```

### Expected Output:

```
🚀 Starting TicketNFT deployment...

Deploying TicketNFT contract...
⏳ Waiting for deployment transaction...

✅ TicketNFT deployed successfully!
📍 Contract Address: 0x1234...5678
🔗 View on Polygonscan: https://mumbai.polygonscan.com/address/0x1234...5678

💾 Deployment info saved to: ../src/web3/deployment.json
📄 ABI saved to: ../src/web3/contractABI.json

✅ Deployment complete!
```

---

## 📝 After Deployment

The deploy script automatically:
1. ✅ Saves contract address to `src/web3/deployment.json`
2. ✅ Saves ABI to `src/web3/contractABI.json`

**You still need to manually update `.env`:**

Copy the contract address from the deployment output and add to `.env`:

```bash
CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
```

Then **restart your frontend dev server:**

```powershell
# Stop the server (Ctrl+C)
npm run dev
```

---

## 🧪 Test the Deployment

### 1. Check on Polygonscan
Visit: `https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS`

You should see:
- Contract creation transaction
- Contract code (after verification)
- Balance: 0 MATIC

### 2. Test in Your App

1. **Start backend:** `node backend/server.js`
2. **Start frontend:** `npm run dev`
3. **Open:** http://localhost:5173
4. **Connect wallet**
5. **Buy a ticket** - this will mint your first NFT!

---

## 🐛 Troubleshooting

### Error: "private key is required"
**Solution:** Add PRIVATE_KEY to `.env` file

### Error: "insufficient funds"
**Solution:** Get more test MATIC from faucet

### Error: "invalid private key"
**Solution:** 
- Check private key format (no "0x" prefix)
- Make sure it's 64 characters long
- Copy it again from MetaMask

### Error: "nonce too high"
**Solution:** 
- Reset your account in MetaMask:
  - Settings → Advanced → Clear activity tab data

### Deployment succeeds but frontend shows "Contract address not configured"
**Solution:**
- Update VITE_CONTRACT_ADDRESS in `.env`
- Restart frontend: `npm run dev`

---

## 📋 Alternative RPC URLs (if needed)

If the current RPC still doesn't work, try these alternatives:

### Option 1: Alchemy (Recommended)
1. Sign up at https://www.alchemy.com/
2. Create a Mumbai app
3. Copy the RPC URL
4. Update `.env`: `MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY`

### Option 2: Infura
1. Sign up at https://www.infura.io/
2. Create a Mumbai project
3. Copy the RPC URL
4. Update `.env`: `MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID`

### Option 3: Public Node (Current)
```
MUMBAI_RPC_URL=https://polygon-mumbai-bor-rpc.publicnode.com
```

### Option 4: Ankr
```
MUMBAI_RPC_URL=https://rpc.ankr.com/polygon_mumbai
```

---

## ✅ Deployment Checklist

Before deploying, make sure:

- [ ] PRIVATE_KEY is set in `.env`
- [ ] You have 0.5+ MATIC in your Mumbai wallet
- [ ] MetaMask is on Mumbai network
- [ ] RPC URL is updated to working endpoint
- [ ] You're in the `smart-contract` directory

Then run:
```powershell
npm run deploy:mumbai
```

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Smart contract live on Mumbai testnet
- ✅ Contract address saved
- ✅ ABI saved for frontend
- ✅ Ready to mint NFT tickets!

Next steps:
1. Update VITE_CONTRACT_ADDRESS in `.env`
2. Restart frontend
3. Connect wallet
4. Buy your first ticket! 🎫

---

**The RPC URL is now fixed. Just add your private key and you're ready to deploy!** 🚀
