import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/stack-auth"
import { safetyService } from "@/lib/services/safety-service"

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    await safetyService.blockUser(authUser.id, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error blocking user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    await safetyService.unblockUser(authUser.id, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unblocking user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
