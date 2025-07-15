"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useContract } from "../hooks/useContract";

interface ContributeModalProps {
  onCardClose: () => void;
  isContributeOpen: boolean;
}

export default function ContributeModal({
  onCardClose,
  isContributeOpen,
}: ContributeModalProps) {
  const [amount, setAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userBalance, setUserBalance] = useState("0");
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const {
    sendDonation,
    getIDRXBalance,
    getCurrentAddress,
    checkConnection,
    getContract,
  } = useContract();

  // Move loadUserData inside useEffect to avoid dependency warning
  useEffect(() => {
    const loadUserData = async (): Promise<void> => {
      try {
        const isConnected = await checkConnection();
        if (!isConnected) {
          setError("Please connect your wallet first");
          return;
        }

        const address = await getCurrentAddress();
        if (address) {
          setCurrentAddress(address);
          const balance = await getIDRXBalance(address);
          setUserBalance(balance);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load wallet data");
      }
    };

    if (isContributeOpen) {
      document.body.style.overflow = "hidden";
      loadUserData();
    } else {
      document.body.style.overflow = "auto";
      resetForm();
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isContributeOpen]); // Remove loadUserData from dependencies

  const resetForm = (): void => {
    setAmount("");
    setError("");
    setSuccess("");
    setIsApproved(false);
    setIsApproving(false);
    setIsContributing(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError("");
    }
  };

  const validateAmount = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (parseFloat(amount) > parseFloat(userBalance)) {
      setError(`Insufficient balance. You have ${userBalance} IDRX`);
      return false;
    }

    return true;
  };

  const handleApprove = async (): Promise<void> => {
    try {
      setError("");

      if (!validateAmount()) return;

      const isConnected = await checkConnection();
      if (!isConnected) {
        setError("Please connect your wallet first");
        return;
      }

      setIsApproving(true);

      const idrxContract = await getContract("IDRX");
      const { CONTRACT_ADDRESSES } = await import(
        "../../contracts/contractConfig"
      );

      const { ethers } = await import("ethers");
      const amountInWei = ethers.parseUnits(amount, 2);

      console.log("🔄 Approving IDRX spending...");
      const approveTx = await idrxContract.approve(
        CONTRACT_ADDRESSES.FUNDRAISERS,
        amountInWei
      );

      console.log("⏳ Waiting for approval confirmation...");
      await approveTx.wait();

      console.log("✅ Approval confirmed");
      setIsApproved(true);
      setSuccess("IDRX spending approved! Now you can contribute.");
    } catch (error) {
      console.error("❌ Error approving IDRX:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("user rejected")) {
        setError("Transaction was rejected by user");
      } else {
        setError(`Approval failed: ${errorMessage}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleContribute = async (): Promise<void> => {
    try {
      setError("");
      setSuccess("");

      if (!validateAmount()) return;

      if (!isApproved) {
        setError("Please approve IDRX spending first");
        return;
      }

      const isConnected = await checkConnection();
      if (!isConnected) {
        setError("Please connect your wallet first");
        return;
      }

      setIsContributing(true);

      console.log("🔄 Contributing to Fundraisers...");
      const txHash = await sendDonation(amount);

      console.log("✅ Contribution successful:", txHash);
      setSuccess(
        `Contribution successful! Transaction: ${txHash.slice(0, 10)}...`
      );

      if (currentAddress) {
        const newBalance = await getIDRXBalance(currentAddress);
        setUserBalance(newBalance);
      }

      setTimeout(() => {
        resetForm();
        onCardClose();
      }, 3000);
    } catch (error) {
      console.error("❌ Error contributing:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("user rejected")) {
        setError("Transaction was rejected by user");
      } else {
        setError(`Contribution failed: ${errorMessage}`);
      }
    } finally {
      setIsContributing(false);
    }
  };

  const handleUseMax = (): void => {
    setAmount(userBalance);
  };

  const isLoading = isApproving || isContributing;

  return (
<div className="bg-black/40 min-h-screen w-full fixed z-50 inset-0 flex items-start sm:items-center justify-center shadow-2xl p-2 sm:p-4 md:p-6">
  <div
    className="bg-black text-white w-full max-w-[96%] xs:max-w-[94%] sm:max-w-[90%] md:max-w-xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 pt-12 sm:pt-14 md:pt-16 rounded-lg sm:rounded-xl md:rounded-2xl relative mt-20 xs:mt-16 sm:mt-8 md:mt-0 max-h-[90vh] xs:max-h-[92vh] sm:max-h-[95vh] md:max-h-none overflow-y-auto"
    style={{ boxShadow: "0 0 10px 1px rgba(0, 0, 0, 1)" }}
  >
    <button
      onClick={onCardClose}
      className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-neutral-400 hover:text-white transition cursor-pointer p-1.5 sm:p-2 hover:bg-neutral-900/90 bg-neutral-800/90 rounded-full"
      disabled={isLoading}
    >
      <X className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
    </button>

    <h2 className="text-center text-base sm:text-lg md:text-xl font-thin mb-3 sm:mb-4 md:mb-6 lg:mb-8">
      Contribute To <span className="text-cyan-400">Fund</span>raisers
    </h2>

    <p className="font-thin text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6 md:mb-8">
      Fundraisers will receive the IDRX stablecoin you contribute to us.
      Once a program reaches its funding target, we will allocate the
      collected funds to the program&apos;s PIC (Person In Charge). You will
      be able to monitor each withdrawal made by the PIC and track exactly
      how the funds are being used, ensuring full transparency and
      accountability.
    </p>

    {/* Balance Display */}
    {currentAddress && (
      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-neutral-800/50 rounded-lg border border-cyan-500/30">
        <p className="text-xs sm:text-sm text-neutral-300">
          Your IDRX Balance:{" "}
          <span className="text-cyan-400 font-medium break-words">
            {userBalance} IDRX
          </span>
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">
          Wallet: {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
        </p>
      </div>
    )}

    <div className="relative">
      <input
        className="bg-black/80 w-full placeholder:text-white placeholder:font-thin p-2.5 sm:p-3 rounded-lg text-white font-thin border-[2.5px] border-blue-500 mb-1.5 sm:mb-2 placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base text-sm sm:text-base"
        placeholder="Enter Amount (IDRX)"
        type="text"
        value={amount}
        onChange={handleAmountChange}
        disabled={isLoading}
      />
      <div className="text-right mb-3 sm:mb-4">
        <button
          onClick={handleUseMax}
          className="text-xs text-cyan-400 hover:text-cyan-300 underline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Use Max
        </button>
      </div>
    </div>

    {/* Error Message */}
    {error && (
      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400 text-xs sm:text-sm break-words">{error}</p>
      </div>
    )}

    {/* Success Message */}
    {success && (
      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-green-400 text-xs sm:text-sm break-words">{success}</p>
      </div>
    )}

    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full items-center">
      {/* Approve Button */}
      <button
        className={`text-white font-light border-[2.5px] sm:border-[3px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl h-10 sm:h-12 text-xs sm:text-sm md:text-base w-full max-w-xs sm:max-w-sm md:max-w-64 transition-all duration-300 flex items-center justify-center ${
          isApproved
            ? "border-green-500 bg-green-500/20 text-green-400"
            : "border-cyan-500 hover:border-cyan-600 hover:bg-cyan-500"
        } ${
          isApproving || isApproved
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }`}
        onClick={handleApprove}
        type="button"
        disabled={isLoading || isApproved}
      >
        {isApproving ? (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="hidden xs:inline">Approving...</span>
            <span className="xs:hidden">Approving</span>
          </div>
        ) : isApproved ? (
          <span className="flex items-center gap-1">
            <span>✅</span>
            <span className="hidden xs:inline">IDRX Approved</span>
            <span className="xs:hidden">Approved</span>
          </span>
        ) : (
          <span>
            <span className="hidden xs:inline">Approve IDRX</span>
            <span className="xs:hidden">Approve</span>
          </span>
        )}
      </button>

      {/* Contribute Button */}
      <button
        className={`text-white font-light border-[2.5px] sm:border-[3px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl h-10 sm:h-12 text-xs sm:text-sm md:text-base w-full max-w-xs sm:max-w-sm md:max-w-64 transition-all duration-300 flex items-center justify-center ${
          !isApproved
            ? "border-gray-500 bg-gray-500/20 text-gray-400 cursor-not-allowed"
            : "border-cyan-500 hover:border-cyan-600 hover:bg-cyan-500"
        } ${isContributing ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleContribute}
        type="button"
        disabled={isLoading || !isApproved}
      >
        {isContributing ? (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="hidden xs:inline">Contributing...</span>
            <span className="xs:hidden">Contributing</span>
          </div>
        ) : (
          "Contribute"
        )}
      </button>
    </div>

    {/* Instructions */}
    <div className="mt-4 sm:mt-6 text-xs text-neutral-400 text-center space-y-0.5">
      <p>Step 1: Approve IDRX spending</p>
      <p>Step 2: Contribute to platform</p>
    </div>
  </div>
</div>
  );
}