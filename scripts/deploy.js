const hre = require("hardhat");

async function main() {
  console.log("Deploying DocRegistry contract...");

  const DocRegistry = await hre.ethers.getContractFactory("DocRegistry");
  const docRegistry = await DocRegistry.deploy();

  await docRegistry.waitForDeployment();

  const address = await docRegistry.getAddress();
  console.log("DocRegistry deployed to:", address);
  console.log("Contract address for .env.local:", address);
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
