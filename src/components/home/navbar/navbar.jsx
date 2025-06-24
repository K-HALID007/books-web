"use client";
import Link from "next/link";
import { BookMarked, Upload, Menu } from "lucide-react";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#6D4C41] text-white shadow-md z-50">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-[#D7CCC8]" />
          <span className="text-xl font-semibold text-[#FBE9E7]">BookVault</span>
        </Link>

        {/* Nav Links */}
        <ul className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <li>
            <Link
              href="/"
              className="hover:text-[#FFD180] transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/browse"
              className="hover:text-[#FFD180] transition-colors duration-200"
            >
              Browse
            </Link>
          </li>
          <li>
            <Link
              href="/my-books"
              className="hover:text-[#FFD180] transition-colors duration-200"
            >
              My Books
            </Link>
          </li>
          <li>
            <Link
              href="/genres"
              className="hover:text-[#FFD180] transition-colors duration-200"
            >
              Genres
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="hover:text-[#FFD180] transition-colors duration-200"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Upload Book Button */}
          <Link href="/upload">
            <button className="flex items-center gap-2 bg-[#FFD180] hover:bg-[#f4b160] text-[#5D4037] font-medium px-4 py-2 rounded-full text-sm transition">
              <Upload className="w-4 h-4" />
              Upload Book
            </button>
          </Link>

          {/* Sign In Button */}
          <Link href="/signin">
            <button className="bg-[#A47148] hover:bg-[#8D5C35] px-4 py-2 rounded-full text-sm font-medium transition">
              Sign In
            </button>
          </Link>

          {/* Mobile Menu Icon */}
          <Menu className="md:hidden cursor-pointer" />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
