import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { CyberNorseWarriors } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

interface IFixtures {
  owner: HardhatEthersSigner;
  secondAccount: HardhatEthersSigner;
  otherAccounts: Array<HardhatEthersSigner>;
  contract: CyberNorseWarriors;
};

describe("CyberNorseWarriors", async () => {
  //Fixture
  async function deployContract() : Promise<IFixtures> {
    const contractFactory = await hre.ethers.getContractFactory("CyberNorseWarriors");
    const [owner, secondAccount, ...otherAccounts] = await ethers.getSigners();

    const contract = await contractFactory.deploy(owner, 5, "ipfs://abc");
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
      } = await loadFixture<IFixtures>(deployContract);

      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.owner()).not.equal(secondAccount.address);
    });
  });

  describe("maxSupply", () => {
    it("must fail/revert when called by a non Owner address", async () => {
      const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);
      await expect(contract.connect(secondAccount).maxSupply()).to.be.reverted;
    });

    context("after deploy", () => {
      it("returns the supply defined during the deploy", async () => {
        const { contract } = await loadFixture<IFixtures>(deployContract);

        expect(await contract.maxSupply()).to.equal(5);
      });
    });

    context("after a bumpSupply operation", () => {
      it("returns the total supply (intital supply + new supply)", async () => {
        const { contract } = await loadFixture<IFixtures>(deployContract);
        await contract.bumpSupply(50, "ipfs://some-uri");

        expect(await contract.maxSupply()).to.equal(55);
      });
    });
  });

  describe("bumpSupply", () => {
    it("emits NFTBatchAdded event", async () => {
      const { contract } = await loadFixture<IFixtures>(deployContract);
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
        const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);
        await expect(contract.connect(secondAccount).bumpSupply(10, "ipfs://zxy")).to.be.reverted;
      });

      it("must fail/revert when called with max supply 0", async () => {
        const { contract } = await loadFixture<IFixtures>(deployContract);
        await expect(
          contract.bumpSupply(0, "ipfs://zxy")
        ).to.be.revertedWith("new supply must be greather than 0");
      });

      it("must fail/revert when called with empty metdatada uri", async() => {
        const { contract } = await loadFixture<IFixtures>(deployContract);
        await expect(
          contract.bumpSupply(20, "")
        ).to.be.revertedWith('metdata URI should be defined');
      });

      it("must fail/revert if the bumpSupply is locked", async() => {
        const { contract } = await loadFixture<IFixtures>(deployContract);
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
      const { contract } = await loadFixture<IFixtures>(deployContract);
      expect(
        await contract.bumpSupplyAvaiable()
      ).to.be.true
    });

    it("returns false if thre is no free batch slot avaiable", async () => {
      const { contract } = await loadFixture<IFixtures>(deployContract);
      await contract.bumpSupply(20, "ipfs://xpto");
      expect(
        await contract.bumpSupplyAvaiable()
      ).to.be.false
    });
  });

  describe("safeMint", () => {
    it("fails/reverts if destination account doesn't have enougth funds", async () => {
      const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);

      await expect(contract.safeMint(secondAccount, {value: 0})).to.revertedWith("Insufient Funds");
    });

    it("fails if NFT supply is depleeted", async() => {
      const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);
      // this code ensures that the intial supply is minted
      for (let index = 0; index <= 4; index++) {
        await contract.safeMint(secondAccount,{ value: ethers.parseEther("0.003") });
      };

      await expect(
        contract.safeMint(secondAccount,{ value: ethers.parseEther("0.003") })
      ).to.be.revertedWith("Sorry, all items are gone.")
    });

    context("When destination account has sufficient funds to mint a token", () => {
      it("emtis Transfer event", async () => {
        const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);

        await expect(
          contract.safeMint(secondAccount,{ value: ethers.parseEther("0.003") })
        ).to
          .emit(contract, "Transfer")
          .withArgs(ethers.ZeroAddress, secondAccount, 1);
      });

      it("mints a new token that belongs to secondAccount", async () => {
        const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);
        await contract.safeMint(secondAccount, { value: ethers.parseEther("0.003") });

        expect( await contract.ownerOf(1) ).to.be.equal( secondAccount );
      });

      it("assigns the currentBatch MetadataURI to the new minted token", async () => {
        const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);
        await contract.safeMint(secondAccount, { value: ethers.parseEther("0.003") });

        expect( await contract.tokenURI(1) ).to.be.equal( "ipfs://abc" );
      });

      it("ensures that minted tokens will use the new batch metadatadaURI when a batch is rotated", async () => {
        const { contract, secondAccount } = await loadFixture<IFixtures>(deployContract);
        // this code ensures that the intial supply is minted
        for (let index = 0; index <= 4; index++) {
          await contract.safeMint(secondAccount,{ value: ethers.parseEther("0.003") });
        };

        await contract.bumpSupply(10, "ipfs://xyz.zk");
        // must trigger the new batch
        await contract.safeMint(secondAccount, { value: ethers.parseEther("0.003") });

        expect( await contract.tokenURI(5) ).to.be.equal("ipfs://abc");
        expect( await contract.tokenURI(6) ).to.be.equal("ipfs://xyz.zk");
      });
    });
  });

});