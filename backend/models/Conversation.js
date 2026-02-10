// Conversation Model Schema
// Represents a chat conversation between two users
// Stores latest message and participant info

import mongoose from "mongoose";
import logger from "../utils/logger.js";

const conversationSchema = new mongoose.Schema(
  {
    // Participants in conversation
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Reference to last message
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Last message timestamp (for sorting conversations)
    lastMessageTime: {
      type: Date,
      default: new Date(),
    },

    // Conversation name (for group chats in future)
    name: {
      type: String,
      default: null,
    },

    // Conversation avatar (for group chats)
    avatar: {
      type: String,
      default: null,
    },

    // Conversation type (for future multi-user support)
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    // Muted conversations (user won't get notifications)
    mutedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Archived conversations
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Conversation metadata
    metadata: {
      messageCount: {
        type: Number,
        default: 0,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding conversation between two users
// Ensures uniqueness for 1-on-1 chats
conversationSchema.index(
  { participants: 1 },
  {
    unique: true,
    sparse: true, // Allow null values
    name: "unique_participants_direct_chat",
  }
);

// Index for sorting conversations by latest message
conversationSchema.index({ lastMessageTime: -1 });

// Index for user's conversations
conversationSchema.index({ "participants._id": 1 });

// Pre-save: Ensure 2 participants are sorted for consistency
conversationSchema.pre("save", function (next) {
  try {
    if (this.type === "direct" && this.participants.length === 2) {
      // Sort participants for consistency
      this.participants.sort((a, b) => {
        return a.toString().localeCompare(b.toString());
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Static method: Find or create conversation between two users
conversationSchema.statics.findOrCreateConversation = async function (
  userId1,
  userId2
) {
  try {
    // Ensure consistent order
    const participants = [userId1, userId2].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    // Find existing conversation
    let conversation = await this.findOne({
      participants: { $all: participants },
      type: "direct",
    });

    // Create if doesn't exist
    if (!conversation) {
      logger.debug("Creating new conversation", { participants });
      conversation = await this.create({
        participants,
        type: "direct",
        metadata: {
          createdBy: userId1,
        },
      });
    }

    return conversation;
  } catch (error) {
    logger.error("Error finding or creating conversation", error);
    throw error;
  }
};

// Static method: Get all conversations for user (excluding archived)
conversationSchema.statics.getUserConversations = function (userId) {
  return this.find({
    participants: userId,
    archivedBy: { $ne: userId }, // Not archived by this user
  })
    .populate("participants", "username firstName lastName profileImage status")
    .populate("lastMessage")
    .sort({ lastMessageTime: -1 }); // Most recent first
};

// Method: Toggle mute for user
conversationSchema.methods.toggleMute = function (userId) {
  const index = this.mutedBy.indexOf(userId);
  if (index > -1) {
    this.mutedBy.splice(index, 1); // Remove (unmute)
  } else {
    this.mutedBy.push(userId); // Add (mute)
  }
  return this.save();
};

// Method: Toggle archive for user
conversationSchema.methods.toggleArchive = function (userId) {
  const index = this.archivedBy.indexOf(userId);
  if (index > -1) {
    this.archivedBy.splice(index, 1); // Remove (unarchive)
  } else {
    this.archivedBy.push(userId); // Add (archive)
  }
  return this.save();
};

// Method: Check if conversation is muted for user
conversationSchema.methods.isMutedFor = function (userId) {
  return this.mutedBy.some((id) => id.toString() === userId.toString());
};

// Method: Check if conversation is archived for user
conversationSchema.methods.isArchivedFor = function (userId) {
  return this.archivedBy.some((id) => id.toString() === userId.toString());
};

// Method: Get other participant for 1-on-1 chat
conversationSchema.methods.getOtherParticipant = function (userId) {
  if (this.type !== "direct") {
    return null;
  }
  return this.participants.find((id) => id.toString() !== userId.toString());
};

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
