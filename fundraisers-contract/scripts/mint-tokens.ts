import { ethers } from "hardhat";

async function main() {
  const IDRX_ADDRESS = "0x9dcf868Cdf175b31C7288D5eC407E591bf1a9bdD";
  
  // Multiple recipients
  const recipients = [
    {
      address: "0x164FFFBf2eA7094fF39c140C136e16497F0fd00D",
      amount: "30000000" 
    },
    {
      address: "0x70c4652cd86D9686CcF5F2C6F98c89677a67509e",
      amount: "100000000" 
    },
    {
      address: "0xCc59c77D64C3Cb032831251041a7D9F0d8395FC1",
      amount: "50000000" 
    },
    {
      address: "0x4Fd3FF28Afbc25fDE4E433df061A6dc0eF1f160c",
      amount: "30000000" 
    }
   
  ];
  
  const [deployer] = await ethers.getSigners();
  const idrxToken = await ethers.getContractAt("IDRX", IDRX_ADDRESS);
  
  console.log("=== Batch Minting IDRX Tokens ===");
  console.log("Minter:", deployer.address);
  console.log("Recipients:", recipients.length);
  
  const totalSupplyBefore = await idrxToken.totalSupply();
  console.log("Total Supply Before:", ethers.formatUnits(totalSupplyBefore, 2), "IDRX");
  
  console.log("\n=== Minting Process ===");
  
  let totalMinted = 0n;
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const mintAmount = ethers.parseUnits(recipient.amount, 2);
    
    console.log(`\n[${i + 1}/${recipients.length}] Minting to: ${recipient.address}`);
    console.log("Amount:", ethers.formatUnits(mintAmount, 2), "IDRX");
    
    try {
      const balanceBefore = await idrxToken.balanceOf(recipient.address);
      
      const tx = await idrxToken.mint(recipient.address, mintAmount);
      console.log("TX Hash:", tx.hash);
      
      await tx.wait();
      console.log("✅ Confirmed");
      
      const balanceAfter = await idrxToken.balanceOf(recipient.address);
      console.log("Balance:", 
        ethers.formatUnits(balanceBefore, 2), "→", 
        ethers.formatUnits(balanceAfter, 2), "IDRX"
      );
      
      totalMinted += mintAmount;
      
    } catch (error: any) {
      console.log("❌ Failed:", error.message);
    }
  }
  
  const totalSupplyAfter = await idrxToken.totalSupply();
  
  console.log("\n=== Final Summary ===");
  console.log("Total Minted:", ethers.formatUnits(totalMinted, 2), "IDRX");
  console.log("Total Supply After:", ethers.formatUnits(totalSupplyAfter, 2), "IDRX");
  console.log("Supply Increase:", ethers.formatUnits(totalSupplyAfter - totalSupplyBefore, 2), "IDRX");
}

main().catch(console.error);