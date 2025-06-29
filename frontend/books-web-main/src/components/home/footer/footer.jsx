"use client";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#6D4C41] text-[#FBE9E7] py-8 sm:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">BookVault</h3>
            <p className="text-sm sm:text-base text-[#EBD5C5] leading-relaxed">
              A timeless home for book lovers. Curate, collect, and celebrate stories worth keeping.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm sm:text-base text-[#EBD5C5]">
              <li className="hover:text-[#FFD180] cursor-pointer transition-colors duration-200">Home</li>
              <li className="hover:text-[#FFD180] cursor-pointer transition-colors duration-200">My Library</li>
                            <li className="hover:text-[#FFD180] cursor-pointer transition-colors duration-200">Contact</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm sm:text-base text-[#EBD5C5]">
              <li className="hover:text-[#FFD180] cursor-pointer transition-colors duration-200">Blog</li>
              <li className="hover:text-[#FFD180] cursor-pointer transition-colors duration-200">Privacy Policy</li>
              <li className="hover:text-[#FFD180] cursor-pointer transition-colors duration-200">Terms & Conditions</li>
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Connect</h4>
            <div className="flex gap-3 sm:gap-4 mb-4 text-[#EBD5C5]">
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6 hover:text-[#FFD180] cursor-pointer transition-colors duration-200" />
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6 hover:text-[#FFD180] cursor-pointer transition-colors duration-200" />
              <Twitter className="w-5 h-5 sm:w-6 sm:h-6 hover:text-[#FFD180] cursor-pointer transition-colors duration-200" />
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 hover:text-[#FFD180] cursor-pointer transition-colors duration-200" />
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#5D4037] text-center">
          <p className="text-xs sm:text-sm text-[#EBD5C5]">
            © {new Date().getFullYear()} BookVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
