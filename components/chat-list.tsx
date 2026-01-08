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
      <div className="h-[calc(100vh-3.5rem)] pb-16 md:pb-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="h-[calc(100vh-3.5rem)] pb-16 md:pb-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>No conversations yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Start discovering people nearby and begin chatting!</p>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Discover People
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-4 pb-20 md:pb-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="divide-y rounded-lg border bg-card">
        {chatRooms.map((room) => (
          <Link
            key={room.id}
            href={`/chats/${room.id}`}
            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={room.other_user.avatar_url || undefined} alt={room.other_user.name} />
                <AvatarFallback>{room.other_user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {room.other_user.is_online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium truncate">{room.other_user.name}</span>
                {room.last_message && (
                  <span className="text-xs text-muted-foreground">{formatTime(room.last_message.created_at)}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {room.last_message?.content || "No messages yet"}
                </p>
                {room.unread_count > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
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
