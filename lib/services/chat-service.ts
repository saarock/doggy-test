import { sql } from "@/lib/db"
import type { ChatRoom, ChatRoomWithUser, Message } from "@/lib/db/types"

export const chatService = {
  // Get or create a chat room between two users
  async getOrCreateChatRoom(user1Id: string, user2Id: string): Promise<ChatRoom> {
    // Ensure consistent ordering of user IDs
    const [firstId, secondId] = [user1Id, user2Id].sort()

    // Try to find existing room
    const existing = await sql`
      SELECT * FROM chat_rooms 
      WHERE (user1_id = ${firstId} AND user2_id = ${secondId})
         OR (user1_id = ${secondId} AND user2_id = ${firstId})
    `

    if (existing.length > 0) {
      return existing[0] as ChatRoom
    }

    // Create new room
    const result = await sql`
      INSERT INTO chat_rooms (user1_id, user2_id)
      VALUES (${firstId}, ${secondId})
      RETURNING *
    `
    
    return result[0] as ChatRoom
  },

  // Get chat room by ID
  async getChatRoomById(roomId: string): Promise<ChatRoom | null> {
    const result = await sql`
      SELECT * FROM chat_rooms WHERE id = ${roomId}
    `
    return (result[0] as ChatRoom) || null
  },

  // Get all chat rooms for a user with other user info and last message
  async getUserChatRooms(userId: string, ): Promise<ChatRoomWithUser[]> {
    const result = await sql`
      SELECT 
        cr.*,
        CASE 
          WHEN cr.user1_id = ${userId} THEN cr.user2_id 
          ELSE cr.user1_id 
        END as other_user_id,
        u.name as other_user_name,
        u.avatar_url as other_user_avatar,
        u.is_online as other_user_online,
        u.last_seen as other_user_last_seen,
        (
          SELECT row_to_json(m.*)
          FROM messages m 
          WHERE m.chat_room_id = cr.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*)::int 
          FROM messages m 
          WHERE m.chat_room_id = cr.id 
            AND m.sender_id != ${userId}
            AND m.is_read = false
        ) as unread_count
      FROM chat_rooms cr
      JOIN users u ON u.id = CASE 
        WHEN cr.user1_id = ${userId} THEN cr.user2_id 
        ELSE cr.user1_id 
      END
      WHERE cr.user1_id = ${userId} OR cr.user2_id = ${userId}
      ORDER BY cr.updated_at DESC
      limit 10
    `

    return result.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      user1_id: row.user1_id as string,
      user2_id: row.user2_id as string,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      other_user: {
        id: row.other_user_id as string,
        name: row.other_user_name as string,
        avatar_url: row.other_user_avatar as string,
        is_online: row.other_user_online as boolean,
        last_seen: row.other_user_last_seen as Date,
      },
      last_message: row.last_message as Message | undefined,
      unread_count: row.unread_count as number,
    })) as ChatRoomWithUser[]
  },

  // Send a message
  async sendMessage(chatRoomId: string, senderId: string, content: string): Promise<Message> {
    const result = await sql`
      INSERT INTO messages (chat_room_id, sender_id, content)
      VALUES (${chatRoomId}, ${senderId}, ${content})
      RETURNING *
    `

    // Update chat room timestamp
    await sql`
      UPDATE chat_rooms SET updated_at = NOW() WHERE id = ${chatRoomId}
    `

    return result[0] as Message
  },

  // Get messages for a chat room
  async getMessages(chatRoomId: string, limit = 50, before?: string): Promise<Message[]> {
    if (before) {
      const result = await sql`
        SELECT * FROM messages 
        WHERE chat_room_id = ${chatRoomId}
          AND created_at < (SELECT created_at FROM messages WHERE id = ${before})
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
      return (result as Message[]).reverse()
    }

    const result = await sql`
      SELECT * FROM messages 
      WHERE chat_room_id = ${chatRoomId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return (result as Message[]).reverse()
  },

  // Mark messages as read
  async markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
    await sql`
      UPDATE messages 
      SET is_read = true 
      WHERE chat_room_id = ${chatRoomId}
        AND sender_id != ${userId}
        AND is_read = false
    `
  },

  // Check if user is part of chat room
  async isUserInChatRoom(chatRoomId: string, userId: string): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM chat_rooms 
      WHERE id = ${chatRoomId}
        AND (user1_id = ${userId} OR user2_id = ${userId})
    `
    return result.length > 0
  },
}
