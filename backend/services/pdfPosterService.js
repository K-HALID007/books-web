import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Book from '../models/book.model.js';
import PDFBook from '../models/PDFBook.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFPosterService {
  /**
   * Generate a poster page with all books from user's library
   * @param {string} userId - User ID to fetch books for
   * @returns {Promise<Buffer>} - PDF buffer with poster page
   */
  async generateLibraryPoster(userId) {
    try {
      // Fetch user's books (both regular and PDF books)
      const [regularBooks, pdfBooks] = await Promise.all([
        Book.find({ user: userId }).select('title author genre coverImage createdAt').lean(),
        PDFBook.find({ uploadedBy: userId }).select('title author category coverImage uploadedAt').lean()
      ]);

      // Combine and normalize books data
      const allBooks = [
        ...regularBooks.map(book => ({
          title: book.title,
          author: book.author,
          genre: book.genre,
          coverImage: book.coverImage,
          date: book.createdAt,
          type: 'Regular'
        })),
        ...pdfBooks.map(book => ({
          title: book.title,
          author: book.author,
          genre: book.category,
          coverImage: book.coverImage,
          date: book.uploadedAt,
          type: 'PDF'
        }))
      ];

      // Sort by date (newest first)
      allBooks.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

      // Load fonts
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const smallFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      const { width, height } = page.getSize();
      const margin = 50;
      let currentY = height - margin;

      // Header
      page.drawText('My Personal Library', {
        x: margin,
        y: currentY,
        size: 28,
        font: titleFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      currentY -= 40;

      // Library stats
      const totalBooks = allBooks.length;
      const genres = [...new Set(allBooks.map(book => book.genre).filter(g => g))];
      const statsText = `${totalBooks} Books • ${genres.length} Genres • Updated ${new Date().toLocaleDateString()}`;
      
      page.drawText(statsText, {
        x: margin,
        y: currentY,
        size: 12,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4)
      });

      currentY -= 30;

      // Draw separator line
      page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: width - margin, y: currentY },
        thickness: 2,
        color: rgb(0.8, 0.6, 0.4)
      });

      currentY -= 30;

      // Books grid
      const booksPerRow = 4;
      const bookWidth = (width - 2 * margin - (booksPerRow - 1) * 20) / booksPerRow;
      const bookHeight = 120;
      let currentX = margin;
      let booksInCurrentRow = 0;

      for (let i = 0; i < Math.min(allBooks.length, 20); i++) { // Limit to 20 books for poster
        const book = allBooks[i];

        if (booksInCurrentRow >= booksPerRow) {
          currentY -= bookHeight + 30;
          currentX = margin;
          booksInCurrentRow = 0;

          // Check if we have space for another row
          if (currentY < margin + bookHeight) {
            break;
          }
        }

        // Draw book container
        page.drawRectangle({
          x: currentX,
          y: currentY - bookHeight,
          width: bookWidth,
          height: bookHeight,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
          color: rgb(0.98, 0.98, 0.98)
        });

        // Book type indicator
        const typeColor = book.type === 'PDF' ? rgb(0.8, 0.4, 0.2) : rgb(0.2, 0.6, 0.8);
        page.drawRectangle({
          x: currentX + 5,
          y: currentY - 20,
          width: 30,
          height: 12,
          color: typeColor
        });

        page.drawText(book.type, {
          x: currentX + 7,
          y: currentY - 18,
          size: 8,
          font: regularFont,
          color: rgb(1, 1, 1)
        });

        // Book title (truncated if too long)
        let title = book.title;
        if (title.length > 25) {
          title = title.substring(0, 22) + '...';
        }

        page.drawText(title, {
          x: currentX + 5,
          y: currentY - 40,
          size: 10,
          font: titleFont,
          color: rgb(0.2, 0.2, 0.2),
          maxWidth: bookWidth - 10
        });

        // Author
        let author = book.author || 'Unknown Author';
        if (author.length > 20) {
          author = author.substring(0, 17) + '...';
        }

        page.drawText(`by ${author}`, {
          x: currentX + 5,
          y: currentY - 55,
          size: 8,
          font: regularFont,
          color: rgb(0.4, 0.4, 0.4),
          maxWidth: bookWidth - 10
        });

        // Genre
        if (book.genre) {
          let genre = book.genre;
          if (genre.length > 15) {
            genre = genre.substring(0, 12) + '...';
          }

          page.drawText(genre, {
            x: currentX + 5,
            y: currentY - 70,
            size: 7,
            font: smallFont,
            color: rgb(0.6, 0.6, 0.6),
            maxWidth: bookWidth - 10
          });
        }

        // Date added
        const dateStr = new Date(book.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit'
        });

        page.drawText(`Added ${dateStr}`, {
          x: currentX + 5,
          y: currentY - 85,
          size: 6,
          font: smallFont,
          color: rgb(0.7, 0.7, 0.7),
          maxWidth: bookWidth - 10
        });

        currentX += bookWidth + 20;
        booksInCurrentRow++;
      }

      // Footer with more books indicator
      if (allBooks.length > 20) {
        currentY -= bookHeight + 50;
        const moreText = `... and ${allBooks.length - 20} more books in your library`;
        page.drawText(moreText, {
          x: margin,
          y: currentY,
          size: 12,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5)
        });
      }

      // Generate genres summary at bottom
      currentY -= 40;
      if (genres.length > 0) {
        page.drawText('Genres in your library:', {
          x: margin,
          y: currentY,
          size: 10,
          font: titleFont,
          color: rgb(0.3, 0.3, 0.3)
        });

        currentY -= 20;
        const genresText = genres.slice(0, 10).join(' • ');
        page.drawText(genresText, {
          x: margin,
          y: currentY,
          size: 9,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5),
          maxWidth: width - 2 * margin
        });
      }

      // Save PDF and return buffer
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);

    } catch (error) {
      console.error('Error generating library poster:', error);
      throw new Error('Failed to generate library poster');
    }
  }

  /**
   * Prepend poster page to an existing PDF
   * @param {Buffer} originalPdfBuffer - Original PDF buffer
   * @param {string} userId - User ID for library poster
   * @returns {Promise<Buffer>} - New PDF with poster as first page
   */
  async prependPosterToPDF(originalPdfBuffer, userId) {
    try {
      // Generate poster page
      const posterBuffer = await this.generateLibraryPoster(userId);

      // Load both PDFs
      const posterPdf = await PDFDocument.load(posterBuffer);
      const originalPdf = await PDFDocument.load(originalPdfBuffer);

      // Create new PDF document
      const newPdf = await PDFDocument.create();

      // Copy poster page first
      const [posterPage] = await newPdf.copyPages(posterPdf, [0]);
      newPdf.addPage(posterPage);

      // Copy all pages from original PDF
      const originalPageCount = originalPdf.getPageCount();
      const originalPages = await newPdf.copyPages(originalPdf, Array.from({ length: originalPageCount }, (_, i) => i));
      
      originalPages.forEach(page => newPdf.addPage(page));

      // Return new PDF buffer
      const newPdfBytes = await newPdf.save();
      return Buffer.from(newPdfBytes);

    } catch (error) {
      console.error('Error prepending poster to PDF:', error);
      throw new Error('Failed to add poster page to PDF');
    }
  }

  /**
   * Generate standalone poster PDF file
   * @param {string} userId - User ID
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} - Path to generated file
   */
  async generatePosterFile(userId, outputPath) {
    try {
      const posterBuffer = await this.generateLibraryPoster(userId);
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to file
      fs.writeFileSync(outputPath, posterBuffer);
      return outputPath;

    } catch (error) {
      console.error('Error generating poster file:', error);
      throw new Error('Failed to generate poster file');
    }
  }
}

export default new PDFPosterService();