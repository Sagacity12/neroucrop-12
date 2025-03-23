// This file is specifically for Vercel deployment
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

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

// Connect to MongoDB - make it optional for initial testing
let dbConnected = false;
try {
  if (process.env.DB_URI) {
    mongoose.connect(process.env.DB_URI)
      .then(() => {
        console.log('MongoDB connected');
        dbConnected = true;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
      });
  } else {
    console.log('No DB_URI provided, skipping database connection');
  }
} catch (error) {
  console.error('Error in MongoDB connection setup:', error);
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