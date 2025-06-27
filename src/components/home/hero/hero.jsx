"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-[#F4EDE4] min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-20 sm:py-24">
      <div className="max-w-5xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#5D4037] leading-tight"
        >
          Discover Your <span className="text-[#A47148] block sm:inline">Next Favorite Book</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl text-[#4E342E] leading-relaxed max-w-4xl mx-auto px-2"
        >
          Welcome to BookVault — your sanctuary of stories. Curate your collection, explore timeless reads, and rediscover the joy of literature in a warm, vintage-inspired space.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 sm:mt-8"
        >
          <Link href="/my-books">
            <button className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#6D4C41] hover:bg-[#4E342E] text-white font-semibold rounded-full shadow-lg transition-all text-sm sm:text-base">
              Start Exploring <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;