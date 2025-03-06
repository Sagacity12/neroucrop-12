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
        // Silently continue if .env file is not found in development
        console.log('No .env file found in development');
    }
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
            ? `${process.env.BACKEND_URL}/api/v1/auth/google/callback`
            : '/api/v1/auth/google/callback'
    }
};

// Validate required configuration
const requiredConfig = ['database.uri', 'jwt.secret'];
for (const path of requiredConfig) {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value) {
        throw new Error(`Missing required configuration: ${path}`);
    }
}

export default config; 