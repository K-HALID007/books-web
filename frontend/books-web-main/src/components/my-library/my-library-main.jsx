"use client";
import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Calendar, Filter, Edit, FileText, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { booksAPI, pdfBooksAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Remove /api from base URL since image paths already include /uploads
  const serverUrl = baseUrl.replace('/api', '');
  return imagePath.startsWith('http') ? imagePath : `${serverUrl}${imagePath}`;
};

const MyLibraryMain = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch only PDF books uploaded by the user
        const userPDFBooks = await pdfBooksAPI.getUserPDFBooks().catch(() => []);

        console.log('Fetched user PDF books:', userPDFBooks);

        // Mark all books as PDF and ensure consistent field names
        const processedBooks = userPDFBooks.map(book => ({
          ...book,
          isPDF: true,
          // Ensure consistent field names
          coverImage: book.coverImage || book.cover,
          createdAt: book.uploadedAt || book.createdAt,
          genre: book.genre || book.category || 'Non-Fiction' // Genre first, then category as fallback
        }));

        // Sort by upload date (newest first)
        processedBooks.sort((a, b) => new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt));

        console.log('Processed PDF books:', processedBooks);
        setBooks(processedBooks);
      } catch (error) {
        console.error("Error loading books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this PDF book?")) {
      try {
        // All books are PDFs now
        await pdfBooksAPI.deletePDFBook(bookId);
        const updatedBooks = books.filter(book => book._id !== bookId);
        setBooks(updatedBooks);
      } catch (error) {
        console.error("Error deleting book:", error);
        alert(error.message || "Error deleting PDF book. Please try again.");
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
          <p className="text-[#5D4037] font-medium">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE4] pt-20">
      {/* Header Section */}
      <div className="bg-[#F4EDE4] border-b border-[#E0D5C7] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#5D4037] flex items-center justify-center gap-4 mb-4">
            <BookOpen className="w-12 h-12 lg:w-16 lg:h-16 text-[#A47148]" />
            My Collection
          </h1>
          <p className="text-[#6B4F3F] text-lg sm:text-xl max-w-2xl mx-auto">
            {books.length === 0 
              ? "Your personal PDF collection awaits" 
              : `${books.length} PDF ${books.length === 1 ? 'book' : 'books'} in your personal collection`
            }
          </p>
          {books.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-[#6D4C41] text-white px-4 py-2 rounded-full">
                <span className="font-semibold">{genres.length - 1}</span> genres
              </div>
              <div className="bg-[#A47148] text-white px-4 py-2 rounded-full">
                Latest: <span className="font-semibold">
                  {books[0]?.title || 'None'}
                </span>
              </div>
            </div>
          )}
          
                  </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {books.length === 0 ? (
          // Enhanced Empty State
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <BookOpen className="w-20 h-20 text-[#D7CCC8] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-[#5D4037] mb-4">Start Your Collection</h2>
              <p className="text-[#6B4F3F] mb-8 leading-relaxed">
                Begin building your personal PDF collection. Upload your PDF books and they'll automatically include your library poster as the first page.
              </p>
              <Link href="/upload">
                <button className="bg-[#6D4C41] hover:bg-[#5D4037] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl">
                  <Plus className="w-5 h-5" />
                  Upload Your First PDF
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Genre Filter */}
            {genres.length > 2 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="w-5 h-5 text-[#6D4C41]" />
                  <h3 className="text-lg font-semibold text-[#5D4037]">Filter by Genre</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {genres.map((genre, index) => (
                    <button
                      key={`library-genre-${index}-${genre}`}
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
              </div>
            )}

            {/* Books List - Horizontal Cards */}
            {filteredBooks.length > 0 ? (
              <div className="space-y-6">
                {filteredBooks.map((book) => (
                  <Link
                    key={book._id}
                    href={`/book/${book._id}`}
                    className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Book Cover */}
                      <div className="relative w-full md:w-48 h-64 md:h-48 bg-gray-100 flex-shrink-0">
                        {book.coverImage ? (
                          <Image
                            src={getImageUrl(book.coverImage)}
                            alt={book.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error('Error loading image for book:', book.title, 'URL:', getImageUrl(book.coverImage));
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D4C41] to-[#A47148]"
                          style={{ display: book.coverImage ? 'none' : 'flex' }}
                        >
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                        
                        {/* Action Buttons - Always show for user's own books */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/book/${book._id}/edit`);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-full shadow-lg transition-all duration-200"
                            title="Edit book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteBook(book._id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-all duration-200"
                            title="Delete book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Book Type Indicator */}
                        {book.isPDF && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-[#A47148] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              PDF
                            </div>
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

export default MyLibraryMain;