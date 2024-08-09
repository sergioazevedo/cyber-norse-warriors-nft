import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CNWModule = buildModule("CNWModule", (m) => {
  const CyberNorseWarriors =  m.contract(
    "CyberNorseWarriors", [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      10,
      "ipfs://bafybeidruvtfdzkrfrjo72scz74txmxjgdne5zwzblzztpu5vfuqp5yer4"
    ]
  );

  return { CyberNorseWarriors };
});

export default CNWModule;
