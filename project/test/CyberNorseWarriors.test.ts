import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { CyberNorseWarriors } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse } from "ethers";

interface IContract {
  owner: HardhatEthersSigner;
  secondAccount: HardhatEthersSigner;
  otherAccounts: Array<HardhatEthersSigner>;
  contract: CyberNorseWarriors & {
    deploymentTransaction(): ContractTransactionResponse;
  }
};


describe("CyberNorseWarriors", async () => {
  //Fixture
  async function deployContract() {
    const contractFactory = await hre.ethers.getContractFactory("CyberNorseWarriors");
    const [owner, secondAccount, ...otherAccounts] = await ethers.getSigners();

    const contract = await contractFactory.deploy(owner, 30, "ipfs://abc");
    await contract.waitForDeployment();

    return {
      contract,
      owner,
      secondAccount,
      otherAccounts
    }
  };

  describe("When deploying...", async () => {
    it("must be owned by the acocunt used in the deploy", async () => {
      // Contracts are deployed using the first signer/account by default
      const {
        contract,
        owner,
        secondAccount
      } = await loadFixture<IContract>(deployContract);

      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.owner()).not.equal(secondAccount.address);
    });
  });

  describe("maxSupply", () => {

    it("returns the initial supply defined during the deploy if called by the Owner address", async () => {
      const { contract } = await loadFixture<IContract>(deployContract);

      expect(await contract.maxSupply()).to.equal(30);
    });

    it("must fail/revert when called by a non Owner address", async () => {
      const { contract, secondAccount } = await loadFixture<IContract>(deployContract);
      await expect(contract.connect(secondAccount).maxSupply()).to.be.reverted;
    });
  });

  describe("bumpSupply", () => {
    it("emits NFTBatchAdded event", async () => {
      const { contract } = await loadFixture<IContract>(deployContract);
      await expect(
        contract.bumpSupply(10, "ipfs://zxy")
      ).to.emit(
        contract, "NFTBatchAdded"
      ).withArgs(
        10,
        "ipfs://zxy",
      );
    });

    context("Validations", async () => {
      it("must fail/revert when called by a non Owner address", async () => {
        const { contract, secondAccount } = await loadFixture<IContract>(deployContract);
        await expect(contract.connect(secondAccount).bumpSupply(10, "ipfs://zxy")).to.be.reverted;
      });

      it("must fail/revert when called with max supply 0", async () => {
        const { contract } = await loadFixture<IContract>(deployContract);
        await expect(
          contract.bumpSupply(0, "ipfs://zxy")
        ).to.be.revertedWith("new supply must be greather than 0");
      });

      it("must fail/revert when called with empty metdatada uri", async() => {
        const { contract } = await loadFixture<IContract>(deployContract);
        await expect(
          contract.bumpSupply(20, "")
        ).to.be.revertedWith('metdata URI should be defined');
      });

      it("must fail/revert if the bumpSupply is locked", async() => {
        const { contract } = await loadFixture<IContract>(deployContract);
        //this operation will lock bumpSupply
        await contract.bumpSupply(10, "ipfs://zxy");

        await expect(
          contract.bumpSupply(40, "ipfs://some-other-uri")
        ).to.be.revertedWith('Supply bumps are currently locked!');
      });
    });
  });

  describe("bumpSupplyAvaiable", () => {
    it("returns true if thre is a free batch slot avaiable", async () => {
      const { contract } = await loadFixture<IContract>(deployContract);
      expect(
        await contract.bumpSupplyAvaiable()
      ).to.be.true
    });

    it("returns false if thre is no free batch slot avaiable", async () => {
      const { contract } = await loadFixture<IContract>(deployContract);
      await contract.bumpSupply(20, "ipfs://xpto");
      expect(
        await contract.bumpSupplyAvaiable()
      ).to.be.false
    });
  })
});
