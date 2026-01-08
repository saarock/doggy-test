import { stackServerApp } from "@/lib/auth/stack-auth"
import { userService } from "@/lib/services/user-service"
import { safetyService } from "@/lib/services/safety-service"
import { redirect, notFound } from "next/navigation"
import { UserProfile } from "@/components/user-profile"

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const authUser = await stackServerApp.getUser()

  if (!authUser) {
    redirect("/")
  }

  // If viewing own profile, redirect to profile page
  if (userId === authUser.id) {
    redirect("/profile")
  }

  // Check if blocked
  const isBlocked = await safetyService.isUserBlocked(authUser.id, userId)
  if (isBlocked) {
    notFound()
  }

  const user = await userService.getUserById(userId)
  if (!user) {
    notFound()
  }

  // Get current user for distance calculation
  const currentUser = await userService.getUserById(authUser.id)

  // Calculate distance if both users have location
  let distance: number | null = null
  if (currentUser?.latitude && currentUser?.longitude && user.latitude && user.longitude) {
    const R = 6371 // Earth's radius in km
    const dLat = ((user.latitude - currentUser.latitude) * Math.PI) / 180
    const dLon = ((user.longitude - currentUser.longitude) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentUser.latitude * Math.PI) / 180) *
        Math.cos((user.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    distance = R * c
  }

  return <UserProfile user={user} distance={distance} currentUserId={authUser.id} />
}
