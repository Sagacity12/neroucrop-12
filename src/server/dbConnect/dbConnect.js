import mongoose from "mongoose";

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000 // 30 seconds timeout
        });
        return mongoose.connection;
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};

export default connectDB;