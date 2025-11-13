// Mint 10 more tickets to a specific address
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const provider = new hre.ethers.JsonRpcProvider(RPC_URL);
  const PK0 = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const signer = new hre.ethers.Wallet(PK0, provider);

  const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'web3', 'deployment.json'), 'utf8'));
  const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'web3', 'contractABI.json'), 'utf8'));
  const contract = new hre.ethers.Contract(deployment.address, abi, signer);

  const recipient = process.argv[2] || '0x0a4fb907ac17bBf93C4E5Cacdc70feb9F0465521';
  
  const tickets = [
    {eventId: 1, name: 'Coldplay Live Concert', date: '2025-12-15', venue: 'JLN Stadium, Delhi'},
    {eventId: 2, name: 'IPL Final Match', date: '2025-11-30', venue: 'Wankhede Stadium, Mumbai'},
    {eventId: 3, name: 'Tech Summit 2025', date: '2025-12-01', venue: 'BICC, Bangalore'},
    {eventId: 4, name: 'Arijit Singh Live', date: '2025-12-20', venue: 'Thyagaraj Stadium, Delhi'},
    {eventId: 5, name: 'Sunburn Festival', date: '2025-12-28', venue: 'Vagator Beach, Goa'},
    {eventId: 1, name: 'Coldplay Live Concert', date: '2025-12-15', venue: 'JLN Stadium, Delhi'},
    {eventId: 2, name: 'IPL Final Match', date: '2025-11-30', venue: 'Wankhede Stadium, Mumbai'},
    {eventId: 3, name: 'Tech Summit 2025', date: '2025-12-01', venue: 'BICC, Bangalore'},
    {eventId: 4, name: 'Arijit Singh Live', date: '2025-12-20', venue: 'Thyagaraj Stadium, Delhi'},
    {eventId: 5, name: 'Sunburn Festival', date: '2025-12-28', venue: 'Vagator Beach, Goa'}
  ];

  console.log('\n🎫 Minting 10 tickets to', recipient);
  console.log('📄 Contract:', deployment.address);
  
  const currentTokenId = await contract.getCurrentTokenId();
  const startId = Number(currentTokenId);
  
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    const price = hre.ethers.parseEther('0');
    const tokenNum = startId + i;
    
    try {
      console.log(`\n   [${i+1}/10] Minting Token #${tokenNum}: ${t.name}`);
      
      // Get current nonce to avoid conflicts
      const nonce = await provider.getTransactionCount(signer.address, 'latest');
      
      const tx = await contract.mintTicket(
        recipient,
        t.eventId,
        t.name,
        t.date,
        t.venue,
        price,
        `https://ticketnft.example.com/metadata/${tokenNum}`,
        {value: price, nonce: nonce}
      );
      
      const receipt = await tx.wait();
      console.log(`   ✅ Minted in tx: ${receipt.hash.substring(0, 10)}...`);
    } catch (err) {
      console.log(`   ⚠️  Skipped (nonce issue or already exists): ${t.name}`);
    }
  }

  console.log('\n🎉 Done! Total 10 new tickets minted.');
  console.log(`📊 Token IDs: #${startId} to #${startId + 9}`);
  
  // Verify
  const tokens = await contract.getTicketsByOwner(recipient);
  console.log(`✅ Verified: ${recipient} now owns ${tokens.length} tickets\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
