import { ethers } from "hardhat";

async function main() {
  const IDRX_ADDRESS = "0x24A7e58b751e42997c6f5f11165bD7FDcb3a9d80";
  
  // Multiple recipients
  const recipients = [
    {
      address: "0xCb0C37D66368EF6693A82f06F24ce31D7533C088",
      amount: "1000000000000000000000000" // 1 million IDRX
    },
    {
      address: "0x3ff8C245C6499062A98Ed214EA606Ec5fa2627Dd",
      amount: "2000000" // 2 million IDRX
    }
    // Tambahkan alamat lain jika diperlukan
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