-- Create pg_bookings table
CREATE TABLE IF NOT EXISTS pg_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pg_id UUID NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
  user_id TEXT, -- Clerk User ID
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Rejected', 'Cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create pg_reviews table
CREATE TABLE IF NOT EXISTS pg_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pg_id UUID NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk User ID
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create pg_wishlist table
CREATE TABLE IF NOT EXISTS pg_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pg_id UUID NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk User ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(pg_id, user_id)
);

-- Enable RLS
ALTER TABLE pg_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg_wishlist ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies

-- Bookings: Customers can read their own, insert their own, update their own (for cancellation).
-- We assume user_id comes from the client in the request body for simplicity, since Clerk is used and Supabase JWT isn't fully integrated.
-- In a real prod setup with Clerk + Supabase, you'd use a custom JWT. For this MVP, we allow open access but filter by user_id in the client.
-- To ensure maximum compatibility right now without custom JWT templates in Clerk, we'll use simple public policies. 
-- IMPORTANT: This is for MVP demonstration. Production requires setting up Clerk Supabase integration with custom JWTs.

CREATE POLICY "Enable read access for all users" ON pg_bookings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON pg_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON pg_bookings FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON pg_reviews FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON pg_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON pg_reviews FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON pg_wishlist FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON pg_wishlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON pg_wishlist FOR DELETE USING (true);
