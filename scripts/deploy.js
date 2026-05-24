const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of VulnVaultRegistry...");

  const VulnVaultRegistry = await hre.ethers.getContractFactory("VulnVaultRegistry");
  const registry = await VulnVaultRegistry.deploy();

  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("VulnVaultRegistry deployed to:", registryAddress);
  console.log("\n==================================================");
  console.log(`Copy this address: ${registryAddress}`);
  console.log("Update VULNVAULT_REGISTRY in src/lib/contracts.ts with it!");
  console.log("==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
