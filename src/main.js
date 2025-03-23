// Suppress Node.js deprecation warnings
process.noDeprecation = true;

// Load environment variables first, before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory path for reliable .env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

// Silently load environment variables if .env exists
try {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Loaded environment variables from .env file');
  } else {
    console.log('No .env file found, using environment variables from the system');
  }
} catch (error) {
  console.log('Error loading .env file, using environment variables from the system');
}

// Import express-async-errors before other imports
import 'express-async-errors';
import startServerFunction from './server/app.js';

// For local development - use the imported startServer function
if (process.env.NODE_ENV !== 'production') {
  startServerFunction().catch(error => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
} else {
  startServerFunction();
}