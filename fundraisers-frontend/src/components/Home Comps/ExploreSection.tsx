"use client"

import { dummyData, ProgramType } from "@/constants/ProgramData.constant";
import ProgramCard from "../ProgramCard";
import { useState } from "react";
import Buttons from "../Buttons";
// import { FaArrowRight } from "react-icons/fa";

interface ExploreSectionProps {
  onOpen: () => void;
  selectedCard: (program: ProgramType) => void;
}


export default function ExploreSection({onOpen, selectedCard}: ExploreSectionProps) {
  
  // const handleDummy =  () => console.log("hey");
  const [showMore, setShowMore] = useState<boolean>(false);
  const showProgramCard = showMore ? dummyData : dummyData.slice(0,3);


  return (
    <section
    id="ExploreSection"
    className="bg-black bg-gradient-to-b to-black h-full w-full md:pt-12 pt-10"
    >
    <div className="max-w-[100rem] mx-auto flex flex-col lg:flex-row justify-between items-start gap-12 p-4 md:p-8 ">
        <div className="w-full text-white px-4 sm:px-6 lg:px-16 mt-8">
        <div className="flex justify-between items-center mb-12 md:mb-16 px-4">
          <p className="text-xl sm:text-3xl">
          <span>Explore </span>
          <span className="text-cyan-400">Fund</span>
          <span className="text-white">raisers</span>
          <span> Programs </span>
          </p>
            
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-x-8 gap-y-12 justify-items-center  sm:px-8">
          {showProgramCard.map((item, index) => (
            <ProgramCard 
              key={`${item.id}-${index}`}  
              onOpen={() => {
                selectedCard(item);
                onOpen();
              }} 
              name={item.name}   
              desc={item.desc}
              category={item.category}
              createdAt={item.createdAt}
              photoUrl={item.photoUrl}
              
            />
          ))}
        </div>
        <div className="w-full flex mx-auto justify-center mt-12">
          <Buttons type="button" className="text-white text-sm md:text-md px-4 py-2  rounded-xl border-[2px] border-cyan-400 font-thin" onClick={() => setShowMore(!showMore)}>Show {showMore ? 'Less' : 'More'}</Buttons>
        </div>
        </div>
    </div>
    </section>

  );
}
