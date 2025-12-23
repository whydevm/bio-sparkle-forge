-- Add storage policies for backgrounds bucket to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to backgrounds"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'backgrounds');

CREATE POLICY "Anyone can view backgrounds"
ON storage.objects
FOR SELECT
USING (bucket_id = 'backgrounds');

CREATE POLICY "Users can update their own backgrounds"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own backgrounds"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create social_cards table for platform integrations
CREATE TABLE IF NOT EXISTS public.social_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  identifier TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  follower_count INTEGER,
  extra_data JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for social_cards
CREATE POLICY "Social cards are viewable by everyone"
ON public.social_cards
FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own social cards"
ON public.social_cards
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = social_cards.profile_id 
  AND profiles.user_id = auth.uid()
));