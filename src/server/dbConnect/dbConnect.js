import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();

const connectDB = async (url) => {
    if (!url) {
        console.error("DB_URI is not defined in the enviroment variables");
        process.exit(1);
    }
    await mongoose.connect(url, {});
    console.log("Connected to the database");
};

export default connectDB