import { sql } from "@/lib/db";
import type {
  User,
  UserWithDistance,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/db/types";

export const userService = {
  // Create or update user on login
  async upsertUser(input: CreateUserInput): Promise<User> {
    const result = await sql`
    INSERT INTO users (
      id, google_id, email, name, avatar_url, age_confirmed, latitude, longitude, is_online, goals
    )
    VALUES (
      ${input.id},
      ${input.google_id || null},
      ${input.email},
      ${input.name},
      ${input.avatar_url || null},
      ${input.age_confirmed},
      ${input.latitude || null},
      ${input.longitude || null},
      true,
      ${input.goals || []}  -- <- pass the goals array here
    )
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, users.name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      latitude = COALESCE(EXCLUDED.latitude, users.latitude),
      longitude = COALESCE(EXCLUDED.longitude, users.longitude),
      is_online = true,
      goals = COALESCE(EXCLUDED.goals, users.goals),
      last_seen = NOW(),
      updated_at = NOW()
    RETURNING *
  `;
    return result[0] as User;
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return (result[0] as User) || null;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return (result[0] as User) || null;
  },

  // Update user profile
  async updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
    const updates: string[] = [];
    const values: Record<string, unknown> = { id };

    if (input.name !== undefined) {
      updates.push("name = ${name}");
      values.name = input.name;
    }
    if (input.bio !== undefined) {
      updates.push("bio = ${bio}");
      values.bio = input.bio;
    }
    if (input.avatar_url !== undefined) {
      updates.push("avatar_url = ${avatar_url}");
      values.avatar_url = input.avatar_url;
    }
    if (input.latitude !== undefined) {
      updates.push("latitude = ${latitude}");
      values.latitude = input.latitude;
    }
    if (input.longitude !== undefined) {
      updates.push("longitude = ${longitude}");
      values.longitude = input.longitude;
    }
    if (input.is_online !== undefined) {
      updates.push("is_online = ${is_online}");
      values.is_online = input.is_online;
    }

    const result = await sql`
      UPDATE users 
      SET name = COALESCE(${input.name || null}, name),
          bio = COALESCE(${input.bio || null}, bio),
          avatar_url = COALESCE(${input.avatar_url || null}, avatar_url),
          latitude = COALESCE(${input.latitude || null}, latitude),
          longitude = COALESCE(${input.longitude || null}, longitude),
          is_online = COALESCE(${input.is_online ?? null}, is_online),
          last_seen = CASE WHEN ${
            input.is_online ?? null
          } = true THEN NOW() ELSE last_seen END,
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return (result[0] as User) || null;
  },

  // Get nearby users within radius (in km)
  async getNearbyUsers(
    userId: string,
    latitude: number,
    longitude: number,
    radiusKm = 10
  ): Promise<UserWithDistance[]> {
    const radiusMeters = radiusKm * 1000;

    const result = await sql`
      SELECT 
        u.*,
        ST_Distance(
          u.location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) / 1000 as distance_km
      FROM users u
      WHERE u.id != ${userId}
        AND u.age_confirmed = true
        AND u.latitude IS NOT NULL
        AND u.longitude IS NOT NULL
        AND u.id NOT IN (
          SELECT blocked_id FROM blocked_users WHERE blocker_id = ${userId}
          UNION
          SELECT blocker_id FROM blocked_users WHERE blocked_id = ${userId}
        )
        AND ST_DWithin(
          u.location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY distance_km ASC
      LIMIT 50
    `;
    return result as UserWithDistance[];
  },

  async getUsersWithFilters(
    userId: string,
    latitude: number,
    longitude: number,
    radiusKm = 1000000,
    goals: string[],
    page = 1,
    limit = 20
  ): Promise<UserWithDistance[]> {
    const radiusMeters = radiusKm * 1000;
    const offset = (page - 1) * limit;

    const result = await sql`
    SELECT u.*,
           ST_Distance(
             u.location,
             ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
           ) / 1000 AS distance_km
    FROM users u
    WHERE u.id != ${userId}
      AND u.age_confirmed = true
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
      AND u.id NOT IN (
        SELECT blocked_id FROM blocked_users WHERE blocker_id = ${userId}
        UNION
        SELECT blocker_id FROM blocked_users WHERE blocked_id = ${userId}
      )
      AND ST_DWithin(
        u.location,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
      ${goals.length > 0 ? sql`AND u.goals && ${goals}` : sql``}
    ORDER BY distance_km ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

    // Convert PostgreSQL array strings to JS arrays
    return result.map((user) => ({
      ...user,
      goals: Array.isArray(user.goals)
        ? user.goals
        : (user.goals || "").replace(/[{}]/g, "").split(",").filter(Boolean),
    })) as UserWithDistance[];
  },

  async countUsersWithFilters(
    userId: string,
    latitude: number,
    longitude: number,
    radiusKm: number,
    goals: string[]
  ) {
    const radiusMeters = radiusKm * 1000;

    const result = await sql`
    SELECT COUNT(*) FROM users u
    WHERE u.id != ${userId}
      AND u.age_confirmed = true
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
      AND u.id NOT IN (
        SELECT blocked_id FROM blocked_users WHERE blocker_id = ${userId}
        UNION
        SELECT blocker_id FROM blocked_users WHERE blocked_id = ${userId}
      )
      AND ST_DWithin(
        u.location,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
      ${goals.length > 0 ? sql`AND u.goals && ${goals}` : sql``};
  `;
    return result;
  },

  // Update user online status
  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await sql`
      UPDATE users 
      SET is_online = ${isOnline}, last_seen = NOW()
      WHERE id = ${userId}
    `;
  },
};
