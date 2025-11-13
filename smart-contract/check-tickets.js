// Quick check: print tickets owned by provided address on localhost
const { ethers } = require('ethers');
const path = require('path');
const deployment = require(path.join(__dirname, '..', 'src', 'web3', 'deployment.json'));
const abi = require(path.join(__dirname, '..', 'src', 'web3', 'contractABI.json'));

async function main() {
  const addr = process.argv[2];
  if (!addr) {
    console.error('Usage: node check-tickets.js <ownerAddress>');
    process.exit(1);
  }
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const contract = new ethers.Contract(deployment.address, abi, provider);
  const ids = await contract.getTicketsByOwner(addr);
  console.log('Owner', addr, 'tokenIds:', ids.map((x)=>Number(x)));
}

main().catch((e)=>{ console.error(e); process.exit(1); });
