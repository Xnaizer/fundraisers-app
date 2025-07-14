import { ethers } from "hardhat";

async function main() {
  const IDRX_ADDRESS = "0x24A7e58b751e42997c6f5f11165bD7FDcb3a9d80";
  
  const [deployer] = await ethers.getSigners();
  const idrxToken = await ethers.getContractAt("IDRX", IDRX_ADDRESS);
  
  console.log("=== IDRX Balance Check ===");
  console.log("Account:", deployer.address);
  
  const balance = await idrxToken.balanceOf(deployer.address);
  console.log("IDRX Balance:", ethers.formatUnits(balance, 2), "IDRX");
  
  // Check contract balances juga
  const FUNDRAISERS_ADDRESS = "0x9CfFD13D57c0E368098fdC73B20Fa333DB11E2E8";
  const contractBalance = await idrxToken.balanceOf(FUNDRAISERS_ADDRESS);
  console.log("Contract Balance:", ethers.formatUnits(contractBalance, 2), "IDRX");
  
  // Total supply
  const totalSupply = await idrxToken.totalSupply();
  console.log("Total Supply:", ethers.formatUnits(totalSupply, 2), "IDRX");
}

main().catch(console.error);