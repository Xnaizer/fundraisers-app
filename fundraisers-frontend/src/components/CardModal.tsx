"use client"

import { useEffect } from "react";
// import testImg from '../../public/HomeBanner1.jpg'
import Buttons from "./Buttons"
import { X } from 'lucide-react';
import Image from "next/image";
import { FaGlobeAsia } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { ProgramType } from "@/constants/ProgramData.constant";

interface CardModalProps {
  onCardClose: () => void;
  onContributeCard: () => void;
  onHistoryOpen: () => void;
  isHistoryOpen: boolean;
  isCardOpen: boolean;
  program: ProgramType | null;
}

export default function CardModal({ onCardClose, onContributeCard, onHistoryOpen,isHistoryOpen, isCardOpen, program }: CardModalProps) {
//   const handleBunny = () => {
//     console.log("hi");
//   };

  useEffect(() => {
    if (isHistoryOpen || isCardOpen ) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isHistoryOpen,isCardOpen]);

  return (
    <div className="bg-black/40 min-h-screen w-full fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12">
      {isHistoryOpen ? (
        <div
          className="bg-black text-white w-full max-w-[95%] sm:max-w-3xl rounded-2xl mt-20 relative shadow-lg overflow-hidden"
          style={{ boxShadow: '0 0 10px 1px rgba(0, 0, 0, 1)' }}
        >
          
          <div className="flex justify-between items-center p-4 border-b border-neutral-700">
            <h3 className="text-lg font-thin">History Withdraw</h3>
            <button onClick={onCardClose} className="text-neutral-400 hover:text-white cursor-pointer p-1 md:p-2 hover:bg-neutral-900/90  bg-neutral-800/90 rounded-full">
              <X className="w-5 md:w-6  h-5 md:h-6"  />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4">
            <table className="w-full table-auto text-sm md:text-base">
              <thead>
                <tr className="bg-neutral-800">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Amount (IDRX)</th>
                  <th className="px-3 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2025-05-10', amount: 250000, desc: 'Donasi awal' },
                  { date: '2025-05-12', amount: 150000, desc: 'Tambahan donasi' },
                  { date: '2025-05-14', amount: 300000, desc: 'Support campaign' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  { date: '2025-05-16', amount: 200000, desc: 'Donasi akhir' },
                  
                ].map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-neutral-900' : ''}
                  >
                    <td className="px-3 py-2 font-thin">{row.date}</td>
                    <td className="px-3 py-2 text-right font-thin">{row.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 font-thin">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        
          <div className="p-4 border-t border-neutral-700 flex justify-end">
            <Buttons
              className="text-white font-light border-[2px] border-cyan-500 py-2 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer"
              onClick={onHistoryOpen}
              type="button"
            >
              Back
            </Buttons>
          </div>
        </div>
      ) : (
      <div
        className="bg-black text-white w-full max-w-[95%] sm:max-w-3xl rounded-2xl mt-16 relative shadow-lg "
        style={{ boxShadow: '0 0 10px 1px rgba(0, 0, 0, 1)' }}
      >
       
        <div className="relative w-full h-32 md:h-64">
          <button
            onClick={onCardClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition cursor-pointer z-50  p-1 mb:p-2 hover:bg-neutral-900/90  bg-neutral-800/90 rounded-full"
          >
            <X className="w-5 md:w-6  h-5 md:h-6" />
          </button>

        {program && (
          <Image
            src={program.photoUrl}
            alt={program.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-xl"
            priority
          />
        )
        }
        </div>

      
        <section className="px-5 sm:px-8 md:px-16 py-4 sm:py-8 md:py-12">

        
          <div className="mb-3 md:mb-6 mt-1 flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center">
            <div className="flex flex-wrap gap-4 text-[0.75rem] md:text-base">
              <p className="text-cyan-400 flex items-center gap-2">
                <FaGlobeAsia /> <span >{program?.category}</span> 
              </p>
              <h4 className="flex items-center gap-2 font-extralight">
                <LuClock3 />
                <span>Created {new Date(program?.createdAt ?? "").toLocaleDateString('en',{
                  day:'numeric',
                  month:'long',
                  year:'numeric',
                })}</span>
              </h4>
            </div>

          
            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
              <div className="w-full sm:w-72 h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <p className="mt-2 font-thin text-[0.75rem] md:text-sm">1000000 / {program?.budget} IDRX</p>
            </div>
          </div>

    
          <div className="mb-2 md:mb-4 flex flex-col sm:flex-row sm:items-end sm:gap-4">
            <h2 className="text-sm md:text-lg lg:text-xl font-thin">
              {program?.name}
            </h2>
            <h2 className="font-thin text-[0.75rem] md:text-sm text-neutral-300">
              {program?.picName}
            </h2>
          </div>


          <p className="font-thin text-neutral-300 text-[0.75rem] md:text-base mb-2 md:mb-5">
            {program?.desc}
          </p>


          <p className="font-thin text-neutral-300 text-xs sm:text-sm mb-3 sm:mb-10 break-words">
            PIC Address : {program?.address}
          </p>


          <div className="flex flex-row gap-3 md:gap-6 items-center justify-center pt-4">
            <Buttons
            
            className="text-white font-light border-[2px] border-cyan-500 py-2 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer text-[0.7rem] md:text-md w-full md:w-56 text-center"
            onClick={onContributeCard}
            type="button"
            >
            Links
            </Buttons>

            <Buttons
            
            className="text-white font-light border-[2px] border-cyan-500 py-2 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer text-[0.7rem] md:text-md w-full md:w-56 text-center"
            onClick={onHistoryOpen}
            type="button"
            >
            History
            </Buttons>

            <Buttons
            
            className="text-white font-light border-[2px] border-cyan-500 py-2 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer text-[0.7rem] md:text-md w-full md:w-56 text-center"
            onClick={onContributeCard}
            type="button"
            >
            Contribute
            </Buttons>
          </div>

        </section>
      </div>
      )}
    </div>
  );
}