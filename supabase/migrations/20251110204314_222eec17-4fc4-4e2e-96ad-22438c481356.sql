-- Add audio player settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_audio_player boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS audio_shuffle boolean DEFAULT false;