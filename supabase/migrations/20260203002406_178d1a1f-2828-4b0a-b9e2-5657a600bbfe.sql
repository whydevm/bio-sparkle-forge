-- Add show_badges_on_profile column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_badges_on_profile boolean DEFAULT true;