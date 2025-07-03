import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import pdfBookRoutes from './routes/pdf-books.routes.js';

// Import security middleware
import {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  securityHeaders,
  mongoSanitizer,
  parameterPollutionPrevention,
  compressionMiddleware,
  securityLogger,
  validateFileUpload
} from './middleware/security.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware - order matters!
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(securityLogger);

// Rate limiting - apply before other middleware
app.use('/api/auth', authLimiter);
app.use('/api/pdf-books/upload', uploadLimiter);
app.use('/api', generalLimiter);

// CORS configuration - more restrictive
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`🚨 CORS: Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}));

// Data sanitization middleware
app.use(mongoSanitizer);
app.use(parameterPollutionPrevention);

// Body parser middleware with security limits
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB
app.use(express.json({ 
  limit: '10mb', // Reduced from 50mb for JSON
  verify: (req, res, buf) => {
    // Only verify JSON payload if there's content and it's not empty
    if (buf && buf.length > 0) {
      try {
        JSON.parse(buf);
      } catch (e) {
        // Only throw error if the content is not empty and fails to parse
        if (buf.toString().trim().length > 0) {
          throw new Error('Invalid JSON payload');
        }
      }
    }
  }
}));
app.use(express.urlencoded({ 
  limit: '10mb', 
  extended: true,
  parameterLimit: 100 // Limit number of parameters
}));

// Serve static files (uploaded PDFs and cover images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/pdf-books', pdfBookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BookVault API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  // Log error details for monitoring (but don't expose to client)
  console.error('🚨 ERROR:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error types
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: `File too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB.`
    });
  }
  
  if (error.code === 'LIMIT_FIELD_COUNT') {
    return res.status(400).json({ 
      error: 'Too many form fields. Please reduce the number of fields in your request.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected file field. Please check your form configuration.'
    });
  }
  
  if (error.message === 'Too many fields') {
    return res.status(400).json({ 
      error: 'Too many form fields. Please reduce the number of fields in your request.'
    });
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ 
      error: 'Only PDF files are allowed for upload.'
    });
  }
  
  if (error.message === 'Invalid JSON payload') {
    return res.status(400).json({
      error: 'Invalid request format'
    });
  }
  
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry detected'
    });
  }
  
  // Generic error response (don't expose internal details)
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;