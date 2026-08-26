import { Server } from "socket.io";
import { verifyToken } from "../utils/tokenUtil.js";
import User from "../models/User.js";
import { SOCKET_EVENTS } from "../config/constants.js";
import logger from "../utils/logger.js";

// Track online users: { userId: socketId }
const onlineUsers = new Map();

// Track typing users: { conversationId: [userId1, userId2, ...] }
const typingUsers = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  /* --------------------------------------------------------------------------
    Socket Middleware: Authenticate connection
    -------------------------------------------------------------------------- */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Missing authentication token"));
      }

      const decoded = verifyToken(token);
      //No need to send userId from frontend anymore. We can get it from the token and trust it since it's signed by our server.
      socket.userId = decoded.userId; // Attach userId to socket for later use
      logger.info("Socket authenticated", {
        userId: decoded.userId,
        socketId: socket.id,
      });
      next();
    } catch (error) {
      logger.error("Socket authentication error", error);
      next(new Error("Authentication failed: " + error.message));
    }
  });

  /* --------------------------------------------------------------------------
     Connection Event
     -------------------------------------------------------------------------- */
  io.on(SOCKET_EVENTS.CONNECT, async (socket) => {
    logger.info("User connected", {
      userId: socket.userId,
      socketId: socket.id,
    });

    // Track online user
    onlineUsers.set(socket.userId, socket.id);

    //update user status in database
    await User.findByIdAndUpdate(socket.userId, {
      status: "online",
      lastSeen: new Date(),
    });

    // Broadcast user online status  [emit() (The Sender)]
    io.emit(SOCKET_EVENTS.USER_STATUS_CHANGED, {
      userId: socket.userId,
      status: "online",
    });

    /* --------------------------------------------------------------------------
       Message Events
       -------------------------------------------------------------------------- */

    // Send message   socket.on() (The Listener)
    socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data) => {
      try {
        const { receiverId, content, messageType, imageUrl, conversationId } =
          data;

        logger.info("Message sent", { senderId: socket.userId, receiverId });

        // Emit to receiver
        if (onlineUsers.has(receiverId)) {
          io.to(onlineUsers.get(receiverId)).emit(
            SOCKET_EVENTS.MESSAGE_RECEIVE,
            {
              senderId: socket.userId,
              content,
              messageType,
              imageUrl,
              conversationId,
              timestamp: new Date(),
            },
          );
        }
      } catch (error) {
        logger.error("Error sending message", error);
      }
    });

    // Message delivered
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, (data) => {
      const { senderId, messageId } = data;
      if (onlineUsers.has(senderId)) {
        //io.to() (The Targeter) private message. It finds the specific socket ID for the sender and emits
        //the MESSAGE_DELIVERED event back to that socket, along with the messageId.
        //This allows the sender's client to update the message status to "delivered" in real-time.
        io.to(onlineUsers.get(senderId)).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
          messageId,
        });
      }
    });

    // Message read
    socket.on(SOCKET_EVENTS.MESSAGE_READ, (data) => {
      const { senderId, messageId, conversationId } = data;
      if (onlineUsers.has(senderId)) {
        io.to(onlineUsers.get(senderId)).emit(SOCKET_EVENTS.MESSAGE_READ, {
          messageId,
          conversationId,
        });
      }
    });

    /* --------------------------------------------------------------------------
       Typing Indicators
       -------------------------------------------------------------------------- */

    socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
      const { conversationId, receiverId } = data;

      // Emit typing event to the other user in the conversation
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, []);
      }

      // Add user to typing list for the conversation
      if (!typingUsers.get(conversationId).includes(socket.userId)) {
        typingUsers.get(conversationId).push(socket.userId);
      }

      // Notify receiver that user is typing
      if (onlineUsers.has(receiverId)) {
        io.to(onlineUsers.get(receiverId)).emit(SOCKET_EVENTS.USER_TYPING, {
          userId: socket.userId,
          conversationId,
        });
      }

      logger.info("User typing", { userId: socket.userId, conversationId });
    });

    socket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, (data) => {
      const { conversationId, receiverId } = data;

      if (typingUsers.has(conversationId)) {
        typingUsers.set(
          conversationId,
          typingUsers.get(conversationId).filter((id) => id !== socket.userId),
        );
      }

      // Notify receiver
      if (onlineUsers.has(receiverId)) {
        io.to(onlineUsers.get(receiverId)).emit(
          SOCKET_EVENTS.USER_STOPPED_TYPING,
          {
            userId: socket.userId,
            conversationId,
          },
        );
      }
    });

    /* --------------------------------------------------------------------------
       Notification Events
       -------------------------------------------------------------------------- */
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
      // Emit to self (for UI updates)
      socket.emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, (data) => {
      const { notificationId } = data;
      socket.emit(SOCKET_EVENTS.NOTIFICATION_READ, { notificationId });
    });

    /* --------------------------------------------------------------------------
       Disconnect Event
       -------------------------------------------------------------------------- */

    socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
      logger.info("User disconnected", { userId: socket.userId });

      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Update user status in DB
      await User.findByIdAndUpdate(socket.userId, {
        status: "offline",
        lastSeen: new Date(),
      });

      // Broadcast user offline status
      io.emit(SOCKET_EVENTS.USER_STATUS_CHANGED, {
        userId: socket.userId,
        status: "offline",
      });

      // Clean up typing state
      typingUsers.forEach((users, conversationId) => {
        const filtered = users.filter((id) => id !== socket.userId);
        if (filtered.length === 0) {
          typingUsers.delete(conversationId);
        } else {
          typingUsers.set(conversationId, filtered);
        }
      });
    });
  });

  return io;
};

export const emitToUser = (io, userId, event, data) => {
  if (onlineUsers.has(userId)) {
    io.to(onlineUsers.get(userId)).emit(event, data);
  }
};
