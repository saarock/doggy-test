"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { BlockedUser } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, UserX } from "lucide-react"

interface BlockedUsersListProps {
  blockedUsers: (BlockedUser & { name?: string; avatar_url?: string })[]
}

export function BlockedUsersList({ blockedUsers: initialBlockedUsers }: BlockedUsersListProps) {
  const router = useRouter()
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  const handleUnblock = async (userId: string) => {
    setUnblockingId(userId)
    try {
      await fetch(`/api/safety/block?userId=${userId}`, {
        method: "DELETE",
      })
      setBlockedUsers((prev) => prev.filter((u) => u.blocked_id !== userId))
    } catch (error) {
      console.error("Failed to unblock user:", error)
    } finally {
      setUnblockingId(null)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 pb-20 md:pb-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>Users you&apos;ve blocked can&apos;t see you or send you messages.</CardDescription>
        </CardHeader>
        <CardContent>
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">You haven&apos;t blocked anyone.</p>
            </div>
          ) : (
            <div className="divide-y">
              {blockedUsers.map((blockedUser) => (
                <div key={blockedUser.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={blockedUser.avatar_url || undefined} alt={blockedUser.name || "User"} />
                      <AvatarFallback>{(blockedUser.name || "U").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{blockedUser.name || "Unknown User"}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(blockedUser.blocked_id)}
                    disabled={unblockingId === blockedUser.blocked_id}
                  >
                    {unblockingId === blockedUser.blocked_id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unblock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
