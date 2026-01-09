import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/stack-auth"
import { userService } from "@/lib/services/user-service"

// Sync Stack Auth user to our database
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ageConfirmed, latitude, longitude, goals } = await request.json()

    console.log(goals)

    const user = await userService.upsertUser({
      id: authUser.id,
      email: authUser.primaryEmail || "",
      name: authUser.displayName || "Anonymous",
      avatar_url: authUser.profileImageUrl || undefined,
      age_confirmed: ageConfirmed || false,
      latitude,
      longitude,
      goals: goals || []
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
