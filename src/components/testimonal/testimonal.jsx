"use client";
import { useState } from "react";

const allTestimonials = [
  { name: "Aarav Mehta", quote: "BookVault helped me organize my collection like never before. A must-use for all readers!" },
  { name: "Sara Iqbal", quote: "I love the clean interface and vintage vibes. I now enjoy discovering books more often." },
  { name: "Rohit Khanna", quote: "Uploading and managing books is now a joy. BookVault is a gem." },
  { name: "Nisha Rao", quote: "A wonderful way to connect with literature and discover authors." },
  { name: "Karan Singh", quote: "The UI is simply gorgeous and intuitive. I use it daily." },
  { name: "Ananya Deshmukh", quote: "Vintage feel meets modern functionality — love it!" },
  { name: "Farhan Ali", quote: "Being able to search by genre and build my shelf is a dream." },
  { name: "Ritika Sharma", quote: "Finally a site that cares about books the way I do." },
];

export default function Testimonials() {
  const [showAll, setShowAll] = useState(false);
  const displayedTestimonials = showAll ? allTestimonials : allTestimonials.slice(0, 2);

  return (
    <section className="bg-white px-4 sm:px-6 md:px-16 py-16 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#5D4037] mb-8 sm:mb-12 text-center">
        What Our <span className="text-[#A47148]">Readers Say</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {displayedTestimonials.map((t, i) => (
          <blockquote
            key={i}
            className="bg-[#FFF8F5] p-6 rounded-xl shadow-sm border-l-4 border-[#A47148] text-[#5D4037]"
          >
            <p className="italic mb-4">“{t.quote}”</p>
            <footer className="font-semibold">— {t.name}</footer>
          </blockquote>
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={() => setShowAll(!showAll)}
          className="bg-[#A47148] hover:bg-[#8D5C35] text-white font-medium px-6 py-2 rounded-md transition"
        >
          {showAll ? "Show Less" : "Read More Testimonials"}
        </button>
      </div>
    </section>
  );
}
