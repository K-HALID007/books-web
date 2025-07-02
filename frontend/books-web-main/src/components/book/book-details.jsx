"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Edit, Save, X, Calendar, User, Tag, ArrowLeft, Trash2, Download, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { booksAPI, pdfBooksAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const BookDetails = ({ bookId }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
  });

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", 
    "Fantasy", "Biography", "History", "Self-Help", "Poetry", 
    "Drama", "Adventure", "Horror", "Comedy", "Philosophy"
  ];

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Fetch both regular books and PDF books, then combine
        const [regularBooks, pdfBooks] = await Promise.all([
          booksAPI.getAllBooks().catch(() => []),
          pdfBooksAPI.getAllPDFBooks().catch(() => [])
        ]);

        const markedPDFBooks = pdfBooks.map(b => ({
          ...b,
          isPDF: true,
          coverImage: b.coverImage || b.cover,
  genre: b.category || b.genre
        }));

        const allBooks = [...regularBooks, ...markedPDFBooks];
        const foundBook = allBooks.find(b => b._id === bookId);
        
        if (foundBook) {
          setBook(foundBook);
          setEditForm({
            title: foundBook.title,
            author: foundBook.author,
            genre: foundBook.genre,
            description: foundBook.description || "",
          });
        } else {
          // Book not found, redirect to my-books
          router.push('/my-books');
        }
      } catch (error) {
        console.error("Error loading book:", error);
        router.push('/my-books');
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId, router]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      // Update book via API (you'll need to implement this endpoint)
      const updatedBook = await booksAPI.updateBook(bookId, editForm);
      setBook(updatedBook);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Error updating book. Please try again.");
    }
  };

  const handleDeleteBook = async () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await booksAPI.deleteBook(bookId);
        router.push('/my-books');
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Error deleting book. Please try again.");
      }
    }
  };

  // Build correct cover URL similar to list pages
  const getImageUrl = (bk) => {
    if (!bk.coverImage) return null;
    if (bk.coverImage.startsWith('data:')) return bk.coverImage;
    if (bk.coverImage.includes('/9j/') || bk.coverImage.includes('iVBORw0KGgo') || bk.coverImage.length > 100) {
      return `data:image/jpeg;base64,${bk.coverImage}`;
    }
    if (bk.coverImage.startsWith('http')) return bk.coverImage;
    if (bk.coverImage.startsWith('/uploads/')) return `http://localhost:5000${bk.coverImage}`;
    return `http://localhost:5000/uploads/covers/${bk.coverImage}`;
  };

  const openBlobInNewTab = (blob) => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke later (let it load first)
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  };

  const handleDownloadPDF = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show a message and redirect to sign-in page
      if (window.confirm('You need to sign in to download books. Would you like to sign in now?')) {
        router.push('/signin?message=Please sign in to download books');
      }
      return;
    }

    try {
      // increment download count first
      await pdfBooksAPI.incrementDownload(book._id);
      const blob = await pdfBooksAPI.downloadPDFBook(book._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        alert('Your session has expired. Please sign in again.');
        router.push('/signin?message=Session expired. Please sign in again.');
      } else {
        alert(error.message || 'Failed to download PDF');
      }
    }
  };

  const handleReadOnline = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show a message and redirect to sign-in page
      if (window.confirm('You need to sign in to read books online. Would you like to sign in now?')) {
        router.push('/signin?message=Please sign in to read books online');
      }
      return;
    }

    try {
      const blob = await pdfBooksAPI.downloadPDFBook(book._id);
      openBlobInNewTab(blob);
    } catch (error) {
      console.error('Error loading PDF:', error);
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        alert('Your session has expired. Please sign in again.');
        router.push('/signin?message=Session expired. Please sign in again.');
      } else {
        alert(error.message || 'Failed to open PDF');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const isOwner = book && user && book.user === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#6D4C41] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4037] font-medium">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] pt-20 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#5D4037] mb-3">Book Not Found</h2>
          <p className="text-[#6B4F3F] mb-6">
            The book you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/my-books">
            <button className="bg-[#6D4C41] hover:bg-[#5D4037] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200">
              Back to All Books
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE4] pt-20">
      {/* Header */}
      <div className="bg-[#F4EDE4] border-b border-[#E0D5C7] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/my-books">
              <button className="flex items-center gap-2 text-[#6D4C41] hover:text-[#5D4037] font-medium transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Back to All Books
              </button>
            </Link>
            
            {isOwner && (
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-[#6D4C41] hover:bg-[#5D4037] text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Book
                    </button>
                    <button
                      onClick={handleDeleteBook}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Details */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Book Cover */}
            <div className="md:w-1/3 lg:w-1/4">
              <div className="relative aspect-[3/4] bg-gray-100">
                {getImageUrl(book) ? (
                  <Image
                    src={getImageUrl(book)}
                    alt={book.title}
                    fill
                    className="object-contain"
                    unoptimized={getImageUrl(book).startsWith('data:')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D4C41] to-[#A47148]">
                    <BookOpen className="w-20 h-20 text-white opacity-50" />
                  </div>
                )}
              </div>
            </div>

            {/* Book Information */}
            <div className="md:w-2/3 lg:w-3/4 p-8">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Edit Title */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                      Book Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900"
                    />
                  </div>

                  {/* Edit Author */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={editForm.author}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900"
                    />
                  </div>

                  {/* Edit Genre */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                      Genre
                    </label>
                    <select
                      name="genre"
                      value={editForm.genre}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900"
                    >
                      <option value="">Select a genre</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Edit Description */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all resize-none text-gray-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Book Title */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#5D4037] leading-tight">
                    {book.title}
                  </h1>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-xl text-[#A47148] font-semibold">
                    <User className="w-5 h-5" />
                    by {book.author}
                  </div>

                  {/* Genre */}
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#6D4C41]" />
                    <span className="bg-[#F0E6D6] text-[#6D4C41] text-sm font-semibold px-4 py-2 rounded-full">
                      {book.genre || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Description */}
                  {book.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#5D4037] mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {book.description}
                      </p>
                    </div>
                  )}

                  {/* Download Button for PDF Books */}
                  {book.isPDF && (
                    <div className="pt-4 space-y-4">
                      {!isAuthenticated && (
                        <div className="bg-[#D7CCC8] border border-[#A47148]/30 rounded-lg p-4">
                          <p className="text-[#5D4037] text-sm">
                            <strong>Account required:</strong> Sign in to download and read books.
                          </p>
                        </div>
                      )}
                      <div className="flex gap-4 flex-wrap">
                        <button
                          onClick={handleDownloadPDF}
                          className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all duration-200 ${
                            isAuthenticated 
                              ? 'bg-[#6D4C41] hover:bg-[#5D4037] text-white' 
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          {isAuthenticated ? 'Download PDF' : 'Sign in to Download'}
                        </button>
                        <button
                          onClick={handleReadOnline}
                          className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all duration-200 ${
                            isAuthenticated 
                              ? 'bg-[#A47148] hover:bg-[#8a5d32] text-white' 
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          {isAuthenticated ? 'Read Online' : 'Sign in to Read'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <Calendar className="w-4 h-4" />
                    Added on {formatDate(book.createdAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;