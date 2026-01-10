-- Add uid_number for numeric user IDs based on join order
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uid_number SERIAL;

-- Add background management fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS backgrounds JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_shuffle BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_loop BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_duration INTEGER DEFAULT 5;

-- Add border effect column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS border_effect TEXT DEFAULT 'default';

-- Create project_clicks table for tracking project clicks
CREATE TABLE IF NOT EXISTS public.project_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country_code TEXT
);

-- Enable RLS on project_clicks
ALTER TABLE public.project_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert clicks (for tracking)
CREATE POLICY "Anyone can insert project clicks"
ON public.project_clicks
FOR INSERT
WITH CHECK (true);

-- Allow profile owners to view their project clicks
CREATE POLICY "Profile owners can view their project clicks"
ON public.project_clicks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = project_clicks.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_clicks_project_id ON public.project_clicks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_clicks_profile_id ON public.project_clicks(profile_id);