import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

/**
 * Hash a password
 * @param {string} password - Plain password to hash
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
    try {
        console.log('Starting password hash...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed successfully');
        return hashedPassword;
    } catch (error) {
        throw createHttpError(500, 'Error hashing password');
    }
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain password to check
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} Whether the password matches
 */
export const comparePassword = async (password, hashedPassword) => {
    try {
        console.log('Helper comparing passwords:', {
            inputLength: password.length,
            storedLength: hashedPassword.length
        });
        const isMatch = await bcrypt.compare(password, hashedPassword);
        console.log('Helper password match:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Helper password comparison error:', error);
        throw createHttpError(500, 'Error comparing passwords');
    }
};

/**
 * Generate a JWT token
 * @param {Object} user - User object to generate token for
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw createHttpError(500, 'JWT_SECRET not configured');
    }
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}; 