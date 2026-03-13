import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['message', 'friend_request', 'system'], default: 'system' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;