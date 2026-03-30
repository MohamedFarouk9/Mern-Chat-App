/**
 * Emit notification to user
 * Call from controllers when creating notifications
 */

//Go through every currently connected user.
//Find the one whose userId matches. Send them a notification.
export const emitNotificationToUser = (io, userId, notification) => {
  const userSocketId = io.sockets.sockets;
  //
  for (const [socketId, socket] of userSocketId) {
    if (socket.userId === userId) {
      socket.emit("newNotification:new", notification);
    }
  }
};

/**
 * Emit message to receiver
 */

//Go through every connected user. Find the message receiver.
//Push the message directly to their screen in real-time
export const emitMessageToReceiver = (io, receiverId, message) => {
  const userSockets = io.sockets.sockets;
  for (const [socketId, socket] of userSockets) {
    if (socket.userId === receiverId) {
      socket.emit('message:receive', message);
    }
  }
};
