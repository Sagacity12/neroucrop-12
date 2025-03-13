import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/unauthenticated.js';
import { token } from 'morgan';



/**
 * Extract token from authorization header 
 * @param {string} authHeader - Authorization header 
 * @returns {string} JWT token 
 */
export const extractToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError('No token provided');
    }
    return authHeader.split(' ')[1];
};

/**
 * Parse token payload without verification
 * @param {string} token - JWT token
 * @returns {object} Token payload
 */
export const parseTokenPayload = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        throw new UnauthenticatedError('Invalid token format');
    }
};
/**
 * Format auth response object 
 * @param {object} user - User object
 * @param {string} token - JWT token 
 * @returns {object} Formatted response
 */
export const formatAuthResponse = (user, token) => {
    const { password, ...userWithoutPassword } = user.toObject();
    return {
        success: true,
        data: {
            user: userWithoutPassword,
            token
        }
    };
};
