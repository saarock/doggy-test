import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/stack-auth"
import { safetyService } from "@/lib/services/safety-service"

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, reason, description } = await request.json()
    if (!userId || !reason) {
      return NextResponse.json({ error: "User ID and reason required" }, { status: 400 })
    }

    const report = await safetyService.reportUser(authUser.id, userId, reason, description)
    return NextResponse.json(report)
  } catch (error) {
    console.error("Error reporting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
