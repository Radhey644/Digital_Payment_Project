// Mint test tickets on local Hardhat blockchain for testing My Tickets and Transfer pages
// Usage:
//   npx hardhat run mint-test-tickets.js --network localhost
//   npx hardhat run mint-test-tickets.js --network localhost -- 0xYourAddress  -> mints to a specific address

const hre = require("hardhat");

async function main() {
  console.log("\n🎫 Minting Test Tickets on Localhost Blockchain...\n");

  const args = process.argv.slice(2);
  const explicitRecipient = args.find((a) => /^0x[0-9a-fA-F]{40}$/.test(a));

  // Force provider to the running localhost node so minted tokens persist
  const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const provider = new hre.ethers.JsonRpcProvider(RPC_URL);
  // Hardhat default Account #0 private key (local only)
  const PK0 = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const PK1 = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
  const PK2 = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';
  const account0 = new hre.ethers.Wallet(PK0, provider);
  const account1 = new hre.ethers.Wallet(PK1, provider);
  const account2 = new hre.ethers.Wallet(PK2, provider);

  console.log("👤 Using Accounts:");
  console.log("   Account #0:", await account0.getAddress());
  console.log("   Account #1:", await account1.getAddress());
  console.log("   Account #2:", await account2.getAddress());

  // Get deployed contract address from deployment.json
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'src', 'web3', 'deployment.json');
  
  let contractAddress;
  try {
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    contractAddress = deploymentData.address;
    console.log("\n📄 Contract Address:", contractAddress);
  } catch (err) {
    console.error("❌ Could not read deployment.json. Make sure contract is deployed.");
    console.error("   Run: npx hardhat run deploy.js --network localhost");
    process.exit(1);
  }

  // Get contract ABI
  const abiPath = path.join(__dirname, '..', 'src', 'web3', 'contractABI.json');
  const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

  // Connect to contract via the local provider
  const contract = new hre.ethers.Contract(contractAddress, contractABI, account0);

  // Build tickets list
  let testTickets;
  if (explicitRecipient) {
    console.log(`📌 Recipient override detected: ${explicitRecipient}`);
    testTickets = [
      { to: explicitRecipient, eventId: 1, eventName: "Coldplay Live Concert", eventDate: "2025-12-15", venue: "JLN Stadium, Delhi", price: 0, tokenURI: "https://ticketnft.example.com/metadata/1" },
      { to: explicitRecipient, eventId: 2, eventName: "IPL Final Match", eventDate: "2025-11-30", venue: "Wankhede Stadium, Mumbai", price: 0, tokenURI: "https://ticketnft.example.com/metadata/2" },
      { to: explicitRecipient, eventId: 3, eventName: "Tech Summit 2025", eventDate: "2025-12-01", venue: "Bangalore International Convention Centre", price: 0, tokenURI: "https://ticketnft.example.com/metadata/3" },
    ];
  } else {
    // Default: spread across local accounts to demonstrate transfers
    testTickets = [
      { to: await account0.getAddress(), eventId: 1, eventName: "Coldplay Live Concert", eventDate: "2025-12-15", venue: "JLN Stadium, Delhi", price: 0, tokenURI: "https://ticketnft.example.com/metadata/1" },
      { to: await account0.getAddress(), eventId: 2, eventName: "IPL Final Match", eventDate: "2025-11-30", venue: "Wankhede Stadium, Mumbai", price: 0, tokenURI: "https://ticketnft.example.com/metadata/2" },
      { to: await account0.getAddress(), eventId: 3, eventName: "Tech Summit 2025", eventDate: "2025-12-01", venue: "Bangalore International Convention Centre", price: 0, tokenURI: "https://ticketnft.example.com/metadata/3" },
      { to: await account1.getAddress(), eventId: 1, eventName: "Coldplay Live Concert", eventDate: "2025-12-15", venue: "JLN Stadium, Delhi", price: 0, tokenURI: "https://ticketnft.example.com/metadata/4" },
      { to: await account0.getAddress(), eventId: 4, eventName: "Arijit Singh Live", eventDate: "2025-12-20", venue: "Thyagaraj Stadium, Delhi", price: 0, tokenURI: "https://ticketnft.example.com/metadata/5" }
    ];
  }

  console.log("\n🔨 Minting tickets...\n");

  const mintedTokens = [];

  for (let i = 0; i < testTickets.length; i++) {
    const ticket = testTickets[i];
    try {
      console.log(`   Minting ticket ${i + 1}/${testTickets.length}...`);
      console.log(`   Event: ${ticket.eventName}`);
      console.log(`   To: ${ticket.to}`);

  const priceInWei = hre.ethers.parseEther(ticket.price.toString());
      
      const tx = await contract.mintTicket(
        ticket.to,
        ticket.eventId,
        ticket.eventName,
        ticket.eventDate,
        ticket.venue,
        priceInWei,
        ticket.tokenURI,
        { value: priceInWei }
      );

      const receipt = await tx.wait();
      
      // Extract tokenId from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'TicketMinted';
        } catch {
          return false;
        }
      });

      let tokenId = i + 1; // Default
      if (event) {
        const parsed = contract.interface.parseLog(event);
        tokenId = Number(parsed.args.tokenId);
      }

      mintedTokens.push({
        tokenId,
        eventName: ticket.eventName,
        owner: ticket.to,
        txHash: receipt.hash
      });

      console.log(`   ✅ Token #${tokenId} minted (tx: ${receipt.hash.substring(0, 10)}...)\n`);

    } catch (err) {
      console.error(`   ❌ Failed to mint ticket ${i + 1}:`, err.message);
    }
  }

  // Now transfer some tickets to create transfer history
  if (!explicitRecipient) {
    console.log("🔄 Creating transfer transactions...\n");
    try {
      // Transfer Token #2 from Account #0 to Account #1
      console.log("   Transferring Token #2: Account #0 → Account #1");
      const transferTx1 = await contract.transferTicket(await account1.getAddress(), 2);
      await transferTx1.wait();
      console.log("   ✅ Transfer complete\n");

      // Transfer Token #3 from Account #0 to Account #2
      console.log("   Transferring Token #3: Account #0 → Account #2");
      const transferTx2 = await contract.transferTicket(await account2.getAddress(), 3);
      await transferTx2.wait();
      console.log("   ✅ Transfer complete\n");
    } catch (err) {
      console.error("   ❌ Transfer failed:", err.message);
    }
  }

  // Summary
  console.log("\n📊 Summary:");
  console.log(`   Total tickets minted: ${mintedTokens.length}`);
  console.log(`   Transfers completed: 2`);
  
  console.log("\n🎟️  Current Ticket Ownership:");
  if (explicitRecipient) {
    console.log(`   Recipient (${explicitRecipient.substring(0, 10)}...): Tokens just minted above`);
  } else {
    console.log(`   Account #0 (${(await account0.getAddress()).substring(0, 10)}...): Tokens #1, #5`);
    console.log(`   Account #1 (${(await account1.getAddress()).substring(0, 10)}...): Tokens #2, #4`);
    console.log(`   Account #2 (${(await account2.getAddress()).substring(0, 10)}...): Token #3`);
  }

  console.log("\n✨ Test tickets minted successfully!");
  console.log("\n💡 Next steps:");
  console.log("   1. Import Account #0 private key in MetaMask (if needed):");
  console.log("      0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("   2. Make sure you're on Localhost 8545 network (Chain ID 1337)");
  if (explicitRecipient) {
    console.log("   3. Open the dApp with that wallet connected → My Tickets should show new tokens");
  } else {
    console.log("   3. Visit My Tickets page - you should see 2 tickets (Tokens #1, #5)");
    console.log("   4. Visit Transfer page - you can transfer these tickets\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
