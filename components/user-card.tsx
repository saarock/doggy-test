"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { UserWithDistance } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserCardProps {
  user: UserWithDistance
  compact?: boolean
  onClick?: () => void
  isSelected?: boolean
  onStartChat?: () => void
}

export function UserCard({ user, compact, onClick, isSelected, onStartChat }: UserCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartChat = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) throw new Error("Failed to create chat")

      const room = await response.json()
      onStartChat?.()
      router.push(`/chats/${room.id}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    } finally {
      setIsLoading(false)
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
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full p-4 flex items-center gap-4 transition-all duration-300 text-left relative overflow-hidden group",
          isSelected
            ? "bg-primary/10 border-l-4 border-l-primary"
            : "hover:bg-muted/50 border-l-4 border-l-transparent"
        )}
      >
        <Avatar className="w-12 h-12 rounded-2xl shadow-md border-2 border-background transition-transform group-hover:scale-105">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-black">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-black tracking-tight truncate", isSelected ? "text-primary" : "text-foreground")}>{user.name}</span>
            {user.is_online && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <MapPin className="w-3 h-3 text-primary/60" />
            <span>
              {user.distance_km < 1
                ? `${Math.round(user.distance_km * 1000)}m`
                : `${user.distance_km.toFixed(1)} km`}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="p-6 space-y-6 relative overflow-hidden bg-card/40 backdrop-blur-xl rounded-[2rem] border-4 border-muted shadow-2xl">
      <div className="flex items-start gap-5">
        <Avatar className="w-24 h-24 rounded-3xl shadow-xl border-4 border-background rotate-3">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
          <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary uppercase">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 pt-2">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-black tracking-tighter">{user.name}</h3>
            {user.is_online ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Online</span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{formatLastSeen(user.last_seen)}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground/80 mb-4 bg-muted/30 w-fit px-3 py-1 rounded-full border border-muted">
            <MapPin className="w-4 h-4 text-primary" />
            <span>
              {user.distance_km < 1
                ? `${Math.round(user.distance_km * 1000)} meters`
                : `${user.distance_km.toFixed(1)} km`} away
            </span>
          </div>
          {user.bio && <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed italic">&quot;{user.bio}&quot;</p>}
        </div>
      </div>

      <Button className="w-full h-14 gap-3 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-primary/80" onClick={handleStartChat} disabled={isLoading}>
        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <MessageCircle className="w-6 h-6" />}
        START CHATTING
      </Button>
    </div>
  )
}
