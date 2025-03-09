import mongoose from "mongoose";

const connectDB = async (uri) => {
    try {
        // Connect with minimal options
        await mongoose.connect(uri);
        console.log('MongoDB Connected');
        return mongoose.connection;
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;