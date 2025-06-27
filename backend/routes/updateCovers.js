import express from 'express';
import PDFBook from '../models/PDFBook.model.js';
import defaultCoverGenerator from '../services/defaultCoverGenerator.js';

const router = express.Router();

// POST /api/update-covers - Update PDF books without cover images
router.post('/', async (req, res) => {
  try {
    // Find PDF books without cover images
    const booksWithoutCovers = await PDFBook.find({
      $or: [
        { coverImage: null },
        { coverImage: { $exists: false } },
        { coverImage: '' }
      ]
    });

    console.log(`Found ${booksWithoutCovers.length} books without cover images`);

    const updatedBooks = [];

    for (const book of booksWithoutCovers) {
      try {
        console.log(`Generating cover for: ${book.title}`);
        
        // Generate default cover
        const coverImageBase64 = defaultCoverGenerator.generateDefaultCover(book.title, book.author);
        
        if (coverImageBase64) {
          // Update the book with the new cover
          const updatedBook = await PDFBook.findByIdAndUpdate(book._id, {
            coverImage: `data:image/svg+xml;base64,${coverImageBase64}`
          }, { new: true });
          
          updatedBooks.push(updatedBook);
          console.log(`✓ Updated cover for: ${book.title}`);
        }
      } catch (error) {
        console.error(`Error updating cover for ${book.title}:`, error);
      }
    }

    res.json({
      message: `Updated ${updatedBooks.length} books with cover images`,
      updatedBooks: updatedBooks.length
    });

  } catch (error) {
    console.error('Error updating PDF covers:', error);
    res.status(500).json({ message: 'Failed to update covers' });
  }
});

export default router;