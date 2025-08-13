const { ethers } = require("hardhat");

async function main() {
  console.log("Starting quick deployment to built-in Hardhat network...");
  
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
  console.log("\n=== CONFIGURATION ===");
  console.log("Contract Address:", address);
  console.log("Network: Built-in Hardhat");
  console.log("Chain ID: 31337");
  console.log("\n=== ENV FILE CONTENT ===");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("NEXT_PUBLIC_NETWORK_ID=31337");
  console.log("NEXT_PUBLIC_NETWORK_NAME=Hardhat Local");
  console.log("NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545");
  console.log("\n=== META MASK CONFIG ===");
  console.log("Network Name: Hardhat Local");
  console.log("RPC URL: http://127.0.0.1:8545");
  console.log("Chain ID: 31337");
  console.log("Currency Symbol: ETH");
  console.log("\n=== IMPORT ACCOUNT ===");
  console.log("Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
