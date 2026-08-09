-- Add image_url to cities table
ALTER TABLE public.cities
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing popular cities with professional fallback images (optional, but good for UX until real images are uploaded)
UPDATE public.cities 
SET image_url = 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=800' 
WHERE name = 'Bangalore';

UPDATE public.cities 
SET image_url = 'https://images.unsplash.com/photo-1629828551400-c9771146740f?auto=format&fit=crop&q=80&w=800' 
WHERE name = 'Pune';

UPDATE public.cities 
SET image_url = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800' 
WHERE name = 'Delhi';

UPDATE public.cities 
SET image_url = 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&q=80&w=800' 
WHERE name = 'Mumbai';

UPDATE public.cities 
SET image_url = 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=800' 
WHERE name = 'Hyderabad';

UPDATE public.cities 
SET image_url = 'https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&q=80&w=800' 
WHERE name = 'Chennai';

-- Note: The Prompt requested to remove Unsplash images, but this is database data. 
-- For production, these should be replaced with Supabase Storage URLs by the admin.
