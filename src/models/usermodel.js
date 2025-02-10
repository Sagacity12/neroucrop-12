//import { ref, required } from "joi";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "User name is required"],
      unique: [true, "User name must be unique"],
      trim: true,
      maxlength: [50, "User name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },

    role: {
      type: String,
      enum: ["Admin", "Seller", "Buyer", "Educator"],
      required: true,
    },

    profilePic: {
      type: String,
      default: "null",
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const authSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  otp: {
    type: String,
  },
  expiresIn: {
    type: Date,
    default: () => Date.now() + 60000,
  },
});

export const auth = mongoose.model("Auth", authSchema);

export default mongoose.model("User", userSchema);
