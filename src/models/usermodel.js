//import { ref, required } from "joi";
import mongoose from "mongoose";
import { comparePassword } from '../helpers/index-helpers.js';

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [false, "Fullname is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    googleId: {
      type: String,
      sparse: true
    },
    password: {
      type: String,
      required: function() {
        // Password only required if not using OAuth
        return !this.googleId;
      },
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Seller", "Buyer", "Educator"],
      required: true,
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    },
    profilePic: {
      type: String,
      default: "null"
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    }
  },
  { timestamps: true },
);

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log('Model comparing password for:', this.email);
    const isMatch = await comparePassword(candidatePassword, this.password);
    console.log('Model password match:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Model password comparison error:', error);
    throw error;
  }
};

const authSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
});

export const auth = mongoose.model("Auth", authSchema);

const User = mongoose.model("User", userSchema);

export default User;
