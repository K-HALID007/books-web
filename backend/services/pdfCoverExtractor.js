import pdf from 'pdf-poppler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFCoverExtractor {
  /**
   * Extract the first page of a PDF as a base64 image
   * @param {string} pdfPath - Path to the PDF file
   * @returns {Promise<string>} - Base64 encoded image string
   */
  async extractFirstPageAsBase64(pdfPath) {
    try {
      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '../temp/');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Configure pdf-poppler options
      const options = {
        format: 'jpeg',
        out_dir: tempDir,
        out_prefix: 'page',
        page: 1,              // Only first page
        scale: 1024           // Scale for good quality
      };

      // Convert first page to image
      const result = await pdf.convert(pdfPath, options);
      
      if (result && result.length > 0) {
        // Read the generated image file
        const imagePath = result[0];
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        
        // Clean up temporary file
        fs.unlinkSync(imagePath);
        
        return base64Image;
      } else {
        throw new Error('Failed to extract page as base64');
      }

    } catch (error) {
      console.error('Error extracting PDF first page:', error);
      throw new Error('Failed to extract PDF cover image');
    }
  }

  /**
   * Extract the first page and save as image file
   * @param {string} pdfPath - Path to the PDF file
   * @param {string} outputPath - Path where to save the image
   * @returns {Promise<string>} - Path to the saved image
   */
  async extractFirstPageAsFile(pdfPath, outputPath) {
    try {
      const outputDir = path.dirname(outputPath);
      const filename = path.basename(outputPath, path.extname(outputPath));
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Configure pdf-poppler options
      const options = {
        format: 'jpeg',
        out_dir: outputDir,
        out_prefix: filename,
        page: 1,              // Only first page
        scale: 1024           // Scale for good quality
      };

      // Convert first page to image
      const result = await pdf.convert(pdfPath, options);
      
      if (result && result.length > 0) {
        return result[0];
      } else {
        throw new Error('Failed to extract page as file');
      }

    } catch (error) {
      console.error('Error extracting PDF first page as file:', error);
      throw new Error('Failed to extract PDF cover image as file');
    }
  }

  /**
   * Clean up temporary files
   * @param {string} tempDir - Temporary directory path
   */
  cleanupTempFiles(tempDir) {
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          const filePath = path.join(tempDir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        });
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  /**
   * Check if a PDF file is valid and readable
   * @param {string} pdfPath - Path to the PDF file
   * @returns {Promise<boolean>} - True if PDF is valid
   */
  async isValidPDF(pdfPath) {
    try {
      if (!fs.existsSync(pdfPath)) {
        return false;
      }

      // Try to read the first few bytes to check PDF header
      const buffer = fs.readFileSync(pdfPath, { start: 0, end: 4 });
      return buffer.toString() === '%PDF';
    } catch (error) {
      console.error('Error validating PDF:', error);
      return false;
    }
  }
}

export default new PDFCoverExtractor();