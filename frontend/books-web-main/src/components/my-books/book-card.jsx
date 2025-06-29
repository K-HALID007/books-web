import { BookOpen, Trash2, Calendar } from "lucide-react";
import Image from "next/image";

const BookCard = ({ book, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      onDelete(book.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Book Cover */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D4C41] to-[#A47148]">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200"
            title="Delete book"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-bold text-[#5D4037] text-lg mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-[#A47148] font-medium mb-2">
          by {book.author}
        </p>
        
        {/* Genre Badge */}
        <span className="inline-block bg-[#F0E6D6] text-[#6D4C41] text-xs font-medium px-2 py-1 rounded-full mb-3">
          {book.genre}
        </span>

        {/* Description */}
        {book.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {book.description}
          </p>
        )}

        {/* Upload Date */}
        <div className="flex items-center text-xs text-gray-500 mt-auto">
          <Calendar className="w-3 h-3 mr-1" />
          Added {formatDate(book.uploadDate)}
        </div>
      </div>
    </div>
  );
};

export default BookCard;