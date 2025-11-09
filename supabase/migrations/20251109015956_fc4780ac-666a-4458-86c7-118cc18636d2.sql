-- Add location and entry text font to profiles
ALTER TABLE profiles
ADD COLUMN location TEXT,
ADD COLUMN entry_text_font TEXT DEFAULT 'font-sans';

-- Create table to track unique profile views
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, viewer_id)
);

-- Enable RLS on profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Views are viewable by everyone
CREATE POLICY "Views are viewable by everyone"
ON public.profile_views
FOR SELECT
USING (true);

-- Users can insert their own views
CREATE POLICY "Users can insert their own views"
ON public.profile_views
FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Update the increment_view_count function to track unique logged-in users
CREATE OR REPLACE FUNCTION public.increment_view_count(profile_username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_profile_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Only count views from logged-in users
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get profile id
  SELECT id INTO target_profile_id
  FROM public.profiles
  WHERE username = profile_username;
  
  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Try to insert a new view record (will fail if already exists due to UNIQUE constraint)
  BEGIN
    INSERT INTO public.profile_views (profile_id, viewer_id)
    VALUES (target_profile_id, current_user_id);
    
    -- If insert succeeded, increment the counter
    UPDATE public.profiles
    SET view_count = view_count + 1
    WHERE id = target_profile_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- User has already viewed this profile, do nothing
      NULL;
  END;
END;
$$;