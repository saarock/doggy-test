"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Message, User } from "@/lib/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Loader2,
  Flag,
  Ban,
  UserIcon,
} from "lucide-react";
import { cn, formatDateHeader, formatTime } from "@/lib/utils";
import Link from "next/link";
import { useChatSocket } from "@/hooks/use-chat-sockets";

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
  otherUser: User;
}

export function ChatRoom({ roomId, currentUserId, otherUser }: ChatRoomProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    messages: chatMessages,
    sendMessage,
    isTyping,
    sendTyping,
  } = useChatSocket(roomId, currentUserId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage("");
  }, [message, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      sendTyping();
    }
  };

  const handleBlock = async () => {
    if (!confirm("Are you sure you want to block this user?")) return;
    try {
      await fetch("/api/safety/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otherUser.id }),
      });
      router.push("/chats");
    } catch (error) {
      console.error(error);
    }
  };

  // Group messages by date
  const groupedMessages = chatMessages.reduce(
    (groups: Record<string, Message[]>, msg) => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
      return groups;
    },
    {}
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] pb-16 md:pb-0 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Link
          href={`/profile/${otherUser.id}`}
          className="flex items-center gap-3 flex-1"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={otherUser.avatar_url || undefined}
              alt={otherUser.name}
            />
            <AvatarFallback>
              {otherUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{otherUser.name}</h2>
            <p className="text-xs text-muted-foreground">
              {otherUser.is_online
                ? "Online"
                : `Last seen ${formatTime(otherUser.last_seen)}`}
              {isTyping && " • Typing..."}
            </p>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/profile/${otherUser.id}`}>
                <UserIcon className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/report/${otherUser.id}`}
                className="text-destructive"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report User
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleBlock}
              className="text-destructive"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center justify-center mb-4">
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {formatDateHeader(new Date(date))}
              </span>
            </div>
            <div className="space-y-2">
              {msgs.map((msg, idx) => {
                const isOwn = msg.sender_id === currentUserId;
                const showAvatar =
                  !isOwn &&
                  (idx === 0 || msgs[idx - 1].sender_id !== msg.sender_id);
                return (
                  <div
                    key={`${msg.id}-${msg.created_at}`}
                    className={cn(
                      "flex items-end gap-2",
                      isOwn && "flex-row-reverse"
                    )}
                  >
                    {!isOwn && (
                      <Avatar
                        className={cn("w-6 h-6", !showAvatar && "invisible")}
                      >
                        <AvatarImage
                          src={otherUser.avatar_url || undefined}
                          alt={otherUser.name}
                        />
                        <AvatarFallback className="text-xs">
                          {otherUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] px-3 py-2 rounded-2xl",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={1000}
          />
          <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
