// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=== Deploying to Lisk Sepolia ===");
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance! You might need more ETH for deployment");
  }

  // Deploy IDRX Token first
  console.log("\n=== Deploying IDRX Token ===");
  const IDRXFactory = await ethers.getContractFactory("IDRX");
  
  console.log("Deploying IDRX...");
  const idrxToken = await IDRXFactory.deploy(deployer.address, deployer.address);
  await idrxToken.waitForDeployment();
  
  const idrxAddress = await idrxToken.getAddress();
  console.log("✅ IDRX Token deployed to:", idrxAddress);
  console.log("📄 Transaction hash:", idrxToken.deploymentTransaction()?.hash);

  // Deploy Fundraisers Contract
  console.log("\n=== Deploying Fundraisers Contract ===");
  const FundraisersFactory = await ethers.getContractFactory("Fundraisers");
  
  console.log("Deploying Fundraisers...");
  const fundraisers = await FundraisersFactory.deploy(idrxAddress);
  await fundraisers.waitForDeployment();
  
  const fundraisersAddress = await fundraisers.getAddress();
  console.log("✅ Fundraisers Contract deployed to:", fundraisersAddress);
  console.log("📄 Transaction hash:", fundraisers.deploymentTransaction()?.hash);

  // Mint additional IDRX tokens untuk testing
  console.log("\n=== Minting Additional IDRX Tokens ===");
  const additionalAmount = ethers.parseUnits("100000", 2); // 100,000 IDRX
  
  console.log("Minting additional tokens...");
  const mintTx = await idrxToken.mint(deployer.address, additionalAmount);
  await mintTx.wait();
  console.log("✅ Additional IDRX minted:", ethers.formatUnits(additionalAmount, 2));

  // Check final balance
  const deployerBalance = await idrxToken.balanceOf(deployer.address);
  console.log("📊 Total IDRX balance:", ethers.formatUnits(deployerBalance, 2));

  // Save deployment info
  const deploymentInfo = {
    network: "lisk-sepolia",
    chainId: 4202,
    contracts: {
      idrx: {
        address: idrxAddress,
        txHash: idrxToken.deploymentTransaction()?.hash,
        blockscoutUrl: `https://sepolia-blockscout.lisk.com/address/${idrxAddress}`
      },
      fundraisers: {
        address: fundraisersAddress,
        txHash: fundraisers.deploymentTransaction()?.hash,
        blockscoutUrl: `https://sepolia-blockscout.lisk.com/address/${fundraisersAddress}`
      }
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    totalIDRXMinted: ethers.formatUnits(deployerBalance, 2)
  };

  console.log("\n=== 🎉 Deployment Summary ===");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("IDRX Token:", deploymentInfo.contracts.idrx.address);
  console.log("Fundraisers:", deploymentInfo.contracts.fundraisers.address);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Total IDRX Minted:", deploymentInfo.totalIDRXMinted);
  
  console.log("\n=== 🔗 Block Explorer Links ===");
  console.log("IDRX Token:", deploymentInfo.contracts.idrx.blockscoutUrl);
  console.log("Fundraisers:", deploymentInfo.contracts.fundraisers.blockscoutUrl);

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('deployment-lisk-sepolia.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📁 Deployment info saved to deployment-lisk-sepolia.json");

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on Blockscout (optional)");
  console.log("2. Add IDRX token to your wallet:");
  console.log("   - Token Address:", idrxAddress);
  console.log("   - Token Symbol: IDRX");
  console.log("   - Decimals: 2");
  console.log("3. Export ABIs for frontend integration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });