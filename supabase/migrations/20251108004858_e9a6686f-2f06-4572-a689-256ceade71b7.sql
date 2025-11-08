-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('backgrounds', 'backgrounds', true),
  ('music', 'music', true),
  ('cursors', 'cursors', true),
  ('social-icons', 'social-icons', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for backgrounds
CREATE POLICY "Background images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'backgrounds');

CREATE POLICY "Users can upload their own background"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own background"
ON storage.objects FOR UPDATE
USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own background"
ON storage.objects FOR DELETE
USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for music
CREATE POLICY "Music files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

CREATE POLICY "Users can upload their own music"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own music"
ON storage.objects FOR UPDATE
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own music"
ON storage.objects FOR DELETE
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for cursors
CREATE POLICY "Cursor images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'cursors');

CREATE POLICY "Users can upload their own cursor"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cursors' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own cursor"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cursors' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cursor"
ON storage.objects FOR DELETE
USING (bucket_id = 'cursors' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for social icons
CREATE POLICY "Social icon images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-icons');

CREATE POLICY "Users can upload their own social icon"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-icons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own social icon"
ON storage.objects FOR UPDATE
USING (bucket_id = 'social-icons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own social icon"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-icons' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add custom_icon_url to social_links table
ALTER TABLE public.social_links ADD COLUMN custom_icon_url text;