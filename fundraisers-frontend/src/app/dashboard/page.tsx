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

export default function Dashboard() {
    const [programData, setProgramData] = useState<ProgramType | null>(null);
    const [cardAdminOpen, setCardAdminOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);
    const [ownerAddress, setOwnerAddress] = useState<string | null>(null);

    const router = useRouter();
    const { getCurrentAddress, checkConnection, getContract } = useContract();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            setIsLoading(true);

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

            // Get owner address from smart contract
            const fundraisersContract = await getContract('FUNDRAISERS');
            const contractOwner = await fundraisersContract.owner();
            
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

        } catch (error) {
            console.error('❌ Error checking admin access:', error);
            router.push('/not-authorized');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading screen while checking authorization
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Checking Admin Access...</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {currentAddress ? `Wallet: ${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}` : 'Connecting to wallet...'}
                    </p>
                </div>
            </div>
        );
    }

    // If not authorized, this shouldn't render (redirect should happen)
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-lg">Access Denied</p>
                    <p className="text-gray-400 text-sm">Redirecting...</p>
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
                        {/* Admin Info Bar */}
            <div className="bg-green-500/10 border-b border-green-500/30 p-4 ">
                <div className="max-w-7xl mx-auto">
                    <p className="text-green-400 text-sm text-center">
                        ✅ Admin Access Granted | 
                        Your Address: {currentAddress?.slice(0, 6)}...{currentAddress?.slice(-4)} | 
                        Owner Address: {ownerAddress?.slice(0, 6)}...{ownerAddress?.slice(-4)}
                    </p>
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