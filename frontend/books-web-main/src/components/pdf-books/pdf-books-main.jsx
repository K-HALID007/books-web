"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Library, BookOpen, Shield } from 'lucide-react';
import PDFUpload from './pdf-upload';
import PDFLibrary from './pdf-library';

const PDFBooksMain = () => {
  const [activeTab, setActiveTab] = useState('library');

  const tabs = [
    { id: 'library', label: 'Browse Books', icon: Library },
    { id: 'upload', label: 'Upload Book', icon: Upload }
  ];

  return (
    <div className="min-h-screen bg-[#F4EDE4] pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 text-[#A47148] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-[#5D4037] mb-2">PDF Book Sharing</h1>
            <p className="text-[#6B4F3F] text-lg max-w-2xl mx-auto">
              Share and discover books in our community library. Upload your own works or explore books shared by others.
            </p>
          </div>

          {/* Safety Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Safe & Legal Sharing</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• We prioritize legal and ethical book sharing</p>
                  <p>• Only upload content you have rights to share</p>
                  <p>• Public domain works and personal writings are welcome</p>
                  <p>• All uploads are reviewed for copyright compliance</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-[#5D4037] shadow-sm'
                        : 'text-gray-600 hover:text-[#5D4037]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'library' && <PDFLibrary />}
          {activeTab === 'upload' && <PDFUpload />}
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white py-16"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#5D4037] text-center mb-12">
            Why Use Our PDF Library?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#A47148] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#5D4037] mb-2">Legal & Safe</h3>
              <p className="text-[#6B4F3F]">
                We ensure all content follows copyright laws and community guidelines.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#A47148] rounded-full flex items-center justify-center mx-auto mb-4">
                <Library className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#5D4037] mb-2">Rich Collection</h3>
              <p className="text-[#6B4F3F]">
                Discover diverse books from public domain classics to modern self-published works.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#A47148] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#5D4037] mb-2">Easy Access</h3>
              <p className="text-[#6B4F3F]">
                Simple download and preview features make reading convenient and enjoyable.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PDFBooksMain;