const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting TicketNFT deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Deploy the TicketNFT contract
  console.log("⏳ Deploying TicketNFT contract...");
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy();
  
  await ticketNFT.waitForDeployment();
  const contractAddress = await ticketNFT.getAddress();
  
  console.log("✅ TicketNFT deployed to:", contractAddress);
  console.log("🔗 Transaction hash:", ticketNFT.deploymentTransaction().hash);
  console.log("\n📊 Contract Details:");
  console.log("   - Network:", hre.network.name);
  console.log("   - Contract Name: TicketNFT");
  console.log("   - Symbol: ETIX");
  console.log("   - Owner:", deployer.address);

  // Save contract address and ABI for frontend
  const contractData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: ticketNFT.deploymentTransaction().hash,
  };

  // Create deployment info directory
  const deploymentDir = path.join(__dirname, "..", "src", "web3");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentDir, "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(contractData, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Save contract ABI
  const artifactPath = path.join(__dirname, "artifacts", "contracts", "TicketNFT.sol", "TicketNFT.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiPath = path.join(deploymentDir, "contractABI.json");
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log("💾 Contract ABI saved to:", abiPath);
  }

  // Verify on Polygonscan (optional, for Mumbai testnet)
  if (hre.network.name === "mumbai") {
    console.log("\n⏳ Waiting for block confirmations...");
    await ticketNFT.deploymentTransaction().wait(6); // Wait for 6 confirmations
    
    console.log("🔍 Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      if (error.message.includes("already verified")) {
        console.log("ℹ️  Contract already verified");
      } else {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
  }

  console.log("\n✨ Deployment completed successfully!\n");
  console.log("📋 Next steps:");
  console.log("   1. Update your .env file with the contract address");
  console.log("   2. Fund your deployer account with test MATIC");
  console.log("   3. Start the backend server");
  console.log("   4. Launch the frontend application");
  console.log("\n🎉 Happy ticketing!\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
