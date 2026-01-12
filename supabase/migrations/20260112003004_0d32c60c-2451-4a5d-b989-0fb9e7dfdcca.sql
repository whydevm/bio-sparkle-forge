-- Add show_entry_background column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_entry_background boolean DEFAULT true;