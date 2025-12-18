const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProofOfGrind to", hre.network.name, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "CELO\n");

  // Deploy contract
  const ProofOfGrind = await hre.ethers.getContractFactory("ProofOfGrind");
  const contract = await ProofOfGrind.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ ProofOfGrind deployed to:", address);
  console.log("\n📝 Next steps:");
  console.log("1. Verify contract: npm run verify:" + hre.network.name);
  console.log("2. Share the mint link to drive transactions!");
  console.log("\n🔗 Explorer:", getExplorerUrl(hre.network.name, address));

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contract: "ProofOfGrind",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-" + hre.network.name + ".json");
}

function getExplorerUrl(network, address) {
  if (network === "celo") {
    return `https://celoscan.io/address/${address}`;
  }
  return `https://alfajores.celoscan.io/address/${address}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
