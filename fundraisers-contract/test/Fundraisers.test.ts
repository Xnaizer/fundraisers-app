import { expect } from "chai";
import { ethers } from "hardhat";
import { Fundraisers, IDRX } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Fundraisers Contract", function () {
  let fundraisers: Fundraisers;
  let idrxToken: IDRX;
  let owner: SignerWithAddress;
  let pic: SignerWithAddress;
  let donor: SignerWithAddress;
  let otherUser: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseUnits("100000", 2); // 100000 * 10^2
  const TARGET_AMOUNT = ethers.parseUnits("1000", 2); // 1000 IDRX
  const DONATION_AMOUNT = ethers.parseUnits("500", 2); // 500 IDRX

  beforeEach(async function () {
    [owner, pic, donor, otherUser] = await ethers.getSigners();

    // Deploy IDRX Token
    const IDRXFactory = await ethers.getContractFactory("IDRX");
    idrxToken = await IDRXFactory.deploy(donor.address, owner.address);
    await idrxToken.waitForDeployment();

    // Deploy Fundraisers Contract
    const FundraisersFactory = await ethers.getContractFactory("Fundraisers");
    fundraisers = await FundraisersFactory.deploy(await idrxToken.getAddress());
    await fundraisers.waitForDeployment();

    // Approve fundraisers contract to spend donor's tokens
    await idrxToken.connect(donor).approve(await fundraisers.getAddress(), INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fundraisers.owner()).to.equal(owner.address);
    });

    it("Should set the correct IDRX token address", async function () {
      expect(await fundraisers.idrxToken()).to.equal(await idrxToken.getAddress());
    });

    it("Should initialize with zero total managed fund", async function () {
      expect(await fundraisers.totalManagedFund()).to.equal(0);
    });
  });

  describe("Program Management", function () {
    const programInput = {
      name: "Test Program",
      picName: "John Doe",
      target: TARGET_AMOUNT,
      desc: "Test Description",
      pic: "", // Will be set in tests
      category: "Education",
      programLink: "https://example.com",
      photoUrl: "https://example.com/photo.jpg"
    };

    beforeEach(function () {
      programInput.pic = pic.address;
    });

    describe("Create Program", function () {
      it("Should create a program successfully", async function () {
        await expect(fundraisers.connect(owner).createProgram(programInput))
          .to.emit(fundraisers, "ProgramCreated")
          .withArgs(0, programInput.name, programInput.target, programInput.pic);

        const programs = await fundraisers.getAllProgram();
        expect(programs.length).to.equal(1);
        expect(programs[0].name).to.equal(programInput.name);
        expect(programs[0].status).to.equal(1); // REGISTERED
      });

      it("Should fail if not called by admin", async function () {
        await expect(fundraisers.connect(pic).createProgram(programInput))
          .to.be.revertedWith("Only Admin can call this function!");
      });

      it("Should fail with empty program name", async function () {
        const invalidInput = { ...programInput, name: "" };
        await expect(fundraisers.connect(owner).createProgram(invalidInput))
          .to.be.revertedWith("Program name cannot be empty");
      });

      it("Should fail with zero target", async function () {
        const invalidInput = { ...programInput, target: 0 };
        await expect(fundraisers.connect(owner).createProgram(invalidInput))
          .to.be.revertedWith("Target must be greater than zero");
      });

      it("Should fail with zero PIC address", async function () {
        const invalidInput = { ...programInput, pic: ethers.ZeroAddress };
        await expect(fundraisers.connect(owner).createProgram(invalidInput))
          .to.be.revertedWith("PIC address cannot be zero");
      });
    });

    describe("Update Program", function () {
      beforeEach(async function () {
        await fundraisers.connect(owner).createProgram(programInput);
      });

      it("Should update program successfully", async function () {
        const updatedInput = { ...programInput, name: "Updated Program" };
        
        await expect(fundraisers.connect(owner).updateProgram(0, updatedInput))
          .to.emit(fundraisers, "ProgramUpdated")
          .withArgs(0, updatedInput.name, updatedInput.picName);

        const programs = await fundraisers.getAllProgram();
        expect(programs[0].name).to.equal("Updated Program");
      });

      it("Should fail with invalid program ID", async function () {
        await expect(fundraisers.connect(owner).updateProgram(999, programInput))
          .to.be.revertedWith("Invalid program ID");
      });

      it("Should fail if not called by admin", async function () {
        await expect(fundraisers.connect(pic).updateProgram(0, programInput))
          .to.be.revertedWith("Only Admin can call this function!");
      });
    });

    describe("Deactivate Program", function () {
      beforeEach(async function () {
        await fundraisers.connect(owner).createProgram(programInput);
      });

      it("Should deactivate program successfully", async function () {
        await fundraisers.connect(owner).deactivateProgram(0);
        const programs = await fundraisers.getAllProgram();
        expect(programs[0].status).to.equal(0); // INACTIVE
      });

      it("Should fail with invalid program ID", async function () {
        await expect(fundraisers.connect(owner).deactivateProgram(999))
          .to.be.revertedWith("Invalid program ID");
      });
    });
  });

  describe("Fund Management", function () {
    const programInput = {
      name: "Test Program",
      picName: "John Doe",
      target: TARGET_AMOUNT,
      desc: "Test Description",
      pic: "", // Will be set in beforeEach
      category: "Education",
      programLink: "https://example.com",
      photoUrl: "https://example.com/photo.jpg"
    };

    beforeEach(async function () {
      programInput.pic = pic.address;
      await fundraisers.connect(owner).createProgram(programInput);
    });

    describe("Send Fund", function () {
      it("Should accept fund donation", async function () {
        await expect(fundraisers.connect(donor).sendFund(DONATION_AMOUNT))
          .to.emit(fundraisers, "FundSent")
          .withArgs(donor.address, DONATION_AMOUNT);

        expect(await fundraisers.totalManagedFund()).to.equal(DONATION_AMOUNT);
      });

      it("Should fail with zero amount", async function () {
        await expect(fundraisers.connect(donor).sendFund(0))
          .to.be.revertedWith("Amount must be greater than zero");
      });

      // PERBAIKAN: Test untuk insufficient allowance
      it("Should fail with insufficient allowance", async function () {
        // otherUser tidak memiliki allowance untuk fundraisers contract
        await expect(fundraisers.connect(otherUser).sendFund(DONATION_AMOUNT))
          .to.be.revertedWithCustomError(idrxToken, "ERC20InsufficientAllowance");
      });

      // Test tambahan untuk insufficient balance
      it("Should fail with insufficient balance", async function () {
        // Berikan allowance tapi tidak ada balance
        await idrxToken.connect(otherUser).approve(await fundraisers.getAddress(), DONATION_AMOUNT);
        
        await expect(fundraisers.connect(otherUser).sendFund(DONATION_AMOUNT))
          .to.be.revertedWithCustomError(idrxToken, "ERC20InsufficientBalance");
      });
    });

    describe("Allocate Fund", function () {
      beforeEach(async function () {
        // Send enough funds to cover the target
        await fundraisers.connect(donor).sendFund(TARGET_AMOUNT);
      });

      it("Should allocate fund to program", async function () {
        await expect(fundraisers.connect(owner).allocateFund(0))
          .to.emit(fundraisers, "FundAllocated")
          .withArgs(0, TARGET_AMOUNT);

        const programs = await fundraisers.getAllProgram();
        expect(programs[0].status).to.equal(2); // ALLOCATED
        expect(programs[0].allocated).to.equal(TARGET_AMOUNT);
      });

      it("Should fail with insufficient balance", async function () {
        // Create another program that exceeds available balance
        const largeTargetInput = { ...programInput, target: ethers.parseUnits("2000", 2) };
        await fundraisers.connect(owner).createProgram(largeTargetInput);

        await expect(fundraisers.connect(owner).allocateFund(1))
          .to.be.revertedWith("Insufficient balance to allocate");
      });

      it("Should fail if not admin", async function () {
        await expect(fundraisers.connect(pic).allocateFund(0))
          .to.be.revertedWith("Only Admin can call this function!");
      });
    });

    describe("Withdraw Fund", function () {
      const withdrawAmount = ethers.parseUnits("200", 2);
      const withdrawHistory = "Payment for supplies";

      beforeEach(async function () {
        await fundraisers.connect(donor).sendFund(TARGET_AMOUNT);
        await fundraisers.connect(owner).allocateFund(0);
      });

      it("Should allow PIC to withdraw funds", async function () {
        const initialBalance = await idrxToken.balanceOf(pic.address);

        await expect(fundraisers.connect(pic).withdrawFund(0, withdrawHistory, withdrawAmount))
          .to.emit(fundraisers, "FundWithdrawn")
          .withArgs(0, pic.address, withdrawHistory, withdrawAmount);

        const finalBalance = await idrxToken.balanceOf(pic.address);
        expect(finalBalance - initialBalance).to.equal(withdrawAmount);

        const programs = await fundraisers.getAllProgram();
        expect(programs[0].allocated).to.equal(TARGET_AMOUNT - withdrawAmount);
      });

      it("Should record withdrawal history", async function () {
        await fundraisers.connect(pic).withdrawFund(0, withdrawHistory, withdrawAmount);
        
        const history = await fundraisers.getProgramHistory(0);
        expect(history.length).to.equal(1);
        expect(history[0].history).to.equal(withdrawHistory);
        expect(history[0].amount).to.equal(withdrawAmount);
      });

      it("Should fail if not PIC", async function () {
        await expect(fundraisers.connect(donor).withdrawFund(0, withdrawHistory, withdrawAmount))
          .to.be.revertedWith("You are not PIC of this program");
      });

      it("Should fail with empty history", async function () {
        await expect(fundraisers.connect(pic).withdrawFund(0, "", withdrawAmount))
          .to.be.revertedWith("History cannot be empty");
      });

      it("Should fail if amount exceeds allocated", async function () {
        const excessiveAmount = TARGET_AMOUNT + ethers.parseUnits("100", 2);
        await expect(fundraisers.connect(pic).withdrawFund(0, withdrawHistory, excessiveAmount))
          .to.be.revertedWith("Amount exceeds allocated fund");
      });
    });
  });

  describe("View Functions", function () {
    it("Should return all programs", async function () {
      const programInput = {
        name: "Test Program",
        picName: "John Doe",
        target: TARGET_AMOUNT,
        desc: "Test Description",
        pic: pic.address,
        category: "Education",
        programLink: "https://example.com",
        photoUrl: "https://example.com/photo.jpg"
      };

      await fundraisers.connect(owner).createProgram(programInput);
      
      const programs = await fundraisers.getAllProgram();
      expect(programs.length).to.equal(1);
    });

    it("Should return program history", async function () {
      const programInput = {
        name: "Test Program",
        picName: "John Doe",
        target: TARGET_AMOUNT,
        desc: "Test Description",
        pic: pic.address,
        category: "Education",
        programLink: "https://example.com",
        photoUrl: "https://example.com/photo.jpg"
      };

      await fundraisers.connect(owner).createProgram(programInput);
      
      const history = await fundraisers.getProgramHistory(0);
      expect(history.length).to.equal(0);
    });
  });
});