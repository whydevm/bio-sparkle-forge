-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects are viewable by everyone
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects
  FOR SELECT
  USING (true);

-- Users can manage their own projects
CREATE POLICY "Users can manage their own projects"
  ON public.projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = projects.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add new columns to profiles table for settings
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS scroll_text TEXT DEFAULT 'Scroll for more',
  ADD COLUMN IF NOT EXISTS show_views BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_likes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_join_date BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS views_animation BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS background_effect TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS projects_title TEXT DEFAULT 'Projects',
  ADD COLUMN IF NOT EXISTS projects_description TEXT;