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
  } = useChatSocket(roomId, currentUserId, otherUser.id);

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
    <div className="h-[calc(100vh-3.5rem)] pb-16 md:pb-0 flex flex-col bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_30%),_radial-gradient(circle_at_bottom_left,_var(--color-accent)_0%,_transparent_30%)] opacity-5 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-5 border-b-4 border-primary/10 bg-background/40 backdrop-blur-2xl relative z-10 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-xl hover:bg-primary/10 text-primary"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Link
          href={`/profile/${otherUser.id}`}
          className="flex items-center gap-4 flex-1 group"
        >
          <div className="relative">
            <Avatar className="w-12 h-12 rounded-[1.25rem] border-2 border-background shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3">
              <AvatarImage
                src={otherUser.avatar_url || undefined}
                alt={otherUser.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-black">
                {otherUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {otherUser.is_online && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-background" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{otherUser.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              {otherUser.is_online ? (
                <span className="text-emerald-500">Online now</span>
              ) : (
                `Active ${formatTime(otherUser.last_seen)}`
              )}
              {isTyping && <span className="text-primary italic animate-pulse"> • Typing...</span>}
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
                        "max-w-[80%] px-5 py-3.5 rounded-[1.75rem] shadow-sm font-bold leading-relaxed",
                        isOwn
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-none shadow-xl shadow-primary/10"
                          : "bg-white dark:bg-card text-foreground rounded-bl-none border-4 border-muted shadow-lg shadow-muted/5"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                      <p
                        className={cn(
                          "text-[9px] mt-1.5 font-bold uppercase tracking-wider",
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground/60"
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
      <div className="p-4 border-t-2 border-muted bg-card">
        <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-[2rem] border-2 border-muted shadow-inner">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 shadow-none px-4 h-11 text-base font-medium"
            maxLength={1000}
          />
          <Button size="icon" onClick={handleSend} disabled={!message.trim()} className="rounded-full w-11 h-11 shadow-lg shadow-primary/20 group hover:scale-105 transition-transform">
            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
