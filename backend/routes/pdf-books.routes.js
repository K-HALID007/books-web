import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import PDFBook from '../models/PDFBook.model.js';
import protect from '../middleware/authMiddleware.js';
import pdfPosterService from '../services/pdfPosterService.js';
import pdfCoverExtractor from '../services/pdfCoverExtractor.js';
import { validatePDFBook, validateBookId, validatePagination, validateObjectId } from '../middleware/validation.js';
import { validateFileUpload } from '../middleware/security.js';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;
    if (file.fieldname === 'pdf') {
      uploadDir = path.join(__dirname, '../uploads/pdf-books/');
    } else if (file.fieldname === 'coverImage') {
      uploadDir = path.join(__dirname, '../uploads/covers/');
    }
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    if (file.fieldname === 'pdf') {
      cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
    } else if (file.fieldname === 'coverImage') {
      cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
    }
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // Use env variable
    files: 2, // Maximum 2 files (PDF + cover image)
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100, // Limit field name size
    fields: 20 // Increased limit for form fields
  },
  fileFilter: (req, file, cb) => {
    // Validate file types more strictly
    const allowedPdfTypes = ['application/pdf'];
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    // Check for malicious file names
    const dangerousPatterns = [
      /\.\./,  // Path traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Windows reserved names
      /^\./,  // Hidden files
      /\.(exe|bat|cmd|scr|pif|com|dll|vbs|js|jar|app|deb|rpm)$/i  // Executable extensions
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(file.originalname)) {
        return cb(new Error('Invalid filename detected'), false);
      }
    }

    if (file.fieldname === 'pdf') {
      if (allowedPdfTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for book upload'), false);
      }
    } else if (file.fieldname === 'coverImage') {
      if (allowedImageTypes.includes(file.mimetype)) {
        // Additional size check for images (5MB limit)
        if (file.size && file.size > 5 * 1024 * 1024) {
          cb(new Error('Cover image size must be less than 5MB'), false);
        } else {
          cb(null, true);
        }
      } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed for cover images'), false);
      }
    } else {
      cb(new Error('Unexpected field name'), false);
    }
  }
});

// GET /api/pdf-books - Get all PDF books
router.get('/', validatePagination, async (req, res) => {
  try {
    const books = await PDFBook.find({ isApproved: true })
      .populate('uploadedBy', 'name')
      .sort({ uploadedAt: -1 });
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching PDF books:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// POST /api/pdf-books/upload - Upload a new PDF book
router.post('/upload', protect, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), validateFileUpload, validatePDFBook, async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const pdfFile = req.files.pdf[0];
    const coverImageFile = req.files.coverImage ? req.files.coverImage[0] : null;

    const {
      title,
      author,
      description,
      category,
      isPublicDomain,
      uploadReason,
      uploaderName
    } = req.body;

    // Validate required fields
    if (!title || !author || !uploadReason) {
      // Delete uploaded files if validation fails
      fs.unlinkSync(pdfFile.path);
      if (coverImageFile) {
        fs.unlinkSync(coverImageFile.path);
      }
      return res.status(400).json({ 
        message: 'Title, author, and upload reason are required' 
      });
    }

    // Create cover image URL if uploaded, otherwise extract from PDF first page
    let coverImageUrl = null;
    if (coverImageFile) {
      coverImageUrl = `/uploads/covers/${coverImageFile.filename}`;
    }

    // Create new PDF book record
    const pdfBook = new PDFBook({
      title,
      author,
      description,
      category,
      isPublicDomain: isPublicDomain === 'true',
      uploadReason,
      uploadedBy: req.user._id,
      uploaderName: uploaderName || req.user.name,
      fileName: pdfFile.filename,
      originalName: pdfFile.originalname,
      filePath: pdfFile.path,
      fileSize: pdfFile.size,
      coverImage: coverImageUrl,
      uploadedAt: new Date(),
      downloads: 0
    });

    // Poster injection disabled – keep original PDF as-is

    // Extract first page as cover image if no cover image was uploaded
    if (!coverImageFile) {
      try {
        console.log('Extracting first page as cover image...');
        const firstPageBase64 = await pdfCoverExtractor.extractFirstPageAsBase64(pdfFile.path);
        
        // Store the base64 image directly in the database
        pdfBook.coverImage = firstPageBase64;
        console.log('Successfully extracted first page as cover image');
      } catch (extractError) {
        console.error('Error extracting PDF first page as cover:', extractError);
        console.log('Continuing without cover image extraction...');
        // Continue without cover image if extraction fails
      }
    }

    await pdfBook.save();

    res.status(201).json({
      message: 'PDF book uploaded successfully with library poster as first page',
      book: pdfBook
    });

  } catch (error) {
    console.error('Error uploading PDF book:', error);
    
    // Delete uploaded files if database save fails
    if (req.files) {
      if (req.files.pdf && fs.existsSync(req.files.pdf[0].path)) {
        fs.unlinkSync(req.files.pdf[0].path);
      }
      if (req.files.coverImage && fs.existsSync(req.files.coverImage[0].path)) {
        fs.unlinkSync(req.files.coverImage[0].path);
      }
    }
    
    res.status(500).json({ message: 'Failed to upload book' });
  }
});

// GET /api/pdf-books/library-poster - Download library poster (must come before /:id routes)
router.get('/library-poster', protect, async (req, res) => {
  try {
    // Generate poster for user's library
    const posterBuffer = await pdfPosterService.generateLibraryPoster(req.user._id);

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="My-Library-Poster.pdf"`);
    res.setHeader('Content-Length', posterBuffer.length);
    
    // Send the poster PDF
    res.send(posterBuffer);

  } catch (error) {
    console.error('Error generating library poster:', error);
    res.status(500).json({ message: 'Failed to generate library poster' });
  }
});

// GET /api/pdf-books/:id/download - Download a PDF book with poster page
router.get('/:id/download', protect, validateObjectId, async (req, res) => {
  try {
    const book = await PDFBook.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const filePath = path.resolve(book.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Read original PDF (poster injection removed)
    const originalPdfBuffer = fs.readFileSync(filePath);

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${book.originalName}"`);
    res.setHeader('Content-Length', originalPdfBuffer.length);
    
    // Send the original PDF
    res.send(originalPdfBuffer);

  } catch (error) {
    console.error('Error downloading PDF book:', error);
    res.status(500).json({ message: 'Failed to download book' });
  }
});

// POST /api/pdf-books/:id/download-count - Increment download count
router.post('/:id/download-count', protect, validateObjectId, async (req, res) => {
  try {
    const book = await PDFBook.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ downloads: book.downloads });

  } catch (error) {
    console.error('Error updating download count:', error);
    res.status(500).json({ message: 'Failed to update download count' });
  }
});

// GET /api/pdf-books/my-books - Get user's uploaded books
router.get('/my-books', protect, validatePagination, async (req, res) => {
  try {
    const books = await PDFBook.find({ uploadedBy: req.user._id })
      .sort({ uploadedAt: -1 });
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching user PDF books:', error);
    res.status(500).json({ message: 'Failed to fetch your books' });
  }
});

// DELETE /api/pdf-books/:id - Delete a PDF book
router.delete('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const book = await PDFBook.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user owns the book or is admin
    if (book.uploadedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    // Delete file from filesystem
    if (fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }

    // Delete from database
    await PDFBook.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book deleted successfully' });

  } catch (error) {
    console.error('Error deleting PDF book:', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

export default router;