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
      <Button variant="ghost" size="sm" className="mb-6 gap-2 rounded-2xl hover:bg-primary/10 hover:text-primary font-bold transition-all px-6 border-2 border-transparent hover:border-primary/20" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Button>

      <Card className="rounded-[3rem] border-4 border-muted shadow-2xl overflow-hidden">
        <CardHeader className="pt-10 px-10 pb-6 bg-muted/20">
          <CardTitle className="text-3xl font-black tracking-tighter">Safety First! 🛡️</CardTitle>
          <CardDescription className="text-base font-bold text-muted-foreground/60">People on this list won&apos;t be able to see you or send you messages.</CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          {blockedUsers.length === 0 ? (
            <div className="text-center py-12 bg-muted/10 rounded-[2rem] border-4 border-dashed border-muted">
              <div className="w-24 h-24 rounded-[1.5rem] bg-white dark:bg-card flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-muted transition-transform">
                <UserX className="w-12 h-12 text-primary/40" />
              </div>
              <p className="text-xl font-black tracking-tight text-muted-foreground/60 px-8 leading-tight uppercase tracking-widest text-[10px]">Your block list is empty. Everyone is being a good dog! 🦴</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-muted">
              {blockedUsers.map((blockedUser) => (
                <div key={blockedUser.id} className="flex items-center justify-between py-5 group first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 rounded-2xl border-4 border-background shadow-lg transition-transform group-hover:scale-105">
                      <AvatarImage src={blockedUser.avatar_url || undefined} alt={blockedUser.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xl">{(blockedUser.name || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-black text-xl tracking-tight group-hover:text-primary transition-colors">{blockedUser.name || "Unknown User"}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6 rounded-2xl font-black text-[10px] tracking-widest uppercase border-4 border-muted hover:border-primary/30 hover:bg-primary/5 transition-all shadow-md active:scale-95"
                    onClick={() => handleUnblock(blockedUser.blocked_id)}
                    disabled={unblockingId === blockedUser.blocked_id}
                  >
                    {unblockingId === blockedUser.blocked_id ? <Loader2 className="w-4 h-4 animate-spin" /> : "UNBLOCK"}
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
