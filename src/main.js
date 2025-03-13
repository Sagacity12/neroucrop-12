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
    console.log('Missing DB_URI environment variable');
  }
  
  if (!process.env.JWT_SECRET) {
    console.log('Missing JWT_SECRET environment variable');
  }
}

// Import express-async-errors before other imports
import 'express-async-errors';
import connectDB from './server/dbConnect/dbConnect.js';
import createExpressApp from './server/createExpressApp.js';
import http from 'http';

// Create the Express app
const app = createExpressApp();

// Connect to MongoDB (only once)
let isConnected = false;

// For Vercel serverless functions
export default async function handler(req, res) {
  // Check for required environment variables
  if (!process.env.DB_URI) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: Missing database connection string'
    });
  }

  // Connect to MongoDB if not already connected
  if (!isConnected) {
    try {
      await connectDB(process.env.DB_URI);
      isConnected = true;
      console.log('MongoDB Connected');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed' 
      });
    }
  }
  
  // Forward the request to the Express app
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      // Check for required environment variables
      if (!process.env.DB_URI) {
        throw new Error('Missing DB_URI environment variable');
      }
      
      // Connect to MongoDB
      await connectDB(process.env.DB_URI);
      
      // Create HTTP server
      const server = http.createServer(app);
      
      // Start server
      const PORT = process.env.PORT || 3000;
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  };
  
  startServer();
}