import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/stack-auth"
import { userService } from "@/lib/services/user-service"

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const latitude = Number.parseFloat(searchParams.get("latitude") || "0")
    const longitude = Number.parseFloat(searchParams.get("longitude") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "10")
    

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Location required" }, { status: 400 })
    }

    // Update current user's location
    await userService.updateUser(authUser.id, { latitude, longitude, is_online: true})

    // Get nearby users
    const nearbyUsers = await userService.getNearbyUsers(authUser.id, latitude, longitude, radius)

    return NextResponse.json(nearbyUsers)
  } catch (error) {
    console.error("Error fetching nearby users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
