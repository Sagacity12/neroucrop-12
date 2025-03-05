/**
 * Handle authentication-specific errors
 */
import { StatusCodes } from 'http-status-codes';

const authErrorHandler = (err, req, res, next) => {
    console.error('Auth error:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Handle specific auth errors
    if (err.name === 'UnauthenticatedError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            error: err.message || 'Authentication failed'
        });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }

    // Pass other errors to main error handler
    next(err);
};

export default authErrorHandler; 