"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2, AlertCircle, Check, ChevronDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as Select from "@radix-ui/react-select"
import { USER_GOALS } from "@/constants"

export function OnboardingForm() {
  const router = useRouter()
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // request geolocation
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

  // toggle goal selection
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal))
    } else {
      setSelectedGoals([...selectedGoals, goal])
    }
  }

  // submit form
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
          goals: selectedGoals, // send array of selected goals
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
      <Card className="w-full max-w-md rounded-[2.5rem] border-4 border-muted shadow-2xl overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/25 rotate-3">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">Welcome! 🐶🌈</CardTitle>
          <CardDescription className="text-base font-medium mt-2">Just a few steps to start your colorful journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Age Confirmation */}
          <div className="flex items-start gap-4 p-6 rounded-[2rem] border-4 border-muted bg-muted/20 hover:border-primary/30 transition-all group">
            <Checkbox
              id="age"
              checked={ageConfirmed}
              className="mt-1 w-7 h-7 rounded-xl border-2 border-primary/20 bg-background transition-all data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              onCheckedChange={(checked) => setAgeConfirmed(checked === true)}
            />
            <div className="space-y-2">
              <Label htmlFor="age" className="text-xl font-black tracking-tighter cursor-pointer block leading-tight group-hover:text-primary transition-colors">
                I&apos;m 18 or older
              </Label>
              <p className="text-sm text-muted-foreground/80 font-bold leading-relaxed">
                This exclusive neighborhood is for grown-ups only. Time to join the fun! ✨
              </p>
            </div>
          </div>

          {/* Location Permission */}
          <div className="p-6 rounded-[2rem] border-4 border-muted bg-muted/20 space-y-6 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xl font-black tracking-tighter leading-tight">Location Access</p>
                <p className="text-sm text-muted-foreground/80 font-bold mt-1">Sniff out new friends near you!</p>
              </div>
              {locationGranted ? (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 animate-in zoom-in-75">
                  <MapPin className="w-4 h-4" />
                  FOUND YA!
                </div>
              ) : (
                <Button variant="outline" size="lg" onClick={requestLocation} className="rounded-2xl font-black border-4 px-8 h-12 shadow-lg hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all">
                  ENABLE 📍
                </Button>
              )}
            </div>
            {locationGranted && location && (
              <p className="text-xs text-primary/80 font-black uppercase tracking-widest bg-primary/5 p-4 rounded-2xl border-2 border-primary/10 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                Roughly located! We respect your privacy.
              </p>
            )}
          </div>

          {/* Multi-Select Goals */}
          <div>
            <Label className="text-xl font-black tracking-tighter block leading-tight mb-2">
              Why are you here?
            </Label>

            <div className="border rounded-md bg-background">
              {USER_GOALS.map((goal) => (
                <div
                  key={goal}
                  className={`flex m-1 items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent rounded-md ${selectedGoals.includes(goal) ? "bg-primary/20" : ""
                    }`}
                  onClick={() => toggleGoal(goal)}
                >
                  <span>{goal}</span>
                  {selectedGoals.includes(goal) && <Check className="w-5 h-5 text-primary" />}
                </div>
              ))}
            </div>
          </div>

        </CardContent>

        <CardFooter className="pb-10 px-8">
          <Button
            className="w-full h-14 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            size="lg"
            onClick={handleSubmit}
            disabled={!ageConfirmed || !locationGranted || isLoading || selectedGoals.length === 0}
          >
            {isLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : "Let's Go! 🚀"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
