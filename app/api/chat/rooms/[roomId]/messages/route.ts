import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/stack-auth"
import { chatService } from "@/lib/services/chat-service"

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await params
    const { searchParams } = new URL(request.url)
    const before = searchParams.get("before") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Verify user is part of this chat
    const isInRoom = await chatService.isUserInChatRoom(roomId, authUser.id)
    if (!isInRoom) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Mark messages as read
    await chatService.markMessagesAsRead(roomId, authUser.id)

    const messages = await chatService.getMessages(roomId, limit, before)
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await params
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 })
    }

    // Verify user is part of this chat
    const isInRoom = await chatService.isUserInChatRoom(roomId, authUser.id)
    if (!isInRoom) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const message = await chatService.sendMessage(roomId, authUser.id, content.trim())
    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
