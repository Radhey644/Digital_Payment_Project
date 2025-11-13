// Direct blockchain verification test - NO frontend code involved
// This proves data comes from blockchain, not hard-coded

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('\n🔍 BLOCKCHAIN VERIFICATION TEST\n');
  console.log('This script directly queries the blockchain WITHOUT any frontend code.');
  console.log('If data shows up, it proves it comes from blockchain, not hard-coded.\n');

  // Connect to LOCAL blockchain node
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  
  // Load contract details
  const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'web3', 'deployment.json'), 'utf8'));
  const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'web3', 'contractABI.json'), 'utf8'));
  
  console.log('📄 Contract Address:', deployment.address);
  console.log('🌐 RPC URL: http://127.0.0.1:8545');
  console.log('━'.repeat(60));

  const contract = new ethers.Contract(deployment.address, abi, provider);

  // Test 1: Get tickets for your wallet
  const yourWallet = '0x0a4fb907ac17bBf93C4E5Cacdc70feb9F0465521';
  console.log('\n✅ TEST 1: Get tickets owned by', yourWallet);
  const tokenIds = await contract.getTicketsByOwner(yourWallet);
  console.log('   Result from blockchain:', tokenIds.map(id => Number(id)));

  if (tokenIds.length === 0) {
    console.log('   ❌ No tickets found on blockchain for this address!');
    return;
  }

  // Test 2: Get details of first ticket
  const tokenId = Number(tokenIds[0]);
  console.log('\n✅ TEST 2: Get details for Token #' + tokenId);
  const details = await contract.getTicketDetails(tokenId);
  console.log('   Event Name:', details[1]);
  console.log('   Event Date:', details[2]);
  console.log('   Venue:', details[3]);
  console.log('   Current Owner:', details[5]);
  console.log('   Is Valid:', details[8]);

  // Test 3: Verify ticket ownership
  console.log('\n✅ TEST 3: Verify ticket ownership');
  const isValid = await contract.verifyTicket(tokenId, yourWallet);
  console.log('   verifyTicket(' + tokenId + ', ' + yourWallet + ')');
  console.log('   Blockchain says:', isValid ? '✅ VALID' : '❌ INVALID');

  // Test 4: Try with WRONG owner (should fail)
  console.log('\n✅ TEST 4: Try verifying with WRONG owner address');
  const wrongAddress = '0x0000000000000000000000000000000000000001';
  const wrongOwnerCheck = await contract.verifyTicket(tokenId, wrongAddress);
  console.log('   verifyTicket(' + tokenId + ', ' + wrongAddress + ')');
  console.log('   Blockchain says:', wrongOwnerCheck ? '✅ VALID' : '❌ INVALID (correct!)');

  // Test 5: Get current token counter
  console.log('\n✅ TEST 5: Get total tokens minted on blockchain');
  const currentTokenId = await contract.getCurrentTokenId();
  console.log('   Total tokens minted:', Number(currentTokenId));

  // Test 6: Check contract balance
  console.log('\n✅ TEST 6: Check contract balance (payments received)');
  const balance = await provider.getBalance(deployment.address);
  console.log('   Contract balance:', ethers.formatEther(balance), 'ETH');

  console.log('\n' + '━'.repeat(60));
  console.log('🎯 CONCLUSION:');
  console.log('   All data came DIRECTLY from blockchain smart contract.');
  console.log('   Contract address: ' + deployment.address);
  console.log('   No hard-coded data. No frontend. Pure blockchain query.');
  console.log('   If you transfer Token #' + tokenId + ' to another address,');
  console.log('   this script will immediately show the new owner!\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
