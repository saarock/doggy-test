import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/stack-auth"
import { userService } from "@/lib/services/user-service"
import { safetyService } from "@/lib/services/safety-service"

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params

    // Check if blocked
    const isBlocked = await safetyService.isUserBlocked(authUser.id, userId)
    if (isBlocked) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
