import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address')
  .isLength({ max: 254 })
  .withMessage('Email address too long');

const passwordValidation = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes');

// Auth validation rules
export const validateRegister = [
  nameValidation,
  emailValidation,
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateLogin = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password too long'),
  handleValidationErrors
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('First name must be between 1 and 30 characters')
    .matches(/^[a-zA-Z'-]+$/)
    .withMessage('First name can only contain letters, hyphens, and apostrophes'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Last name must be between 1 and 30 characters')
    .matches(/^[a-zA-Z'-]+$/)
    .withMessage('Last name can only contain letters, hyphens, and apostrophes'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address too long'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Country can only contain letters, spaces, and hyphens'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('City can only contain letters, spaces, and hyphens'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('favoriteGenres')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Favorite genres must be an array with maximum 10 items'),
  
  body('favoriteGenres.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each genre must be between 2 and 30 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Genre can only contain letters, spaces, and hyphens'),
  
  body('currentPassword')
    .optional()
    .isLength({ min: 1, max: 128 })
    .withMessage('Current password is required when changing password'),
  
  body('newPassword')
    .optional()
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  handleValidationErrors
];

// Book validation rules
export const validateBook = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .matches(/^[a-zA-Z0-9\s\-_:.,!?'"()&]+$/)
    .withMessage('Title contains invalid characters'),
  
  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\-'.,]+$/)
    .withMessage('Author name contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre must not exceed 50 characters')
    .matches(/^[a-zA-Z\s\-]+$/)
    .withMessage('Genre can only contain letters, spaces, and hyphens'),
  
  body('coverImage')
    .optional()
    .custom((value) => {
      if (value && !value.startsWith('data:image/')) {
        throw new Error('Cover image must be a valid base64 data URL');
      }
      return true;
    }),
  
  handleValidationErrors
];

// PDF Book validation rules
export const validatePDFBook = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .matches(/^[a-zA-Z0-9\s\-_:.,!?'"()&@#$%+=\[\]{}|\\\/~`^*]+$/)
    .withMessage('Title contains invalid characters'),
  
  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-'.,&@]+$/)
    .withMessage('Author name contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Category can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('uploadReason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Upload reason must be between 10 and 500 characters'),
  
  handleValidationErrors
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

export const validateBookId = [
  param('bookId')
    .isMongoId()
    .withMessage('Invalid book ID format'),
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer between 1 and 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?'"()&]+$/)
    .withMessage('Search query contains invalid characters'),
  
  handleValidationErrors
];

export default {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateBook,
  validatePDFBook,
  validateObjectId,
  validateBookId,
  validatePagination,
  handleValidationErrors
};