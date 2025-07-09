
export const CONTRACT_ADDRESSES = {
  IDRX: "0x24A7e58b751e42997c6f5f11165bD7FDcb3a9d80", // ganti dengan address real Anda
  FUNDRAISERS: "0x3D88Da03Bc05f17F7CCfb7A7d2EdBd634D7d9aE0" // ganti dengan address real Anda
};

export const IDRX_ABI = [

{
        "type": "constructor",
        "stateMutability": "nonpayable",
        "payable": false,
        "inputs": [
        { "type": "address", "name": "recipient" },
        { "type": "address", "name": "initialOwner" }
        ]
    },
    { "type": "error", "name": "ECDSAInvalidSignature", "inputs": [] },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureLength",
        "inputs": [{ "type": "uint256", "name": "length" }]
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureS",
        "inputs": [{ "type": "bytes32", "name": "s" }]
    },
    {
        "type": "error",
        "name": "ERC20InsufficientAllowance",
        "inputs": [
        { "type": "address", "name": "spender" },
        { "type": "uint256", "name": "allowance" },
        { "type": "uint256", "name": "needed" }
        ]
    },
    {
        "type": "error",
        "name": "ERC20InsufficientBalance",
        "inputs": [
        { "type": "address", "name": "sender" },
        { "type": "uint256", "name": "balance" },
        { "type": "uint256", "name": "needed" }
        ]
    },
    {
        "type": "error",
        "name": "ERC20InvalidApprover",
        "inputs": [{ "type": "address", "name": "approver" }]
    },
    {
        "type": "error",
        "name": "ERC20InvalidReceiver",
        "inputs": [{ "type": "address", "name": "receiver" }]
    },
    {
        "type": "error",
        "name": "ERC20InvalidSender",
        "inputs": [{ "type": "address", "name": "sender" }]
    },
    {
        "type": "error",
        "name": "ERC20InvalidSpender",
        "inputs": [{ "type": "address", "name": "spender" }]
    },
    {
        "type": "error",
        "name": "ERC2612ExpiredSignature",
        "inputs": [{ "type": "uint256", "name": "deadline" }]
    },
    {
        "type": "error",
        "name": "ERC2612InvalidSigner",
        "inputs": [
        { "type": "address", "name": "signer" },
        { "type": "address", "name": "owner" }
        ]
    },
    {
        "type": "error",
        "name": "InvalidAccountNonce",
        "inputs": [
        { "type": "address", "name": "account" },
        { "type": "uint256", "name": "currentNonce" }
        ]
    },
    { "type": "error", "name": "InvalidShortString", "inputs": [] },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [{ "type": "address", "name": "owner" }]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [{ "type": "address", "name": "account" }]
    },
    {
        "type": "error",
        "name": "StringTooLong",
        "inputs": [{ "type": "string", "name": "str" }]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Approval",
        "inputs": [
        { "type": "address", "name": "owner", "indexed": true },
        { "type": "address", "name": "spender", "indexed": true },
        { "type": "uint256", "name": "value", "indexed": false }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "EIP712DomainChanged",
        "inputs": []
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "OwnershipTransferred",
        "inputs": [
        { "type": "address", "name": "previousOwner", "indexed": true },
        { "type": "address", "name": "newOwner", "indexed": true }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Transfer",
        "inputs": [
        { "type": "address", "name": "from", "indexed": true },
        { "type": "address", "name": "to", "indexed": true },
        { "type": "uint256", "name": "value", "indexed": false }
        ]
    },
    {
        "type": "function",
        "name": "DOMAIN_SEPARATOR",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "bytes32", "name": "" }]
    },
    {
        "type": "function",
        "name": "allowance",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
        { "type": "address", "name": "owner" },
        { "type": "address", "name": "spender" }
        ],
        "outputs": [{ "type": "uint256", "name": "" }]
    },
    {
        "type": "function",
        "name": "approve",
        "constant": false,
        "payable": false,
        "inputs": [
        { "type": "address", "name": "spender" },
        { "type": "uint256", "name": "value" }
        ],
        "outputs": [{ "type": "bool", "name": "" }]
    },
    {
        "type": "function",
        "name": "balanceOf",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [{ "type": "address", "name": "account" }],
        "outputs": [{ "type": "uint256", "name": "" }]
    },
    {
        "type": "function",
        "name": "decimals",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "uint8", "name": "" }]
    },
    {
        "type": "function",
        "name": "eip712Domain",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
        { "type": "bytes1", "name": "fields" },
        { "type": "string", "name": "name" },
        { "type": "string", "name": "version" },
        { "type": "uint256", "name": "chainId" },
        { "type": "address", "name": "verifyingContract" },
        { "type": "bytes32", "name": "salt" },
        { "type": "uint256[]", "name": "extensions" }
        ]
    },
    {
        "type": "function",
        "name": "mint",
        "constant": false,
        "payable": false,
        "inputs": [
        { "type": "address", "name": "to" },
        { "type": "uint256", "name": "amount" }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "name",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "string", "name": "" }]
    },
    {
        "type": "function",
        "name": "nonces",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [{ "type": "address", "name": "owner" }],
        "outputs": [{ "type": "uint256", "name": "" }]
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "address", "name": "" }]
    },
    {
        "type": "function",
        "name": "permit",
        "constant": false,
        "payable": false,
        "inputs": [
        { "type": "address", "name": "owner" },
        { "type": "address", "name": "spender" },
        { "type": "uint256", "name": "value" },
        { "type": "uint256", "name": "deadline" },
        { "type": "uint8", "name": "v" },
        { "type": "bytes32", "name": "r" },
        { "type": "bytes32", "name": "s" }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "function",
        "name": "symbol",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "string", "name": "" }]
    },
    {
        "type": "function",
        "name": "totalSupply",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "uint256", "name": "" }]
    },
    {
        "type": "function",
        "name": "transfer",
        "constant": false,
        "payable": false,
        "inputs": [
        { "type": "address", "name": "to" },
        { "type": "uint256", "name": "value" }
        ],
        "outputs": [{ "type": "bool", "name": "" }]
    },
    {
        "type": "function",
        "name": "transferFrom",
        "constant": false,
        "payable": false,
        "inputs": [
        { "type": "address", "name": "from" },
        { "type": "address", "name": "to" },
        { "type": "uint256", "name": "value" }
        ],
        "outputs": [{ "type": "bool", "name": "" }]
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "constant": false,
        "payable": false,
        "inputs": [{ "type": "address", "name": "newOwner" }],
        "outputs": []
    }

];

export const FUNDRAISERS_ABI = [
    {
        "type": "constructor",
        "stateMutability": "nonpayable",
        "payable": false,
        "inputs": [{ "type": "address", "name": "_tokenAddress" }]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "FundAllocated",
        "inputs": [
        { "type": "uint256", "name": "programId", "indexed": true },
        { "type": "uint256", "name": "amount", "indexed": false }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "FundSent",
        "inputs": [
        { "type": "address", "name": "sender", "indexed": true },
        { "type": "uint256", "name": "amount", "indexed": false }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "FundWithdrawn",
        "inputs": [
        { "type": "uint256", "name": "programId", "indexed": true },
        { "type": "address", "name": "pic", "indexed": true },
        { "type": "string", "name": "history", "indexed": false },
        { "type": "uint256", "name": "amount", "indexed": false }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ProgramCreated",
        "inputs": [
        { "type": "uint256", "name": "programId", "indexed": true },
        { "type": "string", "name": "name", "indexed": false },
        { "type": "uint256", "name": "target", "indexed": false },
        { "type": "address", "name": "pic", "indexed": false }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ProgramUpdated",
        "inputs": [
        { "type": "uint256", "name": "programId", "indexed": true },
        { "type": "string", "name": "name", "indexed": false },
        { "type": "string", "name": "picName", "indexed": false }
        ]
    },
    {
        "type": "function",
        "name": "allocateFund",
        "constant": false,
        "payable": false,
        "inputs": [{ "type": "uint256", "name": "_programId" }],
        "outputs": []
    },
    {
        "type": "function",
        "name": "createProgram",
        "constant": false,
        "payable": false,
        "inputs": [
        {
            "type": "tuple",
            "name": "input",
            "components": [
            { "type": "string", "name": "name" },
            { "type": "string", "name": "picName" },
            { "type": "uint256", "name": "target" },
            { "type": "string", "name": "desc" },
            { "type": "address", "name": "pic" },
            { "type": "string", "name": "category" },
            { "type": "string", "name": "programLink" },
            { "type": "string", "name": "photoUrl" }
            ]
        }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "deactivateProgram",
        "constant": false,
        "payable": false,
        "inputs": [{ "type": "uint256", "name": "_programId" }],
        "outputs": []
    },
    {
        "type": "function",
        "name": "getAllProgram",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
        {
            "type": "tuple[]",
            "name": "",
            "components": [
            { "type": "uint256", "name": "id" },
            { "type": "string", "name": "name" },
            { "type": "string", "name": "picName" },
            { "type": "uint256", "name": "target" },
            { "type": "string", "name": "desc" },
            { "type": "address", "name": "pic" },
            { "type": "uint8", "name": "status" },
            { "type": "uint256", "name": "allocated" },
            { "type": "string", "name": "category" },
            { "type": "string", "name": "programLink" },
            { "type": "string", "name": "photoUrl" }
            ]
        }
        ]
    },
    {
        "type": "function",
        "name": "getProgramHistory",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [{ "type": "uint256", "name": "_programId" }],
        "outputs": [
        {
            "type": "tuple[]",
            "name": "",
            "components": [
            { "type": "uint256", "name": "timestamp" },
            { "type": "string", "name": "history" },
            { "type": "uint256", "name": "amount" }
            ]
        }
        ]
    },
    {
        "type": "function",
        "name": "idrxToken",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "address", "name": "" }]
    },
    {
        "type": "function",
        "name": "markProgramAsFinished",
        "constant": false,
        "payable": false,
        "inputs": [{ "type": "uint256", "name": "_programId" }],
        "outputs": []
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "address", "name": "" }]
    },
    {
        "type": "function",
        "name": "programHistories",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
        { "type": "uint256", "name": "" },
        { "type": "uint256", "name": "" }
        ],
        "outputs": [
        { "type": "uint256", "name": "timestamp" },
        { "type": "string", "name": "history" },
        { "type": "uint256", "name": "amount" }
        ]
    },
    {
        "type": "function",
        "name": "programs",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [{ "type": "uint256", "name": "" }],
        "outputs": [
        { "type": "uint256", "name": "id" },
        { "type": "string", "name": "name" },
        { "type": "string", "name": "picName" },
        { "type": "uint256", "name": "target" },
        { "type": "string", "name": "desc" },
        { "type": "address", "name": "pic" },
        { "type": "uint8", "name": "status" },
        { "type": "uint256", "name": "allocated" },
        { "type": "string", "name": "category" },
        { "type": "string", "name": "programLink" },
        { "type": "string", "name": "photoUrl" }
        ]
    },
    {
        "type": "function",
        "name": "sendFund",
        "constant": false,
        "payable": false,
        "inputs": [{ "type": "uint256", "name": "amount" }],
        "outputs": []
    },
    {
        "type": "function",
        "name": "totalAllocated",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "uint256", "name": "" }]
    },
    {
        "type": "function",
        "name": "totalManagedFund",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [{ "type": "uint256", "name": "" }]
    },
    {
        "type": "function",
        "name": "updateProgram",
        "constant": false,
        "payable": false,
        "inputs": [
        { "type": "uint256", "name": "_programId" },
        {
            "type": "tuple",
            "name": "input",
            "components": [
            { "type": "string", "name": "name" },
            { "type": "string", "name": "picName" },
            { "type": "uint256", "name": "target" },
            { "type": "string", "name": "desc" },
            { "type": "address", "name": "pic" },
            { "type": "string", "name": "category" },
            { "type": "string", "name": "programLink" },
            { "type": "string", "name": "photoUrl" }
            ]
        }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "withdrawFund",
        "constant": false,
        "payable": false,
        "inputs": [
        { "type": "uint256", "name": "_programId" },
        { "type": "string", "name": "_history" },
        { "type": "uint256", "name": "_amount" }
        ],
        "outputs": []
    }

];

export const NETWORK_CONFIG = {
  chainId: 4202,
  name: "Lisk Sepolia",
  rpcUrl: "https://rpc.sepolia-api.lisk.com"
};

// Types
export interface ProgramData {
  name: string;
  picName: string;
  target: bigint;
  desc: string;
  pic: string;
  category: string;
  programLink: string;
  photoUrl: string;
}

export interface Program {
  id: bigint;
  name: string;
  picName: string;
  target: bigint;
  desc: string;
  pic: string;
  status: number;
  allocated: bigint;
  category: string;
  programLink: string;
  photoUrl: string;
}

export type ContractName = 'IDRX' | 'FUNDRAISERS';