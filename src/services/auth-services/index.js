import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import User from '../../models/usermodel.js';
import Auth from '../../models/authmodel.js';
import { UnauthenticatedError } from '../../errors/unauthenticated.js';
import createHttpError from 'http-errors';
import { comparePassword, generateToken } from '../../helpers/index-helpers.js';


/**
 * Generate secure OTP for authentication 
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        if (!otp) {
            throw createHttpError(500, 'OTP generation failed');
        }
        return otp;
    } catch (error) {
        throw createHttpError(500, 'Error generating OTP');
    }
};

/**
 * Verify user credentials and generate token 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object, token: string }>}
 */
export const loginUser = async (email, password) => {
    try {
        // Debug log
        console.log('Finding user:', email);

        // Find user with password included
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found:', email);
            throw new UnauthenticatedError('Invalid credentials');
        }

        console.log('User found, comparing password');

        // Use the model's comparePassword method
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Password validation failed');
            throw new UnauthenticatedError('Invalid credentials');
        }

        console.log('Password valid, generating token');
        const token = generateToken(user);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return { user: userResponse, token };
    } catch (error) {
        console.error('Login service error:', error);
        throw error;
    }
};



/**
 * Verify authentication token 
 * @param {string} token - JWT token
 * @returns {Promise<object>} Decoded token data with user
 */
export const verifyToken = async (token) => {
    if (!token) {
        throw new UnauthenticatedError('Authentication required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new UnauthenticatedError('User not found');
        }

        if (!user.isAuthenticated) {
            throw new UnauthenticatedError('Account not verified');
        }

        return { user, decoded };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthenticatedError('Invalid token');
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthenticatedError('Token expired');
        }
        throw error;
    }
};

/**
 * Send verification OTP 
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, message: string, otp: string}>}
 */
export const sendVerificationOTP = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const otp = generateOTP();
    
    // Clear existing auth records
    await Auth.deleteMany({ userId });

    // Create new auth record
    await Auth.create({
        userId,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    return {
        success: true,
        message: 'Verification code sent',
        otp // This is returned for testing - remove in production
    };
};

/**
 * Verify OTP and authenticate user 
 * @param {string} userId - User ID 
 * @param {string} otp - OTP to verify 
 * @returns {Promise<{success: boolean, token: string}>}
 */
export const verifyOTP = async (userId, otp) => {
    // Find the auth record with matching userId and OTP
    const authRecord = await Auth.findOne({
        userId,
        otp,
        expiresAt: { $gt: new Date() }  // Make sure OTP hasn't expired
    });

    if (!authRecord) {
        throw new UnauthenticatedError('Invalid or expired verification code');
    }

    // Update user to verified status
    const user = await User.findByIdAndUpdate(
        userId,
        { isAuthenticated: true },
        { new: true }
    );

    // Remove the used OTP
    await Auth.deleteOne({ _id: authRecord._id });

    // Generate new token
    const token = generateToken(user);

    return {
        success: true,
        token
    };
};

/**
 * Logout user and invalidate token
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const logoutUser = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        lastLogout: new Date()
    });

    return {
        success: true,
        message: 'Logged out successfully'
    };
};

export const handleGoogleAuth = async (profile) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            user = await User.create({
                fullname: profile.displayName,
                email: profile.emails[0].value,
                username: profile.emails[0].value.split('@')[0],
                googleId: profile.id,
                isAuthenticated: true,
                role: 'Buyer'
            });
        }

        const token = generateToken(user);

        return { user, token };
    } catch (error) {
        console.error('Google auth error:', error);
        throw error;
    }
};