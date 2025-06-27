import express from 'express';
import { createBook, getAllBooks, getUserBooks, updateBook, deleteBook } from '../controllers/book.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBooks); // Public route to get all books
router.post('/', protect, createBook);
router.get('/my-books', protect, getUserBooks);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

export default router;
