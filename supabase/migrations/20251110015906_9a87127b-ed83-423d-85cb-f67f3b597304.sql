-- Add cover_url column to profile_music table
ALTER TABLE public.profile_music 
ADD COLUMN IF NOT EXISTS cover_url text;