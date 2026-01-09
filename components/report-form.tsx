"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReportFormProps {
  user: User
}

const reportReasons = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam or scam" },
  { value: "fake", label: "Fake profile" },
  { value: "underage", label: "User appears to be underage" },
  { value: "other", label: "Other" },
]

export function ReportForm({ user }: ReportFormProps) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return

    setIsSubmitting(true)
    try {
      await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          reason,
          description: description.trim() || undefined,
        }),
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error("Failed to submit report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 pb-32 md:pb-12">
        <Card className="rounded-[3rem] border-4 border-muted shadow-2xl overflow-hidden">
          <CardContent className="pt-12 pb-12 text-center px-10">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30 animate-in zoom-in-75 duration-700">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-4">Report Submitted!</h2>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed text-lg">
              Thank you for helping keep our community safe. We&apos;ll review your report carefully.
            </p>
            <Button size="lg" className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => router.push("/discover")}>
              Back to Discover 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-32 md:pb-12">
      <Button variant="ghost" size="sm" className="mb-6 gap-2 rounded-2xl hover:bg-primary/10 hover:text-primary font-bold transition-all px-6 border-2 border-transparent hover:border-primary/20" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Button>

      <Card className="rounded-[3rem] border-4 border-muted shadow-2xl overflow-hidden">
        <CardHeader className="pt-12 px-10 pb-8 bg-primary/5 border-b-2 border-primary/5">
          <CardTitle className="text-4xl font-black tracking-tighter">Report User</CardTitle>
          <CardDescription className="text-lg font-bold text-muted-foreground/80 mt-2">Help us protect the pack. All reports are strictly confidential. 🛡️</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-10">
          {/* User being reported */}
          <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-muted/20 border-2 border-muted">
            <Avatar className="w-14 h-14 rounded-2xl border-2 border-background shadow-md">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-black tracking-tight leading-tight">{user.name}</p>
              <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Reporting this user</p>
            </div>
          </div>

          {/* Reason selection */}
          <div className="space-y-4">
            <Label className="text-lg font-black px-1">What&apos;s the issue?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reportReasons.map((item) => (
                <div key={item.value} className={cn(
                  "flex items-center space-x-3 p-4 rounded-2xl border-2 border-muted transition-all cursor-pointer hover:border-primary/30",
                  reason === item.value && "border-primary bg-primary/5 shadow-md"
                )}>
                  <RadioGroupItem value={item.value} id={item.value} className="w-5 h-5" />
                  <Label htmlFor={item.value} className="font-bold cursor-pointer text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional details */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg font-black px-1">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help our team review this report..."
              rows={5}
              maxLength={500}
              className="rounded-2xl border-2 border-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 font-medium p-5 resize-none"
            />
            <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest text-right pr-2">{description.length}/500</p>
          </div>
        </CardContent>
        <CardFooter className="p-10 pt-0">
          <Button className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={handleSubmit} disabled={!reason || isSubmitting}>
            {isSubmitting ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : "Submit Report"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
