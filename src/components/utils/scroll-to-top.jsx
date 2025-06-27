"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Automatically scrolls window to the top whenever the route (pathname) changes.
// This prevents situations where navigating to a new page keeps the previous
// scroll position, which can make the new page appear blank or partially
// rendered until the user manually scrolls.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Using `instant` (or behaviour:"auto") avoids additional scrolling animation
    // that could conflict with page-level framer-motion animations.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
