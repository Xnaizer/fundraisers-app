"use client"

import React, { useEffect, useState } from "react";
import Buttons from "./Buttons"
import { X, ExternalLink, Calendar, User, Target, Settings, Ban, Send, Wallet } from 'lucide-react';
import Image from "next/image";
import { FaGlobeAsia } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { ProgramType } from "@/constants/ProgramData.constant";
import { useContract } from "../hooks/useContract";
import HistoryModal from './HistoryModal';
import WithdrawalModal from './WithdrawalModal';

interface CardModalProps {
  onCardClose: () => void;
  onContributeCard: () => void;
  program: ProgramType | null;
}

// User roles
type UserRole = 'admin' | 'pic' | 'user';

export default function CardModal({ 
  onCardClose, 
  onContributeCard, 
  program 
}: CardModalProps) {
  const [imageError, setImageError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  
  // Modal states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const { 
    getCurrentAddress, 
    checkConnection, 
    getContract,
    getRemainingFundForAllocation,
    allocateFund,
    deactivateProgram
  } = useContract();

  // Determine user role - wrapped in useCallback to avoid dependency warning
  const determineUserRole = async (): Promise<void> => {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        setUserRole('user');
        return;
      }

      const currentAddress = await getCurrentAddress();
      if (!currentAddress) {
        setUserRole('user');
        return;
      }

      // Check if user is admin (contract owner)
      const contract = await getContract('FUNDRAISERS');
      const owner = await contract.owner();
      
      if (currentAddress.toLowerCase() === owner.toLowerCase()) {
        setUserRole('admin');
        return;
      }

      // Check if user is PIC of this program
      if (program && currentAddress.toLowerCase() === program.pic.toLowerCase()) {
        setUserRole('pic');
        return;
      }

      setUserRole('user');
    } catch (error) {
      console.error('Error determining user role:', error);
      setUserRole('user');
    }
  };

  useEffect(() => {
    if (program) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // Determine user role when component mounts
      determineUserRole();
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [program]); // Only depend on program, determineUserRole is called inside

  // Enhanced Admin actions with fund checking
  const handleDeactivateProgram = async (): Promise<void> => {
    if (!program) return;

    try {
      setIsProcessing(true);
      setActionError('');
      setActionSuccess('');

      console.log('🔍 Deactivating program:', program.id);
      const txHash = await deactivateProgram(Number(program.id));
      
      setActionSuccess(`Program deactivated successfully! Tx: ${txHash.slice(0, 10)}...`);
      console.log('✅ Program deactivated successfully');
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Error deactivating program:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('user rejected')) {
        setActionError('Transaction was rejected by user');
      } else {
        setActionError(`Failed to deactivate program: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced Allocate Fund with fund checking
  const handleAllocateFund = async (): Promise<void> => {
    if (!program) return;

    try {
      setIsProcessing(true);
      setActionError('');
      setActionSuccess('');

      console.log('🔍 Checking remaining fund before allocation...');

      // Check remaining fund sebelum allocate
      const remainingFund = await getRemainingFundForAllocation();
      const remainingAmount = parseFloat(remainingFund);
      const programTarget = parseFloat(program.target);

      console.log('💰 Fund check:', {
        remainingAmount,
        programTarget,
        sufficient: remainingAmount >= programTarget
      });

      if (remainingAmount < programTarget) {
        setActionError(
          `Insufficient fund for allocation. Available: ${remainingAmount.toLocaleString('id-ID')} IDRX, Required: ${programTarget.toLocaleString('id-ID')} IDRX`
        );
        return;
      }

      console.log('✅ Sufficient fund available, proceeding with allocation...');
      console.log('🔍 Allocating fund to program:', program.id);
      
      const txHash = await allocateFund(Number(program.id));
      
      setActionSuccess(`Fund allocated successfully! Tx: ${txHash.slice(0, 10)}...`);
      console.log('✅ Fund allocated successfully');
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Error allocating fund:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('user rejected')) {
        setActionError('Transaction was rejected by user');
      } else if (errorMessage.includes('Insufficient fund')) {
        setActionError(errorMessage);
      } else {
        setActionError(`Failed to allocate fund: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Open withdrawal modal
  const handleWithdraw = (): void => {
    setIsWithdrawalModalOpen(true);
  };

  // Open history modal
  const handleHistoryOpen = (): void => {
    setIsHistoryModalOpen(true);
  };

  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!program?.target || !program?.allocated) return 0;
    const target = parseFloat(program.target);
    const allocated = parseFloat(program.allocated);
    if (target === 0) return 0;
    return Math.min((allocated / target) * 100, 100);
  };

  const progress = calculateProgress();

  // Format currency
  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0';
    return num.toLocaleString('id-ID');
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Copy address to clipboard
  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Get status badge
  const getStatusBadge = (status?: number): { text: string; color: string } => {
    switch (status) {
      case 0:
        return { text: 'Inactive', color: 'bg-gray-500/20 text-gray-400 border-gray-500/50' };
      case 1:
        return { text: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/50' };
      case 2:
        return { text: 'Funded', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
      case 3:
        return { text: 'Completed', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500/20 text-gray-400 border-gray-500/50' };
    }
  };

  // Get action buttons based on user role
  const getActionButtons = (): React.ReactElement[] => {
    const buttons: React.ReactElement[] = [];

    // Program link (available for all if exists)
    if (program?.programLink) {
      buttons.push(
        <button
          key="program-link"
          onClick={() => window.open(program.programLink, '_blank')}
          className="flex items-center justify-center gap-2 text-white font-light border-[2px] border-cyan-500 py-3 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer text-sm md:text-base transition-all duration-300 flex-1"
        >
          <ExternalLink className="w-4 h-4" />
          Visit Program
        </button>
      );
    }

    // History (available for all) - Updated to use separate modal
    buttons.push(
      <button
        key="history"
        onClick={handleHistoryOpen}
        className="flex items-center justify-center gap-2 text-white font-light border-[2px] border-cyan-500 py-3 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer text-sm md:text-base transition-all duration-300 flex-1"
      >
        <Calendar className="w-4 h-4" />
        History
      </button>
    );

    // Role-specific buttons
    switch (userRole) {
      case 'admin':
        buttons.push(
          <button
            key="deactivate"
            className={`text-white font-light border-[2px] border-red-500 py-3 px-4 rounded-xl hover:border-red-600 hover:bg-red-500 cursor-pointer text-sm md:text-base transition-all duration-300 flex-1 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleDeactivateProgram}
            type="button"
            disabled={isProcessing}
          >
            <div className="flex items-center justify-center gap-2">
              <Ban className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Deactivate'}
            </div>
          </button>
        );

        buttons.push(
          <button
            key="allocate"
            className={`text-white font-light border-[2px] border-orange-500 py-3 px-4 rounded-xl hover:border-orange-600 hover:bg-orange-500 cursor-pointer text-sm md:text-base transition-all duration-300 flex-1 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleAllocateFund}
            type="button"
            disabled={isProcessing}
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Allocate Fund'}
            </div>
          </button>
        );

        buttons.push(
          <Buttons
            key="contribute"
            className="text-white font-light border-[2px] border-cyan-500 py-3 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer text-sm md:text-base transition-all duration-300 flex-1 bg-cyan-500/10"
            onClick={onContributeCard}
            type="button"
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              Contribute
            </div>
          </Buttons>
        );
        break;

      case 'pic':
        buttons.push(
          <button
            key="withdraw"
            className={`text-white font-light border-[2px] border-green-500 py-3 px-4 rounded-xl hover:border-green-600 hover:bg-green-500 cursor-pointer text-sm md:text-base transition-all duration-300 flex-1 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleWithdraw}
            type="button"
            disabled={isProcessing}
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4" />
              Withdraw
            </div>
          </button>
        );
        break;

      case 'user':
        buttons.push(
          <Buttons
            key="contribute"
            className="text-white font-light border-[2px] border-cyan-500 py-3 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer text-sm md:text-base transition-all duration-300 flex-1 bg-cyan-500/10"
            onClick={onContributeCard}
            type="button"
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              Contribute Now
            </div>
          </Buttons>
        );
        break;
    }

    return buttons;
  };

  const statusBadge = getStatusBadge(program?.status);

  if (!program) {
    return null;
  }

  return (
    <>
      {/* Main Program Modal */}
      <div className="bg-black/40 min-h-screen w-full fixed z-50 inset-0 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
        <div
          className="bg-black text-white w-full max-w-[96%] xs:max-w-[94%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] 2xl:max-w-[70%] rounded-lg sm:rounded-xl md:rounded-2xl mt-20 xs:mt-16 sm:mt-8 md:mt-4 lg:mt-0 relative shadow-lg overflow-hidden max-h-[85vh] xs:max-h-[88vh] sm:max-h-[92vh] md:max-h-[95vh] overflow-y-auto"
          style={{ boxShadow: '0 0 10px 1px rgba(0, 0, 0, 1)' }}
        >
          {/* Image Header */}
          <div className="relative w-full h-24 xs:h-28 sm:h-36 md:h-44 lg:h-52 xl:h-60 2xl:h-64">
            <button
              onClick={onCardClose}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-neutral-400 hover:text-white transition cursor-pointer z-50 p-1.5 sm:p-2 hover:bg-neutral-900/90 bg-neutral-800/90 rounded-full"
            >
              <X className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
            </button>

            {/* Status Badge */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 z-40">
              <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm border backdrop-blur-sm ${statusBadge.color} flex items-center gap-1`}>
                <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${statusBadge.color.includes('green') ? 'bg-green-400' : statusBadge.color.includes('blue') ? 'bg-blue-400' : statusBadge.color.includes('purple') ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                <span className="hidden xs:inline">{statusBadge.text}</span>
                <span className="xs:hidden">{statusBadge.text.split(' ')[0]}</span>
              </div>
            </div>

            {/* User Role Badge */}
            <div className="absolute top-2 right-12 xs:right-14 sm:right-16 md:right-20 z-40">
              <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs backdrop-blur-sm border ${
                userRole === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                userRole === 'pic' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                'bg-blue-500/20 text-blue-400 border-blue-500/50'
              }`}>
                <Settings className="w-2.5 sm:w-3 h-2.5 sm:h-3 inline mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">{userRole.toUpperCase()}</span>
                <span className="sm:hidden">{userRole.charAt(0).toUpperCase()}</span>
              </div>
            </div>

            {!imageError ? (
              <Image
                src={program.photoUrl}
                alt={program.name}
                fill
                className="object-cover rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl"
                priority
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl">
                <div className="text-center text-neutral-600">
                  <FaGlobeAsia className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm">Image not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <section className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-6 lg:py-8">
            {/* Enhanced Action Messages */}
            {actionError && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-red-400 mt-0.5 text-sm sm:text-base">⚠️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-red-400 text-xs sm:text-sm font-medium">Error</p>
                    <p className="text-red-300 text-xs sm:text-sm mt-1 break-words">{actionError}</p>
                  </div>
                </div>
              </div>
            )}

            {actionSuccess && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-green-400 mt-0.5 text-sm sm:text-base">✅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 text-xs sm:text-sm font-medium">Success</p>
                    <p className="text-green-300 text-xs sm:text-sm mt-1 break-words">{actionSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress and Meta Info */}
            <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
              {/* Meta Info - Mobile Stacked */}
              <div className="flex flex-col xs:flex-row xs:flex-wrap gap-2 xs:gap-3 sm:gap-4 text-xs sm:text-sm">
                <p className="text-cyan-400 flex items-center gap-1.5 sm:gap-2">
                  <FaGlobeAsia className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{program.category}</span>
                </p>
                <p className="flex items-center gap-1.5 sm:gap-2 text-neutral-300">
                  <LuClock3 className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Created {formatDate(program.createdAt)}</span>
                </p>
                <p className="flex items-center gap-1.5 sm:gap-2 text-neutral-300">
                  <User className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="truncate">by {program.picName}</span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="w-full h-2 sm:h-3 bg-neutral-700 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-xs sm:text-sm">
                  <span className="text-cyan-400 font-medium">{progress.toFixed(1)}%</span>
                  <span className="text-neutral-400 truncate ml-2">
                    {formatCurrency(program.allocated)} / {formatCurrency(program.target)} IDRX
                  </span>
                </div>
              </div>
            </div>

            {/* Title and Description */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-2 sm:mb-3 text-white leading-tight">
                {program.name}
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed break-words">
                {program.desc}
              </p>
            </div>

            {/* PIC Address */}
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-neutral-900 rounded-lg border border-neutral-800">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-0 xs:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-neutral-400 mb-1">PIC Address</p>
                  <p className="font-mono text-xs sm:text-sm text-white break-all">
                    {program.pic}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(program.pic)}
                  className="xs:ml-2 px-2 sm:px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs transition-colors flex-shrink-0 self-start xs:self-center"
                >
                  {copySuccess ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Role-based Action Buttons */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {getActionButtons()}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-3 sm:p-4 bg-neutral-900 rounded-lg">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400 break-words">
                  {formatCurrency(program.target)}
                </p>
                <p className="text-xs sm:text-sm text-neutral-400">Target Amount</p>
              </div>
              <div className="p-3 sm:p-4 bg-neutral-900 rounded-lg">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-400 break-words">
                  {formatCurrency(program.allocated)}
                </p>
                <p className="text-xs sm:text-sm text-neutral-400">Raised Amount</p>
              </div>
              <div className="p-3 sm:p-4 bg-neutral-900 rounded-lg sm:col-span-1 col-span-1">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 break-words">
                  {formatCurrency(parseFloat(program.target) - parseFloat(program.allocated))}
                </p>
                <p className="text-xs sm:text-sm text-neutral-400">Remaining</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Separate Modal Components */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        program={program}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        program={program}
      />
    </>
  );
}