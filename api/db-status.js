import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    // Log environment variable status
    const hasDbUri = !!process.env.DB_URI;
    console.log(`DB_URI environment variable is ${hasDbUri ? 'set' : 'not set'}`);
    
    if (!hasDbUri) {
      return res.status(500).json({
        success: false,
        message: 'DB_URI environment variable is not set'
      });
    }
    
    // Mask the password for logging
    const maskedUri = process.env.DB_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`Attempting to connect to: ${maskedUri}`);
    
    // Try to connect with a short timeout
    const connection = await mongoose.createConnection(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    // Test the connection
    await connection.db.admin().ping();
    
    // Close the connection
    await connection.close();
    
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to MongoDB',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to MongoDB',
      error: error.message,
      errorName: error.name,
      timestamp: new Date().toISOString()
    });
  }
} 