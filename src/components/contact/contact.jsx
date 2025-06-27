"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, PhoneCall, MapPin } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <section className="bg-gradient-to-br from-[#F4EDE4] via-[#FAF3ED] to-[#F4EDE4] min-h-screen px-6 md:px-16 py-28">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-center text-[#5D4037] mb-16"
        >
          Let's <span className="text-[#A47148]">Connect</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-[#E0CFC1]"
          >
            <div>
              <label className="block mb-2 text-[#6B4F3F] font-semibold text-sm">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-[#D7CCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A47148] bg-white text-[#5D4037] placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-[#6B4F3F] font-semibold text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-[#D7CCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A47148] bg-white text-[#5D4037] placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-[#6B4F3F] font-semibold text-sm">Message</label>
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-[#D7CCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A47148] bg-white text-[#5D4037] placeholder-gray-500 resize-vertical"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#A47148] hover:bg-[#8D5C35] text-white font-semibold px-6 py-3 rounded-full transition duration-300"
            >
              Send Message
            </button>
            {submitted && (
              <p className="text-green-600 text-center font-medium mt-4">
                Thank you! We'll be in touch soon.
              </p>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-10 text-[#5D4037] text-sm"
          >
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 mt-1 text-[#A47148]" />
              <div>
                <h4 className="font-bold mb-1">Email</h4>
                <p>support@bookvault.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <PhoneCall className="w-6 h-6 mt-1 text-[#A47148]" />
              <div>
                <h4 className="font-bold mb-1">Phone</h4>
                <p>+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 mt-1 text-[#A47148]" />
              <div>
                <h4 className="font-bold mb-1">Location</h4>
                <p>123 BookVault Lane, Mumbai, India</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-1">Office Hours</h4>
              <p>Mon – Fri: 10:00 AM – 6:00 PM</p>
              <p>Sat – Sun: Closed</p>
            </div>
            <div className="pt-6 border-t border-[#D7CCC8]">
              <p className="italic text-[#7D5A45]">"Your message matters. Let's create something meaningful together."</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;