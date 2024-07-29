import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";
import { CyberNorseWarriors, CyberNorseWarriors__factory, openzeppelin } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse } from "ethers";

let contractFactory: CyberNorseWarriors__factory;
let firstAccount: HardhatEthersSigner;
let secondAccount: HardhatEthersSigner;
let otherAccounts: HardhatEthersSigner[];

interface OwnableError {
  address: string;
}

describe("CyberNorseWarriors", async () => {
  beforeEach(async () => {
    contractFactory = await hre.ethers.getContractFactory("CyberNorseWarriors");
    [firstAccount, secondAccount, ...otherAccounts] = await ethers.getSigners();
  });

  describe("When deploying...", async () => {
    it("must be owned by the acocunt used in the deploy", async () => {
      // Contracts are deployed using the first signer/account by default
      const contract = await contractFactory.deploy(firstAccount, 30, "ipfs://abc");
      await contract.waitForDeployment();

      expect(await contract.owner()).to.equal(firstAccount.address);
      expect(await contract.owner()).not.equal(secondAccount.address);
    });
  });

  describe("maxSupply", () => {
    let owner: HardhatEthersSigner;
    let contract: CyberNorseWarriors & { deploymentTransaction(): ContractTransactionResponse };

    before(async () => {
      owner = firstAccount;
      contract = await contractFactory.deploy(owner, 30, "ipfs://abc");
      await contract.waitForDeployment();
    });

    it("returns the initial supply defined during the deploy if called by the Owner address", async () => {
      expect(await contract.maxSupply()).to.equal(30);
    });

    it("must fail/revert when called by a non Owner address", async () => {
      await expect(contract.connect(secondAccount).maxSupply()).to.be.reverted;
    });
  });

  describe("bumpSupply", () => {
    let owner: HardhatEthersSigner;
    let contract: CyberNorseWarriors & { deploymentTransaction(): ContractTransactionResponse };

    beforeEach(async () => {
      owner = firstAccount;
      contract = await contractFactory.deploy(owner, 30, "ipfs://abc");
      await contract.waitForDeployment();
    });

    it("must fail/revert when called by a non Owner address", async () => {
      await expect(contract.connect(secondAccount).bumpSupply(10, "ipfs://zxy")).to.be.reverted;
    });

    it("must fail/revert when called with max supply 0", async () => {
      await expect(
        contract.bumpSupply(0, "ipfs://zxy")
      ).to.be.revertedWith("new supply must be greather than 0");
    });

    it("must fail/revert when called with empty metdatada uri", async() => {
      await expect(
        contract.bumpSupply(20, "")
      ).to.be.revertedWith('metdata URI should be defined');
    });
  });
});
