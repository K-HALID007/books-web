"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, X } from "lucide-react";
import Link from "next/link";
import { pdfBooksAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const UploadForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    pdfFile: null,
    coverImage: null,
    category: 'personal',
    language: 'English',
    publishedYear: '',
    pageCount: '',
    uploadReason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", 
    "Fantasy", "Biography", "History", "Self-Help", "Poetry", 
    "Drama", "Adventure", "Horror", "Comedy", "Philosophy"
  ];

  const categories = [
    { value: 'personal', label: 'Personal Writing' },
    { value: 'public-domain', label: 'Public Domain (Pre-1923)' },
    { value: 'educational', label: 'Educational Material' },
    { value: 'self-published', label: 'Self-Published Work' },
    { value: 'research', label: 'Research Paper' }
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const handlePDFChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert('PDF file size must be less than 50MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        pdfFile: file
      }));
    }
  };

  const removePDFFile = () => {
    setFormData(prev => ({
      ...prev,
      pdfFile: null
    }));
  };

  // Handle cover image selection
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select an image file (jpg, jpeg, png, webp).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Cover image size must be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({
      ...prev,
      coverImage: null
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.pdfFile) {
        alert('Please select a PDF file');
        setIsSubmitting(false);
        return;
      }

      if (!formData.uploadReason) {
        alert('Please specify the reason for uploading');
        setIsSubmitting(false);
        return;
      }

      // Create form data for PDF upload using existing API
      const pdfFormData = new FormData();
      pdfFormData.append('pdf', formData.pdfFile);
      pdfFormData.append('title', formData.title);
      pdfFormData.append('author', formData.author);
      pdfFormData.append('description', formData.description);
      pdfFormData.append('category', formData.category);
      pdfFormData.append('genre', formData.genre);
      pdfFormData.append('publishedYear', formData.publishedYear);
      pdfFormData.append('language', formData.language);
      pdfFormData.append('pageCount', formData.pageCount);
      pdfFormData.append('uploadReason', formData.uploadReason);
      pdfFormData.append('uploadedBy', user.id);
      pdfFormData.append('uploaderName', user.name);
      if (formData.coverImage) {
        pdfFormData.append('coverImage', formData.coverImage);
      }

      const response = await pdfBooksAPI.uploadPDFBook(pdfFormData);
      
      alert("PDF book uploaded successfully! You can view it in All Books section.");
      
      // Reset form
      setFormData({
        title: "",
        author: "",
        genre: "",
        description: "",
        pdfFile: null,
        coverImage: null,
        category: 'personal',
        language: 'English',
        publishedYear: '',
        pageCount: '',
        uploadReason: ''
      });

      router.push('/my-books');
    } catch (error) {
      console.error("Error uploading PDF book:", error);
      alert(error.message || "Error uploading PDF book. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-[#A47148] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#5D4037] mb-2">Upload PDF Book</h2>
          <p className="text-gray-600">Share your PDF books with the community</p>
          <p className="text-sm text-[#A47148] mt-2">📖 You can upload a custom cover image, otherwise the first page of your PDF will be used</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDF Upload Section */}
          <div className="text-center">
            <div className="mx-auto w-64 h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative">
              {formData.pdfFile ? (
                <div className="text-center">
                  <div className="relative">
                    <FileText className="w-20 h-20 text-green-600 mx-auto mb-4" />
                    <button
                      type="button"
                      onClick={removePDFFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-lg text-green-600 font-medium mb-2">{formData.pdfFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(formData.pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-[#A47148] mt-2">
                    ✓ Cover will be generated from first page
                  </p>
                </div>
              ) : (
                <>
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-700 font-medium mb-2">Choose PDF File</p>
                  <p className="text-sm text-gray-500 mb-2">Click or drag to upload</p>
                  <p className="text-xs text-[#A47148]">
                    📄 First page becomes cover automatically
                  </p>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <span className="text-red-500">Required • Max 50MB</span><br/>
              Supported format: PDF only
            </p>
          </div>

          {/* Cover Image Upload Section (Optional) */}
          <div className="text-center">
            <div className="mx-auto w-48 md:w-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative">
              {formData.coverImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="Cover preview"
                    className="object-contain w-full max-h-96 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-700 font-medium mb-1">Choose Cover Image</p>
                  <p className="text-xs text-gray-500">Click or drag to upload</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Optional • Max 5MB • Formats: JPG, PNG, WEBP
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Book Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-[#5D4037] mb-2">
                Book Title *
              </label> 
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                placeholder="Enter book title"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-semibold text-[#5D4037] mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                placeholder="Enter author name"
              />
            </div>
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-semibold text-[#5D4037] mb-2">
              Genre *
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              required
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

          {/* Additional PDF fields */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-[#5D4037] mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-semibold text-[#5D4037] mb-2">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900"
              >
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="publishedYear" className="block text-sm font-semibold text-[#5D4037] mb-2">
                Published Year
              </label>
              <input
                type="number"
                id="publishedYear"
                name="publishedYear"
                value={formData.publishedYear}
                onChange={handleInputChange}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900"
                placeholder="e.g., 2023"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pageCount" className="block text-sm font-semibold text-[#5D4037] mb-2">
                Page Count
              </label>
              <input
                type="number"
                id="pageCount"
                name="pageCount"
                value={formData.pageCount}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900"
                placeholder="Number of pages"
              />
            </div>
          </div>

          <div>
            <label htmlFor="uploadReason" className="block text-sm font-semibold text-[#5D4037] mb-2">
              Reason for Upload *
            </label>
            <textarea
              id="uploadReason"
              name="uploadReason"
              value={formData.uploadReason}
              onChange={handleInputChange}
              rows={3}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
              placeholder="Why are you uploading this PDF? (e.g., personal work, educational use, public domain, etc.)"
            />
          </div>
            
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#5D4037] mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
              placeholder="Enter book description (optional)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={
                isSubmitting || 
                !formData.title || 
                !formData.author || 
                !formData.genre ||
                !formData.pdfFile ||
                !formData.uploadReason
              }
              className="flex-1 bg-[#6D4C41] hover:bg-[#5D4037] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Upload PDF Book
                </>
              )}
            </button>
            <Link
              href="/"
              className="px-6 py-3 border-2 border-[#6D4C41] text-[#6D4C41] hover:bg-[#6D4C41] hover:text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;