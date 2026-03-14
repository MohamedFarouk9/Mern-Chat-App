import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants";
import User from "../models/User";
import Notification from "../models/Notification";

/* --------------------------------------------------------------------------
   get profile (own or another user's public profile)
   ------------------------------------------------------------------------- */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.userId; // if userId param exists, get that profile, otherwise get own profile
    const targetId = userId;

    const user = await User.findById(targetId);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // check access (friends or self)
    if (targetId !== req.user.userId && !user.canAccess(req.user.userId)) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ success: false, message: ERROR_MESSAGES.ACCESS_DENIED });
    }

    const profile = user.getPublicProfile();
    return res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   update profile
   ------------------------------------------------------------------------- */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, profileImage } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (profileImage) user.profileImage = profileImage; // assume URL from Cloudinary

    await user.save();
    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   search users
   ------------------------------------------------------------------------- */
export const searchUsers = async (req, res, next) => {
  try {
    const { query, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .select("username firstName lastName profileImage status") // only return public fields
      .limit(limit)
      .skip(skip);

    return res.json({ success: true, users, page, limit });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   get friends list
   ------------------------------------------------------------------------- */
export const getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "friends",
      "username firstName lastName profileImage status",
    );
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    return res.json({ success: true, friends: user.friends });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   send friend request
------------------------------------------------------------------------- */
export const sendFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const sender = await User.findById(req.user.userId);
    const receiver = await User.findById(userId);

    if (!receiver || !receiver.isActive) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    if (sender.friends.includes(userId)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Already friends" });
    }

    // check if request already sent
    const existingRequest = await Notification.findOne({
      userId: receiver._id,
      senderId: sender._id,
      type: "friend_request",
      isRead: false,
    });
    if (existingRequest) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Friend request already sent" });
    }

    // create notification
    await Notification.create({
      userId: receiver._id,
      senderId: sender._id,
      type: "friend_request",
    });

    return res.json({ success: true, message: "Friend request sent" });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   respond to friend request (accept/decline)
   ------------------------------------------------------------------------- */
export const respondToFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "accept" or "decline"
    const user = await User.findById(req.user.userId);

    const notification = await Notification.findById(requestId);
    if (
      !notification ||
      notification.type !== "friend_request" ||
      notification.userId.toString() !== req.user.userId
    ) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Friend request not found" });
    }

    // duplicate check to prevent accepting/declining same request multiple times !!!!
    if (notification.isRead) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Request already responded to" });
    }

    if (action === "accept") {
      // check if already friends
      if (user.friends.includes(notification.senderId.toString())) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: "Already friends" });
      }

      // use transaction for atomicity
      const session = await User.startSession();
      session.startTransaction();
      try {
        user.friends.push(notification.senderId);
        await user.save({ session });

        const sender = await User.findById(notification.senderId).session(
          session,
        );
        sender.friends.push(user._id);
        await sender.save({ session });

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
    // mark notification as read
    notification.isRead = true;
    await notification.save();

    return res.json({ success: true, message: `Friend request ${action}ed` });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   block user
   ------------------------------------------------------------------------- */
export const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user.userId);

    if (user.blockedUsers.includes(userId)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "User already blocked" });
    }

    user.blockedUsers.push(userId);
    await user.save();

    return res.json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   unblock user
   ------------------------------------------------------------------------- */
export const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params; // user to unblock
   
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { blockedUsers: userId },
    });

    return res.json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    next(error);
  }
};
