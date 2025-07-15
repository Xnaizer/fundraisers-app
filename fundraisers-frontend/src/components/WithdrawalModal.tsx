// components/WithdrawalModal.tsx
"use client"

import { useState, useEffect } from "react";
import { X, Wallet, AlertTriangle, Info } from 'lucide-react';
import { ProgramType } from "@/constants/ProgramData.constant";
import { useContract } from "../hooks/useContract";

interface WithdrawalModalProps {
  onClose: () => void;
  program: ProgramType | null;
  isOpen: boolean;
}

export default function WithdrawalModal({ onClose, program, isOpen }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remainingFund, setRemainingFund] = useState('0');
  const [isLoadingFund, setIsLoadingFund] = useState(false);

  const { withdrawFund, getCurrentAddress, checkConnection } = useContract();

  useEffect(() => {
    if (isOpen && program) {
      fetchRemainingFund();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      resetForm();
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, program]);

  const fetchRemainingFund = async () => {
    if (!program) return;

    try {
      setIsLoadingFund(true);
      // Calculate remaining fund = allocated - withdrawn
      // For now, we'll use allocated amount as remaining (need actual calculation from contract)
      setRemainingFund(program.allocated);
    } catch (error) {
      console.error('Error fetching remaining fund:', error);
      setRemainingFund('0');
    } finally {
      setIsLoadingFund(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setError('');
    setSuccess('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (parseFloat(amount) > parseFloat(remainingFund)) {
      setError(`Insufficient fund. Available: ${remainingFund} IDRX`);
      return false;
    }

    if (!description.trim()) {
      setError('Please provide a description for this withdrawal');
      return false;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!program || !validateForm()) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      // Check if user is connected and is the PIC
      const isConnected = await checkConnection();
      if (!isConnected) {
        setError('Please connect your wallet first');
        return;
      }

      const currentAddress = await getCurrentAddress();
      if (!currentAddress) {
        setError('Could not get wallet address');
        return;
      }

      if (currentAddress.toLowerCase() !== program.pic.toLowerCase()) {
        setError('Only the Program PIC can withdraw funds');
        return;
      }

      console.log('🔍 Withdrawing fund from program:', program.id);
      console.log('💰 Amount:', amount, 'IDRX');
      console.log('📝 Description:', description);

      const txHash = await withdrawFund(Number(program.id), description.trim(), amount);
      
      setSuccess(`Withdrawal successful! Transaction: ${txHash.slice(0, 10)}...`);
      console.log('✅ Withdrawal successful');
      
      // Refresh after success
      setTimeout(() => {
        resetForm();
        onClose();
        window.location.reload();
      }, 3000);

    } catch (error: unknown) {
      console.error('❌ Error withdrawing fund:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('user rejected')) {
        setError('Transaction was rejected by user');
      } else {
        setError(`Withdrawal failed: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    return num.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (!isOpen || !program) return null;

  return (
<div className="bg-black/40 min-h-screen w-full fixed z-50 inset-0 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12">
  <div
    className="bg-black text-white w-full max-w-[96%] xs:max-w-[94%] sm:max-w-[90%] md:max-w-2xl rounded-lg sm:rounded-xl md:rounded-2xl mt-20 xs:mt-16 sm:mt-8 md:mt-0 relative shadow-lg overflow-hidden max-h-[90vh] xs:max-h-[92vh] sm:max-h-[95vh] md:max-h-none overflow-y-auto"
    style={{ boxShadow: '0 0 10px 1px rgba(0, 0, 0, 1)' }}
  >
    {/* Header */}
    <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-neutral-700">
      <div className="flex-1 min-w-0">
        <h3 className="text-base sm:text-lg md:text-xl font-thin flex items-center gap-1.5 sm:gap-2">
          <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-green-400 flex-shrink-0" />
          <span className="truncate">Withdraw Fund</span>
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 truncate">{program.name}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-neutral-400 hover:text-white cursor-pointer p-1.5 sm:p-2 hover:bg-neutral-900/90 bg-neutral-800/90 rounded-full transition-colors flex-shrink-0 ml-2"
        disabled={isProcessing}
      >
        <X className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
      </button>
    </div>

    {/* Content */}
    <div className="p-3 sm:p-4 md:p-6">
      {/* Program Info */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-neutral-900 rounded-lg border border-neutral-800">
        <h4 className="text-xs sm:text-sm font-medium text-cyan-400 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <Info className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
          Program Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-neutral-400">Program ID</p>
            <p className="text-white font-mono break-all">{program.id}</p>
          </div>
          <div>
            <p className="text-neutral-400">PIC Name</p>
            <p className="text-white truncate">{program.picName}</p>
          </div>
          <div>
            <p className="text-neutral-400">Total Allocated</p>
            <p className="text-white font-medium break-words">{formatCurrency(program.allocated)} IDRX</p>
          </div>
          <div>
            <p className="text-neutral-400">Available to Withdraw</p>
            <p className="text-green-400 font-medium break-words">
              {isLoadingFund ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `${formatCurrency(remainingFund)} IDRX`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-1.5 sm:gap-2">
            <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400 text-xs sm:text-sm break-words">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-1.5 sm:gap-2">
            <div className="text-green-400 mt-0.5 text-sm sm:text-base">✅</div>
            <div className="flex-1 min-w-0">
              <p className="text-green-400 text-xs sm:text-sm font-medium">Success</p>
              <p className="text-green-300 text-xs sm:text-sm mt-0.5 sm:mt-1 break-words">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-3 sm:space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">
            Withdrawal Amount (IDRX) *
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={() => setAmount(remainingFund)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-cyan-400 hover:text-cyan-300 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-cyan-500/10 rounded transition-colors"
              disabled={isProcessing}
            >
              Max
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Available: {formatCurrency(remainingFund)} IDRX
          </p>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">
            Description/Purpose *
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError('');
            }}
            placeholder="Describe the purpose of this withdrawal (minimum 10 characters)"
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none text-sm sm:text-base"
            disabled={isProcessing}
          />
          <p className="text-xs text-neutral-400 mt-1">
            {description.length}/500 characters (minimum 10)
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors text-sm sm:text-base"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          onClick={handleWithdraw}
          disabled={isProcessing || !amount || !description.trim()}
          className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
        >
          {isProcessing ? (
            <>
              <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden xs:inline">Processing...</span>
              <span className="xs:hidden">Processing</span>
            </>
          ) : (
            <>
              <Wallet className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden xs:inline">Withdraw Fund</span>
              <span className="xs:hidden">Withdraw</span>
            </>
          )}
        </button>
      </div>

      {/* Warning */}
      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-1.5 sm:gap-2">
          <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-300">
            <p className="font-medium mb-1">Important Notice:</p>
            <p className="leading-relaxed">This withdrawal will be recorded on the blockchain and cannot be reversed. Make sure the amount and description are correct.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}