import { expect } from "chai";
import { ethers } from "hardhat";
import { IDRX } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("IDRX Token Contract", function () {
  let idrxToken: IDRX;
  let owner: SignerWithAddress;
  let recipient: SignerWithAddress;
  let otherUser: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseUnits("100000", 2); // 100000 * 10^2

  beforeEach(async function () {
    [owner, recipient, otherUser] = await ethers.getSigners();

    const IDRXFactory = await ethers.getContractFactory("IDRX");
    idrxToken = await IDRXFactory.deploy(recipient.address, owner.address);
    await idrxToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await idrxToken.name()).to.equal("IDRX");
      expect(await idrxToken.symbol()).to.equal("IDRX");
    });

    it("Should set the right owner", async function () {
      expect(await idrxToken.owner()).to.equal(owner.address);
    });

    it("Should mint initial supply to recipient", async function () {
      expect(await idrxToken.balanceOf(recipient.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should have correct total supply", async function () {
      expect(await idrxToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("Minting", function () {
    const mintAmount = ethers.parseUnits("1000", 2);

    it("Should allow owner to mint tokens", async function () {
      const initialBalance = await idrxToken.balanceOf(otherUser.address);
      const initialSupply = await idrxToken.totalSupply();

      await idrxToken.connect(owner).mint(otherUser.address, mintAmount);

      expect(await idrxToken.balanceOf(otherUser.address)).to.equal(initialBalance + mintAmount);
      expect(await idrxToken.totalSupply()).to.equal(initialSupply + mintAmount);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(idrxToken.connect(otherUser).mint(otherUser.address, mintAmount))
        .to.be.revertedWithCustomError(idrxToken, "OwnableUnauthorizedAccount")
        .withArgs(otherUser.address);
    });

    it("Should emit Transfer event when minting", async function () {
      await expect(idrxToken.connect(owner).mint(otherUser.address, mintAmount))
        .to.emit(idrxToken, "Transfer")
        .withArgs(ethers.ZeroAddress, otherUser.address, mintAmount);
    });
  });

  describe("ERC20 Functionality", function () {
    const transferAmount = ethers.parseUnits("100", 2);

    it("Should transfer tokens between accounts", async function () {
      const initialRecipientBalance = await idrxToken.balanceOf(recipient.address);
      const initialOtherBalance = await idrxToken.balanceOf(otherUser.address);

      await idrxToken.connect(recipient).transfer(otherUser.address, transferAmount);

      expect(await idrxToken.balanceOf(recipient.address)).to.equal(initialRecipientBalance - transferAmount);
      expect(await idrxToken.balanceOf(otherUser.address)).to.equal(initialOtherBalance + transferAmount);
    });

    it("Should fail transfer with insufficient balance", async function () {
      await expect(idrxToken.connect(otherUser).transfer(recipient.address, transferAmount))
        .to.be.revertedWithCustomError(idrxToken, "ERC20InsufficientBalance");
    });

    it("Should approve and transferFrom", async function () {
      await idrxToken.connect(recipient).approve(otherUser.address, transferAmount);
      
      expect(await idrxToken.allowance(recipient.address, otherUser.address)).to.equal(transferAmount);

      await idrxToken.connect(otherUser).transferFrom(recipient.address, owner.address, transferAmount);

      expect(await idrxToken.balanceOf(owner.address)).to.equal(transferAmount);
      expect(await idrxToken.allowance(recipient.address, otherUser.address)).to.equal(0);
    });
  });

  describe("ERC20Permit Functionality", function () {
    it("Should have correct domain separator", async function () {
      const domainSeparator = await idrxToken.DOMAIN_SEPARATOR();
      expect(domainSeparator).to.not.equal(ethers.ZeroHash);
    });

    it("Should return correct nonces", async function () {
      expect(await idrxToken.nonces(recipient.address)).to.equal(0);
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await idrxToken.connect(owner).transferOwnership(otherUser.address);
      expect(await idrxToken.owner()).to.equal(otherUser.address);
    });

    it("Should renounce ownership", async function () {
      await idrxToken.connect(owner).renounceOwnership();
      expect(await idrxToken.owner()).to.equal(ethers.ZeroAddress);
    });
  });
});