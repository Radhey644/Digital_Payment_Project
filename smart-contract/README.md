# NFT Ticketing System - Smart Contract

## 📝 Overview
This smart contract implements an ERC-721 based NFT ticketing system on the Polygon Mumbai Testnet.

## 🚀 Features
- **Mint Tickets**: Create unique NFT tickets for events
- **Transfer Tickets**: Resell or transfer tickets to other users
- **Verify Ownership**: Check ticket validity and ownership
- **Event Management**: Track tickets by event
- **Secure Payments**: Handle ticket purchases with refunds

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp ../.env.example ../.env
```

3. Configure your `.env` file with:
   - `PRIVATE_KEY`: Your wallet private key (from MetaMask)
   - `MUMBAI_RPC_URL`: Polygon Mumbai RPC endpoint
   - `POLYGONSCAN_API_KEY`: For contract verification

## 📦 Compilation

Compile the smart contract:
```bash
npm run compile
```

## 🚀 Deployment

### Deploy to Local Hardhat Network:
```bash
# Start local node in one terminal
npm run node

# Deploy in another terminal
npm run deploy:local
```

### Deploy to Polygon Mumbai Testnet:
```bash
npm run deploy:mumbai
```

After deployment:
- Contract address will be saved to `../src/web3/deployment.json`
- Contract ABI will be saved to `../src/web3/contractABI.json`

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📋 Contract Functions

### Main Functions:

**mintTicket(to, eventId, eventName, eventDate, venue, price, tokenURI)**
- Mint a new ticket NFT for an event
- Requires payment in MATIC

**transferTicket(to, tokenId)**
- Transfer ticket to another address
- Only ticket owner can call

**getTicketDetails(tokenId)**
- Get complete details of a ticket
- Returns event info, owners, validity status

**verifyTicket(tokenId, owner)**
- Verify if a ticket is valid and owned by an address
- Used for entry verification

**getTicketsByOwner(owner)**
- Get all tickets owned by an address
- Returns array of token IDs

**getEventTickets(eventId)**
- Get all tickets for a specific event

## 🔐 Security Features
- OpenZeppelin ERC-721 implementation
- Owner-only admin functions
- Payment validation and refunds
- Ticket invalidation capability

## 📄 License
MIT
