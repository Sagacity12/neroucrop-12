import mongoose from "mongoose";
import logger from '../../config/logger.js';

const connectDB = async (uri) => {
    try {
        // Simplified logging
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000
        });
        
        logger.info('MongoDB Connected');
        return conn;
    } catch (error) {
        // Only log essential error info
        logger.error(`MongoDB connection failed: ${error.message}`);
        
        // In development, show more details
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }
        
        process.exit(1);
    }
};

export default connectDB;