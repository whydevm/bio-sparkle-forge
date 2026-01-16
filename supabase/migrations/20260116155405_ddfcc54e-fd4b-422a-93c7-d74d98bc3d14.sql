-- Add global_radius column for controlling the roundness of all elements
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS global_radius integer DEFAULT 50;

-- Add text_color column for controlling the general text color
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#FFFFFF';