"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const books = [
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "/featured/pride.jpg",
    description:
      "A timeless romantic novel exploring love, class, and misunderstandings in Georgian England.",
  },
  {
    title: "1984",
    author: "George Orwell",
    image: "/featured/1984.jpg",
    description:
      "A dystopian classic that delves into surveillance, truth, and resistance under totalitarian rule.",
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    image: "/featured/bird.png",
    description:
      "A powerful tale of racial injustice and moral growth through the eyes of a young girl in the Deep South.",
  },
];

const FeaturedCollections = () => {
  return (
    <section className="bg-[#F4EDE4] px-4 sm:px-6 md:px-8 lg:px-16 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto text-center">
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#5D4037] mb-3 sm:mb-4"
        >
          Featured <span className="text-[#A47148]">Collections</span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#6B4F3F] text-sm sm:text-base lg:text-lg max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12 px-4"
        >
          Handpicked literary gems that have stood the test of time. Explore these iconic works from legendary authors that continue to inspire generations.
        </motion.p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {books.map((book, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-[3/4] bg-white hover:shadow-xl transition-shadow duration-300"
            >
              {/* Book Image */}
              <Image
                src={book.image}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={85}
                priority={index === 0}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

              {/* Text Content */}
              <div className="absolute bottom-0 z-20 p-3 sm:p-4 lg:p-5 text-left text-white w-full">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 drop-shadow-lg line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium drop-shadow-md mb-2 opacity-90">
                  by {book.author}
                </p>
                <p className="text-xs opacity-80 leading-snug drop-shadow-sm line-clamp-3 hidden sm:block">
                  {book.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
