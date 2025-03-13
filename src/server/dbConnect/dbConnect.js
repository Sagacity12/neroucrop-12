import mongoose from "mongoose";

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB Connected');
        return mongoose.connection;
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};

export default connectDB;