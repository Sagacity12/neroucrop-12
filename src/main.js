// Load environment variables first, before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory path for reliable .env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  // console.log(`Loading environment from: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env file found, checking for environment variables');
}

// For development only - fallback values if environment variables are missing
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.DB_URI) {
    console.log('Using development fallback for DB_URI');
    process.env.DB_URI = 'mongodb+srv://neroucrop:Edward12@moses.tyv67.mongodb.net/neroucrop?retryWrites=true&w=majority&appName=MOSES';
  }
  
  if (!process.env.JWT_SECRET) {
    console.log('Using development fallback for JWT_SECRET');
    process.env.JWT_SECRET = 'fsTLNIrHOLtQICUpx8i2CJn47XTDCLfz';
  }
}

// Import express-async-errors before other imports
import 'express-async-errors';
import connectDB from './server/dbConnect/dbConnect.js';
import createExpressApp from './server/createExpressApp.js';
import http from 'http';

// Start the server with proper error handling
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB(process.env.DB_URI);
        
        // Create and configure Express app
        const app = createExpressApp();
        const server = http.createServer(app);
        
        // Add home route
        app.get('/', (_, res) => { 
            res.json({ message: 'AgricSmart API is running' });
        });
        
        // Start server
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();