// Users - This is my primary collection, storing user profiles with:

// Basic info (name, email, password hash, profile picture)
// Academic info (subjects, education level)
// Goals (exam prep, job search, specific learning targets)
// Preferences (study times, communication preferences)
// Skills/expertise areas (to help with matching)
// User activity (last login, progress tracking)
// User settings (notification preferences, privacy settings)
// User roles (admin, user, etc.)

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    nickname: {
      type: String,
      default: null,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    accountVerified: { type: Boolean, default: false },
    verificationCode: Number,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profilePicture: {
      url: {
        type: String,
        default: null
      },
      fileId:{
        type:String,
        default: null
      }
    },
    subjects: [
      {
        name: { type: String },
        proficiency: {
          type: String,
          enum: ["beginner", "intermediate", "advanced"],
          default: "beginner",
        },
      },
    ],

    educationLevel: {
      type: String,
      enum: ["high school", "college", "graduate", "professional", "other"],
      default: null,
    },

    friends: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["active", "blocked"],
          default: "active",
        },
      },
    ],
    friendRequests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected", "blocked"],
          default: "pending",
        },
      },
    ],
    sentFriendRequests: [
      {
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected", "blocked"],
          default: "pending",
        },
      },
    ],
    groups: [
      {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
       
      },
    ],

    skills: [
      {
        name: { type: String },
      },
    ],
    activity: {
      lastLogin: { type: Date, default: Date.now },
      totalStudyTime: { type: Number, default: 0 }, // in minutes
      progress: [
        {
          subject: { type: String },
          percentage: { type: Number, min: 0, max: 100 },
        },
      ],
    },

    roles: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ "subjects.name": 1 });
userSchema.index({ "friends.status": 1 });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.password && this.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  if (this.username && this.username.length < 3) {
    throw new Error("Username must be at least 3 characters long");
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  function generateRandomCode() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(4, "0"); // 5 digits
    return parseInt(`${firstDigit}${remainingDigits}`, 10);
  }
  this.verificationCode = generateRandomCode();
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  console.log(this.verificationCodeExpires);
   // 10 minutes expiration
  return this.verificationCode;
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, username: this.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "5d",
    }
  );
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
