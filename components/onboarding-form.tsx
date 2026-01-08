"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function OnboardingForm() {
  const router = useRouter()
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const requestLocation = () => {
    setError(null)
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationGranted(true)
      },
      (err) => {
        setError("Unable to get your location. Please enable location access.")
        console.error(err)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const handleSubmit = async () => {
    if (!ageConfirmed || !location) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageConfirmed: true,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to complete setup")
      }

      router.push("/discover")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Complete Your Setup</CardTitle>
          <CardDescription>We need a few things to get you started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Age Confirmation */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
            <Checkbox
              id="age"
              checked={ageConfirmed}
              onCheckedChange={(checked) => setAgeConfirmed(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="age" className="font-medium cursor-pointer">
                I confirm I am 18 years or older
              </Label>
              <p className="text-sm text-muted-foreground">
                This platform is for adults only. You must be at least 18 to use Nearby Connect.
              </p>
            </div>
          </div>

          {/* Location Permission */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Location Access</p>
                <p className="text-sm text-muted-foreground">Required to find people near you</p>
              </div>
              {locationGranted ? (
                <span className="text-sm text-primary font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Granted
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={requestLocation}>
                  Enable
                </Button>
              )}
            </div>
            {locationGranted && location && (
              <p className="text-xs text-muted-foreground">
                Approximate location received. Your exact address is never shared.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={!ageConfirmed || !locationGranted || isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Get Started
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
