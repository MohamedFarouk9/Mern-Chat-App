import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useChatStore } from '../stores/chatStore';
import { useNotificationStore } from '../stores/notificationStore';

export const useSocketEvents = () => {
  const { socket, isConnected } = useSocket();
  const { addMessage, addUserTyping, removeUserTyping } = useChatStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for incoming messages
    const handleMessageReceive = (message) => {
      addMessage(message);
    };

    // Listen for typing events
    const handleUserTyping = ({ conversationId, userId }) => {
      addUserTyping(conversationId, userId);
    };

    const handleUserStoppedTyping = ({ conversationId, userId }) => {
      removeUserTyping(conversationId, userId);
    };

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      addNotification(notification);
    };

    // Attach listeners
    socket.on('message:receive', handleMessageReceive);
    socket.on('user:typing', handleUserTyping);
    socket.on('user:stopped-typing', handleUserStoppedTyping);
    socket.on('notification:new', handleNewNotification);

    // Cleanup listeners on unmount
    return () => {
      socket.off('message:receive', handleMessageReceive);
      socket.off('user:typing', handleUserTyping);
      socket.off('user:stopped-typing', handleUserStoppedTyping);
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, isConnected, addMessage, addUserTyping, removeUserTyping, addNotification]);
};
