-- Add coding_badges column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN coding_badges text[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.profiles.coding_badges IS 'Array of coding badge identifiers like react, python, typescript etc.';