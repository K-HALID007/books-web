import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  genre: { type: String },
  coverImage: { type: String },
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
