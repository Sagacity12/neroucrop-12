// This file is specifically for Vercel deployment
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from '../src/routes/routes.js';

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

// Try to connect to database in the background
if (process.env.DB_URI) {
  mongoose.connect(process.env.DB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    dbConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });
}

// Add routes
try {
  app.use(routes);
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
  
  // Fallback routes if main routes fail to load
  app.get('/', (req, res) => {
    res.status(200).json({ 
      message: 'AgricSmart API is running (fallback)',
      timestamp: new Date().toISOString(),
      dbConnected
    });
  });
}

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