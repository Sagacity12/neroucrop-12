import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Only try to load .env file in development
if (process.env.NODE_ENV !== 'production') {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const envPath = join(__dirname, '..', '..', '.env');
        dotenv.config({ path: envPath });
    } catch (error) {
        // Silently continue if .env file is not found
        console.log('No .env file found, using environment variables');
    }
}

// Check if required environment variables are set
const requiredEnvVars = ['DB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
        console.error('Make sure to set these in your Render dashboard under Environment Variables');
    } else {
        console.error('Make sure these are set in your .env file or environment');
    }
    process.exit(1);
}

const config = {
    database: {
        uri: process.env.DB_URI
    },
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    jwt: {
        secret: process.env.JWT_SECRET
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? `${process.env.BACKEND_URL || ''}/api/v1/auth/google/callback`
            : '/api/v1/auth/google/callback'
    }
};

export default config; 