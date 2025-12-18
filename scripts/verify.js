const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const deploymentFile = `deployment-${hre.network.name}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found. Deploy first!");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("🔍 Verifying ProofOfGrind on", hre.network.name);
  console.log("Address:", deployment.address);

  try {
    await hre.run("verify:verify", {
      address: deployment.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
