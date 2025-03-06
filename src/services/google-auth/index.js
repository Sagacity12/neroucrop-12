import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../models/usermodel.js';
import { generateToken } from '../../helpers/index-helpers.js';
import createHttpError from 'http-errors';

/**
 * Configure Google OAuth Strategy
 */
export const setupGoogleStrategy = () => {
    const isProd = process.env.NODE_ENV === 'production';
    
    // Use Render's URL for production
    const callbackURL = isProd
        ? `${process.env.BACKEND_URL}/api/v1/auth/google/callback`
        : 'http://localhost:3000/api/v1/auth/google/callback';

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
        scope: ['profile', 'email']
    }, handleGoogleCallback));

    // Add debug log
   // console.log('Google OAuth URLs:', {
    //    auth: '/api/v1/auth/google',
    //    callback: '/api/v1/auth/google/callback'
    //});
};

/**
 * Handle Google OAuth callback
 */
const handleGoogleCallback = async (accessToken, refreshToken, profile, done) => {
    try {
        // Add detailed logging
        console.log('Google OAuth Data:', {
            accessToken: accessToken?.substring(0, 10) + '...',
            hasRefreshToken: !!refreshToken,
            profile: {
                id: profile.id,
                displayName: profile.displayName,
                email: profile.emails?.[0]?.value,
                photo: profile.photos?.[0]?.value
            }
        });

        console.log('Google callback received:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            profileId: profile.id,
            email: profile.emails?.[0]?.value
        });

        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            console.log('Creating new user from Google profile');
            user = await User.create({
                fullname: profile.displayName,
                email: profile.emails[0].value,
                username: profile.emails[0].value.split('@')[0],
                phone: '',
                password: '',
                role: 'Buyer',
                isAuthenticated: true,
                profilePic: profile.photos?.[0]?.value || '',
                googleId: profile.id
            });
        } else {
            console.log('Updating existing user with Google info');
            user.googleId = profile.id;
            user.isAuthenticated = true;
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        console.error('Google callback error:', error);
        return done(error, null);
    }
};

/**
 * Process successful Google authentication
 */
export const handleGoogleSuccess = async (req, res) => {
    try {
        const token = generateToken(req.user);
        
        // Always redirect to localhost:5173 
        const frontendURL = 'http://localhost:5173';
            
        // Redirect to frontend with token
        res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google auth success handler error:', error);
        throw createHttpError(500, 'Error processing Google authentication');
    }
};

/**
 * Initialize Passport configuration
 */
export const initializePassport = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    setupGoogleStrategy();
}; 