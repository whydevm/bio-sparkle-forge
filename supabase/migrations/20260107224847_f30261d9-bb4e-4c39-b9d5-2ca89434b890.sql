-- Add click_sound_url column to profiles table for custom click sounds
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS click_sound_url TEXT;