import { validateRegister } from "./validation/index.js";
import { hashPassword, generateToken } from '../../helpers/index-helpers.js';
import User from '../../models/usermodel.js'
import { UnauthenticatedError } from '../../errors/unauthenticated.js';
import createHttpError from "http-errors";

/**
 * Register new user 
 * @param {object} userData - User registration data 
 * @returns {Promise<{user: object, token: string}>} User object and JWT token 
 * @throws {Error} if validation fails or user exists
 */
export const registerUser = async (userData) => {
    validateRegister(userData);

    // Extract the provided fields
    const { firstname, lastname, email, password } = userData;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createHttpError(400, 'Email already registered');
    }

    console.log('Hashing password for registration...');
    const hashedPassword = await hashPassword(password);

    // Create user with defaults for missing fields
    const user = await User.create({
        firstname,
        lastname,
        fullname: `${firstname} ${lastname}`,
        email,
        phone: userData.phone || '',
        password: hashedPassword,
        role: userData.role || 'Admin',
        isAuthenticated: true 
    });

    console.log('User created successfully:', user._id);
    const token = generateToken(user);

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<object>} User profile
 * @throws {Error} if user not found 
 */
export const getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw createHttpError(404, 'User not found');
    return user;
}