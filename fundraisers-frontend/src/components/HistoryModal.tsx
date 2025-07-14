// components/HistoryModal.tsx
"use client"

import { useState, useEffect } from "react";
import { X, Calendar, DollarSign } from 'lucide-react';
import { ProgramType } from "@/constants/ProgramData.constant";
import { useContract } from "../hooks/useContract";
import { ethers } from 'ethers'; // Ganti require() dengan import

interface HistoryModalProps {
  onClose: () => void;
  program: ProgramType | null;
  isOpen: boolean;
}

interface ProgramHistory {
  timestamp: bigint;
  history: string;
  amount: bigint;
}

export default function HistoryModal({ onClose, program, isOpen }: HistoryModalProps) {
  const [history, setHistory] = useState<ProgramHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { getProgramHistoryPublic } = useContract();

  // Fix untuk useEffect dependency warning
  const fetchHistory = async (): Promise<void> => {
    if (!program) return;

    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Fetching history for program:', program.id);
      const historyData = await getProgramHistoryPublic(Number(program.id));
      
      console.log('✅ History data:', historyData);
      setHistory(historyData);
      
    } catch (error) {
      console.error('❌ Error fetching history:', error);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && program) {
      fetchHistory(); // Call function directly inside useEffect
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, program]); // Remove fetchHistory from dependencies

  const formatDate = (timestamp: bigint): string => {
    try {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: bigint): string => {
    try {
      // Gunakan ethers yang sudah di-import
      const formatted = ethers.formatUnits(amount, 2);
      const num = parseFloat(formatted);
      return num.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch {
      return '0.00';
    }
  };

  const handleRetry = (): void => {
    fetchHistory();
  };

  if (!isOpen || !program) return null;

  return (
    <div className="bg-black/40 min-h-screen w-full fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12">
      <div
        className="bg-black text-white w-full max-w-[95%] sm:max-w-4xl rounded-2xl mt-20 relative shadow-lg overflow-hidden"
        style={{ boxShadow: '0 0 10px 1px rgba(0, 0, 0, 1)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-neutral-700">
          <div>
            <h3 className="text-lg sm:text-xl font-thin">Transaction History</h3>
            <p className="text-sm text-neutral-400 mt-1">{program.name}</p>
            <p className="text-xs text-neutral-500 mt-1">Program ID: {program.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white cursor-pointer p-2 hover:bg-neutral-900/90 bg-neutral-800/90 rounded-full transition-colors"
          >
            <X className="w-5 md:w-6 h-5 md:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">⚠️ {error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((transaction, index) => (
                <div key={index} className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium">{formatDate(transaction.timestamp)}</span>
                      </div>
                      <p className="text-sm text-neutral-300 mb-2">{transaction.history}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatCurrency(transaction.amount)} IDRX</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 mb-2">No transaction history available</p>
              <p className="text-neutral-500 text-sm">This program hasn&apos;t had any withdrawals yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-neutral-700 flex justify-between items-center">
          <div className="text-sm text-neutral-400">
            Total: {history.length} transaction{history.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            className="text-white font-light border-[2px] border-cyan-500 py-2 px-6 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}