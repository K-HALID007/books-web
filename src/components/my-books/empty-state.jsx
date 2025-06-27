import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

const EmptyState = () => {
  return (
    <div className="text-center py-16">
      <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-[#5D4037] mb-4">No Books Yet</h2>
      <p className="text-[#6B4F3F] mb-8 max-w-md mx-auto">
        Start building your personal library by uploading your first book. 
        Share your favorite reads and keep track of your collection.
      </p>
      <Link href="/upload">
        <button className="bg-[#6D4C41] hover:bg-[#5D4037] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto">
          <Plus className="w-5 h-5" />
          Upload Your First Book
        </button>
      </Link>
    </div>
  );
};

export default EmptyState;