"use client";

import { useRouter } from "next/navigation";
import Buttons from "@/components/Buttons";
import Image from "next/image"; 
import FundraisersLogo from "../../public/Fundraisers.png"

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      
      <div className="pointer-events-none absolute  z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900/90 to-black" />
        <div className="absolute left-0 top-0 h-[400px] w-[400px] bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] bg-purple-600/20 blur-[120px]" />
      </div>

      
      <div className="text-center px-6 animate-fade-in-up ">
        <h1 className="text-[6rem] font-bold text-cyan-400 drop-shadow-lg">404</h1>
        <div className="flex items-center gap-2 cursor-pointer w-full mx-auto justify-center mb-5" 
          onClick={() => {
            router.push('/');
          }}>
          <Image src={FundraisersLogo} alt="Logo" width={32} height={21} className="w-6 lg:w-8 " />
          <div>
            <span className="text-cyan-400 text-lg md:text-2xl lg:text-2xl font-light tracking-tighter">Fund</span>
            <span className="text-white text-lg md:text-2xl lg:text-2xl  font-light tracking-tighter">raisers</span>
          </div>
        </div>
        <p className="text-xl text-neutral-300 mb-6">Oops! Halaman tidak ditemukan.</p>
        <Buttons
          type="button"
          className="bg-cyan-500 hover:bg-cyan-600 transition-all duration-300 text-white px-5 py-2 rounded-lg"
          onClick={() => router.push("/")}
        >
          Back To Home
        </Buttons>
      </div>
    </div>
  );
}