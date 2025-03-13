import User from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/unauthenticated.js";


/**
 * Middleware to authenticate user based on JWT token.
 * @param {Object} req - The request object 
 * @param {object} res - The response object 
 * @param {function} next - The next middleware function.
 */
const authenticateUser = async (req, res, next) => {
    try {
        // Log all headers to see what's coming in
        console.log('All Headers:', JSON.stringify(req.headers, null, 2));
        
        const authHeader = req.headers.authorization;
        console.log('Authorization Header:', authHeader);

        // Check if header exists
        if (!authHeader) {
            console.log('Missing Authorization header');
            throw new UnauthenticatedError('Authorization header missing');
        }

        // Check Bearer format
        if (!authHeader.startsWith('Bearer ')) {
            console.log('Invalid header format:', authHeader);
            throw new UnauthenticatedError('Invalid token format. Must start with Bearer');
        }

        // Extract and verify token
        const token = authHeader.split(' ')[1];
        console.log('Token:', token);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            const user = await User.findById(decoded.userId);
            console.log('Found user:', !!user, user?._id);

            if (!user) {
                throw new UnauthenticatedError('User not found');
            }

            req.user = user;
            next();
        } catch (jwtError) {
            console.error('JWT Error:', jwtError);
            throw new UnauthenticatedError('Invalid token');
        }
    } catch (error) {
        console.error('Auth Error:', error);
        next(error);
    }
};


export default authenticateUser;