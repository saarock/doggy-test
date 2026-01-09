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
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-32 md:pb-12 space-y-8">
      <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Profile Editor</h1>

      {/* Profile Card */}
      <Card className="rounded-[2.5rem] border-4 border-muted shadow-xl overflow-hidden">
        <CardHeader className="pt-10 px-10 pb-6 bg-primary/5 border-b-2 border-primary/5">
          <div className="flex items-center gap-6">
            <Avatar className="w-28 h-28 rounded-[2rem] shadow-2xl border-4 border-background -rotate-3 hover:rotate-0 transition-all duration-500">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="text-4xl bg-primary/20 text-primary font-black uppercase">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl font-black tracking-tight">{user.name}</CardTitle>
              <CardDescription className="font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest text-[10px]">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8 pt-2">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-bold px-1">Display Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} className="rounded-2xl h-12 border-2 border-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 font-medium px-5" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-base font-bold px-1">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about yourself..."
              maxLength={200}
              rows={4}
              className="rounded-2xl border-2 border-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 font-medium p-5 resize-none"
            />
            <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest text-right pr-2">{bio.length}/200</p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-8 pt-0">
          <div>{saveSuccess && <span className="text-sm text-emerald-600 font-extrabold px-4 py-2 bg-emerald-500/10 rounded-full animate-in fade-in slide-in-from-left-2 uppercase tracking-wider text-[10px]">Changes Saved!</span>}</div>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()} className="h-12 px-8 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Profile
          </Button>
        </CardFooter>
      </Card>

      {/* Location Info */}
      <Card className="rounded-[2.5rem] border-4 border-muted shadow-lg overflow-hidden">
        <CardHeader className="p-6 px-8 bg-muted/20">
          <CardTitle className="text-lg font-black flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {user.latitude && user.longitude ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">Your location is being shared</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Only shown as distance to other users for your privacy</p>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 p-5 rounded-3xl border-2 border-amber-500/20 text-center">
              <p className="text-sm font-bold text-amber-700">Location not set</p>
              <p className="text-xs text-amber-600/80 font-medium mt-1">Enable location to discover nearby people</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety & Privacy */}
      <Card className="rounded-[2.5rem] border-4 border-muted shadow-lg overflow-hidden">
        <CardHeader className="p-6 px-8 bg-muted/20">
          <CardTitle className="text-lg font-black flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Shield className="w-5 h-5" />
            </div>
            Safety & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <Link
            href="/profile/blocked"
            className="group flex items-center justify-between p-5 rounded-3xl border-2 border-muted hover:border-primary/30 hover:bg-muted/30 transition-all"
          >
            <div className="flex-1">
              <p className="font-bold text-lg leading-tight">Blocked Users</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Manage users you&apos;ve blocked</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="text-xl font-black">→</span>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <div className="pt-4 pb-20">
        <Button
          variant="outline"
          className="w-full h-16 rounded-[2rem] font-black border-4 border-destructive/20 bg-gradient-to-r from-destructive/5 to-destructive/10 hover:from-destructive/10 hover:to-destructive/20 hover:border-destructive/40 transition-all text-xl gap-4 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-destructive group"
          onClick={() => app.signOut()}
        >
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
            <LogOut className="w-6 h-6 rotate-180" />
          </div>
          Sign Out of Doggy
        </Button>
      </div>
    </div>
  )
}
