import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BookVault API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic routes without imports to avoid conflicts
app.get('/api/pdf-books', async (req, res) => {
  res.json([]);
});

app.get('/api/pdf-books/my-books', async (req, res) => {
  res.json([]);
});

app.post('/api/auth/login', async (req, res) => {
  res.json({ 
    token: 'demo-token',
    user: { id: '1', name: 'Demo User', email: 'demo@example.com' }
  });
});

app.post('/api/auth/register', async (req, res) => {
  res.json({ 
    token: 'demo-token',
    user: { id: '1', name: 'Demo User', email: 'demo@example.com' }
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;