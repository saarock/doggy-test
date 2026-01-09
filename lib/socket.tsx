"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "@/lib/db/types";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    // Auto-detect localhost if no URL provided
    if (!socketUrl && typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost') {
        socketUrl = 'http://localhost:4000';
      } else {
        socketUrl = 'https://node-push-production.up.railway.app';
      }
    }

    console.log("Connecting to socket at:", socketUrl);

    const newSocket = io(socketUrl || 'http://localhost:4000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully with ID:", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to access the socket anywhere
export const useSocket = () => {
  return useContext(SocketContext).socket;
};
