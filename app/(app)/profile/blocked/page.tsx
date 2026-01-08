import { stackServerApp } from "@/lib/auth/stack-auth"
import { safetyService } from "@/lib/services/safety-service"
import { redirect } from "next/navigation"
import { BlockedUsersList } from "@/components/blocked-users-list"

export default async function BlockedUsersPage() {
  const authUser = await stackServerApp.getUser()

  if (!authUser) {
    redirect("/")
  }

  const blockedUsers = await safetyService.getBlockedUsers(authUser.id)

  return <BlockedUsersList blockedUsers={blockedUsers} />
}
