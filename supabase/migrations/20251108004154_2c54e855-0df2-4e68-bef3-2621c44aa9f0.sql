-- Create profiles table for user bio links
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  avatar_decoration_url text,
  background_type text DEFAULT 'image' CHECK (background_type IN ('image', 'video', 'gif')),
  background_url text,
  profile_opacity integer DEFAULT 100 CHECK (profile_opacity >= 0 AND profile_opacity <= 100),
  profile_blur integer DEFAULT 0 CHECK (profile_blur >= 0 AND profile_blur <= 100),
  border_enabled boolean DEFAULT true,
  custom_cursor text,
  username_effect text CHECK (username_effect IN ('rainbow', 'yellow-red', 'blue-purple', 'pink-orange', 'sparkles', 'typewriter', 'none')),
  glow_username boolean DEFAULT false,
  glow_socials boolean DEFAULT false,
  glow_badges boolean DEFAULT false,
  discord_avatar_enabled boolean DEFAULT false,
  discord_avatar_url text,
  discord_decoration_url text,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create music table for profile music
CREATE TABLE public.profile_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  type text CHECK (type IN ('youtube', 'mp3')),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create social links table
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Music policies
CREATE POLICY "Music is viewable by everyone"
  ON public.profile_music FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own music"
  ON public.profile_music FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_music.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Social links policies
CREATE POLICY "Social links are viewable by everyone"
  ON public.social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own social links"
  ON public.social_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = social_links.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(profile_username text)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET view_count = view_count + 1
  WHERE username = profile_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;