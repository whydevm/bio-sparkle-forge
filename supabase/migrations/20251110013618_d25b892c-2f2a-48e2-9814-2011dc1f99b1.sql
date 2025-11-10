-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text,
  badge_type text NOT NULL CHECK (badge_type IN ('staff', 'premium', 'verified', 'donor', 'gifter', 'image_host', 'domain_legend', 'og', 'server_booster', 'bug_hunter', 'easter_2025', 'christmas_2024', 'million', 'winner', 'second_place', 'third_place', 'helper')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create user_roles table for admin system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage badges"
  ON public.badges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_badges
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can grant badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can revoke badges"
  ON public.user_badges FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "User roles are viewable by admins"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Insert default badges
INSERT INTO public.badges (name, description, badge_type, icon) VALUES
  ('Staff', 'Be a part of the soul.gg staff team.', 'staff', '⭐'),
  ('Helper', 'Be active and help users in the community.', 'helper', '🟠'),
  ('Premium', 'Purchase our Premium package.', 'premium', '💜'),
  ('Verified', 'Unlock to be a known content creator.', 'verified', '✓'),
  ('Donor', 'Donate at least 10€ to guns.lol', 'donor', '🟢'),
  ('Gifter', 'Gift a guns.lol product to another user.', 'gifter', '🟧'),
  ('Image Host', 'Purchase the Image Host.', 'image_host', '🟩'),
  ('Domain Legend', 'Add a public custom domain to guns.lol Image Host.', 'domain_legend', '🟥'),
  ('OG', 'Be an early supporter of guns.lol.', 'og', '🟡'),
  ('Server Booster', 'Boost the guns.lol discord server.', 'server_booster', '🟠'),
  ('Bug Hunter', 'Report bugs to the guns.lol team.', 'bug_hunter', '🟢'),
  ('Easter 2025', 'Exclusive badge from the 2025 easter sale.', 'easter_2025', '🌸'),
  ('Christmas 2024', 'Exclusive badge from the 2024 winter sale.', 'christmas_2024', '🎄'),
  ('The Million', 'Celebration badge for 1M users.', 'million', '💎'),
  ('Winner', 'Win a guns.lol event.', 'winner', '🥇'),
  ('Second Place', 'Get second place in a guns.lol event.', 'second_place', '🥈'),
  ('Third Place', 'Get third place in a guns.lol event.', 'third_place', '🥉')
ON CONFLICT (name) DO NOTHING;