"use client"

import { ProgramType, ProgramStatus, CategoryType } from "@/constants/ProgramData.constant";
import ProgramCard from "../ProgramCard";
import { useState, useEffect, useRef } from "react";
import Buttons from "../Buttons";
import { useContract } from "../../hooks/useContract";
import { ethers } from "ethers";

interface ExploreSectionProps {
  onOpen: () => void;
  selectedCard: (program: ProgramType) => void;
}

// Define blockchain program type
interface BlockchainProgram {
  id: bigint | number;
  name: string;
  picName: string;
  target: bigint;
  desc: string;
  pic: string;
  status: number;
  allocated: bigint;
  category: string;
  programLink: string;
  photoUrl: string;
}

// Convert blockchain program to ProgramType
const convertBlockchainProgram = (program: BlockchainProgram, index: number): ProgramType => {
  // Helper function to get valid category
  const getValidCategory = (category: string): CategoryType => {
    const validCategories: CategoryType[] = [
      'Society', 'Environment', 'Technology', 'Health', 'Education', 
      'Emergency', 'Animals', 'Sports', 'Arts', 'Culture', 'Religious'
    ];
    
    // Map common variations
    const categoryMap: Record<string, CategoryType> = {
      'Sociaty': 'Society',
      'society': 'Society',
      'environment': 'Environment',
      'technology': 'Technology',
      'health': 'Health',
      'education': 'Education',
      'emergency': 'Emergency',
      'animals': 'Animals',
      'sports': 'Sports',
      'arts': 'Arts',
      'culture': 'Culture',
      'religious': 'Religious'
    };
    
    // Check direct match first
    if (validCategories.includes(category as CategoryType)) {
      return category as CategoryType;
    }
    
    // Check mapped variations
    const mappedCategory = categoryMap[category?.toLowerCase()];
    if (mappedCategory) {
      return mappedCategory;
    }
    
    // Default fallback
    return 'Society';
  };

  // Helper function to create createdAt date
  const getCreatedDate = (): string => {
    try {
      const baseDate = new Date('2024-01-01');
      const programId = typeof program.id === 'bigint' ? Number(program.id) : Number(program.id || index);
      const daysToAdd = Math.abs(programId) * 7; // Ensure positive number
      const createdDate = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
      return createdDate.toISOString();
    } catch (error) {
      console.warn('Error creating date:', error);
      return new Date().toISOString();
    }
  };

  // Helper function to safely format units
  const safeFormatUnits = (value: bigint | number | string, decimals: number): string => {
    try {
      if (!value && value !== 0) return '0';
      
      if (typeof value === 'bigint') {
        return ethers.formatUnits(value, decimals);
      } else if (typeof value === 'number') {
        return ethers.formatUnits(BigInt(value), decimals);
      } else if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '0';
        return ethers.formatUnits(BigInt(Math.floor(numValue)), decimals);
      }
      return '0';
    } catch (error) {
      console.warn('Error formatting units:', error, value);
      return '0';
    }
  };

  const converted = {
    id: typeof program.id === 'bigint' ? Number(program.id) : Number(program.id || index),
    name: program.name || 'Untitled Program',
    picName: program.picName || 'Unknown PIC',
    desc: program.desc || 'No description available',
    category: getValidCategory(program.category || 'Society'),
    pic: program.pic || '',
    target: safeFormatUnits(program.target || 0, 2),
    allocated: safeFormatUnits(program.allocated || 0, 2),
    status: Number(program.status || 0),
    programLink: program.programLink || '',
    photoUrl: program.photoUrl || '/default-program-image.jpg',
    createdAt: getCreatedDate()
  };

  return converted;
};

export default function ExploreSection({ onOpen, selectedCard }: ExploreSectionProps) {
  const [programs, setPrograms] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState<boolean>(false);
  
  // Use ref to prevent infinite loops
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  
  const { getAllProgramsPublic } = useContract();

  const loadPrograms = async () => {
    // Prevent multiple concurrent calls
    if (isLoadingRef.current) {
      console.log('⚠️ Already loading, skipping...');
      return;
    }

    const startTime = Date.now();
    console.log('🔍 Starting loadPrograms...');
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError('');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
      });

      console.log('📡 Calling getAllProgramsPublic...');
      
      const blockchainPrograms = await Promise.race([
        getAllProgramsPublic(),
        timeoutPromise
      ]) as any[];
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Raw programs loaded in ${loadTime}ms:`, blockchainPrograms?.length || 0);
      
      if (!blockchainPrograms) {
        throw new Error('No data received from blockchain');
      }

      if (!Array.isArray(blockchainPrograms)) {
        console.error('Invalid response type:', typeof blockchainPrograms);
        throw new Error(`Expected array, got ${typeof blockchainPrograms}`);
      }

      console.log('📊 First program sample:', blockchainPrograms[0]);
      
      if (blockchainPrograms.length === 0) {
        console.log('📭 No programs found on blockchain');
        setPrograms([]);
        setError('No programs found. Be the first to create one!');
        return;
      }
      
      // Convert blockchain programs to ProgramType format
      const convertedPrograms = blockchainPrograms
        .map((program: unknown, index: number) => {
          try {
            return convertBlockchainProgram(program as BlockchainProgram, index);
          } catch (conversionError) {
            console.error(`Error converting program ${index}:`, conversionError, program);
            return null;
          }
        })
        .filter((program): program is ProgramType => {
          if (!program) return false;
          
          // More comprehensive filtering
          const isValid = program.name && 
                         program.name.trim() !== '' && 
                         program.name !== 'Untitled Program' &&
                         program.desc && 
                         program.desc.trim() !== '' &&
                         program.desc !== 'No description available';
          
          console.log(`Program "${program.name}": valid=${isValid}, status=${program.status}`);
          return isValid;
        });
      
      console.log('✅ Valid programs after filtering:', convertedPrograms.length);
      
      setPrograms(convertedPrograms);
      hasLoadedRef.current = true;
      
      if (convertedPrograms.length === 0) {
        setError('No active programs found. Create your first program!');
      }
      
    } catch (error: unknown) {
      const loadTime = Date.now() - startTime;
      console.error(`❌ Error loading programs after ${loadTime}ms:`, error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // More specific error messages
      if (errorMessage.includes('timeout')) {
        setError('Request timed out. The blockchain network might be slow.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network error. Please check your internet connection.');
      } else if (errorMessage.includes('contract') || errorMessage.includes('revert')) {
        setError('Smart contract error. The contract might not be deployed.');
      } else if (errorMessage.includes('429')) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else {
        setError(`Failed to load programs: ${errorMessage.substring(0, 100)}`);
      }
      
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Use effect with proper dependency and loading guard
  useEffect(() => {
    if (!hasLoadedRef.current && !isLoadingRef.current) {
      loadPrograms();
    }
  }, []); // Empty dependency array - only run once on mount

  const showProgramCard = showMore ? programs : programs.slice(0, 6);

  // Manual refresh function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    hasLoadedRef.current = false;
    loadPrograms();
  };

  // Loading state with better skeleton and debug info
  if (loading && programs.length === 0) {
    return (
      <section
        id="ExploreSection"
        className="bg-black bg-gradient-to-b to-black h-full w-full md:pt-12 pt-10"
      >
        <div className="max-w-[100rem] mx-auto flex flex-col lg:flex-row justify-between items-start gap-12 p-4 md:p-8">
          <div className="w-full text-white px-4 sm:px-6 lg:px-16 mt-8">
            <div className="flex justify-between items-center mb-12 md:mb-16 px-4">
              <p className="text-xl sm:text-3xl">
                <span>Explore </span>
                <span className="text-cyan-400">Fund</span>
                <span className="text-white">raisers</span>
                <span> Programs </span>
              </p>
              <div className="animate-pulse bg-neutral-700 h-4 w-16 rounded"></div>
            </div>

            {/* Enhanced Loading skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 justify-items-center sm:px-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="w-full max-w-sm lg:max-w-md">
                  <div className="animate-pulse bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                    <div className="h-48 bg-neutral-800"></div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-neutral-700 rounded"></div>
                        <div className="h-4 bg-neutral-700 rounded w-20"></div>
                      </div>
                      <div className="h-6 bg-neutral-700 rounded mb-3"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-neutral-700 rounded"></div>
                        <div className="h-3 bg-neutral-700 rounded w-3/4"></div>
                      </div>
                      <div className="h-2 bg-neutral-700 rounded mb-2"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-neutral-700 rounded w-16"></div>
                        <div className="h-3 bg-neutral-700 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center mt-12">
              <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading programs from blockchain...</span>
              </div>
              <button
                onClick={() => {
                  isLoadingRef.current = false;
                  setLoading(false);
                  setError('Loading cancelled by user');
                }}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Cancel Loading
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="ExploreSection"
      className="bg-black bg-gradient-to-b to-black h-full w-full md:pt-12 pt-10"
    >
      <div className="max-w-[100rem] mx-auto flex flex-col lg:flex-row justify-between items-start gap-12 p-4 md:p-8">
        <div className="w-full text-white px-4 sm:px-6 lg:px-16 mt-8">
          <div className="flex justify-between items-center mb-12 md:mb-16 px-4">
            <p className="text-xl sm:text-3xl">
              <span>Explore </span>
              <span className="text-cyan-400">Fund</span>
              <span className="text-white">raisers</span>
              <span> Programs </span>
            </p>
            
            {/* Enhanced Programs count */}
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {programs.length} Program{programs.length !== 1 ? 's' : ''}
              </div>
              {showMore && programs.length > 6 && (
                <div className="text-xs text-neutral-500">
                  Showing all programs
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Error state */}
          {error && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
              <div className="text-red-400 mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="font-medium">{error}</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Retrying...' : 'Try Again'}
                </button>
                <button
                  onClick={() => {
                    setError('');
                  }}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 rounded-lg text-neutral-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Programs grid */}
          {programs.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 justify-items-center sm:px-8">
                {showProgramCard.map((program, index) => (
                  <ProgramCard 
                    key={`${program.id}-${program.name}-${index}`}  
                    onOpen={() => {
                      selectedCard(program);
                      onOpen();
                    }} 
                    name={program.name}   
                    desc={program.desc}
                    category={program.category}
                    createdAt={program.createdAt}
                    photoUrl={program.photoUrl}
                    target={program.target}
                    allocated={program.allocated}
                    status={program.status}
                    picName={program.picName}
                  />
                ))}
              </div>

              {/* Enhanced Show More/Less button */}
              {programs.length > 6 && (
                <div className="w-full flex mx-auto justify-center mt-12">
                  <Buttons 
                    type="button" 
                    className="text-white text-sm md:text-md px-6 py-3 rounded-xl border-[2px] border-cyan-400 hover:bg-cyan-400/10 font-thin transition-all duration-300 hover:scale-105" 
                    onClick={() => setShowMore(!showMore)}
                  >
                    {showMore ? (
                      <>
                        Show Less ({programs.length - 6} hidden)
                      </>
                    ) : (
                      <>
                        Show {programs.length - 6} More Programs
                      </>
                    )}
                  </Buttons>
                </div>
              )}

              {/* Enhanced Refresh button */}
              <div className="w-full flex mx-auto justify-center mt-6">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="text-gray-400 hover:text-cyan-400 text-sm px-4 py-2 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg 
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Refreshing...' : 'Refresh Programs'}
                </button>
              </div>
            </>
          )}

          {/* Enhanced Empty state */}
          {programs.length === 0 && !error && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl text-white mb-2">No Programs Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Be the first to create a fundraising program and make a difference in the world!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-300"
                >
                  Check Again
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors duration-300"
                >
                  Create Program
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}