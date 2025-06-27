// --- HowItWorks.jsx ---
"use client";
const steps = [
  { step: "1", title: "Upload", desc: "Add your favorite books with ease." },
  { step: "2", title: "Organize", desc: "Manage collections and genres." },
  { step: "3", title: "Explore", desc: "Discover new reads and authors." }
];

export default function HowItWorks() {
  return (
    <section className="bg-white px-6 md:px-16 py-20">
      <h2 className="text-3xl font-bold text-[#5D4037] mb-12 text-center">
        How <span className="text-[#A47148]">BookVault</span> Works
      </h2>
      <div className="grid md:grid-cols-3 gap-10 text-center">
        {steps.map((s, i) => (
          <div
            key={s.step}
            className="p-6 bg-[#FFF8F5] border border-[#E0CFC1] rounded-xl shadow-sm"
          >
            <div className="text-4xl font-extrabold text-[#A47148] mb-2">{s.step}</div>
            <h4 className="text-xl font-semibold text-[#5D4037] mb-2">{s.title}</h4>
            <p className="text-[#6B4F3F] text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
