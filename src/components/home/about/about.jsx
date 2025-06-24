"use client";
import { motion } from "framer-motion";
import { BookOpen, Star, Library } from "lucide-react";
        import Image from "next/image";
import { useState } from "react";

const About = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <section className="bg-[#F4EDE4] px-6 md:px-16 py-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#5D4037] mb-8 leading-snug">
            About <span className="text-[#A47148]">BookVault</span>
          </h2>

          <p className="text-xl text-[#4E342E] leading-relaxed">
            BookVault is your personal gateway to organizing, exploring, and preserving your love for books. Whether you're a casual reader or a passionate collector, our platform lets you catalog your collection, discover new favorites, and revisit timeless classics — all in a beautiful, distraction-free environment that feels like home.
          </p>

          <p className="mt-6 text-lg text-[#6B4F3F]">
            Inspired by the elegance of traditional libraries and the warmth of vintage design, BookVault is crafted for those who believe books deserve more than just a shelf — they deserve a sanctuary.
          </p>
        </motion.div>

        {/* Right: Visual Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="relative">
            {/* Skeleton Loading State */}
            {!imageLoaded && !imageError && (
              <div className="w-full h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Error State */}
            {imageError && (
              <div className="w-full h-80 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
                <BookOpen className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-sm">Image could not be loaded</p>
              </div>
            )}
            
            {/* Next.js Optimized Image */}
            <div className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Image
                src="/about/aboutimg.png"
                alt="Stack of vintage books representing BookVault's collection"
                width={400}
                height={320}
                className="w-full h-auto max-h-80 object-contain"
                priority={false}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <BookOpen className="mx-auto text-[#6D4C41] w-6 h-6" />
              <p className="mt-2 text-sm font-semibold text-[#4E342E]">2,500+ Books</p>
            </div>
            <div>
              <Star className="mx-auto text-[#A47148] w-6 h-6" />
              <p className="mt-2 text-sm font-semibold text-[#4E342E]">5★ Reviews</p>
            </div>
            <div>
              <Library className="mx-auto text-[#5D4037] w-6 h-6" />
              <p className="mt-2 text-sm font-semibold text-[#4E342E]">100+ Genres</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
