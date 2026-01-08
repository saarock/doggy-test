"use client"

import { useState } from "react"
import type { User } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useStackApp } from "@stackframe/stack"
import { Loader2, LogOut, Shield, MapPin, Save } from "lucide-react"
import Link from "next/link"

interface ProfileEditorProps {
  user: User
}

export function ProfileEditor({ user }: ProfileEditorProps) {
  const app = useStackApp()
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio || "")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 pb-20 md:pb-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about yourself..."
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{bio.length}/200 characters</p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div>{saveSuccess && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}</div>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Location Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.latitude && user.longitude ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your approximate location is being shared</p>
                <p className="text-xs text-muted-foreground mt-1">Only shown as distance to other users</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full dark:bg-emerald-900 dark:text-emerald-300">
                Active
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Location not set. Enable location to discover nearby people.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Safety & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            href="/profile/blocked"
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium">Blocked Users</p>
              <p className="text-sm text-muted-foreground">Manage users you&apos;ve blocked</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </Link>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Separator />
      <Button variant="outline" className="w-full text-destructive gap-2 bg-transparent" onClick={() => app.signOut()}>
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  )
}
