import { Server } from "socket.io";
import { verifyToken } from "../utils/tokenUtil";
import User from "../models/User";
import { SOCKET_EVENTS } from "../config/constants";
import logger from "../utils/logger";

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

    // Broadcast user online status
    io.emit(SOCKET_EVENTS.USER_STATUS_CHANGED, {
      userId: socket.userId,
      status: "online",
    });

    /* --------------------------------------------------------------------------
       Message Events
       -------------------------------------------------------------------------- */

    // Send message
    socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data) => {
      try {
        const { receiverId, content, messageType, imageUrl, conversationId } = data;

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
            });
        }
      } catch (error) {
        logger.error("Error sending message", error);
      }
    });

    // Message delivered
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, (data) => {
        const { senderId, messageId } = data;
        if (onlineUsers.has(senderId)) {
            io.to(onlineUsers.get(senderId)).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
                messageId,
            });
        }
    });

    
  });
};
