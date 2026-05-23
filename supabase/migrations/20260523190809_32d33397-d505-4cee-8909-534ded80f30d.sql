
CREATE TABLE IF NOT EXISTS public.profile_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('like','dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (profile_id, user_id)
);

ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON public.profile_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reaction"
  ON public.profile_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reaction"
  ON public.profile_likes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reaction"
  ON public.profile_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_profile_likes_profile ON public.profile_likes(profile_id);
