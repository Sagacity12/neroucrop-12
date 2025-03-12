import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../models/usermodel.js';
import { generateToken } from '../../helpers/index-helpers.js';
import createHttpError from 'http-errors';

/**
 * Configure Google OAuth Strategy
 */
const setupGoogleAuth = () => {
    // Verify Google credentials exist
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials missing');
    }

    const callbackURL = process.env.NODE_ENV === 'production'
        ? 'https://neroucrop-12.vercel.app/api/v1/auth/google/callback'
        : 'http://localhost:3000/api/v1/auth/google/callback';

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: callbackURL,
                scope: ['profile', 'email'],
                passReqToCallback: true // This allows us to pass the request object to the callback
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    if (!profile || !profile.emails || !profile.emails[0].value) {
                        return done(new Error('Invalid profile data from Google'));
                    }

                    let user = await User.findOne({ 
                        $or: [
                            { email: profile.emails[0].value },
                            { googleId: profile.id }
                        ]
                    });

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
                            googleId: profile.id,
                            authProvider: 'google'
                        });
                    } else {
                        // Update existing user with Google info if needed
                        user.googleId = profile.id;
                        user.isAuthenticated = true;
                        user.authProvider = 'google';
                        await user.save();
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
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
        if (!req.user) {
            throw createHttpError(401, 'Authentication failed');
        }

        const token = generateToken(req.user);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Redirect with token in query params
        const redirectURL = new URL('/auth/callback', frontendURL);
        redirectURL.searchParams.set('token', token);
        
        res.redirect(redirectURL.toString());
    } catch (error) {
        // Redirect to frontend with error
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectURL = new URL('/auth/error', frontendURL);
        redirectURL.searchParams.set('error', error.message);
        
        res.redirect(redirectURL.toString());
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
            done(error);
        }
    });

    setupGoogleAuth();
};

export default setupGoogleAuth; 