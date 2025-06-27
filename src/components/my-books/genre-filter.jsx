const GenreFilter = ({ genres, selectedGenre, onGenreChange }) => {
  if (genres.length <= 2) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedGenre === genre
                ? "bg-[#6D4C41] text-white"
                : "bg-white text-[#6D4C41] hover:bg-[#F0E6D6] border border-[#6D4C41]"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;