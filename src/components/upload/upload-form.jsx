"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, X, Loader, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { pdfBooksAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use a stable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const UploadForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    pdfFile: null,
    coverImage: null,

    extractedMetadata: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState(null); // 'success', 'error', null

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

  
  // Function to extract first page of PDF as cover image
  const extractFirstPageAsCover = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const scale = 2; // Higher scale for better quality
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to base64 image
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error extracting first page as cover:', error);
      return null;
    }
  };

  // Function to extract metadata from PDF
  const extractPDFMetadata = async (file) => {
    setIsExtracting(true);
    setExtractionStatus(null);
    
    try {
      // Extract first page as cover image
      const coverImage = await extractFirstPageAsCover(file);
      
      // Create FormData for metadata extraction
      const extractFormData = new FormData();
      extractFormData.append('pdf', file);
      
      // Call API to extract metadata
      const response = await fetch('/api/extract-pdf-metadata', {
        method: 'POST',
        body: extractFormData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract metadata');
      }
      
      const metadata = await response.json();
      
      // Add the extracted first page cover image
      metadata.coverImage = coverImage;
      
      setFormData(prev => ({
        ...prev,
        extractedMetadata: metadata
      }));
      
      setExtractionStatus('success');
    } catch (error) {
      console.error('Error extracting metadata:', error);
      setExtractionStatus('error');
      
      // Fallback: use filename as title
      const title = file.name.replace('.pdf', '');
      const author = 'Unknown Author';
      
      const fallbackMetadata = {
        title: title,
        author: author,
        genre: 'Unknown',
        description: '',
        publishedYear: '',
        pageCount: '',
        language: 'English',
        coverImage: null // No cover in fallback case
      };
      
      setFormData(prev => ({
        ...prev,
        extractedMetadata: fallbackMetadata
      }));
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePDFChange = async (e) => {
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
        pdfFile: file,
        extractedMetadata: null
      }));
      
      // Automatically extract metadata
      await extractPDFMetadata(file);
    }
  };

  const removePDFFile = () => {
    setFormData(prev => ({
      ...prev,
      pdfFile: null,
      extractedMetadata: null
    }));
    setExtractionStatus(null);
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

      
      // Use extracted metadata for upload
      const metadata = formData.extractedMetadata;
      
      // Create form data for PDF upload using existing API
      const pdfFormData = new FormData();
      pdfFormData.append('pdf', formData.pdfFile);
      pdfFormData.append('title', metadata.title);
      pdfFormData.append('author', metadata.author);
      pdfFormData.append('description', metadata.description);
      pdfFormData.append('category', metadata.category);
      pdfFormData.append('genre', metadata.genre);
      pdfFormData.append('publishedYear', metadata.publishedYear);
      pdfFormData.append('language', metadata.language);
      pdfFormData.append('pageCount', metadata.pageCount);
      pdfFormData.append('uploadReason', 'Auto-uploaded via smart PDF system');
      pdfFormData.append('uploadedBy', user.id);
      pdfFormData.append('uploaderName', user.name);
      
      // Use custom cover if uploaded, otherwise use extracted cover
      if (formData.coverImage) {
        pdfFormData.append('coverImage', formData.coverImage);
      } else if (metadata.coverImage) {
        // Convert base64 to blob for upload
        const response = await fetch(metadata.coverImage);
        const blob = await response.blob();
        pdfFormData.append('coverImage', blob, 'auto-generated-cover.jpg');
      }

      const response = await pdfBooksAPI.uploadPDFBook(pdfFormData);
      
      alert("PDF book uploaded successfully! You can view it in All Books section.");
      
      // Reset form
      setFormData({
        pdfFile: null,
        coverImage: null,
        extractedMetadata: null
      });
      setExtractionStatus(null);

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
          <h2 className="text-2xl font-bold text-[#5D4037] mb-2">Upload PDF Document</h2>
          <p className="text-gray-600">Upload your PDF file and we will automatically extract all relevant information.</p>
          <p className="text-sm text-[#A47148] mt-2">Automated metadata extraction • Cover generation • Content categorization • Description creation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Sections */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* PDF Upload Section */}
            <div className="text-center md:flex-1">
            <div className="mx-auto w-64 h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative">
              {formData.pdfFile ? (
                <div className="text-center">
                  <div className="relative">
                    {isExtracting ? (
                      <Loader className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-spin" />
                    ) : extractionStatus === 'success' ? (
                      <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
                    ) : extractionStatus === 'error' ? (
                      <AlertCircle className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                    ) : (
                      <FileText className="w-20 h-20 text-green-600 mx-auto mb-4" />
                    )}
                    <button
                      type="button"
                      onClick={removePDFFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-lg text-green-600 font-medium mb-2">{formData.pdfFile.name}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    {(formData.pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {isExtracting && (
                    <p className="text-xs text-blue-600 mt-2">
                      Processing document and extracting information...
                    </p>
                  )}
                  {extractionStatus === 'success' && (
                    <p className="text-xs text-green-600 mt-2">
                      Document processed successfully
                    </p>
                  )}
                  {extractionStatus === 'error' && (
                    <p className="text-xs text-orange-600 mt-2">
                      Using filename for basic information
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-700 font-medium mb-2">Select PDF File</p>
                  <p className="text-sm text-gray-500 mb-2">Click to browse or drag file here</p>
                  <p className="text-xs text-[#A47148]">
                    Automatic extraction of title, author, genre and metadata
                  </p>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isExtracting}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <span className="text-red-500">Required • Max 50MB</span><br/>
              Supported format: PDF only
            </p>
          </div>

          {/* Cover Image Section */}
            <div className="text-center md:flex-1">
            <div className="mx-auto w-48 md:w-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative min-h-[300px]">
              {formData.coverImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="Custom cover preview"
                    className="object-contain w-full max-h-96 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Custom Cover
                  </div>
                </div>
              ) : formData.extractedMetadata?.coverImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={formData.extractedMetadata.coverImage}
                    alt="Auto-generated cover"
                    className="object-contain w-full max-h-96 rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    First Page
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Click to upload custom
                  </div>
                </div>
              ) : (
                <>
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    {formData.pdfFile ? 'Generating cover...' : 'Cover Image'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.pdfFile ? 'Extracting first page as cover image' : 'First page will be used as cover image'}
                  </p>
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
              {formData.extractedMetadata?.coverImage ? 
                "Cover generated from first page • Upload custom image to override" : 
                "Cover will be generated from first page • Custom upload optional"
              }
            </p>
            </div>
          </div>

          {/* Extracted Metadata Display */}
          {formData.extractedMetadata && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Document Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <p className="text-gray-900">{formData.extractedMetadata.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Author:</span>
                  <p className="text-gray-900">{formData.extractedMetadata.author}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Genre:</span>
                  <p className="text-gray-900">{formData.extractedMetadata.genre}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Language:</span>
                  <p className="text-gray-900">{formData.extractedMetadata.language}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-900 capitalize">{formData.extractedMetadata.category?.replace('-', ' ')}</p>
                </div>
                {formData.extractedMetadata.publishedYear && (
                  <div>
                    <span className="font-medium text-gray-700">Published:</span>
                    <p className="text-gray-900">{formData.extractedMetadata.publishedYear}</p>
                  </div>
                )}
                {formData.extractedMetadata.pageCount && (
                  <div>
                    <span className="font-medium text-gray-700">Pages:</span>
                    <p className="text-gray-900">{formData.extractedMetadata.pageCount}</p>
                  </div>
                )}
              </div>
              {formData.extractedMetadata.description && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{formData.extractedMetadata.description}</p>
                </div>
              )}
            </div>
          )}

          
                    {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={
                isSubmitting || 
                !formData.pdfFile ||
                !formData.extractedMetadata ||
                isExtracting
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
                  Upload Document
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