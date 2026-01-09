"use client"

import Link from "next/link"
import useSWR from "swr"
import type { ChatRoomWithUser } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MessageCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ChatList() {
  const { data: chatRooms, isLoading } = useSWR<ChatRoomWithUser[]>("/api/chat/rooms", fetcher, {
    refreshInterval: 10000,
  })

  const formatTime = (date: Date) => {
    const now = new Date()
    const msgDate = new Date(date)
    const diffMs = now.getTime() - msgDate.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) {
      return msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return msgDate.toLocaleDateString([], { weekday: "short" })
    return msgDate.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] pb-16 md:pb-0 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="h-8 w-48 bg-muted/50 rounded-xl animate-shimmer mb-8" />
          <div className="divide-y-2 divide-muted rounded-[2.5rem] border-4 border-muted bg-card shadow-xl overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-5 flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 animate-shimmer" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-muted/50 rounded-xl animate-shimmer" />
                  <div className="h-4 w-48 bg-muted/50 rounded-xl animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="h-[calc(100vh-3.5rem)] pb-16 md:pb-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-[3rem] border-4 border-muted shadow-2xl overflow-hidden">
          <CardHeader className="text-center pt-12 pb-8 bg-muted/20">
            <div className="w-24 h-24 rounded-[1.5rem] bg-muted/50 flex items-center justify-center mx-auto mb-6 shadow-xl rotate-6 group-hover:rotate-0 transition-transform border-4 border-white">
              <MessageCircle className="w-12 h-12 text-muted-foreground/60" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">Quiet as a mouse... 🐁</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10 px-10 bg-background">
            <p className="text-muted-foreground font-bold mb-10 leading-relaxed text-lg">No messages yet! Start discovering amazing people nearby and break the ice.</p>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-2xl text-xl font-black ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/30 h-16 px-10 py-2 w-full"
            >
              DISCOVER PEOPLE 🚀
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-32 md:pb-12">
      <h1 className="text-3xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Your Chats</h1>
      <div className="divide-y-2 divide-muted rounded-[2.5rem] border-4 border-muted bg-card shadow-xl overflow-hidden">
        {chatRooms.map((room) => (
          <Link
            key={room.id}
            href={`/chats/${room.id}`}
            className="group flex items-center gap-4 p-5 hover:bg-primary/5 transition-all active:scale-[0.98]"
          >
            <div className="relative">
              <Avatar className="w-14 h-14 rounded-2xl border-2 border-background shadow-md">
                <AvatarImage src={room.other_user.avatar_url || undefined} alt={room.other_user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-lg">{room.other_user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {room.other_user.is_online && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-card animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-lg tracking-tight truncate group-hover:text-primary transition-colors">{room.other_user.name}</span>
                {room.last_message && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{formatTime(room.last_message.created_at)}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground truncate leading-relaxed">
                  {room.last_message?.content || "No messages yet"}
                </p>
                {room.unread_count > 0 && (
                  <span className="ml-2 flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-black shadow-lg shadow-primary/30 animate-in zoom-in-50">
                    {room.unread_count > 9 ? "9+" : room.unread_count}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
