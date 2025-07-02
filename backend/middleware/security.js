import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';

// Rate limiting configuration
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// General rate limiter
export const generalLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  'Too many requests from this IP, please try again later'
);

// Strict rate limiter for auth endpoints
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later'
);

// File upload rate limiter
export const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later'
);

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for file uploads
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Simple MongoDB injection prevention (read-only approach)
export const mongoSanitizer = (req, res, next) => {
  try {
    // Check for dangerous patterns without modifying the request
    const checkObject = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        // Check for MongoDB operators
        if (key.startsWith('$') || key.includes('.')) {
          console.warn(`🚨 SECURITY: MongoDB injection attempt detected at ${path}.${key}`);
          throw new Error('Invalid request parameters');
        }
        
        // Check nested objects
        if (typeof value === 'object' && value !== null) {
          checkObject(value, `${path}.${key}`);
        }
      }
    };

    // Check query, body, and params
    if (req.query) checkObject(req.query, 'query');
    if (req.body) checkObject(req.body, 'body');
    if (req.params) checkObject(req.params, 'params');
    
    next();
  } catch (error) {
    console.error('Security check failed:', error.message);
    return res.status(400).json({
      error: 'Invalid request format'
    });
  }
};

// HTTP Parameter Pollution prevention
export const parameterPollutionPrevention = hpp({
  whitelist: ['tags', 'genres', 'categories'] // Allow arrays for these fields
});

// Compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

// Security logging middleware
export const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript protocol
    /vbscript:/i,  // VBScript protocol
    /onload=/i,  // Event handlers
    /onerror=/i
  ];

  const userAgent = req.get('User-Agent') || '';
  const url = req.originalUrl || req.url;
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);

  const testString = `${url} ${body} ${query} ${userAgent}`;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(testString)) {
      console.warn(`🚨 SECURITY ALERT: Suspicious request detected from ${req.ip}:`, {
        method: req.method,
        url: req.originalUrl,
        userAgent,
        body: req.body,
        query: req.query,
        headers: req.headers,
        timestamp: new Date().toISOString()
      });
      break;
    }
  }

  next();
};

// File upload security validation
export const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return next();
  }

  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB default
  if (file.size > maxSize) {
    return res.status(400).json({
      error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`
    });
  }

  // Check file type
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'application/pdf').split(',');
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    });
  }

  // Check for malicious file names
  const dangerousPatterns = [
    /\.\./,  // Path traversal
    /[<>:"|?*]/,  // Invalid filename characters
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Windows reserved names
    /^\./,  // Hidden files
    /\.(exe|bat|cmd|scr|pif|com|dll|vbs|js|jar|app|deb|rpm)$/i  // Executable extensions
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(file.originalname)) {
      return res.status(400).json({
        error: 'Invalid filename detected'
      });
    }
  }

  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      console.warn(`🚨 SECURITY: Unauthorized IP access attempt: ${clientIP} to ${req.originalUrl}`);
      return res.status(403).json({
        error: 'Access denied from this IP address'
      });
    }
    
    next();
  };
};

export default {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  securityHeaders,
  mongoSanitizer,
  parameterPollutionPrevention,
  compressionMiddleware,
  securityLogger,
  validateFileUpload,
  ipWhitelist
};