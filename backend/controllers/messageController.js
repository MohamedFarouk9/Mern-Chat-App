import { HTTP_STATUS } from "../config/constants";
import Conversation from "../models/Conversation";
import Message from "../models/Message";

/* --------------------------------------------------------------------------
   get user conversations
   ------------------------------------------------------------------------- */
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.getUserConversations(
      req.user.userId,
    );
    return res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   get single conversation with messages
   ------------------------------------------------------------------------- */
export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query; // for pagination

    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "username firstName lastName profileImage status",
    );

    if (
      !conversation ||
      !conversation.participants.some(
        (p) => p._id.toString() === req.user.userId,
      )
    ) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Conversation not found" });
    }

    const query = { conversationId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .populate("senderId", "username firstName lastName profileImage")
      .sort({ createdAt: -1 }) //Descending in DB
      .limit(limit);
    // We reverse messages to return them in chronological order (oldest first) Ascending in UI
    return res.json({
      success: true,
      conversation,
      messages: messages.reverse(),
    }); //
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   send message
   ------------------------------------------------------------------------- */
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, messageType, imageUrl } = req.body;
    const senderId = req.user.userId;

    // Find or create conversation
    let conversation = await Conversation.findOrCreateConversation(
      senderId,
      receiverId,
    );

    const message = await message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      content,
      messageType: messageType || "text",
      imageUrl,
    });

    // update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = message.createdAt;
    await conversation.save();

    // populate for response
    await message.populate(
      "senderId",
      "username firstName lastName profileImage",
    );

    return res.status(HTTP_STATUS.CREATED).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   edit message
   ------------------------------------------------------------------------- */
export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message || message.senderId.toString() !== req.user.userId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Message not found or unauthorized" });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   delete message (soft delete)
   ------------------------------------------------------------------------- */
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message || message.senderId.toString() !== req.user.userId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Message not found or unauthorized" });
    }

    message.isDeleted = true;
    await message.save();

    return res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   mark message as read
   ------------------------------------------------------------------------- */
export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message || message.receiverId.toString() !== req.user.userId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Message not found or unauthorized" });
    }

    await message.markAsRead();
    return res.json({ success: true, message: "Message marked as read" });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   add reaction
   ------------------------------------------------------------------------- */
export const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Message not found" });
    }

    await message.addReaction(req.user.userId, emoji);
    return res.json({ success: true, message: "Reaction added" });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   remove reaction
   ------------------------------------------------------------------------- */
export const removeReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Message not found" });
    }

    await message.removeReaction(req.user.userId, emoji);
    return res.json({ success: true, message: "Reaction removed" });
  } catch (error) {
    next(error);
  }
};
