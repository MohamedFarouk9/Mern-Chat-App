import express from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleAuth,
} from '../controllers/authController.js';

import {
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validateEmailVerificationMock,
  validateGoogleAuth,
} from '../middleware/validator.js';

import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// public
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', validateGoogleAuth, googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// email verification
router.get('/verify-email', validateEmailVerification, verifyEmail);
router.post('/resend-verification', resendVerification);

// protected
router.post('/logout', authMiddleware, logout);

export default router;