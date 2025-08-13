import { ethers } from 'ethers';

// Contract ABI (full ABI from compiled contract)
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "hashString",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "DocumentRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      }
    ],
    "name": "DocumentVerified",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_hash",
        "type": "string"
      }
    ],
    "name": "documentExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_hash",
        "type": "string"
      }
    ],
    "name": "getDocument",
    "outputs": [
      {
        "internalType": "string",
        "name": "hash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_hash",
        "type": "string"
      }
    ],
    "name": "registerDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_hash",
        "type": "string"
      }
    ],
    "name": "verifyDocument",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  /**
   * Initialize blockchain connection
   * @param {string} contractAddress - The deployed contract address
   * @param {string} network - Network to connect to (default: 'sepolia')
   */
  async initialize(contractAddress, network = 'sepolia') {
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Check if we're on the correct network
        const networkInfo = await this.provider.getNetwork();
        console.log('Connected to network:', networkInfo);
        
        // Create contract instance
        this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
        
        // Test contract connection
        try {
          const testResult = await this.contract.documentExists("test");
          console.log('Contract connection test successful:', testResult);
        } catch (contractError) {
          console.error('Contract connection test failed:', contractError);
          throw new Error(`Contract not accessible: ${contractError.message}`);
        }
        
        this.isConnected = true;
        console.log('Blockchain service initialized successfully');
        
        return true;
      } else {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Register a document hash on-chain
   * @param {string} hash - The SHA-256 hash of the document
   * @returns {Promise<Object>} Transaction result
   */
  async registerDocument(hash) {
    if (!this.isConnected || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('Registering document hash on blockchain:', hash);
      
      // Check if document already exists
      const exists = await this.contract.documentExists(hash);
      if (exists) {
        return {
          success: true,
          message: 'Document already registered on blockchain',
          hash: hash,
          exists: true
        };
      }

      // Register the document
      const tx = await this.contract.registerDocument(hash);
      const receipt = await tx.wait();

      console.log('Document registered successfully:', receipt);

      return {
        success: true,
        message: 'Document registered on blockchain successfully',
        hash: hash,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        exists: false
      };
    } catch (error) {
      console.error('Failed to register document:', error);
      throw new Error(`Failed to register document: ${error.message}`);
    }
  }

  /**
   * Verify if a document hash exists on-chain
   * @param {string} hash - The SHA-256 hash to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyDocument(hash) {
    if (!this.isConnected || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('Verifying document hash on blockchain:', hash);
      
      const isValid = await this.contract.verifyDocument(hash);
      const documentInfo = await this.contract.getDocument(hash);

      return {
        success: true,
        isValid: isValid,
        hash: hash,
        registeredAt: documentInfo.timestamp ? new Date(Number(documentInfo.timestamp) * 1000).toISOString() : null,
        owner: documentInfo.owner,
        exists: documentInfo.exists
      };
    } catch (error) {
      console.error('Failed to verify document:', error);
      throw new Error(`Failed to verify document: ${error.message}`);
    }
  }

  /**
   * Get current account address
   * @returns {Promise<string>} Account address
   */
  async getCurrentAccount() {
    if (!this.signer) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Failed to get current account:', error);
      throw new Error(`Failed to get current account: ${error.message}`);
    }
  }

  /**
   * Check if MetaMask is available
   * @returns {boolean} True if MetaMask is available
   */
  isMetaMaskAvailable() {
    return typeof window !== 'undefined' && window.ethereum;
  }

  /**
   * Get network information
   * @returns {Promise<Object>} Network info
   */
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;
