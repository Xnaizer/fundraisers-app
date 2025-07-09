import { ethers, Contract } from "ethers";
import {
  IDRX_ABI,
  FUNDRAISERS_ABI,
  CONTRACT_ADDRESSES,
  ContractName,
  ProgramData,
  Program,
} from "../../contracts/contractConfig";

interface UseContractReturn {
  getIDRXBalance: (userAddress?: string) => Promise<string>;
  getAllPrograms: () => Promise<Program[]>;
  sendDonation: (amount: number | string) => Promise<string>;
  createProgram: (programData: ProgramData) => Promise<string>;
  getContract: (contractName: ContractName) => Promise<Contract>;
  getTotalManagedFund: () => Promise<string>;
  getTotalAllocated: () => Promise<string>;
  getTotalProgramsCreated: () => Promise<number>;
  isWalletConnected: () => boolean;
  getCurrentAddress: () => Promise<string | null>;
  checkConnection: () => Promise<boolean>;
  // Read-only functions (tidak perlu wallet connection)
  getTotalManagedFundPublic: () => Promise<string>;
  getTotalAllocatedPublic: () => Promise<string>;
  getTotalProgramsCreatedPublic: () => Promise<number>;
  getAllProgramsPublic: () => Promise<Program[]>;
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

    return new ethers.Contract(address, abi as any, provider);
  };

  const isWalletConnected = (): boolean => {
    return !!window.ethereum;
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      if (!window.ethereum) return false;
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
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
      });
      return accounts[0] || null;
    } catch (error) {
      console.error("Error getting current address:", error);
      return null;
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
        throw new Error(
          `Wrong network. Please switch to Lisk Sepolia (Chain ID: 4202). Current: ${chainId}`
        );
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

      const contract = new ethers.Contract(address, abi as any, signer);
      console.log("✅ Contract created successfully");

      return contract;
    } catch (error: any) {
      console.error("❌ Error in getContract:", error);
      throw new Error(
        `Failed to get contract ${contractName}: ${error.message}`
      );
    }
  };

  // PUBLIC READ-ONLY FUNCTIONS (tidak perlu wallet connection)
  const getTotalManagedFundPublic = async (): Promise<string> => {
    try {
      console.log("🔍 Getting total managed fund (public)...");

      const contract = getReadOnlyContract("FUNDRAISERS");

      if (typeof contract.totalManagedFund !== "function") {
        console.warn("⚠️ totalManagedFund function not found in contract");
        return "0";
      }

      const total: any = await contract.totalManagedFund();
      console.log("✅ Raw total managed fund (public):", String(total));

      const formatted = ethers.formatUnits(total, 2);
      console.log("✅ Formatted total managed fund (public):", formatted);

      return formatted;
    } catch (error: any) {
      console.error("❌ Error getting total managed fund (public):", error);
      return "0";
    }
  };

  const getTotalAllocatedPublic = async (): Promise<string> => {
    try {
      console.log("🔍 Getting total allocated (public)...");

      const contract = getReadOnlyContract("FUNDRAISERS");

      if (typeof contract.totalAllocated !== "function") {
        console.warn("⚠️ totalAllocated function not found in contract");
        return "0";
      }

      const total: any = await contract.totalAllocated();
      console.log("✅ Raw total allocated (public):", String(total));

      const formatted = ethers.formatUnits(total, 2);
      console.log("✅ Formatted total allocated (public):", formatted);

      return formatted;
    } catch (error: any) {
      console.error("❌ Error getting total allocated (public):", error);
      return "0";
    }
  };

  const getAllProgramsPublic = async (): Promise<Program[]> => {
    try {
      console.log("🔍 Getting all programs (public)...");

      const contract = getReadOnlyContract("FUNDRAISERS");
      const programs = await contract.getAllProgram();

      console.log("✅ Programs loaded (public):", programs.length);
      return programs;
    } catch (error: any) {
      console.error("❌ Error getting programs (public):", error);
      return [];
    }
  };

  const getTotalProgramsCreatedPublic = async (): Promise<number> => {
    try {
      console.log("🔍 Getting total programs created (public)...");

      const programs = await getAllProgramsPublic();
      const count = programs.length;
      console.log("✅ Total programs created (public):", count);
      return count;
    } catch (error: any) {
      console.error("❌ Error getting total programs created (public):", error);
      return 0;
    }
  };

  // WALLET-REQUIRED FUNCTIONS (perlu wallet connection)
  const getIDRXBalance = async (userAddress?: string): Promise<string> => {
    try {
      console.log("🔍 Getting IDRX balance...");

      const isConnected = await checkConnection();
      if (!isConnected) {
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

      const contract = await getContract("IDRX");
      const balance = await contract.balanceOf(targetAddress);

      console.log("✅ Raw balance:", balance.toString());
      const formatted = ethers.formatUnits(balance, 2);
      console.log("✅ Formatted balance:", formatted);

      return formatted;
    } catch (error: any) {
      console.error("❌ Error getting IDRX balance:", error);
      return "0";
    }
  };

  const getAllPrograms = async (): Promise<Program[]> => {
    try {
      console.log("🔍 Getting all programs...");

      const isConnected = await checkConnection();
      if (!isConnected) {
        console.warn("⚠️ Wallet not connected, using public method");
        return await getAllProgramsPublic();
      }

      const contract = await getContract("FUNDRAISERS");
      const programs = await contract.getAllProgram();

      console.log("✅ Programs loaded:", programs.length);
      return programs;
    } catch (error: any) {
      console.error("❌ Error getting programs, trying public method:", error);
      return await getAllProgramsPublic();
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

      const amountInWei = ethers.parseUnits(amount.toString(), 2);
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

      return sendTx.hash;
    } catch (error: any) {
      console.error("❌ Error sending donation:", error);
      if (error.message.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Donation failed: ${error.message}`);
    }
  };

  const createProgram = async (programData: ProgramData): Promise<string> => {
    try {
      console.log("🔍 Creating program:", programData.name);

      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error("Please connect your wallet first");
      }

      const currentAddress = await getCurrentAddress();
      if (!currentAddress) {
        throw new Error("Wallet not connected");
      }

      const requiredFields = ["name", "desc", "pic", "picName", "category"];
      const missingFields = requiredFields.filter((field) => {
        const value = programData[field as keyof ProgramData];
        return !value || (typeof value === "string" && value.trim() === "");
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const targetAmount = ethers.parseUnits(programData.target.toString(), 2);

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

      console.log("📝 Program data:", {
        ...programInput,
        target: targetAmount.toString(),
      });

      const contract = await getContract("FUNDRAISERS");
      const tx = await contract.createProgram(programInput);
      console.log("⏳ Waiting for program creation confirmation...");
      await tx.wait();

      console.log("✅ Program created successfully");
      return tx.hash;
    } catch (error: any) {
      console.error("❌ Error creating program:", error);
      if (error.message.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(`Program creation failed: ${error.message}`);
    }
  };

  // Legacy functions for backward compatibility
  const getTotalManagedFund = async (): Promise<string> => {
    return await getTotalManagedFundPublic();
  };

  const getTotalAllocated = async (): Promise<string> => {
    return await getTotalAllocatedPublic();
  };

  const getTotalProgramsCreated = async (): Promise<number> => {
    return await getTotalProgramsCreatedPublic();
  };

  return {
    getIDRXBalance,
    getAllPrograms,
    sendDonation,
    createProgram,
    getContract,
    getTotalManagedFund,
    getTotalAllocated,
    getTotalProgramsCreated,
    isWalletConnected,
    getCurrentAddress,
    checkConnection,
    // Public read-only functions
    getTotalManagedFundPublic,
    getTotalAllocatedPublic,
    getTotalProgramsCreatedPublic,
    getAllProgramsPublic,
  };
};
