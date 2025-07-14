import { ethers } from "hardhat";

async function main() {
  const IDRX_ADDRESS = "0x24A7e58b751e42997c6f5f11165bD7FDcb3a9d80";
  const YOUR_METAMASK_ADDRESS = "0x3ff8C245C6499062A98Ed214EA606Ec5fa2627Dd"; // GANTI INI!
  
  const [deployer] = await ethers.getSigners();
  const idrxToken = await ethers.getContractAt("IDRX", IDRX_ADDRESS);
  
  console.log("=== Transferring IDRX to MetaMask ===");
  console.log("From (Deployer):", deployer.address);
  console.log("To (MetaMask):", YOUR_METAMASK_ADDRESS);
  
  // Check balances before
  const deployerBefore = await idrxToken.balanceOf(deployer.address);
  const metaMaskBefore = await idrxToken.balanceOf(YOUR_METAMASK_ADDRESS);
  
  console.log("\n=== Before Transfer ===");
  console.log("Deployer Balance:", ethers.formatUnits(deployerBefore, 2), "IDRX");
  console.log("MetaMask Balance:", ethers.formatUnits(metaMaskBefore, 2), "IDRX");
  
  // Transfer 50,000 IDRX
  const transferAmount = ethers.parseUnits("50000", 2);
  console.log("\nTransferring:", ethers.formatUnits(transferAmount, 2), "IDRX");
  
  const tx = await idrxToken.transfer(YOUR_METAMASK_ADDRESS, transferAmount);
  console.log("Transaction Hash:", tx.hash);
  console.log("🔗 Explorer:", `https://sepolia-blockscout.lisk.com/tx/${tx.hash}`);
  
  console.log("Waiting for confirmation...");
  await tx.wait();
  console.log("✅ Transfer confirmed!");
  
  // Check balances after
  const deployerAfter = await idrxToken.balanceOf(deployer.address);
  const metaMaskAfter = await idrxToken.balanceOf(YOUR_METAMASK_ADDRESS);
  
  console.log("\n=== After Transfer ===");
  console.log("Deployer Balance:", ethers.formatUnits(deployerAfter, 2), "IDRX");
  console.log("MetaMask Balance:", ethers.formatUnits(metaMaskAfter, 2), "IDRX");
}

main().catch(console.error);