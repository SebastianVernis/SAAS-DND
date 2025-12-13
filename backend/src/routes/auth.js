import express from 'express';
import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../config/constants.js';
import { validate } from '../utils/validators.js';
import { registerSchema, loginSchema, verifyOtpSchema } from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';
import {
  register,
  verifyOtpHandler,
  resendOtp,
  login,
  getSession,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

// Auth-specific rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.auth.windowMs,
  max: RATE_LIMITS.auth.max,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP rate limiter (very strict)
const otpLimiter = rateLimit({
  windowMs: RATE_LIMITS.otp.windowMs,
  max: RATE_LIMITS.otp.max,
  message: { error: 'Too many OTP attempts. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), verifyOtpHandler);
router.post('/resend-otp', otpLimiter, resendOtp);

// Protected routes
router.get('/session', requireAuth, getSession);
router.post('/logout', requireAuth, logout);

export default router;
