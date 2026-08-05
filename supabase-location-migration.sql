-- ================================================================
-- NearPG: location tables migration
-- ================================================================

-- 1. Create states table
CREATE TABLE IF NOT EXISTS states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(state_id, name)
);

-- 3. Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(city_id, name)
);

-- 4. Alter pg_listings table to add location foreign keys and other fields
-- Check if columns exist before adding them (standard PG migration compatibility)
ALTER TABLE pg_listings ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES states(id) ON DELETE SET NULL;
ALTER TABLE pg_listings ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id) ON DELETE SET NULL;
ALTER TABLE pg_listings ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id) ON DELETE SET NULL;
ALTER TABLE pg_listings ADD COLUMN IF NOT EXISTS pincode TEXT;

-- Enable RLS on new tables
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Simple public policies for MVP compatibility
CREATE POLICY "Allow public read states" ON states FOR SELECT USING (true);
CREATE POLICY "Allow public write states" ON states FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update states" ON states FOR UPDATE USING (true);
CREATE POLICY "Allow public delete states" ON states FOR DELETE USING (true);

CREATE POLICY "Allow public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public write cities" ON cities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update cities" ON cities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete cities" ON cities FOR DELETE USING (true);

CREATE POLICY "Allow public read areas" ON areas FOR SELECT USING (true);
CREATE POLICY "Allow public write areas" ON areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update areas" ON areas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete areas" ON areas FOR DELETE USING (true);

-- 5. Seed Initial Data
DO $$
DECLARE
  telangana_id UUID;
  karnataka_id UUID;
  maharashtra_id UUID;
  ap_id UUID;
  
  hyderabad_id UUID;
  bangalore_id UUID;
  pune_id UUID;
  kphp_city_id UUID;
BEGIN
  -- Insert States
  INSERT INTO states (name) VALUES ('Telangana') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO telangana_id;
  INSERT INTO states (name) VALUES ('Karnataka') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO karnataka_id;
  INSERT INTO states (name) VALUES ('Maharashtra') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO maharashtra_id;
  INSERT INTO states (name) VALUES ('Andhra Pradesh') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO ap_id;

  -- Insert Cities
  INSERT INTO cities (state_id, name) VALUES (telangana_id, 'Hyderabad') ON CONFLICT (state_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO hyderabad_id;
  INSERT INTO cities (state_id, name) VALUES (karnataka_id, 'Bangalore') ON CONFLICT (state_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO bangalore_id;
  INSERT INTO cities (state_id, name) VALUES (maharashtra_id, 'Pune') ON CONFLICT (state_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO pune_id;
  INSERT INTO cities (state_id, name) VALUES (ap_id, 'kphp') ON CONFLICT (state_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO kphp_city_id;

  -- Insert Areas (Telangana -> Hyderabad)
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'KPHB') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'Kukatpally') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'Madhapur') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'Gachibowli') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'Kondapur') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'Miyapur') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'Ameerpet') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (hyderabad_id, 'Hitech City') ON CONFLICT (city_id, name) DO NOTHING;

  -- Insert Areas (Karnataka -> Bangalore)
  INSERT INTO areas (city_id, name) VALUES (bangalore_id, 'Koramangala') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (bangalore_id, 'HSR Layout') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (bangalore_id, 'Whitefield') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (bangalore_id, 'Indiranagar') ON CONFLICT (city_id, name) DO NOTHING;

  -- Insert Areas (Maharashtra -> Pune)
  INSERT INTO areas (city_id, name) VALUES (pune_id, 'Baner') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (pune_id, 'Hinjawadi') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (pune_id, 'Viman Nagar') ON CONFLICT (city_id, name) DO NOTHING;
  INSERT INTO areas (city_id, name) VALUES (pune_id, 'Kothrud') ON CONFLICT (city_id, name) DO NOTHING;

  -- Insert Area for existing test entry (Andhra Pradesh -> kphp -> hydrebad)
  INSERT INTO areas (city_id, name) VALUES (kphp_city_id, 'hydrebad') ON CONFLICT (city_id, name) DO NOTHING;
END $$;

-- 6. Link existing listing if it matches Andhra Pradesh -> kphp -> hydrebad
-- Update the columns on pg_listings to link to these foreign keys
UPDATE pg_listings
SET
  state_id = (SELECT id FROM states WHERE name = pg_listings.state LIMIT 1),
  city_id = (SELECT id FROM cities WHERE name = pg_listings.city LIMIT 1),
  area_id = (SELECT id FROM areas WHERE name = pg_listings.area LIMIT 1)
WHERE state_id IS NULL OR city_id IS NULL OR area_id IS NULL;
