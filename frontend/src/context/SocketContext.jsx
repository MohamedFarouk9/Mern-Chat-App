import { createContext, useContext, useState } from "react";
import { io } from 'socket.io-client';
import { useAuth } from "./AuthContext"; // Import your auth context to get the token


const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token } = useAuth(); // Assuming you have an auth context to get the token
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            // 🔥 cleanup when user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
            auth: { token },
            // transports: ["websocket"], // 🔥 better for prod
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,

        });

        newSocket.on("connect", () => {
            console.log("Connected to socket server");
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from socket server");
            setIsConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocket must be used within a SocketProvider");
    return context;
};