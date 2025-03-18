import passport from 'passport';
import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/unauthenticated.js';
import User from '../models/usermodel.js';

/**
 * Start Google authentication
 */
export const startGoogleAuth = (req, res, next) => {
    console.log('Starting Google authentication');
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
};

/**
 * Handle Google callback
 */
export const handleGoogleCallback = (req, res, next) => {
    console.log('Received Google callback');
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/login',
        failureMessage: true
    })(req, res, next);
};

/**
 * Check if user is authenticated using JWT
 */
export const requireAuth = async (req, res, next) => {
    try {
        // Check header
        const authHeader = req.headers.authorization;
        console.log('Auth Header:', authHeader);

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthenticatedError('No authorization header');
        }

        // Get and verify token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            throw new UnauthenticatedError('No token provided');
        }

        // Verify JWT Secret exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            throw new UnauthenticatedError('Authentication configuration error');
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified:', {
                userId: decoded.userId,
                role: decoded.role
            });
        } catch (error) {
            console.error('JWT Verification failed:', error.message);
            if (error.name === 'TokenExpiredError') {
                throw new UnauthenticatedError('Token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthenticatedError('Invalid token format');
            }
            throw new UnauthenticatedError('Token verification failed');
        }

        // Find user
        const user = await User.findById(decoded.userId)
            .select('-password')
            .lean();  // Convert to plain object

        if (!user) {
            console.error('User not found for token:', decoded.userId);
            throw new UnauthenticatedError('User not found');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'UnauthenticatedError') {
            next(error);
        } else {
            console.error('Auth middleware error:', error);
            next(new UnauthenticatedError('Authentication failed'));
        }
    }
}; 

export const requireRole = async (req, res, next) => {
    try{
        const { role } = req.user;
        if (role !== 'Seller') {
            throw new UnauthenticatedError('Unauthorized access');
        }
        next();
    } catch (error) {
        next(error);
    }
}