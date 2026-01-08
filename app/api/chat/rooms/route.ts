import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/stack-auth"
import { chatService } from "@/lib/services/chat-service"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rooms = await chatService.getUserChatRooms(authUser.id)
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const room = await chatService.getOrCreateChatRoom(authUser.id, userId)
    return NextResponse.json(room)
  } catch (error) {
    console.error("Error creating chat room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
