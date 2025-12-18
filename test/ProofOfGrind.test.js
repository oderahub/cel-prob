const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofOfGrind", function () {
  let proofOfGrind;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const ProofOfGrind = await ethers.getContractFactory("ProofOfGrind");
    proofOfGrind = await ProofOfGrind.deploy();
    await proofOfGrind.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should allow free mint", async function () {
      await proofOfGrind.connect(user1).mint();
      expect(await proofOfGrind.balanceOf(user1.address)).to.equal(1);
    });

    it("Should not allow double mint", async function () {
      await proofOfGrind.connect(user1).mint();
      await expect(proofOfGrind.connect(user1).mint()).to.be.revertedWith("Already minted");
    });

    it("Should initialize stats correctly", async function () {
      await proofOfGrind.connect(user1).mint();
      const stats = await proofOfGrind.getGrinderStats(user1.address);
      expect(stats.totalGrinds).to.equal(0);
      expect(stats.currentStreak).to.equal(0);
      expect(stats.tier).to.equal(0);
    });
  });

  describe("Grinding", function () {
    beforeEach(async function () {
      await proofOfGrind.connect(user1).mint();
    });

    it("Should allow grinding after mint", async function () {
      await proofOfGrind.connect(user1).grind();
      const stats = await proofOfGrind.getGrinderStats(user1.address);
      expect(stats.totalGrinds).to.equal(1);
      expect(stats.currentStreak).to.equal(1);
    });

    it("Should enforce cooldown", async function () {
      await proofOfGrind.connect(user1).grind();
      await expect(proofOfGrind.connect(user1).grind()).to.be.revertedWith("Cooldown active");
    });

    it("Should award points for grinding", async function () {
      await proofOfGrind.connect(user1).grind();
      const stats = await proofOfGrind.getGrinderStats(user1.address);
      expect(stats.points).to.be.gt(0);
    });
  });

  describe("Boosting", function () {
    beforeEach(async function () {
      await proofOfGrind.connect(user1).mint();
      await proofOfGrind.connect(user2).mint();
    });

    it("Should allow boosting others", async function () {
      await proofOfGrind.connect(user1).boost(user2.address);
      const stats = await proofOfGrind.getGrinderStats(user2.address);
      expect(stats.points).to.equal(5);
    });

    it("Should give booster points too", async function () {
      await proofOfGrind.connect(user1).boost(user2.address);
      const stats = await proofOfGrind.getGrinderStats(user1.address);
      expect(stats.points).to.equal(2);
    });

    it("Should not allow self-boost", async function () {
      await expect(proofOfGrind.connect(user1).boost(user1.address)).to.be.revertedWith("Cannot self-boost");
    });
  });

  describe("Daily Check-in", function () {
    beforeEach(async function () {
      await proofOfGrind.connect(user1).mint();
    });

    it("Should award daily bonus", async function () {
      await proofOfGrind.connect(user1).dailyCheckIn();
      const stats = await proofOfGrind.getGrinderStats(user1.address);
      expect(stats.points).to.equal(25);
    });
  });

  describe("Token URI", function () {
    it("Should return valid metadata", async function () {
      await proofOfGrind.connect(user1).mint();
      const uri = await proofOfGrind.tokenURI(1);
      expect(uri).to.include("data:application/json;base64,");
    });
  });
});
