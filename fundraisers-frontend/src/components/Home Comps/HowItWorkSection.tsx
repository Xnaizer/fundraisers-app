
import React from "react";
import { FundraisersWork } from "@/constants/HowItWork.constant"
import Marquee from "react-fast-marquee";
import { motion } from "framer-motion";

export default function HowItWorkSection() {

    return (
        <section id="HowItWorkSection" className="bg-black w-full md:pt-12 pb-24 ">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
                <div className="absolute left-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-0 right-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
            </div>
            
            <div className="w-full max-w-[100rem] mx-auto flex flex-col items-center gap-12 p-6 lg:p-16 z-10">
                
                <h1 className="text-white text-center text-2xl md:text-3xl font-thin">
                    How <span className="text-cyan-400">Fund</span>raisers Works?
                </h1>

                <div className="relative w-full pb-16 pt-8 lg:pt-24 max-w-[100rem]">
                                        
                    
                    <div className="absolute left-1/2 -translate-x-1/2 top-[12rem] bottom-[10rem] w-1 bg-gradient-to-b from-cyan-400 to-purple-500/90 z-10 hidden lg:block "></div>

                    
                    <div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-[12rem] w-10 h-10 rounded-full border- border-white bg-gradient-to-b from-cyan-500 to-purple-500 z-10 hidden lg:flex items-center justify-center">
                            <div className="bg-black w-5 h-5 rounded-full"></div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-[31rem] w-10 h-10 rounded-full border- border-white bg-gradient-to-b from-cyan-500 to-purple-500 z-10 hidden lg:flex items-center justify-center">
                            <div className="bg-black w-5 h-5 rounded-full"></div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-[49rem] w-10 h-10 rounded-full border- border-white bg-gradient-to-b from-cyan-500 to-purple-500 z-10 hidden lg:flex items-center justify-center">
                            <div className="bg-black w-5 h-5 rounded-full"></div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-[67rem] w-10 h-10 rounded-full border- border-white bg-gradient-to-b from-cyan-500 to-purple-500 z-10 hidden lg:flex items-center justify-center ">
                            <div className="bg-black w-5 h-5 rounded-full"></div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-[86rem] w-10 h-10 rounded-full border- border-white bg-gradient-to-b from-cyan-500 to-purple-500 z-10 hidden lg:flex items-center justify-center">
                            <div className="bg-black w-5 h-5 rounded-full"></div>
                        </div>    
                        <div className="absolute left-1/2 -translate-x-1/2 top-[105rem] w-10 h-10 rounded-full border- border-white bg-gradient-to-b from-cyan-500 to-purple-500 z-10 hidden lg:flex items-center justify-center">
                            <div className="bg-black w-5 h-5 rounded-full"></div>
                        </div>                     
                    </div>
                    
                    

                    


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 z-0">
                    {FundraisersWork.map((item, idx) => (
                        <React.Fragment key={item.id}>
                        {idx % 2 === 0 ? (
                            <>
                            <div className="w-full flex justify-between lg:justify-start">
                                <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="w-full lg:w-[28rem] border-[2px] border-cyan-400 rounded-xl p-6 bg-black text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300"
                                >
                                <p className="text-lg font-thin">
                                    0{item.id}. <span className="text-cyan-400">{item.name}</span>
                                </p>
                                <h2 className="pt-3 text-lg font-thin">{item.title}</h2>
                                <p className="pt-3 text-neutral-400 text-sm">{item.desc}</p>
                                </motion.div>
                            </div>
                            <div className="hidden lg:block" />
                            </>
                        ) : (
                            <>
                            <div className="hidden lg:block" />
                            <div className="w-full flex justify-between lg:justify-end">
                                <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="w-full lg:w-[28rem] border-[2px] border-cyan-400 rounded-xl p-6 bg-black text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300"
                                >
                                <p className="text-lg font-thin">
                                    0{item.id}. <span className="text-cyan-400">{item.name}</span>
                                </p>
                                <h2 className="pt-3 text-lg font-thin">{item.title}</h2>
                                <p className="pt-3 text-neutral-400 text-sm">{item.desc}</p>
                                </motion.div>
                            </div>
                            </>
                        )}
                        </React.Fragment>
                    ))}
                    </div>





                </div>
            </div>

            <div>
                <Marquee gradient={false} speed={50} className="w-full  overflow-hidden">
                <span className="text-neutral-700 text-[4rem]  font-light whitespace-nowrap select-none ">
                    Revolutionizing Crowdfunding with the Power of Blockchain. Revolutionizing Crowdfunding with the Power of Blockchain. 
                </span>
                </Marquee>

            </div>        

        </section>
    )
}