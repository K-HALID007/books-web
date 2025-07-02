import express from 'express';
import { createBook, getAllBooks, getUserBooks, updateBook, deleteBook } from '../controllers/book.controller.js';
import protect from '../middleware/authMiddleware.js';
import { validateBook, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

router.get('/', validatePagination, getAllBooks); // Public route to get all books
router.post('/', protect, validateBook, createBook);
router.get('/my-books', protect, validatePagination, getUserBooks);
router.put('/:id', protect, validateObjectId, validateBook, updateBook);
router.delete('/:id', protect, validateObjectId, deleteBook);

export default router;
