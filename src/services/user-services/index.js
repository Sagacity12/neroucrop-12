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

    const { fullname, username, email, phone, password, role } = userData;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }, { phone }]
    });

    if (existingUser) {
        if (existingUser.email === email) throw createHttpError(400, 'Email already registered');
        if (existingUser.username === username) throw createHttpError(400, 'Username already taken');
        if (existingUser.phone === phone) throw createHttpError(400, 'Phone number already registered');
    }

    console.log('Hashing password for registration...');
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        ...userData,
        password: hashedPassword,
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