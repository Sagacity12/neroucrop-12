import express from 'express';
import {
    register,
    login, sendVerification, verify, logout, getCurrentUser, forgotPassword, handleResetPassword
} from '../controllers/auth-controller.js';
import { 
    startGoogleAuth, 
    handleGoogleCallback, 
    requireAuth 
} from '../middleware/auth-middleware.js';
import User from '../models/usermodel.js';
import passport from 'passport';
import { generateToken } from '../helpers/index-helpers.js';
import { handleGoogleSuccess } from '../services/google-auth/index.js';
import authErrorHandler from '../errors/auth-error-handler.js';

const router = express.Router()

// Public routes (no authentication needed)
router.post('/register', register);
router.post('/login', login);
router.post('/verify/:userId', verify);
router.post('/send-verification/:userId', sendVerification);

// Protected routes (require authentication)
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', requireAuth, logout);

//  temporary debug route (remove in production)
router.get('/check-email/:email', async (req, res) => {
    const user = await User.findOne({ email: req.params.email });
    res.json({ 
        exists: !!user,
        email: req.params.email 
    });
});

// Google OAuth routes
router.get('/google', startGoogleAuth);
router.get('/google/callback', handleGoogleCallback, handleGoogleSuccess);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', handleResetPassword);

// Auth error handler
router.use(authErrorHandler);

export default router;