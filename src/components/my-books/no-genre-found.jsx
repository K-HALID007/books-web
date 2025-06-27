import { BookOpen } from "lucide-react";

const NoGenreFound = ({ selectedGenre, onShowAll }) => {
  return (
    <div className="text-center py-16">
      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-[#5D4037] mb-2">
        No {selectedGenre} books found
      </h3>
      <p className="text-[#6B4F3F] mb-4">
        Try selecting a different genre or add a new book.
      </p>
      <button
        onClick={onShowAll}
        className="text-[#6D4C41] hover:text-[#5D4037] font-medium"
      >
        Show all books
      </button>
    </div>
  );
};

export default NoGenreFound;