// This file is specifically for Vercel deployment
import 'express-async-errors';
import dotenv from 'dotenv';
import createExpressApp from '../src/server/createExpressApp.js';
import connectDB from '../src/server/dbConnect/dbConnect.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = createExpressApp();

// Connect to MongoDB
connectDB(process.env.DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Export for Vercel
export default app; 