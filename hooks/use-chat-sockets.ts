"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "@/lib/db/types";
import { useSocket } from "@/lib/socket";



export const useChatSocket = (roomId: string, currentUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout>(null);
  let socket = useSocket();


  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:4000");
    }

    // Join the chat room
    socket.emit("join", roomId);

    // Listen for incoming messages
    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for typing events
    socket.on("typing", (userId: string) => {
      if (userId !== currentUserId) {
        setIsTyping(true);
        clearTimeout(typingTimeout.current!);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 1000);
      }
    });

    // Fetch initial messages once
    fetch(`/api/chat/rooms/${roomId}/messages`)
      .then((res) => res.json())
      .then((data: Message[]) => {
        console.log(data);

        setMessages(data);
      })
      .catch(console.error);

    return () => {
      socket?.off("message");
      socket?.off("typing");
    };
  }, [roomId, currentUserId]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chat_room_id: roomId,
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date(),
    };
    // Send message to server
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
