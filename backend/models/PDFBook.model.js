import mongoose from 'mongoose';

const pdfBookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['personal', 'public-domain', 'educational', 'self-published', 'research'],
    default: 'personal'
  },
  genre: {
    type: String,
    trim: true,
    default: 'Non-Fiction'
  },
  publishedYear: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    trim: true,
    default: 'English'
  },
  pageCount: {
    type: String,
    trim: true
  },
  isPublicDomain: {
    type: Boolean,
    default: false
  },
  uploadReason: {
    type: String,
    required: true,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploaderName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isApproved: {
    type: Boolean,
    default: true // Set to false if you want manual approval
  },
  coverImage: {
    type: String, // Path to the cover image file
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  // For content moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  moderationNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for search functionality
pdfBookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Index for filtering
pdfBookSchema.index({ category: 1, uploadedAt: -1 });
pdfBookSchema.index({ uploadedBy: 1, uploadedAt: -1 });

// Virtual for file URL (if serving files via URL)
pdfBookSchema.virtual('fileUrl').get(function() {
  return `/api/pdf-books/${this._id}/download`;
});

// Method to increment download count
pdfBookSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Static method to get books by category
pdfBookSchema.statics.getByCategory = function(category) {
  return this.find({ category, isApproved: true })
    .populate('uploadedBy', 'name')
    .sort({ uploadedAt: -1 });
};

// Static method for search
pdfBookSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    isApproved: true
  }).populate('uploadedBy', 'name');
};

export default mongoose.model('PDFBook', pdfBookSchema);