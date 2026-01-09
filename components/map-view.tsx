"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import type { UserWithDistance } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MapViewProps {
  center: { latitude: number; longitude: number }
  users: UserWithDistance[]
  onUserSelect: (user: UserWithDistance) => void
  selectedUserId?: string
}

// Simple CSS-based map with user markers
// For production, integrate Mapbox or Google Maps
export function MapView({ center, users, onUserSelect, selectedUserId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Convert lat/lng to pixel position (simple projection)
  const toPixel = useCallback(
    (lat: number, lng: number) => {
      if (!dimensions.width || !dimensions.height) return { x: 0, y: 0 }

      // Simple mercator-like projection centered on user
      const scale = 5000 // Adjust for zoom level
      const x = dimensions.width / 2 + (lng - center.longitude) * scale
      const y = dimensions.height / 2 - (lat - center.latitude) * scale

      return { x, y }
    },
    [center, dimensions],
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-muted/20 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, transparent 0%, var(--background) 80%),
          linear-gradient(to bottom, transparent, var(--background)),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 60px,
            oklch(from var(--primary) l c h / 0.05) 60px,
            oklch(from var(--primary) l c h / 0.05) 61px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 60px,
            oklch(from var(--primary) l c h / 0.05) 60px,
            oklch(from var(--primary) l c h / 0.05) 61px
          )
        `,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5 pointer-events-none" />
      {/* Center marker (current user) */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
        style={{ left: dimensions.width / 2, top: dimensions.height / 2 }}
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-primary animate-ping absolute inset-0 opacity-40" />
          <div className="w-8 h-8 rounded-2xl bg-primary border-4 border-background shadow-2xl relative flex items-center justify-center rotate-45">
            <div className="w-3 h-3 rounded-full bg-background -rotate-45" />
          </div>
        </div>
        <span className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-lg">
          You are here
        </span>
      </div>

      {/* User markers */}
      {users.map((user) => {
        const pos = toPixel(user.latitude!, user.longitude!)
        const isSelected = selectedUserId === user.id
        const isOnScreen = pos.x > -50 && pos.x < dimensions.width + 50 && pos.y > -50 && pos.y < dimensions.height + 50

        if (!isOnScreen) return null

        return (
          <button
            key={user.id}
            type="button"
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
              "focus:outline-none focus:ring-4 focus:ring-primary/20 rounded-2xl",
              isSelected && "z-30 scale-125",
              !isSelected && "hover:scale-110"
            )}
            style={{ left: pos.x, top: pos.y }}
            onClick={() => onUserSelect(user)}
          >
            <div className="relative">
              <Avatar
                className={cn(
                  "w-12 h-12 rounded-2xl border-4 border-background shadow-xl transition-all",
                  isSelected ? "ring-4 ring-primary border-primary" : "border-background"
                )}
              >
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {user.is_online && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-card animate-pulse" />
              )}
            </div>
            <div className={cn(
              "absolute top-14 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
              isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-card text-muted-foreground",
              "px-3 py-1 rounded-full shadow-lg border-2 border-muted"
            )}>
              {user.distance_km < 1 ? `${Math.round(user.distance_km * 1000)}m` : `${user.distance_km.toFixed(1)}km`}
            </div>
          </button>
        )
      })}

      {/* Radius indicator */}
      <div
        className="absolute rounded-full border-4 border-dashed border-primary/10 bg-primary/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-1000"
        style={{
          left: dimensions.width / 2,
          top: dimensions.height / 2,
          width: Math.min(dimensions.width, dimensions.height) * 0.85,
          height: Math.min(dimensions.width, dimensions.height) * 0.85,
        }}
      />
    </div>
  )
}
