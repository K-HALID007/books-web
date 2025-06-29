"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // 300ms delay before closing
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dropdown Trigger */}
      <div className="flex items-center gap-2 text-[#FFD180] hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[#5D4037] cursor-pointer">
        <User className="w-4 h-4" />
        <span className="text-xs lg:text-sm font-medium hidden sm:inline">
          {user?.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-[#5D4037] rounded-xl shadow-2xl border border-[#4E342E] py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[#4E342E]">
            <p className="text-sm font-semibold text-[#FFD180]">{user?.name}</p>
            <p className="text-xs text-[#D7CCC8] truncate">{user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm text-[#FBE9E7] hover:bg-[#4E342E] hover:text-[#FFD180] transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              My Profile
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#FBE9E7] hover:bg-[#A47148] hover:text-white transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;