// --- SiteStats.jsx ---
"use client";
import { motion } from "framer-motion";

const stats = [
  { label: "Books Uploaded", value: "10,000+" },
  { label: "Active Users", value: "3,000+" },
  { label: "Genres Covered", value: "100+" }
];

export default function SiteStats() {
  return (
    <section className="bg-[#FAF3ED] px-6 md:px-16 py-20">
      <h2 className="text-3xl font-bold text-[#5D4037] mb-12 text-center">
        Our <span className="text-[#A47148]">Journey</span> So Far
      </h2>
      <div className="grid md:grid-cols-3 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="text-3xl font-bold text-[#A47148] mb-2">{s.value}</div>
            <p className="text-[#5D4037]">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
