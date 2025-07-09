import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=== Deploying Fixed IDRX & Fundraisers ===");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy Fixed IDRX Token
  console.log("\n=== Deploying Fixed IDRX Token ===");
  const IDRXFactory = await ethers.getContractFactory("IDRX");
  const idrxToken = await IDRXFactory.deploy(deployer.address, deployer.address);
  await idrxToken.waitForDeployment();
  
  const idrxAddress = await idrxToken.getAddress();
  console.log("✅ Fixed IDRX deployed to:", idrxAddress);
  
  // Verify decimals immediately
  const decimals = await idrxToken.decimals();
  console.log("✅ Decimals confirmed:", decimals.toString());
  
  if (decimals.toString() !== "2") {
    console.log("❌ ERROR: Decimals is not 2!");
    return;
  }

  // Deploy Fundraisers Contract
  console.log("\n=== Deploying Fundraisers Contract ===");
  const FundraisersFactory = await ethers.getContractFactory("Fundraisers");
  const fundraisers = await FundraisersFactory.deploy(idrxAddress);
  await fundraisers.waitForDeployment();
  
  const fundraisersAddress = await fundraisers.getAddress();
  console.log("✅ Fundraisers deployed to:", fundraisersAddress);

  // Mint additional IDRX with correct decimals
  console.log("\n=== Minting Additional IDRX ===");
  const additionalAmount = ethers.parseUnits("100000", 2); // 100,000 IDRX dengan 2 decimals
  await idrxToken.mint(deployer.address, additionalAmount);
  
  const totalBalance = await idrxToken.balanceOf(deployer.address);
  console.log("✅ Total IDRX balance:", ethers.formatUnits(totalBalance, 2));

  // Test basic functionality
  console.log("\n=== Testing Token Functionality ===");
  
  // Test transfer
  const testAmount = ethers.parseUnits("1000", 2); // 1,000 IDRX
  const testTx = await idrxToken.transfer(deployer.address, testAmount); // Self transfer for testing
  await testTx.wait();
  console.log("✅ Transfer test successful");
  
  // Final verification
  const finalBalance = await idrxToken.balanceOf(deployer.address);
  console.log("✅ Final balance:", ethers.formatUnits(finalBalance, 2), "IDRX");
  
  // Save deployment info
  const deploymentInfo = {
    network: "lisk-sepolia",
    chainId: 4202,
    contracts: {
      idrx: {
        address: idrxAddress,
        decimals: decimals.toString(),
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
    totalIDRXMinted: ethers.formatUnits(finalBalance, 2)
  };

  console.log("\n=== 🎉 Fixed Deployment Summary ===");
  console.log("IDRX Token:", idrxAddress);
  console.log("IDRX Decimals:", decimals.toString());
  console.log("Fundraisers:", fundraisersAddress);
  console.log("Total IDRX:", ethers.formatUnits(finalBalance, 2));
  
  console.log("\n=== 🔗 Block Explorer ===");
  console.log("IDRX:", `https://sepolia-blockscout.lisk.com/address/${idrxAddress}`);
  console.log("Fundraisers:", `https://sepolia-blockscout.lisk.com/address/${fundraisersAddress}`);

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('deployment-fixed-lisk-sepolia.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📁 Deployment info saved to deployment-fixed-lisk-sepolia.json");
  
  console.log("\n=== Next Steps ===");
  console.log("1. Add IDRX to MetaMask with decimals = 2");
  console.log("2. Token Address:", idrxAddress);
  console.log("3. Export ABIs for frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });