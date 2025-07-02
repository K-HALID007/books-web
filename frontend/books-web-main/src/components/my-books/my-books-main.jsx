"use client";
import { useState, useEffect } from "react";
import { BookOpen, Plus, ArrowLeft, Trash2, Calendar, Filter, Grid, List } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { booksAPI, pdfBooksAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const MyBooksMain = () => {
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [viewMode, setViewMode] = useState(() => {
    // Get saved view mode from localStorage, default to grid
    if (typeof window !== 'undefined') {
      return localStorage.getItem('booksViewMode') || 'grid';
    }
    return 'grid';
  });

  // Helper function to get the correct image URL
  const getImageUrl = (book) => {
    if (!book.coverImage) return null;
    
    // If it's a base64 data URL, return as is
    if (book.coverImage.startsWith('data:')) {
      return book.coverImage;
    }
    
    // If it contains base64 data but doesn't start with data:, it's likely a base64 string
    // that needs the data URL prefix
    if (book.coverImage.includes('/9j/') || book.coverImage.includes('iVBORw0KGgo') || book.coverImage.length > 100) {
      return `data:image/jpeg;base64,${book.coverImage}`;
    }
    
    // If it's already a full URL, return as is
    if (book.coverImage.startsWith('http')) {
      return book.coverImage;
    }
    
    // If it's a relative path, construct the full URL
    if (book.coverImage.startsWith('/uploads/')) {
      return `http://localhost:5000${book.coverImage}`;
    }
    
    // If it's just a filename, construct the full path
    return `http://localhost:5000/uploads/covers/${book.coverImage}`;
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch both regular books and PDF books
        const [regularBooks, pdfBooks] = await Promise.all([
          booksAPI.getAllBooks().catch(() => []),
          pdfBooksAPI.getAllPDFBooks().catch(() => [])
        ]);

        console.log('Fetched regular books:', regularBooks);
        console.log('Fetched PDF books:', pdfBooks);

        // Mark PDF books with a flag and combine with regular books
        const markedPDFBooks = pdfBooks.map(book => ({
          ...book,
          isPDF: true,
          // Ensure consistent field names
          coverImage: book.coverImage || book.cover,
          genre: book.category || book.genre
        }));

        // Combine all books
        const allBooks = [...regularBooks, ...markedPDFBooks];
        
        // Sort by creation date (newest first)
        allBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('Combined books:', allBooks);
        setBooks(allBooks);
      } catch (error) {
        console.error("Error loading books:", error);
        // Show empty state on error
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Handle view mode change and save to localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('booksViewMode', mode);
    }
  };

  const handleDeleteBook = async (bookId, isPDF = false) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        // Use appropriate API based on book type
        if (isPDF) {
          await pdfBooksAPI.deletePDFBook(bookId);
        } else {
          await booksAPI.deleteBook(bookId);
        }
        const updatedBooks = books.filter(book => book._id !== bookId);
        setBooks(updatedBooks);
      } catch (error) {
        console.error("Error deleting book:", error);
        alert(error.message || "Error deleting book. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Get unique genres for filter, filtering out undefined/null values
  const genres = ["All", ...new Set(books.map(book => book.genre).filter(genre => genre && genre.trim() !== ''))];

  // Filter books by selected genre
  const filteredBooks = selectedGenre === "All" 
    ? books 
    : books.filter(book => book.genre === selectedGenre);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#6D4C41] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4037] font-medium">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE4] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Welcome Banner for non-authenticated users */}
        {!isAuthenticated && books.length > 0 && (
          <div className="bg-gradient-to-r from-[#6D4C41] to-[#A47148] rounded-xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Welcome to BookVault</h3>
                <p className="text-white/90 mb-3">
                  Access our curated collection of digital books and publications. Sign in to download premium content and share your own collection.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/signin">
                    <button className="bg-white text-[#6D4C41] font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="bg-white/20 text-white font-semibold px-6 py-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30">
                      Create Account
                    </button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <BookOpen className="w-16 h-16 text-white/30" />
              </div>
            </div>
          </div>
        )}

        {books.length === 0 ? (
          // Enhanced Empty State
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <BookOpen className="w-20 h-20 text-[#D7CCC8] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-[#5D4037] mb-4">No Books Yet</h2>
              <p className="text-[#6B4F3F] mb-8 leading-relaxed">
                Be the first to share a book with our community! Upload your favorite reads and help others discover great books.
              </p>
              {isAuthenticated ? (
                <Link href="/upload">
                  <button className="bg-[#6D4C41] hover:bg-[#5D4037] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl">
                    <Plus className="w-5 h-5" />
                    Upload First Book
                  </button>
                </Link>
              ) : (
                <Link href="/signin">
                  <button className="bg-[#6D4C41] hover:bg-[#5D4037] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl">
                    <Plus className="w-5 h-5" />
                    Sign In to Upload
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Filters and View Toggle */}
            <div className="mb-6">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-[#6D4C41]" />
                  <h3 className="text-lg font-semibold text-[#5D4037]">Filters & View</h3>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-md">
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-[#6D4C41] text-white shadow-sm"
                        : "text-[#6D4C41] hover:bg-[#F0E6D6]"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-[#6D4C41] text-white shadow-sm"
                        : "text-[#6D4C41] hover:bg-[#F0E6D6]"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grid
                  </button>
                </div>
              </div>

              {/* Genre Filter */}
              {genres.length > 2 && (
                <div className="flex flex-wrap gap-3">
                  {genres.map((genre, index) => (
                    <button
                      key={`genre-${index}-${genre}`}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedGenre === genre
                          ? "bg-[#6D4C41] text-white shadow-lg"
                          : "bg-white text-[#6D4C41] hover:bg-[#F0E6D6] border-2 border-[#6D4C41] hover:shadow-md"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Books Display */}
            {filteredBooks.length > 0 ? (
              viewMode === "list" ? (
                // List View - Horizontal Cards
                <div className="space-y-4">
                  {filteredBooks.map((book) => (
                    <Link
                      key={book._id}
                      href={`/book/${book._id}`}
                      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Book Cover */}
                        <div className="relative w-full md:w-48 h-64 md:h-48 bg-gray-100 flex-shrink-0">
                          {getImageUrl(book) ? (
                            <Image
                              src={getImageUrl(book)}
                              alt={book.title}
                              fill
                              className="object-contain group-hover:scale-105 transition-transform duration-300"
                              unoptimized={book.coverImage?.startsWith('data:')}
                              onError={(e) => {
                                console.error('Error loading image for book:', book.title, e);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D4C41] to-[#A47148]"
                            style={{ display: getImageUrl(book) ? 'none' : 'flex' }}
                          >
                            <BookOpen className="w-16 h-16 text-white opacity-50" />
                          </div>
                          
                          {/* Delete Button - Only show for book owners */}
                          {isAuthenticated && user && book.user === user.id && (
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteBook(book._id, book.isPDF);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-all duration-200"
                                title="Delete book"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col h-full">
                            {/* Title and Author */}
                            <div className="mb-4">
                              <h3 className="font-bold text-[#5D4037] text-2xl mb-2 line-clamp-2 leading-tight">
                                {book.title}
                              </h3>
                              <p className="text-[#A47148] font-semibold text-lg">
                                by {book.author}
                              </p>
                            </div>
                            
                            {/* Genre and Date Row */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <span className="bg-[#F0E6D6] text-[#6D4C41] text-sm font-semibold px-4 py-2 rounded-full">
                                {book.genre}
                              </span>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                Added {formatDate(book.createdAt)}
                              </div>
                            </div>

                            {/* Description */}
                            {book.description && (
                              <div className="flex-1">
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                  {book.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                // Grid View - Compact Cards
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {filteredBooks.map((book) => (
                    <Link
                      key={book._id}
                      href={`/book/${book._id}`}
                      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      {/* Book Cover */}
                      <div className="relative aspect-[3/4] bg-gray-100">
                        {getImageUrl(book) ? (
                          <Image
                            src={getImageUrl(book)}
                            alt={book.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                            unoptimized={book.coverImage?.startsWith('data:')}
                            onError={(e) => {
                              console.error('Error loading image for book:', book.title, e);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D4C41] to-[#A47148]"
                          style={{ display: getImageUrl(book) ? 'none' : 'flex' }}
                        >
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                        
                        {/* Delete Button - Only show for book owners */}
                        {isAuthenticated && user && book.user === user.id && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteBook(book._id, book.isPDF);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-all duration-200"
                              title="Delete book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Book Info - Compact */}
                      <div className="p-3">
                        <h3 className="font-bold text-[#5D4037] text-sm mb-1 line-clamp-2 leading-tight">
                          {book.title}
                        </h3>
                        <p className="text-[#A47148] font-medium mb-2 text-xs">
                          by {book.author}
                        </p>
                        
                        {/* Genre Badge */}
                        <div className="flex items-center justify-between">
                          <span className="bg-[#F0E6D6] text-[#6D4C41] text-xs font-medium px-2 py-1 rounded-full">
                            {book.genre}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              // No books found for selected genre
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-[#5D4037] mb-3">
                    No {selectedGenre} books found
                  </h3>
                  <p className="text-[#6B4F3F] mb-6">
                    Try selecting a different genre or add a new book to your collection.
                  </p>
                  <button
                    onClick={() => setSelectedGenre("All")}
                    className="text-[#6D4C41] hover:text-[#5D4037] font-semibold underline"
                  >
                    Show all books
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBooksMain;