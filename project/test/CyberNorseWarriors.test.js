const { expect } = require("chai");
const hre = require("hardhat");

describe('CyberNorseWarriors', () => {
  describe('Deployment', () => {
    it('checks ownership after deploy', async() => {    
      // Contracts are deployed using the first signer/account by default
      const [owner] = await ethers.getSigners();
  
      const CBW = await hre.ethers.getContractFactory('CyberNorseWarriors');
      const contract = await CBW.deploy();
      await contract.deployed();
  
      expect(await contract.owner()).to.equal(owner.address);
    });  
  });
});
