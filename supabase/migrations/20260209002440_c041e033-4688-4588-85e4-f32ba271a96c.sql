-- Add cursor trailing settings to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cursor_trailing_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cursor_trail_count integer DEFAULT 8;