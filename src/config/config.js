import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '..', '.env');

dotenv.config({ path: envPath });

const config = {
    database: {
        uri: process.env.DB_URI
    },
    server: {
        port: process.env.PORT || 3000
    },
    jwt: {
        secret: process.env.JWT_SECRET
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