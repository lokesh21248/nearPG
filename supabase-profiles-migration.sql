-- ================================================================
-- NearPG: profiles table migration
-- Run this in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/qgyrxqxhroulnrrxpibe/sql/new
-- ================================================================

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id            TEXT PRIMARY KEY,            -- Firebase UID
  full_name     TEXT NOT NULL,
  phone_number  TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast phone lookups (used in login flow)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone_number);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read any profile (for internal lookups by phone during login)
-- You can tighten this to authenticated-only once Supabase Auth is configured
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Allow any authenticated request to insert a profile
CREATE POLICY "profiles_insert_all"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Allow any authenticated request to update a profile
CREATE POLICY "profiles_update_all"
  ON profiles FOR UPDATE
  USING (true);

-- ================================================================
-- Verify
-- ================================================================
-- SELECT * FROM profiles LIMIT 5;
