"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "@/lib/db/types";
import { useSocket } from "@/lib/socket";



export const useChatSocket = (roomId: string, currentUserId: string, recipientId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout>(null);
  let socket = useSocket();


  useEffect(() => {
    if (!socket) return;

    // Helper to register and join room
    const setupSocket = () => {
      console.log(`useChatSocket: Registering user ${currentUserId} and joining room ${roomId}`);
      socket.emit("register", currentUserId);
      socket.emit("join", roomId);
    };

    // Named listener for specific cleanup
    const onMessage = (msg: Message) => {
      console.log("useChatSocket: Received message:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    const onTyping = (userId: string) => {
      if (userId !== currentUserId) {
        setIsTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 1000);
      }
    };

    // Listen for events
    socket.on("message", onMessage);
    socket.on("typing", onTyping);
    socket.on("connect", setupSocket);

    // Initial setup if already connected
    if (socket.connected) {
      setupSocket();
    }

    // Fetch initial messages once
    fetch(`/api/chat/rooms/${roomId}/messages`)
      .then((res) => res.json())
      .then((data: Message[]) => {
        setMessages(data);
      })
      .catch(console.error);

    return () => {
      socket.off("message", onMessage);
      socket.off("typing", onTyping);
      socket.off("connect", setupSocket);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [roomId, currentUserId, socket]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const tempMessage: any = {
      id: `temp-${Date.now()}`,
      chat_room_id: roomId,
      sender_id: currentUserId,
      recipient_id: recipientId, // Add recipientId for notifications
      content,
      is_read: false,
      created_at: new Date(),
    };
    // Send message to server
    console.log("useChatSocket: Emitting message to server:", tempMessage);
    socket?.emit("message", tempMessage);
    // Save to database via your backend API
    try {
      await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content,
          sender_id: currentUserId,
        }),
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  const sendTyping = () => {
    socket?.emit("typing", roomId);
  };

  return { messages, sendMessage, isTyping, sendTyping };
};
