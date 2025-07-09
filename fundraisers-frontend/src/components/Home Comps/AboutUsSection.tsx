import { motion } from "framer-motion";

export default function AboutUsSection() {

    return (
        <section id="AboutUsSection" className="bg-black text-white pt-4 pb-20 px-6 md:px-20">
            <div className="max-w-[100rem] mx-auto grid lg:grid-cols-2 gap-12 items-center">
                
                <motion.div
                    initial={{ opacity: 0, y: -45 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}>
                    <div className="text-2xl md:text-5xl font-light tracking-tighter">
                        <span>About </span>
                        <span className="text-cyan-400">Fund</span>
                        <span className="text-white">raisers</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed pt-6">
                        <span className="text-white font-medium">Fundraisers</span> is a blockchain-based crowdfunding web application designed to provide a transparent, secure, and accountable platform for supporting a wide variety of programs and projects across social, technological, environmental, educational, and humanitarian fields.
                    </p>
                    <p className="text-neutral-400 mt-4 leading-relaxed">
                        Built on the <span className="text-cyan-400">Lisk blockchain</span>, Fundraisers uses the <span className="text-cyan-400">IDRX stablecoin</span> to ensure price stability and leverages the <span className="text-cyan-400">Xellar Kit</span> for seamless decentralized application development.
                    </p>
                    <p className="text-neutral-400 mt-4 leading-relaxed">
                        Through Fundraisers, the public can donate to verified programs, while program leaders (PICs) manage and allocate funds responsibly, with all transactions being fully transparent and trackable in real time.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -45 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }} className="grid grid-cols-2 gap-6">
                    <div className="bg-neutral-900 p-6 rounded-xl text-center border border-cyan-800 shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300">
                        <p className="text-cyan-400 font-semibold mb-2">Transparency</p>
                        <p className="text-sm text-neutral-400">Track every donation and fund movement in real time.</p>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-xl text-center border border-cyan-800 shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300">
                        <p className="text-cyan-400 font-semibold mb-2">Stability</p>
                        <p className="text-sm text-neutral-400">Powered by IDRX to avoid volatility in donations.</p>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-xl text-center border border-cyan-800 shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300">
                        <p className="text-cyan-400 font-semibold mb-2">Security</p>
                        <p className="text-sm text-neutral-400">Built on blockchain with immutable records.</p>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-xl text-center border border-cyan-800 shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300">
                        <p className="text-cyan-400 font-semibold mb-2">Decentralized</p>
                        <p className="text-sm text-neutral-400">No central control. Users interact with smart contracts.</p>
                    </div>
                </motion.div>

            </div>
        </section>
    )
}