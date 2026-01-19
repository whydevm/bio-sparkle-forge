-- Add Discord sync settings to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS discord_avatar_sync boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS discord_decoration_sync boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS discord_user_id text;