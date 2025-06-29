import { BookOpen, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

const BooksHeader = ({ booksCount }) => {
  return (
    <div className="bg-[#6D4C41] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#FFD180] hover:text-white transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#FBE9E7] flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#FFD180]" />
              My Books
            </h1>
            <p className="text-[#D7CCC8] mt-2">
              {booksCount} {booksCount === 1 ? 'book' : 'books'} in your collection
            </p>
          </div>
          <Link href="/upload">
            <button className="bg-[#FFD180] hover:bg-[#f4b160] text-[#5D4037] font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Book
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BooksHeader;