// This file is specifically for Vercel deployment
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from '../src/server/dbConnect/dbConnect.js';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize database connection
let dbConnected = false;

// Add this near the top of your file
const logDbUri = () => {
  if (!process.env.DB_URI) {
    console.log('DB_URI is not defined in environment variables');
    return;
  }
  
  // Mask the password in the connection string for security
  const maskedUri = process.env.DB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`DB_URI is set to: ${maskedUri}`);
  
  // Log if the URI format looks correct
  const uriPattern = /^mongodb(\+srv)?:\/\/.+:.+@.+\/.+(\?.+)?$/;
  console.log(`DB_URI format is ${uriPattern.test(process.env.DB_URI) ? 'valid' : 'invalid'}`);
};

// Call this function before attempting connection
logDbUri();

// Then in your connection code
try {
  console.log('Attempting database connection...');
  
  // Add timeout for better debugging
  const connectionPromise = connectDB(process.env.DB_URI);
  
  // Log after 5 seconds if connection is still pending
  const timeoutId = setTimeout(() => {
    console.log('Database connection is taking longer than 5 seconds...');
  }, 5000);
  
  connectionPromise
    .then(connection => {
      clearTimeout(timeoutId);
      if (connection) {
        dbConnected = true;
        console.log('Database connection successful');
        // Log connection details
        console.log(`Connected to: ${connection.name}`);
        console.log(`Connection state: ${connection.readyState}`);
      } else {
        console.log('Database connection failed - connection object is null');
      }
    })
    .catch(err => {
      clearTimeout(timeoutId);
      console.error('Database connection error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      if (err.stack) console.error('Error stack:', err.stack);
    });
} catch (error) {
  console.error('Exception during database connection setup:', error);
}

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'AgricSmart API is running',
    timestamp: new Date().toISOString(),
    dbConnected
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test route is working',
    timestamp: new Date().toISOString(),
    dbConnected
  });
});

// API version route
app.get('/api/v1', (req, res) => {
  res.status(200).json({ 
    message: 'AgricSmart API v1',
    timestamp: new Date().toISOString(),
    dbConnected
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbConnected
  });
});

// Handle all other routes
app.all('*', (req, res) => {
  console.log(`Handling route: ${req.method} ${req.url}`);
  res.status(200).json({
    method: req.method,
    url: req.url,
    message: 'AgricSmart API - Route handler',
    timestamp: new Date().toISOString(),
    dbConnected
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Export the Express API
export default app; 