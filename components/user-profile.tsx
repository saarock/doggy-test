"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, MapPin, Flag, Ban, Loader2 } from "lucide-react"
import Link from "next/link"

interface UserProfileProps {
  user: User
  distance: number | null
  currentUserId: string
}

export function UserProfile({ user, distance, currentUserId }: UserProfileProps) {
  const router = useRouter()
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)

  const handleStartChat = async () => {
    setIsStartingChat(true)
    try {
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) throw new Error("Failed to create chat")

      const room = await response.json()
      router.push(`/chats/${room.id}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    } finally {
      setIsStartingChat(false)
    }
  }

  const handleBlock = async () => {
    if (!confirm("Are you sure you want to block this user? You won't be able to see or message each other.")) return

    setIsBlocking(true)
    try {
      await fetch("/api/safety/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      router.push("/discover")
    } catch (error) {
      console.error("Failed to block user:", error)
    } finally {
      setIsBlocking(false)
    }
  }

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const lastSeen = new Date(date)
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 pb-20 md:pb-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
            <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {user.is_online ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Online
              </span>
            ) : (
              <span>Last seen {formatLastSeen(user.last_seen)}</span>
            )}
            {distance !== null && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)} km away`}
                </span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.bio && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">About</h2>
              <p className="text-sm">{user.bio}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button className="w-full gap-2" onClick={handleStartChat} disabled={isStartingChat}>
              {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              Start Chat
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2 text-destructive bg-transparent" asChild>
                <Link href={`/report/${user.id}`}>
                  <Flag className="w-4 h-4" />
                  Report
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-destructive bg-transparent"
                onClick={handleBlock}
                disabled={isBlocking}
              >
                {isBlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Block
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
