import Book from '../models/book.model.js';

export const createBook = async (req, res) => {
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
};

export const getUserBooks = async (req, res) => {
  const books = await Book.find({ user: req.user._id });
  res.json(books);
};
