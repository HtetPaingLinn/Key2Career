const { ethers } = require("hardhat");

async function main() {
  console.log("Testing DocRegistry contract...");
  
  // Get the first signer (account)
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  
  // Get the contract instance
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const DocRegistry = await ethers.getContractFactory("DocRegistry");
  const contract = DocRegistry.attach(contractAddress);
  
  // Test documentExists function
  const testHash = "test123";
  console.log("\nTesting documentExists with hash:", testHash);
  
  try {
    const exists = await contract.documentExists(testHash);
    console.log("documentExists result:", exists);
  } catch (error) {
    console.error("documentExists error:", error.message);
  }
  
  // Test getDocument function
  console.log("\nTesting getDocument with hash:", testHash);
  try {
    const doc = await contract.getDocument(testHash);
    console.log("getDocument result:", doc);
  } catch (error) {
    console.error("getDocument error:", error.message);
  }
  
  // Test verifyDocument function
  console.log("\nTesting verifyDocument with hash:", testHash);
  try {
    const isValid = await contract.verifyDocument(testHash);
    console.log("verifyDocument result:", isValid);
  } catch (error) {
    console.error("verifyDocument error:", error.message);
  }
  
  // Test registerDocument function
  console.log("\nTesting registerDocument with hash:", testHash);
  try {
    const tx = await contract.registerDocument(testHash);
    const receipt = await tx.wait();
    console.log("registerDocument success! Transaction hash:", receipt.hash);
  } catch (error) {
    console.error("registerDocument error:", error.message);
  }
  
  // Test documentExists again after registration
  console.log("\nTesting documentExists again after registration");
  try {
    const exists = await contract.documentExists(testHash);
    console.log("documentExists result after registration:", exists);
  } catch (error) {
    console.error("documentExists error after registration:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
