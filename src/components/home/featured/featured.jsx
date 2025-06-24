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
    <section className="bg-[#F4EDE4] px-6 md:px-16 py-24">
      <div className="max-w-7xl mx-auto text-center">
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-[#5D4037] mb-4"
        >
          Featured <span className="text-[#A47148]">Collections</span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#6B4F3F] text-md md:text-lg max-w-2xl mx-auto mb-12"
        >
          Handpicked literary gems that have stood the test of time. Explore these iconic works from legendary authors that continue to inspire generations.
        </motion.p>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {books.map((book, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-[3/4] bg-white"
            >
              {/* Book Image */}
              <Image
                src={book.image}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={85}
                priority={index === 0}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />

              {/* Text Content */}
              <div className="absolute bottom-0 z-20 p-5 text-left text-white">
                <h3 className="text-xl font-bold mb-1 drop-shadow-lg">
                  {book.title}
                </h3>
                <p className="text-sm font-medium drop-shadow-md mb-2">
                  by {book.author}
                </p>
                <p className="text-xs opacity-90 leading-snug drop-shadow-sm">
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
