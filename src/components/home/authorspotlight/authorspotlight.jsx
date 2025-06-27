// --- AuthorSpotlights.jsx ---
"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const authors = [
  { name: "Jane Austen", image: "/spotlight/Jane Austen.jpg", books: 6 },
  { name: "George Orwell", image: "/spotlight/George Orwell.jpg", books: 9 },
  { name: "J.K. Rowling", image: "/spotlight/J.K. Rowling.jpg", books: 7 }
];

export default function AuthorSpotlights() {
  return (
    <section className="bg-[#F4EDE4] px-4 sm:px-6 md:px-16 py-16 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#5D4037] mb-8 sm:mb-10 text-center">
        Author <span className="text-[#A47148]">Spotlights</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {authors.map((author, i) => (
          <motion.div
            key={author.name}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, delay: i * 0.2 }}
            className="bg-white rounded-lg p-6 shadow-md text-center"
          >
            <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={author.image}
                alt={author.name}
                width={112}
                height={112}
                className="w-full h-full object-cover object-center"
                style={{ minWidth: '100%', minHeight: '100%' }}
              />
            </div>
            <h4 className="font-bold text-[#5D4037] text-lg mb-1">{author.name}</h4>
            <p className="text-sm text-[#6B4F3F]">{author.books} Books Available</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}