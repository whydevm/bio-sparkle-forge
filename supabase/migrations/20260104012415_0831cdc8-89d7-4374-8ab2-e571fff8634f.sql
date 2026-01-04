-- Add new profile columns for remaining features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS entry_emoji text,
ADD COLUMN IF NOT EXISTS entry_emoji_position text DEFAULT 'start',
ADD COLUMN IF NOT EXISTS join_date_format text DEFAULT 'MMM dd, yyyy',
ADD COLUMN IF NOT EXISTS join_time_format text DEFAULT '12h',
ADD COLUMN IF NOT EXISTS join_timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS avatar_radius integer DEFAULT 100;