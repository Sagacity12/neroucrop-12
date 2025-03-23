import mongoose from "mongoose";
import { comparePassword } from '../helpers/index-helpers.js';
//import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, 'Please provide a firstname'],
      maxlength: 50,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 50,
      trim: true,
      required: [true, 'Please provide a lastname'],
    },
    //  fullname field temporarily for backward compatibility
    fullname: {
      type: String,
      required: false,
      sparse: true, // Allow null values without uniqueness conflicts
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
    },
    phone: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['Admin', 'Seller', 'Buyer', 'Educator'],
      default: 'Admin', // Default role is Admin
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationOTP: String,
    verificationOTPExpires: Date,
  },
  { timestamps: true },
);

// a pre-save hook to generate fullname from firstname and lastname
userSchema.pre('save', function(next) {
  if (this.firstname && this.lastname) {
    this.fullname = `${this.firstname} ${this.lastname}`;
  }
  next();
});

// Instead of using both unique: true in the schema and this explicit index,
// I'll just use the explicit index for more control
// userSchema.index({ email: 1 }, { unique: true });

// Create index for googleId
userSchema.index({ googleId: 1 });

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
