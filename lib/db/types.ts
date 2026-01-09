// Database types for clean architecture

export interface User {
  id: string
  google_id: string | null
  email: string
  name: string
  avatar_url: string | null
  bio: string
  age_confirmed: boolean
  latitude: number | null
  longitude: number | null
  is_online: boolean
  last_seen: Date
  created_at: Date
  updated_at: Date
  goals: string[]
}

export interface UserWithDistance extends User {
  distance_km: number
  count?: number;
}

export interface ChatRoom {
  id: string
  user1_id: string
  user2_id: string
  created_at: Date
  updated_at: Date
}

export interface ChatRoomWithUser extends ChatRoom {
  other_user: User
  last_message?: Message
  unread_count: number
}

export interface Message {
  id: string
  chat_room_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: Date
}

export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: Date
}

export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  description: string | null
  status: "pending" | "reviewed" | "resolved"
  created_at: Date
}

export interface CreateUserInput {
  id: string
  google_id?: string
  email: string
  name: string
  avatar_url?: string
  age_confirmed: boolean
  latitude?: number
  goals: string[]
  longitude?: number
}

export interface UpdateUserInput {
  name?: string
  bio?: string
  avatar_url?: string
  latitude?: number
  // goals: string[]
  longitude?: number
  is_online?: boolean
}
