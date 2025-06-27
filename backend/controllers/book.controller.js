import Book from '../models/book.model.js';

export const createBook = async (req, res) => {
  try {
    const { title, author, description, genre, coverImage } = req.body;

    const book = new Book({
      user: req.user._id,
      title,
      author,
      description,
      genre,
      coverImage,
    });

    const created = await book.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('user', 'name').sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { title, author, description, genre } = req.body;
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the book belongs to the authenticated user
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    // Update book fields
    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description !== undefined ? description : book.description;
    book.genre = genre || book.genre;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the book belongs to the authenticated user
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
