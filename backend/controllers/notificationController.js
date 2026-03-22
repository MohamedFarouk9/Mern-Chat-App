import { HTTP_STATUS } from "../config/constants";
import Notification from "../models/Notification";

/* --------------------------------------------------------------------------
   get notifications for user
   - paginated, sorted by newest
   - excludes deleted
   ------------------------------------------------------------------------- */
export const getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.userId })
      .populate("senderId", "username firstName lastName profileImage")
      .populate("messageId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Notification.countDocuments({
      userId: req.user.userId,
    });
    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false,
    });

    return res.json({
      success: true,
      notifications,
      pagination: { page, limit, total },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   mark single notification as read
   ------------------------------------------------------------------------- */
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification || notification.userId.toString() !== req.user.userId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   mark all notifications as read
   ------------------------------------------------------------------------- */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { $set: { isRead: true } },
    );
    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   delete notification
   - soft delete or hard delete (choose based on retention policy)
   - here: hard delete
   ------------------------------------------------------------------------- */
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification || notification.userId.toString() !== req.user.userId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Notification not found" });
    }

    await Notification.findByIdAndDelete(notificationId);

    return res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};
