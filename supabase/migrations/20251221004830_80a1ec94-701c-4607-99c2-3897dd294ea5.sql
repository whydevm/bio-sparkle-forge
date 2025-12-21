-- Add color customization columns for bio, about me, and username
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio_color text DEFAULT 'text-muted-foreground';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name_color text DEFAULT 'text-foreground';

-- Add glow badges option
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS glow_badges boolean DEFAULT false;