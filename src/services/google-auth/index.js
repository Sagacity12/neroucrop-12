import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../models/usermodel.js';
import { generateToken } from '../../helpers/index-helpers.js';
import createHttpError from 'http-errors';

/**
 * Configure Google OAuth Strategy
 */
const setupGoogleAuth = () => {
    // Check if Google OAuth environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn('Google OAuth credentials not found. Google authentication will not work.');
        return;
    }

    // Get the callback URL based on environment
    const callbackURL = process.env.NODE_ENV === 'production'
        ? 'https://neroucrop-12.vercel.app/api/v1/auth/google/callback'
        : 'http://localhost:3000/api/v1/auth/google/callback';

    // Configure Google Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: callbackURL,
                scope: ['profile', 'email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (!user) {
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
                        user.googleId = profile.id;
                        user.isAuthenticated = true;
                        await user.save();
                    } 

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    // User serialization/deserialization code
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
};

/**
 * Process successful Google authentication
 */
export const handleGoogleSuccess = async (req, res) => {
    try {
        const token = generateToken(req.user);
        const frontendURL = 'http://localhost:5173';
        res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    } catch (error) {
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

    // Only set up Google auth if credentials exist
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        setupGoogleAuth();
    }
};

export default setupGoogleAuth; 