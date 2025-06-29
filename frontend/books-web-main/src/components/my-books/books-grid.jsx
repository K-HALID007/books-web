import BookCard from "./book-card";

const BooksGrid = ({ books, onDeleteBook }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onDelete={onDeleteBook}
        />
      ))}
    </div>
  );
};

export default BooksGrid;