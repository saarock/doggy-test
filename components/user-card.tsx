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
          "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left",
          isSelected && "bg-muted",
        )}
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{user.name}</span>
            {user.is_online && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>
              {user.distance_km < 1
                ? `${Math.round(user.distance_km * 1000)}m away`
                : `${user.distance_km.toFixed(1)} km away`}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
          <AvatarFallback className="text-xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            {user.is_online ? (
              <span className="text-xs text-emerald-600 font-medium">Online</span>
            ) : (
              <span className="text-xs text-muted-foreground">{formatLastSeen(user.last_seen)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>
              {user.distance_km < 1
                ? `${Math.round(user.distance_km * 1000)} meters away`
                : `${user.distance_km.toFixed(1)} km away`}
            </span>
          </div>
          {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
        </div>
      </div>

      <Button className="w-full gap-2" onClick={handleStartChat} disabled={isLoading}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        Start Chat
      </Button>
    </div>
  )
}
