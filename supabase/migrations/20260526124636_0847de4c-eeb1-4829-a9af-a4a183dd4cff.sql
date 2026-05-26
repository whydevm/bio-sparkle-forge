ALTER TABLE public.profile_music
  ADD COLUMN IF NOT EXISTS artist text,
  ADD COLUMN IF NOT EXISTS lrc text,
  ADD COLUMN IF NOT EXISTS lyrics_source text;