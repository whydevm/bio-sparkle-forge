-- Assets table for sharing avatars, backgrounds, banners, cursors, audio
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('avatar', 'background', 'banner', 'cursor', 'audio')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assets are viewable by everyone" 
ON public.assets 
FOR SELECT 
USING (true);

CREATE POLICY "Users can upload their own assets" 
ON public.assets 
FOR INSERT 
WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can delete their own assets" 
ON public.assets 
FOR DELETE 
USING (auth.uid() = uploader_id);

-- Profile reports table
CREATE TABLE public.profile_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" 
ON public.profile_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" 
ON public.profile_reports 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reports" 
ON public.profile_reports 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Link clicks tracking
CREATE TABLE public.link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.social_links(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country_code TEXT
);

ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create link clicks" 
ON public.link_clicks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Profile owners can view their link clicks" 
ON public.link_clicks 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = link_clicks.profile_id 
  AND profiles.user_id = auth.uid()
));

-- Add banner_url and custom colors to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS badge_colors JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS link_colors JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS entry_animation TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS parallax_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parallax_intensity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS parallax_inverted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audio_sticky BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS click_sounds BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badge_border BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS link_shiny BOOLEAN DEFAULT false;

-- Add custom color to social_links
ALTER TABLE public.social_links
ADD COLUMN IF NOT EXISTS custom_color TEXT;

-- Add country to profile_views
ALTER TABLE public.profile_views
ADD COLUMN IF NOT EXISTS country_code TEXT;