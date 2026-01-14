import { viem } from "hardhat";

import Artifact from "../artifacts/contracts/simple-storage.sol/SimpleStorage.json";

async function main() {
  const [walletClient] = await viem.getWalletClients();

  const publicClient = await viem.getPublicClient();

  console.log("Deploying with account:", walletClient.account.address);

  const hash = await walletClient.deployContract({
    abi: Artifact.abi,
    bytecode: Artifact.bytecode as `0x${string}`,
    args: [],
  });

  console.log("Deployment tx hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  console.log("✅ SimpleStorage deployed at:", receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});