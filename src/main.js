import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Suppress MongoDB deprecation warnings
process.removeAllListeners('warning');

// Get the directory path and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

import startServer from './server/app.js';

startServer().catch(error => {
    console.error('Failed to start application:', error);
    process.exit(1);
});