-- Add cycling_bio_enabled column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cycling_bio_enabled boolean DEFAULT false;