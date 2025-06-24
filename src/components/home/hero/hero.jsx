"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-[#F4EDE4] min-h-screen flex items-center justify-center px-6 md:px-16 py-24">
      <div className="max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-[#5D4037] leading-tight"
        >
          Discover Your <span className="text-[#A47148]">Next Favorite Book</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-[#4E342E] leading-relaxed"
        >
          Welcome to BookVault — your sanctuary of stories. Curate your collection, explore timeless reads, and rediscover the joy of literature in a warm, vintage-inspired space.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D4C41] hover:bg-[#4E342E] text-white font-semibold rounded-full shadow-lg transition-all">
            Start Exploring <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
