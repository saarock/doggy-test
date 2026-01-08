import { stackServerApp } from "@/lib/auth/stack-auth"
import { userService } from "@/lib/services/user-service"
import { redirect } from "next/navigation"
import { ProfileEditor } from "@/components/profile-editor"

export default async function ProfilePage() {
  const authUser = await stackServerApp.getUser()

  if (!authUser) {
    redirect("/")
  }

  const user = await userService.getUserById(authUser.id)

  if (!user) {
    redirect("/onboarding")
  }

  return <ProfileEditor user={user} />
}
