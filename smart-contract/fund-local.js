// Fund a target address on the local Hardhat network from the first signer
// Usage: npx hardhat run fund-local.js --network localhost [recipient] [amountEth]
// Defaults: recipient = your known address, amount = 100 ETH

const hre = require("hardhat");

async function main() {
  const args = process.argv.slice(2);

  const defaultRecipient = "0x0a4fb907ac17bBf93C4E5Cacdc70feb9F0465521";
  const recipient = args[0] || process.env.RECIPIENT || defaultRecipient;
  const amountEth = args[1] || process.env.AMOUNT_ETH || "100.0";

  if (!recipient) {
    throw new Error("Recipient address not provided");
  }

  const [sender] = await hre.ethers.getSigners();
  const senderAddr = await sender.getAddress();
  const senderBalBefore = await hre.ethers.provider.getBalance(senderAddr);

  console.log("\n🔌 Network:", (await hre.ethers.provider.getNetwork()).name);
  console.log("👤 From:", senderAddr);
  console.log("🏦 Sender balance:", hre.ethers.formatEther(senderBalBefore), "ETH");
  console.log("👥 To:", recipient);
  console.log("💸 Amount:", amountEth, "ETH\n");

  const tx = await sender.sendTransaction({
    to: recipient,
    value: hre.ethers.parseEther(amountEth),
  });

  console.log("⛓️  Tx submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Tx mined in block", receipt.blockNumber);

  const recipientBal = await hre.ethers.provider.getBalance(recipient);
  console.log("🏁 Recipient balance now:", hre.ethers.formatEther(recipientBal), "ETH\n");
}

main().catch((err) => {
  console.error("❌ Funding failed:", err);
  process.exit(1);
});
