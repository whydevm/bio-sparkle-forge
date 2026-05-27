
-- Asset favorites
CREATE TABLE public.asset_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(asset_id, user_id)
);

GRANT SELECT ON public.asset_favorites TO anon;
GRANT SELECT, INSERT, DELETE ON public.asset_favorites TO authenticated;
GRANT ALL ON public.asset_favorites TO service_role;

ALTER TABLE public.asset_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favorites viewable by everyone"
  ON public.asset_favorites FOR SELECT USING (true);

CREATE POLICY "Users can favorite assets"
  ON public.asset_favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfavorite their own"
  ON public.asset_favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_asset_favorites_asset ON public.asset_favorites(asset_id);
CREATE INDEX idx_asset_favorites_user ON public.asset_favorites(user_id);

-- Apple Music link on tracks
ALTER TABLE public.profile_music
  ADD COLUMN apple_music_url text;

-- Flashing title + flexible layout config
ALTER TABLE public.profiles
  ADD COLUMN flashing_title boolean DEFAULT false,
  ADD COLUMN flashing_title_text text,
  ADD COLUMN layout_config jsonb DEFAULT '{}'::jsonb;
