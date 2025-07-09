"use client";

import Buttons from "../Buttons";
import { motion } from "framer-motion";
import { ArrowRight, HandHeart } from "lucide-react";

interface HomeSectionProps {
  onOpen: () => void;
}

export default function HomeSection({ onOpen }: HomeSectionProps) {
  return (
    <section
      id="HomeSection"
      className="w-full bg-gradient-to-t from-blue-400 to-black pt-20 pb-24 md:pt-24 md:pb-28 lg:pt-28 lg:pb-32 flex justify-center items-center"
    >
      <div className="w-full max-w-[100rem] px-6 md:px-10 flex flex-col items-center text-center pt-12 md:pt-24 md:pb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-cyan-400 uppercase tracking-widest font-medium text-[0.7rem] md:text-sm mb-4"
        >
          Empowering the Future
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight tracking-tight max-w-5xl"
        >
          Revolutionizing Crowdfunding with{" "}
          <span className="bg-gradient-to-b from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            the Power of Blockchain
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-neutral-300 text-md md:text-xl mt-4 md:mt-8 font-light max-w-3xl"
        >
          Discover a transparent and secure way to support meaningful projects.
          Our blockchain-powered platform ensures every fund is traceable,
          every transaction is tamper-proof, and every project is accountable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center w-full"
        >
          <Buttons
            type="button"
            onClick={() => {
              const target = document.getElementById("ExploreSection");
              if (target) {
                target.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="flex items-center justify-center gap-2 text-white border-2 border-cyan-500 bg-cyan-400 hover:bg-cyan-500 px-6 py-4 rounded-xl font-medium transition w-full sm:w-auto text-sm group"
          >
            Explore Program
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 duration-300" />
          </Buttons>

          <Buttons
            type="button"
            onClick={onOpen}
            className="flex items-center justify-center gap-2 text-white border-2 border-cyan-500 bg-transparent hover:bg-slate-900 px-6 py-4 rounded-xl font-medium transition w-full sm:w-auto text-sm group"
          >
            Contribute Program
            <HandHeart className="w-5 h-5 group-hover:translate-x-1 duration-300" />
          </Buttons>
        </motion.div>
      </div>
    </section>
  );
}
