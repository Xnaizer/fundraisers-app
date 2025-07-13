"use client"

import FormData from "@/components/Dashboard Comps/FormData";
import ModalDashCard from "@/components/Dashboard Comps/ModalDashCard";
import Footer from "@/components/Footer";
import ExploreSection from "@/components/Home Comps/ExploreSection";
import Navbar from "@/components/Navbar";
import { ProgramType } from "@/constants/ProgramData.constant";
import { useContract } from "@/hooks/useContract";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { Wallet, DollarSign, RefreshCw, TrendingUp, Users, Target, Activity, Coins } from 'lucide-react';

export default function Dashboard() {
    const [programData, setProgramData] = useState<ProgramType | null>(null);
    const [cardAdminOpen, setCardAdminOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);
    const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
    
    // Enhanced state untuk fund information
    const [contractBalance, setContractBalance] = useState<string>('0');
    const [totalManagedFund, setTotalManagedFund] = useState<string>('0');
    const [totalAllocated, setTotalAllocated] = useState<string>('0');
    const [availableForAllocation, setAvailableForAllocation] = useState<string>('0');
    const [totalSupply, setTotalSupply] = useState<string>('0');
    const [totalPrograms, setTotalPrograms] = useState<number>(0);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string>('');

    const router = useRouter();
    const { 
        getCurrentAddress, 
        checkConnection, 
        getContractOwnerPublic,
        getFundAllocationStatus,
        getIDRXTotalSupplyPublic,
        getTotalProgramsCreatedPublic
    } = useContract();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    // Effect untuk refresh balance setiap 30 detik
    useEffect(() => {
        if (isAuthorized) {
            fetchFundStatus();
            


           
        }
    }, [isAuthorized]);

    const checkAdminAccess = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Check if wallet is connected
            const isConnected = await checkConnection();
            if (!isConnected) {
                console.log('❌ Wallet not connected');
                router.push('/not-authorized');
                return;
            }

            // Get current user address
            const userAddress = await getCurrentAddress();
            if (!userAddress) {
                console.log('❌ Could not get user address');
                router.push('/not-authorized');
                return;
            }

            setCurrentAddress(userAddress);

            // Get owner address from smart contract using public method
            const contractOwner = await getContractOwnerPublic();
            if (!contractOwner) {
                console.log('❌ Could not get contract owner');
                setError('Could not verify contract owner');
                router.push('/not-authorized');
                return;
            }
            
            setOwnerAddress(contractOwner);

            console.log('🔍 Access Check:', {
                userAddress: userAddress.toLowerCase(),
                ownerAddress: contractOwner.toLowerCase(),
                isOwner: userAddress.toLowerCase() === contractOwner.toLowerCase()
            });

            // Check if current user is the owner
            if (userAddress.toLowerCase() === contractOwner.toLowerCase()) {
                console.log('✅ Access granted - User is owner');
                setIsAuthorized(true);
            } else {
                console.log('❌ Access denied - User is not owner');
                router.push('/not-authorized');
                return;
            }

        } catch (error: unknown) {
            console.error('❌ Error checking admin access:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Access check failed: ${errorMessage}`);
            router.push('/not-authorized');
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced function untuk mengambil fund status
    const fetchFundStatus = async () => {
        try {
            setIsLoadingBalance(true);
            setError('');
            
            // Fetch all data concurrently using comprehensive function
            const [
                fundStatus,
                supply,
                programsCount
            ] = await Promise.all([
                getFundAllocationStatus(),
                getIDRXTotalSupplyPublic(),
                getTotalProgramsCreatedPublic()
            ]);
            
            // Parse and set values
            const balanceFormatted = parseFloat(fundStatus.contractBalance);
            const managedFundFormatted = parseFloat(fundStatus.totalManaged);
            const allocatedFormatted = parseFloat(fundStatus.totalAllocated);
            const availableFormatted = parseFloat(fundStatus.remainingForAllocation);
            const supplyFormatted = parseFloat(supply);
            
            setContractBalance(balanceFormatted.toFixed(2));
            setTotalManagedFund(managedFundFormatted.toFixed(2));
            setTotalAllocated(allocatedFormatted.toFixed(2));
            setAvailableForAllocation(availableFormatted.toFixed(2));
            setTotalSupply(supplyFormatted.toFixed(2));
            setTotalPrograms(programsCount);
            setLastUpdated(new Date());
            
            console.log('💰 Enhanced Fund Status Updated:', {
                contractBalance: balanceFormatted.toFixed(2),
                totalManagedFund: managedFundFormatted.toFixed(2),
                totalAllocated: allocatedFormatted.toFixed(2),
                availableForAllocation: availableFormatted.toFixed(2),
                totalSupply: supplyFormatted.toFixed(2),
                totalPrograms: programsCount
            });

        } catch (error: unknown) {
            console.error('❌ Error fetching fund status:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Failed to fetch fund status: ${errorMessage}`);
            setContractBalance('Error');
            setTotalManagedFund('Error');
            setTotalAllocated('Error');
            setAvailableForAllocation('Error');
            setTotalSupply('Error');
        } finally {
            setIsLoadingBalance(false);
        }
    };

    const handleRefreshBalance = () => {
        fetchFundStatus();
    };

    const formatCurrency = (amount: string): string => {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0';
        return num.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatLargeNumber = (amount: string): string => {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0';
        
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        
        return num.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatLastUpdated = (date: Date | null): string => {
        if (!date) return 'Never';
        
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Enhanced loading screen
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Checking Admin Access...</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {currentAddress ? `Wallet: ${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}` : 'Connecting to wallet...'}
                    </p>
                    {error && (
                        <p className="text-red-400 text-xs mt-2 max-w-md mx-auto">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    // Enhanced unauthorized screen
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-lg">Access Denied</p>
                    <p className="text-gray-400 text-sm">Redirecting...</p>
                    {error && (
                        <p className="text-red-400 text-xs mt-2 max-w-md mx-auto">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="pointer-events-none fixed inset-0 -z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
                <div className="absolute left-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-0 right-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
            </div>

            {cardAdminOpen && (
                <ModalDashCard 
                    program={programData} 
                    onCardClose={() => setCardAdminOpen(false)} 
                />
            )}

            <FormData />
            
            {/* Enhanced Admin Info Bar with Fund Information */}
            <div className="bg-black p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-4">
                        {/* Admin Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                            <p className="text-green-400">
                                ✅ Admin Access Granted
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 text-gray-300">
                                <span>Your: {currentAddress?.slice(0, 6)}...{currentAddress?.slice(-4)}</span>
                                <span className="hidden sm:inline">|</span>
                                <span>Owner: {ownerAddress?.slice(0, 6)}...{ownerAddress?.slice(-4)}</span>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                                <p className="text-red-400 text-sm">⚠️ {error}</p>
                            </div>
                        )}

                        {/* Enhanced Fund Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {/* Contract Balance */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400 text-sm font-medium">Contract Balance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span className="text-white font-mono text-lg">
                                        {isLoadingBalance ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            `${formatCurrency(contractBalance)} IDRX`
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Total Managed Fund */}
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-purple-400" />
                                    <span className="text-purple-400 text-sm font-medium">Total Managed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span className="text-white font-mono text-lg">
                                        {isLoadingBalance ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            `${formatCurrency(totalManagedFund)} IDRX`
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Total Allocated */}
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-orange-400" />
                                    <span className="text-orange-400 text-sm font-medium">Total Allocated</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span className="text-white font-mono text-lg">
                                        {isLoadingBalance ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            `${formatCurrency(totalAllocated)} IDRX`
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Available for Allocation - HIGHLIGHTED */}
                            <div className="bg-cyan-500/20 border-2 border-cyan-500/50 rounded-lg px-4 py-3 relative">
                                <div className="absolute -top-2 -right-2 bg-cyan-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                                    KEY
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400 text-sm font-medium">Available Fund</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span className="text-white font-mono text-lg font-bold">
                                        {isLoadingBalance ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            `${formatCurrency(availableForAllocation)} IDRX`
                                        )}
                                    </span>
                                </div>
                                <p className="text-xs text-cyan-300 mt-1">
                                    Ready for allocation
                                </p>
                            </div>

                            {/* Total IDRX Supply */}
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins className="w-4 h-4 text-yellow-400" />
                                    <span className="text-yellow-400 text-sm font-medium">Total Supply</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span className="text-white font-mono text-lg">
                                        {isLoadingBalance ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            `${formatLargeNumber(totalSupply)} IDRX`
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Total Programs */}
                            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-pink-400" />
                                    <span className="text-pink-400 text-sm font-medium">Total Programs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono text-2xl font-bold">
                                        {isLoadingBalance ? (
                                            <span className="animate-pulse">...</span>
                                        ) : (
                                            totalPrograms
                                        )}
                                    </span>
                                </div>
                                <p className="text-xs text-pink-300 mt-1">
                                    Programs created
                                </p>
                            </div>
                        </div>

                        {/* Status and Refresh */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="text-gray-400">
                                Last updated: {formatLastUpdated(lastUpdated)}
                            </div>
                            <button
                                onClick={handleRefreshBalance}
                                disabled={isLoadingBalance}
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                                {isLoadingBalance ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ExploreSection 
                onOpen={() => setCardAdminOpen(true)} 
                selectedCard={setProgramData}
            />
            <Footer />
        </>
    );
}