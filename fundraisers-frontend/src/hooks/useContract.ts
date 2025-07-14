import { ethers, Contract } from "ethers";
import {
  IDRX_ABI,
  FUNDRAISERS_ABI,
  CONTRACT_ADDRESSES,
  ContractName,
  ProgramData,
  Program,
} from "../../contracts/contractConfig";

// Types untuk error handling
interface BlockchainError extends Error {
  code?: string | number;
  data?: unknown;
  reason?: string;
}

// Types untuk Ethereum provider
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Types untuk history dan response
interface ProgramHistory {
  timestamp: bigint;
  history: string;
  amount: bigint;
}

interface FundAllocationStatus {
  totalManaged: string;
  totalAllocated: string;
  remainingForAllocation: string;
  contractBalance: string;
}

interface UseContractReturn {
  // IDRX Token Functions
  getIDRXBalance: (userAddress?: string) => Promise<string>;
  getIDRXTotalSupply: () => Promise<string>;
  getIDRXAllowance: (owner: string, spender: string) => Promise<string>;
  approveIDRX: (spender: string, amount: string) => Promise<string>;
  transferIDRX: (to: string, amount: string) => Promise<string>;
  mintIDRX: (to: string, amount: string) => Promise<string>;
  
  // Fundraisers Contract Functions - Admin Only
  createProgram: (programData: ProgramData) => Promise<string>;
  updateProgram: (programId: number, programData: ProgramData) => Promise<string>;
  deactivateProgram: (programId: number) => Promise<string>;
  allocateFund: (programId: number) => Promise<string>;
  markProgramAsFinished: (programId: number) => Promise<string>;
  
  // Fundraisers Contract Functions - PIC Only
  withdrawFund: (programId: number, history: string, amount: string) => Promise<string>;
  
  // Fundraisers Contract Functions - Public
  sendDonation: (amount: number | string) => Promise<string>;
  getAllPrograms: () => Promise<Program[]>;
  getProgramById: (programId: number) => Promise<Program | null>;
  getProgramHistory: (programId: number) => Promise<ProgramHistory[]>;
  getTotalManagedFund: () => Promise<string>;
  getTotalAllocated: () => Promise<string>;
  getTotalProgramsCreated: () => Promise<number>;
  getContractOwner: () => Promise<string>;
  getIDRXTokenAddress: () => Promise<string>;
  
  // New Fund Management Functions
  getRemainingFundForAllocation: () => Promise<string>;
  getContractIDRXBalance: () => Promise<string>;
  getFundAllocationStatus: () => Promise<FundAllocationStatus>;
  
  // Utility Functions
  getContract: (contractName: ContractName) => Promise<Contract>;
  isWalletConnected: () => boolean;
  getCurrentAddress: () => Promise<string | null>;
  checkConnection: () => Promise<boolean>;
  switchToLiskSepolia: () => Promise<boolean>;
  
  // Read-only functions (tidak perlu wallet connection)
  getTotalManagedFundPublic: () => Promise<string>;
  getTotalAllocatedPublic: () => Promise<string>;
  getTotalProgramsCreatedPublic: () => Promise<number>;
  getAllProgramsPublic: () => Promise<Program[]>;
  getProgramByIdPublic: (programId: number) => Promise<Program | null>;
  getProgramHistoryPublic: (programId: number) => Promise<ProgramHistory[]>;
  getContractOwnerPublic: () => Promise<string>;
  getIDRXTokenAddressPublic: () => Promise<string>;
  getIDRXBalancePublic: (userAddress: string) => Promise<string>;
  getIDRXTotalSupplyPublic: () => Promise<string>;
}

export const useContract = (): UseContractReturn => {
  const LISK_SEPOLIA_CHAIN_ID = 4202;
  const RPC_URL = "https://rpc.sepolia-api.lisk.com";

  // Read-only provider (tidak perlu wallet connection)
  const getReadOnlyProvider = () => {
    return new ethers.JsonRpcProvider(RPC_URL);
  };

  // Read-only contract (tidak perlu signer)
  const getReadOnlyContract = (contractName: ContractName): Contract => {
    const provider = getReadOnlyProvider();
    const abi = contractName === "IDRX" ? IDRX_ABI : FUNDRAISERS_ABI;
    const address = CONTRACT_ADDRESSES[contractName];

    return new ethers.Contract(address, abi, provider);
  };

  const isWalletConnected = (): boolean => {
    return !!window.ethereum;
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      if (!window.ethereum) return false;
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      }) as string[];
      return accounts.length > 0;
    } catch (error) {
      console.error("Error checking connection:", error);
      return false;
    }
  };

  const getCurrentAddress = async (): Promise<string | null> => {
    try {
      if (!window.ethereum) return null;
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      }) as string[];
      return accounts[0] || null;
    } catch (error) {
      console.error("Error getting current address:", error);
      return null;
    }
  };

  const switchToLiskSepolia = async (): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        throw new Error("No wallet provider found");
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${LISK_SEPOLIA_CHAIN_ID.toString(16)}` }],
      });

      return true;
    } catch (error) {
      const blockchainError = error as BlockchainError;
      if (blockchainError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${LISK_SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Lisk Sepolia',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: [RPC_URL],
              blockExplorerUrls: ['https://sepolia-blockscout.lisk.com']
            }]
          });
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          return false;
        }
      } else {
        console.error("Error switching network:", error);
        return false;
      }
    }
  };

  const getContract = async (contractName: ContractName): Promise<Contract> => {
    console.log("🔧 Getting contract:", contractName);

    if (!window.ethereum) {
      console.error("❌ No wallet provider found");
      throw new Error(
        "No wallet provider available. Please connect your wallet."
      );
    }

    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error(
        "Wallet not connected. Please connect your wallet first."
      );
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("✅ Provider created");

      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("✅ Signer obtained:", signerAddress);

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      console.log("🌐 Current network:", chainId);

      if (chainId !== LISK_SEPOLIA_CHAIN_ID) {
        const switched = await switchToLiskSepolia();
        if (!switched) {
          throw new Error(
            `Wrong network. Please switch to Lisk Sepolia (Chain ID: 4202). Current: ${chainId}`
          );
        }
      }

      const abi = contractName === "IDRX" ? IDRX_ABI : FUNDRAISERS_ABI;
      const address = CONTRACT_ADDRESSES[contractName];

      if (!Array.isArray(abi) || abi.length === 0) {
        throw new Error(`Invalid ABI for ${contractName}`);
      }

      if (!ethers.isAddress(address)) {
        throw new Error(
          `Invalid contract address for ${contractName}: ${address}`
        );
      }

      const contract = new ethers.Contract(address, abi, signer);
      console.log("✅ Contract created successfully");

      return contract;
    } catch (error) {
      console.error("❌ Error in getContract:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to get contract ${contractName}: ${errorMessage}`
      );
    }
  };

  // ========================================
  // IDRX TOKEN FUNCTIONS - SEMUA MENGGUNAKAN 2 DECIMALS
  // ========================================

  const getIDRXBalance = async (userAddress?: string): Promise<string> => {
    try {
      console.log("🔍 Getting IDRX balance...");

      const isConnected = await checkConnection();
      if (!isConnected && !userAddress) {
        console.warn("⚠️ Wallet not connected, returning 0");
        return "0";
      }

      let targetAddress = userAddress;
      if (!targetAddress) {
        const currentAddress = await getCurrentAddress();
        if (!currentAddress) {
          console.warn("⚠️ No wallet address available, returning 0");
          return "0";
        }
        targetAddress = currentAddress;
      }

      if (!ethers.isAddress(targetAddress)) {
        throw new Error("Invalid user address");
      }

      const contract = userAddress ? getReadOnlyContract("IDRX") : await getContract("IDRX");
      const balance = await contract.balanceOf(targetAddress) as bigint;

      console.log("✅ Raw balance:", balance.toString());
      const formatted = ethers.formatUnits(balance, 2); // TETAP 2 DECIMALS
      console.log("✅ Formatted balance:", formatted);

      return formatted;
    } catch (error) {
      console.error("❌ Error getting IDRX balance:", error);
      return "0";
    }
  };

  const getIDRXBalancePublic = async (userAddress: string): Promise<string> => {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      const contract = getReadOnlyContract("IDRX");
      const balance = await contract.balanceOf(userAddress) as bigint;
      return ethers.formatUnits(balance, 2); // UBAH DARI 18 KE 2
    } catch (error) {
      console.error("❌ Error getting IDRX balance (public):", error);
      return "0";
    }
  };

  const getIDRXTotalSupply = async (): Promise<string> => {
    try {
      const contract = await getContract("IDRX");
      const totalSupply = await contract.totalSupply() as bigint;
      return ethers.formatUnits(totalSupply, 2); // UBAH DARI 18 KE 2
    } catch (error) {
      console.error("❌ Error getting IDRX total supply:", error);
      return "0";
    }
  };

  const getIDRXTotalSupplyPublic = async (): Promise<string> => {
    try {
      const contract = getReadOnlyContract("IDRX");
      const totalSupply = await contract.totalSupply() as bigint;
      return ethers.formatUnits(totalSupply, 2); // UBAH DARI 18 KE 2
    } catch (error) {
      console.error("❌ Error getting IDRX total supply (public):", error);
      return "0";
    }
  };

  const getIDRXAllowance = async (owner: string, spender: string): Promise<string> => {
    try {
      if (!ethers.isAddress(owner) || !ethers.isAddress(spender)) {
        throw new Error("Invalid addresses");
      }

      const contract = await getContract("IDRX");
      const allowance = await contract.allowance(owner, spender) as bigint;
      return ethers.formatUnits(allowance, 2); // UBAH DARI 18 KE 2
    } catch (error) {
      console.error("❌ Error getting IDRX allowance:", error);
      return "0";
    }
  };

  const approveIDRX = async (spender: string, amount: string): Promise<string> => {
    try {
      if (!ethers.isAddress(spender)) {
        throw new Error("Invalid spender address");
      }

      const contract = await getContract("IDRX");
      const amountInWei = ethers.parseUnits(amount, 2); // UBAH DARI 18 KE 2
      
      const tx = await contract.approve(spender, amountInWei);
      console.log("⏳ Waiting for approval confirmation...");
      await tx.wait();
      
      console.log("✅ IDRX approval successful");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error approving IDRX:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`IDRX approval failed: ${errorMessage}`);
    }
  };

  const transferIDRX = async (to: string, amount: string): Promise<string> => {
    try {
      if (!ethers.isAddress(to)) {
        throw new Error("Invalid recipient address");
      }

      const contract = await getContract("IDRX");
      const amountInWei = ethers.parseUnits(amount, 2); // UBAH DARI 18 KE 2
      
      const tx = await contract.transfer(to, amountInWei);
      console.log("⏳ Waiting for transfer confirmation...");
      await tx.wait();
      
      console.log("✅ IDRX transfer successful");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error transferring IDRX:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`IDRX transfer failed: ${errorMessage}`);
    }
  };

  const mintIDRX = async (to: string, amount: string): Promise<string> => {
    try {
      if (!ethers.isAddress(to)) {
        throw new Error("Invalid recipient address");
      }

      const contract = await getContract("IDRX");
      const amountInWei = ethers.parseUnits(amount, 2); // UBAH DARI 18 KE 2
      
      const tx = await contract.mint(to, amountInWei);
      console.log("⏳ Waiting for mint confirmation...");
      await tx.wait();
      
      console.log("✅ IDRX mint successful");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error minting IDRX:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`IDRX mint failed: ${errorMessage}`);
    }
  };

  // ========================================
  // FUNDRAISERS CONTRACT FUNCTIONS - SEMUA MENGGUNAKAN 2 DECIMALS
  // ========================================

  const createProgram = async (programData: ProgramData): Promise<string> => {
    try {
      console.log("🔍 Creating program:", programData.name);

      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error("Please connect your wallet first");
      }

      const requiredFields = ["name", "desc", "pic", "picName", "category"];
      const missingFields = requiredFields.filter((field) => {
        const value = programData[field as keyof ProgramData];
        return !value || (typeof value === "string" && value.trim() === "");
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const targetAmount = ethers.parseUnits(programData.target.toString(), 2); // TETAP 2 DECIMALS

      const programInput = {
        name: programData.name,
        picName: programData.picName,
        target: targetAmount,
        desc: programData.desc,
        pic: programData.pic,
        category: programData.category,
        programLink: programData.programLink || "",
        photoUrl: programData.photoUrl || "",
      };

      const contract = await getContract("FUNDRAISERS");
      const tx = await contract.createProgram(programInput);
      console.log("⏳ Waiting for program creation confirmation...");
      await tx.wait();

      console.log("✅ Program created successfully");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error creating program:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Program creation failed: ${errorMessage}`);
    }
  };

  const updateProgram = async (programId: number, programData: ProgramData): Promise<string> => {
    try {
      console.log("🔍 Updating program:", programId);

      const targetAmount = ethers.parseUnits(programData.target.toString(), 2); // UBAH DARI 18 KE 2

      const programInput = {
        name: programData.name,
        picName: programData.picName,
        target: targetAmount,
        desc: programData.desc,
        pic: programData.pic,
        category: programData.category,
        programLink: programData.programLink || "",
        photoUrl: programData.photoUrl || "",
      };

      const contract = await getContract("FUNDRAISERS");
      const tx = await contract.updateProgram(programId, programInput);
      console.log("⏳ Waiting for program update confirmation...");
      await tx.wait();

      console.log("✅ Program updated successfully");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error updating program:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Program update failed: ${errorMessage}`);
    }
  };

  const deactivateProgram = async (programId: number): Promise<string> => {
    try {
      console.log("🔍 Deactivating program:", programId);

      const contract = await getContract("FUNDRAISERS");
      const tx = await contract.deactivateProgram(programId);
      console.log("⏳ Waiting for deactivation confirmation...");
      await tx.wait();

      console.log("✅ Program deactivated successfully");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error deactivating program:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Program deactivation failed: ${errorMessage}`);
    }
  };

  const allocateFund = async (programId: number): Promise<string> => {
    try {
      console.log("🔍 Allocating fund to program:", programId);

      const contract = await getContract("FUNDRAISERS");
      const tx = await contract.allocateFund(programId);
      console.log("⏳ Waiting for fund allocation confirmation...");
      await tx.wait();

      console.log("✅ Fund allocated successfully");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error allocating fund:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Fund allocation failed: ${errorMessage}`);
    }
  };

  const markProgramAsFinished = async (programId: number): Promise<string> => {
    try {
      console.log("🔍 Marking program as finished:", programId);

      const contract = await getContract("FUNDRAISERS");
      const tx = await contract.markProgramAsFinished(programId);
      console.log("⏳ Waiting for confirmation...");
      await tx.wait();

      console.log("✅ Program marked as finished successfully");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error marking program as finished:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Mark as finished failed: ${errorMessage}`);
    }
  };

  const withdrawFund = async (programId: number, history: string, amount: string): Promise<string> => {
    try {
      console.log("🔍 Withdrawing fund from program:", programId);

      const contract = await getContract("FUNDRAISERS");
      const amountInWei = ethers.parseUnits(amount, 2); // UBAH DARI 18 KE 2
      
      const tx = await contract.withdrawFund(programId, history, amountInWei);
      console.log("⏳ Waiting for withdrawal confirmation...");
      await tx.wait();

      console.log("✅ Fund withdrawn successfully");
      return tx.hash as string;
    } catch (error) {
      console.error("❌ Error withdrawing fund:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Fund withdrawal failed: ${errorMessage}`);
    }
  };

  const sendDonation = async (amount: number | string): Promise<string> => {
    try {
      console.log("🔍 Sending donation:", amount);

      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error("Please connect your wallet first");
      }

      const currentAddress = await getCurrentAddress();
      if (!currentAddress) {
        throw new Error("Wallet not connected");
      }

      if (!amount || parseFloat(amount.toString()) <= 0) {
        throw new Error("Invalid donation amount");
      }

      const idrxContract = await getContract("IDRX");
      const fundraisersContract = await getContract("FUNDRAISERS");

      const amountInWei = ethers.parseUnits(amount.toString(), 2); // UBAH DARI 18 KE 2
      console.log("💰 Amount in wei:", amountInWei.toString());

      const balance = await getIDRXBalance(currentAddress);
      if (parseFloat(balance) < parseFloat(amount.toString())) {
        throw new Error(
          `Insufficient balance. You have ${balance} IDRX but trying to donate ${amount} IDRX`
        );
      }

      console.log("🔄 Approving token spending...");
      const approveTx = await idrxContract.approve(
        CONTRACT_ADDRESSES.FUNDRAISERS,
        amountInWei
      );
      console.log("⏳ Waiting for approval confirmation...");
      await approveTx.wait();
      console.log("✅ Approval confirmed");

      console.log("🔄 Sending fund...");
      const sendTx = await fundraisersContract.sendFund(amountInWei);
      console.log("⏳ Waiting for transaction confirmation...");
      await sendTx.wait();
      console.log("✅ Donation sent successfully");

      return sendTx.hash as string;
    } catch (error) {
      console.error("❌ Error sending donation:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Donation failed: ${errorMessage}`);
    }
  };

  // ========================================
  // READ FUNCTIONS
  // ========================================

  const getAllPrograms = async (): Promise<Program[]> => {
    try {
      console.log("🔍 Getting all programs...");

      const isConnected = await checkConnection();
      if (!isConnected) {
        console.warn("⚠️ Wallet not connected, using public method");
        return await getAllProgramsPublic();
      }

      const contract = await getContract("FUNDRAISERS");
      const programs = await contract.getAllProgram() as Program[];

      console.log("✅ Programs loaded:", programs.length);
      return programs;
    } catch (error) {
      console.error("❌ Error getting programs, trying public method:", error);
      return await getAllProgramsPublic();
    }
  };

  const getAllProgramsPublic = async (): Promise<Program[]> => {
    try {
      console.log("🔍 Getting all programs (public)...");

      const contract = getReadOnlyContract("FUNDRAISERS");
      const programs = await contract.getAllProgram() as Program[];

      console.log("✅ Programs loaded (public):", programs.length);
      return programs;
    } catch (error) {
      console.error("❌ Error getting programs (public):", error);
      return [];
    }
  };

  const getProgramById = async (programId: number): Promise<Program | null> => {
    try {
      const contract = await getContract("FUNDRAISERS");
      const program = await contract.programs(programId) as Program;
      return program;
    } catch (error) {
      console.error("❌ Error getting program by ID:", error);
      return null;
    }
  };

  const getProgramByIdPublic = async (programId: number): Promise<Program | null> => {
    try {
      const contract = getReadOnlyContract("FUNDRAISERS");
      const program = await contract.programs(programId) as Program;
      return program;
    } catch (error) {
      console.error("❌ Error getting program by ID (public):", error);
      return null;
    }
  };

  const getProgramHistory = async (programId: number): Promise<ProgramHistory[]> => {
    try {
      const contract = await getContract("FUNDRAISERS");
      const history = await contract.getProgramHistory(programId) as ProgramHistory[];
      return history;
    } catch (error) {
      console.error("❌ Error getting program history:", error);
      return [];
    }
  };

  const getProgramHistoryPublic = async (programId: number): Promise<ProgramHistory[]> => {
    try {
      const contract = getReadOnlyContract("FUNDRAISERS");
      const history = await contract.getProgramHistory(programId) as ProgramHistory[];
      return history;
    } catch (error) {
      console.error("❌ Error getting program history (public):", error);
      return [];
    }
  };

  const getTotalManagedFund = async (): Promise<string> => {
    return await getTotalManagedFundPublic();
  };

  const getTotalManagedFundPublic = async (): Promise<string> => {
    try {
      console.log("🔍 Getting total managed fund (public)...");

      const contract = getReadOnlyContract("FUNDRAISERS");

      if (typeof contract.totalManagedFund !== "function") {
        console.warn("⚠️ totalManagedFund function not found in contract");
        return "0";
      }

      const total = await contract.totalManagedFund() as bigint;
      console.log("✅ Raw total managed fund (public):", String(total));

      const formatted = ethers.formatUnits(total, 2); // UBAH DARI 18 KE 2
      console.log("✅ Formatted total managed fund (public):", formatted);

      return formatted;
    } catch (error) {
      console.error("❌ Error getting total managed fund (public):", error);
      return "0";
    }
  };

  const getTotalAllocated = async (): Promise<string> => {
    return await getTotalAllocatedPublic();
  };

  const getTotalAllocatedPublic = async (): Promise<string> => {
    try {
      console.log("🔍 Getting total allocated (public)...");

      const contract = getReadOnlyContract("FUNDRAISERS");

      if (typeof contract.totalAllocated !== "function") {
        console.warn("⚠️ totalAllocated function not found in contract");
        return "0";
      }

      const total = await contract.totalAllocated() as bigint;
      console.log("✅ Raw total allocated (public):", String(total));

      const formatted = ethers.formatUnits(total, 2); // UBAH DARI 18 KE 2
      console.log("✅ Formatted total allocated (public):", formatted);

      return formatted;
    } catch (error) {
      console.error("❌ Error getting total allocated (public):", error);
      return "0";
    }
  };

  const getTotalProgramsCreated = async (): Promise<number> => {
    return await getTotalProgramsCreatedPublic();
  };

  const getTotalProgramsCreatedPublic = async (): Promise<number> => {
    try {
      console.log("🔍 Getting total programs created (public)...");

      const programs = await getAllProgramsPublic();
      const count = programs.length;
      console.log("✅ Total programs created (public):", count);
      return count;
    } catch (error) {
      console.error("❌ Error getting total programs created (public):", error);
      return 0;
    }
  };

  const getContractOwner = async (): Promise<string> => {
    return await getContractOwnerPublic();
  };

const getContractOwnerPublic = async (): Promise<string> => {
    try {
      const contract = getReadOnlyContract("FUNDRAISERS");
      const owner = await contract.owner() as string;
      return owner;
    } catch (error) {
      console.error("❌ Error getting contract owner (public):", error);
      return "";
    }
  };

  const getIDRXTokenAddress = async (): Promise<string> => {
    return await getIDRXTokenAddressPublic();
  };

  const getIDRXTokenAddressPublic = async (): Promise<string> => {
    try {
      const contract = getReadOnlyContract("FUNDRAISERS");
      const tokenAddress = await contract.idrxToken() as string;
      return tokenAddress;
    } catch (error) {
      console.error("❌ Error getting IDRX token address (public):", error);
      return "";
    }
  };

// ========================================
// NEW FUND MANAGEMENT FUNCTIONS - SEMUA MENGGUNAKAN 2 DECIMALS
// ========================================

const getRemainingFundForAllocation = async (): Promise<string> => {
  try {
    console.log("🔍 Getting remaining fund for allocation...");
    
    const [totalManaged, totalAllocated] = await Promise.all([
      getTotalManagedFundPublic(),
      getTotalAllocatedPublic()
    ]);

    const managedNum = parseFloat(totalManaged);
    const allocatedNum = parseFloat(totalAllocated);
    const remaining = Math.max(0, managedNum - allocatedNum);

    console.log("✅ Remaining for allocation:", remaining);
    return remaining.toString();
  } catch (error) {
    console.error("❌ Error getting remaining fund for allocation:", error);
    return "0";
  }
};

const getContractIDRXBalance = async (): Promise<string> => {
  try {
    console.log("🔍 Getting IDRX balance in Fundraisers contract...");
    
    const idrxContract = getReadOnlyContract("IDRX");
    const fundraisersAddress = CONTRACT_ADDRESSES.FUNDRAISERS;
    
    const balance = await idrxContract.balanceOf(fundraisersAddress) as bigint;
    const formatted = ethers.formatUnits(balance, 2); // MENGGUNAKAN 2 DECIMALS
    
    console.log("✅ Contract IDRX balance:", formatted);
    return formatted;
  } catch (error) {
    console.error("❌ Error getting contract IDRX balance:", error);
    return "0";
  }
};

const getFundAllocationStatus = async (): Promise<FundAllocationStatus> => {
  try {
    console.log("🔍 Getting comprehensive fund allocation status...");
    
    const [totalManaged, totalAllocated, contractBalance] = await Promise.all([
      getTotalManagedFundPublic(),
      getTotalAllocatedPublic(),
      getContractIDRXBalance()
    ]);

    const managedNum = parseFloat(totalManaged);
    const allocatedNum = parseFloat(totalAllocated);
    const remainingForAllocation = Math.max(0, managedNum - allocatedNum).toString();

    const status: FundAllocationStatus = {
      totalManaged,
      totalAllocated,
      remainingForAllocation,
      contractBalance
    };

    console.log("✅ Fund allocation status:", status);
    return status;
  } catch (error) {
    console.error("❌ Error getting fund allocation status:", error);
    return {
      totalManaged: "0",
      totalAllocated: "0",
      remainingForAllocation: "0",
      contractBalance: "0"
    };
  }
};

return {
  // IDRX Token Functions
  getIDRXBalance,
  getIDRXTotalSupply,
  getIDRXAllowance,
  approveIDRX,
  transferIDRX,
  mintIDRX,
  
  // Fundraisers Contract Functions - Admin Only
  createProgram,
  updateProgram,
  deactivateProgram,
  allocateFund,
  markProgramAsFinished,
  
  // Fundraisers Contract Functions - PIC Only
  withdrawFund,
  
  // Fundraisers Contract Functions - Public
  sendDonation,
  getAllPrograms,
  getProgramById,
  getProgramHistory,
  getTotalManagedFund,
  getTotalAllocated,
  getTotalProgramsCreated,
  getContractOwner,
  getIDRXTokenAddress,
  
  // New Fund Management Functions
  getRemainingFundForAllocation,
  getContractIDRXBalance,
  getFundAllocationStatus,
  
  // Utility Functions
  getContract,
  isWalletConnected,
  getCurrentAddress,
  checkConnection,
  switchToLiskSepolia,
  
  // Read-only functions (tidak perlu wallet connection)
  getTotalManagedFundPublic,
  getTotalAllocatedPublic,
  getTotalProgramsCreatedPublic,
  getAllProgramsPublic,
  getProgramByIdPublic,
  getProgramHistoryPublic,
  getContractOwnerPublic,
  getIDRXTokenAddressPublic,
  getIDRXBalancePublic,
  getIDRXTotalSupplyPublic
  }
}