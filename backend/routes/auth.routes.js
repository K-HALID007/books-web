import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile } from '../controllers/auth.controller.js';
import protect from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin, validateUpdateProfile } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);

export default router;
