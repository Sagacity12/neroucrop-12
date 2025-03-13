import { validateLogin } from '../services/user-services/validation/index.js';
import { 
    loginUser, 
    sendVerificationOTP, 
    verifyOTP, 
    logoutUser 
} from '../services/auth-services/index.js';
import createHttpError from 'http-errors';
import { validateRegister } from '../services/user-services/validation/index.js';
import { registerUser } from '../services/user-services/index.js';
import { 
    generatePasswordResetToken, 
    resetPassword 
} from '../services/auth-services/password-reset.js';

/**
 * Handle user login 
 * @param {Request} req - Express request object 
 * @param {Response} res - Express response object 
 */
export const login = async (req, res) => {
    try {
        // Validate request body
        validateLogin(req.body);
        
        // Debug log
        console.log('Login attempt with:', {
            email: req.body.email,
            passwordLength: req.body.password?.length
        });

        const { user, token } = await loginUser(req.body.email, req.body.password);

        // Set token in Authorization header
        res.setHeader('Authorization', `Bearer ${token}`);

        res.status(200).json({
            success: true,
            data: { 
                user,
                token  // Include token in response
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Send verification code 
 * @param {Request} req - Express request object 
 * @param {Response} res - Express response object 
 */
export const sendVerification = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw createHttpError(400, 'User ID is required');
    }

    // This generates and returns an OTP
    const result = await sendVerificationOTP(userId);

    res.status(200).json(result);
};

/**
 * Verify OTP code 
 * @param {Request} req - Express request object 
 * @param {Response} res - Express response object 
 */
export const verify = async (req, res) => {
    try {
        const { userId } = req.params;
        const { otp } = req.body;  // OTP must be in request body

        if (!userId || !otp) {
            throw createHttpError(400, 'User ID and OTP are required');
        }

        console.log('Verifying OTP:', { userId, otp });

        const result = await verifyOTP(userId, otp);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Verification error:', error);
        throw error;
    }
};

/**
 * Handle user logout 
 * @param {Request} req - Express request object 
 * @param {Response} res - Express response object 
 */
export const logout = async (req, res) => {
    const { userId } = req.user;

    const result = await logoutUser(userId);

    res.status(200).json(result);
};

/**
 * Get current authenticated user 
 * @param {Request} req - Express request object 
 * @param {Response} res - Express response object 
 */
export const getCurrentUser = async (req, res) => {
    // Log the request details
    console.log('Get Current User Request:', {
        hasUser: !!req.user,
        userId: req.user?._id
    });

    res.status(200).json({
        success: true,
        data: { user: req.user }
    });
};

/**
 * Handle user registration
 * @param {Request} req - Express request object 
 * @param {Response} res - Express response object 
 */
export const register = async (req, res) => {
    try {
        validateRegister(req.body);

        const { user, token } = await registerUser(req.body);

        // Log the registration details
        console.log('Registration Details:', {
            userId: user._id,
            hasToken: !!token,
            tokenStart: token ? token.substring(0, 20) + '...' : 'no token'
        });

        res.status(201).json({
            success: true,
            data: { user, token }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        throw error;
    }
};

/**
 * Handle forgot password request
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            throw createHttpError(400, 'Email is required');
        }

        const result = await generatePasswordResetToken(email);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

/**
 * Handle password reset
 */
export const handleResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            throw createHttpError(400, 'Token and new password are required');
        }

        const result = await resetPassword(token, password);

        res.status(200).json(result);
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
};