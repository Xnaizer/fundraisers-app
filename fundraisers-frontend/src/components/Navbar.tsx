'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Menu, X } from "lucide-react";
import FundraisersLogo from "../../public/Fundraisers.svg";
// import Buttons from "./Buttons"
import ConnectWalletButton from "./ConnectWalletButton";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollActive, setScrollActive] = useState(false);
  const router = useRouter();


  // const handleConnectWallet = () => {
  //   console.log('hi')
  // }
  
const menuItems = [
  { label: "Home", targetId: "HomeSection" },
  { label: "Goals", targetId: "FundraisersGoal" },
  { label: "Explore", targetId: "ExploreSection" },
  { label: "How It Work", targetId: "HowItWorkSection" },
  { label: "About Us", targetId: "AboutUsSection" },
];

  const handleScroll = () => {
    if(window.scrollY >= 50 ){
      setScrollActive(true);
    } else {
      setScrollActive(false);
    }
  }
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll)
  },[]);

  const handleMenuClick = (targetId:string) => {
    if(window.location.pathname !== '/'){
      router.push(`/#${targetId}`);
    } else {
      const target = document.getElementById(targetId)
      if(target) {
        target.scrollIntoView({behavior: 'smooth'});
      }
    }
  }


  return (
    <nav id="Home"
      className={`fixed top-0 left-0 z-50 w-full px-4 lg:px-8 transition-shadow backdrop-blur-sm duration-300 bg-transparent  ${
        scrollActive ? "shadow-[0_2px_10px_rgba(255,255,255,0.15)] id: 1," : ""
      }`}
    >
      <section className="max-w-[100rem] mx-auto flex flex-wrap items-center justify-between py-4  px-2">
        
        
        <div className="flex items-center gap-2 cursor-pointer" 
          onClick={() => {
            router.push('/');
          }}>
          <Image src={FundraisersLogo} alt="Logo" width={32} height={21} className="w-6 lg:w-8 " />
          <div>
            <span className="text-cyan-400 text-lg md:text-2xl lg:text-2xl font-light tracking-tighter">Fund</span>
            <span className="text-white text-lg md:text-2xl lg:text-2xl  font-light tracking-tighter">raisers</span>
          </div>
        </div>

        
        <div className="lg:hidden ml-auto ">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
            {menuOpen ? (
              <X className="text-white w-8 h-8 md:w-12 md:h-12  pt-2  cursor-pointer" />
            ) : (
              <Menu className="text-white w-8 h-8 md:w-12 md:h-12  pt-2  cursor-pointer" />
            )}
          </button>
        </div>

        
        <div
          className={`w-full lg:w-auto flex-col lg:flex-row gap-8  lg:gap-12 xl:gap-16 items-center bg-transparent text-white  font-readex font-light 
            transition-all duration-300 ease-in-out overflow-hidden
            ${menuOpen ? "flex mt-6 md:mt-0" : "hidden"} lg:flex`}
        >
          {menuItems.map(({ label, targetId }) => (
            <h2
              key={label}
              onClick={() => handleMenuClick(targetId) }
              className="hover:text-cyan-400 cursor-pointer text-[0.9rem] lg:text-[1rem]"
            >
              {label}
            </h2>
          ))}

          <div className="w-full lg:w-auto   lg:mt-0 flex justify-center text-center">
            {/* <Buttons
              className="text-white font-light border-[3px] border-cyan-500 py-2 px-4 rounded-xl hover:border-cyan-600 hover:bg-cyan-500 cursor-pointer w-full lg:w-auto text-[0.9rem] lg:text-[1rem]"
              onClick={() => {
                setMenuOpen(false); 
                handleConnectWallet();
              }}
              type="button"
            >
              Connect Wallet
            </Buttons> */}
            <ConnectWalletButton />
          </div>

        </div>

      </section>
    </nav>

  );
}
