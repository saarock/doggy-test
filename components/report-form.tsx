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
      <div className="container mx-auto max-w-2xl px-4 py-6 pb-20 md:pb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Report Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for helping keep our community safe. We&apos;ll review your report.
            </p>
            <Button onClick={() => router.push("/discover")}>Back to Discover</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 pb-20 md:pb-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Report User</CardTitle>
          <CardDescription>Help us understand what happened. All reports are confidential.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User being reported */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">Reporting this user</p>
            </div>
          </div>

          {/* Reason selection */}
          <div className="space-y-3">
            <Label>What&apos;s the issue?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.value} id={item.value} />
                  <Label htmlFor={item.value} className="font-normal cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional details */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help us review this report..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={!reason || isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
