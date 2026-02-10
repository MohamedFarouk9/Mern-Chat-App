// Message Model Schema
// Stores chat messages between users
// Tracks message status: sent, delivered, read

import mongoose from "mongoose";
import { MESSAGE_STATUSES, MESSAGE_TYPES } from "../config/constants.js";

const messageSchema = new mongoose.Schema(
  {
    // Participants
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
    },

    // Conversation reference
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
    },

    // Message Content
    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: [5000, "Message cannot exceed 5000 characters"],
      trim: true,
    },

    // Message Type (text, image, emoji, file)
    messageType: {
      type: String,
      enum: Object.values(MESSAGE_TYPES),
      default: MESSAGE_TYPES.TEXT,
    },

    // Image URL (if messageType is 'image', stored in Cloudinary)
    imageUrl: {
      type: String,
      default: null,
    },

    // File URL (if messageType is 'file')
    fileUrl: {
      type: String,
      default: null,
    },

    // File metadata
    fileMetadata: {
      filename: String,
      size: Number,
      mimeType: String,
    },

    // Message Status Tracking
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUSES),
      default: MESSAGE_STATUSES.SENT,
    },

    // Timestamp when message was delivered to user
    deliveredAt: {
      type: Date,
      default: null,
    },

    // Timestamp when user read the message
    readAt: {
      type: Date,
      default: null,
    },

    // Is message deleted (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // For edited messages
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    // Reply to another message (threading)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Emoji reactions
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: String, // e.g., '😀', '❤️'
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 }); // -1 for Descendinga order
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ conversationId: 1, readAt: 1 }); // For unread count

// Virtual: Is message read
messageSchema.virtual("isRead").get(function () {
  return this.status === MESSAGE_STATUSES.READ || this.readAt !== null;
});

// Pre-save: Update status timestamps
messageSchema.pre("save", function (next) {
  try {
    // If status changed to delivered, set deliveredAt
    if (
      this.isModified("status") &&
      this.status === MESSAGE_STATUSES.DELIVERED
    ) {
      this.deliveredAt = new Date();
    }

    // If status changed to read, set readAt
    if (this.isModified("status") && this.status === MESSAGE_STATUSES.READ) {
      this.readAt = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method: Mark message as delivered
messageSchema.methods.markAsDelivered = function () {
  if (this.status === MESSAGE_STATUSES.SENT) {
    this.status = MESSAGE_STATUSES.DELIVERED;
    this.deliveredAt = new Date();
    return this.save();
  }
  return Promise.resolve();
};

// Method: Mark message as read
messageSchema.methods.markAsRead = function () {
  if (this.status !== MESSAGE_STATUSES.READ) {
    this.status = MESSAGE_STATUSES.READ;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve();
};

// Method: Add emoji reaction
messageSchema.methods.addReaction = function (userId, emoji) {
  // Check if user already reacted with this emoji
  const existingReaction = this.reactions.find(
    (r) => r.userId.toString() === userId.toString() && r.emoji === emoji,
  );

  if (!existingReaction) {
    return Promise.resolve(); // No duplicate reactions Already reacted
  }

  this.reactions.push({ userId, emoji });
  return this.save();
};

// Method: Remove emoji reaction
messageSchema.methods.removeReaction = function (userId, emoji) {
  this.reactions = this.reactions.filter(
    (r) => !(r.userId.toString() === userId.toString() && r.emoji === emoji),
  );
  return this.save();
};

// Static method: Get unread count for user
messageSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    receiverId: userId,
    status: { $ne: MESSAGE_STATUSES.READ },
    isDeleted: false,
  });
};

// Static method: Mark all messages as read for conversation
messageSchema.statics.markConversationAsRead = function (
  conversationId,
  userId,
) {
  return this.updateMany(
    {
      conversationId,
      receiverId: userId,
      status: { $ne: MESSAGE_STATUSES.READ },
    },
    {
      status: MESSAGE_STATUSES.READ,
      readAt: new Date(),
    },
  );
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
