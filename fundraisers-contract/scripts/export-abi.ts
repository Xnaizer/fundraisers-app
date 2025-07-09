import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== Exporting Contract ABIs ===");
  
  try {
    // Get contract factories
    const FundraisersFactory = await ethers.getContractFactory("Fundraisers");
    const IDRXFactory = await ethers.getContractFactory("IDRX");
    
    // Extract ABIs using formatJson() method
    const fundraisersABI = FundraisersFactory.interface.formatJson();
    const idrxABI = IDRXFactory.interface.formatJson();
    
    // Create directories
    const abisDir = path.join(__dirname, '../abis');
    const frontendDir = path.join(__dirname, '../frontend-config');
    
    [abisDir, frontendDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Save individual ABIs (sudah dalam format JSON string)
    fs.writeFileSync(
      path.join(abisDir, 'Fundraisers.json'), 
      fundraisersABI
    );
    fs.writeFileSync(
      path.join(abisDir, 'IDRX.json'), 
      idrxABI
    );
    
    // Load deployment info if exists
    let deploymentInfo: any = {};
    const deploymentFile = path.join(__dirname, '../deployment-lisk-sepolia.json');
    if (fs.existsSync(deploymentFile)) {
      deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    }
    
    // Create frontend config
    const frontendConfig = {
      network: {
        name: "Lisk Sepolia",
        chainId: 4202,
        rpcUrl: "https://rpc.sepolia-api.lisk.com",
        blockExplorer: "https://sepolia-blockscout.lisk.com"
      },
      contracts: {
        fundraisers: {
          address: deploymentInfo?.contracts?.fundraisers?.address || "DEPLOY_FIRST",
          abi: JSON.parse(fundraisersABI)
        },
        idrx: {
          address: deploymentInfo?.contracts?.idrx?.address || "DEPLOY_FIRST",
          abi: JSON.parse(idrxABI),
          symbol: "IDRX",
          decimals: 2
        }
      }
    };
    
    fs.writeFileSync(
      path.join(frontendDir, 'contracts.json'), 
      JSON.stringify(frontendConfig, null, 2)
    );
    
    console.log("✅ ABIs exported to:");
    console.log("  - abis/Fundraisers.json");
    console.log("  - abis/IDRX.json");
    console.log("  - frontend-config/contracts.json");
    
    // Create TypeScript constants file
    const tsConfig = `// Auto-generated contract configuration
export const NETWORK_CONFIG = {
  name: "Lisk Sepolia",
  chainId: 4202,
  rpcUrl: "https://rpc.sepolia-api.lisk.com",
  blockExplorer: "https://sepolia-blockscout.lisk.com"
} as const;

export const CONTRACT_ADDRESSES = {
  FUNDRAISERS: "${deploymentInfo?.contracts?.fundraisers?.address || 'DEPLOY_FIRST'}",
  IDRX: "${deploymentInfo?.contracts?.idrx?.address || 'DEPLOY_FIRST'}"
} as const;

export const IDRX_CONFIG = {
  symbol: "IDRX",
  decimals: 2,
  name: "Indonesian Rupiah X"
} as const;

// ABIs sebagai constants
export const FUNDRAISERS_ABI = ${fundraisersABI} as const;

export const IDRX_ABI = ${idrxABI} as const;
`;
    
    fs.writeFileSync(path.join(frontendDir, 'contracts.ts'), tsConfig);
    console.log("  - frontend-config/contracts.ts");
    
    // Create simple constants file untuk copy-paste ke frontend
    const simpleConfig = `// Contract Addresses untuk Frontend
export const CONTRACTS = {
  FUNDRAISERS: {
    address: "${deploymentInfo?.contracts?.fundraisers?.address || 'DEPLOY_FIRST'}",
    abi: ${fundraisersABI}
  },
  IDRX: {
    address: "${deploymentInfo?.contracts?.idrx?.address || 'DEPLOY_FIRST'}",
    abi: ${idrxABI}
  }
};

export const NETWORK = {
  chainId: 4202,
  name: "Lisk Sepolia",
  rpcUrl: "https://rpc.sepolia-api.lisk.com"
};
`;
    
    fs.writeFileSync(path.join(frontendDir, 'simple-config.ts'), simpleConfig);
    console.log("  - frontend-config/simple-config.ts");
    
    console.log("\n=== Configuration Summary ===");
    console.log("Network:", frontendConfig.network.name);
    console.log("Chain ID:", frontendConfig.network.chainId);
    console.log("Fundraisers Address:", frontendConfig.contracts.fundraisers.address);
    console.log("IDRX Address:", frontendConfig.contracts.idrx.address);
    
  } catch (error) {
    console.error("❌ Error exporting ABIs:", error);
    throw error;
  }
}

main().catch(console.error);