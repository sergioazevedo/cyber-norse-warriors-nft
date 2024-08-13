import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import 'dotenv/config'

const CNWModule = buildModule("CNWModule", (m) => {
  const owner : string = process.env.OWNER_ADDRESS as string;
  const metadataURI: string = process.env.METADATA_URI as string;
  const CyberNorseWarriors =  m.contract(
    "CyberNorseWarriors", [
      owner,
      10,
      metadataURI,
    ]
  );

  return { CyberNorseWarriors };
});

export default CNWModule;
