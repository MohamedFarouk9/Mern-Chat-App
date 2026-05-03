import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export const Chat = () => {
    // ===== STATE MANAGEMENT =====
    const { user, token } = useAuth(); // Get current logged-in user & auth token
    const { socket, isConnected } = useSocket(); // Socket.IO connection status
    const [conversations, setConversations] = useState([]); // List of all conversations
    const [selectedConv, setSelectedConv] = useState(null); // Currently selected conversation
    const [messages, setMessages] = useState([]); // Messages in selected conversation
    const [messageInput, setMessageInput] = useState(''); // Input field value
    const [loading, setLoading] = useState(false); // Loading state for send button

    // ===== FETCH ALL CONVERSATIONS ON MOUNT =====
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/message/conversations`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setConversations(res.data.conversations);
            } catch (error) {
                // 🔧 FIX #4: Better error logging
                console.error('Fetch conversations error:', error.response?.data || error.message);
                toast.error('Failed to load conversations');
            }
        };
        fetchConversations();
    }, [token]);

    // ===== FETCH MESSAGES WHEN CONVERSATION CHANGES =====
    useEffect(() => {
        if (!selectedConv) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/message/conversation/${selectedConv._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessages(res.data.messages);
            } catch (error) {
                // 🔧 FIX #4: Better error logging
                console.error('Fetch messages error:', error.response?.data || error.message);
                toast.error('Failed to load messages');
            }
        };
        fetchMessages();
    }, [selectedConv, token]);

    // ===== SOCKET: LISTEN FOR INCOMING MESSAGES =====
    // 🔧 FIX #2: Use named handler function for safe cleanup
    useEffect(() => {
        if (!socket || !selectedConv) return;

        const handleMessageReceive = (message) => {
            // Only add if message belongs to current conversation
            if (message.conversationId === selectedConv._id) {
                // 🔧 FIX #3: Avoid duplicates by checking if message already exists
                setMessages((prev) => {
                    const exists = prev.some((m) => m._id === message._id);
                    return exists ? prev : [...prev, message];
                });
            }
        };

        socket.on('message:receive', handleMessageReceive);

        // 🔧 FIX #2: Remove ONLY this specific listener, not all listeners
        return () => {
            socket.off('message:receive', handleMessageReceive);
        };
    }, [socket, selectedConv]);

    // ===== SEND MESSAGE =====
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConv) return;

        try {
            setLoading(true);

            // 🔧 FIX #1: Get the OTHER participant (not yourself)
            const otherParticipant = selectedConv.participants.find(
                (p) => p._id !== user._id
            );

            if (!otherParticipant) {
                toast.error('Conversation participant not found');
                return;
            }

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/message/send`,
                {
                    receiverId: otherParticipant._id,
                    content: messageInput,
                    conversationId: selectedConv._id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 🔧 FIX #3: Add message with unique ID to prevent duplicates
            const sentMessage = res.data.message;
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === sentMessage._id);
                return exists ? prev : [...prev, sentMessage];
            });

            setMessageInput('');

            // Emit via socket (optional: backend should do this)
            if (socket) {
                socket.emit('message:send', sentMessage);
            }
        } catch (error) {
            // 🔧 FIX #4: Better error logging with actual error details
            console.error('Send message error:', error.response?.data || error.message);
            toast.error(
                error.response?.data?.message || 'Failed to send message'
            );
        } finally {
            setLoading(false);
        }
    };

    // ===== RENDER UI =====
    return (
        <div className="flex h-screen bg-gray-100">
            {/* ===== LEFT SIDEBAR: CONVERSATION LIST ===== */}
            <div className="w-1/4 bg-white border-r">
                <div className="p-4">
                    <h2 className="text-xl font-bold">Conversations</h2>
                </div>
                <div className="overflow-y-auto">
                    {conversations.map((conv) => {
                        // 🔧 FIX #1: Get OTHER participant name correctly
                        const otherParticipant = conv.participants.find(
                            (p) => p._id !== user?._id
                        );

                        return (
                            <div
                                key={conv._id}
                                onClick={() => setSelectedConv(conv)}
                                className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                                    selectedConv?._id === conv._id ? 'bg-blue-50' : ''
                                }`}
                            >
                                {/* Display OTHER user's name, not your own */}
                                <p className="font-semibold">
                                    {otherParticipant?.firstName} {otherParticipant?.lastName}
                                </p>
                                {/* Show last message preview */}
                                <p className="text-sm text-gray-500 truncate">
                                    {conv.lastMessage?.content || 'No messages yet'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ===== RIGHT SIDE: CHAT AREA ===== */}
            <div className="flex-1 flex flex-col">
                {selectedConv ? (
                    <>
                        {/* ===== CHAT HEADER ===== */}
                        <div className="bg-white border-b p-4">
                            {/* 🔧 FIX #1: Display OTHER participant's name */}
                            <h3 className="font-bold">
                                {selectedConv.participants.find((p) => p._id !== user?._id)
                                    ?.firstName}{' '}
                                {selectedConv.participants.find((p) => p._id !== user?._id)
                                    ?.lastName}
                            </h3>
                            {/* Show online/offline status */}
                            <p className="text-sm text-gray-500">
                                {isConnected ? '🟢 Online' : '🔴 Offline'}
                            </p>
                        </div>

                        {/* ===== MESSAGES DISPLAY ===== */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`flex ${
                                        msg.senderId === user?._id ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    {/* Message bubble: blue if you sent it, gray if received */}
                                    <div
                                        className={`max-w-xs px-4 py-2 rounded-lg ${
                                            msg.senderId === user?._id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-300 text-black'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        {/* Show timestamp */}
                                        <p className="text-xs mt-1 opacity-70">
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ===== MESSAGE INPUT FORM ===== */}
                        <form
                            onSubmit={handleSendMessage}
                            className="bg-white border-t p-4 flex gap-2"
                        >
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !messageInput.trim()}
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '📤 Sending...' : '📤 Send'}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Show this when no conversation selected */
                    <div className="flex items-center justify-center h-full text-gray-500">
                        👈 Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};