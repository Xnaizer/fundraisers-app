"use client"

import Image from "next/image";
// import tesImg from "../../public/HomeBanner1.jpg";
import { FaGlobeAsia, FaArrowRight } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";

interface ProgramCardProps {
  onOpen: () => void;
    name: string;
    desc: string;
    category:
    | 'Sociaty'
    | 'Environment'
    | 'Technology'
    | 'Health'
    | 'Education'
    | 'Emergency'
    | 'Animals'
    | 'Sports'
    | 'Arts'
    | 'Culture'
    | 'Religious';
    photoUrl: string;
    createdAt: string;

}





export default function ProgramCard(props: ProgramCardProps ) {

  const {name,desc,category,photoUrl, createdAt, onOpen} = props;

  return (
    <section className="w-full max-w-sm lg:max-w-md bg-neutral-950 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300"
    onClick={onOpen}
    >
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={photoUrl}
          alt="programImg"
          fill
          className="object-cover rounded-t-xl"
          priority
        />
      </div>

      <div className="p-6 md:p-8">
        <p className="text-cyan-400 flex items-center gap-2 text-sm lg:text-base">
          <FaGlobeAsia /> {category}
        </p>

        <h2 className="text-white text-lg md:text-[1rem] lg:text-xl py-2 pt-3 leading-snug">
          {name}
        </h2>

        <p className="text-neutral-400 text-sm md:text-base leading-relaxed tracking-tight pb-4">
          {desc}
        </p>

        <div className="flex justify-between items-center pt-2 text-[0.7rem] md:text-[0.75rem]">
          <h4 className="flex items-center gap-2">
            <LuClock3 />
              <span>Created {new Date(createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</span>
          </h4>

          <p
            className="text-cyan-400 hover:text-cyan-500 flex items-center gap-1 md:gap-2 group"
          >
            Read More <FaArrowRight className="group-hover:translate-x-1 duration-300 group-hover:text-cyan-500" />
          </p>
        </div>
      </div>
    </section>
  );
}
