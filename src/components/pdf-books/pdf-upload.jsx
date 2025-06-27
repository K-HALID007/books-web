"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertTriangle, CheckCircle, X, Image, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { pdfBooksAPI } from '@/lib/api';

const PDFUpload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    description: '',
    category: 'personal',
    isPublicDomain: false,
    uploadReason: '',
    genre: '',
    publishedYear: '',
    language: 'English',
    pageCount: ''
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'personal', label: 'Personal Writing' },
    { value: 'public-domain', label: 'Public Domain (Pre-1923)' },
    { value: 'educational', label: 'Educational Material' },
    { value: 'self-published', label: 'Self-Published Work' },
    { value: 'research', label: 'Research Paper' }
  ];

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
    'Biography', 'History', 'Self-Help', 'Business', 'Technology', 'Health',
    'Travel', 'Cooking', 'Art', 'Poetry', 'Drama', 'Children', 'Young Adult',
    'Academic', 'Reference', 'Other'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file only');
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleCoverImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if it's an image
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file for the cover');
        return;
      }
      // Check file size (5MB limit for images)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Cover image size must be less than 5MB');
        return;
      }
      
      setCoverImage(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
      setError('');
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleMetadataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateUpload = () => {
    if (!file) {
      setError('Please select a PDF file');
      return false;
    }
    if (!metadata.title || !metadata.author) {
      setError('Title and author are required');
      return false;
    }
    if (metadata.category === 'public-domain' && !metadata.isPublicDomain) {
      setError('Please confirm this is a public domain work');
      return false;
    }
    if (!metadata.uploadReason) {
      setError('Please specify the reason for uploading');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateUpload()) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      formData.append('title', metadata.title);
      formData.append('author', metadata.author);
      formData.append('description', metadata.description);
      formData.append('category', metadata.category);
      formData.append('genre', metadata.genre);
      formData.append('publishedYear', metadata.publishedYear);
      formData.append('language', metadata.language);
      formData.append('pageCount', metadata.pageCount);
      formData.append('isPublicDomain', metadata.isPublicDomain);
      formData.append('uploadReason', metadata.uploadReason);
      formData.append('uploadedBy', user.id);
      formData.append('uploaderName', user.name);

      const response = await pdfBooksAPI.uploadPDFBook(formData);
      
      setSuccess(true);
      setFile(null);
      setCoverImage(null);
      setCoverImagePreview(null);
      setMetadata({
        title: '',
        author: '',
        description: '',
        category: 'personal',
        isPublicDomain: false,
        uploadReason: '',
        genre: '',
        publishedYear: '',
        language: 'English',
        pageCount: ''
      });
      
      // Reset form
      document.getElementById('pdf-upload-form').reset();
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCoverImage(null);
    setCoverImagePreview(null);
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Upload Successful!</h3>
        <p className="text-green-700 mb-4">Your PDF has been uploaded successfully and is now available in the library.</p>
        <button
          onClick={resetForm}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Upload Another Book
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Legal Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Important Legal Notice</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Only upload books you own the rights to or that are in the public domain</li>
              <li>• Uploading copyrighted material without permission is illegal</li>
              <li>• We reserve the right to remove any content that violates copyright</li>
              <li>• By uploading, you confirm you have the legal right to share this content</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <form id="pdf-upload-form" onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* PDF Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6"
          >
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <label htmlFor="pdf-file" className="cursor-pointer">
                <span className="text-lg font-medium text-gray-700">
                  {file ? file.name : 'Choose PDF file'}
                </span>
                <input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">Maximum file size: 50MB</p>
              {file && (
                <div className="mt-3 text-sm text-green-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  PDF selected
                </div>
              )}
            </div>
          </motion.div>

          {/* Cover Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6"
          >
            {coverImagePreview ? (
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-32 h-40 object-cover rounded-lg mx-auto mb-4"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-green-600">Cover image selected</p>
              </div>
            ) : (
              <div className="text-center">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label htmlFor="cover-image" className="cursor-pointer">
                  <span className="text-lg font-medium text-gray-700">
                    Choose Cover Image
                  </span>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Optional • JPG, PNG • Max 5MB
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Metadata Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-md space-y-4"
        >
          <h3 className="text-xl font-semibold text-[#5D4037] mb-4">Book Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={metadata.author}
                onChange={handleMetadataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={metadata.genre}
                onChange={handleMetadataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
              >
                <option value="">Select Genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                name="language"
                value={metadata.language}
                onChange={handleMetadataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
              >
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Year
              </label>
              <input
                type="number"
                name="publishedYear"
                value={metadata.publishedYear}
                onChange={handleMetadataChange}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
                placeholder="e.g., 2023"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Count
              </label>
              <input
                type="number"
                name="pageCount"
                value={metadata.pageCount}
                onChange={handleMetadataChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
                placeholder="Number of pages"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={metadata.category}
                onChange={handleMetadataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
              placeholder="Brief description of the book..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Upload *
            </label>
            <textarea
              name="uploadReason"
              value={metadata.uploadReason}
              onChange={handleMetadataChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47148] focus:border-transparent"
              placeholder="Why are you uploading this book? (e.g., personal work, educational use, public domain, etc.)"
              required
            />
          </div>

          {metadata.category === 'public-domain' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public-domain-confirm"
                name="isPublicDomain"
                checked={metadata.isPublicDomain}
                onChange={handleMetadataChange}
                className="w-4 h-4 text-[#A47148] focus:ring-[#A47148] border-gray-300 rounded"
              />
              <label htmlFor="public-domain-confirm" className="text-sm text-gray-700">
                I confirm this work is in the public domain (published before 1923 or explicitly released)
              </label>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-[#6D4C41] hover:bg-[#5D4037] disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Book
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default PDFUpload;