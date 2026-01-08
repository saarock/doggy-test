"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import type { UserWithDistance } from "@/lib/db/types"
import { MapView } from "@/components/map-view"
import { UserCard } from "@/components/user-card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2, MapPin, Users, Filter } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DiscoverMap() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [radius, setRadius] = useState(10)
  const [selectedUser, setSelectedUser] = useState<UserWithDistance | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationError(null)
      },
      (error) => {
        setLocationError("Unable to get location")
        console.error(error)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Fetch nearby users
  const { data: nearbyUsers, isLoading } = useSWR<UserWithDistance[]>(
    location
      ? `/api/users/nearby?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`
      : null,
    fetcher,
    { refreshInterval: 30000 },
  )

  const handleUserSelect = useCallback((user: UserWithDistance) => {
    setSelectedUser(user)
  }, [])

  if (locationError) {
    return (
      <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] pb-16 md:pb-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Location Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              We need your location to show people near you. Please enable location access in your browser settings.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] pb-16 md:pb-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] pb-16 md:pb-0 relative">
      {/* Map */}
      <MapView
        center={location}
        users={nearbyUsers || []}
        onUserSelect={handleUserSelect}
        selectedUserId={selectedUser?.id}
      />

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <Card className="pointer-events-auto shadow-lg">
          <CardContent className="py-2 px-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${nearbyUsers?.length || 0} nearby`}
            </span>
          </CardContent>
        </Card>

        <Button
          variant="secondary"
          size="sm"
          className="pointer-events-auto shadow-lg gap-2"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-4 h-4" />
          {radius} km
        </Button>
      </div>

      {/* User List (Desktop Sidebar) */}
      <div className="hidden lg:block absolute top-4 right-4 bottom-4 w-80">
        <Card className="h-full overflow-hidden">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">People Nearby</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-[calc(100%-52px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : nearbyUsers?.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-muted-foreground text-sm">No one nearby yet. Try increasing your radius.</p>
              </div>
            ) : (
              <div className="divide-y">
                {nearbyUsers?.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    compact
                    onClick={() => handleUserSelect(user)}
                    isSelected={selectedUser?.id === user.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected User Sheet (Mobile) */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="sr-only">User Profile</SheetTitle>
          </SheetHeader>
          {selectedUser && <UserCard user={selectedUser} onStartChat={() => setSelectedUser(null)} />}
        </SheetContent>
      </Sheet>

      {/* Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-auto rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Search Radius</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Distance</span>
                <span className="text-sm font-medium">{radius} km</span>
              </div>
              <Slider value={[radius]} onValueChange={([value]) => setRadius(value)} min={1} max={50} step={1} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setShowFilters(false)}>
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
