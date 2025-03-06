import mongoose from "mongoose";
import logger from '../../config/logger.js';

const connectDB = async (uri) => {
    try {
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true
        };

        const conn = await mongoose.connect(uri, options);
        logger.info('MongoDB Connected ');  // Simplified message

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        return conn;
    } catch (error) {
        logger.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;