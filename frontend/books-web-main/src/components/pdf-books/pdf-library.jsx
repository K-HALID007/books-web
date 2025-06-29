"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, FileText, User, Calendar, Tag, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { pdfBooksAPI } from '@/lib/api';

const PDFLibrary = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'personal', label: 'Personal Writing' },
    { value: 'public-domain', label: 'Public Domain' },
    { value: 'educational', label: 'Educational' },
    { value: 'self-published', label: 'Self-Published' },
    { value: 'research', label: 'Research' }
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pdfBooksAPI.getAllPDFBooks();
      setBooks(response);
    } catch (err) {
      console.error('Error fetching PDF books:', err);
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'personal': 'bg-blue-100 text-blue-800',
      'public-domain': 'bg-green-100 text-green-800',
      'educational': 'bg-purple-100 text-purple-800',
      'self-published': 'bg-orange-100 text-orange-800',
      'research': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        case 'oldest':
          return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        case 'downloads':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleDownload = async (book) => {
    try {
      // Increment download count first
      await pdfBooksAPI.incrementDownload(book._id);
      
      // Download the file
      const blob = await pdfBooksAPI.downloadPDFBook(book._id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = book.fileName || `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update local state
      setBooks(prev => prev.map(b => 
        b._id === book._id ? { ...b, downloads: (b.downloads || 0) + 1 } : b
      ));
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handlePreview = (book) => {
    // For now, show an alert. In a real implementation, you could:
    // 1. Open PDF in a modal with PDF viewer
    // 2. Open in new tab with PDF.js
    // 3. Use a PDF preview library
    alert(`Preview feature coming soon for: ${book.title}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A47148] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B4F3F]">Loading PDF library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Books</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBooks}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[#5D4037] mb-2">PDF Book Library</h1>
        <p className="text-[#6B4F3F] mb-2">Discover and download books shared by our community</p>
        <div className="bg-[#F0E6D6] border border-[#D7CCC8] rounded-lg p-3 text-sm text-[#5D4037]">
          <span className="font-semibold">✨ New Feature:</span> All downloaded PDFs now include your personal library poster as the first page!
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-6 shadow-md mb-8"
      >
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent appearance-none"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </motion.div>

      {/* Books Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book, index) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Book Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-8 h-8 text-[#A47148] flex-shrink-0" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(book.category)}`}>
                  {categories.find(c => c.value === book.category)?.label}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-[#5D4037] mb-2 line-clamp-2">
                {book.title}
              </h3>
              
              <p className="text-[#6B4F3F] text-sm mb-3">by {book.author}</p>
              
              {book.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {book.description}
                </p>
              )}

              {/* Book Meta */}
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>Uploaded by {book.uploaderName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(book.uploadedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{formatFileSize(book.fileSize)}</span>
                  <span>{book.downloads || 0} downloads</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(book)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleDownload(book)}
                  className="flex-1 bg-[#6D4C41] hover:bg-[#5D4037] text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  title="Download with your library poster as first page"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredBooks.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">No books found</h3>
          <p className="text-gray-400">
            {books.length === 0 
              ? "No books have been uploaded yet. Be the first to share a book!"
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PDFLibrary;