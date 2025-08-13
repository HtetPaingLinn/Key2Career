const { ethers } = require("hardhat");

async function main() {
  console.log("Starting local blockchain network...");
  
  // Get the first signer (account)
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  // Deploy the contract
  const DocRegistry = await ethers.getContractFactory("DocRegistry");
  const docRegistry = await DocRegistry.deploy();
  
  await docRegistry.waitForDeployment();
  const address = await docRegistry.getAddress();
  
  console.log("DocRegistry deployed to:", address);
  console.log("\n=== LOCAL NETWORK INFO ===");
  console.log("Network: Local Hardhat");
  console.log("Chain ID: 31337");
  console.log("RPC URL: http://127.0.0.1:8545");
  console.log("Contract Address:", address);
  console.log("Deployer Address:", deployer.address);
  console.log("\n=== META MASK CONFIG ===");
  console.log("Add this network to MetaMask:");
  console.log("- Network Name: Hardhat Local");
  console.log("- RPC URL: http://127.0.0.1:8545");
  console.log("- Chain ID: 31337");
  console.log("- Currency Symbol: ETH");
  console.log("\n=== IMPORT ACCOUNT ===");
  console.log("Import this private key to MetaMask:");
  console.log("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("\n=== ENV FILE CONTENT ===");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("NEXT_PUBLIC_NETWORK_ID=31337");
  console.log("NEXT_PUBLIC_NETWORK_NAME=Hardhat Local");
  console.log("NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
