import { stackServerApp } from "@/lib/auth/stack-auth"
import { chatService } from "@/lib/services/chat-service"
import { userService } from "@/lib/services/user-service"
import { redirect, notFound } from "next/navigation"
import { ChatRoom } from "@/components/chat-room"

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const user = await stackServerApp.getUser()

  if (!user) {
    redirect("/")
  }

  const room = await chatService.getChatRoomById(roomId)
  if (!room) {
    notFound()
    return;
  }

  // Check if user is part of this chat
  const isInRoom = await chatService.isUserInChatRoom(roomId, user.id)
  if (!isInRoom) {
    redirect("/chats")
  }

  // Get the other user
  const otherUserId = room?.user1_id === user.id ? room?.user2_id : room?.user1_id
  if (!otherUserId) {
    notFound();
  }
  const otherUser = await userService.getUserById(otherUserId)

  if (!otherUser) {
    notFound()
  }

  return <ChatRoom roomId={roomId} currentUserId={user.id} otherUser={otherUser} />
}
