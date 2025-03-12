import express from 'express';
import {
    register,
    login,
    sendVerification,
    verify,
    logout,
    getCurrentUser,
    forgotPassword,
    handleResetPassword
} from '../controllers/auth-controller.js';
import {
    startGoogleAuth,
    handleGoogleCallback,
    requireAuth
} from '../middleware/auth-middleware.js';
import passport from 'passport';
import { handleGoogleSuccess } from '../services/google-auth/index.js';
import authErrorHandler from '../errors/auth-error-handler.js';

const router = express.Router();

// Debug route
router.get('/test', (req, res) => {
    res.json({
        message: 'Auth routes working',
        timestamp: new Date().toISOString()
    });
});

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify/:userId', verify);
router.post('/send-verification/:userId', sendVerification);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', requireAuth, logout);

// Google OAuth routes
router.post('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account'
}));

router.post('/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/auth/error'
    }),
    handleGoogleSuccess
);

// Add an error route
router.post('/error', (req, res) => {
    res.status(401).json({
        success: false,
        error: 'Authentication failed'
    });
});

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', handleResetPassword);

// Error handler
router.use(authErrorHandler);

export default router;