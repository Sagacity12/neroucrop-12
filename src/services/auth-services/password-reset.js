import crypto from 'crypto';
import User from '../../models/usermodel.js';
import { hashPassword } from '../../helpers/index-helpers.js';
import createHttpError from 'http-errors';

/**
 * Generate password reset token
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate reset token for user
 */
export const generatePasswordResetToken = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw createHttpError(404, 'User not found');
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetExpires = Date.now() + 3600000; // 1 hour

        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        return {
            success: true,
            message: 'Reset token generated',
            data: {
                resetToken,
                email: user.email
            }
        };
    } catch (error) {
        console.error('Generate reset token error:', error);
        throw error;
    }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, newPassword) => {
    try {
        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw createHttpError(400, 'Invalid or expired reset token');
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return {
            success: true,
            message: 'Password reset successful'
        };
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
}; 