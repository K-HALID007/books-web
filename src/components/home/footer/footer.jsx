"use client";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#6D4C41] text-[#FBE9E7] py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        {/* Brand Info */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">BookVault</h3>
          <p className="text-sm text-[#EBD5C5]">
            A timeless home for book lovers. Curate, collect, and celebrate stories worth keeping.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-[#EBD5C5]">
            <li className="hover:text-[#FFD180] cursor-pointer">Home</li>
            <li className="hover:text-[#FFD180] cursor-pointer">My Library</li>
            <li className="hover:text-[#FFD180] cursor-pointer">Genres</li>
            <li className="hover:text-[#FFD180] cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Resources</h4>
          <ul className="space-y-2 text-sm text-[#EBD5C5]">
            <li className="hover:text-[#FFD180] cursor-pointer">Blog</li>
            <li className="hover:text-[#FFD180] cursor-pointer">Privacy Policy</li>
            <li className="hover:text-[#FFD180] cursor-pointer">Terms & Conditions</li>
          </ul>
        </div>

        {/* Social + Contact */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Connect</h4>
          <div className="flex gap-4 mb-4 text-[#EBD5C5]">
            <Facebook className="w-5 h-5 hover:text-[#FFD180] cursor-pointer" />
            <Instagram className="w-5 h-5 hover:text-[#FFD180] cursor-pointer" />
            <Twitter className="w-5 h-5 hover:text-[#FFD180] cursor-pointer" />
            <Mail className="w-5 h-5 hover:text-[#FFD180] cursor-pointer" />
          </div>
          <p className="text-sm text-[#EBD5C5]">© {new Date().getFullYear()} BookVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
