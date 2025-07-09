import { ethers } from "hardhat";

async function main() {
  // Address dari deployment Anda
  const IDRX_ADDRESS = "0x56553628F2Ec5f32674733Db8C54BF47f3822ff0";
  const FUNDRAISERS_ADDRESS = "0x9CfFD13D57c0E368098fdC73B20Fa333DB11E2E8";
  
  const [deployer] = await ethers.getSigners();
  
  console.log("=== Testing on Lisk Sepolia ===");
  console.log("Tester account:", deployer.address);
  
  // Connect to contracts
  const idrxToken = await ethers.getContractAt("IDRX", IDRX_ADDRESS);
  const fundraisers = await ethers.getContractAt("Fundraisers", FUNDRAISERS_ADDRESS);
  
  // Check IDRX balance
  const balance = await idrxToken.balanceOf(deployer.address);
  console.log("IDRX Balance:", ethers.formatUnits(balance, 2));
  
  // Create a test program
  console.log("\n1. Creating test program...");
  const programInput = {
    name: "Test Education Program on Lisk",
    picName: "Test PIC",
    target: ethers.parseUnits("1000", 2), // 1,000 IDRX
    desc: "A test program for Lisk Sepolia",
    pic: deployer.address, // Using deployer as PIC for testing
    category: "Education",
    programLink: "https://test-program.com",
    photoUrl: "https://example.com/test.jpg"
  };
  
  const createTx = await fundraisers.createProgram(programInput);
  await createTx.wait();
  console.log("✅ Program created, tx:", createTx.hash);
  
  // Send funds
  console.log("\n2. Sending funds to contract...");
  const donationAmount = ethers.parseUnits("1500", 2); // 1,500 IDRX
  
  const approveTx = await idrxToken.approve(FUNDRAISERS_ADDRESS, donationAmount);
  await approveTx.wait();
  console.log("✅ Approval tx:", approveTx.hash);
  
  const sendTx = await fundraisers.sendFund(donationAmount);
  await sendTx.wait();
  console.log("✅ Fund sent, tx:", sendTx.hash);
  
  // Allocate funds
  console.log("\n3. Allocating funds...");
  const allocateTx = await fundraisers.allocateFund(0);
  await allocateTx.wait();
  console.log("✅ Fund allocated, tx:", allocateTx.hash);
  
  // Withdraw some funds as PIC
  console.log("\n4. Withdrawing funds as PIC...");
  const withdrawAmount = ethers.parseUnits("500", 2); // 500 IDRX
  const withdrawTx = await fundraisers.withdrawFund(0, "Buying educational materials", withdrawAmount);
  await withdrawTx.wait();
  console.log("✅ Fund withdrawn, tx:", withdrawTx.hash);
  
  // Check program status
  const programs = await fundraisers.getAllProgram();
  console.log("\n📊 Program Status:");
  console.log("Name:", programs[0].name);
  console.log("Status:", programs[0].status.toString()); // Should be 2 (ALLOCATED)
  console.log("Target:", ethers.formatUnits(programs[0].target, 2), "IDRX");
  console.log("Allocated:", ethers.formatUnits(programs[0].allocated, 2), "IDRX");
  
  // Check withdrawal history
  const history = await fundraisers.getProgramHistory(0);
  console.log("\n📜 Withdrawal History:");
  console.log("Total withdrawals:", history.length);
  if (history.length > 0) {
    history.forEach((h, i) => {
      console.log(`${i + 1}. ${ethers.formatUnits(h.amount, 2)} IDRX - ${h.history} (${new Date(Number(h.timestamp) * 1000).toLocaleString()})`);
    });
  }
  
  // Check total managed fund
  const totalManagedFund = await fundraisers.totalManagedFund();
  const totalAllocated = await fundraisers.totalAllocated();
  console.log("\n💰 Contract Stats:");
  console.log("Total Managed Fund:", ethers.formatUnits(totalManagedFund, 2), "IDRX");
  console.log("Total Allocated:", ethers.formatUnits(totalAllocated, 2), "IDRX");
  console.log("Available for Allocation:", ethers.formatUnits(totalManagedFund - totalAllocated, 2), "IDRX");
  
  console.log("\n🎉 All tests completed successfully!");
  console.log("🔗 View transactions on: https://sepolia-blockscout.lisk.com");
}

main().catch(console.error);