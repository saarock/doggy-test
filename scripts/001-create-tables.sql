-- Enable PostGIS extension for geo-queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table with location support
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  age_confirmed BOOLEAN DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for fast geo-queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_online ON users (is_online);

-- Chat rooms (one-to-one conversations)
CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1 ON chat_rooms(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2 ON chat_rooms(user2_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  chat_room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_room ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Function to update location geography from lat/long
CREATE OR REPLACE FUNCTION update_user_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update location
DROP TRIGGER IF EXISTS trigger_update_user_location ON users;
CREATE TRIGGER trigger_update_user_location
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_location();
