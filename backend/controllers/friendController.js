/* --------------------------------------------------------------------------
   get pending friend requests
   - incoming (requests sent to user)
   - outgoing optional: (requests user sent)
   ------------------------------------------------------------------------- */

import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const getPendingRequests = async (req, res, next) => {
  try {
    const { type = "incoming" } = req.query; // 'incoming' or 'outgoing'
    let query = { type: "friend_request", isRead: false };

    if (type === "incoming") {
      query.userId = req.user.userId; // requests sent TO user
    } else if (type === "outgoing") {
      query.senderId = req.user.userId; // requests sent BY user
    }

    const requests = await Notification.find(query)
      .populate("senderId", "username firstName lastName profileImage status")
      .populate("userId", "username firstName lastName profileImage status")
      .sort({ createdAt: -1 }); // newest first Descending in DB

    return res.json({ success: true, requests, type });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   get mutual friends between current user and another user
   - useful for showing "X mutual friends" on profile
   ------------------------------------------------------------------------- */
export const getMutualFriends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.userId) // logged-in user
      .populate("friends", "_id");

    const otherUser = await User.findById(userId) // profile you're viewing
      .populate("friends", "_id");

    // Find mutual friends by checking intersection of friend lists
    if (!currentUser || !otherUser) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    // Find mutual friends by checking intersection of friend lists
    // ["x1", "x2", "x3"]
    const currentFriendIds = currentUser.friends.map((f) => f._id.toString());

    // filters otherUser's friends, keeping only ones that exist in currentFriendIds
    // result → [{ _id: "x2" }, { _id: "x3" }]
    const mutualFriends = otherUser.friends.filter((f) =>
      currentFriendIds.includes(f._id.toString()),
    );

    // Populate mutual friends with details
    const mutualFriendsDetails = await User.find({
      _id: { $in: mutualFriends.map((f) => f._id) },
    }).select("username firstName lastName profileImage status");

    return res.json({
      success: true,
      mutualFriends: mutualFriendsDetails,
      count: mutualFriendsDetails.length,
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   get suggested friends
   - users with mutual friends or similar interests
   - simple: random active users not already friends/blocked
   - advanced: ML-based recommendation
   - here: simple approach
   ------------------------------------------------------------------------- */
export const getSuggestedFriends = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const user = await User.findById(req.user.userId).select(
      "friends blockedUsers",
    ); // we only need friends and blockedUsers for filtering

    // Find users who are:
    // - not self
    // - not already friends
    // - not blocked
    // - active
    const suggestions = await User.find({
      _id: {
        $nin: [
          req.user.userId, // exclude self
          ...user.friends, // exclude friends
          ...user.blockedUsers, // exclude blocked users
        ],
      },
      isActive: true,
    })
      .select("username firstName lastName profileImage status") // only return public fields
      .limit(limit);
    return res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   remove friend (unfriend)
   - removes bidirectional friendship
   - no transaction needed if one fails (soft consistency OK)
   ------------------------------------------------------------------------- */
export const removeFriend = async (req, res, next) => {
  try {
    const { userId } = req.params; // friend to remove
    const user = await User.findById(req.user.userId); // logged-in user
    const friend = await User.findById(userId); // friend to remove

    // Check if both users exist
    if (!friend) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // Check if they are actually friends before trying to remove
    if (!user.friends.includes(userId)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Not friends" });
    }

    // Remove bidirectionally
    user.friends = user.friends.filter((id) => id.toString() !== userId);
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== req.user.userId,
    );

    await user.save();
    await friend.save();

    return res.json({ success: true, message: "Friend removed" });
  } catch (error) {
    next(error);
  }
};
