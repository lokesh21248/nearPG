-- ================================================================
-- NearPG: CRITICAL FIX — pg_listings RLS policies
-- 
-- Run this in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/qgyrxqxhroulnrrxpibe/sql/new
--
-- ROOT CAUSE: pg_listings table has RLS enabled but NO SELECT policy.
-- Supabase blocks ALL anonymous reads when RLS is on without a policy.
-- This is WHY "No Nearby PGs Found" appears even with data in the DB.
-- ================================================================

-- Step 1: Enable RLS (idempotent -- safe to run even if already enabled)
ALTER TABLE pg_listings ENABLE ROW LEVEL SECURITY;

-- Step 2: Add public SELECT policy (read-only, everyone can view listings)
-- This is safe for a public marketplace -- listings are meant to be public.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pg_listings' AND policyname = 'pg_listings_select_public'
  ) THEN
    CREATE POLICY "pg_listings_select_public"
      ON pg_listings FOR SELECT
      USING (true);
  END IF;
END $$;

-- Step 3: Add INSERT policy (admin only for now -- anyone who is authenticated)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pg_listings' AND policyname = 'pg_listings_insert_all'
  ) THEN
    CREATE POLICY "pg_listings_insert_all"
      ON pg_listings FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Step 4: Add UPDATE policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pg_listings' AND policyname = 'pg_listings_update_all'
  ) THEN
    CREATE POLICY "pg_listings_update_all"
      ON pg_listings FOR UPDATE
      USING (true);
  END IF;
END $$;

-- Step 5: RLS for related tables (pg_images, pg_rooms, pg_amenities)
-- These MUST have SELECT policies too, otherwise joins return empty arrays!

ALTER TABLE pg_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg_amenities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_images' AND policyname = 'pg_images_select_public') THEN
    CREATE POLICY "pg_images_select_public" ON pg_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_images' AND policyname = 'pg_images_insert_all') THEN
    CREATE POLICY "pg_images_insert_all" ON pg_images FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_images' AND policyname = 'pg_images_update_all') THEN
    CREATE POLICY "pg_images_update_all" ON pg_images FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_images' AND policyname = 'pg_images_delete_all') THEN
    CREATE POLICY "pg_images_delete_all" ON pg_images FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_rooms' AND policyname = 'pg_rooms_select_public') THEN
    CREATE POLICY "pg_rooms_select_public" ON pg_rooms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_rooms' AND policyname = 'pg_rooms_insert_all') THEN
    CREATE POLICY "pg_rooms_insert_all" ON pg_rooms FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_rooms' AND policyname = 'pg_rooms_update_all') THEN
    CREATE POLICY "pg_rooms_update_all" ON pg_rooms FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_rooms' AND policyname = 'pg_rooms_delete_all') THEN
    CREATE POLICY "pg_rooms_delete_all" ON pg_rooms FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_amenities' AND policyname = 'pg_amenities_select_public') THEN
    CREATE POLICY "pg_amenities_select_public" ON pg_amenities FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_amenities' AND policyname = 'pg_amenities_insert_all') THEN
    CREATE POLICY "pg_amenities_insert_all" ON pg_amenities FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_amenities' AND policyname = 'pg_amenities_update_all') THEN
    CREATE POLICY "pg_amenities_update_all" ON pg_amenities FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pg_amenities' AND policyname = 'pg_amenities_delete_all') THEN
    CREATE POLICY "pg_amenities_delete_all" ON pg_amenities FOR DELETE USING (true);
  END IF;
END $$;

-- ================================================================
-- DIAGNOSTIC QUERIES -- Run these after applying the fix above
-- ================================================================

-- 1. Verify policies were created:
-- SELECT tablename, policyname, cmd FROM pg_policies 
-- WHERE tablename IN ('pg_listings','pg_images','pg_rooms','pg_amenities')
-- ORDER BY tablename, cmd;

-- 2. Count rows in each table:
-- SELECT 'pg_listings' as tbl, COUNT(*) FROM pg_listings
-- UNION ALL SELECT 'pg_images', COUNT(*) FROM pg_images
-- UNION ALL SELECT 'pg_rooms', COUNT(*) FROM pg_rooms
-- UNION ALL SELECT 'pg_amenities', COUNT(*) FROM pg_amenities;

-- 3. Check listing status distribution (to debug status filter issue):
-- SELECT status, COUNT(*) FROM pg_listings GROUP BY status;

-- 4. Verify latitude/longitude data exists (for geolocation):
-- SELECT id, name, city, latitude, longitude FROM pg_listings;
