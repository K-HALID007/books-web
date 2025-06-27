import mongoose from 'mongoose';
import PDFBook from '../models/PDFBook.model.js';
import defaultCoverGenerator from '../services/defaultCoverGenerator.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/books-app');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update PDF books without cover images
const updatePdfCovers = async () => {
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

    for (const book of booksWithoutCovers) {
      try {
        console.log(`Generating cover for: ${book.title}`);
        
        // Generate default cover
        const coverImageBase64 = defaultCoverGenerator.generateDefaultCover(book.title, book.author);
        
        if (coverImageBase64) {
          // Update the book with the new cover
          await PDFBook.findByIdAndUpdate(book._id, {
            coverImage: `data:image/svg+xml;base64,${coverImageBase64}`
          });
          
          console.log(`✓ Updated cover for: ${book.title}`);
        }
      } catch (error) {
        console.error(`Error updating cover for ${book.title}:`, error);
      }
    }

    console.log('Finished updating PDF covers');
  } catch (error) {
    console.error('Error updating PDF covers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await updatePdfCovers();
};

main().catch(console.error);