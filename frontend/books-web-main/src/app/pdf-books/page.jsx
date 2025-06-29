"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PDFBooksRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to All Books page since PDF books are now shown there
    router.replace('/my-books');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4EDE4] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#6D4C41] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#5D4037] font-medium">Redirecting to All Books...</p>
      </div>
    </div>
  );
};

export default PDFBooksRedirect;