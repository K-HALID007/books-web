import express from 'express';
import { createBook, getUserBooks } from '../controllers/book.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBook);
router.get('/my-books', protect, getUserBooks);

export default router;
