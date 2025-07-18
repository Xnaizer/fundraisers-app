"use client"

import { ProgramType, CategoryType } from "@/constants/ProgramData.constant";
import ProgramCard from "../ProgramCard";
import { useState, useEffect } from "react";
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

// Program status enum for better type safety
enum ProgramStatus {
  INACTIVE = 0,
  REGISTERED = 1,
  ALLOCATED = 2,
  FINISHED = 3
}

// GLOBAL STATE - Deklarasi di luar component agar benar-benar global
let globalHasLoaded = false;
let globalPrograms: ProgramType[] = [];
let globalIsLoading = false;
let globalError = '';

// Status display information
const getStatusInfo = (status: number) => {
  switch (status) {
    case ProgramStatus.REGISTERED:
      return {
        label: "Open for Funding",
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400/30",
        icon: "🟢"
      };
    case ProgramStatus.ALLOCATED:
      return {
        label: "Funds Allocated",
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/30",
        icon: "🔵"
      };
    case ProgramStatus.FINISHED:
      return {
        label: "Completed",
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/30",
        icon: "🟣"
      };
    case ProgramStatus.INACTIVE:
      return {
        label: "Inactive",
        color: "text-gray-400",
        bgColor: "bg-gray-400/10",
        borderColor: "border-gray-400/30",
        icon: "⚫"
      };
    default:
      return {
        label: "Unknown",
        color: "text-gray-400",
        bgColor: "bg-gray-400/10",
        borderColor: "border-gray-400/30",
        icon: "⚪"
      };
  }
};

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

  const converted: ProgramType = {
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
  const [allPrograms, setAllPrograms] = useState<ProgramType[]>(globalPrograms);
  const [filteredPrograms, setFilteredPrograms] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState<boolean>(globalIsLoading);
  const [error, setError] = useState<string>(globalError);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<'active' | ProgramStatus>('active');
  
  const { getAllProgramsPublic } = useContract();

  // Filter programs based on status
  const filterPrograms = (programs: ProgramType[], statusFilter: 'active' | ProgramStatus): ProgramType[] => {
    if (statusFilter === 'active') {
      return programs.filter((program: ProgramType) => program.status !== ProgramStatus.INACTIVE);
    }
    
    return programs.filter((program: ProgramType) => program.status === statusFilter);
  };

  const loadPrograms = async (): Promise<void> => {
    // Skip if already loaded globally or currently loading
    if (globalHasLoaded || globalIsLoading) {
      console.log('⚠️ Programs already loaded globally or loading in progress, skipping...');
      return;
    }

    const startTime = Date.now();
    console.log('🔍 Starting GLOBAL loadPrograms...');
    
    try {
      globalIsLoading = true;
      setLoading(true);
      setError('');
      globalError = '';
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
      });

      console.log('📡 Calling getAllProgramsPublic...');
      
      const blockchainPrograms = await Promise.race([
        getAllProgramsPublic(),
        timeoutPromise
      ]) as BlockchainProgram[];
      
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
        globalPrograms = [];
        setAllPrograms([]);
        setFilteredPrograms([]);
        const errorMsg = 'No programs found. Be the first to create one!';
        setError(errorMsg);
        globalError = errorMsg;
        globalHasLoaded = true; // Mark as loaded even if empty
        return;
      }
      
      // Convert blockchain programs to ProgramType format
      const convertedPrograms = blockchainPrograms
        .map((program: BlockchainProgram, index: number) => {
          try {
            return convertBlockchainProgram(program, index);
          } catch (conversionError) {
            console.error(`Error converting program ${index}:`, conversionError, program);
            return null;
          }
        })
        .filter((program): program is ProgramType => {
          if (!program) return false;
          
          // More comprehensive filtering
          const isValid = Boolean(program.name && 
                         program.name.trim() !== '' && 
                         program.name !== 'Untitled Program' &&
                         program.desc && 
                         program.desc.trim() !== '' &&
                         program.desc !== 'No description available');
          
          console.log(`Program "${program.name}": valid=${isValid}, status=${program.status}`);
          return isValid;
        });
      
      console.log('✅ Valid programs after filtering:', convertedPrograms.length);
      
      // Store globally
      globalPrograms = convertedPrograms;
      setAllPrograms(convertedPrograms);
      
      // Apply current filter
      const filtered = filterPrograms(convertedPrograms, selectedStatus);
      setFilteredPrograms(filtered);
      
      globalHasLoaded = true; // Mark as successfully loaded globally
      
      if (filtered.length === 0 && convertedPrograms.length > 0) {
        const errorMsg = selectedStatus === 'active' 
          ? 'No active programs found. All programs are currently inactive.'
          : `No programs found with status: ${selectedStatus}`;
        setError(errorMsg);
        globalError = errorMsg;
      } else {
        setError(''); // Clear error if data loaded successfully
        globalError = '';
      }
      
    } catch (error) {
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
        errorMessage = 'Request timed out. The blockchain network might be slow.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorMessage.includes('contract') || errorMessage.includes('revert')) {
        errorMessage = 'Smart contract error. The contract might not be deployed.';
      } else if (errorMessage.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else {
        errorMessage = `Failed to load programs: ${errorMessage.substring(0, 100)}`;
      }
      
      setError(errorMessage);
      globalError = errorMessage;
      
    } finally {
      setLoading(false);
      globalIsLoading = false;
    }
  };

  // Load programs only once when component first mounts
  useEffect(() => {
    console.log('🚀 ExploreSection mounted, globalHasLoaded:', globalHasLoaded);
    
    // If data already exists globally, use it immediately
    if (globalHasLoaded) {
      console.log('✅ Using existing global data');
      setAllPrograms(globalPrograms);
      setError(globalError);
      const filtered = filterPrograms(globalPrograms, selectedStatus);
      setFilteredPrograms(filtered);
    } else {
      // Only load if not already loaded and not currently loading
      console.log('🔄 Loading programs for the first time');
      loadPrograms();
    }
  }, []); // Empty dependency - only run on mount

  // Update filtered programs when status filter changes (but don't reload data)
  useEffect(() => {
    if (allPrograms.length > 0) {
      const filtered = filterPrograms(allPrograms, selectedStatus);
      setFilteredPrograms(filtered);
      setShowMore(false); // Reset show more when filter changes
    }
  }, [selectedStatus, allPrograms]);

  const showProgramCard = showMore ? filteredPrograms : filteredPrograms.slice(0, 6);

  // Manual refresh function - forces global reload
  const handleRefresh = (): void => {
    console.log('🔄 Manual refresh triggered - forcing global reload');
    globalHasLoaded = false;
    globalIsLoading = false;
    globalPrograms = [];
    globalError = '';
    setError('');
    setAllPrograms([]);
    setFilteredPrograms([]);
    loadPrograms();
  };

  // Get program counts by status
  const getStatusCounts = () => {
    return {
      all: allPrograms.length,
      active: allPrograms.filter((p: ProgramType) => p.status !== ProgramStatus.INACTIVE).length,
      inactive: allPrograms.filter((p: ProgramType) => p.status === ProgramStatus.INACTIVE).length,
      registered: allPrograms.filter((p: ProgramType) => p.status === ProgramStatus.REGISTERED).length,
      allocated: allPrograms.filter((p: ProgramType) => p.status === ProgramStatus.ALLOCATED).length,
      finished: allPrograms.filter((p: ProgramType) => p.status === ProgramStatus.FINISHED).length,
    };
  };

  // Handle status filter change
  const handleStatusChange = (status: 'active' | ProgramStatus): void => {
    setSelectedStatus(status);
  };

  // Loading state - only show if it's the first time loading globally
  if (loading && !globalHasLoaded) {
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
              <p className="text-xs text-neutral-400">This will only load once per session</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const statusCounts = getStatusCounts();

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
                {filteredPrograms.length} Program{filteredPrograms.length !== 1 ? 's' : ''}
                {selectedStatus === 'active' && ' Active'}
                {selectedStatus === ProgramStatus.INACTIVE && ' Inactive'}
              </div>
              {showMore && filteredPrograms.length > 6 && (
                <div className="text-xs text-neutral-500">
                  Showing all programs
                </div>
              )}
            </div>
          </div>

          {/* Status Filter Buttons */}
          {statusCounts.all > 0 && (
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {/* Active Programs Button */}
              <button
                onClick={() => handleStatusChange('active')}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                  selectedStatus === 'active'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                }`}
              >
                <span>✅</span>
                Active Programs ({statusCounts.active})
              </button>
              
              {/* Individual Status Buttons */}
              {statusCounts.registered > 0 && (
                <button
                  onClick={() => handleStatusChange(ProgramStatus.REGISTERED)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                    selectedStatus === ProgramStatus.REGISTERED
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                  }`}
                >
                  <span>🟢</span>
                  Open for Funding ({statusCounts.registered})
                </button>
              )}
              
              {statusCounts.allocated > 0 && (
                <button
                  onClick={() => handleStatusChange(ProgramStatus.ALLOCATED)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                    selectedStatus === ProgramStatus.ALLOCATED
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                  }`}
                >
                  <span>🔵</span>
                  Funds Allocated ({statusCounts.allocated})
                </button>
              )}
              
              {statusCounts.finished > 0 && (
                <button
                  onClick={() => handleStatusChange(ProgramStatus.FINISHED)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                    selectedStatus === ProgramStatus.FINISHED
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                  }`}
                >
                  <span>🟣</span>
                  Completed ({statusCounts.finished})
                </button>
              )}

              {/* Inactive Programs Button */}
              {statusCounts.inactive > 0 && (
                <button
                  onClick={() => handleStatusChange(ProgramStatus.INACTIVE)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                    selectedStatus === ProgramStatus.INACTIVE
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700 border border-red-500/30'
                  }`}
                >
                  <span>⚫</span>
                  Inactive ({statusCounts.inactive})
                  {selectedStatus !== ProgramStatus.INACTIVE && (
                    <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Warning for Inactive Programs */}
          {selectedStatus === ProgramStatus.INACTIVE && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-yellow-400 font-medium">Showing Inactive Programs</p>
                  <p className="text-yellow-300/80 text-sm">
                    These programs are not accepting donations and may be archived or cancelled.
                  </p>
                </div>
              </div>
            </div>
          )}

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
          {filteredPrograms.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 justify-items-center sm:px-8">
                {showProgramCard.map((program: ProgramType, index: number) => {
                  const statusInfo = getStatusInfo(program.status);
                  const isInactive = program.status === ProgramStatus.INACTIVE;
                  console.log(statusInfo);
                  
                  return (
                    <div 
                      key={`${program.id}-${program.name}-${index}`} 
                      className={`w-full max-w-sm lg:max-w-md transition-all duration-300 ${
                        isInactive ? 'opacity-75 grayscale-[50%]' : ''
                      }`}
                    >
                      <div className={isInactive ? 'relative' : ''}>
                        {isInactive && (
                          <div className="absolute inset-0 bg-black/20 z-10 rounded-lg pointer-events-none"></div>
                        )}
                        <ProgramCard 
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enhanced Show More/Less button */}
              {filteredPrograms.length > 6 && (
                <div className="w-full flex mx-auto justify-center mt-12">
                  <Buttons 
                    type="button" 
                    className="text-white text-sm md:text-md px-6 py-3 rounded-xl border-[2px] border-cyan-400 hover:bg-cyan-400/10 font-thin transition-all duration-300 hover:scale-105" 
                    onClick={() => setShowMore(!showMore)}
                  >
                    {showMore ? (
                      <>
                        Show Less ({filteredPrograms.length - 6} hidden)
                      </>
                    ) : (
                      <>
                        Show {filteredPrograms.length - 6} More Programs
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
          {filteredPrograms.length === 0 && !error && !loading && allPrograms.length > 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl text-white mb-2">No Programs Found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {selectedStatus === ProgramStatus.INACTIVE 
                  ? 'No inactive programs found. All programs are currently active!'
                  : 'No programs match the selected status filter. Try selecting a different status or check back later.'
                }
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => handleStatusChange('active')}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-300"
                >
                  Show Active Programs
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors duration-300"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Empty state - No programs at all */}
          {allPrograms.length === 0 && !error && !loading && (
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