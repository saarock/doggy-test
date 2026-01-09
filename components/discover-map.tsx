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
import { SkeletonUserCard } from "@/components/ui/skeleton"

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
        <Card className="w-full max-w-md rounded-[2.5rem] border-4 border-muted shadow-2xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6 px-10">
            <div className="w-20 h-20 rounded-[1.5rem] bg-destructive/10 flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
              <MapPin className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-black">Location Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10 px-10">
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              We need your location to show people near you. Please enable location access in your browser settings to start the adventure!
            </p>
            <Button size="lg" className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all w-full" onClick={() => window.location.reload()}>
              Try Again 🔄
            </Button>
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
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
        <Card className="pointer-events-auto shadow-2xl rounded-2xl border-2 border-muted overflow-hidden bg-background/80 backdrop-blur-xl">
          <CardContent className="py-2.5 px-5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-black tracking-tight">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${nearbyUsers?.length || 0} neighboring dogs`}
            </span>
          </CardContent>
        </Card>

        <Button
          variant="secondary"
          size="sm"
          className="pointer-events-auto shadow-2xl gap-2 z-40 relative rounded-2xl border-2 border-muted h-10 px-5 font-bold hover:bg-primary hover:text-primary-foreground transition-all"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-4 h-4" />
          {radius} km radius
        </Button>
      </div>

      {/* User List (Desktop Sidebar) */}
      <div className="hidden lg:block absolute top-6 right-6 bottom-6 w-80">
        <Card className="h-full overflow-hidden rounded-[2.5rem] border-4 border-muted shadow-2xl bg-background/90 backdrop-blur-md">
          <CardHeader className="py-5 px-8 bg-muted/20 border-b">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              People Nearby
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-[calc(100%-76px)]">
            {isLoading ? (
              <div className="space-y-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <SkeletonUserCard />
                  </div>
                ))}
              </div>
            ) : nearbyUsers?.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-muted-foreground/20">
                  <MapPin className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-bold text-muted-foreground/60 leading-relaxed">No neighbors found in this area yet.</p>
                <Button variant="link" className="text-primary font-black uppercase text-[10px] tracking-widest mt-2" onClick={() => setShowFilters(true)}>Increase Radius</Button>
              </div>
            ) : (
              <div className="divide-y-2 divide-muted">
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
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-[3rem] border-t-4 border-muted p-0 overflow-hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>User Profile</SheetTitle>
          </SheetHeader>
          <div className="p-2 flex justify-center">
            <div className="w-12 h-1.5 rounded-full bg-muted/50" />
          </div>
          <div className="pb-10 overflow-y-auto">
            {selectedUser && <UserCard user={selectedUser} onStartChat={() => setSelectedUser(null)} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-auto rounded-t-[3rem] border-t-4 border-muted p-10 pb-16">
          <SheetHeader>
            <SheetTitle className="text-2xl font-black text-center mb-6">Discovery Radius</SheetTitle>
          </SheetHeader>
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-muted-foreground">Maximum Distance</span>
                <span className="text-2xl font-black text-primary">{radius} km</span>
              </div>
              <Slider
                value={[radius]}
                onValueChange={([value]) => setRadius(value)}
                min={1}
                max={50}
                step={1}
                className="h-6"
              />
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                <span>1 km (Local)</span>
                <span>50 km (Far)</span>
              </div>
            </div>
            <Button className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => setShowFilters(false)}>
              Apply Settings 🎯
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
