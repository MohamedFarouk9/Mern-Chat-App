import { create } from 'zustand';

export const useChatStore = create((set) => ({
  conversations: [],
  selectedConv: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {}, // { conversationId: [userId1, userId2] }

  setConversations: (conversations) => set({ conversations }),
  setSelectedConv: (conv) => set({ selectedConv: conv }),
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => {
    // Only add if it belongs to the currently selected conversation
    if (state.selectedConv && state.selectedConv._id === message.conversationId) {
      const exists = state.messages.some((m) => m._id === message._id);
      if (!exists) {
        return { messages: [...state.messages, message] };
      }
    }
    return state;
  }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  addUserTyping: (conversationId, userId) => set((state) => {
    const currentTyping = state.typingUsers[conversationId] || [];
    if (!currentTyping.includes(userId)) {
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...currentTyping, userId]
        }
      };
    }
    return state;
  }),

  removeUserTyping: (conversationId, userId) => set((state) => {
    const currentTyping = state.typingUsers[conversationId] || [];
    return {
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: currentTyping.filter(id => id !== userId)
      }
    };
  }),
}));
