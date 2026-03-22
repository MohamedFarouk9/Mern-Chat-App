import Notification from "../models/Notification.js";

/**
 * Create a notification
 * @param {string} userId - recipient user id
 * @param {string} type - 'message' | 'friend_request' | 'system'
 * @param {string} senderId - sender user id (optional)
 * @param {string} messageId - message id (optional)
 */

export const createNotification = async (
  userId,
  type,
  senderId = null,
  messageId = null,
) => {
  try {
    return await Notification.create({ userId, type, senderId, messageId });
  } catch (error) {
    logger.error("Error creating notification", error);
    throw error;
  }
};

/**
 * Create message notification
 */
export const createMessageNotification = async (
  userId,
  senderId,
  messageId,
) => {
  return  await createNotification(userId, "message", senderId, messageId);
};

/**
 * Create friend request notification
 */
export const createFriendRequestNotification = async (userId, senderId) => {
  return await createNotification(userId, "friend_request", senderId);
};

/**
 * Create system notification
 */
export const createSystemNotification = async (userId, content) => {
  return await createNotification(userId, "system", null, null);
};
