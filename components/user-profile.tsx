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
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-32 md:pb-12">
      <Button variant="ghost" size="sm" className="mb-6 gap-2 rounded-2xl hover:bg-primary/10 hover:text-primary font-bold transition-all px-6 border-2 border-transparent hover:border-primary/20" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back to Discover
      </Button>

      <Card className="rounded-[3rem] border-4 border-muted shadow-2xl overflow-hidden">
        <CardHeader className="text-center pt-12 pb-8 px-8 bg-muted/20">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <Avatar className="w-32 h-32 rounded-[2rem] border-4 border-background shadow-xl animate-in zoom-in-75 duration-500">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="text-5xl font-black bg-primary/10 text-primary uppercase">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.is_online && (
              <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-8 border-card animate-pulse shadow-lg" />
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">{user.name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {user.is_online ? (
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Online Now
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground px-4 py-2 rounded-full border">Last seen {formatLastSeen(user.last_seen)}</span>
            )}
            {distance !== null && (
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
                <MapPin className="w-4 h-4" />
                {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)} km away`}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-10">
          {user.bio && (
            <div className="bg-muted/10 p-6 rounded-[2rem] border-2 border-muted">
              <h2 className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest mb-3 px-1">About {user.name}</h2>
              <p className="text-lg font-medium leading-relaxed">{user.bio}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button className="w-full h-18 text-2xl font-black rounded-2xl gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-primary via-primary to-primary/80 py-8" onClick={handleStartChat} disabled={isStartingChat}>
              {isStartingChat ? <Loader2 className="w-8 h-8 animate-spin" /> : <MessageCircle className="w-8 h-8" />}
              START CHATTING!
            </Button>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-muted hover:border-destructive/30 hover:bg-destructive/5 text-destructive font-black gap-2 transition-all" asChild>
                <Link href={`/report/${user.id}`}>
                  <Flag className="w-5 h-5" />
                  Report
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl border-2 border-muted hover:border-destructive/30 hover:bg-destructive/5 text-destructive font-black gap-2 transition-all"
                onClick={handleBlock}
                disabled={isBlocking}
              >
                {isBlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
                Block
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
