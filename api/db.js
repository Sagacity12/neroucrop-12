import mongoose from 'mongoose';

// Cache the database connection
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    // Log the DB_URI (with password masked for security)
    const maskedUri = process.env.DB_URI 
      ? process.env.DB_URI.replace(/:([^:@]+)@/, ':****@')
      : 'undefined';
    console.log(`Attempting to connect to MongoDB with URI: ${maskedUri}`);

    if (!process.env.DB_URI) {
      console.log('No DB_URI provided, skipping database connection');
      return null;
    }

    // Set MongoDB connection options optimized for serverless
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Reduce from default 100 for serverless
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    console.log('Connecting to MongoDB...');
    const client = await mongoose.connect(process.env.DB_URI, options);
    
    cachedDb = client;
    console.log('MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('MongoDB connection error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return null;
  }
} 