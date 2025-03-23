import express from 'express';
import mongoose from 'mongoose';

const app = express();

// Memory usage endpoint
app.get('/memory', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`,
    timestamp: new Date().toISOString()
  });
});

// Node info endpoint
app.get('/node-info', (req, res) => {
  res.status(200).json({
    node: process.version,
    env: process.env.NODE_ENV,
    platform: process.platform,
    arch: process.arch,
    timestamp: new Date().toISOString()
  });
});

// DB connection test
app.get('/db-test', async (req, res) => {
  try {
    if (process.env.DB_URI) {
      await mongoose.connect(process.env.DB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      
      res.status(200).json({
        message: 'Database connection successful',
        dbName: mongoose.connection.name,
        timestamp: new Date().toISOString()
      });
      
      // Close connection after response
      await mongoose.disconnect();
    } else {
      res.status(500).json({
        error: 'DB_URI not defined',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Fallback route
app.all('*', (req, res) => {
  res.status(200).json({
    message: 'Diagnostics API',
    endpoints: ['/memory', '/node-info', '/db-test'],
    timestamp: new Date().toISOString()
  });
});

export default app; 