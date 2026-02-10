// User Model Schema
// Stores user account information, OAuth data, and verification status
// Includes password hashing pre-hook

import mongoose from "mongoose";
import { USER_STATUSES, VALIDATION_RULES } from "../config/constants";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be less than 30 characters"],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and dashes",
      ],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      // Not required for OAuth users
      required: function () {
        return this.provider === "local";
      },
      // Don't send password in queries by default
      select: false,
    },

    // Profile Info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name must be less than 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name must be less than 50 characters"],
    },

    profileImage: {
      type: String,
      default: null,
      // URL to user's profile picture (Cloudinary)
    },

    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio must not exceed 500 characters"],
    },

    // OAuth Information
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    providerId: {
      type: String,
      // Only set if user registered via OAuth
      default: null,
    },

    emailVerified: {
      type: Boolean,
      default: false,
      // For local auth, must be verified before using app
      // OAuth users: automatically verified by provider
    },

    verificationToken: {
      type: String,
      default: null,
      select: false, // Don't include in queries by default
    },

    verificationTokenExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    // User Status (online/offline/away)
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.OFFLINE,
    },

    // Last activity timestamp
    lastSeen: {
      type: Date,
      default: new Date(),
    },

    // Friends list (array of user IDs)
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Blocked users
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Account settings
    settings: {
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Timestamps
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtuals("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save hook: Hash password if modified
userSchema.pre("save", async function (next) {
  try {
    // Only hash if password is modified/new
    if (!this.isModified("password")) {
      return next();
    }

    // Hash password
    this.password = await hashPassword(this.password);
    logger.debug("Password hashed for user:", { userId: this._id });
    next();
  } catch (error) {
    logger.error("Error hashing password in pre-save hook", error);
    next(error);
  }
});

// Pre-save hook: Set verification token expiry for local auth
userSchema.pre("save", function (next) {
  try {
    if (this.provider === "local" && !this.emailVerified && !this.verificationToken) {
      // Set expiry to 24 hours from now
      this.verificationTokenExpiry =
        Date.now() + VALIDATION_RULES.VERIFICATION_TOKEN_EXPIRY;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method: Check if user has access to another user's data
userSchema.methods.canAccess = function (otherUserId) {
  // Users can access their own data
  if(this._id.toString() === otherUserId.toString()) {
    return true;
  }
  // User can access data of friends
  return this.friends.some((friendId) => friendId.toString() === otherUserId.toString());
};

// Method: Get user profile for public viewing
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    profileImage: this.profileImage,
    status: this.status,
    bio: this.bio,
  };
};


// Static method: Find by email or username
userSchema.statics.findByEmailOrUsername = function (emailOrUsername) {
  return this.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  });
};

// Static method: Find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

const User = mongoose.model('User', userSchema);

export default User;