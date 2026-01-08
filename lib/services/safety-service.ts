import { sql } from "@/lib/db"
import type { BlockedUser, Report } from "@/lib/db/types"

export const safetyService = {
  // Block a user
  async blockUser(blockerId: string, blockedId: string): Promise<BlockedUser> {
    const result = await sql`
      INSERT INTO blocked_users (blocker_id, blocked_id)
      VALUES (${blockerId}, ${blockedId})
      ON CONFLICT (blocker_id, blocked_id) DO NOTHING
      RETURNING *
    `
    return result[0] as BlockedUser
  },

  // Unblock a user
  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await sql`
      DELETE FROM blocked_users 
      WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}
    `
  },

  // Check if user is blocked
  async isUserBlocked(userId: string, targetId: string): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM blocked_users 
      WHERE (blocker_id = ${userId} AND blocked_id = ${targetId})
         OR (blocker_id = ${targetId} AND blocked_id = ${userId})
    `
    return result.length > 0
  },

  // Get blocked users list
  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    const result = await sql`
      SELECT bu.*, u.name, u.avatar_url
      FROM blocked_users bu
      JOIN users u ON u.id = bu.blocked_id
      WHERE bu.blocker_id = ${userId}
      ORDER BY bu.created_at DESC
    `
    return result as BlockedUser[]
  },

  // Report a user
  async reportUser(reporterId: string, reportedId: string, reason: string, description?: string): Promise<Report> {
    const result = await sql`
      INSERT INTO reports (reporter_id, reported_id, reason, description)
      VALUES (${reporterId}, ${reportedId}, ${reason}, ${description || null})
      RETURNING *
    `
    return result[0] as Report
  },
}
