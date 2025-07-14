"use client"

import { useEffect, useState } from "react";
import ContributeModal from "@/components/ContributeModal";
import AboutUsSection from "@/components/Home Comps/AboutUsSection";
import ExploreSection from "@/components/Home Comps/ExploreSection";
import FundGoalSection from "@/components/Home Comps/FundGoalSection";
import HomeSection from "@/components/Home Comps/HomeSection";
import HowItWorkSection from "@/components/Home Comps/HowItWorkSection";
import CardModal from "@/components/CardModal";
import { ProgramType } from "@/constants/ProgramData.constant";
import ScrollToTop from "@/components/ScrollToTop";

export default function HomeRaisers() {
    const [contributeIsOpen, setContributeIsOpen] = useState<boolean>(false);
    const [cardIsOpen, setCardIsOpen] = useState<boolean>(false);
    const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
    const [scrollTop, setScrollTop] = useState<boolean>(false);

    const handleScroll = (): void => {
        if(window.scrollY >= 300){
            setScrollTop(true);
        } else {
            setScrollTop(false);
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    },[]);

    const handleOpenContributeCard = (): void => {
        setContributeIsOpen(true);
        setCardIsOpen(false);
    }

    const handleCardClose = (): void => {
        setCardIsOpen(false);
    }

    return (
        <section className="relative min-h-screen">
            <div className="relative z-10">
                <HomeSection onOpen={() => setContributeIsOpen(true)}/>  

                {contributeIsOpen && (
                    <ContributeModal 
                        onCardClose={() => setContributeIsOpen(false)}
                        isContributeOpen={contributeIsOpen}    
                    /> 
                )}
                
                {cardIsOpen && (
                    <CardModal 
                        onCardClose={handleCardClose} 
                        onContributeCard={handleOpenContributeCard}
                        program={selectedProgram}
                    />
                )}

                <FundGoalSection />
                <ExploreSection onOpen={() => setCardIsOpen(true)} selectedCard={setSelectedProgram} />
                <HowItWorkSection />
                <AboutUsSection />
                {scrollTop && <ScrollToTop/>}
            </div>
        </section>
    )
}