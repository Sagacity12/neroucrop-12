import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/usermodel.js';
import { UnauthenticatedError } from '../../errors/unauthenticated.js';
import createHttpError from 'http-errors';

/**
 * Generate JWT token
 * @param {object} user - user object
 * @returns {string} JWT token 
 * @throws {Error} if JWT_SECRET is not configured
 */
export const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing');
        throw createHttpError(500, 'JWT_SECRET not configured');
    }

    try {
        // Debug log
        console.log('Generating token for user:', user._id);
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Debug log
        console.log('Token generated:', !!token);

        return token;
    } catch (error) {
        console.error('Token generation error:', error);
        throw createHttpError(500, 'Error generating token');
    }
};

/**
 * Hash Password
 * @param {string} password - Plain password
 * @returns {Promise<string>} Hashed password
 * @throws {Error} if password hashing fails
 */
export const hashPassword = async (password) => {
    try {
        console.log('Hashing password:', {
            originalPassword: password,
            length: password.length
        });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('Password hashed:', {
            hashedLength: hashedPassword.length,
            hashedPassword: hashedPassword
        });
        
        return hashedPassword;
    } catch (error) {
        console.error('Hash error:', error);
        throw createHttpError(500, 'Error hashing password');
    }
};

/**
 * Compare password 
 * @param {string} password - Plain password 
 * @param {string} hashedPassword - Hashed password 
 * @returns {Promise<boolean>} Is password valid
 * @throws {UnauthenticatedError} if passwords don't match
 */
export const comparePassword = async (password, hashedPassword) => {
    try {
        console.log('Comparing passwords:', {
            providedPassword: password,
            hashedPasswordLength: hashedPassword.length
        });
        
        const isMatch = await bcrypt.compare(password, hashedPassword);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            throw new UnauthenticatedError('Invalid credentials');
        }
        return isMatch;
    } catch (error) {
        console.error('Compare error:', error);
        if (error instanceof UnauthenticatedError) {
            throw error;
        }
        throw createHttpError(500, 'Error comparing passwords');
    }
};

