"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const dummyBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    image: "/browse/gatsby.jpg",
    genre: "Classic",
    description: "A tragic tale of wealth, love, and the American dream.",
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    image: "/browse/hobbit.jpg",
    genre: "Fantasy",
    description: "Bilbo Baggins' unexpected adventure through Middle-earth.",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    image: "/browse/alchemist.jpg",
    genre: "Adventure",
    description: "A mystical journey about dreams, destiny, and discovery.",
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    image: "/browse/sapiens.jpg",
    genre: "Non-fiction",
    description: "A brief history of humankind from evolution to now.",
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    image: "/browse/bookthief.jpg",
    genre: "Historical",
    description: "A story of a girl, war, and the power of words in Nazi Germany.",
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    image: "/browse/catcher.jpg",
    genre: "Coming-of-age",
    description: "Holden Caulfield's cynical journey through New York.",
  },
  // Add more as needed
];

const Browse = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Here you'd fetch from API later
    setBooks(dummyBooks);
  }, []);

  return (
    <section className="bg-[#F4EDE4] px-6 md:px-16 py-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-[#5D4037] mb-6">
          Browse <span className="text-[#A47148]">Our Library</span>
        </h1>
        <p className="text-lg text-[#6B4F3F] max-w-2xl mx-auto mb-12">
          Explore a world of stories, genres, and timeless wisdom. Every book here is a portal into a different reality.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {books.map((book, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl overflow-hidden shadow-md group hover:shadow-xl transition-all"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={book.image}
                alt={book.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />
              <div className="absolute bottom-0 p-4 z-20 text-white">
                <h3 className="text-xl font-semibold drop-shadow-md">
                  {book.title}
                </h3>
                <p className="text-sm font-medium opacity-90 mb-1">
                  by {book.author}
                </p>
                <p className="text-xs opacity-80">{book.genre}</p>
              </div>
            </div>
            <div className="p-4 text-[#4E342E]">
              <p className="text-sm leading-snug">{book.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Browse;
