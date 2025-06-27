import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

const UploadHeader = () => {
  return (
    <div className="bg-[#F4EDE4] border-b border-[#E0D5C7] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#5D4037] flex items-center justify-center gap-4 mb-4">
          <Upload className="w-12 h-12 text-[#A47148]" />
          Upload Your Book
        </h1>
        <p className="text-[#6B4F3F] text-lg max-w-2xl mx-auto">
          Add a new book to your personal collection and share your favorite reads with the BookVault community
        </p>
      </div>
    </div>
  );
};

export default UploadHeader;