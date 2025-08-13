# Blockchain Integration Deployment Guide

## Overview
This guide explains how to deploy the DocRegistry smart contract and integrate blockchain verification into your Key2Career application.

## Prerequisites

1. **MetaMask Extension** - Install MetaMask browser extension
2. **Test ETH** - Get test ETH from a faucet for the network you choose
3. **Remix IDE** - For smart contract deployment (or use Hardhat/Truffle)

## Supported Networks

### Test Networks (Recommended for Development)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Mumbai Testnet** (Polygon) (Chain ID: 80001)
- **Arbitrum Sepolia** (Chain ID: 421614)

### Main Networks (Production)
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon Mainnet** (Chain ID: 137)
- **Arbitrum One** (Chain ID: 42161)

## Step 1: Deploy Smart Contract

### Using Remix IDE (Easiest Method)

1. **Open Remix IDE**: Go to https://remix.ethereum.org/

2. **Create New File**: 
   - Click "Create New File"
   - Name it `DocRegistry.sol`
   - Copy the contract code from `contracts/DocRegistry.sol`

3. **Compile Contract**:
   - Go to "Solidity Compiler" tab
   - Select compiler version 0.8.19 or higher
   - Click "Compile DocRegistry.sol"

4. **Deploy Contract**:
   - Go to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask" as environment
   - Make sure MetaMask is connected to your chosen network
   - Click "Deploy"
   - Confirm transaction in MetaMask

5. **Copy Contract Address**:
   - After deployment, copy the contract address
   - Save it for the next step

### Using Hardhat (Advanced Method)

```bash
# Install Hardhat
npm install --save-dev hardhat

# Initialize Hardhat project
npx hardhat init

# Copy contract to contracts/ folder
# Configure hardhat.config.js for your network
# Deploy using: npx hardhat run scripts/deploy.js --network sepolia
```

## Step 2: Configure Environment Variables

Create or update your `.env.local` file:

```env
# Blockchain Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_NETWORK_ID=11155111  # Sepolia Testnet
NEXT_PUBLIC_NETWORK_NAME=Sepolia Testnet
```

## Step 3: Test the Integration

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Navigate to template preview**:
   - Go to any template preview page
   - Export a PDF to generate a hash

3. **Test blockchain features**:
   - Click "Connect MetaMask"
   - Click "Register on Blockchain"
   - Click "Verify Document"

## Step 4: Verify Contract (Optional but Recommended)

### For Sepolia Testnet:
1. Go to https://sepolia.etherscan.io/
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Fill in the verification form

### For Other Networks:
- **Mumbai**: https://mumbai.polygonscan.com/
- **Arbitrum Sepolia**: https://sepolia.arbiscan.io/

## How It Works

### Document Registration
1. User exports PDF → SHA-256 hash generated
2. User connects MetaMask wallet
3. User clicks "Register on Blockchain"
4. Smart contract stores hash with timestamp
5. Transaction hash provided for verification

### Document Verification
1. User uploads or provides document hash
2. User clicks "Verify Document"
3. Smart contract checks if hash exists
4. Returns verification result (Valid/Invalid)

### Tamper Detection
- Any modification to the PDF changes its SHA-256 hash
- Modified hash won't match the original hash on blockchain
- Verification will return "Invalid" for tampered documents

## Security Features

1. **Immutable Storage**: Once registered, hash cannot be modified
2. **Timestamp Verification**: Each hash includes registration timestamp
3. **Owner Tracking**: Each document is linked to the wallet that registered it
4. **Gas Optimization**: Minimal gas costs for registration and verification

## Cost Estimation

### Test Networks (Free)
- **Sepolia**: Free test ETH from faucets
- **Mumbai**: Free test MATIC from faucets
- **Arbitrum Sepolia**: Free test ETH from faucets

### Main Networks (Paid)
- **Ethereum**: ~$5-20 per registration (high gas fees)
- **Polygon**: ~$0.01-0.05 per registration (low gas fees)
- **Arbitrum**: ~$0.10-0.50 per registration (medium gas fees)

## Troubleshooting

### Common Issues

1. **MetaMask Not Found**
   - Install MetaMask browser extension
   - Refresh the page

2. **Wrong Network**
   - Switch to correct network in MetaMask
   - Add network if not available

3. **Insufficient Funds**
   - Get test ETH from faucet
   - Check wallet balance

4. **Contract Not Deployed**
   - Verify contract address in .env.local
   - Check if contract is deployed on correct network

### Error Messages

- **"User rejected transaction"**: User cancelled MetaMask transaction
- **"Contract not found"**: Wrong contract address or network
- **"Insufficient gas"**: Increase gas limit in MetaMask
- **"Document already registered"**: Hash already exists on blockchain

## Advanced Features

### Batch Registration
For multiple documents, consider implementing batch registration to save gas.

### Event Listening
Listen to blockchain events for real-time updates:

```javascript
contract.on("DocumentRegistered", (hash, hashString, timestamp, owner) => {
  console.log("New document registered:", hashString);
});
```

### Off-chain Verification
For faster verification, implement off-chain caching with periodic blockchain sync.

## Production Considerations

1. **Network Selection**: Choose based on cost, speed, and security requirements
2. **Gas Optimization**: Implement batch operations for multiple documents
3. **Error Handling**: Robust error handling for network issues
4. **User Experience**: Clear instructions and loading states
5. **Security**: Validate all inputs and handle edge cases

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review smart contract code
3. Test on test networks first
4. Check network status and gas prices
