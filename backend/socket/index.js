import { Server } from "socket.io";
import { verifyToken } from "../utils/tokenUtil";

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
};
