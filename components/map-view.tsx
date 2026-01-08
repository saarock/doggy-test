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
      className="w-full h-full bg-muted/30 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, transparent 0%, var(--background) 70%),
          linear-gradient(to bottom, transparent, var(--background)),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            var(--border) 40px,
            var(--border) 41px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            var(--border) 40px,
            var(--border) 41px
          )
        `,
      }}
    >
      {/* Center marker (current user) */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: dimensions.width / 2, top: dimensions.height / 2 }}
      >
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-primary animate-ping absolute inset-0 opacity-30" />
          <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg relative" />
        </div>
        <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-background/80 px-2 py-0.5 rounded">
          You
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
              "absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full",
              isSelected && "z-30 scale-110",
            )}
            style={{ left: pos.x, top: pos.y }}
            onClick={() => onUserSelect(user)}
          >
            <div className="relative">
              <Avatar
                className={cn("w-10 h-10 border-2 border-background shadow-lg", isSelected && "ring-2 ring-primary")}
              >
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.is_online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
              )}
            </div>
            <span className="absolute top-12 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-background/90 px-2 py-0.5 rounded shadow">
              {user.distance_km < 1 ? `${Math.round(user.distance_km * 1000)}m` : `${user.distance_km.toFixed(1)}km`}
            </span>
          </button>
        )
      })}

      {/* Radius indicator */}
      <div
        className="absolute rounded-full border border-primary/20 bg-primary/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: dimensions.width / 2,
          top: dimensions.height / 2,
          width: Math.min(dimensions.width, dimensions.height) * 0.8,
          height: Math.min(dimensions.width, dimensions.height) * 0.8,
        }}
      />
    </div>
  )
}
