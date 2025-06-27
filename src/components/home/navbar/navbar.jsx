"use client";
import Link from "next/link";
import { BookMarked, Upload, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserDropdown from "@/components/navbar/user-dropdown";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#6D4C41] text-white shadow-md z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-[#D7CCC8]" />
          <span className="text-lg sm:text-xl font-semibold text-[#FBE9E7]">BookVault</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex gap-6 xl:gap-8 text-sm font-medium tracking-wide">
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
              href="/my-books"
              className="hover:text-[#FFD180] transition-colors duration-200"
            >
              All Books
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link
                  href="/my-library"
                  className="hover:text-[#FFD180] transition-colors duration-200"
                >
                  My Library
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              href="/contact"
              className="hover:text-[#FFD180] transition-colors duration-200"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Desktop Right Side Actions */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {isAuthenticated ? (
            <>
              {/* Upload Book Button */}
              <Link href="/upload">
                <button className="flex items-center gap-2 bg-[#FFD180] hover:bg-[#f4b160] text-[#5D4037] font-medium px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm transition">
                  <Upload className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Upload</span>
                  <span className="sm:hidden">Upload</span>
                </button>
              </Link>

              {/* User Dropdown */}
              <UserDropdown />
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <Link href="/signin">
                <button className="bg-[#A47148] hover:bg-[#8D5C35] px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition">
                  Sign In
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md hover:bg-[#5D4037] transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#5D4037] border-t border-[#4E342E] shadow-lg">
          <div className="px-6 py-6">
            {/* Mobile Nav Links */}
            <nav className="mb-6">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className="block text-white hover:text-[#FFD180] hover:bg-[#4E342E] transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-books"
                    className="block text-white hover:text-[#FFD180] hover:bg-[#4E342E] transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    All Books
                  </Link>
                </li>
                {isAuthenticated && (
                  <>
                    <li>
                      <Link
                        href="/my-library"
                        className="block text-white hover:text-[#FFD180] hover:bg-[#4E342E] transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Library
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <Link
                    href="/contact"
                    className="block text-white hover:text-[#FFD180] hover:bg-[#4E342E] transition-all duration-200 py-3 px-4 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile Action Buttons */}
            <div className="pt-4 border-t border-[#4E342E]/50 space-y-3">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 text-[#D7CCC8] px-4 py-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">Welcome, {user?.name}</span>
                  </div>
                  
                  {/* Upload Book Button */}
                  <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <button className="w-full flex items-center justify-center gap-2 bg-[#FFD180] hover:bg-[#f4b160] text-[#5D4037] font-semibold px-6 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm">
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </Link>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-[#A47148] hover:bg-[#8D5C35] text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Sign In Button */}
                  <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <button className="w-full bg-[#A47148] hover:bg-[#8D5C35] text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;