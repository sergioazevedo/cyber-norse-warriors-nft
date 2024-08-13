// inside scripts/async-deploy.js
import hre from "hardhat";

import CNWModule from "../ignition/modules/CyberNorseWarriors"

async function main() {
  const { CyberNorseWarriors } = await hre.ignition.deploy(CNWModule);
  console.log( await CyberNorseWarriors.getAddress())

  await hre.ethernal.push({
      name: 'CyberNorseWarriors',
      address: await CyberNorseWarriors.getAddress(),
      workspace: 'Workspace' // Optional, will override the workspace set in hardhat.config for this call only
  });
};

main().catch(console.error)